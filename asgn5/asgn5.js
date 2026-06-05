import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87ceeb, 2000, 15000);

// skybox
let skyboxTexture = null;
const bgLoader = new THREE.TextureLoader();
bgLoader.load(
  'skybox.jpg',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    skyboxTexture = texture;
    scene.background = texture;
  }
);

// camera
const camera = new THREE.PerspectiveCamera(
  75, // fov
  window.innerWidth / window.innerHeight, // aspect ratio
  1, // near clip
  100000 // far clip
);

// renderer
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 100;
controls.maxDistance = 50000;

// resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// lights
// ambient: baseline fill so nothing is pitch black
const ambient = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambient);

// directional: sun-like parallel rays casting shadows
const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// hemisphere light: sky color from above, ground color from below
const hemiLight = new THREE.HemisphereLight(
  0xB1E1FF,
  0xB97A20,
  1.5
);
scene.add(hemiLight);

// pointlight: orange-red glow hovering above model like lanturn
const pointLight = new THREE.PointLight(0xff4400, 200, 8000);
pointLight.position.set(0, 1500, 0);
scene.add(pointLight);

// spotlight: focused cone aimed down at the model center
const spotLight = new THREE.SpotLight(0xffffff, 500);
spotLight.position.set(2000, 3000, 2000);
spotLight.angle = Math.PI / 8;
spotLight.penumbra = 0.3;
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(spotLight.target);

// sun/moon sphere
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(120, 16, 16), sunMat);
scene.add(sunMesh);

// texture loader
const loader = new THREE.TextureLoader();

function loadTexture(url) {
  const tex = loader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

// 6 different textures, one per face
const faceTextures = [
  'https://threejs.org/manual/examples/resources/images/flower-1.jpg',
  'https://threejs.org/manual/examples/resources/images/flower-2.jpg',
  'https://threejs.org/manual/examples/resources/images/flower-3.jpg',
  'https://threejs.org/manual/examples/resources/images/flower-4.jpg',
  'https://threejs.org/manual/examples/resources/images/flower-5.jpg',
  'https://threejs.org/manual/examples/resources/images/flower-6.jpg',
].map(url => new THREE.MeshBasicMaterial({ map: loadTexture(url) }));

// cubes
const cubes = [];
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(200, 200, 200),
    faceTextures
  );
  mesh.position.set(Math.cos(angle) * 2500, 0, Math.sin(angle) * 2500);
  mesh.castShadow = true;
  scene.add(mesh);
  cubes.push(mesh);
}

// ground plane
const groundMat = new THREE.MeshStandardMaterial({ color: 0x556b2f });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -200;
ground.receiveShadow = true;
scene.add(ground);

// helper materials
const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
const darkWood = new THREE.MeshStandardMaterial({ color: 0x3b1f0a, roughness: 0.8 });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.7 });
const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.4, metalness: 0.1 });
const redMat = new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.5 });
const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });

// trees
const treePositions = [
  [ 1200, -200, 800],
  [-1000, -200, 1200],
  [1800, -200, -900],
  [-1500, -200, -600],
  [600, -200, -1800],
];

const floatingOrbs = [];

treePositions.forEach(([x, y, z]) => {
  // trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(40, 60, 500, 8), darkWood);
  trunk.position.set(x, y + 250, z);
  trunk.castShadow = true;
  scene.add(trunk);

  // canopy
  const useCone = x > 0;
  const canopy = useCone
    ? new THREE.Mesh(new THREE.ConeGeometry(280, 600, 8), leafMat)
    : new THREE.Mesh(new THREE.SphereGeometry(280, 12, 12), leafMat);
  canopy.position.set(x, y + 750, z);
  canopy.castShadow = true;
  scene.add(canopy); 
});

// stone pillars
const pillarPositions = [
  [900, -200, 900],
  [-900, -200, 900],
  [900, -200, -900],
  [-900, -200, -900],
];

pillarPositions.forEach(([x, y, z]) => {
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 800, 12), stoneMat);
  pillar.position.set(x, y + 400, z);
  pillar.castShadow = true;
  scene.add(pillar);

  // golden sphere cap
  const cap = new THREE.Mesh(new THREE.SphereGeometry(80, 16, 16), goldMat);
  cap.position.set(x, y + 870, z);
  scene.add(cap);
});

// floating glowing orbs
const orbPositions = [
  [0, 800, 0],
  [600, 600, 600],
  [-600, 700, -600],
  [600, 900, -600],
  [-600, 500, 600],
];

orbPositions.forEach(([x, y, z], i) => {
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(80, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x0044ff, emissiveIntensity: 1.5, transparent: true, opacity: 0.8})
  );
  orb.position.set(x, y, z);
  scene.add(orb);
  floatingOrbs.push({ mesh: orb, baseY: y, offset: i * (Math.PI * 2 / 5) });
});

// rocky boulders
const boulderPositions = [
  [2000, -200, 500],
  [-2000, -200, -300],
  [500, -200, 2000],
  [-800, -200, -2000],
];

