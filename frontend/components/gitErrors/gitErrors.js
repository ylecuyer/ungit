import ko from 'knockout';
import components from '/source/js/components.js';
import gitErrorTemplate from './gitErrors.html?raw';
import { createApp } from 'vue';
import GitErrors from '../GitErrors.vue';
import Octicon from '../Octicon.vue';

components.register('gitErrors', (args) => new GitErrorsViewModel(args.server, args.repoPath));
const gitErrorsElement = document.createElement('template');
gitErrorsElement.id = 'gitErrors';
gitErrorsElement.innerHTML = gitErrorTemplate;
document.body.appendChild(gitErrorsElement);

class GitErrorsViewModel {
  constructor(server, repoPath) {
    this.server = server;
    this.repoPath = repoPath;
  }

  updateNode(parentElement) {
    ko.renderTemplate('gitErrors', this, {}, parentElement);
    let app = createApp(GitErrors, { repoPath: this.repoPath() });
    app.component('Octicon', Octicon);
    app.mount('#git-errors-app');
  }

}