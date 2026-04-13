"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PrimaryButton from "@/components/clinician/buttons/PrimaryButton";
import Dropdown from "@/components/ui/Dropdown";
import { FiSettings } from "react-icons/fi";
import { libraryService, Template } from "@/services/libraryService";
import { patientService } from "@/services/patientService";

type ExerciseRow = {
  id: number;
  name: string;
  sets: number;
  reps: number;
  mediaUrl: string | null;
  isMinMax: boolean;
  minReps: number;
  maxReps: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  practitionerId: number | null;
  existingTemplateId?: number | null;
};

export default function EditProgramModal({ isOpen, onClose, patientId, practitionerId, existingTemplateId }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [frequency, setFrequency] = useState(3);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["templates", practitionerId],
    queryFn: () => libraryService.getTemplates(practitionerId!),
    enabled: !!practitionerId && isOpen,
  });

  useEffect(() => {
    if (existingTemplateId) {
      setSelectedTemplateId(String(existingTemplateId));
    }
  }, [existingTemplateId, isOpen]);

  useEffect(() => {
    if (!selectedTemplateId) {
      setExercises([]);
      return;
    }
    const template = templates.find(t => String(t.id) === selectedTemplateId);
    if (!template) return;
    setExercises(template.exercises.map(te => {
      const baseReps = te.reps_override ?? te.default_reps ?? 10;
      return {
        id: te.id,
        name: te.name || "Unknown Exercise",
        sets: te.sets_override ?? te.default_sets ?? 3,
        reps: baseReps,
        mediaUrl: te.media_url,
        isMinMax: false,
        minReps: Math.max(1, baseReps - 2),
        maxReps: baseReps + 2,
      };
    }));
  }, [selectedTemplateId, templates]);

  if (!isOpen) return null;

  const templateOptions = templates.map(t => ({ key: String(t.id), label: t.name }));

  const toggleMinMax = (id: number) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, isMinMax: !ex.isMinMax } : ex));
  };

  const updateExercise = (id: number, fields: Partial<ExerciseRow>) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...fields } : ex));
  };

  async function handleSave() {
    if (!selectedTemplateId) return;
    setIsSaving(true);
    try {
      await patientService.assignProgram(patientId, {
        template_id: Number(selectedTemplateId),
        frequency,
        duration_weeks: durationWeeks,
        start_date: startDate,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save program", err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[100%] overflow-hidden relative">

        {/* Header */}
        <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-100 bg-white z-10 w-full relative flex justify-center mb-0">
          <h2 className="text-[24px] md:text-[28px] font-extrabold text-center text-[#12606A] tracking-tight">
            {existingTemplateId ? "Edit Program" : "Add Program"}
          </h2>
        </div>
        <div className="h-1 w-full bg-[#12606A]"></div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
          {/* Template Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900">Configure Exercises</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Template:</span>
            <Dropdown
              options={templateOptions}
              selectedKey={selectedTemplateId}
              onSelect={setSelectedTemplateId}
              placeholder="Select a template"
              width="220px"
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex flex-col bg-[#F9FAFB] border border-gray-200 rounded-xl overflow-visible mb-8 min-h-[80px]">
          {exercises.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-sm text-gray-400">
              {selectedTemplateId ? "No exercises in this template." : "Select a template to load exercises."}
            </div>
          ) : (
            exercises.map((ex, index) => (
              <React.Fragment key={ex.id}>
                <div className="flex flex-col p-4 bg-white relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        {ex.mediaUrl
                          ? <img src={ex.mediaUrl} alt={ex.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gray-200" />
                        }
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg w-40 md:w-auto truncate">{ex.name}</h4>
                    </div>

                    <div className="flex items-center gap-4 relative">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400">Sets</span>
                          <input
                            type="number"
                            value={ex.sets ?? 0}
                            onChange={e => updateExercise(ex.id, { sets: e.target.valueAsNumber || 0 })}
                            className="w-14 h-10 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-lg text-[#12606A] outline-none focus:border-[#12606A] focus:ring-1 focus:ring-[#12606A]"
                          />
                        </div>
                        <span className="text-xl text-gray-400 mt-4">×</span>
                        {ex.isMinMax ? (
                          <div className="flex items-center gap-1">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-gray-400">Min</span>
                              <input
                                type="number"
                                value={ex.minReps ?? 0}
                                onChange={e => updateExercise(ex.id, { minReps: e.target.valueAsNumber || 0 })}
                                className="w-14 h-10 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-lg text-[#12606A] outline-none focus:border-[#12606A] focus:ring-1 focus:ring-[#12606A]"
                              />
                            </div>
                            <span className="text-lg text-gray-400 mt-4">-</span>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 justify-between">
                                <span className="text-[10px] uppercase font-bold text-gray-400">Max</span>
                                <button onClick={() => toggleMinMax(ex.id)} className="p-0.5 text-gray-400 hover:text-[#12606A] transition-colors">
                                  <FiSettings size={12} />
                                </button>
                              </div>
                              <input
                                type="number"
                                value={ex.maxReps ?? 0}
                                onChange={e => updateExercise(ex.id, { maxReps: e.target.valueAsNumber || 0 })}
                                className="w-14 h-10 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-lg text-[#12606A] outline-none focus:border-[#12606A] focus:ring-1 focus:ring-[#12606A]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 justify-between">
                              <span className="text-[10px] uppercase font-bold text-gray-400">Reps</span>
                              <button onClick={() => toggleMinMax(ex.id)} className="p-0.5 text-gray-400 hover:text-[#12606A] transition-colors">
                                <FiSettings size={12} />
                              </button>
                            </div>
                            <input
                              type="number"
                              value={ex.reps ?? 0}
                              onChange={e => updateExercise(ex.id, { reps: e.target.valueAsNumber || 0 })}
                              className="w-14 h-10 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-lg text-[#12606A] outline-none focus:border-[#12606A] focus:ring-1 focus:ring-[#12606A]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {index < exercises.length - 1 && (
                  <div className="mx-4 h-px bg-gray-100"></div>
                )}
              </React.Fragment>
            ))
          )}
        </div>

        <div className="w-full h-1 bg-gray-200 rounded-full mb-8"></div>

        {/* Program Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#455858]">Frequency (per week)</label>
            <input
              type="number"
              min="1"
              value={frequency}
              onChange={e => setFrequency(Number(e.target.value))}
              className="w-full rounded-2xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-3.5 text-sm outline-none transition-all text-gray-700 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#455858]">Duration (weeks)</label>
            <input
              type="number"
              min="1"
              value={durationWeeks}
              onChange={e => setDurationWeeks(Number(e.target.value))}
              className="w-full rounded-2xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-3.5 text-sm outline-none transition-all text-gray-700 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#455858]">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-2xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-3.5 text-sm outline-none transition-all text-gray-700 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20"
            />
          </div>
        </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50 z-10 w-full relative">
          <PrimaryButton variant="cancel" onClick={onClose}>
            Cancel
          </PrimaryButton>
          <PrimaryButton
            variant="add"
            onClick={handleSave}
            disabled={!selectedTemplateId || isSaving}
          >
            {isSaving ? "Saving..." : "Save Program"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
