import { Size } from "@babylonjs/core";
import { BABYLON } from "../core/utils";

interface CelestialBody {
    mesh: BABYLON.Mesh;
    pivot: BABYLON.TransformNode; // pivot for orbiting
    orbitSpeed: number; //radians per frame
    moons?: CelestialBody[];
}

export function createSolarSystem(scene: BABYLON.Scene): CelestialBody[] {
    const bodies: CelestialBody[] = [];

    // Create a large inverted sphere as a starfield background
    const skyDome = BABYLON.MeshBuilder.CreateSphere("skyDome", { segments: 64, diameter: 100 }, scene);
    // Apply material to show stars on the inside
    const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
    skyMat.backFaceCulling = false; // render inside faces
    skyMat.diffuseTexture = new BABYLON.Texture("/assets/textures/space.jpg", scene);
    skyMat.diffuseTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;
    skyMat.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05); // so it glows regardless of lighting

    skyDome.material = skyMat;


    // Create the Sun
    const sun = BABYLON.MeshBuilder.CreateSphere("Sun", {diameter: 2}, scene);
    const sunMat = new BABYLON.StandardMaterial("sunMat", scene);
    sunMat.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
    sunMat.specularColor = new BABYLON.Color3(0,0,0);
    sunMat.diffuseTexture = new BABYLON.Texture('/assets/textures/sun.jpg', scene);
    sun.material = sunMat;
    sun.position = BABYLON.Vector3.Zero();

    const sunLight = new BABYLON.PointLight("SunLight", BABYLON.Vector3.Zero(), scene);
    sunLight.intensity = 2.0;
    sunLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
    sunLight.specular = new BABYLON.Color3(1, 1, 0.8);

    sunLight.range = 100;
    sunLight.radius = 2.1;
    sunLight.falloffType = BABYLON.Light.FALLOFF_PHYSICAL;

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
        const pivot = new BABYLON.TransformNode('&{p.name}_pivot', scene);
        pivot.position = BABYLON.Vector3.Zero();

        const planet = BABYLON.MeshBuilder.CreateSphere(p.name, { diameter: p.size }, scene);
        planet.position = new BABYLON.Vector3(p.distance, 0, 0);

        const mat = new BABYLON.StandardMaterial(`${p.name}_mat`, scene);

        if (p.diffuse) mat.diffuseTexture = new BABYLON.Texture(`/assets/textures/${p.diffuse}`, scene, false, false);

        mat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        mat.specularPower = 32;

        planet.material = mat;

        planet.parent = pivot;

        // Add moon for earth
        let moons: CelestialBody[] = [];
        if (p.name === "earth") {
            const moonPivot = new BABYLON.TransformNode("Moon_pivot", scene);
            moonPivot.parent = pivot;
            moonPivot.position = planet.position.clone();

            const moon = BABYLON.MeshBuilder.CreateSphere("Moon", { diameter: 0.2 }, scene);
            moon.position = new BABYLON.Vector3(1, 0, 0); // relative to pivot
            moon.parent = moonPivot;

            const moonMat = new BABYLON.StandardMaterial("moonMat", scene);
            moonMat.diffuseTexture = new BABYLON.Texture(`/assets/textures/moon.jpg`, scene, false, false);
            moonMat.bumpTexture = new BABYLON.Texture(`/assets/heightmaps/moonHeight.jpg`, scene);
            moonMat.bumpTexture.level = 0.5;

            moons.push({ mesh: moon, pivot: moonPivot, orbitSpeed: 0.003 });
        }

        if (p.name === "saturn") {
            const ring = BABYLON.MeshBuilder.CreateTorus(
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

    return bodies;
}