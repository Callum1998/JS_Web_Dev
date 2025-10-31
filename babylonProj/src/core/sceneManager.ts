import { getEngine, getActiveScene, setActiveScene } from "./engine";
import { BABYLON } from "./utils";

export async function loadScene(SceneBuilder: (engine: BABYLON.Engine) => BABYLON.Scene) {
    const engine = getEngine();

    // Dispose of old scene if one exists
    const oldScene = BABYLON.EngineStore.LastCreatedScene;
    if (oldScene) oldScene.dispose();

    const newScene = SceneBuilder(engine);
    setActiveScene(newScene);
}