"use client";

import React, { useState } from "react";
import PrimaryButton from "@/components/clinician/buttons/PrimaryButton";
import Dropdown from "@/components/ui/dropDown";
import { FiTrash2, FiSettings } from "react-icons/fi";
import { SelectField, Field } from "@/components/ui/FormFields";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  imgUrl: string;
  showSettings?: boolean;
  isMinMax?: boolean;
  minReps?: number;
  maxReps?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EditProgramModal({ isOpen, onClose }: Props) {
  const [selectedPreset, setSelectedPreset] = useState("anti_frailty");
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "1",
      name: "Dorsi Flexion",
      sets: 3,
      reps: 10,
      imgUrl: "/assets/exercises/dorsi_flexion.png"
    },
    {
      id: "2",
      name: "Plantar Flexion",
      sets: 3,
      reps: 10,
      imgUrl: "/assets/exercises/plantar_flexion.png"
    },
    {
      id: "3",
      name: "Seated Knee Flexion and Extension",
      sets: 2,
      reps: 15,
      imgUrl: "/assets/exercises/seatedknee_flexion_and_extension.png"
    },
    {
      id: "4",
      name: "Squat",
      sets: 3,
      reps: 12,
      imgUrl: "/assets/exercises/squat.png"
    }
  ]);

  if (!isOpen) return null;

  const presets = [
    { key: "anti_frailty", label: "4-step Anti Frailty" },
    { key: "knee_post_op", label: "Post-Op Knee Replacement" },
    { key: "acl_recovery", label: "ACL Rehabilitation" },
    { key: "general_mobility", label: "General Mobility" },
  ];

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const toggleSettings = (id: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, showSettings: !ex.showSettings } : ex));
  };

  const toggleMinMax = (id: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, isMinMax: !ex.isMinMax } : ex));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 my-auto relative">
        
        {/* Header */}
        <h2 className="text-[28px] font-extrabold text-center text-[#12606A] tracking-tight">
          Edit Program
        </h2>
        <div className="h-1 w-full bg-[#12606A] mt-4 mb-8 rounded-full"></div>

        {/* Configure Exercises Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900">Configure Exercises</h3>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Preset:</span>
              <Dropdown 
                options={presets}
                selectedKey={selectedPreset}
                onSelect={setSelectedPreset}
                width="220px"
              />
            </div>
            <PrimaryButton 
              variant="add"
              onClick={() => console.log("Add exercise logic here")}
            >
              Add Exercise
            </PrimaryButton>
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex flex-col bg-[#F9FAFB] border border-gray-200 rounded-xl overflow-visible mb-8">
          {exercises.map((ex, index) => (
            <React.Fragment key={ex.id}>
              <div className="flex flex-col p-4 bg-white relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      <img src={ex.imgUrl} alt={ex.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg w-40 md:w-auto truncate">{ex.name}</h4>
                  </div>

                  <div className="flex items-center gap-4 relative">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Sets</span>
                        <input 
                          type="number" 
                          defaultValue={ex.sets} 
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
                              defaultValue={ex.minReps || ex.reps - 2} 
                              className="w-14 h-10 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-lg text-[#12606A] outline-none focus:border-[#12606A] focus:ring-1 focus:ring-[#12606A]" 
                            />
                          </div>
                          <span className="text-lg text-gray-400 mt-4">-</span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 justify-between">
                              <span className="text-[10px] uppercase font-bold text-gray-400">Max</span>
                              <button 
                                onClick={() => toggleMinMax(ex.id)}
                                className="p-0.5 text-gray-400 hover:text-[#12606A] transition-colors"
                              >
                                <FiSettings size={12} />
                              </button>
                            </div>
                            <input 
                              type="number" 
                              defaultValue={ex.maxReps || ex.reps + 2} 
                              className="w-14 h-10 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-lg text-[#12606A] outline-none focus:border-[#12606A] focus:ring-1 focus:ring-[#12606A]" 
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 justify-between">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Reps</span>
                            <button 
                              onClick={() => toggleMinMax(ex.id)}
                              className="p-0.5 text-gray-400 hover:text-[#12606A] transition-colors"
                            >
                              <FiSettings size={12} />
                            </button>
                          </div>
                          <input 
                            type="number" 
                            defaultValue={ex.reps} 
                            className="w-14 h-10 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-lg text-[#12606A] outline-none focus:border-[#12606A] focus:ring-1 focus:ring-[#12606A]" 
                          />
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (window.confirm("Are you sure you want to remove this exercise from the program?")) {
                          removeExercise(ex.id);
                        }
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-3 ml-1"
                      title="Delete Exercise"
                    >
                      <FiTrash2 size={22} />
                    </button>
                  </div>
                </div>
              </div>
              {index < exercises.length - 1 && (
                <div className="mx-4 h-px bg-gray-100"></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="w-full h-1 bg-gray-200 rounded-full mb-8"></div>

        {/* Program Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#455858]">Frequency (per week)</label>
            <input
              type="number"
              min="1"
              defaultValue={3}
              className="w-full rounded-2xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-3.5 text-sm outline-none transition-all text-gray-700 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#455858]">Duration (weeks)</label>
            <input
              type="number"
              min="1"
              defaultValue={4}
              className="w-full rounded-2xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-3.5 text-sm outline-none transition-all text-gray-700 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#455858]">Start Date</label>
            <input
              type="date"
              defaultValue="2026-03-25"
              className="w-full rounded-2xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-3.5 text-sm outline-none transition-all text-gray-700 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <PrimaryButton 
            variant="cancel"
            onClick={onClose}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton 
            variant="add"
            onClick={onClose}
          >
            Save Program
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
