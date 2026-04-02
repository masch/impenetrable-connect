import { create } from "zustand";
import { Project } from "@repo/shared";
import { ProjectService } from "../services/project.service";
import { logger } from "../services/logger.service";

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  selectProject: (id: number) => Promise<void>;
}

/**
 * Project Store (Zustand)
 * The UI consumes this store, oblivious to whether the data comes from a mock or a real API.
 */
export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await ProjectService.getProjects();
      set({ projects, isLoading: false });
    } catch (err) {
      logger.error("Error fetching projects", err);
      set({ error: "Failed to fetch projects", isLoading: false });
    }

  },

  selectProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const project = await ProjectService.getProjectById(id);
      set({ selectedProject: project, isLoading: false });
    } catch (err) {
      logger.error(`Error fetching project with ID: ${id}`, err);
      set({ error: "Project not found", isLoading: false });
    }

  },
}));
