import ko from 'knockout';
import components from '/source/js/components.js';
import commitTemplate from './commit.html?raw';
<<<<<<< Updated upstream
=======
import { createApp } from 'vue';
import Commit from '../Commit.vue';
import Octicon from '../Octicon.vue';
import CommitDiff from '../CommitDiff.vue';
>>>>>>> Stashed changes

components.register('commit', (args) => new CommitViewModel(args));
const commitElement = document.createElement('template');
commitElement.id = 'commit';
commitElement.innerHTML = commitTemplate;
document.body.appendChild(commitElement);

class CommitViewModel {
  constructor(gitNode) {
    this.graph = gitNode.graph;
    this.repoPath = gitNode.graph.repoPath;
    this.sha1 = gitNode.sha1;
    this.server = gitNode.graph.server;
    this.highlighted = gitNode.highlighted;
    this.nodeIsMousehover = gitNode.nodeIsMousehover;
    this.selected = gitNode.selected;
    this.element = ko.observable();
<<<<<<< Updated upstream
    this.message = ko.observable();
    this.title = ko.observable();
    this.body = ko.observable();
    this.authorDate = ko.observable();
    this.authorDateFromNow = ko.observable();
    this.authorName = ko.observable();
    this.authorEmail = ko.observable();
=======
>>>>>>> Stashed changes
    this.fileLineDiffs = ko.observable();
    this.parents = ko.observable();
<<<<<<< Updated upstream
    this.authorGravatar = ko.computed(() => md5((this.authorEmail() || '').trim().toLowerCase()));
    this.gitCommitIcon = octicons['git-commit'].toSVG({ height: 18 });
=======
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
  }

  setData(args) {
    const message = args.message.split('\n');
    this.message(args.message);
    this.title(message[0]);
    this.body(message.slice(message[1] ? 1 : 2).join('\n'));
    this.authorDate(moment(new Date(args.authorDate)));
    this.authorDateFromNow(this.authorDate().fromNow());
    this.authorName(args.authorName);
    this.authorEmail(args.authorEmail);
    this.numberOfAddedLines(args.additions);
    this.numberOfRemovedLines(args.deletions);
    this.parents(args.parents || []);
    this.fileLineDiffs(args.fileLineDiffs);
    this.commitDiff = ko.observable(
      components.create('commitDiff', {
        fileLineDiffs: this.fileLineDiffs(),
        sha1: this.sha1,
        repoPath: this.repoPath,
        server: this.server,
        showDiffButtons: this.selected,
      })
    );
=======
    this.app = createApp(Commit, {
      gitNode: this.gitNode,
      sha1: this.gitNode.sha1,
      pgpVerifiedString: this.gitNode.pgpVerifiedString(),
    });
    this.app.component('Octicon', Octicon);
    this.app.component('CommitDiff', CommitDiff);
    this.vm = this.app.mount("#commit-app-" + this.sha1);
  }

  setData(args) {
    setTimeout(() => {
      this.vm._setData(args);
    }, 500);
>>>>>>> Stashed changes
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
