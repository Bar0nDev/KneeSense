"use client";

import React from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Message } from "@/hooks/useInbox";

interface MessageRowProps {
  message: Message;
  onView: (id: number) => void;
}

export default function MessageRow({ message, onView }: MessageRowProps) {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(message.id);
  };

  return (
    <tr
      onClick={() => onView(message.id)}
      className={`transition-colors hover:bg-[#F4F7F7] cursor-pointer ${
        !message.read ? 'bg-[#F0FAFA]/30' : 'bg-white'
      }`}
    >
      {/* Unread Indicator */}
      <td className="py-5 pl-6 pr-0 text-center">
        {!message.read && <div className="h-2 w-2 rounded-full bg-[#30C3B1] mx-auto" />}
      </td>

      {/* Sender Info */}
      <td className="py-5 px-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-[#12606A]/10 text-[#12606A] flex items-center justify-center text-xs font-bold shrink-0">
            {message.initials}
          </div>
          <div className="overflow-hidden">
            <p className={`text-sm truncate ${!message.read ? 'font-bold text-[#1C2121]' : 'font-medium text-gray-600'}`}>
              {message.from}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">
              {message.role}
            </p>
          </div>
        </div>
      </td>

      {/* Content Preview */}
      <td className="py-5 px-3">
        <p className={`text-sm truncate ${!message.read ? 'font-bold text-[#1C2121]' : 'text-gray-600'}`}>
          {message.subject}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5 max-w-md">{message.preview}</p>
      </td>

      {/* Timestamp */}
      <td className="py-5 px-2">
        <p className="text-xs text-gray-400 font-medium whitespace-nowrap">{message.time}</p>
      </td>

      {/* Action PrimaryButton */}
      <td className="flex items-center justify-end py-5 px-4">
        <div className="flex justify-end">
          <PrimaryButton
            color="#12606A"
            textColor="#12606A"
            variant="outline"
            size="sm"
            className="px-4"
            onClick={handleButtonClick}
          >
            View
          </PrimaryButton>
        </div>
      </td>
    </tr>
  );
}