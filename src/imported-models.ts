import { PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, GridHelper, Mesh, TorusGeometry, ConeGeometry, TorusKnotGeometry, MeshToonMaterial, DirectionalLight, NearestFilter, Group, Clock, BufferGeometry, BufferAttribute, PointsMaterial, Points, SphereGeometry, MeshBasicMaterial, MeshStandardMaterial, AmbientLight, PlaneGeometry, Vector3, BoxGeometry, AnimationMixer } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { Timer } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

// Models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Set the path to the Draco decoder

let mixer: AnimationMixer | null = null;

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
    // '/models/Duck/glTF/Duck.gltf',
    // '/models/Duck/glTF-Binary/Duck.glb',
    // '/models/Duck/glTF-Draco/Duck.gltf', // errors - fix later w/ lesson
    // '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        mixer = new AnimationMixer(gltf.scene);
        const action = mixer.clipAction(gltf.animations[2]);
        console.log(action);
        action.play();

        gltf.scene.scale.set(0.025, 0.025, 0.025);
        scene.add(gltf.scene);
    },
    console.log,
    console.error,
);

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {
};

// RENDERER
const renderer = new WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 5;

// CONTROLS
// orbital controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// LIGHT
const dirLight = new DirectionalLight('#fff', 3);
dirLight.position.set(1, 1, 0);
dirLight.castShadow = true;
scene.add(dirLight);

const ambientLight = new AmbientLight('white', 0.25);
scene.add(ambientLight);

// GRID
const gridHelper = new GridHelper(10, 10, '#aaa', '#aaa');
gridHelper.visible = false;
scene.add(gridHelper);
gui.add(gridHelper, 'visible').name('Show Grid Helper');

// TEXTURES
const loadingManager = new LoadingManager(console.log, undefined, console.error);
const textureLoader = new TextureLoader(loadingManager);

// OBJECTS
const floor = new Mesh(
    new PlaneGeometry(10, 10),
    new MeshStandardMaterial({
        color: '#777',
        metalness: 0.3,
        roughness: 0.4,
    }),
);
floor.receiveShadow = true;
floor.rotation.x = Math.PI * -0.5;

scene.add(floor);

// RENDER
document.body.appendChild(renderer.domElement);

const timer = new Timer();
const clock = new Clock();
let previousTime = 0;

// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    mixer?.update(deltaTime);

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
