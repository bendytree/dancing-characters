
import * as THREE from 'three';
import { setupDanceBackdrop } from './backdrop';
import { DanceCamera } from './camera';
import { DanceCharacter, IDanceCharacterType } from './character';
import _ from 'lodash';
import { DanceTime } from './time';

declare type IDanceManagerTick = (delta:number) => void;

export interface IDanceAddCharacterArgs {
  type: IDanceCharacterType;
  imgUrl: string;
}

export class DanceManager {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public width: number;
  public height: number;
  public clock: THREE.Clock;
  private ticks:IDanceManagerTick[] = [];
  public camera: DanceCamera;
  public textureLoader: THREE.TextureLoader;
  characters: DanceCharacter[] = [];
  private outfitIndex = 2;
  public time:DanceTime;

  constructor() {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.time = new DanceTime(this.clock);

    this.textureLoader = new THREE.TextureLoader();

    // Renderer setup
    const aspectRatio = 16 / 9;
    this.width = window.innerWidth;
    this.height = this.width / aspectRatio;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(this.width, this.height);
    //this.renderer.shadowMap.enabled = true;
    //this.renderer.setClearColor(0x000000, 0);
    //this.renderer.setClearColor(0xEE949E, 1);
    this.renderer.setClearColor(0x8BBAF9, 1);
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = `${(window.innerHeight - this.height) / 2}px`;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3); // Increased intensity to 1.0
    this.scene.add(ambientLight);


    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // white light, full intensity
    // directionalLight.position.set(0, 20, 20);
    // directionalLight.target.position.set(0, 0, 0);
    // this.scene.add(directionalLight);
    // this.scene.add(directionalLight.target);



    this.camera = new DanceCamera(this);

    setupDanceBackdrop(this);

    window.addEventListener('resize', () => location.reload(), false);

    const tick = () => {
      requestAnimationFrame(tick);
      const delta = this.clock.getDelta();
      for (const t of this.ticks) {
        t(delta);
      }
      this.camera.render();
    };
    tick();

  }

  onTick(tick:IDanceManagerTick) {
    this.ticks.push(tick);
  }

  private async addCharacter(args: IDanceAddCharacterArgs) {
    const xGap = 8;
    const isLeft = this.characters.length % 2 === 1;
    const idx = Math.floor(this.characters.length / 2);
    const x = (isLeft ? -1 : 1) * ((xGap / 2) + (xGap * idx));
    const character = new DanceCharacter({
      ...args,
      manager: this,
      pos: { z: -25, x: x },
    });
    this.characters.push(character);
    await character.load();
  }

  async load () {
    _.times(4, (i) => {
      const n = {
        0: 3,
        1: 2,
        2: 4,
        3: 1,
      }[i];
      void this.addCharacter({
        type: 'roblox',
        imgUrl: `/dance/references/characters/char-${n}.jpg`,
      });
    });
  }

  async loadOutfit(args: IDanceAddCharacterArgs){
    const character = this.characters[this.outfitIndex % this.characters.length];
    this.outfitIndex += 1;
    await character.updateOutfit(args);
  }

}
