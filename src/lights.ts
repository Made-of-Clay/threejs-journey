import { MeshBasicMaterial, Mesh, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Clock, PointLight, BoxGeometry, LoadingManager, AxesHelper, TextureLoader, MeshMatcapMaterial, SRGBColorSpace, TorusGeometry, SphereGeometry, MeshStandardMaterial, PlaneGeometry, DirectionalLight, HemisphereLight, RectAreaLight } from 'three'
import './style.css';
import GUI from 'lil-gui';
import { FontLoader, OrbitControls, TextGeometry } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const debugObject: Record<string, any> = {};

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 2;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.1;
controls.enableDamping = true;

// LIGHT
const ambientLight = new AmbientLight(0xffffff, 1);

const directionLight = new DirectionalLight(0x00fffc, 0.9);
directionLight.position.set(1, 2, 3);

const hemisphereLight = new HemisphereLight(0xff0000, 0x0000ff, 1);

const pointLight = new PointLight(0xff9000, 1.5);
pointLight.position.set(0, 0, 2);

const rectAreaLight = new RectAreaLight(0x4e00ff, 6, 1, 1);
rectAreaLight.position.z = 2;

scene.add(ambientLight, directionLight, hemisphereLight, pointLight, rectAreaLight);

gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001);
gui.add(pointLight.position, 'z').min(-5).max(5).step(1).name('Point Z');
gui.add(pointLight.position, 'x').min(-5).max(5).step(1).name('Point X');

// OBJECTS
const material = new MeshStandardMaterial();
material.roughness = 0.4;

const sphere = new Mesh(
    new SphereGeometry(0.5, 32, 32),
    material,
);

sphere.position.x = -1.5;
const cube = new Mesh(
    new BoxGeometry(0.75, 0.75, 0.75),
    material,
);

const torus = new Mesh(
    new TorusGeometry(0.3, 0.2, 32, 64),
    material,
);
torus.position.x = 1.5;

const plane = new Mesh(
    new PlaneGeometry(10, 10),
    material,
);
plane.rotateX(-(Math.PI) * 0.5);
plane.position.y = -0.75;

scene.add(sphere, cube, torus, plane);

gui.add(plane.position, 'y').min(-3).max(3).step(0.1);

// AXIS HELPER
const axisHelper = new AxesHelper();
scene.add(axisHelper);

// RENDER
document.body.appendChild(renderer.domElement);

const clock = new Clock();
// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    const elapsedTime = clock.getElapsedTime();

    cube.rotation.x = elapsedTime * 0.5;
    cube.rotation.z = elapsedTime * 0.1;
    torus.rotation.x = elapsedTime * 0.25;
    torus.rotation.z = elapsedTime * -0.1;

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
