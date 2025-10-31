import { PerspectiveCamera, Scene, WebGLRenderer, GridHelper, DirectionalLight, Clock, Mesh, PlaneGeometry, MeshStandardMaterial, AxesHelper, RawShaderMaterial, BufferAttribute, BufferGeometry, Vector2, Color, TextureLoader, LoadingManager, ShaderMaterial, MeshBasicMaterial } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { Timer } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import vertexShader from './shaders/water/vertex.glsl?raw';
import fragmentShader from './shaders/water/fragment.glsl?raw';

const scene = new Scene();

const loadingManager = new LoadingManager(console.log, undefined, console.error);
const textureLoader = new TextureLoader(loadingManager);
const flagTexture = textureLoader.load('/textures/flag-french.jpg');

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {};

// RENDERER
const renderer = new WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 3;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// LIGHT
const dirLight = new DirectionalLight('#fff', 4);
dirLight.position.set(0, 0, 10);
scene.add(dirLight);

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

const axesHelper = new AxesHelper();
axesHelper.visible = false;
scene.add(axesHelper);
gui.add(axesHelper, 'visible').name('Show Axes Helper');

// OBJECTS
const waterGeo = new PlaneGeometry(2, 2, 128, 128);

const waterMat = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.5 },
    },
});

gui.add(waterMat.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('Big Waves Elevation');
gui.add(waterMat.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('Big Waves Frequency X');
gui.add(waterMat.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('Big Waves Frequency Y');
gui.add(waterMat.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('Big Waves Speed');

const water = new Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

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

    waterMat.uniforms.uTime.value = elapsedTime;
    
    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
