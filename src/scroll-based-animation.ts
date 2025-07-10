import { PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, LoadingManager, GridHelper, Mesh, TorusGeometry, ConeGeometry, TorusKnotGeometry, MeshToonMaterial, DirectionalLight, NearestFilter, Group, Clock, BufferGeometry, BufferAttribute, PointsMaterial, Points } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { Timer } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {
    materialColor: '#fff',
};
gui.addColor(params, 'materialColor').onChange(() => {
    material.color.set(params.materialColor);
    particlesMaterial.color.set(params.materialColor);
});

// RENDERER
const renderer = new WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// CAMERA
const cameraGroup = new Group();
scene.add(cameraGroup);

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 5;

cameraGroup.add(camera);

// LIGHT
const dirLight = new DirectionalLight('#fff', 3);
dirLight.position.set(1, 1, 0);
scene.add(dirLight);

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

// OBJECTS
const material = new MeshToonMaterial({
    color: params.materialColor,
    gradientMap: gradientTexture,
});
const objectDistance = 5;
const mesh1 = new Mesh(
    new TorusGeometry(1, 0.4, 16, 60),
    material,
);
const mesh2 = new Mesh(
    new ConeGeometry(1, 2, 32),
    material,
);
const mesh3 = new Mesh(
    new TorusKnotGeometry(0.8, 0.35, 100, 16),
    material,
);

mesh1.position.y = objectDistance * 0;
mesh2.position.y = objectDistance * -1;
mesh3.position.y = objectDistance * -2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

// Particles
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 0.4 - Math.random() * objectDistance * sectionMeshes.length;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new BufferGeometry();
particlesGeometry.setAttribute(
    'position',
    new BufferAttribute(positions, 3)
);

const particlesMaterial = new PointsMaterial({
    color: params.materialColor,
    sizeAttenuation: true,
    size: 0.03,
});

const particles = new Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// RENDER
document.body.appendChild(renderer.domElement);

// Scroll
let currentSection = 0;
let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;

    const newSection = Math.round(scrollY / window.innerHeight);
    if (currentSection != newSection) {
        currentSection = newSection;
        console.log({currentSection});
        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5',
            }
        );
    }
});

// Cursor
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / window.innerWidth - 0.5;
    cursor.y = event.clientY / window.innerHeight - 0.5;
});

const timer = new Timer();
const clock = new Clock();
let previousTime = 0;

// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // animate camera
    camera.position.y = -scrollY * 0.01;

    const parallaxX = cursor.x;
    const parallaxY = cursor.y;
    cameraGroup.position.x = (-parallaxX - camera.position.x) * 1 * deltaTime;
    cameraGroup.position.y = (parallaxY - camera.position.y) * 1 * deltaTime;

    // animate meshes
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
    }

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
