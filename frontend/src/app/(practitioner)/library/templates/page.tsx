"use client";
import { useState } from "react";

import LibSubheader from "@/components/clinician/headers/LibSubheader";
import SearchBar from "@/components/ui/SearchBar";
import Dropdown from "@/components/ui/Dropdown";
import TemplateItemCard from "@/components/clinician/modals/TemplateItemCard";
import AddTemplateModal from "@/components/clinician/modals/AddTemplateModal";

export default function Templates() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("a-z");
  const [filterBy, setFilterBy] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const sortOptions = [
    { key: "a-z", label: "Sort by A-Z" },
    { key: "z-a", label: "Sort by Z-A" },
  ];

  const filterOptions = [
    { key: "all", label: "Show All" },
    { key: "recent", label: "Recently Added" },
  ];

  const [templatesList, setTemplatesList] = useState([
    { 
      id: 1, 
      title: "4-step Anti Frailty Program", 
      subLabel: "Daily Maintenance", 
      exercises: [
        { id: "e1-tmp", name: "Dorsi Flexion", thumbnailUrl: "/assets/exercises/dorsi_flexion.png" }, 
        { id: "e2-tmp", name: "Plantar Flexion", thumbnailUrl: "/assets/exercises/plantar_flexion.png" }, 
        { id: "e3-tmp", name: "Seated Knee Flexion and Extension", thumbnailUrl: "/assets/exercises/seatedknee_flexion_and_extension.png" }, 
        { id: "e4-tmp", name: "Squat", thumbnailUrl: "/assets/exercises/squat.png" }
      ], 
      isFavorite: true 
    }
  ]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      setTemplatesList((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      if (editingTemplate?.id === id) setEditingTemplate(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected templates?`)) {
      setTemplatesList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
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
      <LibSubheader 
        onAddClick={() => setIsAddModalOpen(true)} 
        addButtonLabel="Add Template" 
      />

      <main className="min-h-screen" style={{ backgroundColor: '#EFF1FE' }}>
        <div className="px-8 py-4 flex flex-wrap items-center gap-4 w-full justify-start">
          <div className="w-[400px]">
            <SearchBar 
              placeholder="Search Templates..." 
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

        {/* Templates Grid - Consistent with Exercise tab grid spacing */}
        <div className="px-8 mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full pb-12">
          {templatesList.map((template) => (
            <TemplateItemCard 
              key={template.id} 
              title={template.title} 
              subLabel={template.subLabel}
              exercises={template.exercises}
              isFavorite={template.isFavorite} 
              selected={selectedIds.includes(template.id)}
              onSelect={(isSelected) => toggleSelect(template.id, isSelected)}
              onEdit={() => setEditingTemplate(template)}
            />
          ))}
        </div>
      </main>

      <AddTemplateModal 
        key={isAddModalOpen ? "add" : (editingTemplate?.id || "none")}
        isOpen={isAddModalOpen || !!editingTemplate} 
        initialData={editingTemplate}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={(data) => {
          console.log(editingTemplate ? "Edited template:" : "Saved template:", data);
          setIsAddModalOpen(false);
          setEditingTemplate(null);
        }}
        onDelete={editingTemplate ? () => handleDelete(editingTemplate.id) : undefined}
      />
    </>
  );
}