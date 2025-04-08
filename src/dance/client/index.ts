
import { DanceManager } from './manager';
import { watchForNewDancers } from './updater';
import { INewDancer } from './types';

void (async () => {
  const manager = new DanceManager();
  await manager.load();

  window.manager = manager;

  const hash = String(window.location.hash || '').split('#').join('');
  if (hash) return;

  watchForNewDancers(async (dancers:INewDancer[]) => {
    for (const d of dancers) {
      await manager.loadOutfit({
        type: 'roblox',
        imgUrl: d.url,
      });
    }
  });
})();

