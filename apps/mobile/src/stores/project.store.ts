import { create } from "zustand";
import { Project } from "@repo/shared";
import { ProjectService } from "../services/project.service";
import { logger } from "../services/logger.service";

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  selectProject: (id: number) => Promise<void>;
  createProject: (project: Omit<Project, "zzz_id">) => Promise<Project | null>;
  updateProject: (id: number, project: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: number) => Promise<boolean>;
}

/**
 * Project Store (Zustand)
 * The UI consumes this store, oblivious to whether the data comes from a mock or a real API.
 * Uses isLoading for read operations and isSaving for mutations.
 */
export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await ProjectService.getProjects();
      set({ projects, isLoading: false });
    } catch (err: unknown) {
      logger.error("Error fetching projects", err);
      set({ error: "Failed to fetch projects", isLoading: false });
    }
  },

  selectProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const project = await ProjectService.getProjectById(id);
      set({ selectedProject: project, isLoading: false });
    } catch (err: unknown) {
      logger.error(`Error fetching project with ID: ${id}`, err);
      set({ error: "Project not found", isLoading: false });
    }
  },

  createProject: async (project: Omit<Project, "zzz_id">) => {
    set({ isSaving: true, error: null });
    try {
      const newProject = await ProjectService.createProject(project);
      const currentProjects = get().projects;
      set({ projects: [...currentProjects, newProject], isSaving: false });
      return newProject;
    } catch (err: unknown) {
      logger.error("Error creating project", err);
      set({ error: "Failed to create project", isSaving: false });
      return null;
    }
  },

  updateProject: async (id: number, project: Partial<Project>) => {
    set({ isSaving: true, error: null });
    try {
      const updatedProject = await ProjectService.updateProject(id, project);
      const currentProjects = get().projects;
      const updatedList = currentProjects.map((p) => (p.zzz_id === id ? updatedProject : p));
      set({ projects: updatedList, selectedProject: updatedProject, isSaving: false });
      return updatedProject;
    } catch (err: unknown) {
      logger.error(`Error updating project with ID: ${id}`, err);
      set({ error: "Failed to update project", isSaving: false });
      return null;
    }
  },

  deleteProject: async (id: number) => {
    set({ isSaving: true, error: null });
    try {
      const success = await ProjectService.deleteProject(id);
      if (success) {
        const currentProjects = get().projects;
        set({
          projects: currentProjects.filter((p) => p.zzz_id !== id),
          selectedProject: null,
          isSaving: false,
        });
      }
      return success;
    } catch (err: unknown) {
      logger.error(`Error deleting project with ID: ${id}`, err);
      set({ error: "Failed to delete project", isSaving: false });
      return false;
    }
  },
}));
