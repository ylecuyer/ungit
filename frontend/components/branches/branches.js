import ko from 'knockout';
import components from '/source/js/components.js';
import { ComponentRoot } from '../ComponentRoot';
import branchesTemplate from './branches.html?raw';
import { createApp } from 'vue';
import Branches from '../Branches.vue';
import Octicon from '../Octicon.vue';

components.register('branches', (args) => {
  return new BranchesViewModel(args.server, args.graph, args.repoPath);
});
const branchesElement = document.createElement('template');
branchesElement.id = 'branches';
branchesElement.innerHTML = branchesTemplate;
document.body.appendChild(branchesElement);

class BranchesViewModel extends ComponentRoot {
  constructor(server, graph, repoPath) {
    super();
    this.repoPath = repoPath;
    this.server = server;
    this.graph = graph;
  }

  updateNode(parentElement) {
    ko.renderTemplate('branches', this, {}, parentElement);
    let app = createApp(Branches, { repoPath: this.repoPath(), graph: this.graph });
    app.component('Octicon', Octicon);
    app.mount('#branches-app');
  }
}

export default BranchesViewModel;
