# Module Federation Implementation Guide

This guide shows how to set up remote micro-frontends using Module Federation.

## Quick Start: Using Local Micro-Frontends

The system is pre-configured to use local components. No remote setup needed to get started:

```tsx
import { getMicroFrontendComponent } from "@/microfrontends/loader";

const WikiViewer = getMicroFrontendComponent("wiki-article-viewer");

export function ArticlePage({ articleId }) {
  const article = await fetchArticle(articleId);
  return <WikiViewer article={article} />;
}
```

## Setting Up a Remote Micro-Frontend

### Step 1: Create a New Micro-Frontend Application

Create a dedicated Next.js app for each remote micro-frontend:

```bash
# Create wiki-viewer micro-frontend
npx create-next-app@latest wiki-viewer-mfe --typescript
cd wiki-viewer-mfe
npm install @module-federation/enhanced
```

### Step 2: Configure Module Federation in `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.publicPath = "auto";
      
      // Import Module Federation plugin
      const { NextFederationPlugin } = require("@module-federation/nextjs-mf");

      config.plugins.push(
        new NextFederationPlugin({
          name: "wikimasters_wiki_viewer",
          filename: "static/chunks/remoteEntry.js",
          exposes: {
            "./entry": "./src/microfrontends/wiki-viewer/entry.tsx",
          },
          // Shared dependencies with the host
          shared: {
            react: { singleton: true, strictVersion: false },
            "react-dom": { singleton: true, strictVersion: false },
          },
        })
      );
    }

    return config;
  },
};

export default nextConfig;
```

### Step 3: Create the Entry Point

```typescript
// src/microfrontends/wiki-viewer/entry.tsx
import dynamic from "next/dynamic";
import WikiArticleViewer from "@/components/wiki-article-viewer";

export default WikiArticleViewer;
```

### Step 4: Configure the Host to Load the Remote

In the main Wikimasters app's `next.config.ts`, update the webpack config:

```typescript
webpack: (config, { isServer }) => {
  if (!isServer) {
    const { NextFederationPlugin } = require("@module-federation/nextjs-mf");

    config.plugins.push(
      new NextFederationPlugin({
        name: "wikimasters_host",
        filename: "static/chunks/remoteEntry.js",
        remotes: {
          // Point to your deployed micro-frontend
          "@mfe/wiki-viewer": 
            "wikimasters_wiki_viewer@http://localhost:3002/remoteEntry.js",
          // In production, update to:
          // "wikimasters_wiki_viewer@https://your-wiki-viewer-domain.com/remoteEntry.js",
        },
        exposes: {
          "./ui/button": "./src/components/ui/button.tsx",
          "./ui/input": "./src/components/ui/input.tsx",
          "./lib/utils": "./src/lib/utils.ts",
        },
        shared: {
          react: { singleton: true, strictVersion: false },
          "react-dom": { singleton: true, strictVersion: false },
        },
      })
    );
  }

  return config;
};
```

### Step 5: Load the Remote in Your Application

```typescript
import dynamic from "next/dynamic";
import { loadRemoteMicroFrontend } from "@/microfrontends/loader";

// Option A: Dynamic import with fallback
const WikiViewerRemote = dynamic(
  () => loadRemoteMicroFrontend("wiki-viewer"),
  {
    loading: () => <div>Loading wiki viewer...</div>,
    ssr: false,
  }
);

export function ArticlePageWithRemote({ article }) {
  return <WikiViewerRemote article={article} />;
}
```

### Step 6: Deploy Your Micro-Frontend

Deploy the wiki-viewer-mfe to a location accessible to the host app:

```bash
# Build the remote
npm run build

# Deploy to your hosting (Vercel, AWS, etc.)
# Update the host's remotes config with the production URL
```

## Local Development Setup

For local development with multiple apps:

1. **Terminal 1 - Host app:**
```bash
npm run dev  # Runs on http://localhost:3000
```

2. **Terminal 2 - Wiki Viewer micro-frontend:**
```bash
cd ../wiki-viewer-mfe
npm run dev  # Runs on http://localhost:3002
```

3. **Terminal 3 - Wiki Editor micro-frontend:**
```bash
cd ../wiki-editor-mfe
npm run dev  # Runs on http://localhost:3003
```

## Handling Missing Remotes

The `loadRemoteMicroFrontend()` function automatically falls back to local components:

```typescript
const WikiViewer = await loadRemoteMicroFrontend("wiki-viewer");
// If remote is unavailable, uses local WikiArticleViewer instead
```

## Troubleshooting

### "Cannot find module '@mfe/wiki-viewer'"

The remote micro-frontend isn't running. Ensure:
- The micro-frontend app is running on the correct port
- The `remoteEntry.js` file is generated (check `_next/static/chunks/`)
- No CORS issues between host and remote

### Module conflicts

If different versions of React cause issues:
- Ensure `singleton: true` is set for shared packages
- Use `strictVersion: false` to allow version mismatches
- Keep React and React-DOM versions consistent

### Build performance

Module Federation increases build time. To optimize:
- Only expose what's necessary
- Use dynamic imports for heavy components
- Consider lazy-loading remotes on specific routes

## Production Deployment

1. **Deploy each micro-frontend separately**
   - Use different domains or CDN paths
   - Update remotes config with production URLs

2. **Update the host configuration**
   ```typescript
   remotes: {
     "@mfe/wiki-viewer": "wikimasters_wiki_viewer@https://mfe-wiki-viewer.com/remoteEntry.js",
     "@mfe/wiki-editor": "wikimasters_wiki_editor@https://mfe-wiki-editor.com/remoteEntry.js",
   }
   ```

3. **Monitor and version**
   - Use semantic versioning for each micro-frontend
   - Consider implementing a manifest/registry service
   - Monitor remote availability and fallback rates

## Advanced: Shared State Management

For complex applications, you may want to share state (e.g., Redux store):

```typescript
// In exposes
exposes: {
  "./store": "./src/store/index.ts",
  "./hooks/useArticle": "./src/hooks/useArticle.ts",
}

// In remote micro-frontends
import { useArticle } from "@mfe/host/hooks/useArticle";
```

## Additional Resources

- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [@module-federation/nextjs-mf GitHub](https://github.com/module-federation/nextjs-mf)
- [Best Practices Guide](https://module-federation.io/)
