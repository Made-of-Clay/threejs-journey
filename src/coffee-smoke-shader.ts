import './style.css';
import GUI from 'lil-gui';
import { Scene, LoadingManager, TextureLoader, WebGLRenderer, PerspectiveCamera, AxesHelper, GridHelper, Clock, Material, PlaneGeometry, MeshBasicMaterial, Mesh, ShaderMaterial, DoubleSide, Uniform, RepeatWrapping } from 'three';
import { GLTFLoader, OrbitControls, Timer } from 'three/examples/jsm/Addons.js';
import coffeeSmokeVertexShader from './shaders/coffeeSmoke/vertex.glsl?raw';
import coffeeSmokeFragmentShader from './shaders/coffeeSmoke/fragment.glsl?raw';

const scene = new Scene();

const loadingManager = new LoadingManager(console.log, undefined, console.error);
const textureLoader = new TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader()

// OBJECTS
gltfLoader.load(
    './bakedModel.glb',
    (gltf) => {
        const baked = gltf.scene.getObjectByName('baked');
        if (baked) {
            (baked as any).material.map.anisotropy = 8; // shuts up TS
            scene.add(gltf.scene);
        }
    },
);

const perlinTexture = textureLoader.load('/textures/perlin.png');
perlinTexture.wrapS = RepeatWrapping;
perlinTexture.wrapT = RepeatWrapping;

const smokeGeometry = new PlaneGeometry(1, 1, 16, 64);
smokeGeometry.translate(0, 0.5, 0);
smokeGeometry.scale(1.5, 6, 1.5);

const smokeMaterial = new ShaderMaterial({
    vertexShader: coffeeSmokeVertexShader,
    fragmentShader: coffeeSmokeFragmentShader,
    side: DoubleSide,
    uniforms: {
        uTime: new Uniform(0),
        uPerlinTexture: new Uniform(perlinTexture),
    },
    transparent: true,
    // wireframe: true,
});

const smoke = new Mesh(smokeGeometry, smokeMaterial);
smoke.position.y = 1.83;
scene.add(smoke);

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {};

// RENDERER
const renderer = new WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 2;
camera.position.y = 5;
camera.position.z = 7;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

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

    smokeMaterial.uniforms.uTime.value = elapsedTime;

    controls.update();

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
