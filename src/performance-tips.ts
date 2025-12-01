import { PerspectiveCamera, Scene, WebGLRenderer, DirectionalLight, PCFShadowMap, ReinhardToneMapping, Mesh, TorusKnotGeometry, MeshStandardMaterial, BufferGeometry, SphereGeometry, PlaneGeometry, BoxGeometry } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { Timer } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const scene = new Scene();

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

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

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 6;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// LIGHT
const dirLight = new DirectionalLight('#fff', 4);
dirLight.position.set(0, 5, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// OBJECTS
const torusKnot = new Mesh(
    new TorusKnotGeometry(1, 0.4, 128, 32),
    new MeshStandardMaterial(),
);
torusKnot.castShadow = true;
torusKnot.receiveShadow = false;
scene.add(torusKnot);

const sphere = new Mesh(
    new SphereGeometry(1, 32, 32),
    new MeshStandardMaterial(),
);
sphere.position.set(5, 0, 0);
sphere.castShadow = true;
sphere.receiveShadow = false;
scene.add(sphere);

const cube = new Mesh(
    new BoxGeometry(1, 1, 1),
    new MeshStandardMaterial(),
);
cube.position.set(-5, 0, 0);
cube.castShadow = true;
cube.receiveShadow = false;
scene.add(cube);

const floor = new Mesh(
    new PlaneGeometry(10, 10),
    new MeshStandardMaterial({ color: 'white' }),
);
floor.position.set(0, -2, 0);
floor.rotation.x = - Math.PI * 0.5;
floor.castShadow = true;
floor.receiveShadow = true;
scene.add(floor);

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

// RENDER
document.body.appendChild(renderer.domElement);

const timer = new Timer();
let previousTime = 0;

// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    stats.begin();
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    torusKnot.rotation.y = elapsedTime * 0.1;
    cube.rotation.y = elapsedTime * 0.1;
    cube.rotation.x = elapsedTime * 0.05;

    controls.update();

    renderer.render(scene, camera);
    stats.end();
}
renderer.setAnimationLoop(animate);

// Tip 4
// console.log(renderer.info);

// Tip 6
// scene.remove(cube);
// cube.geometry.dispose();
// cube.material.dispose();

// Tip 7
// Avoid Three.js lights
// Used baked lights or cheap lights (AmbientLight, DirectionalLight, HemisphereLight)

// Tip 8
// Avoid adding/removing lights often - bad perf (materials have to recompile

// Tip 9
// Avoid Three.js shadows
// Use baked shadows

// Tip 10
// Optimize shadow maps
// make sure shadow maps fir perfectly with the scene
// CameraHelper to visualize shadow camera
// someLight.shadow.camera[top|right|left|bottom|far] and shadow.mapSize.set(x, y) xy smaller is better

// Tip 11
// Use castShadow and receiveShadow wisely
// if objects cannot receive shadows then don't receive them (etc.)

// Tip 12
// Can manually control when shadow map updates
// renderer.shadowMap.autoUpdate = false;
// renderer.shadowMap.needsUpdate = true;

// Tip 13
// Scale down textures as far as allowable until quality degrades too far

// Tip 14
// Keep a power of 2 resolution for mipmaps
// Three.js tries resizing & finding nearest power of 2; you better control

// JPG vs PNG - right format makes a big difference
// tinypng.com is good optimizer

// Tip 17
// Try avoiding to update verteces

// Tip 18
// Mutualize geometries (reuse geometry instances when creating multiple in a loop)

// Tip 19
// Merge geometries - BufferGeometryUtils
// create array of geos and use BufferGEometryUtils.mergeGeometries(geos)
// to create mergedGeometry which reduces draw calls

// Tip 20
// Mutualize materials

// Tip 21
// Use cheap materials - MeshStandardMaterial or MeshPhysicalMaterial need more resources
// than Basic, Lambert, or Phong

// Tip 22
// Use InstancedMesh and update transformations/rotations on each
// If matrices are changed in tick/animate function, set instanceMatrix.setUsage(DynamicDrawUsage);

// Tip 23
// Low poly models are always better perf

// Tip 24
// Draco Compression for models

// Tip 25
// GZIP files from the server when available

// Tip 26
// Field of View (Cameras)
// dropped frame rates can be fixed by lowering FoV and don't render whats outside it

// Tip 28?
// Near/Far
// Like Fov, rduce camera near/far to cut out what needs rendered

// Tip 29
// Pixel Ratio (renderer)
// 2 is a reasonable cap; won't notice 3+ (marketing hoopla)
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Tip 30
// Power Preferences
// Don't set to high perf if there are framerate issues or don't need that level
// WebGLRenderer({ powerPreference: 'high-performance' });

// Tip 31
// Antialias - only add if you have visible aliasing and no perf issues

// Tip 32 (Post Processing)
// Limit Passes - each pass = rendering pixels

// Tip 33 Shaders
// Shader Material
// can force precision of shaders in materials by changing precision prop

// Tip 34 (his 32 - screwed up numbers)
// Keep code simple - learn the functions available to avoid extra logic where native funcs will do

// Tip 35 (33)
// Use textures with shaders - perlin noise is cool but bad perf

// Tip 36
// Use shader defines `#define uSomeValue 1.5` instead of defining from JS
// Not huge improvement but when you're squeaking everything out...
// Can also use `defines` from JS when initializing the ShaderMaterial

// Tip 37
// Do calculations in vertex shader (less verteces than fragments)
// Set in vertex shader and share to fragment shader via varyings

// WATCH PERFORMANCE FROM THE START

// Big list o tips
// https://threejs.org/docs/manual/en/introduction/performance.html
// https://discoverthreejs.com/tips-and-tricks/
// https://discoverthreejs.com/tips-and-tricks/performance-tips/