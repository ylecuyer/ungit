import ko from 'knockout';
import _ from 'lodash';
import octicons from '@primer/octicons';
import components from '/source/js/components.js';
import programEvents from '/source/js/program-events.js';
import { ComponentRoot } from '../ComponentRoot';
import submodulesTemplate from './submodules.html?raw';
import { createApp } from 'vue';
import Submodules from '../Submodules.vue';
import Octicon from '../Octicon.vue';

components.register('submodules', (args) => new SubmodulesViewModel(args.server, args.repoPath));
const submodulesElement = document.createElement('template');
submodulesElement.id = 'submodules';
submodulesElement.innerHTML = submodulesTemplate;
document.body.appendChild(submodulesElement);

class SubmodulesViewModel extends ComponentRoot {
  constructor(server, repoPath) {
    super();
    this.repoPath = repoPath;
    this.server = server;
  }

  updateNode(parentElement) {
    ko.renderTemplate('submodules', this, {}, parentElement);
    let app = createApp(Submodules, { repoPath: this.repoPath() });
    app.component('Octicon', Octicon);
    app.mount('#submodules-app');
  }
}

export default SubmodulesViewModel;
