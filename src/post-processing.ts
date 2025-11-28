import { PerspectiveCamera, Scene, WebGLRenderer, GridHelper, DirectionalLight, Mesh, MeshStandardMaterial, AxesHelper, TextureLoader, CubeTextureLoader, PCFShadowMap, ReinhardToneMapping, WebGLRenderTarget, Vector2, Vector3 } from 'three';

import './style.css';
import GUI from 'lil-gui';
import { DotScreenPass, GammaCorrectionShader, GlitchPass, GLTFLoader, RenderPass, RGBShiftShader, ShaderPass, SMAAPass, Timer, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';

const scene = new Scene();

// DEBUG
const gui = new GUI();
const params: Record<string, any> = {};

// RENDERER
const renderer = new WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.toneMapping = ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;

const renderTarget = new WebGLRenderTarget(
    800,
    600,
    { samples: renderer.getPixelRatio() === 1 ? 2 : 0 },
);

const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(window.innerWidth, window.innerHeight);

// LOADERS
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new CubeTextureLoader();
const textureLoader = new TextureLoader();

// CAMERA
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 3;

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);

const glitchPass = new GlitchPass();
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);
glitchPass.goWild = false;

const rgbShiftPass = new ShaderPass(RGBShiftShader);
effectComposer.addPass(rgbShiftPass);
rgbShiftPass.enabled = false;

const unrealBloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    0.3, // strength
    0.1, // radius
    0.1, // threshold
);
effectComposer.addPass(unrealBloomPass);

gui.add(unrealBloomPass, 'enabled');
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001);
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001);
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001);

// Tint Pass
const TintShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTint: { value: null },
    },
    vertexShader: `
        varying vec2 vUv;

        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uTint;

        varying vec2 vUv;

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb += uTint;
            gl_FragColor = color;
        }
    `,
};
const tintPass = new ShaderPass(TintShader);
tintPass.material.uniforms.uTint.value = new Vector3(0.05, 0.05, 0.05);
effectComposer.addPass(tintPass);

// Displacemenet Pass
const DisplacementShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: null },
        uNormalMap: { value: null },
    },
    vertexShader: `
        varying vec2 vUv;

        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D uNormalMap;
        // uniform float uTime;

        varying vec2 vUv;

        void main() {
            // vec2 newUv = vec2(
            //     vUv.x,
            //     vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1
            // );
            vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
            vec2 newUv = vUv + normalColor.xy * 0.1;
            // vec2 newUv = vUv;
            vec4 color = texture2D(tDiffuse, newUv);

            vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
            float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
            color.rgb += lightness * 2.0;
            
            gl_FragColor = color;
        }
    `,
};
const displacementPass = new ShaderPass(DisplacementShader);
displacementPass.material.uniforms.uNormalMap.value = textureLoader.load('/textures/interfaceNormalMap.png');
displacementPass.material.uniforms.uTime.value = 0;
effectComposer.addPass(displacementPass);

// Gamma Correction Pass
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);
gammaCorrectionPass.enabled = false;

if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    const smaaPass = new SMAAPass();
    effectComposer.addPass(smaaPass);
    console.log('Using SMAA render pass');
}

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// LIGHT
const dirLight = new DirectionalLight('#fff', 4);
dirLight.position.set(0, 0, 10);
scene.add(dirLight);

/**
 * Update all materials
 */
function updateAllMaterials() {
    scene.traverse((child) => {
        if(child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
            child.material.envMapIntensity = 2.5;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

/**
 * Environment map
 */
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

/**
 * Models
 */
gltfLoader.load(
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(2, 2, 2);
        gltf.scene.rotation.y = Math.PI * 0.5;
        scene.add(gltf.scene);

        updateAllMaterials();
    }
);

/**
 * Lights
 */
const directionalLight = new DirectionalLight('#ffffff', 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, - 2.25);
scene.add(directionalLight);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const gridHelper = new GridHelper(10, 10, '#aaa', '#aaa');
gridHelper.visible = false;
scene.add(gridHelper);
gui.add(gridHelper, 'visible').name('Show Grid Helper');

const axesHelper = new AxesHelper();
axesHelper.visible = false;
scene.add(axesHelper);
gui.add(axesHelper, 'visible').name('Show Axes Helper');

// OBJECTS

// RENDER
document.body.appendChild(renderer.domElement);

const timer = new Timer();
let previousTime = 0;

// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    displacementPass.material.uniforms.uTime.value = elapsedTime;

    controls.update();

    // renderer.render(scene, camera);
    effectComposer.render();
}
renderer.setAnimationLoop(animate);
