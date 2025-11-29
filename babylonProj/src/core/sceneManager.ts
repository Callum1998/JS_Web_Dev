import { BABYLON } from "./utils";

let activeScene: BABYLON.Scene;

export function setActiveScene(scene: BABYLON.Scene) {
    activeScene = scene;
}

export function getActiveScene() {
    return activeScene;
}