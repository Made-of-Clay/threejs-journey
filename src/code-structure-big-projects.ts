import { PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, GridHelper, DirectionalLight, Clock, AmbientLight, SphereGeometry, Mesh, MeshBasicMaterial, Raycaster, Vector3, Vector2, Group, type Object3DEventMap, TorusKnotGeometry, CubeTextureLoader, MeshStandardMaterial, EquirectangularReflectionMapping, SRGBColorSpace, TorusGeometry, WebGLCubeRenderTarget, FloatType, HalfFloatType, CubeCamera, Color, ACESFilmicToneMapping, NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, PCFSoftShadowMap, CameraHelper, Plane, PlaneGeometry, AnimationMixer } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { EXRLoader, GLTFLoader, GroundedSkybox, RGBELoader, Timer, type GLTF } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { TorusKnot } from 'three/examples/jsm/curves/CurveExtras.js';

const scene = new Scene();

function updateAllMaterials() {
    scene.traverse(child => {
        if ((child as any).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
}

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {};

// TEXTURES
const loadingManager = new LoadingManager(console.log, undefined, console.error);
const textureLoader = new TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new CubeTextureLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);
const exrLoader = new EXRLoader(loadingManager);


// ENVIRONMENT MAP
// KDR cube texture
const envMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png',
]);
scene.environment = envMap;
scene.background = envMap;

envMap.colorSpace = SRGBColorSpace;

// scene.background = environmentMap
scene.environment = envMap;

params.envMapIntensity = 0.4;
gui.add(params, 'envMapIntensity').min(0).max(4).step(0.001).onChange(updateAllMaterials);

let foxMixer: AnimationMixer;

gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        gltf.scene.scale.set(0.02, 0.02, 0.02);
        scene.add(gltf.scene);

        foxMixer = new AnimationMixer(gltf.scene);
        const foxAction = foxMixer.clipAction(gltf.animations[0]);
        foxAction.play();

        updateAllMaterials();
    },
);

// RENDERER
const renderer = new WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

renderer.toneMapping = ReinhardToneMapping;
renderer.toneMappingExposure = 3;

gui.add(renderer, 'toneMapping', {
    No: NoToneMapping,
    Linear: LinearToneMapping,
    Reinhard: ReinhardToneMapping,
    Cineon: CineonToneMapping,
    ACESFilmic: ACESFilmicToneMapping,
});
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001);

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
const dirLight = new DirectionalLight('#fff', 4);
dirLight.castShadow = true;
dirLight.shadow.camera.far = 15;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.normalBias = 0.027;
dirLight.position.set(3.5, 2, -1.25);
scene.add(dirLight);

gui.add(dirLight, 'intensity').min(0).max(10).step(0.001).name('Light Intensity');
gui.add(dirLight.position, 'x').min(-10).max(10).step(0.001).name('Light X');
gui.add(dirLight.position, 'y').min(-10).max(10).step(0.001).name('Light Y');
gui.add(dirLight.position, 'z').min(-10).max(10).step(0.001).name('Light Z');

// const ambientLight = new AmbientLight('white', 0.25);
// scene.add(ambientLight);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

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

    foxMixer?.update(deltaTime);

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
