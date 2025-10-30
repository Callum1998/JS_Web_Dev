import * as BABYLON from "@babylonjs/core"
import {createScene} from "./createElementScene";


// Get the cavas element
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

// Create BabylonJS engine
const engine = new BABYLON.Engine(canvas, true);

// Create and Run the scene
const scene = createScene(engine, canvas)

engine.runRenderLoop(() => {
    scene.render();
    });

window.addEventListener("resize", () => {
    engine.resize();
})