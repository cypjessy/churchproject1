"use client";

import { useBackButton } from "@/hooks/useBackButton";

/**
 * Renders nothing — just activates the Android back button handler hook.
 * Must be inside AuthProvider and use client for the hook to work.
 */
export function BackButtonHandler() {
  useBackButton();
  return null;
}
