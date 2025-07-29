import ko from 'knockout';
import octicons from 'octicons';
import components from 'ungit-components-es6';
import navigation from 'ungit-navigation-es6';
import programEvents from 'ungit-program-events';
import { encodePath } from 'ungit-address-parser';

components.register('header', (args) => new HeaderViewModel(args.app));

class HeaderViewModel {
  constructor(app) {
    this.app = app;
    this.showBackButton = ko.observable(false);
    this.path = ko.observable();
    this.currentVersion = ungit.version;
    this.refreshButton = components.create('refreshbutton', { isLarge: true });
    this.showAddToRepoListButton = ko.computed(
      () => this.path() && !this.app.repoList().includes(this.path())
    );
    this.addIcon = octicons.plus.toSVG({ height: 18 });
    this.backIcon = octicons['arrow-left'].toSVG({ height: 24 });
  }

  updateNode(parentElement) {
    ko.renderTemplate('header', this, {}, parentElement);
  }

  submitPath() {
    navigation.browseTo(`repository?path=${encodePath(this.path())}`);
  }

  onProgramEvent(event) {
    if (event.event == 'navigation-changed') {
      this.showBackButton(event.path != '');
      if (event.path == '') this.path('');
    } else if (event.event == 'navigated-to-path') {
      this.path(event.path);
    }
  }

  addCurrentPathToRepoList() {
    programEvents.dispatch({ event: 'request-remember-repo', repoPath: this.path() });
    return true;
  }
}

export default HeaderViewModel;
