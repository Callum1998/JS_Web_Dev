import { BABYLON, GUI } from "../core/utils";
import { setActiveScene, startRenderLoop } from "../core/engine";
import { createSolarSystemScene } from "../scenes/element1_solarsystem";
import { createEnvironmentScene } from "../scenes/element2_terrainscene";

export function createSceneSelectionUI(engine: BABYLON.Engine, scene: BABYLON.Scene) {
    const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    const menuButton = GUI.Button.CreateSimpleButton("menuBtn", "Scenes ▼");
    menuButton.width = "150px";
    menuButton.height = "40px";
    menuButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    menuButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    menuButton.left = "20px";
    menuButton.top = "20px";

    menuButton.color = "white";
    menuButton.background = "rgba(0,0,0,0.7)";
    menuButton.cornerRadius = 8;
    menuButton.thickness = 0;
    ui.addControl(menuButton);

    const panel = new GUI.StackPanel();
    panel.width = "200px";
    panel.isVisible = false;
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    panel.top = "70px";
    panel.left = "20px";
    ui.addControl(panel);

    function createSceneButton(label: string, callback: () => void) {
        const btn = GUI.Button.CreateSimpleButton(label, label);
        btn.height = "40px";
        btn.color = "white";
        btn.background = "rgba(0,0,0,0.6)";
        btn.cornerRadius = 5;
        btn.thickness = 0;
        btn.fontSize = 16;
        btn.onPointerUpObservable.add(() => {
            panel.isVisible = false;
            callback();
        });
        return btn;
    }

    panel.addControl(
        createSceneButton("Element 1: Solar System", () => {
            const newScene = createSolarSystemScene(engine);
            setActiveScene(newScene);
            startRenderLoop();
        })
    );

    panel.addControl(
        createSceneButton("Element 2: Islands", () => {
            const newScene = createEnvironmentScene(engine);
            setActiveScene(newScene);
            startRenderLoop();
        })
    );

    menuButton.onPointerUpObservable.add(() => {
        panel.isVisible = !panel.isVisible;
    });
}