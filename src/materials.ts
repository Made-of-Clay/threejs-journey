import { MeshBasicMaterial, Mesh, SphereGeometry, PlaneGeometry, TorusGeometry, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Clock, TextureLoader, SRGBColorSpace, Color, DoubleSide, MeshNormalMaterial } from 'three'
import './style.css';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

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
const color = 0xFFFFFF;
const intensity = 1;
const light = new AmbientLight(color, intensity);
scene.add(light);

// TEXTURES
const textureLoader = new TextureLoader(); // can load multiple textures
const alphaTexture = textureLoader.load('/door.alpha.jpg');
const ambientTexture = textureLoader.load('/door.ambient.jpg');
const colorTexture = textureLoader.load('/door.color.jpg');
const heightTexture = textureLoader.load('/door.height.jpg');
const metalnessTexture = textureLoader.load('/door.metalness.jpg');
const normalTexture = textureLoader.load('/door.normal.jpg');
const roughnessTexture = textureLoader.load('/door.roughness.jpg');
const matcapTexture = textureLoader.load('/mapcap-brown.png');

colorTexture.colorSpace = SRGBColorSpace;
matcapTexture.colorSpace = SRGBColorSpace;

// Objects
// MeshBasicMaterial
// const material = new MeshBasicMaterial();
// material.map = colorTexture;
// material.color = new Color('#0f0');
// material.wireframe = true;
// material.transparent = true;
// material.alphaMap = alphaTexture;
const material = new MeshNormalMaterial();
material.side = DoubleSide;

const sphere = new Mesh(
    new SphereGeometry(0.5, 16, 16),
    material
)
sphere.position.x = - 1.5

const plane = new Mesh(
    new PlaneGeometry(1, 1),
    material
)

const torus = new Mesh(
    new TorusGeometry(0.3, 0.2, 16, 32),
    material
)
torus.position.x = 1.5;

// RENDER
document.body.appendChild(renderer.domElement);

const clock = new Clock();
// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    const elapsedTime = clock.getElapsedTime();

    // sphere.rotation.y = 0.1 * elapsedTime;
    // plane.rotation.y = 0.1 * elapsedTime;
    // torus.rotation.y = 0.1 * elapsedTime;

    // sphere.rotation.x = 0.15 * elapsedTime;
    // plane.rotation.x = 0.15 * elapsedTime;
    // torus.rotation.x = 0.15 * elapsedTime;

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

scene.add(sphere, plane, torus)