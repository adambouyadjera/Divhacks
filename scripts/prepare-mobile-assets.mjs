import { cp, mkdir, rm } from 'node:fs/promises';

const destination = new URL('../www/vendor/maplibre/', import.meta.url);
const oldLeafletDestination = new URL('../www/vendor/leaflet/', import.meta.url);

await rm(oldLeafletDestination, { recursive: true, force: true });
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await Promise.all([
  cp(new URL('../node_modules/maplibre-gl/dist/maplibre-gl.css', import.meta.url), new URL('maplibre-gl.css', destination)),
  cp(new URL('../node_modules/maplibre-gl/dist/maplibre-gl.mjs', import.meta.url), new URL('maplibre-gl.mjs', destination)),
  cp(new URL('../node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs', import.meta.url), new URL('maplibre-gl-shared.mjs', destination)),
  cp(new URL('../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url), new URL('maplibre-gl-worker.mjs', destination)),
]);
