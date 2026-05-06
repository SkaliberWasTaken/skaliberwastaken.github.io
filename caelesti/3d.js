import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

function resizeRendererToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambient);

const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(3, 5, 2);
scene.add(dir);

// Textures (column-style)
const textureLoader = new THREE.TextureLoader();

const texTop = textureLoader.load('grass_block/top.png');
const texBottom = textureLoader.load('grass_block/bottom.png');
const texNS = textureLoader.load('grass_block/side_alt.png');
const texEW = textureLoader.load('grass_block/side.png');

texTop.magFilter = THREE.NearestFilter;
texTop.minFilter = THREE.NearestFilter;
texBottom.magFilter = THREE.NearestFilter;
texBottom.minFilter = THREE.NearestFilter;
texNS.magFilter = THREE.NearestFilter;
texNS.minFilter = THREE.NearestFilter;
texEW.magFilter = THREE.NearestFilter;
texEW.minFilter = THREE.NearestFilter;

texTop.colorSpace = THREE.SRGBColorSpace;
texBottom.colorSpace = THREE.SRGBColorSpace;
texNS.colorSpace = THREE.SRGBColorSpace;
texEW.colorSpace = THREE.SRGBColorSpace;

const geometry = new THREE.BoxGeometry();

const materials = [
  new THREE.MeshPhongMaterial({ map: texEW }), // +X (east)
  new THREE.MeshPhongMaterial({ map: texEW }), // -X (west)
  new THREE.MeshPhongMaterial({ map: texTop }), // +Y (top)
  new THREE.MeshPhongMaterial({ map: texBottom }), // -Y (bottom)
  new THREE.MeshPhongMaterial({ map: texNS }), // +Z (north)
  new THREE.MeshPhongMaterial({ map: texNS })  // -Z (south)
];

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

let mouseX = 0;
let mouseY = 0;
let isHovering = false;

// inertia state (angular velocity-ish)
let velX = 0;
let velY = 0;
const accel = 0.001;
const damping = 0.975;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let prevMouseX = 0;
let prevMouseY = 0;
let hasPrevMouse = false;

renderer.domElement.addEventListener('mouseenter', () => hasPrevMouse = false);

renderer.domElement.addEventListener('mousemove', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  mouse.x = (x / rect.width) * 2 - 1;
  mouse.y = -(y / rect.height) * 2 + 1;

  // initialize on first valid move
  if (!hasPrevMouse) {
    prevMouseX = x;
    prevMouseY = y;
    hasPrevMouse = true;
    return;
  }

  const dx = x - prevMouseX;
  const dy = y - prevMouseY;

  prevMouseX = x;
  prevMouseY = y;

  if (isHovering) {
    velX += dx * accel;
    velY += dy * accel;
  }
});

renderer.domElement.addEventListener('click', () => {
  raycaster.setFromCamera(mouse, camera);
  if (raycaster.intersectObject(cube).length === 0) return;
  
  // random direction + strength
  const strength = 0.1;
  const angle = Math.random() * 2 * Math.PI;

  velX += Math.cos(angle) * strength;
  velY += Math.sin(angle) * strength;
});

const deltaQuat = new THREE.Quaternion();
const axis = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  resizeRendererToDisplaySize();
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cube);
  isHovering = intersects.length > 0;

  // build rotation from velocity (quaternion-based)
  const speed = Math.sqrt(velX * velX + velY * velY);

  if (speed > 0) {
    // axis perpendicular to mouse movement (feels natural)
    axis.set(velY, velX, 0).normalize();

    deltaQuat.setFromAxisAngle(axis, speed);
    cube.quaternion.multiplyQuaternions(deltaQuat, cube.quaternion);
  }

  // damping
  velX *= damping;
  velY *= damping;

  if (Math.abs(velX) < 0.00001) velX = 0;
  if (Math.abs(velY) < 0.00001) velY = 0;

  renderer.render(scene, camera);
}

animate();