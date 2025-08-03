import ko from 'knockout';
import octicons from '@primer/octicons';
import components from '/source/source/components.js';
import programEvents from '/source/source/program-events.js';
import refreshButtonTemplate from './refreshbutton.html?raw';

components.register('refreshbutton', (args) => new RefreshButton(args.isLarge));
const refreshButtonElement = document.createElement('template');
refreshButtonElement.id = 'refreshbutton';
refreshButtonElement.innerHTML = refreshButtonTemplate;
document.body.appendChild(refreshButtonElement);

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
