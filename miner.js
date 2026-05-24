import * as THREE from 'three';

const canvas = $('canvas');
const container = canvas.parentElement;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  innerWidth > innerHeight ? 45 : 60, // fov
  container.clientWidth / container.clientHeight, // aspect ratio
  0.1, // near plane
  1000 // far plane
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
canvas.style.touchAction = 'none';

function resizeRendererToDisplaySize() {
  canvas.style.height = '0px';
  const { width, height } = canvas.parentNode.getBoundingClientRect();
  canvas.style.height = '';
  
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.fov = innerWidth > innerHeight ? 45 : 60;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(3, 5, 2);
scene.add(dir);

let isHovering = false;
let velX = 0.1;
let velY = 0.1;
const accel = 0.001;
const damping = 0.975;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let prevPointerX = 0;
let prevPointerY = 0;
let hasPrevPointer = false;

const GRID_SIZE = 16;
const TOTAL_VOXELS = GRID_SIZE * GRID_SIZE * GRID_SIZE;

let activeVoxelCount = TOTAL_VOXELS;
let isReconstructing = false;
const voxelScales = new Array(TOTAL_VOXELS).fill(1);

const VOXEL_SIZE = 1 / GRID_SIZE; 
const geometry = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);

const MAX_PARTICLES = 50;
const PARTICLE_SIZE = VOXEL_SIZE * 1;

const particleGeometry = new THREE.BoxGeometry(PARTICLE_SIZE, PARTICLE_SIZE, PARTICLE_SIZE);
const particleMaterial = new THREE.MeshPhongMaterial({ vertexColors: true });
const particleMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, MAX_PARTICLES);
scene.add(particleMesh);

const particlesData = [];
let nextParticleIndices = 0;

const pDummy = new THREE.Object3D();
pDummy.scale.set(0, 0, 0);
for (let i = 0; i < MAX_PARTICLES; i++) {
  pDummy.updateMatrix();
  particleMesh.setMatrixAt(i, pDummy.matrix);
}
particleMesh.instanceMatrix.needsUpdate = true;

const particleColors = new Float32Array(MAX_PARTICLES * 3);
particleGeometry.setAttribute('color', new THREE.InstancedBufferAttribute(particleColors, 3));

const material = new THREE.MeshPhongMaterial({ vertexColors: true });
const instancedMesh = new THREE.InstancedMesh(geometry, material, TOTAL_VOXELS);

const blockGroup = new THREE.Group();
blockGroup.add(instancedMesh);
scene.add(blockGroup);

const voxelStates = new Array(TOTAL_VOXELS).fill(true);
const dummy = new THREE.Object3D();
const colors = new Float32Array(TOTAL_VOXELS * 3);
const colorObj = new THREE.Color();

function getIndex(x, y, z) {
  return x + y * GRID_SIZE + z * GRID_SIZE * GRID_SIZE;
}

function getPixelData(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, img.width, img.height));
    };
    img.onerror = reject;
  });
}

