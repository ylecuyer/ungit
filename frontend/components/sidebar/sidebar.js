import ko from 'knockout';
import components from '/source/js/components.js';
import sidebarTemplate from './sidebar.html?raw';
import octicons from '@primer/octicons';

components.register('sidebar', () => new SidebarViewModel());
const sidebarElement = document.createElement('template');
sidebarElement.id = 'sidebar';
sidebarElement.innerHTML = sidebarTemplate;
document.body.appendChild(sidebarElement);

class SidebarViewModel {
  constructor() {
    this.githubIcon = octicons['mark-github'].toSVG()
    this.githubLink = this.githubIcon + " Github";
  }

  updateNode(parentElement) {
    ko.renderTemplate('sidebar', this, {}, parentElement);
  }
}

export default SidebarViewModel;