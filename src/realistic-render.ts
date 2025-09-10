import { PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, GridHelper, DirectionalLight, Clock, AmbientLight, SphereGeometry, Mesh, MeshBasicMaterial, Raycaster, Vector3, Vector2, Group, type Object3DEventMap, TorusKnotGeometry, CubeTextureLoader, MeshStandardMaterial, EquirectangularReflectionMapping, SRGBColorSpace, TorusGeometry, WebGLCubeRenderTarget, FloatType, HalfFloatType, CubeCamera, Color, ACESFilmicToneMapping, NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, PCFSoftShadowMap, CameraHelper, Plane, PlaneGeometry } from 'three';

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
        updateAllMaterials();
    }
);

const floorColorTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg');
const floorNormalTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png');
const floorAORoughnessMetalnessTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg');

floorColorTexture.colorSpace = SRGBColorSpace;

const floor = new Mesh(
    new PlaneGeometry(8, 8),
    new MeshStandardMaterial({
        map: floorColorTexture,
        normalMap: floorNormalTexture,
        aoMap: floorAORoughnessMetalnessTexture,
        roughnessMap: floorAORoughnessMetalnessTexture,
        metalnessMap: floorAORoughnessMetalnessTexture,
    }),
);
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

const wallColorTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg');
const wallNormalTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png');
const wallAORoughnessMetalnessTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg');

wallColorTexture.colorSpace = SRGBColorSpace;

const wall = new Mesh(
    new PlaneGeometry(8, 8),
    new MeshStandardMaterial({
        map: wallColorTexture,
        normalMap: wallNormalTexture,
        aoMap: wallAORoughnessMetalnessTexture,
        roughnessMap: wallAORoughnessMetalnessTexture,
        metalnessMap: wallAORoughnessMetalnessTexture,
    }),
);
wall.position.y = 4;
wall.position.z = -4;
scene.add(wall);

gltfLoader.load(
    '/models/hamburger.glb',
    (gltf) => {
        gltf.scene.scale.set(0.4, 0.4, 0.4);
        gltf.scene.position.set(3.5, 0, 0);
        scene.add(gltf.scene);
        updateAllMaterials();
    },
);

// ENVIRONMENT MAP
// KDR cube texture
const envMap = cubeTextureLoader.load([
    '/environmentMaps/0/px.png',
    '/environmentMaps/0/nx.png',
    '/environmentMaps/0/py.png',
    '/environmentMaps/0/ny.png',
    '/environmentMaps/0/pz.png',
    '/environmentMaps/0/nz.png',
]);
scene.environment = envMap;
scene.background = envMap;

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
const dirLight = new DirectionalLight('#fff', 6);
dirLight.position.set(3, 7, 6);
dirLight.castShadow = true;
dirLight.target.position.set(0, 4, 0);
dirLight.target.updateWorldMatrix(false, false);
dirLight.shadow.camera.far = 15;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.normalBias = 0.027;
dirLight.shadow.bias = -0.004;
scene.add(dirLight);

gui.add(dirLight, 'intensity').min(0).max(10).step(0.001).name('Light Intensity');
gui.add(dirLight.position, 'x').min(-10).max(10).step(0.001).name('Light X');
gui.add(dirLight.position, 'y').min(-10).max(10).step(0.001).name('Light Y');
gui.add(dirLight.position, 'z').min(-10).max(10).step(0.001).name('Light Z');
gui.add(dirLight.shadow, 'normalBias').min(-0.05).max(0.05).step(0.001);
gui.add(dirLight.shadow, 'bias').min(-0.05).max(0.05).step(0.001);

const dirLightHelper = new CameraHelper(dirLight.shadow.camera);
dirLightHelper.visible = false;
scene.add(dirLightHelper);

gui.add(dirLightHelper, 'visible');

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
    // if (holyDonut) {
    //     holyDonut.rotation.x = Math.sin(elapsedTime) * 2;
    //     cubeCamera.update(renderer, scene);
    // }

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
