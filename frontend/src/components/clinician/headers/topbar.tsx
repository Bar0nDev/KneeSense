"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LinkButton from '../buttons/linkbutton';
import Avatar from '@/components/ui/avatar';

type TopbarProps = {
  profileImgUrl: string;
  username: string;
  userTitle: string;
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/analytics", matchPrefix: "/analytics" },
  { label: "Patient",   href: "/patients", matchPrefix: "/patients" },
  { label: "Library",   href: "/library/exercises", matchPrefix: "/library" },
];

export default function Topbar({ profileImgUrl, username, userTitle }: TopbarProps) {
  const pathname = usePathname();

  return (
    <div
      className="w-full h-20"
      style={{
        background: 'linear-gradient(90deg, #12606A 0%, #399195 100%)',
        boxShadow: '0 3px 5px 0 rgb(158, 158, 158)',
      }}
    >
      <div className="flex items-end justify-between w-full h-full pl-10">
        <div className="flex items-end gap-15">
          <div className="pb-5">
            <h1 className="text-white text-xl font-bold">KneeSense</h1>
            <p className="text-white text-sm">CLINICAL PORTAL</p>
          </div>
          <div className="flex gap-13">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                <LinkButton
                  label={link.label}
                  href={link.href}
                  variant="topbar"
                  selected={pathname.startsWith(link.matchPrefix)}
                />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center pb-5 pr-10">
          <Avatar
            name={username}
            subtext={userTitle}
            imgUrl={profileImgUrl}
            textColor="white"
            bgColor="#EFF1FE"
            size={40}
            reverse
          />
        </div>
      </div>
    </div>
  );
}