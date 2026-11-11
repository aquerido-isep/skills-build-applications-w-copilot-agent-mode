import { CapabilityCard } from './CapabilityCard.js';
export default function Teams() {
  return <CapabilityCard<{ name: string; members: string[] }> title="Teams" description="Manage teams and members." path="/api/teams" dataKey="teams" emptyText="No teams." >{(teams) => <ul>{teams.map((team) => <li key={team.name}>{team.name} ({team.members.length} members)</li>)}</ul>}</CapabilityCard>;
}
