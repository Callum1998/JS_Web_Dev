import {
    Scene,
    ArcRotateCamera,
    Vector3,
    MeshBuilder,
    Mesh,
    PBRMaterial,
    StandardMaterial,
    HemisphericLight,
    Color3,
    Color4,
    Engine,
    Texture,
    CubeTexture,
    Nullable,
    Vector4,
    InstancedMesh,
    SpriteManager,
    Sprite,
    GroundMesh,
    NodeMaterial,
    DefaultRenderingPipeline,
    UniversalCamera,
    Scalar,
    DirectionalLight,
    ShadowGenerator,
    Axis,
    Camera,
    Vector2
} from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";

function createCamera(scene: Scene) {
    /* Camera Settings */
    const camera = new UniversalCamera("camera", new Vector3(0, 18, -20), scene);
    camera.attachControl(true);
    camera.speed = 0.45;
    camera.inertia = 0.15;

    /* Movement Limits */
    camera.minZ = 0.5;
    const movementLimit = 120;
    scene.onBeforeRenderObservable.add (() => {
        camera.position.x = Scalar.Clamp(camera.position.x, -movementLimit, movementLimit);
        camera.position.z = Scalar.Clamp(camera.position.x, -movementLimit, movementLimit);
    });

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

function createHemiLight(scene: Scene) {
    const hemi = new HemisphericLight("ambient", new Vector3(0,1,0), scene);
    hemi.intensity = 0.25;
    return hemi;
}

function createShadows(scene: Scene, sunLight: DirectionalLight) {
    const shadowGen = new ShadowGenerator(2048, sunLight);
    shadowGen.bias = 0.0005;
    return shadowGen;
}

function createTerrain(scene: Scene) {
    const terrain = MeshBuilder.CreateGroundFromHeightMap(
    "terrain",
    "/assets/heightmaps/terrainHeight.png",
    {
        width: 200,
        height: 200,
        subdivisions: 200,
        maxHeight: 40
    },
    scene
) as GroundMesh;

const terrainMat = new PBRMaterial("terrainMat", scene);
terrainMat.albedoTexture = new Texture("/assets/textures/terrain.jpg", scene);
terrainMat.metallic = 0;
terrainMat.roughness = 1;
terrainMat.environmentBRDFTexture = scene.environmentTexture;
terrain.material = terrainMat;
terrain.receiveShadows = true;

return terrain;
}


function createSky(scene: Scene) {
    const sky = MeshBuilder.CreateSphere("sky", {diameter: 200, sideOrientation: Mesh.BACKSIDE}, scene);
    const skyMat = new StandardMaterial("skyMat", scene);
    const skyTex = new Texture("/assets/textures/skybox.png", scene);
    skyTex.vScale = -1;
    skyMat.diffuseTexture = skyTex;
    skyMat.backFaceCulling = false;
    sky.material = skyMat;

    return sky;
}

function createWater(scene: Scene, sky: Mesh, terrain: Mesh){
    const waterMesh = MeshBuilder.CreateGround("waterMesh", {
        width: 200, 
        height: 200, 
        subdivisions: 32
    }, scene);
	var water = new WaterMaterial("water", scene, new Vector2(200, 200));
	water.backFaceCulling = true;
	water.bumpTexture = new Texture("/assets/textures/waterBump.png", scene);
	water.windForce = -5;
	water.waveHeight = 0.2;
	water.bumpHeight = 0.05;
	water.waterColor = new Color3(0.047, 0.23, 0.015);
	water.colorBlendFactor = 0.5;
	water.addToRenderList(sky);
	water.addToRenderList(terrain);
	waterMesh.material = water;

    waterMesh.position.y = 8;

    return waterMesh;
}

// Base Tree Model
function createTreePrototype(scene: Scene): Mesh{
    // Trunk
    const trunk = MeshBuilder.CreateCylinder("trunk", {
        diameterTop: 0.4,
        diameterBottom: 0.6,
        height:3
    }, scene);
    trunk.position.y = 1.5;

    const trunkMat = new StandardMaterial("trunkMat", scene);
    trunkMat.diffuseTexture = new Texture("/assets/textures/bark.jpg", scene);
    trunkMat.specularColor = new Color3(0,0,0);
    trunkMat.fogEnabled = true;
    trunk.material = trunkMat;

    // Foliage
    const foliageLayers: Mesh[] =[];
    const foliageMat = new StandardMaterial("foliageMat", scene);
    foliageMat.diffuseTexture = new Texture("/assets/textures/leaves.jpg", scene);
    foliageMat.specularColor = new Color3(0,0,0);
    foliageMat.fogEnabled = true;

    const layerCount = 4;
    for (let i = 0; i < layerCount; i++){
        const radius = 3 - i * 0.4;
        const height = 2.4;

        const cone = MeshBuilder.CreateCylinder("foliage", {
            diameterTop: 0,
            diameterBottom: radius,
            height: height,
        }, scene);

        cone.position.y = 2.5 + (i*0.7);
        cone.material = foliageMat;

        foliageLayers.push(cone);
    }

    // Merge Trunk + Foliage
    const mergedTree = Mesh.MergeMeshes(
        [trunk, ...foliageLayers],
        true,
        true,
        undefined,
        false,
        true
    )!;

    mergedTree.setPivotPoint(new Vector3(0,-2.3, 0));

    mergedTree.name = "treePrototype";
    mergedTree.bakeCurrentTransformIntoVertices();

    return mergedTree;
}

function scatterTreesOnTerrain(
    terrain: GroundMesh,
    treePrototype: Mesh,
    shadowGen: ShadowGenerator
) {
    const bbox = terrain.getBoundingInfo().boundingBox;
    const minX = bbox.minimumWorld.x;
    const maxX = bbox.maximumWorld.x;
    const minZ = bbox.minimumWorld.z;
    const maxZ = bbox.maximumWorld.z;

    const count = 150;
    for (let i = 0; i < count;) {
        const x = Scalar.RandomRange(minX,maxX);
        const z = Scalar.RandomRange(minZ,maxZ);

        const y = terrain.getHeightAtCoordinates(x,z);
        if (y === undefined || isNaN(y)) {
            continue;
        }

        const normal = terrain.getNormalAtCoordinates(x, z);
        const slope = Math.abs(Vector3.Dot(normal, Axis.Y));

        if (y < 9) {
            continue;
        }

        if (slope > 0.65) {
            const t = treePrototype.clone("tree" + i);
            t.position.set(x,y,z);
            t.isVisible = true;
            t.setEnabled(true);

            const s = 0.1 + Math.random() * 0.1;
            t.scaling.set(s,s,s);
            t.rotation.y = Math.random() * Math.PI * 2;
            t.receiveShadows = true;
            shadowGen.addShadowCaster(t);


            console.log("Tree Spawned.");
            i++
        };
    }
}

export function createEnvScene(engine: Engine){
    interface SceneData {
        scene: Scene;
        terrain: GroundMesh;
        sky: Mesh;
        hemi: HemisphericLight;
        shadowGen: ShadowGenerator;
        camera: UniversalCamera;
        sunLight: DirectionalLight;
        water: Mesh;
    }

    let that = {} as SceneData;
    that.scene = new Scene(engine);

    /* Scene Settings*/
    that.scene.clearColor = new Color4(0.5, 0.7, 1.0, 1);
    that.scene.fogMode = Scene.FOGMODE_EXP2;
    that.scene.fogDensity = 0.0075;
    that.scene.fogColor = new Color3(0.6, 0.7, 0.8);

    that.sunLight = createSunLight(that.scene);
    that.hemi = createHemiLight(that.scene);
    that.shadowGen = createShadows(that.scene, that.sunLight);
    that.sky = createSky(that.scene);
    that.terrain = createTerrain(that.scene);
    that.water = createWater(that.scene, that.sky, that.terrain);

    let mergedTree = createTreePrototype(that.scene);
    that.terrain.onMeshReadyObservable.add (() => {
        scatterTreesOnTerrain(that.terrain, mergedTree, that.shadowGen);
    })
    let camera = createCamera(that.scene);

    return that;
}

