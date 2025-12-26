import { ArcRotateCamera, Color3, Color4, CreateAudioEngineAsync, CreateSoundAsync, Engine, GlowLayer, HemisphericLight, Light, Mesh, MeshBuilder, PointLight, Scene, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";

export function createSolarScene(engine: Engine) {

    interface SceneData {
        scene: Scene;
        camera: ArcRotateCamera;
        glow: GlowLayer;
        hemi: HemisphericLight;
        sky: Mesh;
        startAudio?: () => void;
        stopAudio?: () => void;
    }

    let that = {} as SceneData;
    that.scene = new Scene(engine);

    that.scene.clearColor = new Color4(0.2, 0.2, 0.2, 1);
    that.scene.ambientColor = new Color3(0.1,0.1,0.1);

    that.camera = createCamera(that.scene);
    that.glow = createGlowLayer(that.scene);
    that.hemi = createHemiLight(that.scene);
    that.sky = createSkyDome(that.scene);

    createSolarSystem(that.scene);

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

function createCamera(scene: Scene){
    const camera = new ArcRotateCamera(
    "cam",
     -Math.PI / 2,
     Math.PI / 2.5,
     30,
    Vector3.Zero(), 
    scene
  );
  camera.attachControl(true);

  camera.inertia = 0.8;
  camera.panningInertia = 0.9;

  // limit zoom so you don’t clip through planets
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 200;

  // better zoom speed curve
  camera.wheelPrecision = 50;
  camera.pinchPrecision = 100;
  
  return camera;
}

function createGlowLayer(scene: Scene) {
    const glow = new GlowLayer("glow", scene);
    glow.intensity = 0.6;
    return glow;
}

function createHemiLight(scene: Scene) {
    const hemiLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.15; // keep it very soft
  hemiLight.diffuse = new Color3(0.4, 0.4, 0.5); // cool tone for space feel
  hemiLight.groundColor = new Color3(0.1, 0.1, 0.15);
  hemiLight.specular = new Color3(0, 0, 0); // prevent extra shininess

  return hemiLight;
}

function createSkyDome(scene: Scene) {
    // Create a large inverted sphere as a starfield background
    const skyDome = MeshBuilder.CreateSphere("skyDome", { segments: 64, diameter: 100 }, scene);
    // Apply material to show stars on the inside
    const skyMat = new StandardMaterial("skyMat", scene);
    skyMat.backFaceCulling = false; // render inside faces
    skyMat.diffuseTexture = new Texture("/assets/textures/space.jpg", scene);
    skyMat.diffuseTexture.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MODE;
    skyMat.emissiveColor = new Color3(0.05, 0.05, 0.05); // so it glows regardless of lighting

    skyDome.material = skyMat;

    return skyDome;
}

function createSolarSystem(scene: Scene){

    interface CelestialBody {
        mesh: Mesh;
        pivot: TransformNode;
        orbitSpeed: number;
        moons?: CelestialBody[];
    }

    let bodies: CelestialBody[] = [];

    // Create the Sun
        const sun = MeshBuilder.CreateSphere("Sun", {diameter: 2}, scene);
        const sunMat = new StandardMaterial("sunMat", scene);
        sunMat.emissiveColor = new Color3(1, 0.8, 0);
        sunMat.specularColor = new Color3(0,0,0);
        sunMat.diffuseTexture = new Texture('/assets/textures/sun.jpg', scene);
        sun.material = sunMat;
        sun.position = Vector3.Zero();
    
        const sunLight = new PointLight("SunLight", Vector3.Zero(), scene);
        sunLight.intensity = 2.0;
        sunLight.diffuse = new Color3(1, 0.9, 0.7);
        sunLight.specular = new Color3(1, 1, 0.8);
    
        sunLight.range = 100;
        sunLight.radius = 2.1;
        sunLight.falloffType = Light.FALLOFF_PHYSICAL;
    
        // Setting up the planets
        const planetData = [
            { name: "mercury", size: 0.3, distance: 3, speed: 0.002, diffuse: "mercury.jpg"},
            { name: "venus", size: 0.5, distance: 5, speed: 0.0015, diffuse: "venus.jpg"},
            { name: "earth", size: 0.6, distance: 7, speed: 0.001, diffuse: "earth.jpg"},
            { name: "mars", size: 0.4, distance: 9, speed: 0.0008, diffuse: "mars.jpg"},
            { name: "jupiter", size: 1.2,  distance: 12, speed: 0.0012, diffuse: "jupiter.jpg" },
            { name: "saturn", size: 1, distance: 16, speed: 0.0005, diffuse: "saturn.jpg"},
            { name: "uranus",  size: 0.8,  distance: 20, speed: 0.0008, diffuse: "uranus.jpg"},
            { name: "neptune", size: 0.75, distance: 24, speed: 0.0007, diffuse: "neptune.jpg"},
            { name: "pluto",   size: 0.2,  distance: 28, speed: 0.0006, diffuse: "pluto.jpg"},
        ];
    
        planetData.forEach((p) => {
            // pivot node at centre of sun for orbiting
            const pivot = new TransformNode('&{p.name}_pivot', scene);
            pivot.position = Vector3.Zero();
    
            const planet = MeshBuilder.CreateSphere(p.name, { diameter: p.size }, scene);
            planet.position = new Vector3(p.distance, 0, 0);
    
            const mat = new StandardMaterial(`${p.name}_mat`, scene);
    
            if (p.diffuse) mat.diffuseTexture = new Texture(`/assets/textures/${p.diffuse}`, scene, false, false);
    
            mat.specularColor = new Color3(0.05, 0.05, 0.05);
            mat.specularPower = 32;
    
            planet.material = mat;
    
            planet.parent = pivot;
    
            // Add moon for earth
            let moons: CelestialBody[] = [];
            if (p.name === "earth") {
                const moonPivot = new TransformNode("Moon_pivot", scene);
                moonPivot.parent = pivot;
                moonPivot.position = planet.position.clone();
    
                const moon = MeshBuilder.CreateSphere("Moon", { diameter: 0.2 }, scene);
                moon.position = new Vector3(1, 0, 0); // relative to pivot
                moon.parent = moonPivot;
    
                const moonMat = new StandardMaterial("moonMat", scene);
                moonMat.diffuseTexture = new Texture(`/assets/textures/moon.jpg`, scene, false, false);
                moonMat.bumpTexture = new Texture(`/assets/heightmaps/moonHeight.png`, scene);
                moonMat.bumpTexture.level = 0.5;
    
                moons.push({ mesh: moon, pivot: moonPivot, orbitSpeed: 0.003 });
            }
    
            if (p.name === "saturn") {
                const ring = MeshBuilder.CreateTorus(
                    "SaturnRing",
                    { diameter: 2, thickness: 0.05, tessellation: 50},
                    scene
                );
                ring.parent = planet;
            }

            bodies.push({ mesh: planet, pivot, orbitSpeed: p.speed, moons });
        });
    
        // Animate Orbits
        scene.onBeforeRenderObservable.add(() => {
            bodies.forEach((body) => {
                body.pivot.rotation.y += body.orbitSpeed; // Planets around the sun
                body.mesh.rotation.y += 0.005; // planet self-rotation
                body.moons?.forEach((moon) => {
                    moon.pivot.rotation.y += moon.orbitSpeed;
                });
            });
        });
}