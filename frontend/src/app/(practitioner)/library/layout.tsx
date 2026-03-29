import Topbar from '@/components/clinician/headers/topbar';
import LibSubheader from '@/components/clinician/headers/libSubheader';
import LinkButton from '@/components/clinician/buttons/linkbutton';
import React from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <LibSubheader/>
      <div className='px-1 py-4'>
      {children}
      </div>
    </div>
  );
}