// Resolves /public files against Vite's base so the site also works from a sub-path or a static preview.
export const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`.replace(/\/{2,}/g, '/');
