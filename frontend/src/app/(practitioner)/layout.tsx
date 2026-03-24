"use client";

export default function PractitionerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen flex justify-center">
        <div className="flex w-full max-w-screen-xl min-h-screen">
          <main>
            {children}
          </main>          
        </div>
      </div>
  );
}