import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { MicroFrontendId } from "./registry";
import {
  getAllMicroFrontends,
  getMicroFrontend,
  registerMicroFrontends,
} from "./registry";

// Import existing project components
import NavBar from "@/components/nav/nav-bar";
import { SearchBar } from "@/components/nav/search-bar";
import WikiArticleViewer from "@/components/wiki-article-viewer";
import WikiEditor from "@/components/wiki-editor";

/**
 * Initialize the micro-frontend system with existing project components.
 * Module Federation can also be used to load remote micro-frontends.
 * This should be called once at app startup.
 */
export function initializeMicroFrontends() {
  registerMicroFrontends([
    {
      id: "wiki-article-viewer",
      component: WikiArticleViewer,
      description:
        "Displays a single wiki article with metadata and content (can be loaded remotely via @mfe/wiki-viewer)",
      version: "1.0.0",
    },
    {
      id: "wiki-editor",
      component: WikiEditor,
      description:
        "Editor for creating and updating wiki articles (can be loaded remotely via @mfe/wiki-editor)",
      version: "1.0.0",
    },
    {
      id: "search-bar",
      component: SearchBar,
      description:
        "Article search interface with live results (can be loaded remotely via @mfe/search)",
      version: "1.0.0",
    },
    {
      id: "nav-bar",
      component: NavBar,
      description: "Main navigation bar with authentication and menu",
      version: "1.0.0",
    },
  ]);
}

/**
 * Load a micro-frontend from a remote Module Federation host.
 * Example: loadRemoteMicroFrontend("wiki-viewer") loads from @mfe/wiki-viewer
 */
export async function loadRemoteMicroFrontend(scope: string): Promise<any> {
  // Map scopes to remote module names
  const remoteMap: Record<string, string> = {
    "wiki-viewer": "@mfe/wiki-viewer",
    "wiki-editor": "@mfe/wiki-editor",
    search: "@mfe/search",
  };

  const remoteName = remoteMap[scope];
  if (!remoteName) {
    throw new Error(
      `Unknown remote scope: ${scope}. Available: ${Object.keys(remoteMap).join(", ")}`,
    );
  }

  try {
    // Dynamically import from the remote
    const module = await import(
      /* webpackIgnore: true */ `${remoteName}/entry`
    );
    return module.default || module;
  } catch (error) {
    console.warn(
      `Failed to load remote micro-frontend "${scope}":`,
      error,
      "Falling back to local component",
    );
    // Fallback to local component if remote is unavailable
    const localId = scope.replace("-", "_") as MicroFrontendId;
    return getMicroFrontendComponent(localId);
  }
}

/**
 * Dynamically load a micro-frontend by ID (local only).
 * Use loadRemoteMicroFrontend() for remote Module Federation components.
 */
export function loadMicroFrontend(id: MicroFrontendId) {
  return dynamic(
    async () => {
      const mfe = getMicroFrontend(id);
      if (!mfe) {
        throw new Error(`Micro-frontend "${id}" not found in registry`);
      }
      return { default: mfe.component };
    },
    {
      loading: () => (
        <div className="animate-pulse bg-slate-200 h-10 rounded" />
      ),
    },
  );
}

/**
 * Get a micro-frontend component directly (local only)
 */
export function getMicroFrontendComponent(
  id: MicroFrontendId,
): ComponentType<any> | null {
  const mfe = getMicroFrontend(id);
  return mfe?.component ?? null;
}

/**
 * Get all registered micro-frontends for introspection/documentation
 */
export function listMicroFrontends() {
  return getAllMicroFrontends();
}
