import { Engine, Scene, Vector3, FreeCamera, HemisphericLight, MeshBuilder, CreateGround, StandardMaterial, Texture, Color3, Mesh, Color4, ArcRotateCamera, ShadowGenerator, DirectionalLight, CreateAudioEngineAsync, CreateSoundAsync, PBRMaterial, FollowCamera, ActionManager, ExecuteCodeAction, SceneLoader, ImportMeshAsync, AbstractMesh, LoadAssetContainerAsync, AssetContainer, ISceneLoaderAsyncResult, loadAssetContainerAsync } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

function createCamera(scene: Scene, player: AbstractMesh){
    const camera = new FreeCamera("chaseCam", new Vector3(0,5,-10), scene);

    camera.lockedTarget = player;

    return camera;
}

function createSunLight(scene: Scene) {
    const sunLight = new DirectionalLight(
    "sun",
    new Vector3(-1, -2, -1),
    scene
    );
    sunLight.intensity = 1.2;

    return sunLight;
}

function createShadows(scene: Scene, sunLight: DirectionalLight) {
    const shadowGen = new ShadowGenerator(2048, sunLight);
    shadowGen.bias = 0.0005;
    return shadowGen;
}

function createGround(scene: Scene){
    const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);

    const groundMat = new StandardMaterial("groundMat", scene);
    const groundDiff = new Texture("./assets/textures/forest.jpg", scene);
    groundDiff.uScale = groundDiff.vScale = 8;
    groundMat.diffuseTexture = groundDiff;
    groundMat.roughness = 1;
    groundMat.specularColor = new Color3(0,0,0)

    ground.material = groundMat;
    ground.receiveShadows = true;

    return ground;
}

async function createCharater(scene: Scene){
    
    const assetContainer = await LoadAssetContainerAsync("./assets/models/YBot.glb", scene, {
        pluginOptions: {
            gltf: {
                loadSkins: true,
                skipMaterials: false
            }
        }
    });

    assetContainer.addAllToScene();

    const player = assetContainer.rootNodes[0] as AbstractMesh;

    return player;
}

export async function createCharacterScene(engine: Engine) {

    interface SceneData {
        scene: Scene;
        camera: FreeCamera;
        sunLight: DirectionalLight;
        shadowGen : ShadowGenerator;
        ground: Mesh;
        player: AbstractMesh;
        startAudio?: () => void;
        stopAudio?: () => void;
    }

    let that = {} as SceneData;
    that.scene = new Scene(engine);

    that.scene.clearColor = new Color4(0.5, 0.7, 1.0, 1);
    that.scene.fogMode = Scene.FOGMODE_EXP2;
    that.scene.fogDensity = 0.0075;
    that.scene.fogColor = new Color3(0.6, 0.7, 0.8);

    that.sunLight = createSunLight(that.scene);
    that.shadowGen = createShadows(that.scene, that.sunLight);
    that.ground = createGround(that.scene);

    that.player = await createCharater(that.scene);

    let camera = createCamera(that.scene, that.player);

    const controller = new Mesh("playerController", that.scene);
    controller.position.copyFrom(that.player.position);

    that.player.parent = controller;

    let camVertical = 0;
    let camHorizontal = 0;
    var forwardOffset = -Math.PI;

    window.addEventListener("keydown", e => {
        const keyPress = e.key.toLocaleLowerCase();

        if (keyPress === "arrowup" || keyPress === "w") {
            camVertical = 1;
            forwardOffset = Math.PI;
            controller.rotation.y = 0;
        }
        if (keyPress === "arrowdown" || keyPress === "s") {
            camVertical = -1;
            forwardOffset = Math.PI;
            controller.rotation.y = forwardOffset;
        }
        if (keyPress === "arrowleft" || keyPress === "a") {
            camHorizontal = -1;
            forwardOffset = -Math.PI/2;
            controller.rotation.y = forwardOffset;
        }
        if (keyPress === "arrowright" || keyPress === "d"){
            camHorizontal = 1;
            forwardOffset = Math.PI/2;
            controller.rotation.y = forwardOffset;
        }
    });

    
    window.addEventListener("keyup", e => {
        const key = e.key.toLowerCase();

        if (key === "w" || key === "arrowup") camVertical = 0;
        if (key === "s" || key === "arrowdown") camVertical = 0;
        if (key === "a" || key === "arrowleft") camHorizontal = 0;
        if (key === "d" || key === "arrowright") camHorizontal = 0;
    });

    that.scene.onBeforeRenderObservable.add(() => {
        const moveSpeed = 0.1;
        const moveVector = new Vector3(camHorizontal * moveSpeed, 0, camVertical * moveSpeed);
        if (moveVector.lengthSquared() > 0) {
            // Rotate player to face movement direction
            // Note: Z is forward for most GLTF meshes
            console.log("")
        }

        // Move the player
        controller.moveWithCollisions(moveVector);

        const followOffset = new Vector3(0, 5, -10);

        // world position = player position + static offset (no rotation)
        camera.position = controller.position.add(followOffset);

        // Always look at player
        camera.setTarget(controller.position);
    });


    (async () => {
        const audioEngine = await CreateAudioEngineAsync({volume: 0.3});
    
        await audioEngine.unlockAsync();
        const bgMusic = await CreateSoundAsync("bg", "/assets/audio/SolarAudio.wav", {loop: true});
    
        that.startAudio = () => {
            console.log("Starting SolarAudio");
            bgMusic.play();
        };
    
        that.stopAudio = () => {
            console.log("Stopping SolarAudio");
            bgMusic.stop();
        };
    })();

    return that;
}