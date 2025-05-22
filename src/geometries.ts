import { OrbitControls } from 'three/examples/jsm/Addons.js';
import './style.css';
import { AmbientLight, AxesHelper, BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

const scene = new Scene();

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.1;
controls.enableDamping = true;

// HELPER
const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

// SHAPE
const positionsArray = new Float32Array([
    0, 0, 0,
    0, 1, 0,
    1, 0, 0
]);
const positionsAttr = new BufferAttribute(positionsArray, 3);
const geo1 = new BufferGeometry();
geo1.setAttribute('position', positionsAttr);

const posArrCount = 50; // can probably be up to 5000 but don't get crazy; burnout is real for 🤖 too
const posArrCountProduct = posArrCount * 3 * 3;
const positionsArray2 = new Float32Array(posArrCountProduct);
for (let i = 0; i < posArrCountProduct; i++) {
    positionsArray2[i] = Math.random();
}
const positionsAttr2 = new BufferAttribute(positionsArray2, 3);
const geo2 = new BufferGeometry();
geo2.setAttribute('position', positionsAttr2);

// const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0xaa0044, wireframe: true });
// const cube = new Mesh(geometry, material);
// const cube = new Mesh(geo2, material);
const cube = new Mesh(geo2, material);
cube.position.y = 0;
scene.add(cube);

// LIGHT
const color = 0xFFFFFF;
const intensity = 1;
const light = new AmbientLight(color, intensity);
scene.add(light);

// EVENTS
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    cursor.x = -(event.clientX / window.innerWidth - 0.5);
    cursor.y = -(event.clientY / window.innerHeight - 0.5);
});

document.body.appendChild(renderer.domElement);

// NOTE: just started "Using a Library" section of video at end of lunch
function animate() {
    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);