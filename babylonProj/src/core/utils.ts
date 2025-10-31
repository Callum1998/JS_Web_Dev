// Babylon Core and Common Modules
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/inspector";
// GUI and Materials
import * as GUI from "@babylonjs/gui";
import * as MATERIALS from "@babylonjs/materials";
//Physics
import * as HAVOK from "@babylonjs/havok";


//Export so other files can just import from this unility file
export {BABYLON, GUI, MATERIALS, HAVOK};

// Create some frequent Utility functions
export function createVector3(x: number, y: number, z: number): BABYLON.Vector3{
    return new BABYLON.Vector3(x,y,z);
}

export function randomRange(min: number, max: number): number {
    return Math.random() * (max-min) + min;
}

// Asset Loader Helper
export async function loadTexture(
    scene: BABYLON.Scene,
    url: string
): Promise<BABYLON.Texture> {
    return new BABYLON.Texture(url, scene);
}

// Colour Helper
export function colourRGB(r: number, g: number, b: number): BABYLON.Color3 {
    return new BABYLON.Color3(r/ 255, g/ 255, b/ 255);
}