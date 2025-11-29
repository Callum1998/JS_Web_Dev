import { BABYLON, GUI } from "../core/utils";

export function createMainUI(engine: BABYLON.Engine) {
    // Create a "dummy" scene just to host the GUI once
    const uiScene = new BABYLON.Scene(engine);

    // AdvancedDynamicTexture attached to canvas
    const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Panel
    const panel = new GUI.StackPanel();
    panel.width = "400px";
    panel.isVertical = true;
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    panel.paddingTop = "20px";
    panel.paddingLeft = "20px";
    ui.addControl(panel);

    const activeLabel = new GUI.TextBlock();
    activeLabel.text = "Active Scene: None";
    activeLabel.color = "white";
    activeLabel.height = "40px";
    activeLabel.fontSize = 20;
    panel.addControl(activeLabel);

    function makeButton(text: string) {
        const btn = GUI.Button.CreateSimpleButton(text, text);
        btn.width = 1;
        btn.height = "40px";
        btn.fontSize = 18;
        btn.color = "white";
        btn.background = "#333A";
        btn.thickness = 0;
        btn.cornerRadius = 6;
        return btn;
    }

    const solarBtn = makeButton("Solar System");
    const envBtn = makeButton("Environment");

    panel.addControl(solarBtn);
    panel.addControl(envBtn);

    return { ui, panel, solarBtn, envBtn, activeLabel };
}