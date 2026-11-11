import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  return <CapabilityCard<{ title: string; reason: string }> title="Workout suggestions" description="Recommend workouts from activity patterns." path="/api/workouts/suggestions/mona%40example.com" dataKey="suggestions" emptyText="No workout suggestions." >{(workouts) => <ul>{workouts.map((workout) => <li key={workout.title}><strong>{workout.title}</strong>: {workout.reason}</li>)}</ul>}</CapabilityCard>;
}
