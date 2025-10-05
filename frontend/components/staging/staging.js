import ko from 'knockout';
import _ from 'lodash';
import components from '/source/js/components.js';
import { ComponentRoot } from '../ComponentRoot';
import stagingTemplate from './staging.html?raw';
import { createApp } from 'vue';
import Staging from '../Staging.vue';
import Octicon from '../Octicon.vue';
import StagingFile from '../StagingFile.vue';
import FileDiff from '../FileDiff.vue';
import ImageDiff from '../ImageDiff.vue';
import TextDiff from '../TextDiff.vue';


components.register(
  'staging',
  (args) => new StagingViewModel(args.server, args.repoPath, args.graph)
);
const stagingElement = document.createElement('template');
stagingElement.id = 'staging';
stagingElement.innerHTML = stagingTemplate;
document.body.appendChild(stagingElement);

class StagingViewModel extends ComponentRoot {
  constructor(server, repoPath, graph) {
    super();
    this.server = server;
    this.repoPath = repoPath;
    this.graph = graph;
  }

  updateNode(parentElement) {
    ko.renderTemplate('staging', this, {}, parentElement);
    let app = createApp(Staging, { repoPath: this.repoPath(), graph: this.graph });
    app.component('Octicon', Octicon);
    app.component('StagingFile', StagingFile);
    app.component('FileDiff', FileDiff);
    app.component('ImageDiff', ImageDiff);
    app.component('TextDiff', TextDiff);
    this.vm = app.mount('#staging-app');
  }
}

export default { StagingViewModel };
