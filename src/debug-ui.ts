import { OrbitControls } from 'three/examples/jsm/Addons.js';
import './style.css';
import { AmbientLight, BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import GUI from 'lil-gui';
import { gsap } from 'gsap';

// DEBUG
const gui = new GUI();
const debugObject: Record<string, any> = {};

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

// SHAPE
debugObject.color = '#6495ed';

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: debugObject.color, wireframe: true });
const cube = new Mesh(geometry, material);
cube.position.y = 0;
scene.add(cube);

const cubeTweaks = gui.addFolder('Cube');
cubeTweaks.add(cube.position, 'y').min(-3).max(3).step(0.1).name('Cube Y');
cubeTweaks.add(cube, 'visible').name('Cube Visible');
cubeTweaks.add(material, 'wireframe').name('Cube Wireframe');
cubeTweaks.addColor(debugObject, 'color')
    .name('Cube Color')
    .onChange((newColor: string) => {
        console.log('color changed', newColor);
        material.color.set(newColor);
    });

debugObject.spin = () => {
    gsap.to(cube.rotation, { y: cube.rotation.y + Math.PI * 2, duration: 1 });
}
gui.add(debugObject, 'spin').name('Spin Cube');

debugObject.subdivision = 2;
gui.add(debugObject, 'subdivision').min(1).max(10).step(1).name('Cube Subdivision')
    .onFinishChange(() => {
        console.log('cube subdiv finish changed');
        cube.geometry.dispose();
        cube.geometry = new BoxGeometry(1, 1, 1, debugObject.subdivision, debugObject.subdivision, debugObject.subdivision);
    });

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