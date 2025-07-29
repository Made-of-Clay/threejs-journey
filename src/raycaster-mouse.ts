import { PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, GridHelper, DirectionalLight, Clock, AmbientLight, SphereGeometry, Mesh, MeshBasicMaterial, Raycaster, Vector3, Vector2, Group, type Object3DEventMap } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { GLTFLoader, Timer, type GLTF } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {
};

// OBJECTS
const object1 = new Mesh(
    new SphereGeometry(0.5, 16, 16),
    new MeshBasicMaterial({ color: 'red' }),
);
object1.position.x = -2;
const object2 = new Mesh(
    new SphereGeometry(0.5, 16, 16),
    new MeshBasicMaterial({ color: 'red' }),
);
const object3 = new Mesh(
    new SphereGeometry(0.5, 16, 16),
    new MeshBasicMaterial({ color: 'red' }),
);
object3.position.x = 2;

scene.add(object1, object2, object3);

// RAYCASTER
const raycaster = new Raycaster();
raycaster.set(
    new Vector3(-3, 0, 0),
    new Vector3(10, 0, 0).normalize(),
);

const intersect = raycaster.intersectObject(object2);
const intersects = raycaster.intersectObjects([object1, object2, object3]);

console.log(intersect, intersects);

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

// EVENTS
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const mouse = new Vector2();
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / innerWidth * 2) - 1;
    mouse.y = -(event.clientY / innerHeight * 2) + 1;
});

let currentIntersect: ReturnType<typeof raycaster.intersectObjects> | null = null;
window.addEventListener('click', () => {
    if (currentIntersect) {
        console.log('clicked on', currentIntersect);
    }
});

// RENDER
document.body.appendChild(renderer.domElement);

const timer = new Timer();
const clock = new Clock();
let previousTime = 0;

// MODEL
const gltfLoader = new GLTFLoader(loadingManager);
let model: Group<Object3DEventMap> | null = null;
gltfLoader.load(
    '/models/Duck/glTF-Binary/Duck.glb',
    (gltf) => {
        model = gltf.scene;
        gltf.scene.position.y = -1.2;
        scene.add(gltf.scene);
    }
);

// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    object1.position.y = Math.sin(elapsedTime);
    object2.position.y = Math.cos(elapsedTime);
    object3.position.y = Math.sin(elapsedTime) * 1.5;

    // const rayOrigin = new Vector3(-3, 0, 0);
    // const rayDir = new Vector3(1, 0, 0).normalize();
    // raycaster.set(rayOrigin, rayDir);
    raycaster.setFromCamera(mouse, camera);

    const objectsToTest = [object1, object2, object3];
    const intersects = raycaster.intersectObjects(objectsToTest);

    for (const obj of objectsToTest) {
        obj.material.color.set('red');
    }

    // // console.log(intersects.length)
    for (const intersect of intersects) {
        intersect.object.material.color.set('blue');
    }

    if (intersects.length) {
        currentIntersect = intersects[0];
    } else {
        currentIntersect = null;
    }

    if (model) {
        const modelIntersects = raycaster.intersectObject(model);
        if (modelIntersects.length) {
            model.scale.set(1.2, 1.2, 1.2);
        } else {
            model.scale.set(1, 1, 1);
        }
    }

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
