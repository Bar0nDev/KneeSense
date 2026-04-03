
import Neuromuscular from '@/components/charts/NeuromuscularRom';
import Tricopartmental from '@/components/charts/TricopartmentalChart';
import Compliance from '@/components/charts/UserCompliance';
import Alert from '@/components/alert/AlertTable';

export default function Page() {
  return (
      <main className="h-screen px-3 py-8 flex flex-col" style={{ backgroundColor: '#EFF1FE' }}>
        <div className="flex items-center justify-between px-8 pt-1 pb-1 flex-shrink-0">
          <h1 className="text-2xl font-bold text-[#12606A]">Current Analytics of your Clinic</h1>
          <p className="text-xl font-semibold text-[#12606A] opacity-50">Week of March 2–6, 2026</p>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-3 p-4 flex-1 min-h-0">
          <Compliance />
          <Tricopartmental />
          <Alert/>
          <Neuromuscular />
        </div>
      </main>
  );
}