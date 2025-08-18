// src/features/systems/types.ts
/**
 * Types for system cards used across the Systems feature.
 * Keep this file small and authoritative — everyone should import from here.
 */

export type ButtonLabels = {
  primary?: string;   // e.g. "Details"
  request: string;    // required because every card needs the request action
  secondary?: string; // optional secondary action
};

export type SystemLinks = {
  requestPage: string; // full path or relative (e.g. "/systems/giyotin/step2")
  details?: string;    // optional details page path
  [key: string]: string | undefined; // allow future link extensions without type churn
};

export type SystemCardType = {
  id: string;               // unique id / uuid / slug
  title: string;
  description?: string;
  imageUrl?: string | null; // optional — use fallback if missing
  tag?: string;             // small label shown over image
  buttonLabels: ButtonLabels;
  links: SystemLinks;
  isActive?: boolean;       // optional flag for filtering
  createdAt?: string;       // ISO date string, optional
  // extend with metadata if needed, keep it generic and safe
  meta?: Record<string, unknown>;
};
