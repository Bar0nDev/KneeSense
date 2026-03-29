"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LinkButton from "../buttons/linkbutton";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface LibSubheaderProps {
  onAddClick?: () => void;
  addButtonLabel?: string;
}

const LibSubheader = ({ onAddClick, addButtonLabel = "Add" }: LibSubheaderProps) => {
  const pathname = usePathname();

  return (

    <div className="w-full h-12 bg-white flex justify-between items-center pr-6" style={{ borderTop: "1px solid #2F848A", borderBottom: "1px solid #2F848A" }}>
      <div className="flex gap-4 pl-4 h-full items-center">
        <Link href="/library/exercises" style={{ textDecoration: "none", marginLeft: "8px"  }}>
          <LinkButton label="Exercises" href="/library/exercises" variant="subheader" selected={pathname === "/library/exercises" } />
        </Link>
        <Link href="/library/templates" style={{ textDecoration: "none" }}>
          <LinkButton label="Templates" href="/library/templates" variant="subheader" selected={pathname === "/library/templates"} />
        </Link>
      </div>
      
      {onAddClick && (
        <PrimaryButton onClick={onAddClick} size="sm" variant="filled" color="#12606A">
          + {addButtonLabel}
        </PrimaryButton>
      )}
    </div>
  )
}

export default LibSubheader;