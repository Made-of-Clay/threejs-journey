import './style.css';
import { AmbientLight, AxesHelper, BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.x = 2;
camera.position.y = 3;
camera.position.z = 7;

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0xaa00bb });
const cube = new Mesh(geometry, material);
cube.position.y = 3
// cube.rotation.
// scene.add(cube);

const cube2 = new Mesh(
    new BoxGeometry(1, 1, 1),
    new MeshBasicMaterial({ color: 0xaa0000 })
);
// scene.add(cube2);

const group = new Group();
group.add(cube);
group.add(cube2);
group.position.x = 2;
scene.add(group);

camera.lookAt(group.position);

const color = 0xFFFFFF;
const intensity = 1;
const light = new AmbientLight(color, intensity);
scene.add(light);

document.body.appendChild(renderer.domElement);

function animate() {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);