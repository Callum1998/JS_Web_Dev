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
  const camera = new BABYLON.ArcRotateCamera(
    "cam",
     -Math.PI / 2,
     Math.PI / 2.5,
     30,
    BABYLON.Vector3.Zero(), 
    scene
  );
  camera.attachControl(canvas, true);

  camera.inertia = 0.8;
  camera.panningInertia = 0.9;

  // limit zoom so you don’t clip through planets
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 200;

  // better zoom speed curve
  camera.wheelPrecision = 50;
  camera.pinchPrecision = 100;

  scene.ambientColor = new BABYLON.Color3(0.1,0.1,0.1);
  const glow = new BABYLON.GlowLayer("glow", scene);
  glow.intensity = 0.6;

  const hemiLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.15; // keep it very soft
  hemiLight.diffuse = new BABYLON.Color3(0.4, 0.4, 0.5); // cool tone for space feel
  hemiLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.15);
  hemiLight.specular = new BABYLON.Color3(0, 0, 0); // prevent extra shininess

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
  console.log("Camera position:", camera.position.toString());
  console.log("Camera target:", camera.target.toString());
  console.log("Scene active meshes:", scene.getActiveMeshes().length);
});
