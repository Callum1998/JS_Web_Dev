import { initEngine, setActiveScene, startRenderLoop } from "./core/engine";
import { createSolarSystem } from "./scenes/element1_solarsystem";
import { BABYLON } from "./core/utils";

window.addEventListener("DOMContentLoaded", () => {
  // 1️⃣ Initialize engine
  const engine = initEngine("renderCanvas");
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

  // 2️⃣ Create scene
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);

  // 3️⃣ Camera
  const camera = new BABYLON.ArcRotateCamera("cam", 0, 0, 5, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  scene.ambientColor = new BABYLON.Color3(0.1,0.1,0.1);
  const glow = new BABYLON.GlowLayer("glow", scene);
  glow.intensity = 0.6;

  // 5️⃣ Meshes
  const solarBodies = createSolarSystem(scene);

  // 6️⃣ Activate scene & start render loop
  setActiveScene(scene);
  startRenderLoop(() => {
  });

  // 7️⃣ Hide loading overlay
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = "none";
    setTimeout(() => overlay.remove(), 500);
  }

  // 8️⃣ Debug info
  scene.debugLayer.show();
  console.log("Camera position:", camera.position.toString());
  console.log("Camera target:", camera.target.toString());
  console.log("Scene active meshes:", scene.getActiveMeshes().length);
});
