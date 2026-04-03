"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LinkButton from '../buttons/LinkButton';
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
     <div className="flex items-center justify-between w-full h-full px-4 md:px-8 lg:px-1">

  {/* Left Side */}
  <div className="flex items-center gap-6 lg:gap-12 h-full">
    <div className="flex flex-col justify-center shrink-0">
      <h1 className="text-white text-xl font-bold leading-tight">KneeSense</h1>
      <p className="text-white/80 text-[10px] tracking-widest uppercase">Clinical Portal</p>
    </div>

    {/* Nav Links */}
    <nav className="hidden md:flex items-end gap-2 lg:gap-6 h-full">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="no-underline h-full flex items-end pb-0"
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

  {/* Right Side */}
  <div className="flex items-center gap-4 shrink-0">
    <button
      onClick={logout}
      className="text-[10px] uppercase tracking-wider text-white/60 border border-white/20 rounded px-2 py-1 hover:bg-white/10 transition-colors"
    >
      Logout
    </button>
    <div className="flex flex-col items-end hidden sm:flex">
      <span className="text-sm font-semibold text-white whitespace-nowrap">{username}</span>
      <span className="text-xs text-white/70 whitespace-nowrap">{userTitle}</span>
    </div>
    <Avatar name={username} size={40} />
  </div>
</div>
    </header>
  );
}
