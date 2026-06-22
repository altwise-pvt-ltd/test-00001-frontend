# Source structure (feature-based)

Code is organized by **feature**, not by file type. Everything a feature needs
lives in its own folder; only genuinely cross-feature code lives in `shared/`.

```
src/
  main.jsx          # entry point — mounts <App>
  index.css         # global styles / CSS variables
  app/
    App.jsx         # composition root: router, providers, layout chrome go here
  config/
    env.js          # the only place that reads import.meta.env
  features/
    <feature>/
      components/    # UI used only by this feature
      hooks/         # feature-specific hooks (add as needed)
      api/           # feature-specific API calls (add as needed)
      <Feature>Page.jsx
      index.js       # public API — import the feature through this barrel only
  shared/           # reusable across features
    api/client.js   # fetch wrapper over the backend
    components/      # design-system / generic UI (add as needed)
    hooks/           # generic hooks (add as needed)
    lib/ , utils/    # helpers (add as needed)
```

## Conventions

- **Import features through their `index.js` barrel**, never reach into their
  internal files from outside.
- **Features don't import other features.** If two features need the same code,
  promote it to `shared/`.
- **`config/env.js` is the only file that touches `import.meta.env`.**
- Router and global providers are intentionally not set up yet — they'll be
  added in `app/` when needed.

## Styling

- **Tailwind CSS v4** — utility classes in JSX. No per-feature `.css` files.
- Design tokens (colors, fonts, shadows) live in the `@theme` block of
  `index.css`; dark mode overrides those same CSS variables in a
  `prefers-color-scheme` media query, so most utilities adapt automatically
  without `dark:` variants.
- For long/repeated class strings, define a `const fooClass = '...'` at the top
  of the component (see `features/home/components/NextSteps.jsx`).

## Adding a feature

1. `mkdir src/features/<name>`
2. Add components / hooks / api inside it.
3. Export the entry point(s) from `src/features/<name>/index.js`.
4. Wire it into `app/App.jsx` (or the router, once added).
