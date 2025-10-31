import { BABYLON } from "./utils";

// Type for callbacks
type SceneBuilder = (engine: BABYLON.Engine) => BABYLON.Scene;
// Main Babylon engine instance
let engine: BABYLON.Engine | null = null;
// HTML Canvas Element that Babylon renders into
let canvas: HTMLCanvasElement | null = null;
// The current scene being rendered
let currentScene: BABYLON.Scene | null = null;

// Initialise the Babylon Engine
export function initEngine(canvasId: string = "renderCanvas"): BABYLON.Engine {
    canvas = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!canvas) {
        throw new Error('Canvas element with "${canvasID}" not found');
    }

    engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil:true,
    });

    // Handle browser resize
    window.addEventListener("resize", () => {
    engine?.resize();
    });

    return engine;
}

// Load a scene
export function setActiveScene(scene: BABYLON.Scene): void {
    currentScene = scene;
}

// Get the current active scene
export function getActiveScene(): BABYLON.Scene | null {
    return currentScene;
}

// Start the Bbaylon render loop
export function startRenderLoop(
    onBeforeRender?: (scene: BABYLON.Scene) => void
): void {
    if (!engine) throw new Error("Engine not initialised.");
    if (!currentScene) throw new Error("No Active Scene Set.");

    console.log("Active scene before render loop:", currentScene)
    engine.runRenderLoop(() => {
        if (onBeforeRender && currentScene) {
            onBeforeRender(currentScene);
        }
        currentScene?.render();
    });
}

// Helper Getters
export function getEngine(): BABYLON.Engine {
    if (!engine) throw new Error("Engine not Initialised.");
    return engine;
}

export function getCanvas(): HTMLCanvasElement {
    if (!canvas) throw new Error("Canvas not found or engine not initialised.");
    return canvas;
}