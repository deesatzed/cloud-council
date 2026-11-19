import roster from "../seed/mentor_roster.json";
import SkyPlayground from "@/components/SkyPlayground";

// The four mentors in the first export (see PROGRESS.md). Names and years come from the roster.
const FIRST_EXPORT = ["marcus-aurelius", "benjamin-franklin", "henry-david-thoreau", "florence-nightingale"];

export default function Home() {
  const mentors = FIRST_EXPORT.map((id) => roster.mentors.find((m) => m.id === id))
    .filter((m): m is (typeof roster.mentors)[number] => Boolean(m))
    .map((m) => ({ id: m.id, name: m.name, years: m.years }));

  return (
    <main>
      <h1>Cloud Council</h1>
      <p className="lede">Sky preview. The debate itself is not built yet.</p>
      <SkyPlayground mentors={mentors} />
    </main>
  );
}
