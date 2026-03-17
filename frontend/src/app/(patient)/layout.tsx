import PatientSideNav from "@/components/patient/PatientSideNav";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex justify-center ">
      <div className="flex w-full max-w-screen-xl min-h-screen ">
        <PatientSideNav />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}