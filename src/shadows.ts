import { MeshBasicMaterial, Mesh, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Clock, PointLight, BoxGeometry, LoadingManager, AxesHelper, TextureLoader, MeshMatcapMaterial, SRGBColorSpace, TorusGeometry, SphereGeometry, MeshStandardMaterial, PlaneGeometry, DirectionalLight, HemisphereLight, RectAreaLight, CameraHelper, PCFSoftShadowMap, SpotLight } from 'three'
import './style.css';
import GUI from 'lil-gui';
import { FontLoader, OrbitControls, TextGeometry } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

// TEXTURES
const textureLoader = new TextureLoader();
const bakedShadow = textureLoader.load('/bakedShadow.jpg');
bakedShadow.colorSpace = SRGBColorSpace;
const simpleShadow = textureLoader.load('/simpleShadow.jpg');

// DEBUG
const gui = new GUI();
const debugObject: Record<string, any> = {};

// RENDERER
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.shadowMap.enabled = false;

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 2;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.1;
controls.enableDamping = true;

// LIGHT
const ambientLight = new AmbientLight(0xffffff, 0.3);

const directionLight = new DirectionalLight(0xffffff, 0.3);
directionLight.position.set(1, 2, 3);
directionLight.castShadow = true;
directionLight.shadow.mapSize.width = 1024;
directionLight.shadow.mapSize.height = 1024;
directionLight.shadow.camera.top = 2;
directionLight.shadow.camera.bottom = -2;
directionLight.shadow.camera.left = -2;
directionLight.shadow.camera.right = 2;
directionLight.shadow.camera.near = 1;
directionLight.shadow.camera.far = 6;
directionLight.shadow.radius = 10;

const dirLightCamHelper = new CameraHelper(directionLight.shadow.camera);
dirLightCamHelper.visible = false;
scene.add(dirLightCamHelper);

const spotLight = new SpotLight(0xffffff, 3.6, 10, Math.PI * 0.3);
spotLight.castShadow = true;
spotLight.position.set(0, 2, 2);
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.far = 6;
spotLight.shadow.camera.fov = 3; // this does nothing in newer versions

const spotLightCamHelper = new CameraHelper(spotLight.shadow.camera);
spotLightCamHelper.visible = false;
scene.add(spotLightCamHelper);

const pointLight = new PointLight(0xffffff, 2.7);
pointLight.castShadow = true;
pointLight.position.set(-1, 1, 0);
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;

const pointLightCamHelper = new CameraHelper(pointLight.shadow.camera);
pointLightCamHelper.visible = false;
scene.add(pointLightCamHelper);

scene.add(ambientLight, directionLight, spotLight, pointLight);

gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001);

// OBJECTS
const material = new MeshStandardMaterial();
material.roughness = 0.4;

const sphere = new Mesh(
    new SphereGeometry(0.5, 32, 32),
    material,
);
sphere.castShadow = true;

const plane = new Mesh(
    new PlaneGeometry(10, 10),
    // new MeshBasicMaterial({ map: bakedShadow }),
    material,
);
plane.rotateX(-(Math.PI) * 0.5);
plane.position.y = -0.5;
plane.receiveShadow = true;

const sphereShadow = new Mesh(
    new PlaneGeometry(1.5, 1.5),
    new MeshBasicMaterial({
        color: 0x000000,
        alphaMap: simpleShadow,
        transparent: true,
    }),
);
sphereShadow.rotation.x = -Math.PI / 2;
sphereShadow.position.y = plane.position.y + 0.01;

scene.add(sphere, plane, sphereShadow);

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

    // update the sphere
    sphere.position.x = Math.cos(elapsedTime) * 1.5;
    sphere.position.z = Math.sin(elapsedTime) * 1.5;
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

    // update the shadow
    sphereShadow.position.x = sphere.position.x;
    sphereShadow.position.z = sphere.position.z;
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
