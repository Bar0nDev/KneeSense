"use client";

import { useState } from "react";

interface TemplateItemCardProps {
  title: string;
  subLabel?: string;
  exercises: { name: string; thumbnailUrl?: string }[];
  isFavorite?: boolean;
  onToggleFavorite?: (isFav: boolean) => void;
  onEdit?: () => void;
  onSelect?: (isSelected: boolean) => void;
  selected?: boolean;
}

export default function TemplateItemCard({
  title,
  subLabel,
  exercises,
  isFavorite = false,
  onToggleFavorite,
  onEdit,
  onSelect,
  selected = false
}: TemplateItemCardProps) {
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
      className={`flex flex-col bg-white rounded-2xl p-4 font-['DM_Sans'] transition-all duration-200 border-2 ${
        checked ? "border-[#12606A]" : "border-transparent border-gray-100 text-[#12606A]/20"
      }`}
      style={checked ? { boxShadow: "0 8px 24px 0 rgba(18, 96, 106, 0.4)" } : { boxShadow: "0 3px 5px 0 rgb(158, 158, 158)" }}
    >
      {/* Top Action Row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1">
          <input 
            type="checkbox" 
            checked={checked}
            onChange={handleSelectToggle}
            className="w-5 h-5 rounded border-gray-300 text-[#12606A] focus:ring-[#12606A] cursor-pointer shadow-sm bg-white"
          />
        </div>

        <div className="flex-1 flex justify-center">
          <button 
            onClick={handleFavoriteClick}
            className="p-1.5 bg-gray-50 rounded-full shadow-sm text-yellow-400 hover:scale-110 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>

        <div className="flex-1 flex justify-end">
          <button 
            onClick={onEdit}
            className="p-1.5 bg-gray-50 rounded-full shadow-sm text-gray-500 hover:text-[#12606A] hover:scale-110 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Exercises Image Grid Preview */}
      <div className="bg-[#f0fafa] rounded-xl p-2 flex-1 flex flex-col justify-center mb-3">
        {exercises.length === 0 ? (
          <div className="text-xs text-gray-400 italic text-center p-4">No exercises added yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 aspect-video w-full">
            {exercises.slice(0, 4).map((ex, idx) => (
              <div key={idx} className="bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative w-full h-full">
                {ex.thumbnailUrl ? (
                  <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                )}
                {/* Overlay layer for the 4th item if there are more than 4 exercises */}
                {idx === 3 && exercises.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-white font-bold text-sm">+{exercises.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
            {/* Fill empty spots if less than 4 items */}
            {Array.from({ length: Math.max(0, 4 - exercises.length) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-gray-100 rounded-lg w-full h-full"></div>
            ))}
          </div>
        )}
      </div>

      <div className="px-1 mt-auto">
        <h3 className="text-[16px] font-bold text-[#12606A] leading-tight text-center">{title}</h3>
        {subLabel && <p className="text-[12px] text-gray-500 font-medium mt-0.5 text-center">{subLabel}</p>}
      </div>
    </div>
  );
}