function getPixelColor(imgData, x, y) {
  const cx = Math.max(0, Math.min(x, imgData.width - 1));
  const cy = Math.max(0, Math.min(y, imgData.height - 1));
  const i = (cy * imgData.width + cx) * 4;

  const sR = imgData.data[i] / 255;
  const sG = imgData.data[i + 1] / 255;
  const sB = imgData.data[i + 2] / 255;

  const toLinear = (c) => {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  return [
    toLinear(sR),
    toLinear(sG),
    toLinear(sB),
  ];
}

function getDirtColor(sideTex, x, y, z) {
  const dirtStartY = Math.floor(sideTex.height * 0.25);

  const texX = Math.abs((x * 13 + y * 7 + z * 17)) % sideTex.width;
  const texY =
    dirtStartY +
    (Math.abs((x * 5 + y * 11 + z * 3)) %
      (sideTex.height - dirtStartY));

  return getPixelColor(sideTex, texX, texY);
}

Promise.all([
  getPixelData('grass_block/top.png'),
  getPixelData('grass_block/side.png'),
  getPixelData('grass_block/bottom.png')
]).then(([topTex, sideTex, bottomTex]) => {
  
  const offset = (GRID_SIZE / 2 - 0.5) * VOXEL_SIZE;

  for (let z = 0; z < GRID_SIZE; z++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const idx = getIndex(x, y, z);
        
        dummy.position.set(
          (x * VOXEL_SIZE) - offset, 
          (y * VOXEL_SIZE) - offset, 
          (z * VOXEL_SIZE) - offset
        );
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(idx, dummy.matrix);

        let r, g, b;
        if (y === GRID_SIZE - 1) {
          [r, g, b] = getPixelColor(topTex, x, z);
        } else if (y === 0) {
          [r, g, b] = getPixelColor(bottomTex, x, z);
        } else {
          const isExterior = (x === 0 || x === GRID_SIZE - 1 || z === 0 || z === GRID_SIZE - 1);
          if (!isExterior) {
            [r, g, b] = getDirtColor(sideTex, x, y, z);
          } else {
            const texY = (GRID_SIZE - 1) - y;
            if (z === 0) [r, g, b] = getPixelColor(sideTex, x, texY);
            else if (z === GRID_SIZE - 1) [r, g, b] = getPixelColor(sideTex, (GRID_SIZE - 1) - x, texY);
            else if (x === 0) [r, g, b] = getPixelColor(sideTex, (GRID_SIZE - 1) - z, texY);
            else [r, g, b] = getPixelColor(sideTex, z, texY);
          }
        }

        colorObj.setRGB(r, g, b);
        colorObj.toArray(colors, idx * 3);
      }
    }
  }

  geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
  instancedMesh.instanceMatrix.needsUpdate = true;
  
  animate();
}).catch(err => console.error("Asset initialization failed: ", err));

let downX = 0;
let downY = 0;
let dragging = false;

canvas.addEventListener('pointerdown', (event) => {
  downX = event.clientX;
  downY = event.clientY;
  dragging = false;
});

// canvas.addEventListener('click', (event) => {
//   raycaster.setFromCamera(pointer, camera);
//   const intersects = raycaster.intersectObject(instancedMesh);

//   if (intersects.length > 0) {
//     const targetIdx = intersects[0].instanceId;
    
//     if (voxelStates[targetIdx]) {
//       const targetX = targetIdx % GRID_SIZE;
//       const targetY = Math.floor((targetIdx % (GRID_SIZE * GRID_SIZE)) / GRID_SIZE);
//       const targetZ = Math.floor(targetIdx / (GRID_SIZE * GRID_SIZE));

//       detonate(targetX, targetY, targetZ, 3.5);
//     }
//   }
// });

