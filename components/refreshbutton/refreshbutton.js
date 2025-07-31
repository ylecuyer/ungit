import ko from 'knockout';
import octicons from '@primer/octicons';
import components from '/notpublic/source/components.js';
import programEvents from '/notpublic/source/program-events.js';

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
