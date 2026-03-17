import PageHeader from "@/components/ui/PageHeader";

// Mock data — replace with real data later
const mockRehab = {
  programName: "4-step Anti-frailty",
  lastLog: "Mar 20, 2026",
};

export default function RehabilitationPage() {
  return (
    <div>
      <PageHeader
        title="Rehabilitation"
        subtitle={`${mockRehab.programName} · Last log: ${mockRehab.lastLog}`}
      />
    </div>
  );
}