import { PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, GridHelper, Mesh, TorusGeometry, ConeGeometry, TorusKnotGeometry, MeshToonMaterial, DirectionalLight, NearestFilter, Group, Clock, BufferGeometry, BufferAttribute, PointsMaterial, Points, SphereGeometry, MeshBasicMaterial, MeshStandardMaterial, AmbientLight, PlaneGeometry, Vector3, BoxGeometry } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { Timer } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';
import CANNON from 'cannon';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

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
const gradientTexture = textureLoader.load('textures/gradients/3.jpg');
gradientTexture.magFilter = NearestFilter; // grab nearest instead of interpolate/guessing

// PHYSICS
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const defaultMaterial = new CANNON.Material('default');

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7,
    },
);
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// const sphereShape = new CANNON.Sphere(0.5);
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0, 3, 0),
//     shape: sphereShape,
// });
// sphereBody.applyLocalForce(
//     new CANNON.Vec3(150, 0, 0),
//     new CANNON.Vec3(0, 0, 0),
// );
// world.addBody(sphereBody);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5, // rotate 90 x axis
);
world.addBody(floorBody);

// OBJECTS
// const sphere = new Mesh(
//     new SphereGeometry(0.5, 32, 32),
//     new MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         // envMap: EnvironmentMap
//     }),
// );
// sphere.castShadow = true;

// create a plane "floor" for sphere
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

// scene.add(sphere, floor);
scene.add(floor);

// RENDER
document.body.appendChild(renderer.domElement);

// Utils
const objectToUpdate: {mesh:Mesh, body:CANNON.Body}[] = [];

const sphereGeo = new SphereGeometry(1, 20, 20);
const sphereMat = new MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
});
function createSphere(radius: number, position: any) {
    const mesh = new Mesh(sphereGeo, sphereMat);
    mesh.scale.set(radius, radius, radius);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
    });
    body.position.copy(position);
    world.addBody(body);

    objectToUpdate.push({ mesh, body });
}
params.createSphere = () => {
    createSphere(
        Math.random() * 0.5,
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3,
        }
    );
}
gui.add(params, 'createSphere').name('Create Sphere');


const boxGeo = new BoxGeometry(1, 1, 1);
const boxMat = new MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
});
function createBox(width: number, height: number, depth: number, position: any) {
    const mesh = new Mesh(boxGeo, boxMat);
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
    });
    body.position.copy(position);
    world.addBody(body);

    objectToUpdate.push({ mesh, body });
}
params.createBox = () => {
    createBox(
        Math.random(),
        Math.random(),
        Math.random(),
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3,
        }
    );
}
gui.add(params, 'createBox').name('Create Box');


const timer = new Timer();
const clock = new Clock();
let previousTime = 0;

// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // sphereBody.applyForce(
    //     new CANNON.Vec3(-0.5, 0, 0),
    //     sphereBody.position,
    // );
    
    world.step(1 / 60, deltaTime, 3);

    for (const object of objectToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    }
    // sphere.position.copy(sphereBody.position);

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
