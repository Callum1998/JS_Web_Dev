import {BABYLON, MATERIALS } from "../core/utils";
import { Scene } from "@babylonjs/core";

export function createEnvironmentScene(engine : BABYLON.Engine): BABYLON.Scene {
    const scene = new BABYLON.Scene(engine);

/* Scene Settings*/
scene.clearColor = new BABYLON.Color4(0.5, 0.7, 1.0, 1);
scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
scene.fogDensity = 0.0075;
scene.fogColor = new BABYLON.Color3(0.6, 0.7, 0.8);

/* Camera Settings */
const camera = new BABYLON.UniversalCamera("playerCam", new BABYLON.Vector3(0, 18, -20), scene);
camera.attachControl(true);
camera.speed = 0.45;
camera.inertia = 0.15;

/* Movement Limits */
camera.minZ = 0.5;
const movementLimit = 120;
scene.onBeforeRenderObservable.add (() => {
    camera.position.x = BABYLON.Scalar.Clamp(camera.position.x, -movementLimit, movementLimit);
    camera.position.z = BABYLON.Scalar.Clamp(camera.position.x, -movementLimit, movementLimit);
});

/* Lighting */
const sunLight = new BABYLON.DirectionalLight(
    "sun",
    new BABYLON.Vector3(-1, -2, -1),
    scene
);
sunLight.intensity = 1.2;

const shadowGen = new BABYLON.ShadowGenerator(2048, sunLight);
shadowGen.bias = 0.0005;

/* Soft Ambiant Fill Light */
const hemi = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0,1,0), scene);
hemi.intensity = 0.25;

/* Sky Sphere (360 degrees) */
const sky = BABYLON.CreateSphere("sky", {diameter: 200, sideOrientation: BABYLON.Mesh.BACKSIDE}, scene);
const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
const skyTex = new BABYLON.Texture("/assets/textures/skybox.png", scene);
skyTex.vScale = -1;
skyMat.diffuseTexture = skyTex;
skyMat.backFaceCulling = false;
sky.material = skyMat;

/* Terrain from Heightmap */
const terrain = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
    "terrain",
    "/assets/heightmaps/terrainHeight.png",
    {
        width: 200,
        height: 200,
        subdivisions: 200,
        maxHeight: 40
    },
    scene
) as BABYLON.GroundMesh;

const terrainMat = new BABYLON.PBRMaterial("terrainMat", scene);
terrainMat.albedoTexture = new BABYLON.Texture("/assets/textures/terrain.jpg", scene);
terrainMat.metallic = 0;
terrainMat.roughness = 1;
terrainMat.environmentBRDFTexture = scene.environmentTexture;
terrain.material = terrainMat;
terrain.receiveShadows = true;

shadowGen.addShadowCaster(terrain);

const water = BABYLON.MeshBuilder.CreateGround("water", {width: 200, height: 200}, scene);
water.position.y = 9; // set slightly below terrain peaks
const waterMat = new BABYLON.PBRMaterial("waterMat", scene);
waterMat.albedoColor = new BABYLON.Color3(0.1, 0.4, 0.6);
waterMat.metallic = 0.0;
waterMat.roughness = 0.1;
waterMat.alpha = 0.7;
water.material = waterMat;

// Add reflection using a mirror texture
const mirror = new BABYLON.MirrorTexture("mirror", { ratio: 1 }, scene, true);
mirror.mirrorPlane = new BABYLON.Plane(0, -1, 0, -water.position.y);
mirror.renderList = [terrain]; // reflect terrain
waterMat.reflectionTexture = mirror;

terrain.onMeshReadyObservable.add(() => {
    console.log("Terrain Ready. Generating Objects...");

    const firTree = createTreePrototype(scene);
    firTree.setEnabled(false);

    scatterTreesOnTerrain(scene, terrain, firTree);
});


/* Environmental Objects (Trees & Rocks) */

// Base Tree Model
function createTreePrototype(scene:BABYLON.Scene): BABYLON.Mesh{
    // Trunk
    const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
        diameterTop: 0.4,
        diameterBottom: 0.6,
        height:3
    }, scene);
    trunk.position.y = 1.5;

    const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
    trunkMat.diffuseTexture = new BABYLON.Texture("/assets/textures/bark.jpg", scene);
    trunkMat.specularColor = new BABYLON.Color3(0,0,0);
    trunkMat.fogEnabled = true;
    trunk.material = trunkMat;

    // Foliage
    const foliageLayers: BABYLON.Mesh[] =[];
    const foliageMat = new BABYLON.StandardMaterial("foliageMat", scene);
    foliageMat.diffuseTexture = new BABYLON.Texture("/assets/textures/leaves.jpg", scene);
    foliageMat.specularColor = new BABYLON.Color3(0,0,0);
    foliageMat.fogEnabled = true;

    const layerCount = 4;
    for (let i = 0; i < layerCount; i++){
        const radius = 3 - i * 0.4;
        const height = 2.4;

        const cone = BABYLON.MeshBuilder.CreateCylinder("foliage", {
            diameterTop: 0,
            diameterBottom: radius,
            height: height,
        }, scene);

        cone.position.y = 2.5 + (i*0.7);
        cone.material = foliageMat;

        foliageLayers.push(cone);
    }

    // Merge Trunk + Foliage
    const mergedTree = BABYLON.Mesh.MergeMeshes(
        [trunk, ...foliageLayers],
        true,
        true,
        undefined,
        false,
        true
    )!;

    mergedTree.setPivotPoint(new BABYLON.Vector3(0,-2.3, 0));

    mergedTree.name = "treePrototype";
    mergedTree.bakeCurrentTransformIntoVertices();

    return mergedTree;
}



function scatterTreesOnTerrain(
    scene: BABYLON.Scene,
    terrain: BABYLON.GroundMesh,
    treePrototype: BABYLON.Mesh
) {
    const bbox = terrain.getBoundingInfo().boundingBox;
    const minX = bbox.minimumWorld.x;
    const maxX = bbox.maximumWorld.x;
    const minZ = bbox.minimumWorld.z;
    const maxZ = bbox.maximumWorld.z;

    const count = 150;
    for (let i = 0; i < count;) {
        const x = BABYLON.Scalar.RandomRange(minX,maxX);
        const z = BABYLON.Scalar.RandomRange(minZ,maxZ);

        const y = terrain.getHeightAtCoordinates(x,z);
        if (y === undefined || isNaN(y)) continue;

        const normal = terrain.getNormalAtCoordinates(x, z);
        const slope = Math.abs(BABYLON.Vector3.Dot(normal, BABYLON.Axis.Y));

        if (y < 9) continue;

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

return scene;


}