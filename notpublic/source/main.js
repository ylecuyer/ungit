import '/components/app/app.js';
import '/components/branches/branches.js';
import '/components/commit/commit.js';
import '/components/commitdiff/commitdiff.js';
import '/components/crash/crash.js';
import '/components/gitErrors/gitErrors.js';
import '/components/graph/graph.js';
import '/components/header/header.js';
import '/components/home/home.js';
import '/components/imagediff/imagediff.js';
import '/components/login/login.js';
import '/components/modals/modals.js';
import '/components/path/path.js';
import '/components/refreshbutton/refreshbutton.js';
import '/components/remotes/remotes.js';
import '/components/repository/repository.js';
import '/components/staging/staging.js';
import '/components/stash/stash.js';
import '/components/submodules/submodules.js';
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

ungit.logger = console;

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

function start() {
  server = new Server();
  appContainer = new AppContainerViewModel();
  ungit.server = server;
  app = components.create('app', { appContainer: appContainer, server: server });
  ungit.__app = app;
  programEvents.add(async (event) => {
    ungit.logger.info(`received event: ${event.event}`);
    if (event.event == 'disconnected' || event.event == 'git-crash-error') {
      console.error(`ungit crash: ${event.event}`, event.error, event.stacktrace);
      const err =
        event.event == 'disconnected' && (await adBlocker.detectAnyAdblocker())
          ? 'adblocker'
          : event.event;
      appContainer.content(components.create('crash', err));
      windowTitle.crash = true;
      windowTitle.update();
    } else if (event.event == 'connected') {
      appContainer.content(app);
      windowTitle.crash = false;
      windowTitle.update();
    }

    app.onProgramEvent(event);
  });
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

  ko.applyBindings(appContainer);

  // routing
  navigation.crossroads.addRoute('/', function () {
    app.content(components.create('home', { app: app }));
    windowTitle.path = 'ungit';
    windowTitle.update();
  });

  navigation.crossroads.addRoute('/repository{?query}', function (query) {
    programEvents.dispatch({ event: 'navigated-to-path', path: query.path });
    app.content(components.create('path', { server: server, path: query.path }));
    windowTitle.path = query.path;
    windowTitle.update();
  });

  navigation.init();
};

export { AppContainerViewModel, start };
