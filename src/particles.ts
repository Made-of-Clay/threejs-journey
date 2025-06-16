import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, SphereGeometry, PointsMaterial, Points, BufferGeometry, BufferAttribute, GridHelper, BoxGeometry, MeshBasicMaterial, Mesh, AdditiveBlending } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { OrbitControls, Timer } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const debugObject: Record<string, any> = {};

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

const particleTexture = textureLoader.load('textures/particles/11.png');

// Particles
// const particleGeo = new SphereGeometry(1, 32, 32);
const particleGeo = new BufferGeometry();
const count = 50000;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random();
}

particleGeo.setAttribute('position', new BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new BufferAttribute(colors, 3));

const particleMat = new PointsMaterial({ // dots along vertices?
    size: 0.1,
    sizeAttenuation: true,

    // leaving color prop will cause color blending
    // color: '#f8c',
    vertexColors: true,

    map: particleTexture,
    transparent: true,
    alphaMap: particleTexture,
    // ALERT these variations are options for testing better rendering; try them all
    // alphaTest: 0.001,
    // depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending, // brighter the more the overlap
});

// const cube = new Mesh(
//     new BoxGeometry(),
//     new MeshBasicMaterial(),
// );
// scene.add(cube)

const particles = new Points(particleGeo, particleMat);
scene.add(particles);

// RENDER
document.body.appendChild(renderer.domElement);

const timer = new Timer();
// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();

    // particles.rotation.y = elapsedTime * 0.01
    // particles.position.y = elapsedTime * 0.01

    // * This is not great for performance. It must update *many* vertices each animation frame. Custom shaders are better.
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = particleGeo.attributes.position.array[i3]
        particleGeo.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
    }
    particleGeo.attributes.position.needsUpdate = true;

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
