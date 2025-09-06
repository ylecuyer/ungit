
import ko from 'knockout';
import _ from 'lodash';
import octicons, { repo } from '@primer/octicons';
import moment from 'moment';
import components from '/source/js/components.js';
import storage from '/source/js/storage.js';
import { ComponentRoot } from '../ComponentRoot';
import stashTemplate from './stash.html?raw';

import { createApp } from 'vue';
import Stash from '../Stash.vue';
import StashItem from '../StashItem.vue';
import Octicon from '../Octicon.vue';

components.register('stash', (args) => new StashViewModel(args.server, args.repoPath));
const stashElement = document.createElement('template');
stashElement.id = 'stash';
stashElement.innerHTML = stashTemplate;
document.body.appendChild(stashElement);

class StashItemViewModel {
  constructor(stash, data) {
    this.stash = stash;
    this.server = stash.server;
    this.id = data.reflogId;
    this.sha1 = data.sha1;
    this.title = `${data.reflogName} ${moment(new Date(data.commitDate)).fromNow()}`;
    this.message = data.message;
    this.showCommitDiff = ko.observable(false);

    this.commitDiff = ko.observable(
      components.create('commitDiff', {
        fileLineDiffs: data.fileLineDiffs.slice(),
        sha1: this.sha1,
        repoPath: stash.repoPath,
        server: stash.server,
        showDiffButtons: ko.observable(true),
      })
    );
    this.dropIcon = octicons.x.toSVG({ height: 18 });
    this.applyIcon = octicons.pencil.toSVG({ height: 20 });
  }

  drop() {
    components.showModal('yesnomodal', {
      title: 'Are you sure you want to drop the stash?',
      details: 'This operation cannot be undone.',
      closeFunc: (isYes) => {
        if (!isYes) return;
        this.server
          .delPromise(`/stashes/${this.id}`, { path: this.stash.repoPath() })
          .catch((e) => this.server.unhandledRejection(e));
      },
    });
  }

  toggleShowCommitDiffs() {
    this.showCommitDiff(!this.showCommitDiff());
  }
}

class StashViewModel extends ComponentRoot {
  constructor(server, repoPath) {
    super();
    this.server = server;
    this.repoPath = repoPath;
  }

  updateNode(parentElement) {
    ko.renderTemplate('stash', this, {}, parentElement);
    app = createApp(Stash, { repoPath: this.repoPath() });
    app.component('Octicon', Octicon);
    app.component('StashItem', StashItem);
    app.mount('#stash-app');
  }


}

export { StashViewModel as default, StashItemViewModel };
