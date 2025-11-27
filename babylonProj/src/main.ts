import { initEngine, setActiveScene, startRenderLoop } from "./core/engine";
import { createSolarSystem } from "./scenes/element1_solarsystem";
import { createEnvironmentScene } from "./scenes/element2_terrainscene";
import { BABYLON } from "./core/utils";

window.addEventListener("DOMContentLoaded", () => {
  const engine = initEngine("renderCanvas");

  // Create scene
  const scene = createEnvironmentScene(engine);

  // Meshes
  // const solarBodies = createSolarSystem(scene);

  // Activate scene & start render loop
  setActiveScene(scene);
  startRenderLoop(() => {
  });

  // Hide loading overlay
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = "none";
    setTimeout(() => overlay.remove(), 500);
  }

});
