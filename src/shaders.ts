import { PerspectiveCamera, Scene, WebGLRenderer, GridHelper, DirectionalLight, Clock, Mesh, PlaneGeometry, MeshStandardMaterial, AxesHelper, RawShaderMaterial, BufferAttribute, BufferGeometry, Vector2, Color, TextureLoader, LoadingManager, ShaderMaterial } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { Timer } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import testVertexShader from './shaders/test/vertex.glsl?raw';
import testFragmentShader from './shaders/test/fragment.glsl?raw';

const scene = new Scene();

const loadingManager = new LoadingManager(console.log, undefined, console.error);
const textureLoader = new TextureLoader(loadingManager);
const flagTexture = textureLoader.load('/textures/flag-french.jpg');

// function updateAllMaterials() {
//     scene.traverse(child => {
//         if ((child as any).isMesh) {
//             child.castShadow = true;
//             child.receiveShadow = true;
//         }
//     })
// }

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {};

// RENDERER
const renderer = new WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = PCFSoftShadowMap;

// renderer.toneMapping = ReinhardToneMapping;
// renderer.toneMappingExposure = 3;

// gui.add(renderer, 'toneMapping', {
//     No: NoToneMapping,
//     Linear: LinearToneMapping,
//     Reinhard: ReinhardToneMapping,
//     Cineon: CineonToneMapping,
//     ACESFilmic: ACESFilmicToneMapping,
// });
// gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001);

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 3;

// CONTROLS
// orbital controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// LIGHT
const dirLight = new DirectionalLight('#fff', 4);
dirLight.position.set(0, 0, 10);
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

const axesHelper = new AxesHelper();
scene.add(axesHelper);
gui.add(axesHelper, 'visible').name('Show Axes Helper');

// OBJECTS
const geo = new PlaneGeometry(1, 1, 32, 32);

const count = geo.attributes.position.count;
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
    randoms[i] = Math.random();
}

geo.setAttribute('aRandom', new BufferAttribute(randoms, 1));

// const material = new RawShaderMaterial({
const material = new ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms: {
        uFrequency: { value: new Vector2(10, 5) },
        uTime: { value: 0 },
        uColor: { value: new Color('#ff9800')},
        uTexture: { value: flagTexture },
    },
});

gui.add(material.uniforms.uFrequency.value, 'x').name('Frequency X').min(0).max(20).step(0.01);
gui.add(material.uniforms.uFrequency.value, 'y').name('Frequency Y').min(0).max(20).step(0.01);

const plane = new Mesh(
    geo,
    // new MeshStandardMaterial({ color: 'white' }),
    material,
);
scene.add(plane);

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

    material.uniforms.uTime.value = elapsedTime;

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
