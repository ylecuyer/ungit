import ko from 'knockout';
import components from '/source/js/components.js';
import sidebarTemplate from './sidebar.html?raw';

import { createApp } from 'vue';
import Sidebar from '../Sidebar.vue';
import Octicon from '../Octicon.vue';

components.register('sidebar', () => new SidebarViewModel());
const sidebarElement = document.createElement('template');
sidebarElement.id = 'sidebar';
sidebarElement.innerHTML = sidebarTemplate;
document.body.appendChild(sidebarElement);

class SidebarViewModel {
  constructor() {
  }

  updateNode(parentElement) {
    ko.renderTemplate('sidebar', this, {}, parentElement);
    app = createApp(Sidebar);
    app.component('Octicon', Octicon);
    app.mount('#sidebar-app');
  }
}
