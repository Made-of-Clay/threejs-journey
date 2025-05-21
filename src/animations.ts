import './style.css';
import { AmbientLight, AxesHelper, BoxGeometry, Clock, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import gsap from 'gsap';

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.x = 2;
camera.position.y = 1;
camera.position.z = 7;

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0xaa00bb });
const cube = new Mesh(geometry, material);
cube.position.y = 3
// cube.rotation.
// scene.add(cube);

// const cube2 = new Mesh(
//     new BoxGeometry(1, 1, 1),
//     new MeshBasicMaterial({ color: 0xaa0000 })
// );
// scene.add(cube2);

const group = new Group();
group.add(cube);
// group.add(cube2);
group.position.x = 2;
scene.add(group);

camera.lookAt(group.position);

const color = 0xFFFFFF;
const intensity = 1;
const light = new AmbientLight(color, intensity);
scene.add(light);

document.body.appendChild(renderer.domElement);

gsap.to(cube.position, {
    duration: 1,
    delay: 1,
    x: 2,
})

const clock = new Clock();

// NOTE: just started "Using a Library" section of video at end of lunch
function animate() {
    const elapsedTime = clock.getElapsedTime();
    // cube.position.y = Math.sin(elapsedTime)
    // camera.position.x = Math.sin(elapsedTime) * 5;
    camera.lookAt(cube.position);
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.03;
    // console.log(t);
    // console.log('elapsedTime', elapsedTime);
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);