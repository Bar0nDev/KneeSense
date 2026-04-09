"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import LibSubheader from "@/components/clinician/headers/LibSubheader";
import SearchBar from "@/components/ui/SearchBar";
import Dropdown from "@/components/ui/Dropdown";
import AddExerciseModal from "@/components/clinician/modals/AddExerciseModal";
import ExerciseItemCard from "@/components/clinician/modals/ExerciseItemCard";
import { libraryService, Exercise } from "@/services/libraryService";
import { useUser } from "@/context/UserContext";

export default function Exercises() {
  const { userProfile } = useUser();
  const practitionerId = userProfile?.profile_id;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("a-z");
  const [filterBy, setFilterBy] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const sortOptions = [
    { key: "a-z", label: "Sort by A-Z" },
    { key: "z-a", label: "Sort by Z-A" },
  ];
  const filterOptions = [
    { key: "all", label: "Show All" },
    { key: "recent", label: "Recently Added" },
  ];

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ["exercises", practitionerId],
    queryFn: () => libraryService.getExercises(practitionerId!),
    enabled: !!practitionerId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => libraryService.createExercise({ ...data, practitioner_id: practitionerId! as number }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercises", practitionerId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => libraryService.updateExercise(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercises", practitionerId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => libraryService.deleteExercise(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercises", practitionerId] }),
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this exercise?")) {
      deleteMutation.mutate(id);
      setSelectedIds((prev) => prev.filter((s) => s !== id));
      if (editingExercise?.id === id) setEditingExercise(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected exercises?`)) {
      selectedIds.forEach((id) => deleteMutation.mutate(id));
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number, isSelected: boolean) => {
    setSelectedIds((prev) => isSelected ? [...prev, id] : prev.filter((s) => s !== id));
  };

  const handleSave = async (data: any) => {
    let mediaUrl: string | null = data.mediaUrl ?? null;
    if (data.mediaFile) {
      try {
        mediaUrl = await libraryService.uploadExerciseMedia(data.mediaFile);
      } catch (e) {
        console.error("Media upload failed", e);
        alert("Failed to upload media file. Please try again.");
        return;
      }
    }

    const payload = {
      name: data.title,
      instructions: data.instructions || null,
      difficulty: data.difficulty || null,
      default_sets: data.sets ?? 3,
      default_reps: data.reps?.default ?? 10,
      reps_min: data.reps?.min ?? null,
      reps_max: data.reps?.max ?? null,
      media_url: mediaUrl,
      patient_featured: data.patientFeatured ?? false,
      is_favorite: data.isFavorite ?? false,
    };

    if (editingExercise) {
      updateMutation.mutate({ id: editingExercise.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
    setIsAddModalOpen(false);
    setEditingExercise(null);
  };

  const filtered = exercises
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "a-z" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  return (
    <>
      <LibSubheader onAddClick={() => setIsAddModalOpen(true)} addButtonLabel="Add Exercise" />

      <main className="min-h-screen" style={{ backgroundColor: '#EFF1FE' }}>
        <div className="px-8 py-4 flex flex-wrap items-center gap-4 w-full justify-start">
          <div className="w-[400px]">
            <SearchBar placeholder="Search Exercises..." value={search} onChange={setSearch} />
          </div>
          <div className="w-48">
            <Dropdown label="Sort by" options={sortOptions} selectedKey={sortBy} onSelect={setSortBy} />
          </div>
          <div className="w-48">
            <Dropdown label="Filter" options={filterOptions} selectedKey={filterBy} onSelect={setFilterBy} />
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

        <div className="px-8 mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full">
          {isLoading ? (
            <p className="text-sm text-gray-400 col-span-full py-10 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-full py-10 text-center">No exercises yet. Add your first one.</p>
          ) : filtered.map((exercise) => (
            <ExerciseItemCard
              key={exercise.id}
              title={exercise.name}
              isFavorite={exercise.is_favorite}
              thumbnailUrl={exercise.media_url ?? undefined}
              selected={selectedIds.includes(exercise.id)}
              onSelect={(isSelected) => toggleSelect(exercise.id, isSelected)}
              onEdit={() => setEditingExercise(exercise)}
            />
          ))}
        </div>
      </main>

      <AddExerciseModal
        key={isAddModalOpen ? "add" : (editingExercise?.id ?? "none")}
        isOpen={isAddModalOpen || !!editingExercise}
        initialData={editingExercise ? {
          id: editingExercise.id,
          title: editingExercise.name,
          instructions: editingExercise.instructions,
          difficulty: editingExercise.difficulty,
          sets: editingExercise.default_sets,
          reps: editingExercise.default_reps,
          mediaUrl: editingExercise.media_url,
          patientFeatured: editingExercise.patient_featured,
          isFavorite: editingExercise.is_favorite,
        } : undefined}
        onClose={() => { setIsAddModalOpen(false); setEditingExercise(null); }}
        onSave={handleSave}
        onDelete={editingExercise ? () => handleDelete(editingExercise.id) : undefined}
      />
    </>
  );
}
