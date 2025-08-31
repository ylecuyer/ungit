import ko from 'knockout';
import components from '/source/js/components.js';
import sidebarTemplate from './sidebar.html?raw';
import octicons from '@primer/octicons';
import storage from '/source/js/storage.js';
import { encodePath } from '../../../backend/source/address-parser.js';

components.register('sidebar', () => new SidebarViewModel());
const sidebarElement = document.createElement('template');
sidebarElement.id = 'sidebar';
sidebarElement.innerHTML = sidebarTemplate;
document.body.appendChild(sidebarElement);

class SidebarViewModel {
  constructor() {
    this.githubIcon = octicons['mark-github'].toSVG()
    this.githubLink = this.githubIcon + " Github";
    this.repos = ko.observableArray([]);

    this.fetchRepositories();
  }


  async fetchRepositories() {
    const storedPaths = JSON.parse(storage.getItem('repositories') || '[]');
    const repos = storedPaths.map(path => {
      return {
        path: path,
        name: path.split('/').pop(), // Extract the last part of the path as the name
        link: `/#/repository?path=${encodePath(path)}`,
      };
    });
    console.log("Fetched repositories from storage:", repos);
    this.repos(repos);
  }

  updateNode(parentElement) {
    ko.renderTemplate('sidebar', this, {}, parentElement);
  }
}

export default SidebarViewModel;