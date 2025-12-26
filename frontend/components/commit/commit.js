import ko from 'knockout';
import components from '/source/js/components.js';
import commitTemplate from './commit.html?raw';
import { createApp } from 'vue';
import Commit from '../Commit.vue';
import Octicon from '../Octicon.vue';
import CommitDiff from '../CommitDiff.vue';
import { repo } from '@primer/octicons';

components.register('commit', (args) => new CommitViewModel(args));
const commitElement = document.createElement('template');
commitElement.id = 'commit';
commitElement.innerHTML = commitTemplate;
document.body.appendChild(commitElement);

class CommitViewModel {
  constructor(gitNode) {
    this.gitNode = gitNode;
    this.graph = gitNode.graph;
    this.repoPath = gitNode.graph.repoPath;
    this.sha1 = gitNode.sha1;
    this.server = gitNode.graph.server;
    this.highlighted = gitNode.highlighted;
    this.nodeIsMousehover = gitNode.nodeIsMousehover;
    this.selected = gitNode.selected;
    this.element = ko.observable();
    this.fileLineDiffs = ko.observable();
    this.parents = ko.observable();

    this.showCommitDiff = ko.computed(
      () => this.fileLineDiffs() && this.fileLineDiffs().length > 0
    );

    this.diffStyle = ko.computed(() => {
      const marginLeft = Math.min(gitNode.branchOrder() * 70, 450) * -1;
      if (this.selected() && this.element())
        return { 'margin-left': `${marginLeft}px`, width: `${window.innerWidth - 220}px` };
      else return {};
    });
  }

  updateNode(parentElement) {
    ko.renderTemplate('commit', this, {}, parentElement);
    this.app = createApp(Commit, {
      gitNode: this.gitNode,
      sha1: this.gitNode.sha1,
      pgpVerifiedString: this.gitNode.pgpVerifiedString(),
      repoPath: this.repoPath,
      server: this.server,
      showDiffButtons: this.gitNode.selected,
    });
    this.app.component('Octicon', Octicon);
    this.app.component('CommitDiff', CommitDiff);
    this.vm = this.app.mount("#commit-app-" + this.sha1);
  }

  setData(args) {
    setTimeout(() => {
      // this.vm._setData(args);
    }, 500);
  }

  updateLastAuthorDateFromNow(deltaT) {
    if (this.vm) {
      this.vm._updateLastAuthorDateFromNow(deltaT);
    }
  }

  updateAnimationFrame(deltaT) {
    this.updateLastAuthorDateFromNow(deltaT);
  }

  stopClickPropagation(data, event) {
    event.stopImmediatePropagation();
  }

  copyHash() {
    navigator.clipboard.writeText(this.sha1);
  }

  gotoCommit(sha1) {
    const node = this.graph.nodesById[sha1];
    if (node) {
      node.toggleSelected();
    }
  }
}

export default CommitViewModel;
