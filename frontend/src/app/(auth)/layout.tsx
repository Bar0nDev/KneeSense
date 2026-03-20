import PatientSideNav from "@/components/patient/PatientSideNav";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex justify-center ">
      <div className="flex w-full min-h-screen ">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}