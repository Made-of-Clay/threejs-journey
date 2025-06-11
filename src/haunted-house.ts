import { Mesh, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Clock, AxesHelper, TextureLoader, SRGBColorSpace, SphereGeometry, MeshStandardMaterial, DirectionalLight, CameraHelper, PlaneGeometry, BoxGeometry, ConeGeometry, LoadingManager, RepeatWrapping, PointLight, PCFSoftShadowMap, Fog, FogExp2 } from 'three'

import './style.css';
import GUI from 'lil-gui';
import { OrbitControls, Sky, Timer } from 'three/examples/jsm/Addons.js';
import { Group } from 'three';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const debugObject: Record<string, any> = {};

// RENDERER
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.1;
controls.enableDamping = true;

// LIGHT
const ambientLight = new AmbientLight('#86cdff', 0.275);

const directionLight = new DirectionalLight('#86cdff', 1);
directionLight.position.set(3, 2, -8);

const doorLight = new PointLight('#ff7d46', 5);
doorLight.position.set(0, 2.2, 2.5);

const dirLightCamHelper = new CameraHelper(directionLight.shadow.camera);
dirLightCamHelper.visible = false;
scene.add(dirLightCamHelper);

scene.add(ambientLight, directionLight, doorLight);

// Ghosts
const ghost1 = new PointLight('#8800ff', 6);
const ghost2 = new PointLight('#ff0088', 6);
const ghost3 = new PointLight('#ff0000', 6);
scene.add(ghost1, ghost2, ghost3);

// TEXTURES
const loadingManager = new LoadingManager(console.log, undefined, console.error);
const textureLoader = new TextureLoader(loadingManager);

const floorAlphaTexture = textureLoader.load('/haunted-house/floor/alpha.webp');
const floorColorTexture = textureLoader.load('/haunted-house/floor/coastSandRocks2/coast_sand_rocks_02_diff_1k.webp');
const floorARMTexture = textureLoader.load('/haunted-house/floor/coastSandRocks2/coast_sand_rocks_02_arm_1k.webp');
const floorNormalTexture = textureLoader.load('/haunted-house/floor/coastSandRocks2/coast_sand_rocks_02_nor_gl_1k.webp');
const floorDisplacementTexture = textureLoader.load('/haunted-house/floor/coastSandRocks2/coast_sand_rocks_02_disp_1k.webp');
floorColorTexture.repeat.set(8, 8);
floorARMTexture.repeat.set(8, 8);
floorNormalTexture.repeat.set(8, 8);
floorDisplacementTexture.repeat.set(8, 8);

floorColorTexture.colorSpace = SRGBColorSpace;

floorColorTexture.wrapS = RepeatWrapping;
floorARMTexture.wrapS = RepeatWrapping;
floorNormalTexture.wrapS = RepeatWrapping;
floorDisplacementTexture.wrapS = RepeatWrapping;

floorColorTexture.wrapT = RepeatWrapping;
floorARMTexture.wrapT = RepeatWrapping;
floorNormalTexture.wrapT = RepeatWrapping;
floorDisplacementTexture.wrapT = RepeatWrapping;

const wallColorTexture = textureLoader.load('/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp');
const wallARMTexture = textureLoader.load('/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp');
const wallNormalTexture = textureLoader.load('/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp');
wallColorTexture.colorSpace = SRGBColorSpace;

const roofColorTexture = textureLoader.load('/haunted-house/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp');
const roofARMTexture = textureLoader.load('/haunted-house/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp');
const roofNormalTexture = textureLoader.load('/haunted-house/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp');
roofColorTexture.colorSpace = SRGBColorSpace;

roofColorTexture.repeat.set(3, 1);
roofARMTexture.repeat.set(3, 1);
roofNormalTexture.repeat.set(3, 1);
roofColorTexture.wrapS = RepeatWrapping;
roofARMTexture.wrapS = RepeatWrapping;
roofNormalTexture.wrapS = RepeatWrapping;

const bushColorTexture = textureLoader.load('/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp');
const bushARMTexture = textureLoader.load('/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp');
const bushNormalTexture = textureLoader.load('/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp');
bushColorTexture.colorSpace = SRGBColorSpace;

bushColorTexture.repeat.set(3, 1);
bushARMTexture.repeat.set(3, 1);
bushNormalTexture.repeat.set(3, 1);
bushColorTexture.wrapS = RepeatWrapping;
bushARMTexture.wrapS = RepeatWrapping;
bushNormalTexture.wrapS = RepeatWrapping;

const graveColorTexture = textureLoader.load('/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp');
const graveARMTexture = textureLoader.load('/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp');
const graveNormalTexture = textureLoader.load('/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp');
graveColorTexture.colorSpace = SRGBColorSpace;

graveColorTexture.repeat.set(0.3, 0.4);
graveARMTexture.repeat.set(0.3, 0.4);
graveNormalTexture.repeat.set(0.3, 0.4);

