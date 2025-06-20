import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, SphereGeometry, PointsMaterial, Points, BufferGeometry, BufferAttribute, GridHelper, BoxGeometry, MeshBasicMaterial, Mesh, AdditiveBlending } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { OrbitControls, Timer } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {};

// RENDERER
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.1;
controls.enableDamping = true;

// LIGHT
const ambientLight = new AmbientLight('#86cdff', 0.275);

scene.add(ambientLight);

// GRID
const gridHelper = new GridHelper(10, 10, '#aaa', '#aaa');
scene.add(gridHelper);

// TEXTURES
const loadingManager = new LoadingManager(console.log, undefined, console.error);
const textureLoader = new TextureLoader(loadingManager);

// Galaxy
params.count = 100000;
params.size = 0.02;
params.radius = 5;

gui.add(params, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy);
gui.add(params, 'size').min(0.01).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(params, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);

let geometry: BufferGeometry;
let material: PointsMaterial;
let points: Points;

function generateGalaxy() {
    // Clean up previous galaxy
    if (points) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new BufferGeometry();
    const positions = new Float32Array(params.count * 3);
    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * params.radius;
        positions[i3 + 0] = radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = 0
    }
    geometry.setAttribute('position', new BufferAttribute(positions, 3));

    material = new PointsMaterial({
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: AdditiveBlending,
    });

    points = new Points(geometry, material);
    scene.add(points);
}
generateGalaxy();

// RENDER
document.body.appendChild(renderer.domElement);

const timer = new Timer();
// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
