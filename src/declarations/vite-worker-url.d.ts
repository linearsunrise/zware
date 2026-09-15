// Vite's `?worker&url` import suffix bundles the referenced module through
// Vite's worker pipeline (so .ts gets compiled to real .js in production)
// and resolves to the built asset's URL, instead of instantiating a Worker.
// Used for the AudioWorklet module, since `audioWorklet.addModule()` isn't
// covered by Vite's `new Worker(new URL(...))` bundling heuristic — without
// this, the .ts source is copied as a raw asset and served with the wrong
// MIME type in production.
declare module '*?worker&url' {
  const src: string
  export default src
}
