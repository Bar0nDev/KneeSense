"use client";

import { useState } from "react";
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
  const [showSettings, setShowSettings] = useState(false);
  const [minReps, setMinReps] = useState(initRepsMin || 8);
  const [maxReps, setMaxReps] = useState(initRepsMax || 12);

  // File states (mocking uploads)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initialData?.thumbnailUrl || null);
  
  const [patientFeatured, setPatientFeatured] = useState(initialData?.patientFeatured || false);

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
      imageFile,
      videoFile,
      thumbnailUrl: existingImageUrl
    };
    if (onSave) onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[90vh] p-6 text-[#12606A] font-['DM_Sans']">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#12606A]">
            {initialData ? "Edit Exercise" : "Add Exercise"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Media Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Upload */}
            <div className="border-2 border-dashed border-[#12606A]/30 rounded-xl p-6 flex flex-col items-center justify-center bg-[#f0fafa] relative">
              {imageFile || existingImageUrl ? (
                <div className="flex flex-col items-center">
                  {existingImageUrl && !imageFile && (
                    <img src={existingImageUrl} alt="Current" className="w-16 h-16 object-cover rounded mb-2" />
                  )}
                  {imageFile && <span className="text-sm font-medium mb-2">{imageFile.name}</span>}
                  <div className="flex gap-2">
                    <button onClick={() => { setImageFile(null); setExistingImageUrl(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
                    <label className="text-xs text-[#12606A] font-bold cursor-pointer hover:underline">
                      Edit
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#12606A" strokeWidth="1.5" className="mb-2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <label className="text-sm font-bold text-[#12606A] cursor-pointer hover:underline">
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Thumbnail for the exercise</p>
                </>
              )}
            </div>

            {/* Video Upload */}
            <div className="border-2 border-dashed border-[#12606A]/30 rounded-xl p-6 flex flex-col items-center justify-center bg-[#f0fafa] relative">
              {videoFile ? (
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium mb-2">{videoFile.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setVideoFile(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                    <label className="text-xs text-[#12606A] font-bold cursor-pointer hover:underline">
                      Edit
                      <input type="file" accept="image/gif" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#12606A" strokeWidth="1.5" className="mb-2">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                  <label className="text-sm font-bold text-[#12606A] cursor-pointer hover:underline">
                    Upload GIF
                    <input type="file" accept="image/gif" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Instruction steps GIF</p>
                </>
              )}
            </div>
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
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
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