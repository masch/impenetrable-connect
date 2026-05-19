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
  return projects.toSorted((a, b) => {
    if (a.zzz_is_active !== b.zzz_is_active) {
      return a.zzz_is_active ? -1 : 1;
    }
    return a.zzz_name.localeCompare(b.zzz_name);
  });
};

/**
 * Sort projects by name (ascending)
 */
export const sortProjectsByName: (projects: Project[]) => Project[] = (projects) => {
  return projects.toSorted((a, b) => a.zzz_name.localeCompare(b.zzz_name));
};

/**
 * Filter active projects from a collection
 */
export const filterActiveProjects: (projects: Project[]) => Project[] = (projects) => {
  return projects.filter((p) => p.zzz_is_active);
};

/**
 * Filter inactive projects from a collection
 */
export const filterInactiveProjects: (projects: Project[]) => Project[] = (projects) => {
  return projects.filter((p) => !p.zzz_is_active);
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
