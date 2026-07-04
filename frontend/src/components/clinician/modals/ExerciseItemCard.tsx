"use client";

import { useState } from "react";

interface ExerciseItemCardProps {
  title: string;
  thumbnailUrl?: string; // image or video preview url
  isFavorite?: boolean;
  onToggleFavorite?: (isFav: boolean) => void;
  onEdit?: () => void;
  onSelect?: (isSelected: boolean) => void;
  selected?: boolean;
}

export default function ExerciseItemCard({
  title,
  thumbnailUrl,
  isFavorite = false,
  onToggleFavorite,
  onEdit,
  onSelect,
  selected = false
}: ExerciseItemCardProps) {
  const [fav, setFav] = useState(isFavorite);
  const [checked, setChecked] = useState(selected);

  const handleFavoriteClick = () => {
    const newVal = !fav;
    setFav(newVal);
    if (onToggleFavorite) onToggleFavorite(newVal);
  };

  const handleSelectToggle = () => {
    const newVal = !checked;
    setChecked(newVal);
    if (onSelect) onSelect(newVal);
  };

  return (
    <div 
      className={`flex flex-col bg-white rounded-2xl p-3 font-['DM_Sans'] transition-all duration-200 border-2 ${
        checked ? "border-[#12606A]" : "border-transparent border-gray-100 text-[#12606A]/20"
      }`}
      style={checked ? { boxShadow: "0 8px 24px 0 rgba(18, 96, 106, 0.4)" } : { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      {/* Top Action Row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1">
          <input 
            type="checkbox" 
            checked={checked}
            onChange={handleSelectToggle}
            className="w-5 h-5 rounded border-gray-300 text-[#12606A] focus:ring-[#12606A] cursor-pointer shadow-sm"
          />
        </div>

        <div className="flex-1 flex justify-center">
          <button 
            onClick={handleFavoriteClick}
            className="p-1.5 bg-gray-50 rounded-full shadow-sm text-yellow-400 hover:scale-110 hover:bg-gray-100 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>

        <div className="flex-1 flex justify-end">
          <button 
            onClick={onEdit}
            className="p-1.5 bg-gray-50 rounded-full shadow-sm text-gray-500 hover:text-[#12606A] hover:scale-110 hover:bg-gray-100 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="w-full aspect-video rounded-xl bg-gray-100 overflow-hidden mb-3 relative flex items-center justify-center">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        )}
      </div>

      {/* Title */}
      <div className="px-1 text-center">
        <h3 className="text-[15px] font-bold text-[#12606A] leading-tight">{title}</h3>
      </div>
    </div>
  );
}