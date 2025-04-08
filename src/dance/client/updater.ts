import { INewDancer } from './types';

let lastTime = 0;

export const watchForNewDancers = async (cb:((dancers:INewDancer[]) => any)) => {
  const check = async () => {
    let dancers:INewDancer[] = await fetch('/get-dance-model', {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    }).then(x => x.json());

    dancers = dancers?.filter(d => d.time > lastTime) || [];

    for (const d of dancers) {
      lastTime = Math.max(d.time, lastTime);
    }

    // console.log(`new dancers: ${dancers.length}`);

    if (dancers.length) {
      cb(dancers);
    }

  };

  void check();

  setInterval(check, 1000 * 10);
};
