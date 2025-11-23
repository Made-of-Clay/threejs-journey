import { PerspectiveCamera, Scene, WebGLRenderer, GridHelper, DirectionalLight, Clock, Mesh, PlaneGeometry, MeshStandardMaterial, AxesHelper, RawShaderMaterial, BufferAttribute, BufferGeometry, Vector2, Color, TextureLoader, LoadingManager, ShaderMaterial, MeshBasicMaterial, CubeTextureLoader, PCFShadowMap, ReinhardToneMapping, WebGLRenderTarget } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { DotScreenPass, GammaCorrectionShader, GlitchPass, GLTFLoader, RenderPass, RGBShiftShader, ShaderPass, Timer } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
console.log(EffectComposer)
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

const renderTarget = new WebGLRenderTarget(
    800,
    600,
    { samples: renderer.getPixelRatio() === 1 ? 2 : 0 },
);

const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(window.innerWidth, window.innerHeight);

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 3;

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);

const glitchPass = new GlitchPass();
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);
glitchPass.goWild = false;

const rgbShiftPass = new ShaderPass(RGBShiftShader);
effectComposer.addPass(rgbShiftPass);
rgbShiftPass.enabled = false;

// Gamma Correction Pass
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);
gammaCorrectionPass.enabled = false;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// LIGHT
const dirLight = new DirectionalLight('#fff', 4);
dirLight.position.set(0, 0, 10);
scene.add(dirLight);

// LOADERS
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new CubeTextureLoader();
const textureLoader = new TextureLoader();

/**
 * Update all materials
 */
function updateAllMaterials() {
    scene.traverse((child) => {
        if(child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
            child.material.envMapIntensity = 2.5;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg',
])

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load(
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(2, 2, 2);
        gltf.scene.rotation.y = Math.PI * 0.5;
        scene.add(gltf.scene);

        updateAllMaterials();
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

    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const gridHelper = new GridHelper(10, 10, '#aaa', '#aaa');
gridHelper.visible = false;
scene.add(gridHelper);
gui.add(gridHelper, 'visible').name('Show Grid Helper');

const axesHelper = new AxesHelper();
axesHelper.visible = false;
scene.add(axesHelper);
gui.add(axesHelper, 'visible').name('Show Axes Helper');

// OBJECTS

// RENDER
document.body.appendChild(renderer.domElement);

const timer = new Timer();
let previousTime = 0;

// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    controls.update();

    // renderer.render(scene, camera);
    effectComposer.render();
}
renderer.setAnimationLoop(animate);
