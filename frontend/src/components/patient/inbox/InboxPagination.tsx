"use client";

import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface InboxPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function InboxPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: InboxPaginationProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 bg-gray-50/30 flex items-center justify-between border-t border-gray-100">
      <p className="text-xs text-gray-400 font-medium">
        Showing <span className="text-gray-700">{start}</span> to <span className="text-gray-700">{end}</span> of {totalItems}
      </p>
      <div className="flex gap-2">
        <PrimaryButton 
          variant="outline" color="#9CA3AF" textColor="#455858" size="sm" 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
        >
          <HiChevronLeft size={18} />
        </PrimaryButton>
        <PrimaryButton 
          variant="outline" color="#9CA3AF" textColor="#455858" size="sm" 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)}
        >
          <HiChevronRight size={18} />
        </PrimaryButton>
      </div>
    </div>
  );
}