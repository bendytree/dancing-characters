import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import  gsap from 'gsap';
import { Bone, Group } from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { DanceManager, IDanceAddCharacterArgs } from './manager';
import _ from 'lodash';

export declare type IDanceCharacterType = 'roblox';

const loader = new FBXLoader();

const fbxs = {
  roblox: new Promise(resolve => loader.load('/dance/references/characters/thriller-1.fbx', resolve)),
  thriller1: new Promise(resolve => loader.load('/dance/references/characters/thriller-1.fbx', resolve)),
  thriller2: new Promise(resolve => loader.load('/dance/references/characters/thriller-1.fbx', resolve)),
  thriller3: new Promise(resolve => loader.load('/dance/references/characters/thriller-1.fbx', resolve)),
} as const;

export interface IDanceCharacterArgs {
  type: IDanceCharacterType;
  imgUrl: string;
  pos: { x: number; z: number };
  manager: DanceManager;
}

export class DanceCharacter {
  private type: IDanceCharacterType;
  private imgUrl: string;
  private manager: DanceManager;
  public fbx: Group;
  public topBone: Bone;
  public rootBone: Bone;
  public pos: { x: number; z: number };
  private mixer: THREE.AnimationMixer;
  private action: THREE.AnimationAction;

  constructor(args:IDanceCharacterArgs) {
    Object.assign(this, args);
  }

  headPosition ():THREE.Vector3 {
    if (!this.topBone) return;
    const worldPosition = new THREE.Vector3();
    this.topBone.getWorldPosition(worldPosition);
    return worldPosition;
  }

  async load () {
    const origFbx = await fbxs[this.type] as Group;
    const fbx = SkeletonUtils.clone(origFbx);
    this.fbx = fbx as Group;
    fbx.position.set(this.pos.x, 0, this.pos.z);
    this.manager.scene.add(fbx);

    fbx.traverse(function(obj) {
      obj.frustumCulled = false;
    });

    fbx.traverse(async (child) => {
      if (!child.isMesh) return;
      child.material = child.material.clone();
      const map = this.manager.textureLoader.load(this.imgUrl);
      map.colorSpace = THREE.SRGBColorSpace;
      child.material.map = map;
      child.material.needsUpdate = true;
    });

    fbx.scale.setScalar(2);
    fbx.frustumCulled = false;



    const bones = findAllBones(fbx);
    this.topBone = _.maxBy(bones, b => b.position.y);
    this.rootBone = bones[0];

    // this.mixer = new THREE.AnimationMixer(fbx);
    // const animation = fbx.animations[2];
    // if (animation) {
    //   this.mixer.clipAction(animation).play();
    // }

    await (async () => {
      const initialRootBonePosition = this.rootBone.position.clone();
      this.mixer = new THREE.AnimationMixer(fbx);
      const [t1, t2, t3] = <THREE.Group[]>[await fbxs.thriller1, await fbxs.thriller2, await fbxs.thriller3];
      const animations:THREE.AnimationClip[] = [];
      animations.push(_.last(t1.animations));
      animations.push(t2.animations[0]);
      animations.push(t3.animations[0]);
      let currentClipIndex = 0;
      let an = animations[currentClipIndex];
      this.action = this.mixer.clipAction(an);
      this.action.loop = THREE.LoopOnce;
      this.action.clampWhenFinished = true;
      this.action.play();

      const next = () => {
        const pos = this.headPosition();
        this.action.stop();
        currentClipIndex = (currentClipIndex + 1) % animations.length;
        var isFirst = currentClipIndex === 0;

        this.action = this.mixer.clipAction(animations[currentClipIndex]);
        this.action.loop = THREE.LoopOnce;
        this.action.clampWhenFinished = true;
        this.action.play();

        const onLoop = () => {
          if (isFirst) {
            fbx.position.copy(new THREE.Vector3(this.pos.x, 0, this.pos.z));
            this.rootBone.position.copy(initialRootBonePosition);
          }else{
            fbx.position.x = pos.x;
            fbx.position.z = pos.z;
          }
          this.mixer.removeEventListener('loop', onLoop);
        };
        setTimeout(onLoop, 0);
      }

      this.mixer.addEventListener('finished', next);
    })();

    this.manager.onTick((delta) => {
      this.mixer.update(delta);
    });

    //setTimeout(() => this.transitionClothes(), 4000);
  }

  transitionClothes(cb) {
    const ogScale = this.fbx.scale.x;
    gsap.to(this.fbx.scale, {
      ease: 'power1.out',
      y: 0,
      duration: 0.2,
      onComplete: () => {
        this.fbx.visible = false;
        cb();
        setTimeout(() => {
          this.fbx.visible = true;
          gsap.to(this.fbx.scale, {
            y: ogScale,
            duration: 0.2
          });
        }, 100);
      }
    });
  }

  async updateOutfit(args: IDanceAddCharacterArgs) {
    const fbx = this.fbx;
    const map = await new Promise(resolve => this.manager.textureLoader.load(args.imgUrl, resolve));
    this.transitionClothes(() => {
      fbx.traverse(async (child) => {
        if (!child.isMesh) return;
        child.material = child.material.clone();
        map.colorSpace = THREE.SRGBColorSpace;
        child.material.map = map;
        child.material.needsUpdate = true;
      });
    });

  }
}


function findAllBones(node):Bone[] {
  const bones = [];
  if (node.isBone) {
    bones.push(node);
  }

  if (node.children) {
    for (let child of node.children) {
      bones.push(...findAllBones(child));
    }
  }

  return bones;
}
