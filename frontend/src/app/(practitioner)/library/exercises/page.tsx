"use client";
import { useState } from "react";

import LibSubheader from "@/components/clinician/headers/libSubheader";
import SearchBar from "@/components/ui/searchBar";
import Dropdown from "@/components/ui/dropDown";
import AddExerciseModal from "@/components/clinician/modals/AddExerciseModal";
import ExerciseItemCard from "@/components/clinician/modals/ExerciseItemCard";

export default function Exercises() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("a-z");
  const [filterBy, setFilterBy] = useState("all");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingExercise, setEditingExercise] = useState<any>(null);

  const sortOptions = [
    { key: "a-z", label: "Sort by A-Z" },
    { key: "z-a", label: "Sort by Z-A" },
  ];

  const filterOptions = [
    { key: "all", label: "Show All" },
    { key: "recent", label: "Recently Added" },
  ];

  const [exercisesList, setExercisesList] = useState([
    { id: 1, title: "Dorsi Flexion", isFavorite: true, thumbnailUrl: "/assets/exercises/dorsi_flexion.png" },
    { id: 2, title: "Plantar Flexion", isFavorite: false, thumbnailUrl: "/assets/exercises/plantar_flexion.png" },
    { id: 3, title: "Seated Knee Flexion and Extension", isFavorite: false, thumbnailUrl: "/assets/exercises/seatedknee_flexion_and_extension.png" },
    { id: 4, title: "Squat", isFavorite: true, thumbnailUrl: "/assets/exercises/squat.png" },
  ]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this exercise?")) {
      setExercisesList((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      if (editingExercise?.id === id) setEditingExercise(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected exercises?`)) {
      setExercisesList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number, isSelected: boolean) => {
    setSelectedIds((prev) => 
      isSelected ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
    );
  };

  return (
    <>
      <main className="min-h-screen pt-12 pb-12" style={{ backgroundColor: '#EFF1FE' }}>
        <div className="px-8 py-4 flex flex-wrap items-center gap-4 w-full justify-start">
          <div className="w-[400px]">
            <SearchBar 
              placeholder="Search Exercises..." 
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="w-48">
            <Dropdown 
              label="Sort by" 
              options={sortOptions} 
              selectedKey={sortBy}
              onSelect={setSortBy} 
            />
          </div>
          <div className="w-48">
            <Dropdown 
              label="Filter" 
              options={filterOptions} 
              selectedKey={filterBy}
              onSelect={setFilterBy} 
            />
          </div>
          {selectedIds.length > 0 && (
            <div className="ml-auto">
              <button 
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
              >
                Delete Selected ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        {/* Exercise Grid */}
        <div className="px-8 mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full">
          {exercisesList.map((exercise) => (
            <ExerciseItemCard 
              key={exercise.id} 
              title={exercise.title} 
              isFavorite={exercise.isFavorite} 
              thumbnailUrl={exercise.thumbnailUrl}
              selected={selectedIds.includes(exercise.id)}
              onSelect={(isSelected) => toggleSelect(exercise.id, isSelected)}
              onEdit={() => setEditingExercise(exercise)}
            />
          ))}
        </div>
      </main>

      <AddExerciseModal 
        key={isAddModalOpen ? "add" : (editingExercise?.id || "none")}
        isOpen={isAddModalOpen || !!editingExercise} 
        initialData={editingExercise}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExercise(null);
        }} 
        onSave={(data) => {
          console.log(editingExercise ? "Edited exercise:" : "Added exercise:", data);
          setIsAddModalOpen(false);
          setEditingExercise(null);
        }}
        onDelete={editingExercise ? () => handleDelete(editingExercise.id) : undefined}
      />
    </>
  );
}