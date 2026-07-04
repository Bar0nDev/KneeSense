"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

import LibSubheader from "@/components/clinician/headers/LibSubheader";
import SearchBar from "@/components/ui/SearchBar";
import Dropdown from "@/components/ui/Dropdown";
import TemplateItemCard from "@/components/clinician/modals/TemplateItemCard";
import AddTemplateModal from "@/components/clinician/modals/AddTemplateModal";
import { libraryService, Template } from "@/services/libraryService";
import { useUser } from "@/context/UserContext";

export default function Templates() {
  const { userProfile } = useUser();
  const practitionerId = userProfile?.profile_id;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("a-z");
  const [filterBy, setFilterBy] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const sortOptions = [
    { key: "a-z", label: "Sort by A-Z" },
    { key: "z-a", label: "Sort by Z-A" },
  ];
  const filterOptions = [
    { key: "all", label: "Show All" },
    { key: "recent", label: "Recently Added" },
  ];

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: queryKeys.templates(practitionerId),
    queryFn: () => libraryService.getTemplates(practitionerId!),
    enabled: !!practitionerId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => libraryService.createTemplate({ ...data, practitioner_id: practitionerId! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates(practitionerId) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => libraryService.updateTemplate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates(practitionerId) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => libraryService.deleteTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates(practitionerId) }),
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
      setSelectedIds((prev) => prev.filter((s) => s !== id));
      if (editingTemplate?.id === id) setEditingTemplate(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected templates?`)) {
      selectedIds.forEach((id) => deleteMutation.mutate(id));
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number, isSelected: boolean) => {
    setSelectedIds((prev) => isSelected ? [...prev, id] : prev.filter((s) => s !== id));
  };

  const handleSave = (data: any) => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
    setIsAddModalOpen(false);
    setEditingTemplate(null);
  };

  const filtered = templates
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "a-z" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  return (
    <>
      <LibSubheader onAddClick={() => setIsAddModalOpen(true)} addButtonLabel="Add Template" />

      <main className="min-h-screen" style={{ backgroundColor: '#EFF1FE' }}>
        <div className="px-8 py-4 flex flex-wrap items-center gap-4 w-full justify-start">
          <div className="w-[400px]">
            <SearchBar placeholder="Search Templates..." value={search} onChange={setSearch} />
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

        <div className="px-8 mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full pb-12">
          {isLoading ? (
            <p className="text-sm text-gray-400 col-span-full py-10 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-full py-10 text-center">No templates yet. Add your first one.</p>
          ) : filtered.map((template) => (
            <TemplateItemCard
              key={template.id}
              title={template.name}
              subLabel={template.sub_label ?? undefined}
              exercises={template.exercises.map((te) => ({ name: te.name ?? "", thumbnailUrl: te.media_url ?? undefined }))}
              isFavorite={template.is_favorite}
              selected={selectedIds.includes(template.id)}
              onSelect={(isSelected) => toggleSelect(template.id, isSelected)}
              onEdit={() => setEditingTemplate(template)}
            />
          ))}
        </div>
      </main>

      <AddTemplateModal
        key={isAddModalOpen ? "add" : (editingTemplate?.id ?? "none")}
        isOpen={isAddModalOpen || !!editingTemplate}
        initialData={editingTemplate ? {
          title: editingTemplate.name,
          subLabel: editingTemplate.sub_label ?? "",
          exercises: editingTemplate.exercises.map((te) => ({
            id: String(te.id),
            exercise_id: te.exercise_id,
            name: te.name ?? "",
            thumbnailUrl: te.media_url ?? undefined,
            sets: te.sets_override ?? te.default_sets ?? 3,
            reps: te.reps_override ?? te.default_reps ?? 10,
          })),
        } : undefined}
        practitionerId={practitionerId ?? undefined}
        onClose={() => { setIsAddModalOpen(false); setEditingTemplate(null); }}
        onSave={handleSave}
        onDelete={editingTemplate ? () => handleDelete(editingTemplate.id) : undefined}
      />
    </>
  );
}
