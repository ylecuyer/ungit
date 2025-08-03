import ko from 'knockout';
import octicons from '@primer/octicons';
import components from '/source/js/components.js';
import { encodePath } from '../../../backend/source/address-parser.js';
import homeTemplate from './home.html?raw';

components.register('home', (args) => new HomeViewModel(args.app));
const homeElement = document.createElement('template');
homeElement.id = 'home';
homeElement.innerHTML = homeTemplate;
document.body.appendChild(homeElement);

class HomeRepositoryViewModel {
  constructor(home, path) {
    this.home = home;
    this.app = home.app;
    this.server = this.app.server;
    this.path = path;
    this.title = path;
    this.link = `/#/repository?path=${encodePath(path)}`;
    this.pathRemoved = ko.observable(false);
    this.remote = ko.observable('...');
    this.updateState();
    this.removeIcon = octicons.x.toSVG({ height: 18 });
    this.alertIcon = octicons.alert.toSVG({ height: 18 });
    this.arrowIcon = octicons['arrow-right'].toSVG({ height: 24 });
  }

  updateState() {
    this.server
      .getPromise(`/fs/exists?path=${encodePath(this.path)}`)
      .then((exists) => {
        this.pathRemoved(!exists);
      })
      .catch((e) => this.server.unhandledRejection(e));
    this.server
      .getPromise(`/remotes/origin?path=${encodePath(this.path)}`)
      .then((remote) => {
        this.remote(remote.address.replace(/\/\/.*?@/, '//***@'));
      })
      .catch(() => {
        this.remote('');
      });
  }

  remove() {
    this.app.repoList.remove(this.path);
    this.home.update();
  }
}

class HomeViewModel {
  constructor(app) {
    this.app = app;
    this.repos = ko.observableArray();
    this.showNux = ko.computed(() => this.repos().length == 0);
    this.addIcon = octicons.plus.toSVG({ height: 18 });
  }

  updateNode(parentElement) {
    ko.renderTemplate('home', this, {}, parentElement);
  }

  shown() {
    this.update();
  }

  update() {
    const reposByPath = {};
    this.repos().forEach((repo) => {
      reposByPath[repo.path] = repo;
    });
    this.repos(
      this.app
        .repoList()
        .sort()
        .map((path) => {
          if (!reposByPath[path]) reposByPath[path] = new HomeRepositoryViewModel(this, path);
          return reposByPath[path];
        })
    );
  }
}

export { HomeViewModel as default, HomeRepositoryViewModel };
