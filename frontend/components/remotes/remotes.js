import ko from 'knockout';
import components from '/source/js/components.js';
import remoteTemplate from './remotes.html?raw';

import { createApp } from 'vue';
import Remotes from '../Remotes.vue';
import Octicon from '../Octicon.vue';

components.register('remotes', (args) => new RemotesViewModel(args.server, args.repoPath));
const remoteElement = document.createElement('template');
remoteElement.id = 'remotes';
remoteElement.innerHTML = remoteTemplate;
document.body.appendChild(remoteElement);

class RemotesViewModel {
  constructor(server, repoPath) {
    this.repoPath = repoPath;
    this.server = server;
  }

  updateNode(parentElement) {
    ko.renderTemplate('remotes', this, {}, parentElement);
    app = createApp(Remotes, { repoPath: this.repoPath() });
    app.component('Octicon', Octicon);
    app.mount('#remotes-app');
  }
}

export default RemotesViewModel;