canvas.addEventListener('pointermove', (event) => {
  {
    const dx = event.clientX - downX;
    const dy = event.clientY - downY;

    if (Math.hypot(dx, dy) > 10) {
      dragging = true;
    }
  }
  
  const rect = canvas.getBoundingClientRect();

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

canvas.addEventListener('pointerup', (event) => {
  if (dragging) return;

  const rect = canvas.getBoundingClientRect();

  const tapPointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  raycaster.setFromCamera(tapPointer, camera);

  const intersects = raycaster.intersectObject(instancedMesh);

  if (intersects.length > 0) {
    const targetIdx = intersects[0].instanceId;

    if (voxelStates[targetIdx]) {
      const targetX = targetIdx % GRID_SIZE;
      const targetY = Math.floor((targetIdx % (GRID_SIZE * GRID_SIZE)) / GRID_SIZE);
      const targetZ = Math.floor(targetIdx / (GRID_SIZE * GRID_SIZE));

      detonate(targetX, targetY, targetZ, 3.5);
    }
  }
});

canvas.addEventListener('pointerleave', () => {
  hasPrevPointer = false;
});

const deltaQuat = new THREE.Quaternion();
const axis = new THREE.Vector3();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  resizeRendererToDisplaySize();
  
  const dt = Math.min(clock.getDelta(), 0.1);

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(instancedMesh);
  isHovering = intersects.length > 0;
  const speed = Math.sqrt(velX * velX + velY * velY);
  if (speed > 0) {
    axis.set(velY, velX, 0).normalize();
    deltaQuat.setFromAxisAngle(axis, speed);
    blockGroup.quaternion.multiplyQuaternions(deltaQuat, blockGroup.quaternion);
  }
  velX *= damping; velY *= damping;
  blockGroup.position.x = velX; blockGroup.position.y = -velY;
  if (Math.abs(velX) < 0.00001) velX = 0;
  if (Math.abs(velY) < 0.00001) velY = 0;

  for (let i = 0; i < MAX_PARTICLES; i++) {
    const pData = particlesData[i];

    if (pData && pData.age < pData.maxAge) {
      pData.velocity.y -= 4.0 * dt; 

      pData.position.addScaledVector(pData.velocity, dt);
      pData.age++;

      const lifeRatio = 1 - (pData.age / pData.maxAge);
      
      pDummy.position.copy(pData.position);
      pDummy.scale.setScalar(lifeRatio);
      pDummy.updateMatrix();
      particleMesh.setMatrixAt(i, pDummy.matrix);
    } else {
      pDummy.scale.set(0, 0, 0);
      pDummy.updateMatrix();
      particleMesh.setMatrixAt(i, pDummy.matrix);
    }
  }
  particleMesh.instanceMatrix.needsUpdate = true;

  let fullyRestoredCount = 0;
  const offset = (GRID_SIZE / 2 - 0.5) * VOXEL_SIZE;

  for (let z = 0; z < GRID_SIZE; z++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const idx = getIndex(x, y, z);

        if (voxelStates[idx] && voxelScales[idx] < 1) {
          voxelScales[idx] += 5.0 * dt;
          if (voxelScales[idx] > 1) voxelScales[idx] = 1;
          
          dummy.position.set((x * VOXEL_SIZE) - offset, (y * VOXEL_SIZE) - offset, (z * VOXEL_SIZE) - offset);
          dummy.scale.setScalar(voxelScales[idx]);
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(idx, dummy.matrix);
          instancedMesh.instanceMatrix.needsUpdate = true;
        }

        if (voxelStates[idx] && voxelScales[idx] === 1) {
          fullyRestoredCount++;
        }
      }
    }
  }

  if (isReconstructing && fullyRestoredCount === TOTAL_VOXELS) {
    activeVoxelCount = TOTAL_VOXELS;
    isReconstructing = false;
  }
  
  renderer.render(scene, camera);
}

function detonate(targetX, targetY, targetZ, radius) {
  if (isReconstructing) return; 

  const offset = (GRID_SIZE / 2 - 0.5) * VOXEL_SIZE;

  for (let z = 0; z < GRID_SIZE; z++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const idx = getIndex(x, y, z);

        if (!voxelStates[idx]) continue;

        const dx = x - targetX;
        const dy = y - targetY;
        const dz = z - targetZ;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (distance <= radius) {
          voxelStates[idx] = false;
          voxelScales[idx] = 0;
          activeVoxelCount--;

          const voxelWorldPos = new THREE.Vector3((x * VOXEL_SIZE) - offset, (y * VOXEL_SIZE) - offset, (z * VOXEL_SIZE) - offset);
          voxelWorldPos.applyMatrix4(blockGroup.matrixWorld);
          for (let p = 0; p < 3; p++) {
            spawnParticle(voxelWorldPos, colors[idx*3], colors[idx*3+1], colors[idx*3+2]);
          }

          dummy.position.set((x * VOXEL_SIZE) - offset, (y * VOXEL_SIZE) - offset, (z * VOXEL_SIZE) - offset);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(idx, dummy.matrix);
        }
      }
    }
  }
  instancedMesh.instanceMatrix.needsUpdate = true;

  if (activeVoxelCount <= 0) {
    triggerRespawn();
  }
}

function spawnParticle(position, r, g, b) {
  const pIdx = nextParticleIndices % MAX_PARTICLES;
  nextParticleIndices++;

  particleColors[pIdx * 3 + 0] = r;
  particleColors[pIdx * 3 + 1] = g;
  particleColors[pIdx * 3 + 2] = b;
  particleMesh.geometry.attributes.color.needsUpdate = true;

  particlesData[pIdx] = {
    position: position.clone(),
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      (Math.random() * 1.5) + 0.5,
      (Math.random() - 0.5) * 1.5,
    ),
    age: 0,
    maxAge: 30 + Math.random() * 20
  };
}

function triggerRespawn() {
  isReconstructing = true;

  for (let z = 0; z < GRID_SIZE; z++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const idx = getIndex(x, y, z);
        
        setTimeout(() => {
          voxelStates[idx] = true;
        }, y * 120);
      }
    }
  }
}