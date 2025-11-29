import { BABYLON } from "./core/utils";
import { init } from "./core/appInit";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);

init();