const doorColorTexture = textureLoader.load('/haunted-house/door/color.webp');
const doorAlphaTexture = textureLoader.load('/haunted-house/door/alpha.webp');
const doorAmbientOcclusionTexture = textureLoader.load('/haunted-house/door/ambientOcclusion.webp');
const doorHeightTexture = textureLoader.load('/haunted-house/door/height.webp');
const doorNormalTexture = textureLoader.load('/haunted-house/door/normal.webp');
const doorMetalnessTexture = textureLoader.load('/haunted-house/door/metalness.webp');
const doorRoughnessTexture = textureLoader.load('/haunted-house/door/roughness.webp');

doorColorTexture.colorSpace = SRGBColorSpace;

// OBJECTS
const material = new MeshStandardMaterial();
material.roughness = 0.4;

const floor = new Mesh(
    new PlaneGeometry(20, 20, 100, 100),
    new MeshStandardMaterial({
        alphaMap: floorAlphaTexture,
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.088,
        displacementBias: -0.175
    }),
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.001).name('Floor Displacement Scale');
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001).name('Floor Displacement Bias');

const house = new Group();
scene.add(house);

const walls = new Mesh(
    new BoxGeometry(4, 2.5, 4),
    new MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture,
    }),
);
walls.position.y = 1.25;
house.add(walls);

const roof = new Mesh(
    new ConeGeometry(3.5, 1.5, 4),
    new MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture,
    }),
);
roof.position.y = 2.5 + 0.75;
roof.rotation.y = Math.PI * 0.25;
house.add(roof);

const door = new Mesh(
    new PlaneGeometry(2.2, 2.2),
    new MeshStandardMaterial({
        map: doorColorTexture,
        alphaMap: doorAlphaTexture,
        transparent: true,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.15,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
    }),
);
door.position.y = 1;
door.position.z = 2.01;
house.add(door);

const bushGeo = new SphereGeometry(1, 16, 16);
const bushMat = new MeshStandardMaterial({
    color: '#ccffcc',
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture,
});

const bush1 = new Mesh(bushGeo, bushMat);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);
bush1.rotation.x = -0.75
house.add(bush1);

const bush2 = new Mesh(bushGeo, bushMat);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);
bush2.rotation.x = -0.75
house.add(bush2);

const bush3 = new Mesh(bushGeo, bushMat);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);
bush3.rotation.x = -0.75
house.add(bush3);

const bush4 = new Mesh(bushGeo, bushMat);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);
bush4.rotation.x = -0.75
house.add(bush4);

const graveGeo = new BoxGeometry(0.6, 0.8, 0.2);
const graveMat = new MeshStandardMaterial({
    map: graveColorTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture,
    normalMap: graveNormalTexture,
});

const graves = new Group();
scene.add(graves);

for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 4;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    const grave = new Mesh(graveGeo, graveMat);
    grave.position.x = x;
    grave.position.y = Math.random() * 0.4;
    grave.position.z = z;
    grave.rotation.x = (Math.random() - 0.5) * 0.4;
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    grave.rotation.z = (Math.random() - 0.5) * 0.4;
    graves.add(grave);
}

// AXIS HELPER
// const axisHelper = new AxesHelper();
// scene.add(axisHelper);

// RENDER
document.body.appendChild(renderer.domElement);

// SHADOWS
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

directionLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
walls.receiveShadow = true;
roof.castShadow = true;
floor.receiveShadow = true;

// SKY
const sky = new Sky();
sky.scale.set(100, 100, 100);
sky.material.uniforms['turbidity'].value = 10;
sky.material.uniforms['rayleigh'].value = 3;
sky.material.uniforms['mieCoefficient'].value = 0.1;
sky.material.uniforms['mieDirectionalG'].value = 0.95;
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95);
scene.add(sky);

scene.fog = new FogExp2('#04343f', 0.1);
// scene.fog = new Fog('#ff0000', 1, 13);

const timer = new Timer();
// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();

    // Ghosts Movement
    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.34) * Math.sin(ghost1Angle * 3.45);

    const ghost2Angle = -elapsedTime * 0.38;
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.34) * Math.sin(ghost2Angle * 3.45);

    const ghost3Angle = elapsedTime * 0.25;
    ghost3.position.x = Math.cos(ghost3Angle) * 6;
    ghost3.position.z = Math.sin(ghost3Angle) * 6;
    ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.34) * Math.sin(ghost3Angle * 3.45);

    for (const grave of graves.children) {
        grave.castShadow = true;
        grave.receiveShadow = true;
    }

    directionLight.shadow.mapSize.width = 256;
    directionLight.shadow.mapSize.height = 256;
    directionLight.shadow.camera.top = 8;
    directionLight.shadow.camera.right = 8;
    directionLight.shadow.camera.bottom = -8;
    directionLight.shadow.camera.left = -8;
    directionLight.shadow.camera.near = 1;
    directionLight.shadow.camera.far = 20;

    ghost1.shadow.mapSize.width = 256;
    ghost1.shadow.mapSize.height = 256;
    ghost1.shadow.camera.far = 10;

    ghost2.shadow.mapSize.width = 256;
    ghost2.shadow.mapSize.height = 256;
    ghost2.shadow.camera.far = 10;

    ghost3.shadow.mapSize.width = 256;
    ghost3.shadow.mapSize.height = 256;
    ghost3.shadow.camera.far = 10;

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
