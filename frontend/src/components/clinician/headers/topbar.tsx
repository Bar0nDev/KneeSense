"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LinkButton from '../buttons/linkbutton';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';

type TopbarProps = {
  username: string;
  userTitle: string;
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/analytics", matchPrefix: "/analytics" },
  { label: "Patient",   href: "/patients", matchPrefix: "/patients" },
  { label: "Library",   href: "/library/exercises", matchPrefix: "/library" },
];
export default function Topbar({username, userTitle }: TopbarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header
      className="w-full h-20 flex items-center px-6 md:px-10 sticky top-0 z-50"
      style={{
        background: 'linear-gradient(90deg, #12606A 0%, #399195 100%)',
        boxShadow: '0 3px 5px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto h-full">
        
        {/* Left Side: Logo + Nav */}
        <div className="flex items-center gap-8 md:gap-12 h-full">
          {/* Logo Section */}
          <div className="flex flex-col justify-center">
            <h1 className="text-white text-xl font-bold leading-tight">KneeSense</h1>
            <p className="text-white/80 text-[10px] tracking-widest uppercase">Clinical Portal</p>
          </div>

          {/* Nav Links - Pushed to the bottom */}
          <nav className="hidden md:flex items-end gap-4 lg:gap-8 h-full">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="no-underline h-full flex items-end pb-0" // Ensures link area covers full height
              >
                <LinkButton
                  label={link.label}
                  href={link.href}
                  variant="topbar"
                  selected={pathname.startsWith(link.matchPrefix)}
                />
              </Link>
            ))}
          </nav>
        </div>



        {/* Right Side: Avatar - Remains centered */}
        <div className="flex items-center gap-3">

          <button onClick={logout} className="text-xs text-white/80 border border-white/30 rounded px-2 py-1 hover:bg-white/10">Logout</button>
          <div className="flex flex-col items-end justify-center">
            <span className="text-sm font-semibold text-white leading-tight">{username}</span>
            <span className="text-xs text-white/80 leading-tight">{userTitle}</span>
          </div>
          <Avatar
            name={username}
            size={40}
          />
        </div>
      </div>
    </header>
  );
}