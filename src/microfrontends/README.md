# Micro-Frontends with Module Federation

This project uses **Module Federation** to manage components as independently deployable micro-frontends.

## Overview

Module Federation allows:

- **Independent deployment** — Each micro-frontend can be deployed separately
- **Runtime composition** — Load remote components at runtime from different origins
- **Shared dependencies** — React and React-DOM are shared singletons to avoid duplication
- **Fallback handling** — Gracefully fall back to local components if remotes are unavailable
- **Version management** — Each micro-frontend can be independently versioned

## Architecture

**Host Application:** `http://localhost:3000` (main app)
- Exposes: nav-bar, UI components (button, input, label)
- Consumes: remote micro-frontends via Module Federation

**Micro-Frontends (can be separate deployments):**
- `@mfe/wiki-viewer` — Wiki article viewer component (default: local)
- `@mfe/wiki-editor` — Wiki editor component (default: local)
- `@mfe/search` — Search bar component (default: local)

## Configuration

Module Federation is configured in `next.config.ts`:

```typescript
remotes: {
  "@mfe/wiki-viewer": "wikimasters_wiki_viewer@http://localhost:3002/remoteEntry.js",
  "@mfe/wiki-editor": "wikimasters_wiki_editor@http://localhost:3003/remoteEntry.js",
  "@mfe/search": "wikimasters_search@http://localhost:3004/remoteEntry.js",
},
exposes: {
  "./nav-bar": "./src/components/nav/nav-bar.tsx",
  "./ui/button": "./src/components/ui/button.tsx",
  "./ui/input": "./src/components/ui/input.tsx",
  "./ui/label": "./src/components/ui/label.tsx",
},
```

## Usage

### Initialize (in your root layout)

```tsx
import { initializeMicroFrontends } from "@/microfrontends/loader";

export default function RootLayout() {
  initializeMicroFrontends();
  // ... rest of layout
}
```

### Load a local micro-frontend

```tsx
import { getMicroFrontendComponent } from "@/microfrontends/loader";

export function MyComponent() {
  const WikiViewer = getMicroFrontendComponent("wiki-article-viewer");
  return <WikiViewer article={myArticle} />;
}
```

### Load a remote micro-frontend (Module Federation)

```tsx
import { loadRemoteMicroFrontend } from "@/microfrontends/loader";
import { Suspense } from "react";

const WikiViewerRemote = dynamic(
  () => loadRemoteMicroFrontend("wiki-viewer"),
  {
    loading: () => <div>Loading remote component...</div>,
    ssr: false,
  },
);

export function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WikiViewerRemote article={myArticle} />
    </Suspense>
  );
}
```

### Dynamically load (lazy-loading)

```tsx
import { loadMicroFrontend } from "@/microfrontends/loader";

const WikiViewerAsync = loadMicroFrontend("wiki-article-viewer");

export function MyPage() {
  return <WikiViewerAsync article={myArticle} />;
}
```

### Introspect available micro-frontends

```tsx
import { listMicroFrontends } from "@/microfrontends/loader";

export function MicroFrontendDirectory() {
  const mfes = listMicroFrontends();
  return (
    <div>
      {mfes.map((mfe) => (
        <div key={mfe.id}>
          <h3>{mfe.id}</h3>
          <p>{mfe.description}</p>
          <span>v{mfe.version}</span>
        </div>
      ))}
    </div>
  );
}
```

## Registered Micro-Frontends

### Local
- `wiki-article-viewer` (v1.0.0) — Displays a single wiki article
- `wiki-editor` (v1.0.0) — Editor for creating and updating articles
- `search-bar` (v1.0.0) — Article search interface with live results
- `nav-bar` (v1.0.0) — Main navigation bar with auth and menu

### Remote (Module Federation)
- `@mfe/wiki-viewer` — Remote version of wiki-article-viewer
- `@mfe/wiki-editor` — Remote version of wiki-editor
- `@mfe/search` — Remote version of search-bar

## Setting Up Remote Micro-Frontends

### Create a new micro-frontend app

1. Create a new Next.js app:
```bash
npx create-next-app@latest wiki-viewer-mfe
cd wiki-viewer-mfe
npm install
```

2. Configure Module Federation in `next.config.ts`:
```typescript
import { createFederation } from "@module-federation/enhanced/dist/build";

webpack: (config, options) => {
  createFederation(
    {
      name: "wikimasters_wiki_viewer",
      filename: "static/chunks/remoteEntry.js",
      exposes: {
        "./entry": "./src/pages/wiki-viewer.tsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        "react-dom": { singleton: true, requiredVersion: false },
      },
    },
    options,
  );
  return config;
};
```

3. Create the exposed entry point:
```tsx
// src/pages/wiki-viewer.tsx
import WikiArticleViewer from "@/components/wiki-article-viewer";
export default WikiArticleViewer;
```

4. Deploy to production (e.g., http://your-domain.com/wiki-viewer/)

5. Update the host's `next.config.ts` with the production URL:
```typescript
remotes: {
  "@mfe/wiki-viewer": "wikimasters_wiki_viewer@https://your-domain.com/wiki-viewer/remoteEntry.js",
}
```

### Loading with Fallback

The `loadRemoteMicroFrontend()` function automatically falls back to the local component if the remote is unavailable:

```tsx
const WikiViewer = await loadRemoteMicroFrontend("wiki-viewer");
// If http://localhost:3002/remoteEntry.js fails, uses local WikiArticleViewer
```

## Benefits

- **Decoupled development** — Teams can work on components independently
- **Separate deployments** — Update components without redeploying the host
- **Scalability** — Load heavy components on-demand
- **Framework flexibility** — Remote micro-frontends can use different versions or even different frameworks
- **Performance** — Only load what you need

## Future Enhancements

- Set up CI/CD pipelines for each micro-frontend
- Use CDN for micro-frontend distribution
- Implement analytics for component usage
- Add feature flags for gradual rollouts
- Monitor performance of remote micro-frontends
