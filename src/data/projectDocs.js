// Eagerly loads all per-project DESIGN.md files as raw strings at build time.
// Keys are block ids (e.g. 'cdms', 'unity-1', 'orion').
const raw = import.meta.glob('./projects/*/DESIGN.md', { query: '?raw', import: 'default', eager: true });

export const projectDocs = Object.fromEntries(
  Object.entries(raw).map(([path, content]) => {
    const id = path.split('/').at(-2);
    return [id, content];
  }),
);
