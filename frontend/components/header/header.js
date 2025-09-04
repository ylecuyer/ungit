import ko from 'knockout';
import components from '/source/js/components.js';
import headerTemplate from './header.html?raw';

import { createApp } from 'vue';
import Header from '../Header.vue';
import BookmarkButton from '../BookmarkButton.vue';
import RefreshButton from '../RefreshButton.vue';
import Octicon from '../Octicon.vue';

components.register('header', (args) => new HeaderViewModel());
const headerElement = document.createElement('template');
headerElement.id = 'header';
headerElement.innerHTML = headerTemplate;
document.body.appendChild(headerElement);

class HeaderViewModel {
  constructor() {
  }

  updateNode(parentElement) {
    ko.renderTemplate('header', this, {}, parentElement);
    app = createApp(Header);
    app.component('BookmarkButton', BookmarkButton);
    app.component('RefreshButton', RefreshButton);
    app.component('Octicon', Octicon);
    app.mount('#header-app');
  }
}