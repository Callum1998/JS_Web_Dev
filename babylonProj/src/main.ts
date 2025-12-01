import { Engine, Scene, Sound, StopSoundAction } from "@babylonjs/core"
import { createEnvScene } from "./scenes/element1_env";
import { createSolarScene } from "./scenes/element2_solar";
import menuScene from "./scenes/element4_gui";
import "./styles/main.css"


const CanvasName = "renderCanvas";
let canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let scene;
export let scenes: any[] = [];

let eng = new Engine(canvas, true, {}, true);
let gui = menuScene(eng);
scenes[0] = createSolarScene(eng);
scenes[1] = createEnvScene(eng);

scene = scenes[0].scene;
let currentSceneIndex = 0;
scenes[currentSceneIndex].startAudio?.();


export function setSceneIndex(i: number) {
    const oldScene = scenes[currentSceneIndex];
    oldScene?.stopAudio?.();
    
    currentSceneIndex = i;

    const newScene = scenes[currentSceneIndex];
    newScene?.startAudio?.();
}

eng.runRenderLoop(() => {
        scenes[currentSceneIndex].scene.render();
        gui.scene.autoClear = false;
        gui.scene.render();
    });