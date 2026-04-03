import { Project, CreateProjectSchema, UpdateProjectSchema } from "@repo/shared";
import { MOCK_PROJECTS } from "../mocks/projects";
import { logger } from "./logger.service";

// EXPO_PUBLIC_ prefix makes vars available in the JS bundle at runtime
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === "true";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Common interface for our service implementations.
 * This guarantees consistent contracts between mocks and real APIs.
 */
interface ProjectServiceInterface {
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | null>;
  createProject(project: CreateProjectSchema.infer): Promise<Project>;
  updateProject(id: number, project: UpdateProjectSchema.infer): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;
}

/**
 * Validate project data using Zod schemas
 */
function validateProjectData(
  data: unknown,
  schema: typeof CreateProjectSchema | typeof UpdateProjectSchema,
) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}

/**
 * 🛠️ MOCK Implementation (Used during design/MVP phase)
 */
let mockProjects = [...MOCK_PROJECTS];
let nextId = 3;

const MockProjectService: ProjectServiceInterface = {
  getProjects: async () => {
    await new Promise((r) => setTimeout(r, 800));
    return [...mockProjects];
  },

  getProjectById: async (id: number) => {
    await new Promise((r) => setTimeout(r, 500));
    return mockProjects.find((p) => p.id === id) || null;
  },

  createProject: async (project: CreateProjectSchema.infer) => {
    await new Promise((r) => setTimeout(r, 800));
    // Validate input
    const validated = validateProjectData(project, CreateProjectSchema);
    const newProject: Project = {
      ...validated,
      id: nextId++,
    };
    mockProjects = [...mockProjects, newProject];
    logger.info("[MOCK API] Created project:", newProject);
    return newProject;
  },

  updateProject: async (id: number, project: UpdateProjectSchema.infer) => {
    await new Promise((r) => setTimeout(r, 800));
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Project not found");
    }
    // Validate input
    const validated = validateProjectData(project, UpdateProjectSchema);
    const updatedProject = { ...mockProjects[index], ...validated };
    mockProjects = mockProjects.map((p) => (p.id === id ? updatedProject : p));
    logger.info("[MOCK API] Updated project:", updatedProject);
    return updatedProject;
  },

  deleteProject: async (id: number) => {
    await new Promise((r) => setTimeout(r, 800));
    const exists = mockProjects.some((p) => p.id === id);
    if (!exists) {
      return false;
    }
    mockProjects = mockProjects.filter((p) => p.id !== id);
    logger.info("[MOCK API] Deleted project with id:", id);
    return true;
  },
};

/**
 * 📡 REST API Implementation (Future)
 */
const RestProjectService: ProjectServiceInterface = {
  getProjects: async () => {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) throw new Error("API error fetching projects");
    return response.json();
  },

  getProjectById: async (id: number) => {
    const response = await fetch(`${API_URL}/projects/${id}`);
    if (!response.ok) throw new Error("API error fetching project by ID");
    return response.json();
  },

  createProject: async (project: Omit<Project, "id">) => {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (!response.ok) throw new Error("API error creating project");
    return response.json();
  },

  updateProject: async (id: number, project: Partial<Project>) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (!response.ok) throw new Error("API error updating project");
    return response.json();
  },

  deleteProject: async (id: number) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  },
};

/**
 * EXPORT: The smart switch
 */
export const ProjectService = USE_MOCKS ? MockProjectService : RestProjectService;
