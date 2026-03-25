import PatientSideNav from "@/components/patient/PatientSideNav";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex justify-center bg-[#F1F5F8]">
      <div className="flex w-full max-w-screen-xl min-h-screen ">
        <PatientSideNav />
        <main className="flex-1 p-6 border border-l-[1px] border-gray-200 border-r-[1px]">
          {children}
        </main>
      </div>
    </div>
  );
}