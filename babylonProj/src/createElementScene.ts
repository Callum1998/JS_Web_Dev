import * as BABYLON from "@babylonjs/core"
  
  export const createScene = (engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.6, 0.8, 1.0, 0.8) // Colour the Sky

  // Set up Camera
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 4,
    Math.PI / 3,
    20,
    new BABYLON.Vector3(0,3,0),
    scene
  );
  camera.attachControl(canvas, true)

  // Adjust Camera Limits
  camera.lowerRadiusLimit = 5; // minimum zoom distance
  camera.upperRadiusLimit = 50; // maximum zoom distance
  camera.lowerBetaLimit = 0.1; // prevents flipping below ground
  camera.upperBetaLimit = Math.PI /2; // prevents going all the way above
  camera.wheelPrecision = 50;    // make zooming slower (higher = slower)

  // Camera Inertia Smoothing
  camera.inertia = 0.8; // smooth camera rotation (0 = instant)
  camera.panningInertia = 0.9;

  // Setting up Lighting
  const hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0,1,0), scene)
  hemiLight.intensity = 0.6;
  const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-2,-5,-2), scene)
  dirLight.position = new BABYLON.Vector3(10,10,10);
  dirLight.intensity = 0.8;

  // Setting up Shadows
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  // Create Ground
  const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 40, height: 40}, scene);
  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.diffuseTexture = new BABYLON.Texture("/babylonAssets/grass.png", scene);
  ground.material = groundMat;
  ground.receiveShadows = true;

  // Create Foundation Shapes
  const castleMat = new BABYLON.StandardMaterial("castleMat", scene);
  castleMat.diffuseTexture = new BABYLON.Texture("/babylonAssets/brick.png", scene);

  const base = BABYLON.MeshBuilder.CreateBox("base", {width:6, height:3, depth:6}, scene);
  base.position.y = 1.5;
  base.material = castleMat;
  shadowGenerator.addShadowCaster(base);
  
  // Create some towers
  const towerMat = new BABYLON.StandardMaterial("towerMat", scene)
  towerMat.diffuseTexture = new BABYLON.Texture("/babylonAssets/tower.png", scene)
  const roofMat =  new BABYLON.StandardMaterial("roofMat", scene)
  roofMat.diffuseTexture = new BABYLON.Texture("/babylonAssets/roof.png", scene)

  // Positions of towers
  const towerPositions = [
    [-3,1.5,-3],
    [3,1.5,-3],
    [-3,1.5,3],
    [3,1.5,3],
  ];

  towerPositions.forEach(pos => {
    const tower = BABYLON.MeshBuilder.CreateCylinder("tower", {diameter: 1.5, height: 5, tessellation: 12}, scene);
    tower.position.set(pos[0], 2.5, pos[2]);
    tower.material = towerMat;
    shadowGenerator.addShadowCaster(tower);

    // Add Roof
    const roof = BABYLON.MeshBuilder.CreateCylinder("roof", {diameterTop: 0, diameterBottom: 2, height: 2}, scene);
    roof.position.set(pos[0], 5.5, pos[2]);
    roof.material = roofMat;
    shadowGenerator.addShadowCaster(roof);
  });

  // Create Door
  const door = BABYLON.MeshBuilder.CreateBox("door", {width: 1.5, height: 2, depth: 0.2}, scene);
  door.position.set(0,1,3.1);
  const doorMat = new BABYLON.StandardMaterial("doorMat", scene);
  doorMat.diffuseTexture = new BABYLON.Texture("/babylonAssets/wood.jpg", scene);
  door.material = doorMat;

  // Create a waving flag
  const pole = BABYLON.MeshBuilder.CreateCylinder("pole", {diameter: 0.1, height: 3}, scene);
  pole.position.set(0,4.5,0);
  const flag = BABYLON.MeshBuilder.CreatePlane("flag", {width: 1.5, height: 1, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
  flag.position.set(0.75, 1, 0);

  const flagMat = new BABYLON.StandardMaterial("flagMat", scene);
  flagMat.diffuseTexture = new BABYLON.Texture("/babylonAssets/flag.png", scene);
  flag.material = flagMat;
  flag.parent = pole

  shadowGenerator.addShadowCaster(pole);
  shadowGenerator.addShadowCaster(flag);

  // Add motion to the flag
  scene.onBeforeRenderObservable.add(() => {
    pole.rotation.y += 0.003;
  });

  return scene;

};


