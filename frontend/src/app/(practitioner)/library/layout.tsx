import Topbar from '@/components/clinician/headers/Topbar';
import LibSubheader from '@/components/clinician/headers/LibSubheader';
import LinkButton from '@/components/clinician/buttons/LinkButton';
import React from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className='px-1'>
      {children}
      </div>
    </div>
  );
}