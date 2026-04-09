import apiClient from '@/lib/apiClient';

export interface Exercise {
  id: number;
  practitioner_id: number;
  name: string;
  instructions: string | null;
  difficulty: string | null;
  default_sets: number;
  default_reps: number;
  reps_min: number | null;
  reps_max: number | null;
  media_url: string | null;
  patient_featured: boolean;
  is_favorite: boolean;
  created_at: string;
}

export interface TemplateExercise {
  id: number;
  exercise_id: number;
  position: number;
  sets_override: number | null;
  reps_override: number | null;
  name: string | null;
  media_url: string | null;
  default_sets: number | null;
  default_reps: number | null;
}

export interface Template {
  id: number;
  practitioner_id: number;
  name: string;
  sub_label: string | null;
  is_favorite: boolean;
  created_at: string;
  exercises: TemplateExercise[];
}

export interface CreateExercisePayload {
  practitioner_id: number;
  name: string;
  instructions?: string;
  difficulty?: string;
  default_sets?: number;
  default_reps?: number;
  reps_min?: number;
  reps_max?: number;
  media_url?: string;
  patient_featured?: boolean;
  is_favorite?: boolean;
}

export interface CreateTemplatePayload {
  practitioner_id: number;
  name: string;
  sub_label?: string;
  is_favorite?: boolean;
  exercises: { exercise_id: number; sets_override?: number; reps_override?: number }[];
}

export const libraryService = {
  // Exercises
  async getExercises(practitionerId: number): Promise<Exercise[]> {
    const { data } = await apiClient.get(`/exercises?practitioner_id=${practitionerId}`);
    return data;
  },

  async createExercise(payload: CreateExercisePayload): Promise<Exercise> {
    const { data } = await apiClient.post('/exercises', payload);
    return data.exercise;
  },

  async updateExercise(id: number, payload: Partial<CreateExercisePayload>): Promise<Exercise> {
    const { data } = await apiClient.put(`/exercises/${id}`, payload);
    return data.exercise;
  },

  async deleteExercise(id: number): Promise<void> {
    await apiClient.delete(`/exercises/${id}`);
  },

  // Templates
  async getTemplates(practitionerId: number): Promise<Template[]> {
    const { data } = await apiClient.get(`/templates?practitioner_id=${practitionerId}`);
    return data;
  },

  async createTemplate(payload: CreateTemplatePayload): Promise<Template> {
    const { data } = await apiClient.post('/templates', payload);
    return data.template;
  },

  async updateTemplate(id: number, payload: Partial<CreateTemplatePayload>): Promise<Template> {
    const { data } = await apiClient.put(`/templates/${id}`, payload);
    return data.template;
  },

  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(`/templates/${id}`);
  },

  // Media upload
  async uploadExerciseMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/upload/exercise-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },
};
