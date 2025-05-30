import { MeshBasicMaterial, Mesh, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Clock, PointLight, BoxGeometry, LoadingManager, AxesHelper, TextureLoader, MeshMatcapMaterial, SRGBColorSpace, TorusGeometry } from 'three'
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
const color = 0xFFFFFF;
const intensity = 1;
const light = new AmbientLight(color, intensity);

const pointLight = new PointLight(0xffffff, 30);
pointLight.position.set(5, 5, 5);

scene.add(light, pointLight);

const loadManager = new LoadingManager(console.log, console.log, console.log);

const textureLoader = new TextureLoader();
// const matcapTexture = textureLoader.load('/matcap-brown.png');
const matcapTexture = textureLoader.load('/gunmetal-blue.png');
matcapTexture.colorSpace = SRGBColorSpace;

// FONTS
const fontLoader = new FontLoader(loadManager);
fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
    console.log('font loaded');
    const textGeometry = new TextGeometry('Adam Leis!', {
        font,
        size: 0.5,
        depth: 0.2,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 3,
    });
    // textGeometry.computeBoundingBox();
    // textGeometry.translate(
    //     -(textGeometry.boundingBox?.max.x ?? 0) * 0.5,
    //     -(textGeometry.boundingBox?.max.y ?? 0) * 0.5,
    //     -(textGeometry.boundingBox?.max.z ?? 0) * 0.5,
    // );
    textGeometry.center();
    const sharedMatcap = new MeshMatcapMaterial({ matcap: matcapTexture });
    const text = new Mesh(textGeometry, sharedMatcap);
    scene.add(text);

    console.time('donuts');
    const torusGeometry = new TorusGeometry(0.3, 0.2, 20, 45);
    // const torusMaterial = new MeshMatcapMaterial({ matcap: matcapTexture });

    for (let i = 0; i < 100; i++) {
        const donut = new Mesh(
            torusGeometry,
            sharedMatcap,
        );
        donut.position.x = (Math.random() - 0.5) * 10;
        donut.position.y = (Math.random() - 0.5) * 10;
        donut.position.z = (Math.random() - 0.5) * 10;
        donut.rotation.x = Math.random() * Math.PI;
        donut.rotation.y = Math.random() * Math.PI;
        const scale = Math.random();
        donut.scale.x = scale;
        donut.scale.y = scale;
        donut.scale.z = scale;
        scene.add(donut);
    }
    console.timeEnd('donuts');
});

// AXIS HELPER
const axisHelper = new AxesHelper();
scene.add(axisHelper);

// RENDER
document.body.appendChild(renderer.domElement);

const clock = new Clock();
// NOTE: just started 'Using a Library' section of video at end of lunch
function animate() {
    const elapsedTime = clock.getElapsedTime();

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
