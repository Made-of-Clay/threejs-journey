import { OrbitControls } from 'three/examples/jsm/Addons.js';
import './style.css';
import { AmbientLight, AxesHelper, BoxGeometry, Clock, Mesh, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

const scene = new Scene();

// const aspectRatio = window.innerWidth / window.innerHeight;
// const camera = new OrthographicCamera(-5 * aspectRatio, 5 * aspectRatio, 5, -5, 0.1, 1000);

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
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0xaa0044 });
const cube = new Mesh(geometry, material);
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
})

document.body.appendChild(renderer.domElement);

// const clock = new Clock();
camera.lookAt(cube.position);

// NOTE: just started "Using a Library" section of video at end of lunch
function animate() {
    // const elapsedTime = clock.getElapsedTime();
    // cube.rotation.y = elapsedTime * Math.PI * 1;
    // cube.position.y = Math.cos(elapsedTime) * 2;
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
    // camera.position.z = Math.sin(cursor.x * Math.PI * 2) * 3;
    // camera.position.y = cursor.y * 5;
    // camera.lookAt(cube.position);

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);