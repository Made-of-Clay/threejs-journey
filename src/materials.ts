import { MeshBasicMaterial, Mesh, SphereGeometry, PlaneGeometry, TorusGeometry, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Clock, TextureLoader, SRGBColorSpace, Color, DoubleSide, MeshNormalMaterial, MeshMatcapMaterial, LoadingManager, MeshLambertMaterial, PointLight, MeshPhongMaterial, MeshToonMaterial, MeshStandardMaterial, EquirectangularReflectionMapping, MeshPhysicalMaterial } from 'three'
import './style.css';
import GUI from 'lil-gui';
import { OrbitControls, RGBELoader } from 'three/examples/jsm/Addons.js';

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
const color = 0xFFFFFF;
const intensity = 1;
const light = new AmbientLight(color, intensity);

const pointLight = new PointLight(0xffffff, 30);
pointLight.position.set(5, 5, 5);

scene.add(light, pointLight);

// Environment Map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/sky-env-map.hdr', envMap => {
    envMap.mapping = EquirectangularReflectionMapping;
    scene.background = envMap;
    scene.environment = envMap;
    console.log(envMap);
});

// TEXTURES
const loadingManager = new LoadingManager(
    () => console.log('loading complete'),
    undefined,
    (url: string) => console.log('loading error for', url),
);
const textureLoader = new TextureLoader(loadingManager); // can load multiple textures
const alphaTexture = textureLoader.load('/door.alpha.jpg');
const ambientTexture = textureLoader.load('/door.ambient.jpg');
const colorTexture = textureLoader.load('/door.color.jpg');
const heightTexture = textureLoader.load('/door.height.jpg');
const metalnessTexture = textureLoader.load('/door.metalness.jpg');
const normalTexture = textureLoader.load('/door.normal.jpg');
const roughnessTexture = textureLoader.load('/door.roughness.jpg');
const matcapTexture = textureLoader.load('/matcap-brown.png');

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
// const material = new MeshNormalMaterial();
// material.side = DoubleSide;
// const material = new MeshMatcapMaterial();
// material.matcap = matcapTexture;
// const material = new MeshLambertMaterial()
// const material = new MeshPhongMaterial()
// material.shininess = 100;
// material.specular = new Color('#18f');
// const material = new MeshToonMaterial()
// material.gradientMap = gradientTe
// const material = new MeshStandardMaterial();
const material = new MeshPhysicalMaterial();
material.side = DoubleSide;
material.metalness = 1;
material.roughness = 1;
// material.map = colorTexture;
// material.aoMap = ambientTexture;
// material.aoMapIntensity = 1;
// material.displacementMap = heightTexture;
// material.displacementScale = 0.02;
// material.metalnessMap = metalnessTexture;
// material.roughnessMap = roughnessTexture;
// material.normalMap = normalTexture;
// material.transparent = true;
// material.alphaMap = alphaTexture;

// material.clearcoat = 1;
// material.clearcoatRoughness = 0;

// material.sheen = 1;
// material.sheenRoughness = 0.25;
// material.sheenColor.set(1, 1, 1);

// material.iridescence = 1;
// material.iridescenceIOR = 1;
// material.iridescenceThicknessRange = [100, 800];

material.transmission = 1;
material.ior = 1.5;
material.thickness = 0.5;

gui.add(material, 'transmission').min(0).max(1).step(0.0001);
gui.add(material, 'ior').min(1).max(10).step(0.0001);
gui.add(material, 'thickness').min(0).max(1).step(0.0001);

// gui.add(material, 'iridescence').min(0).max(1).step(0.0001);
// gui.add(material, 'iridescenceIOR').min(1).max(2.333).step(0.0001);
// gui.add(material.iridescenceThicknessRange, '0').min(1).max(1000).step(1);
// gui.add(material.iridescenceThicknessRange, '1').min(1).max(1000).step(1);

gui.add(material, 'metalness').min(0).max(1).step(0.001);
gui.add(material, 'roughness').min(0).max(1).step(0.001);

const sphere = new Mesh(
    new SphereGeometry(0.5, 64, 64),
    material
)
sphere.position.x = - 1.5

const plane = new Mesh(
    new PlaneGeometry(1, 1, 100, 100),
    material
)

const torus = new Mesh(
    new TorusGeometry(0.3, 0.2, 64, 128),
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
    plane.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    // sphere.rotation.x = 0.15 * elapsedTime;
    plane.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

scene.add(sphere, plane, torus)