import Topbar from '@/components/clinician/headers/topbar';
import LibSubheader from '@/components/clinician/headers/libSubheader';
import LinkButton from '@/components/clinician/buttons/linkbutton';

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Topbar
          profileImgUrl="/images/profile.jpg"
          username="Dr. Smith"
          userTitle="Clinician"
        />
        <LibSubheader />
      </div>

      <div className="h-32 flex-shrink-0" />

      <main className="flex-1" style={{ backgroundColor: '#EFF1FE' }}>
        
      </main>
    </div>
  );
}