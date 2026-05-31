import type { ComponentType } from "react";

export type MicroFrontendId =
  | "wiki-article-viewer"
  | "wiki-editor"
  | "search-bar"
  | "nav-bar";

export interface MicroFrontend {
  id: MicroFrontendId;
  component: ComponentType<any>;
  description: string;
  version: string;
}

/**
 * Micro-Frontend Registry
 * 
 * This registry wraps existing project components as independently loadable micro-frontends.
 * Each micro-frontend can be dynamically loaded, versioned, and composed throughout the app.
 * 
 * Benefits:
 * - Components can be independently versioned and deployed
 * - Clear module boundaries and contracts
 * - Easier to test and refactor
 * - Foundation for future remote micro-frontend architecture
 */

let registry: Map<MicroFrontendId, MicroFrontend> = new Map();

export function registerMicroFrontend(mfe: MicroFrontend) {
  registry.set(mfe.id, mfe);
}

export function getMicroFrontend(id: MicroFrontendId): MicroFrontend | undefined {
  return registry.get(id);
}

export function getAllMicroFrontends(): MicroFrontend[] {
  return Array.from(registry.values());
}

export function registerMicroFrontends(
  mfes: Omit<MicroFrontend, "version">[] & { version: string }[],
) {
  mfes.forEach((mfe) => registerMicroFrontend(mfe as MicroFrontend));
}
