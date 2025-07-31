import ko from 'knockout';
import components from '/notpublic/source/components.js';

components.register('crash', (err) => new CrashViewModel(err));

class CrashViewModel {
  constructor(err) {
    this.eventcause = err ? err : 'unknown error';
  }

  updateNode(parentElement) {
    ko.renderTemplate('crash', this, {}, parentElement);
  }
}

export default CrashViewModel;
