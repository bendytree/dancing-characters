
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { DanceManager } from './manager';
import { DanceCharacter } from './character';
import _ from 'lodash';


CameraControls.install({ THREE });

export class DanceCamera {
  private camera: THREE.PerspectiveCamera;
  private mgr: DanceManager;
  private cameraControls: CameraControls;
  private focusedCharacter: DanceCharacter = null;
  private isBack: boolean = false;
  private isHigh: boolean = false;

  constructor(mgr:DanceManager) {
    this.mgr = mgr;
    this.camera = new THREE.PerspectiveCamera(75, mgr.width / mgr.height, 0.1, 1000);
    this.camera.near = 0.01;
    this.camera.far = 1000;

    this.cameraControls = new CameraControls(this.camera, mgr.renderer.domElement);
    this.cameraControls.setPosition(0, 10, 10);
    this.cameraControls.setTarget(0, 6, 0);

    mgr.onTick(this.onTick.bind(this))
  }

  onTick (delta:number) {
    if (!this.focusedCharacter) this.refocus();

    this.lookAtCharacter();

    this.cameraControls.update(delta);
  }

  render () {
    this.mgr.renderer.render(this.mgr.scene, this.camera);
  }

  refocus () {
    this.focusedCharacter = _.sample(this.mgr.characters.filter(c => c !== this.focusedCharacter));
    this.isHigh = Math.random() > 0.5;
    this.isBack = Math.random() < 0.15;
    if (!this.focusedCharacter) return;

    setTimeout(() => this.refocus(), 5000);
  }

  private lookAtCharacter() {
    const pos = this.focusedCharacter?.headPosition();
    if (!pos) return;

    if (this.isBack) {
      this.cameraControls.setPosition(pos.x, 10, pos.z - 20, true);
      this.cameraControls.setTarget(pos.x, pos.y, pos.z, true);
    } else {
      this.cameraControls.setPosition(pos.x * 1.5, (this.isHigh ? pos.y * 2 : pos.y), pos.z + 10, true);
      this.cameraControls.setTarget(pos.x, pos.y, pos.z, true);
    }
  }
}
