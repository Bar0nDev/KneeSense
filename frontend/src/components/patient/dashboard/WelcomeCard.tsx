import Image from "next/image";
import Button from "@/components/ui/Button";

interface WelcomeCardProps {
  name: string;
  lastSession: string;
  className?: string;
}

export default function WelcomeCard({ name, lastSession, className = "" }: WelcomeCardProps) {
  return (
    <div className={`relative bg-[#12606A] rounded-2xl px-8 py-7 flex flex-col overflow-hidden ${className}`}>
      
      {/* Text Content */}
      <div className="z-10 flex flex-col flex-1">
        <h2 className="text-white text-2xl font-bold mb-1">
          Welcome, {name}!
        </h2>
        <p className="text-white/80 text-sm mb-6">
          Your last recorded session was on {lastSession}.
        </p>
        <div className="mt-auto">
          <Button bgColor="bg-[#FDFDFD]" textColor="text-[#1F7078]" hoverColor="hover:bg-[#f0f0f0]">
            View Progress
          </Button>
        </div>
      </div>

      {/* Illustration */}
      <div className="hidden sm:block absolute right-0 top-0 h-full w-64">
        <Image
          src="/assets/dashboardgraphics.png"
          alt="Doctor and patient illustration"
          fill
          className="object-contain object-right-bottom"
          priority
        />
      </div>

    </div>
  );
}