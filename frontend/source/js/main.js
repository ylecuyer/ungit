import '/components/app/app.js';
import '/components/commit/commit.js';
import '/components/commitdiff/commitdiff.js';
import '/components/graph/graph.js';
import '/components/imagediff/imagediff.js';
import '/components/login/login.js';
import '/components/modals/modals.js';
import '/components/path/path.js';
import '/components/repository/repository.js';
import '/components/textdiff/textdiff.js';

import $ from 'jquery';
import ko from 'knockout';
import './bootstrap.js';
import './jquery-ui.js';
import './knockout-bindings.js';
import components from './components.js';
import Server from './server.js';
import programEvents from './program-events.js';
import navigation from './navigation.js';
import adBlocker from 'just-detect-adblock';

//ungit.logger = console;
ungit.logger = {
  info: function () {},
  error: function () {},
  log: function () {},
  warn: function () {},
  debug: function () {},
};

// Request animation frame polyfill and init tooltips
(function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };

  $(document).tooltip({
    selector: '[data-toggle="tooltip"]',
  });
})();

function WindowTitle() {
  this.path = 'ungit';
  this.crash = false;
}
WindowTitle.prototype.update = function () {
  var title = this.path
    .replace(/\\/g, '/')
    .split('/')
    .filter(function (x) {
      return x;
    })
    .reverse()
    .join(' < ');
  if (this.crash) title = ':( ungit crash ' + title;
  document.title = title;
};

var windowTitle = new WindowTitle();
windowTitle.update();

var AppContainerViewModel = function () {
  this.content = ko.observable();
};
AppContainerViewModel.prototype.templateChooser = function (data) {
  if (!data) return '';
  return data.template;
};

var app, appContainer, server;

import { createApp } from 'vue';
import { createWebHashHistory, createRouter } from 'vue-router'
import Main from '../../components/Main.vue';
import Crash from '../../components/Crash.vue';
import App from '../../components/App.vue';
import Home from '../../components/Home.vue';
import Sidebar from '../../components/Sidebar.vue';
import Header from '../../components/Header.vue';
import Octicon from '../../components/Octicon.vue';
import BookmarkButton from '../../components/BookmarkButton.vue';
import RefreshButton from '../../components/RefreshButton.vue';
import Path from '../../components/Path.vue';
import Repository from '../../components/Repository.vue';
import GitErrors from '../../components/GitErrors.vue';
import Stash from '../../components/Stash.vue';
import Staging from '../../components/Staging.vue';
import StashItem from '../../components/StashItem.vue';
import Remotes from '../../components/Remotes.vue';
import Submodules from '../../components/Submodules.vue';
import Branches from '../../components/Branches.vue';
import Gitignore from '../../components/Gitignore.vue';
import Graph from '../../components/Graph.vue';
import GraphGraphics from '../../components/GraphGraphics.vue';
import FileDiff from '../../components/FileDiff.vue';
import TextDiff from '../../components/TextDiff.vue';
import ImageDiff from '../../components/ImageDiff.vue';
import Node from '../../components/Node.vue';
import Edge from '../../components/Edge.vue';
import Commit from '../../components/Commit.vue';
import CommitDiff from '../../components/CommitDiff.vue';
import CommitLineDiff from '../../components/CommitLineDiff.vue';

function start() {
  server = new Server();
  appContainer = new AppContainerViewModel();
  ungit.server = server;
  let app = createApp(Main, {
    server: server
  });
  const routes = [
    { path: '/', component: Home },
    { path: '/repository', component: Path, props: route => ({ server: server, repoPath: route.query.path }) }
  ]
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })
  app.component('Crash', Crash);
  app.component('Path', Path);
  app.component('App', App);
  app.component('Home', Home);
  app.component('Sidebar', Sidebar);
  app.component('Header', Header);
  app.component('Octicon', Octicon);
  app.component('BookmarkButton', BookmarkButton);
  app.component('RefreshButton', RefreshButton);
  app.component('Repository', Repository);
  app.component('GitErrors', GitErrors);
  app.component('Stash', Stash);
  app.component('Staging', Staging);
  app.component('FileDiff', FileDiff);
  app.component('TextDiff', TextDiff);
  app.component('ImageDiff', ImageDiff);
  app.component('Node', Node);
  app.component('Edge', Edge);
  app.component('StashItem', StashItem);
  app.component('Remotes', Remotes);
  app.component('Submodules', Submodules);
  app.component('Branches', Branches);
  app.component('Gitignore', Gitignore);
  app.component('Graph', Graph);
  app.component('GraphGraphics', GraphGraphics);
  app.component('Commit', Commit);
  app.component('CommitDiff', CommitDiff);
  app.component('CommitLineDiff', CommitLineDiff);
  app.use(router);
  app.mount('#app-app');
  ungit.__app = app;

  if (ungit.config.authentication) {
    var authenticationScreen = components.create('login', { server: server });
    appContainer.content(authenticationScreen);
    authenticationScreen.loggedIn.add(function () {
      server.initSocket();
    });
  } else {
    server.initSocket();
  }

  var prevTimestamp = 0;
  var updateAnimationFrame = function (timestamp) {
    var delta = timestamp - prevTimestamp;
    prevTimestamp = timestamp;
    if (app.updateAnimationFrame) app.updateAnimationFrame(delta);
    window.requestAnimationFrame(updateAnimationFrame);
  };
  window.requestAnimationFrame(updateAnimationFrame);

  // TODO remove ko.applyBindings(appContainer);

  // routing
  navigation.crossroads.addRoute('/', function () {
    // TODO app.content(components.create('home', { app: app }));
    windowTitle.path = 'ungit';
    windowTitle.update();
  });

  navigation.crossroads.addRoute('/repository{?query}', function (query) {
    programEvents.dispatch({ event: 'navigated-to-path', path: query.path });
    // TODO app.content(components.create('path', { server: server, path: query.path }));
    windowTitle.path = query.path;
    windowTitle.update();
  });

  if (matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }

  navigation.init();
};

export { AppContainerViewModel, start };
