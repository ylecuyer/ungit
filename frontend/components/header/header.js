import ko from 'knockout';
import octicons from '@primer/octicons';
import components from '/source/js/components.js';
import navigation from '/source/js/navigation.js';
import programEvents from '/source/js/program-events.js';
import { encodePath } from '../../../backend/source/address-parser.js';
import headerTemplate from './header.html?raw';

components.register('header', (args) => new HeaderViewModel(args.app));
const headerElement = document.createElement('template');
headerElement.id = 'header';
headerElement.innerHTML = headerTemplate;
document.body.appendChild(headerElement);

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
