import { BABYLON, GUI } from "./utils";
import { initEngine, setActiveScene, getActiveScene, startRenderLoop } from "./engine";
import { createSolarSystemScene } from "../scenes/element1_solarsystem";
import { createEnvironmentScene } from "../scenes/element2_terrainscene";
import { createMainUI } from "../scenes/element4_uiScene";

export function init() {

    const engine = initEngine("renderCanvas");

    const solarScene = createSolarSystemScene(engine);
    const envScene = createEnvironmentScene(engine);

    // Set default active scene
    setActiveScene(solarScene);
    let activeScene = solarScene;

    const { ui, solarBtn, envBtn, activeLabel } = createMainUI(engine);
    activeLabel.text = "Active Scene: Element 1 - Solar System";

    solarBtn.onPointerClickObservable.add(() => {
        setActiveScene(solarScene);
        activeScene = solarScene;
        activeLabel.text = "Active Scene: Element 1 - Solar System";
    });

    envBtn.onPointerClickObservable.add(() => {
        setActiveScene(envScene);
        activeScene = envScene;
        activeLabel.text = "Active Scene: Element 1 - Islands";
    });

    startRenderLoop(() => {
        const active = getActiveScene();
        if (active) active.render();
    })

}