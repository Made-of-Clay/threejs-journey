import { PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, GridHelper, DirectionalLight, Clock, AmbientLight, SphereGeometry, Mesh, MeshBasicMaterial, Raycaster, Vector3, Vector2, Group, type Object3DEventMap, TorusKnotGeometry, CubeTextureLoader, MeshStandardMaterial, EquirectangularReflectionMapping, SRGBColorSpace, TorusGeometry, WebGLCubeRenderTarget, FloatType, HalfFloatType, CubeCamera, Color } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { EXRLoader, GLTFLoader, GroundedSkybox, RGBELoader, Timer, type GLTF } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { TorusKnot } from 'three/examples/jsm/curves/CurveExtras.js';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {
};

// TEXTURES
const loadingManager = new LoadingManager(console.log, undefined, console.error);
const textureLoader = new TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new CubeTextureLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);
const exrLoader = new EXRLoader(loadingManager);

gltfLoader.load(
    'models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10);
        scene.add(gltf.scene);
    }
);

// ENVIRONMENT MAP
// KDR cube texture
// const envMap = cubeTextureLoader.load([
//     '/environmentMaps/0/px.png',
//     '/environmentMaps/0/nx.png',
//     '/environmentMaps/0/py.png',
//     '/environmentMaps/0/ny.png',
//     '/environmentMaps/0/pz.png',
//     '/environmentMaps/0/nz.png',
// ]);
// scene.environment = envMap;
// scene.background = envMap;

// HDR (RHBE) equirectangular
// rgbeLoader.load('/environmentMaps/my2-blender-2k.hdr', (envMap) => {
//     envMap.mapping = EquirectangularReflectionMapping;
//     scene.background = envMap;
//     scene.environment = envMap;
//     console.log(envMap);
// });

// HDR (EXR) Loader
// exrLoader.load('/environmentMaps/nvidiaCanvas-4k.exr', envMap => {
//     envMap.mapping = EquirectangularReflectionMapping;
//     scene.background = envMap;
//     scene.environment = envMap;
// })

// LDR Equirectangular
// const envMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg');
// envMap.mapping = EquirectangularReflectionMapping;
// envMap.colorSpace = SRGBColorSpace;
// scene.background = envMap;
// scene.environment = envMap;

// HDR (RHBE) equirectangular
// rgbeLoader.load('/environmentMaps/2/2k.hdr', (envMap) => {
//     envMap.mapping = EquirectangularReflectionMapping;
//     scene.environment = envMap;
//     const skybox = new GroundedSkybox(envMap, 15, 70);
//     skybox.position.y = 15;
//     scene.add(skybox);
// });

// REAL TIME ENV MAP
const envMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg');
envMap.mapping = EquirectangularReflectionMapping;
envMap.colorSpace = SRGBColorSpace;
scene.background = envMap;

const holyDonut = new Mesh(
    new TorusGeometry(8, 0.5),
    new MeshBasicMaterial({ color: new Color(10, 4, 2) }),
);
holyDonut.position.y = 3.5;
holyDonut.layers.enable(1);
scene.add(holyDonut);

const cubeRenderTarget = new WebGLCubeRenderTarget(256, {
    type: HalfFloatType,
});
scene.environment = cubeRenderTarget.texture;

const cubeCamera = new CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1);

scene.environmentIntensity = 1;
scene.backgroundBlurriness = 0;
scene.backgroundIntensity = 1;

gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001);
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001);
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001);
gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('Background Rotation');
gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('Environment Rotation');

// OBJECTS
const torusKnot = new Mesh(
    new TorusKnotGeometry(1, 0.4, 100, 16),
    new MeshStandardMaterial({ roughness: 0.3, metalness: 1, color: 0xaaaaaa }),
);
torusKnot.position.x = -4;
torusKnot.position.y = 4;
scene.add(torusKnot);

// RENDERER
const renderer = new WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 1;
camera.position.y = 7;
camera.position.z = 10;

// CONTROLS
// orbital controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// LIGHT
const dirLight = new DirectionalLight('#fff', 3);
dirLight.position.set(1, 1, 0);
dirLight.castShadow = true;
scene.add(dirLight);

const ambientLight = new AmbientLight('white', 0.25);
scene.add(ambientLight);

// GRID
const gridHelper = new GridHelper(10, 10, '#aaa', '#aaa');
gridHelper.visible = false;
scene.add(gridHelper);
gui.add(gridHelper, 'visible').name('Show Grid Helper');

// RENDER
document.body.appendChild(renderer.domElement);

const timer = new Timer();
const clock = new Clock();
let previousTime = 0;

// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Real time env map
    if (holyDonut) {
        holyDonut.rotation.x = Math.sin(elapsedTime) * 2;
        cubeCamera.update(renderer, scene);
    }

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
