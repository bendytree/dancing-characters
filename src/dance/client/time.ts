
import * as THREE from 'three';

export class DanceTime {
  private clock: THREE.Clock;

  constructor(clock:THREE.Clock) {
    this.clock = clock;
  }

  setTimeout(args:{ ms: number; cb:() => void; runLate: boolean }){
    setTimeout(args.cb, args.ms);
  }
}

