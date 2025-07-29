import ko from 'knockout';
import octicons from 'octicons';
import components from 'ungit-components-es6';
import programEvents from 'ungit-program-events';

components.register('refreshbutton', (args) => new RefreshButton(args.isLarge));

class RefreshButton {
  constructor(isLarge) {
    this.isLarge = isLarge;
    this.refreshIcon = octicons.sync.toSVG({ height: isLarge ? 26 : 18 });
  }

  refresh() {
    programEvents.dispatch({ event: 'request-app-content-refresh' });
    return true;
  }

  updateNode(parentElement) {
    ko.renderTemplate('refreshbutton', this, {}, parentElement);
  }
}

export default RefreshButton;
