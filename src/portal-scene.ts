import { PerspectiveCamera, Scene, WebGLRenderer, GridHelper, DirectionalLight, Mesh, AxesHelper, TextureLoader, PCFShadowMap, ReinhardToneMapping, MeshBasicMaterial, LoadingManager, SRGBColorSpace, BufferGeometry, BufferAttribute, PointsMaterial, Points, ShaderMaterial, AdditiveBlending, Color } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { DRACOLoader, GLTFLoader, Timer } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import firefliesVertexShader from './shaders/fireflies/vertex.glsl?raw';
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl?raw';
import portalVertexShader from './shaders/portal/vertex.glsl?raw';
import portalFragmentShader from './shaders/portal/fragment.glsl?raw';

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

params.clearColor = '#231c0b';
renderer.setClearColor(params.clearColor);
gui.addColor(params, 'clearColor').onChange(() => {
    renderer.setClearColor(params.clearColor);
});

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
const portalLightMaterial = new ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColorStart: { value: new Color('#918b6e') },
        uColorEnd: { value: new Color('#dee8c9') },
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
});

params.portalColorStart = portalLightMaterial.uniforms.uColorStart.value;
params.portalColorEnd = portalLightMaterial.uniforms.uColorEnd.value;

gui.addColor(params, 'portalColorStart').onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(params.portalColorStart);
});
gui.addColor(params, 'portalColorEnd').onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(params.portalColorEnd);
});

/**
 * Models
 */
gltfLoader.load(
    '/portal/portal.glb',
    (gltf) => {
        const bakedMesh = gltf.scene.getObjectByName('Baked') as Mesh;
        const poleLight1 = gltf.scene.getObjectByName('Light001') as Mesh;
        const poleLight2 = gltf.scene.getObjectByName('Light003') as Mesh;
        const portalLight = gltf.scene.getObjectByName('Gateway') as Mesh;
        bakedMesh.material = bakedMaterial;
        poleLight1.material = poleLightMaterial;
        poleLight2.material = poleLightMaterial;
        portalLight.material = portalLightMaterial;
        scene.add(gltf.scene);
    }
);

/**
 * Fireflies
 */
const firefliesGeo = new BufferGeometry();
const firefliesCount = 30;
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);

for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
    positionArray[i * 3 + 1] = (Math.random() * 0.5) * 4;
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;

    scaleArray[i] = Math.random();
}
firefliesGeo.setAttribute('position', new BufferAttribute(positionArray, 3));
firefliesGeo.setAttribute('aScale', new BufferAttribute(scaleArray, 1));

const firefliesMat = new ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 100 },
    },
    blending: AdditiveBlending,
    depthWrite: false,
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    // sizeAttenuation: true,
    // color: '#ffffe5',
});
gui.add(firefliesMat.uniforms.uSize, 'value').min(0).max(500).step(1).name('Fireflies Size');
const fireflies = new Points(firefliesGeo, firefliesMat);
scene.add(fireflies);

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

    // Update fireflies
    firefliesMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
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

    firefliesMat.uniforms.uTime.value = elapsedTime;
    portalLightMaterial.uniforms.uTime.value = elapsedTime;

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
