
const ko = require('knockout');
const components = require('../../components');
const programEvents = require('../../program-events');

require('./refreshbutton.less');

components.register('refreshbutton', () => new RefreshButton());

class RefreshButton {
  refresh() {
    programEvents.dispatch({ event: 'request-app-content-refresh' });
    return true;
  }

  updateNode(parentElement) {
    ko.renderTemplate('refreshbutton', this, {}, parentElement);
  }
}
