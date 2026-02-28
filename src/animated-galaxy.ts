import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, PointsMaterial, Points, BufferGeometry, BufferAttribute, GridHelper, AdditiveBlending, Color, ShaderMaterial } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { OrbitControls, Timer } from 'three/examples/jsm/Addons.js';
import vertexShader from './shaders/galaxy/vertex.glsl?raw';
import fragmentShader from './shaders/galaxy/fragment.glsl?raw';

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
params.showingHelper = true;
gui.add(gridHelper, 'visible').name('Show Grid Helper');

// Galaxy
params.count = 200000;
params.size = 0.01;
params.radius = 5;
params.branches = 3;
params.spin = 0;
params.randomness = 0.5;
params.randomnessPower = 3;
params.insideColor = '#ff6030';
params.outsideColor = '#1b3984';

gui.add(params, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy);
gui.add(params, 'size').min(0.01).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(params, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
gui.add(params, 'branches').min(1).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(params, 'spin').min(-5).max(5).step(0.01).onFinishChange(generateGalaxy);
gui.add(params, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(params, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(params, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(params, 'outsideColor').onFinishChange(generateGalaxy);

let geometry: BufferGeometry | null = null;
let material: ShaderMaterial | null = null;
let points: Points | null = null;

function generateGalaxy() {
    if (points !== null) {
        geometry?.dispose();
        material?.dispose();
        scene.remove(points);
    }

    geometry = new BufferGeometry();

    const positions = new Float32Array(params.count * 3); // x, y, z
    const colors = new Float32Array(params.count * 3); // r, g, b
    const scales = new Float32Array(params.count * 1); // scale
    const randomness = new Float32Array(params.count * 3); // randomness x, y, z

    const colorInside = new Color(params.insideColor);
    const colorOutside = new Color(params.outsideColor);

    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3;

        const radius = Math.random() * params.radius;

        const branchAngle = (i % params.branches) / params.branches * (Math.PI * 2);
        // const spinAngle = radius * params.spin;

        const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        randomness[i3 + 0] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

        positions[i3 + 0] = Math.cos(branchAngle) * radius;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = Math.sin(branchAngle) * radius;

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / params.radius);

        colors[i3 + 0] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
        scales[i] = Math.random();
    }
    geometry.setAttribute(
        'position',
        new BufferAttribute(positions, 3),
    );

    geometry.setAttribute(
        'aScale',
        new BufferAttribute(scales, 1),
    );

    geometry.setAttribute(
        'color',
        new BufferAttribute(colors, 3),
    );

    geometry.setAttribute(
        'aRandomness',
        new BufferAttribute(randomness, 3),
    );

    material = new ShaderMaterial({
        depthWrite: false,
        blending: AdditiveBlending,
        vertexColors: true,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uSize: { value: 30 * renderer.getPixelRatio() },
            uTime: { value: 0 },
        },
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

    if (material) {
        material.uniforms.uTime.value = elapsedTime;
    }

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
