"use client";

// Re-exports the useTheme hook from ThemeProvider.
// This file exists so components can import from "@/hooks/useTheme"
// instead of knowing the internal path.

export { useTheme } from "@/components/ui/ThemeProvider";