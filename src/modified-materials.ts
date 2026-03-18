import { PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, GridHelper, CubeTextureLoader, Mesh, MeshStandardMaterial, DirectionalLight, BufferGeometry, MeshDepthMaterial, RGBADepthPacking } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { GLTFLoader, OrbitControls, Timer } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {};

// RENDERER
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;

// LOADERS
const textureLoader = new TextureLoader();
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new CubeTextureLoader();

// UPDATE ALL MATERIALS
function updateAllMaterials() {
    scene.traverse((child) => {
        if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
            child.material.envMapIntensity = 5;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

// ENVIRONMENT MAP
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg',
])

scene.background = environmentMap;
scene.environment = environmentMap;

// MODELS
const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg');
// mapTexture.encoding = sRGBEncoding;
const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg');
const material = new MeshStandardMaterial({
    map: mapTexture,
    normalMap: normalTexture,
});

const depthMaterial = new MeshDepthMaterial({
    depthPacking: RGBADepthPacking,
});

const customUniforms = {
    uTime: { value: 0 },
}
material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `
        #include <common>
        uniform float uTime;

        mat2 get2dRotationMatrix(float _angle) {
            return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
        }
    `);
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        float angle = position.y * 0.2 + uTime;
        mat2 rotationMatrix = get2dRotationMatrix(angle);
        transformed.xz = rotationMatrix * transformed.xz;
    `);
    // mat2 get2dRotationMatrix(float _angle) {
    //         return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
    //     }
    console.log(shader);
};

gltfLoader.load(
    '/models/LeePerrySmith/LeePerrySmith.glb',
    (gltf) => {
        const mesh = gltf.scene.children[0] as Mesh;
        mesh.rotation.y = Math.PI * 0.5;
        mesh.material = material;
        scene.add(mesh);
        updateAllMaterials();
    }
);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.1;
controls.enableDamping = true;

// LIGHT
const dirLight = new DirectionalLight('#fff', 3);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.far = 15;
dirLight.shadow.normalBias = 0.05;
dirLight.position.set(0.25, 2, -2.25);

scene.add(dirLight);

// Plane
const plane = new Mesh(
    new BufferGeometry(),
    new MeshStandardMaterial(),
);
scene.add(plane);

// RENDER
document.body.appendChild(renderer.domElement);

const timer = new Timer();
// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();

    customUniforms.uTime.value = elapsedTime;

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
