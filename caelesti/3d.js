import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
// Set touch-action to none to prevent the browser from scrolling while dragging the cube
renderer.domElement.style.touchAction = 'none'; 
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

// Textures
const textureLoader = new THREE.TextureLoader();
const textures = [
  textureLoader.load('grass_block/side.png'),     // +X
  textureLoader.load('grass_block/side.png'),     // -X
  textureLoader.load('grass_block/top.png'),      // +Y
  textureLoader.load('grass_block/bottom.png'),   // -Y
  textureLoader.load('grass_block/side_alt.png'), // +Z
  textureLoader.load('grass_block/side_alt.png')  // -Z
];

textures.forEach(tex => {
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
});

const geometry = new THREE.BoxGeometry();
const materials = textures.map(tex => new THREE.MeshPhongMaterial({ map: tex }));
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// Interaction State
let isHovering = false;
let velX = 0;
let velY = 0;
const accel = 0.001;
const damping = 0.975;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let prevPointerX = 0;
let prevPointerY = 0;
let hasPrevPointer = false;

// --- Pointer Event Listeners ---

// Reset tracking when the pointer enters the element or starts a new touch
renderer.domElement.addEventListener('pointerdown', () => {
  hasPrevPointer = false;
});

renderer.domElement.addEventListener('pointermove', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  // Normalize pointer coordinates for Raycaster
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (!hasPrevPointer) {
    prevPointerX = x;
    prevPointerY = y;
    hasPrevPointer = true;
    return;
  }

  const dx = x - prevPointerX;
  const dy = y - prevPointerY;

  prevPointerX = x;
  prevPointerY = y;

  if (isHovering) {
    velX += dx * accel;
    velY += dy * accel;
  }
});

// Clear tracking when pointer leaves the canvas
renderer.domElement.addEventListener('pointerleave', () => {
  hasPrevPointer = false;
});

const deltaQuat = new THREE.Quaternion();
const axis = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  resizeRendererToDisplaySize();
  
  // Raycasting for hover detection
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(cube);
  isHovering = intersects.length > 0;

  const speed = Math.sqrt(velX * velX + velY * velY);

  if (speed > 0) {
    axis.set(velY, velX, 0).normalize();
    deltaQuat.setFromAxisAngle(axis, speed);
    cube.quaternion.multiplyQuaternions(deltaQuat, cube.quaternion);
  }

  velX *= damping;
  velY *= damping;

  if (Math.abs(velX) < 0.00001) velX = 0;
  if (Math.abs(velY) < 0.00001) velY = 0;

  renderer.render(scene, camera);
}

animate();