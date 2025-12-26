import { Engine, Scene, Sound, StopSoundAction } from "@babylonjs/core"
import { createEnvScene } from "./scenes/element1_env";
import { createSolarScene } from "./scenes/element2_solar";
import { createCharacterScene } from "./scenes/element3_characterscene";
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

let currentSceneIndex = 0;

export function setSceneIndex(i: number) {
    const oldScene = scenes[currentSceneIndex];
    oldScene?.stopAudio?.();
    
    currentSceneIndex = i;

    const newScene = scenes[currentSceneIndex];
    newScene?.startAudio?.();
}

async function initScenes() {
    scenes[0] = await createSolarScene(eng);
    scenes[1] = await createEnvScene(eng);
    scenes[2] = await createCharacterScene(eng);

    scene = scenes[0].scene;
    scenes[currentSceneIndex].startAudio?.();

    eng.runRenderLoop(() => {
        scenes[currentSceneIndex].scene.render();
        gui.scene.autoClear = false;
        gui.scene.render();
    });
}

initScenes();