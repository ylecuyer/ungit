import ko from 'knockout';
import components from '/source/js/components.js';
import storage from '/source/js/storage.js';
import $ from 'jquery';
import appTemplate from './app.html?raw';

components.register('app', (args) => {
  return new AppViewModel(args.appContainer, args.server);
});
const appElement = document.createElement('template');
appElement.id = 'app';
appElement.innerHTML = appTemplate;
document.body.appendChild(appElement);

class AppViewModel {
  constructor(appContainer, server) {
    this.appContainer = appContainer;
    this.server = server;
    this.template = 'app';
    if (window.location.search.indexOf('noheader=true') < 0) {
      this.header = components.create('header', { app: this });
    }
    this.sidebar = components.create('sidebar');
    this.modal = ko.observable(null);
    this.repoList = ko.observableArray(this.getRepoList()); // visitedRepositories is legacy, remove in the next version
    this.repoList.subscribe((newValue) => {
      storage.setItem('repositories', JSON.stringify(newValue));
    });
    this.content = ko.observable(components.create('home', { app: this }));
    this.currentVersion = ko.observable();
    this.latestVersion = ko.observable();
    this.showNewVersionAvailable = ko.observable();
    this.newVersionInstallCommand =
      (ungit.platform == 'win32' ? '' : 'sudo -H ') + 'npm update -g ungit';
    this.gitVersionErrorDismissed = ko.observable(storage.getItem('gitVersionErrorDismissed'));
    this.gitVersionError = ko.observable();
    this.gitVersionErrorVisible = ko.computed(() => {
      return (
        !ungit.config.gitVersionCheckOverride &&
        this.gitVersionError() &&
        !this.gitVersionErrorDismissed()
      );
    });
  }
  getRepoList() {
    const localStorageRepo = JSON.parse(
      storage.getItem('repositories') || storage.getItem('visitedRepositories') || '[]'
    );
    const newRepos = localStorageRepo
      .concat(ungit.config.defaultRepositories || [])
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    storage.setItem('repositories', JSON.stringify(newRepos));
    return newRepos;
  }
  updateNode(parentElement) {
    ko.renderTemplate('app', this, {}, parentElement);
  }
  shown() {
    this.server
      .getPromise('/latestversion')
      .then((version) => {
        if (!version) return;
        this.currentVersion(version.currentVersion);
        this.latestVersion(version.latestVersion);
        this.showNewVersionAvailable(!ungit.config.ungitVersionCheckOverride && version.outdated);
      })
      .catch((e) => this.server.unhandledRejection(e));
    this.server
      .getPromise('/gitversion')
      .then((gitversion) => {
        if (gitversion && !gitversion.satisfied) {
          this.gitVersionError(gitversion.error);
        }
      })
      .catch((e) => this.server.unhandledRejection(e));
  }
  updateAnimationFrame(deltaT) {
    if (this.content() && this.content().updateAnimationFrame)
      this.content().updateAnimationFrame(deltaT);
  }
  onProgramEvent(event) {
    if (event.event === 'request-credentials') {
      this._handleCredentialsRequested(event);
    } else if (event.event === 'request-remember-repo') {
      this._handleRequestRememberRepo(event);
    } else if (event.event === 'modal-show-dialog') {
      this.showModal(event.modal);
    } else if (event.event === 'modal-close-dialog') {
      $('.modal.fade').modal('hide');
      this.modal(undefined);
    }

    if (this.content() && this.content().onProgramEvent) {
      this.content().onProgramEvent(event);
    }
    if (this.header && this.header.onProgramEvent) {
      this.header.onProgramEvent(event);
    }
  }
  _handleRequestRememberRepo(event) {
    const repoPath = event.repoPath;
    if (this.repoList.indexOf(repoPath) != -1) return;
    this.repoList.push(repoPath);
  }
  _handleCredentialsRequested(event) {
    // Only show one credentials dialog if we're asked to show another one while the first one is open
    // This happens for instance when we fetch nodes and remote tags at the same time
    if (!this._isShowingCredentialsDialog) {
      this._isShowingCredentialsDialog = true;
      components.showModal('credentialsmodal', { remote: event.remote });
    }
  }
  showModal(modal) {
    this.modal(modal);
    console.log("modal", modal);
    $('dialog')[0].showModal();
  }
  dismissGitVersionError() {
    storage.setItem('gitVersionErrorDismissed', true);
    this.gitVersionErrorDismissed(true);
  }
  dismissNewVersion() {
    this.showNewVersionAvailable(false);
  }
  templateChooser(data) {
    if (!data) return '';
    return data.template;
  }
}

export default AppViewModel;
