
import * as THREE from 'three';
import { DanceManager } from './manager';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Group } from 'three';
import _ = require('lodash');

export const setupDanceBackdrop = async (mgr: DanceManager) => {
  // Background
  const bgTexture = mgr.textureLoader.load('/dance/references/general/bg.jpg');
  bgTexture.repeat.x = -1;
  bgTexture.offset.x = 1;
  bgTexture.colorSpace = THREE.SRGBColorSpace;
  const radius = 50;
  const segments = 180;
  const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, 60, segments, 1, true, 0, 2 * Math.PI);
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: bgTexture,
    side: THREE.BackSide,
    transparent: true,
  });
  const backgroundPlane = new THREE.Mesh(cylinderGeometry, planeMaterial);
  backgroundPlane.position.y = 13;
  mgr.scene.add(backgroundPlane);

  // Floor
  const groundTexture = mgr.textureLoader.load('/dance/references/general/floor.jpg');
  groundTexture.colorSpace = THREE.SRGBColorSpace;
  groundTexture.repeat.y = 4;
  groundTexture.repeat.x = 2;
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  const groundGeometry = new THREE.PlaneGeometry(100, 100); // Width and height
  const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundTexture
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  mgr.scene.add(ground);

  // // Moon
  // const loader = new FBXLoader();
  // const moon:Group = await new Promise(resolve => loader.load('/dance/references/general/moon.fbx', resolve));
  // moon.scale.setScalar(1);
  // moon.position.set(-100, 80, -100);
  // moon.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material.color.multiplyScalar(10); // Makes it 50% brighter
  //   }
  // });
  // mgr.scene.add(moon);
  // mgr.onTick(delta => {
  //   moon.rotation.y += (2 * Math.PI / 10) * delta * 0.1;
  // });
  //
  // mgr.scene.add(createStars());
};

function createStars ():THREE.Group {
  const starGeometry = new THREE.SphereGeometry(0.25, 8, 8); // Small sphere
  const starMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    new THREE.MeshBasicMaterial({ color: 0xcccccc }),
    new THREE.MeshBasicMaterial({ color: 0x999999 }),
  ]; // White color

// Create a group to hold all stars
  const starfield = new THREE.Group();

// Create 200 stars
  for (let i = 0; i < 500; i++) {
    // Create random spherical coordinates
    const phi = Math.random() * Math.PI * 2; // Random angle around Y axis
    const theta = Math.acos(2 * Math.random() - 1); // Random angle from Y axis
    const radius = 100; // Distance from origin

    // Convert spherical coordinates to Cartesian (x, y, z)
    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(theta);

    // Create the star mesh
    const star = new THREE.Mesh(starGeometry, _.sample(starMaterials));

    // Position the star
    star.position.set(x, y, z);

    // Add the star to our group
    starfield.add(star);
  }

// Add the starfield group to your scene
  return starfield;
}