boulderPositions.forEach(([x, y, z]) => {
  const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(200, 0), stoneMat);
  boulder.position.set(x, y + 100, z);
  boulder.scale.set(
    0.8 + Math.random() * 0.6,
    0.6 + Math.random() * 0.4,
    0.8 + Math.random() * 0.6
  );
  boulder.rotation.y = Math.random() * Math.PI;
  boulder.castShadow = true;
  scene.add(boulder);
});

// glass dome
const dome = new THREE.Mesh(new THREE.IcosahedronGeometry(500, 1), glassMat);
dome.position.set(0, 200, 0);
scene.add(dome);

// torii gate
const toriiMat = new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.5 });

[-120, 120].forEach((xOffset) => {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(35, 35, 1000, 12), toriiMat);
  post.position.set(xOffset, 300, -1600);
  post.castShadow = true;
  scene.add(post);
});

// top bar
const topBar = new THREE.Mesh(new THREE.BoxGeometry(400, 60, 60), toriiMat);
topBar.position.set(0, 820, -1600);
scene.add(topBar);

// second bar
const midBar = new THREE.Mesh(new THREE.BoxGeometry(340, 45, 45), toriiMat);
midBar.position.set(0, 720, -1600);
scene.add(midBar);

// snow-capped mountain cone
const mountain = new THREE.Mesh(
  new THREE.ConeGeometry(1200, 2000, 8),
  new THREE.MeshStandardMaterial({ color: 0x7a6a5a, roughness: 1 })
);
mountain.position.set(-3500, 800, -3500);
mountain.castShadow = true;
scene.add(mountain);

const snowCap = new THREE.Mesh(new THREE.ConeGeometry(400, 700, 8), snowMat);
snowCap.position.set(-3500, 1700, -3500);
scene.add(snowCap);

// GLTF Model
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  'new.glb', // .glb file
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    model.scale.setScalar(0.05);
    model.position.y = 0;
    model.position.z = 1000;

    // auto-frame
    const box = new THREE.Box3().setFromObject(model);
    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());

    // move camera
    const halfFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const distance = (boxSize * 0.6) / Math.tan(halfFov);

    const dir = new THREE.Vector3(1, 0.5, 1).normalize();
    camera.position.copy(dir.multiplyScalar(distance).add(boxCenter));
    camera.lookAt(boxCenter);

    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
    camera.updateProjectionMatrix();

    // point orbit controls at model center too
    spotLight.target.position.copy(boxCenter);
    spotLight.target.updateMatrixWorld();
    controls.target.copy(boxCenter);
    controls.update();
  },
  (xhr) => {
    console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
  },
  (error) => {
    console.error('GLTF load error:', error);
  }
);

const NIGHT_SKY = new THREE.Color(0x050510);
const SUNSET_SKY = new THREE.Color(0xff6633);

// animation
renderer.setAnimationLoop((time) => {
  const t = time / 1000;

  // cycle: 60 seconds
  const cycle = (t % 30) / 30;
  const sunAngle = cycle * Math.PI * 2;
  const dayness = Math.max(0, Math.sin(sunAngle));

  // sun/moon
  const skyRadius = 5000;
  sunMesh.position.set(
    Math.cos(sunAngle) * skyRadius,
    Math.sin(sunAngle) * skyRadius,
    -2000
  );
  const isDay = Math.sin(sunAngle) > 0;
  sunMat.color.set(isDay ? 0xffffaa : 0xaaaaff);
  sunMesh.scale.setScalar(isDay ? 1 : 0.5);

  // skybox during day, dark color at night
  if (skyboxTexture) {
    if (dayness > 0.15) {
      scene.background = skyboxTexture;
      scene.fog.color.set(0x87ceeb);
    } else if (dayness > 0) {
      // sunset/sunrise
      const blend = dayness / 0.15;
      const transitionColor = NIGHT_SKY.clone().lerp(SUNSET_SKY, blend);
      scene.background = transitionColor;
      scene.fog.color.copy(transitionColor);
    } else {
      // full night
      scene.background = NIGHT_SKY;
      scene.fog.color.copy(NIGHT_SKY);
    }
  }

  // lights follow sun
  dirLight.position.set(
    Math.cos(sunAngle) * 10,
    Math.sin(sunAngle) * 10,
    5
  );
  dirLight.intensity = dayness * 4;
  hemiLight.intensity = 0.2 + dayness * 1.5;

  // day
  if (isDay) {
    ambient.color.set(0xffffff);
    ambient.intensity = 0.5 + dayness * 2;
  } else {
    ambient.color.set(0x2244aa);
    ambient.intensity = 0.3;
  }

  cubes.forEach((c, i) => {
    c.rotation.x += 0.01;
    c.rotation.y += 0.01;
    c.position.y = Math.sin(t + i) * 400 + 3000;
  });

  pointLight.position.x = Math.sin(t * 0.5) * 1500;
  pointLight.position.z = Math.cos(t * 0.5) * 1500;

  // orbs bob up and down
  floatingOrbs.forEach(({ mesh, baseY, offset }) => {
    mesh.position.y = baseY + Math.sin(t * 1.2 + offset) * 120;
    mesh.rotation.y += 0.01;
  });

  // dome slowly rotates
  dome.rotation.y += 0.002;

  controls.update();
  renderer.render(scene, camera);
});
