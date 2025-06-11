import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import './style.css';

const gui = new GUI();
const tweaks = {
    heightSegments: 1,
    widthSegments: 1,
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(-3, 6, 8);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const textureLoader = new THREE.TextureLoader();
const wallColorTexture = textureLoader.load('/checkers.jpg');
const displacementMap = textureLoader.load('/displacement-map.webp');
const bumpMap = textureLoader.load('/bump-map.webp');
wallColorTexture.repeat.set(8, 8);
wallColorTexture.wrapS = THREE.RepeatWrapping;
wallColorTexture.wrapT = THREE.RepeatWrapping;
// displacementMap.repeat.set(1, 1);
// displacementMap.wrapS = THREE.RepeatWrapping;
// displacementMap.wrapT = THREE.RepeatWrapping;


const planeGeometry = new THREE.PlaneGeometry(10, 10, 50, 50);

const planeMaterial = new THREE.MeshStandardMaterial({
    color: 'white',
    map: wallColorTexture,
    bumpMap,
    displacementMap,
    // displacementBias: 1,
    displacementScale: 1,
    // roughness: 0.1,
    // wireframe: true,
});
gui.add(planeMaterial, 'bumpScale').min(0).max(1).step(0.01);
gui.add(planeMaterial, 'displacementScale').min(0).max(10).step(0.01);
gui.add(planeMaterial, 'displacementBias').min(0).max(10).step(0.01);

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
const directionLight = new THREE.DirectionalLight(0xffffff, 1);
directionLight.position.set(5, 1, 2);
scene.add(ambientLight, directionLight);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();