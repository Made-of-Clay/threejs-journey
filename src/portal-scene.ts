import { PerspectiveCamera, Scene, WebGLRenderer, GridHelper, DirectionalLight, Mesh, MeshStandardMaterial, AxesHelper, TextureLoader, CubeTextureLoader, PCFShadowMap, ReinhardToneMapping, WebGLRenderTarget, PlaneGeometry, MeshBasicMaterial, ShaderMaterial, LoadingManager, Vector3, Raycaster, Vector2, SRGBColorSpace } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { DRACOLoader, GLTFLoader, Timer } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import {gsap} from 'gsap';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {};

// RENDERER
const renderer = new WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.toneMapping = ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;

// LOADERS
let isSceneReady = false;
const loadingManager = new LoadingManager(console.log, undefined, console.error);
// const cubeTextureLoader = new CubeTextureLoader();

const textureLoader = new TextureLoader(loadingManager);

const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath('draco/');

const gltfLoader = new GLTFLoader(loadingManager);

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 5;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// LIGHT
const dirLight = new DirectionalLight('#fff', 4);
dirLight.position.set(0, 0, 10);
scene.add(dirLight);

// TEXTURES
const bakedTexture = textureLoader.load('/portal/baked.jpg');
bakedTexture.flipY = false;
bakedTexture.colorSpace = SRGBColorSpace;

// MATERIALS
const bakedMaterial = new MeshBasicMaterial({ map: bakedTexture });
const poleLightMaterial = new MeshBasicMaterial({ color: '#ffffe5' });

/**
 * Models
 */
const emissiveElements = ['Light001', 'Light003', 'Gateway'];
gltfLoader.load(
    '/portal/portal.glb',
    (gltf) => {
        gltf.scene.traverse((child) => {
            // Light001, Light003, Gateway
            // Emmissive materials
            if (child instanceof Mesh) {
                child.material = bakedMaterial;
            }
        });
        const poleLight1 = gltf.scene.getObjectByName('Light001') as Mesh;
        const poleLight2 = gltf.scene.getObjectByName('Light003') as Mesh;
        const portalLight = gltf.scene.getObjectByName('Gateway') as Mesh;
        poleLight1.material = poleLightMaterial;
        poleLight2.material = poleLightMaterial;
        portalLight.material = poleLightMaterial;
        scene.add(gltf.scene);
    }
);

/**
 * Lights
 */
const directionalLight = new DirectionalLight('#ffffff', 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, - 2.25);
scene.add(directionalLight);

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

const gridHelper = new GridHelper(10, 10, '#aaa', '#aaa');
gridHelper.visible = false;
scene.add(gridHelper);
gui.add(gridHelper, 'visible').name('Show Grid Helper');

const axesHelper = new AxesHelper();
axesHelper.visible = false;
scene.add(axesHelper);
gui.add(axesHelper, 'visible').name('Show Axes Helper');

// RENDER
document.body.prepend(renderer.domElement);

const timer = new Timer();
let previousTime = 0;

// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    deltaTime;
    previousTime = elapsedTime;

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
