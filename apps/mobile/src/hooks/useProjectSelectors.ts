import { useMemo } from "react";
import { useProjectStore } from "../stores/project.store";
import { Project } from "@repo/shared";

/**
 * Sorting functions for project collections
 * These can be exported and reused across components
 */

/**
 * Sort projects by active status (active first) then by name (ascending)
 */
export const sortProjectsByActiveFirst: (projects: Project[]) => Project[] = (projects) => {
  return [...projects].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
};

/**
 * Sort projects by name (ascending)
 */
export const sortProjectsByName: (projects: Project[]) => Project[] = (projects) => {
  return [...projects].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Filter active projects from a collection
 */
export const filterActiveProjects: (projects: Project[]) => Project[] = (projects) => {
  return projects.filter((p) => p.is_active);
};

/**
 * Filter inactive projects from a collection
 */
export const filterInactiveProjects: (projects: Project[]) => Project[] = (projects) => {
  return projects.filter((p) => !p.is_active);
};

/**
 * Hook that provides sorted and filtered project selectors
 * Uses the project store to get projects and returns:
 * - sortedProjects: all projects sorted by active status then name
 * - activeProjects: only active projects (sorted by name)
 * - inactiveProjects: only inactive projects (sorted by name)
 */
export function useProjectSelectors() {
  const projects = useProjectStore((state) => state.projects);

  const sortedProjects = useMemo(() => sortProjectsByActiveFirst(projects), [projects]);

  const activeProjects = useMemo(
    () => sortProjectsByName(filterActiveProjects(projects)),
    [projects],
  );

  const inactiveProjects = useMemo(
    () => sortProjectsByName(filterInactiveProjects(projects)),
    [projects],
  );

  return {
    sortedProjects,
    activeProjects,
    inactiveProjects,
  };
}
