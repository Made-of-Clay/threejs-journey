import { PerspectiveCamera, Scene, WebGLRenderer, GridHelper, DirectionalLight, Mesh, MeshStandardMaterial, AxesHelper, TextureLoader, CubeTextureLoader, PCFShadowMap, ReinhardToneMapping, WebGLRenderTarget, PlaneGeometry, MeshBasicMaterial, ShaderMaterial, LoadingManager } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { GLTFLoader, Timer } from 'three/examples/jsm/Addons.js';
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
const loadingEl = document.querySelector('.loading');
const loadingManager = new LoadingManager(
    () => {
        gsap.to(overlayMat.uniforms.uAlpha, {
            duration: 3,
            value: 0,
        });
        setTimeout(() => {
            loadingEl?.removeAttribute('style');
            loadingEl?.classList.add('finished');
        }, 500);
    },
    (_url, loaded, total) => {
        const progress = loaded / total;
        loadingEl?.setAttribute('style', `--scaleX: ${progress}`);
    },
    console.error,
);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new CubeTextureLoader();

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
});

const gridHelper = new GridHelper(10, 10, '#aaa', '#aaa');
gridHelper.visible = false;
scene.add(gridHelper);
gui.add(gridHelper, 'visible').name('Show Grid Helper');

const axesHelper = new AxesHelper();
axesHelper.visible = false;
scene.add(axesHelper);
gui.add(axesHelper, 'visible').name('Show Axes Helper');

// OVERLAY
const overlayGeo = new PlaneGeometry(2, 2, 1, 1);
const overlayMat = new ShaderMaterial({
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 },
    },
    vertexShader: `
    void main() {
        // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    uniform float uAlpha;
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
    `,
})
const overlay = new Mesh(overlayGeo, overlayMat);
scene.add(overlay);

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
