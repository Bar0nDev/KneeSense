"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import PrimaryButton from "@/components/clinician/buttons/PrimaryButton";
import { libraryService, Exercise } from "@/services/libraryService";

interface AddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  onDelete?: () => void;
  initialData?: any;
  practitionerId?: number;
}

type TemplateExercise = {
  id: string;
  exercise_id: number;
  name: string;
  thumbnailUrl?: string;
  sets: number;
  reps: number;
};

export default function AddTemplateModal({ isOpen, onClose, onSave, onDelete, initialData, practitionerId }: AddTemplateModalProps) {
  const { data: availableExercises = [] } = useQuery<Exercise[]>({
    queryKey: queryKeys.exercises(practitionerId),
    queryFn: () => libraryService.getExercises(practitionerId!),
    enabled: isOpen && !!practitionerId,
  });
  const [templateName, setTemplateName] = useState(initialData?.title || "");
  const [subLabel, setSubLabel] = useState(initialData?.subLabel || "");
  const [exercises, setExercises] = useState<TemplateExercise[]>(initialData?.exercises || []);
  
  // State for the "add exercise" dropdown
  const [selectedExId, setSelectedExId] = useState("");

  if (!isOpen) return null;

  const handleAddExercise = () => {
    if (!selectedExId) return;
    const ex = availableExercises.find(e => String(e.id) === selectedExId);
    if (!ex) return;

    const newItem: TemplateExercise = {
      id: `${ex.id}-${Date.now()}`,
      exercise_id: ex.id,
      name: ex.name,
      thumbnailUrl: ex.media_url ?? undefined,
      sets: ex.default_sets,
      reps: ex.default_reps,
    };

    setExercises([...exercises, newItem]);
    setSelectedExId("");
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleUpdateProp = (id: string, field: "sets" | "reps", value: string) => {
    const num = parseInt(value, 10) || 0;
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: num } : ex));
  };

  const performSave = () => {
    if (!templateName) {
      alert("Template name is required");
      return;
    }
    if (onSave) {
      onSave({
        name: templateName,
        sub_label: subLabel,
        exercises: exercises.map((ex) => ({
          exercise_id: ex.exercise_id,
          sets_override: ex.sets,
          reps_override: ex.reps,
        })),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[100%] overflow-hidden text-[#12606A] font-['DM_Sans']">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 flex-shrink-0 bg-white z-10 w-full">
          <h2 className="text-xl md:text-2xl font-bold text-[#12606A]">
            {initialData ? "Edit Template" : "Add Template"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto min-h-0 space-y-6 flex-1">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Template Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Phase 1 Post-Op"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#12606A]/20 focus:border-[#12606A] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Sublabel / Description</label>
              <input 
                type="text" 
                value={subLabel}
                onChange={(e) => setSubLabel(e.target.value)}
                placeholder="e.g. Weeks 1-2 Recovery"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#12606A]/20 focus:border-[#12606A] transition-all"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Exercises Section */}
          <div>
            <h3 className="text-lg font-bold text-[#12606A] mb-3">Exercises in Template</h3>
            
            {/* Add Exercise Controller */}
            <div className="flex gap-2 mb-4">
              <select 
                value={selectedExId}
                onChange={(e) => setSelectedExId(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#12606A]/20 focus:border-[#12606A]"
              >
                <option value="" disabled>-- Select an exercise from Library --</option>
                {availableExercises.length === 0 && (
                  <option disabled>No exercises in library yet</option>
                )}
                {availableExercises.map(ex => (
                  <option key={ex.id} value={String(ex.id)}>{ex.name}</option>
                ))}
              </select>
              <PrimaryButton onClick={handleAddExercise} disabled={!selectedExId} className="whitespace-nowrap">
                Add to List
              </PrimaryButton>
            </div>

            {/* List of Exercises */}
            <div className="space-y-3">
              {exercises.length === 0 ? (
                <div className="p-8 text-center bg-[#f0fafa] rounded-xl border border-dashed border-[#12606A]/20 text-gray-500 text-sm">
                  No exercises added to this template yet. Select an exercise above to get started.
                </div>
              ) : (
                exercises.map((ex, idx) => (
                  <div key={ex.id || `temp-key-${idx}`} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-[#12606A]/30 transition-colors">
                    
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#12606A]/10 text-[#12606A] font-bold text-xs flex-shrink-0">
                      {idx + 1}
                    </div>

                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {ex.thumbnailUrl ? (
                        <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold text-[15px] truncate">{ex.name}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Sets:</label>
                        <input 
                          type="number" min="1" 
                          value={ex.sets}
                          onChange={(e) => handleUpdateProp(ex.id, "sets", e.target.value)}
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#12606A]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Reps:</label>
                        <input 
                          type="number" min="1" 
                          value={ex.reps}
                          onChange={(e) => handleUpdateProp(ex.id, "reps", e.target.value)}
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#12606A]"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to remove this exercise from the template?")) {
                            handleRemoveExercise(ex.id);
                          }
                        }}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                        title="Remove Exercise"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between items-center flex-shrink-0 bg-gray-50 z-10 w-full">
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
          <div className="flex gap-3">
            <PrimaryButton variant="cancel" onClick={onClose}>
              Cancel
            </PrimaryButton>
            <PrimaryButton variant="add" onClick={performSave}>
              {initialData ? "Save Changes" : "Save Template"}
            </PrimaryButton>
          </div>
        </div>

      </div>
    </div>
  );
}