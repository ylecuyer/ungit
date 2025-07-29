import programEvents from 'ungit-program-events-es6';
import hasher from 'hasher';
import crossroads from 'crossroads';

const navigation = {};
export default navigation;

navigation.hasher = hasher;
navigation.crossroads = crossroads;

navigation.browseTo = function (path) {
  hasher.setHash(path);
};

navigation.init = function () {
  //setup hasher
  function parseHash(newHash, oldHash) {
    crossroads.parse(newHash);
    programEvents.dispatch({ event: 'navigation-changed', path: newHash, oldPath: oldHash });
  }
  hasher.initialized.add(parseHash); //parse initial hash
  hasher.changed.add(parseHash); //parse hash changes
  hasher.raw = true;

  hasher.init();
};
