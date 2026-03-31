"use client";

import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { HiOutlineSearch } from "react-icons/hi";

import { useInbox } from "@/hooks/useInbox";
import InboxSearch from "@/components/patient/inbox/InboxSearch";
import InboxFilters from "@/components/patient/inbox/InboxFilters";
import MessageRow from "@/components/patient/inbox/MessageRow";
import InboxPagination from "@/components/patient/inbox/InboxPagination";

const FILTER_OPTIONS = ["All", "Unread", "Read"];

export default function InboxPage() {
  const { 
    messages, 
    unreadCount, 
    search, 
    setSearch, 
    filter, 
    setFilter, 
    page, 
    setPage, 
    totalPages, 
    totalFiltered 
  } = useInbox(7);

  const handleViewMessage = (id: number) => {
    console.log("Opening message:", id);
  };

  const handleNewMessage = () => {
    console.log("Opening compose modal");
  };

  return (
    <div>
      <PageHeader
        title="Inbox"
        subtitle={`${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`}
        action={
          <PrimaryButton 
            color="#12606A" 
            onClick={handleNewMessage}
            className="gap-2"
          >
            <HiOutlinePencilSquare size={18} />
            New Message
          </PrimaryButton>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-5">
        <InboxSearch value={search} onChange={setSearch} />
        <InboxFilters 
          current={filter} 
          options={FILTER_OPTIONS} 
          onChange={setFilter} 
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-10" /><col className="w-[22%]" /><col /><col className="w-24" /><col className="w-20" />
          </colgroup>

          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th />
              <th className="py-3 px-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Sender</th>
              <th className="py-3 px-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Subject & Preview</th>
              <th className="py-3 px-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Received</th>
              <th />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <MessageRow 
                  key={msg.id} 
                  message={msg} 
                  onView={handleViewMessage} 
                />
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                      <HiOutlineSearch size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No messages found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <InboxPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalFiltered}
          itemsPerPage={7}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}