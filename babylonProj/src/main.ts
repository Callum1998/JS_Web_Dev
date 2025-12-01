import { Engine } from "@babylonjs/core"
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
let scenes: any[] = [];

let eng = new Engine(canvas, true, {}, true);
let gui = menuScene(eng);
scenes[0] = createSolarScene(eng);
scenes[1] = createEnvScene(eng);

scene = scenes[0].scene;
setSceneIndex(0);

export default function setSceneIndex(i: number) {
    eng.runRenderLoop(() => {
        scenes[i].scene.render();
        gui.scene.autoClear = false;
        gui.scene.render();
    });
}

