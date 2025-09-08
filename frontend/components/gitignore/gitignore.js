import ko from 'knockout';
import components from '/source/js/components.js';
import octicons from '@primer/octicons';
import gitignoreTemplate from './gitignore.html?raw';
import { createApp } from 'vue';
import Gitignore from '../Gitignore.vue';
import Octicon from '../Octicon.vue';

components.register('gitignore', (args) => new GitignoreViewModel(args));
const gitignoreElement = document.createElement('template');
gitignoreElement.id = 'gitignore';
gitignoreElement.innerHTML = gitignoreTemplate;
document.body.appendChild(gitignoreElement);

class GitignoreViewModel {
  constructor({ server, repoPath }) {
    this.repoPath = repoPath;
    this.server = server;
    this.ignoreIcon = octicons.file.toSVG({ height: 18 });
  }

  updateNode(parentElement) {
    ko.renderTemplate('gitignore', this, {}, parentElement);
    app = createApp(Gitignore, { repoPath: this.repoPath() });
    app.component('Octicon', Octicon);
    app.mount('#gitignore-app');
  }
}

export default GitignoreViewModel;
