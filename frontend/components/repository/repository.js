import ko from 'knockout';
import components from '/source/js/components.js';
import { encodePath } from '../../../backend/source/address-parser.js';
import repositoryTemplate from './repository.html?raw';

components.register('repository', (args) => new RepositoryViewModel(args.server, args.path));
const repositoryElement = document.createElement('template');
repositoryElement.id = 'repository';
repositoryElement.innerHTML = repositoryTemplate;
document.body.appendChild(repositoryElement);

class RepositoryViewModel {
  constructor(server, path) {
    this.server = server;
    this.isBareDir = path.status() === 'bare';
    this.repoPath = path.repoPath;
    this.gitErrors = components.create('gitErrors', { server, repoPath: this.repoPath });
    this.graph = components.create('graph', { server, repoPath: this.repoPath });
    this.remotes = components.create('remotes', { server, repoPath: this.repoPath });
    this.submodules = components.create('submodules', { server, repoPath: this.repoPath });
    this.gitignore = components.create('gitignore', { server, repoPath: this.repoPath });
    this.stash = this.isBareDir
      ? {}
      : components.create('stash', { server, repoPath: this.repoPath });
    this.staging = this.isBareDir
      ? {}
      : components.create('staging', { server, repoPath: this.repoPath, graph: this.graph });
    this.branches = components.create('branches', {
      server,
      graph: this.graph,
      repoPath: this.repoPath,
    });
    this.repoPath.subscribe((value) => {
      this.server.watchRepository(value);
    });
    this.server.watchRepository(this.repoPath());
    this.showLog = this.isBareDir ? ko.observable(true) : true; this.staging.vm?.isStageValid;
    this.refreshSubmoduleStatus();
  }

  updateNode(parentElement) {
    ko.renderTemplate('repository', this, {}, parentElement);
  }

  onProgramEvent(event) {
    if (this.gitErrors.onProgramEvent) this.gitErrors.onProgramEvent(event);
    if (this.graph.onProgramEvent) this.graph.onProgramEvent(event);
    if (this.staging.onProgramEvent) this.staging.onProgramEvent(event);
    if (this.stash.onProgramEvent) this.stash.onProgramEvent(event);
    if (this.remotes.onProgramEvent) this.remotes.onProgramEvent(event);
    if (this.submodules.onProgramEvent) this.submodules.onProgramEvent(event);
    if (this.branches.onProgramEvent) this.branches.onProgramEvent(event);
    if (event.event == 'connected') this.server.watchRepository(this.repoPath());

    // If we get a reconnect event it's usually because the server crashed and then restarted
    // or something like that, so we need to tell it to start watching the path again
  }

  updateAnimationFrame(deltaT) {
    if (this.graph.updateAnimationFrame) this.graph.updateAnimationFrame(deltaT);
  }

}

export default RepositoryViewModel;
