import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ProjectCard } from "../ProjectCard";
import { Project, Language } from "@repo/shared";

describe("ProjectCard", () => {
  const mockProject: Project = {
    zzz_id: 1,
    zzz_name: "Test Project",
    zzz_default_language: "es" as Language,
    zzz_supported_languages: ["es", "en"],
    zzz_cascade_timeout_minutes: 30,
    zzz_max_cascade_attempts: 10,
    zzz_is_active: true,
  };

  it("should render project name", () => {
    render(<ProjectCard project={mockProject} isActive={true} />);

    expect(screen.getByText("Test Project")).toBeTruthy();
  });

  it("should display active status when isActive is true", () => {
    render(<ProjectCard project={mockProject} isActive={true} />);

    expect(screen.getByText(/active/i)).toBeTruthy();
  });

  it("should display inactive status when isActive is false", () => {
    render(<ProjectCard project={mockProject} isActive={false} />);

    expect(screen.getByText(/inactive/i)).toBeTruthy();
  });

  it("should render default language", () => {
    render(<ProjectCard project={mockProject} isActive={true} />);

    expect(screen.getByText("es")).toBeTruthy();
  });

  it("should render supported languages", () => {
    render(<ProjectCard project={mockProject} isActive={true} />);

    expect(screen.getByText("es, en")).toBeTruthy();
  });

  it("should render cascade timeout", () => {
    render(<ProjectCard project={mockProject} isActive={true} />);

    expect(screen.getByText("30 min")).toBeTruthy();
  });
});
