
const ko = require('knockout');
const components = require('../../public/source/components');
const programEvents = require('../../public/source/program-events');
const navigation = require('../../public/source/navigation');

components.register('gitErrors', args => new GitErrorsViewModel(args.server, args.repoPath));

class GitErrorsViewModel {
  constructor(server, repoPath) {
    this.server = server;
    this.repoPath = repoPath;
    this.gitErrors = ko.observableArray();
  }

  updateNode(parentElement) {
    ko.renderTemplate('gitErrors', this, {}, parentElement);
  }

  onProgramEvent(event) {
    if (event.event == 'git-error') this._handleGitError(event);
  }

  _handleGitError(event) {
    if (event.data.repoPath != this.repoPath()) return;
    this.gitErrors.push(new GitErrorViewModel(this, this.server, event.data));
  }
}

class GitErrorViewModel {
  constructor(gitErrors, server, data) {
    const self = this;
    this.gitErrors = gitErrors;
    this.server = server;
    this.tip = data.tip;
    this.isWarning = data.isWarning || false;
    this.command = data.command;
    this.error = data.error;
    this.stdout = data.stdout;
    this.stderr = data.stderr;
    this.showEnableBugtracking = ko.observable(false);
    this.bugReportWasSent = ungit.config.bugtracking;

    if (!data.shouldSkipReport && !ungit.config.bugtracking) {
      this.server.getPromise('/userconfig')
        .then(userConfig => { self.showEnableBugtracking(!userConfig.bugtracking); });
    }
  }

  dismiss() {
    this.gitErrors.gitErrors.remove(this);
  }

  enableBugtrackingAndStatistics() {
    this.server.getPromise('/userconfig')
      .then(userConfig => {
        userConfig.bugtracking = true;
        userConfig.sendUsageStatistics = true;
        return this.server.postPromise('/userconfig', userConfig)
      }).then(() => { this.showEnableBugtracking(false); })
  }
}
