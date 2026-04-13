"use client";

import { useState, useEffect } from "react";
import PrimaryButton from "@/components/clinician/buttons/PrimaryButton";
import { FiSettings } from "react-icons/fi";

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  onDelete?: () => void;
  initialData?: any; // Differentiates Add vs Edit
}

export default function AddExerciseModal({ isOpen, onClose, onSave, onDelete, initialData }: AddExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState(initialData?.title || "");
  const [instructions, setInstructions] = useState(initialData?.instructions || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Beginner");
  
  // Customise Reps/Sets
  const initRepsMin = initialData?.reps?.min;
  const initRepsMax = initialData?.reps?.max;
  const isCustomReps = initRepsMin !== undefined;

  const [sets, setSets] = useState(initialData?.sets || 3);
  const [defaultReps, setDefaultReps] = useState(isCustomReps ? 10 : (initialData?.reps?.default || 10));
  const [customizeReps, setCustomizeReps] = useState(isCustomReps);
  const [minReps, setMinReps] = useState(initRepsMin || 8);
  const [maxReps, setMaxReps] = useState(initRepsMax || 12);

  // Unified Media States
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  // Support either mediaUrl or thumbnailUrl from older data shapes
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(initialData?.mediaUrl || initialData?.thumbnailUrl || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingMediaUrl);
  
  const [patientFeatured, setPatientFeatured] = useState(initialData?.patientFeatured || false);

  // Automatically generate a preview URL when a new file is selected
  useEffect(() => {
    if (mediaFile) {
      const objectUrl = URL.createObjectURL(mediaFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); // Clean up memory
    } else {
      setPreviewUrl(existingMediaUrl);
    }
  }, [mediaFile, existingMediaUrl]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!exerciseName) {
      alert("Exercise name is required.");
      return;
    }
    const payload = {
      id: initialData?.id,
      title: exerciseName,
      instructions,
      difficulty,
      sets,
      reps: customizeReps ? { min: minReps, max: maxReps } : { default: defaultReps },
      patientFeatured,
      mediaFile,             // Send the unified file
      mediaUrl: existingMediaUrl // Send existing URL if no new file
    };
    if (onSave) onSave(payload);
    onClose();
  };

  // Helper function to check if the current preview is a video
  const isVideo = (fileOrUrl: File | string | null) => {
    if (!fileOrUrl) return false;
    if (fileOrUrl instanceof File) {
      return fileOrUrl.type.startsWith("video/");
    }
    return fileOrUrl.match(/\.(mp4|webm|ogg)$/i) !== null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[100%] overflow-hidden text-[#12606A] font-['DM_Sans']">
        
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 flex-shrink-0 bg-white z-10 w-full mb-0">
          <h2 className="text-xl md:text-2xl font-bold text-[#12606A]">
            {initialData ? "Edit Exercise" : "Add Exercise"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto min-h-0 space-y-6 flex-1">
          
          {/* Unified Media Upload */}
          <div className="border-2 border-dashed border-[#12606A]/30 rounded-xl p-6 flex flex-col items-center justify-center bg-[#f0fafa] relative w-full h-56">
            {previewUrl ? (
              <div className="flex flex-col items-center justify-center w-full h-full relative group">
                {/* Media Preview */}
                <div className="w-full h-32 flex justify-center mb-3 rounded-lg overflow-hidden">
                  {isVideo(mediaFile || previewUrl) ? (
                    <video 
                      src={previewUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="h-full object-contain" 
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Exercise Preview" 
                      className="h-full object-contain" 
                    />
                  )}
                </div>
                
                {mediaFile && <span className="text-sm font-medium mb-2 truncate max-w-xs">{mediaFile.name}</span>}
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setMediaFile(null); setExistingMediaUrl(null); }} 
                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                  >
                    Remove File
                  </button>
                  <label className="text-xs font-semibold text-[#12606A] cursor-pointer hover:underline transition">
                    Change File
                    {/* Accepts images, gifs, and standard web video formats */}
                    <input 
                      type="file" 
                      accept="image/*, video/mp4, video/webm" 
                      className="hidden" 
                      onChange={(e) => setMediaFile(e.target.files?.[0] || null)} 
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#12606A" strokeWidth="1.5" className="mb-3">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <label className="text-sm font-bold text-[#12606A] cursor-pointer hover:underline text-lg">
                  Upload Image, GIF, or Video
                  <input 
                    type="file" 
                    accept="image/*, video/mp4, video/webm" 
                    className="hidden" 
                    onChange={(e) => setMediaFile(e.target.files?.[0] || null)} 
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2 max-w-xs">
                  Supported formats: PNG, JPG, GIF, MP4, WebM. Ideal ratio is 1:1 or 16:9.
                </p>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded text-[#12606A] focus:ring-[#12606A] border-gray-300"
              checked={patientFeatured}
              onChange={(e) => setPatientFeatured(e.target.checked)}
            />
            <span className="text-sm font-medium">A patient is featured in this exercise</span>
          </label>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Exercise Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. Quad Sets"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#12606A]/20 focus:border-[#12606A] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Instructions (Optional)</label>
              <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Step 1: ..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#12606A]/20 focus:border-[#12606A] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Difficulty</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#12606A]/20 focus:border-[#12606A] transition-all bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Sets and Reps */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Prescription Defaults</h3>
            
            <div className="flex gap-4 items-end">
              <div className="w-1/3">
                <label className="block text-sm font-semibold mb-1">Sets</label>
                <input 
                  type="number" min="1" 
                  value={sets} onChange={(e) => setSets(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#12606A]"
                />
              </div>

              {!customizeReps ? (
                <div className="w-1/3">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-semibold">Reps</label>
                    <button 
                      onClick={() => setCustomizeReps(true)}
                      className="p-1 text-gray-400 hover:text-[#12606A] transition-colors"
                      title="Set Min/Max Range"
                    >
                      <FiSettings size={14} />
                    </button>
                  </div>
                  <input 
                    type="number" min="1" 
                    value={defaultReps} onChange={(e) => setDefaultReps(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#12606A]"
                  />
                </div>
              ) : (
                <>
                  <div className="w-1/3">
                    <label className="block text-sm font-semibold mb-1 " title="Min Reps">Min</label>
                    <input 
                      type="number" min="1" 
                      value={minReps} onChange={(e) => setMinReps(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#12606A]"
                    />
                  </div>
                  <div className="w-1/3">
                    <div className="flex items-center gap-2 mb-1">
                      <label className="block text-sm font-semibold" title="Max Reps">Max</label>
                      <button 
                        onClick={() => setCustomizeReps(false)}
                        className="p-1 text-gray-400 hover:text-[#12606A] transition-colors"
                        title="Revert to fixed Reps"
                      >
                        <FiSettings size={14} />
                      </button>
                    </div>
                    <input 
                      type="number" min="1" 
                      value={maxReps} onChange={(e) => setMaxReps(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#12606A]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center p-4 md:p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50 z-10 w-full">
          <div>
            {onDelete && (
              <button 
                onClick={onDelete}
                className="text-red-500 hover:text-red-700 text-sm font-semibold underline decoration-transparent hover:decoration-red-700 transition"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <PrimaryButton variant="cancel" onClick={onClose}>
              Cancel
            </PrimaryButton>
            <PrimaryButton variant="add" onClick={handleSave}>
              {initialData ? "Save Changes" : "Add Exercise"}
            </PrimaryButton>
          </div>
        </div>

      </div>
    </div>
  );
}