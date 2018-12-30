
const ko = require('knockout');
const components = require('../../public/source/components');
const programEvents = require('../../public/source/program-events');

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
