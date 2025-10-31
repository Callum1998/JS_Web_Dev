import { initEngine, setActiveScene, startRenderLoop } from "./core/engine";
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

  // 4️⃣ Light
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // 5️⃣ Meshes
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
  sphere.position = new BABYLON.Vector3(0, 0, 0);

  // 6️⃣ Activate scene & start render loop
  setActiveScene(scene);
  startRenderLoop(() => {
    sphere.rotation.y += 0.01; // optional animation
  });

  // 7️⃣ Hide loading overlay
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = "none";
    setTimeout(() => overlay.remove(), 500);
  }

  // 8️⃣ Debug info
  scene.debugLayer.show();
  console.log("Sphere visible:", sphere.isVisible);
  console.log("Camera position:", camera.position.toString());
  console.log("Camera target:", camera.target.toString());
  console.log("Scene active meshes:", scene.getActiveMeshes().length);
});
