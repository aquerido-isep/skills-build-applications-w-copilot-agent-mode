import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

type ActivityInput = { userId?: unknown; teamId?: unknown; type?: unknown; minutes?: unknown };
type TeamInput = { name?: unknown; mascot?: unknown; members?: unknown };

function clientError(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

function objectId(value: unknown, field: string) {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) throw clientError(`${field} must be a valid ID`);
  return new mongoose.Types.ObjectId(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: ActivityInput) {
  const user = objectId(input?.userId, 'userId');
  const team = objectId(input?.teamId, 'teamId');
  if (typeof input.type !== 'string' || !input.type.trim()) throw clientError('type is required');
  if (typeof input.minutes !== 'number' || !Number.isFinite(input.minutes) || input.minutes <= 0) throw clientError('minutes must be positive');
  if (!(await User.exists({ _id: user })) || !(await Team.exists({ _id: team }))) throw clientError('userId and teamId must reference existing records');
  return Activity.create({ user, team, type: input.type.trim(), minutes: input.minutes, points: input.minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: TeamInput) {
  if (typeof input?.name !== 'string' || !input.name.trim()) throw clientError('name is required');
  if (typeof input?.mascot !== 'string' || !input.mascot.trim()) throw clientError('mascot is required');
  if (input.members !== undefined && !Array.isArray(input.members)) throw clientError('members must be an array');
  const members = (input.members ?? []).map((member) => objectId(member, 'member'));
  return Team.create({ name: input.name.trim(), mascot: input.mascot.trim(), members });
}

export async function getLeaderboard() {
  const results = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
  ]);
  return results.map((entry, index) => ({ teamName: (entry as typeof entry & { team: { name: string } }).team.name, totalPoints: entry.totalPoints, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  const recent = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focus = user.fitnessGoal || recent?.type;
  const workouts = await Workout.find(focus ? { focus } : {}).lean();
  const fallback = workouts.length ? workouts : await Workout.find().lean();
  return fallback.map((workout) => ({
    ...workout,
    reason: recent ? `Matches your ${recent.type} activity and ${focus} focus.` : `Matches your ${focus} fitness goal.`,
  }));
}

export { User };
