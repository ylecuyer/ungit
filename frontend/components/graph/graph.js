import ko from 'knockout';
import _ from 'lodash';
import moment from 'moment';
import octicons from '@primer/octicons';
import components from '/source/js/components.js';
import GitNodeViewModel from './git-node.js';
import GitRefViewModel from './git-ref.js';
import EdgeViewModel from './edge.js';
import { ComponentRoot } from '../ComponentRoot.js';
import graphTemplate from './graph.html?raw';
import { createApp } from 'vue';
import Graph from '../Graph.vue';
import Octicon from '../Octicon.vue';

const numberOfNodesPerLoad = ungit.config.numberOfNodesPerLoad;

components.register('graph', (args) => new GraphViewModel(args.server, args.repoPath));
const graphElement = document.createElement('template');
graphElement.id = 'graph';
graphElement.innerHTML = graphTemplate;
document.body.appendChild(graphElement);

class GraphViewModel extends ComponentRoot {
  constructor(server, repoPath) {
    super();
    this.hoverGraphActionGraphic = ko.observable();
    this.hoverGraphActionGraphic.subscribe(
      (value) => {
        if (value && value.destroy) value.destroy();
      },
      null,
      'beforeChange'
    );

    this.hoverGraphAction = ko.observable();
    this.hoverGraphAction.subscribe((value) => {
      if (value && value.createHoverGraphic) {
        this.hoverGraphActionGraphic(value.createHoverGraphic());
      } else {
        this.hoverGraphActionGraphic(null);
      }
    });

    this.loadNodesFromApi();
    this.updateBranches();
    this.searchIcon = octicons.search.toSVG({ height: 18 });
    this.plusIcon = octicons.plus.toSVG({ height: 18 });
  }

  updateNode(parentElement) {
    ko.renderTemplate('graph', this, {}, parentElement);
    let app = createApp(Graph, {
    });
    app.component('Octicon', Octicon);
    app.mount('#branches-app');
  }


  getRef(ref, constructIfUnavailable) {
    if (constructIfUnavailable === undefined) constructIfUnavailable = true;
    let refViewModel = this.refsByRefName[ref];
    if (!refViewModel && constructIfUnavailable) {
      refViewModel = this.refsByRefName[ref] = new GitRefViewModel(ref, this);
      this.refs.push(refViewModel);
      if (refViewModel.name === 'HEAD') {
        this.HEADref(refViewModel);
      }
    }
    return refViewModel;
  }

  async _loadNodesFromApi() {
    this._isLoadNodesFromApiRunning = true;
    ungit.logger.debug('graph.loadNodesFromApi() triggered');
    const nodeSize = this.nodes().length;
    const edges = [];

    try {
      const log = await this.server.getPromise('/gitlog', {
        path: this.repoPath(),
        limit: this.limit(),
        skip: this.skip(),
      });
      if (this.isSamePayload(log)) {
        return;
      }
      const nodes = this.computeNode(
        (log.nodes || []).map((logEntry) => {
          return this.getNode(logEntry.sha1, logEntry); // convert to node object
        })
      );

      // create edges
      nodes.forEach((node) => {
        node.parents().forEach((parentSha1) => {
          edges.push(this.getEdge(node.sha1, parentSha1));
        });
        node.render();
      });

      this.edges(edges);
      this.nodes(nodes);
      if (nodes.length > 0) {
        this.graphHeight(nodes[nodes.length - 1].cy() + 80);
      }
      this.graphWidth(1000 + this.heighstBranchOrder * 90);
    } catch (e) {
      this.server.unhandledRejection(e);
    } finally {
      if (window.innerHeight - this.graphHeight() > 0 && nodeSize != this.nodes().length) {
        this.scrolledToEnd();
      }
      this._isLoadNodesFromApiRunning = false;
      ungit.logger.debug('graph.loadNodesFromApi() finished');
    }
  }





  traverseNodeParents(node, callback) {
    if (!callback(node)) return false;
    for (let i = 0; i < node.parents().length; i++) {
      // if parent, travers parent
      const parent = this.nodesById[node.parents()[i]];
      if (parent) {
        this.traverseNodeParents(parent, callback);
      }
    }
  }

  handleBubbledClick(elem, event) {
    // If the clicked element is bound to the current action context,
    // then let's not deselect it.
    if (ko.dataFor(event.target) === this.currentActionContext()) return;
    if (this.currentActionContext() && this.currentActionContext() instanceof GitNodeViewModel) {
      this.currentActionContext().toggleSelected();
    } else {
      this.currentActionContext(null);
    }
    // If the click was on an input element, then let's allow the default action to proceed.
    // This is especially needed since for some strange reason any submit (ie. enter in a textbox)
    // will trigger a click event on the submit input of the form, which will end up here,
    // and if we don't return true, then the submit event is never fired, breaking stuff.
    if (event.target.nodeName === 'INPUT') return true;
  }

  onProgramEvent(event) {
    if (event.event == 'git-directory-changed' || event.event === 'working-tree-changed') {
      this.loadNodesFromApi();
      this.updateBranches();
    } else if (event.event == 'request-app-content-refresh') {
      this.loadNodesFromApi();
    } else if (event.event == 'remote-tags-update') {
      this.setRemoteTags(event.tags);
    } else if (event.event == 'current-remote-changed') {
      this.currentRemote(event.newRemote);
    } else if (event.event == 'graph-render') {
      this.nodes().forEach((node) => {
        node.render();
      });
    }
  }

  updateAnimationFrame(deltaT) {
    this.nodes().forEach((node) => {
      node.updateAnimationFrame(deltaT);
    });
  }


  setRemoteTags(remoteTags) {
    const version = Date.now();

    const sha1Map = {}; // map holding true sha1 per tags
    remoteTags.forEach((tag) => {
      if (tag.name.includes('^{}')) {
        // This tag is a dereference tag, use this sha1.
        const tagRef = tag.name.slice(0, tag.name.length - '^{}'.length);
        sha1Map[tagRef] = tag.sha1;
      } else if (!sha1Map[tag.name]) {
        // If sha1 wasn't previously set, use this sha1
        sha1Map[tag.name] = tag.sha1;
      }
    });

    remoteTags.forEach((ref) => {
      if (!ref.name.includes('^{}')) {
        const name = `remote-tag: ${ref.remote}/${ref.name.split('/')[2]}`;
        this.getRef(name).node(this.getNode(sha1Map[ref.name]));
        this.getRef(name).version = version;
      }
    });
    this.refs().forEach((ref) => {
      // tag is removed from another source
      if (ref.isRemoteTag && (!ref.version || ref.version < version)) {
        ref.remove(true);
      }
    });
  }

  checkHeadMove(toNode) {
    if (this.HEAD() === toNode) {
      this.HEADref().node(toNode);
    }
  }
}

export default GraphViewModel;
