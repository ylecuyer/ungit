import ko from 'knockout';
import components from '/notpublic/source/components.js';
import crashTemplate from './crash.html?raw';

components.register('crash', (err) => new CrashViewModel(err));
const crashElement = document.createElement('template');
crashElement.id = 'crash';
crashElement.innerHTML = crashTemplate;
document.body.appendChild(crashElement);

class CrashViewModel {
  constructor(err) {
    this.eventcause = err ? err : 'unknown error';
  }

  updateNode(parentElement) {
    ko.renderTemplate('crash', this, {}, parentElement);
  }
}

export default CrashViewModel;
