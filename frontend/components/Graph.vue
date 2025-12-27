<template>
    <div class="graph" data-bind="scrolledToEnd: scrolledToEnd, click: handleBubbledClick">
    <GraphGraphics :graphWidth="graphWidth" :graphHeight="graphHeight" :commitNodeEdge="commitNodeEdge" :loadAhead="true"
     :skip="3" :nodes="nodes" :edges="edges" :getNode="getNode"/>

    <div v-for="node in nodes" class="nodes">
        <div
        class="nodeContainer animation"
        :style="{ left: '0px', top: node.cy() + 'px' }"
        :data-ta-node-title="node.title"
        >
        <div
            class="commit-container animation"
            :style="{ left: (node.cx() - 620) + 'px' }"
            v-if="node.commitContainerVisible()"
        >
            <Commit :logEntry="node.logEntry" :gitNode="node" :sha1="node.sha1" :pgpVerifiedString="node.pgpVerifiedString()" :repoPath="repoPath" :server="server" :showDiffButtons="true"/>
        </div>

        <div class="rightSideContainer" :style="{ left: (node.cx() + node.r() - 433) + 'px' }"
        >
            <span v-for="branch in node.branchesToDisplay()"
            class="ref branch"
            draggable="true"
            tabIndex="-1"
            data-aid="branch"
            data-bind="click: selected,
                event: { dblclick: checkout },
                dragStart: dragStart, dragEnd: dragEnd, attr: { 'data-ta-name': localRefName, 'data-ta-local': isLocal }"
            v-html="branch.displayHtml(true)"
            :class="{ current: current, remote: isRemoteBranch, dragging: isDragging, focused: selected }"
            >
            </span>

            <span v-for="tag in node.tagsToDisplay()"
            class="ref tag"
            draggable="true"
            tabIndex="0"
            data-aid="tag"
            data-bind="click: selected,
                event: { dblclick: checkout },
                dragStart: dragStart, dragEnd: dragEnd, attr: { 'data-ta-name': localRefName }"
                v-html="tag.displayHtml(true)"
                :class="{ current: current, remote: isRemoteTag, dragging: isDragging, focused: selected }"
            >
            </span>

            <span v-for="action in node.dropareaGraphActions"
            class="graphAction"
            data-bind="css: cssClasses, visible: visible, attr: { 'data-ta-action': style }, event: { mouseover: mouseover, mouseout: mouseout }"
            >
            <span v-html="action.icon"></span>
            <span v-text="action.text"></span>
            <div
                class="dropmask"
                tabindex="0"
                role="button"
                data-bind="dropOver: visible, drop: doPerform, dragEnter: dragEnter, dragLeave: dragLeave, click: doPerform"
            ></div>
            </span>

            <span v-if="node.showNewRefAction" class="ref-icons new-ref" data-bind="css: { editing: branchingFormVisible }">
            <button
                class="showBranchingForm"
                type="button"
                data-bind="html: $parent.plusIcon, click: showBranchingForm, visible: !branchingFormVisible()"
                data-toggle="tooltip"
                data-placement="bottom"
                title="Create a branch or tag"
                data-aid="create-branch-or-tag-btn"
            ></button>
            <form v-if="node.branchingFormVisible"
                class="form-inline"
                data-bind="hasfocus2: branchingFormVisible, submit: createBranch"
            >
                <input
                class="name form-control"
                type="text"
                data-aid="new-branch-or-tag-name"
                aria-label="New branch name"
                data-bind="value: newBranchName, hasfocus: newBranchNameHasFocus, valueUpdate: 'afterkeydown'"
                />
                <button
                class="btn btn-primary"
                type="submit"
                data-aid="create-branch-btn"
                data-bind="click: createBranch, enable: canCreateRef"
                >
                Branch
                </button>
                <button
                class="btn btn-default"
                type="button"
                data-aid="create-tag-btn"
                data-bind="click: createTag, enable: canCreateRef"
                >
                Tag
                </button>
            </form>
            </span>

            <span v-if="node.showRefSearch" class="ref-icons" data-bind="css: { editing: branchingFormVisible }">
            <button
                class="showSearchForm"
                type="button"
                data-bind="html: $parent.searchIcon, click: showRefSearchForm, visible: !refSearchFormVisible()"
                data-toggle="tooltip"
                data-placement="bottom"
                title="Search for a branch or tag"
            ></button>
            <div class="form-inline branch-search" data-bind="visible: refSearchFormVisible()">
                <input
                class="name form-control"
                type="search"
                aria-label="Filter branches and tags"
                data-bind="hasfocus: refSearchFormVisible, valueUpdate: 'afterkeyup'"
                />
            </div>
            </span>
        </div>
        </div>
    </div>
    </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import _ from 'lodash';
import moment from 'moment';
import GitNodeViewModel from './graph/git-node.js';
import GitRefViewModel from './graph/git-ref.js';
import EdgeViewModel from './graph/edge.js';

defineOptions({
    name: 'Graph',
});

const props = defineProps(['server', 'repoPath']);

let nodesById = {};
let _markIdeologicalStamp = 0;
let edgesById = {};
let refsByRefName = {};
let heighstBranchOrder = ref(0);

const currentRemote = ref(null);
const nodes = ref([]);
const edges = ref([]);
const refs = ref([]);
const numberOfNodesPerLoad = ungit.config.numberOfNodesPerLoad;
const limit = ref(numberOfNodesPerLoad);
const skip = ref(0);

const checkedOutBranch = ref(null);
const checkedOutRef = computed(() => {
      return checkedOutBranch.value ? getRef(`refs/heads/${checkedOutBranch.value}`) : null;
});
const commitNodeColor = computed(() => {
      return HEAD.value ? HEAD.value.color() : '#4A4A4A';
});
const commitNodeEdge = computed(() => {
    console.log("HEAD:", HEAD.value);
      if (!HEAD.value || !HEAD.value.cx() || !HEAD.value.cy()) return;
      return `M 610 68 L ${HEAD.value.cx()} ${HEAD.value.cy()}`;
});

const currentActionContext = ref(null);
const scrolledToEnd = _.debounce(
    () => {
        limit.value = numberOfNodesPerLoad + limit.value;
        this.loadNodesFromApi();
    },
    500,
    true
);

const loadAhead = _.debounce(
    () => {
        if (skip.value <= 0) return;
        skip.value = Math.max(skip.value - numberOfNodesPerLoad, 0);
        loadNodesFromApi();
    },
    500,
    true
);

const commitOpacity = ref(1.0);

const hoverGraphActionGraphic = ref(null);

const hoverGraphAction = ref(null);

const graphWidth = ref(null);
const graphHeight = ref(800);

const HEADref = ref(null);
const HEAD = computed(() => {
    return HEADref.value ? HEADref.value.node() : undefined;
});

const defaultDebounceOption = {
    maxWait: 1500,
    leading: false,
    trailing: true
};

var apiCache = undefined;

const isSamePayload = (value) => {
    const jsonString = JSON.stringify(value);

    if (apiCache === jsonString) {
        ungit.logger.debug(`ignoring redraw for same branches payload.`);
        return true;
    }
    ungit.logger.debug(`redrawing branches payload.  \n${jsonString}`);

    apiCache = jsonString;
    return false;
}

const traverseNodeParents = (node, callback) => {
    if (!callback(node)) return false;
    for (let i = 0; i < node.parents().length; i++) {
        // if parent, travers parent
        const parent = nodesById[node.parents()[i]];
        if (parent) {
            traverseNodeParents(parent, callback);
        }
    }
}

const markNodesIdeologicalBranches = (_refs) => {
    _refs = _refs.filter((r) => !!r.node());
    _refs = _refs.sort((a, b) => {
        if (a.isLocal && !b.isLocal) return -1;
        if (b.isLocal && !a.isLocal) return 1;
        if (a.isBranch && !b.isBranch) return -1;
        if (b.isBranch && !a.isBranch) return 1;
        if (a.isHEAD && !b.isHEAD) return 1;
        if (!a.isHEAD && b.isHEAD) return -1;
        if (a.isStash && !b.isStash) return 1;
        if (b.isStash && !a.isStash) return -1;
        if (a.node() && a.node().date && b.node() && b.node().date)
            return a.node().date - b.node().date;
        return a.refName < b.refName ? -1 : 1;
    });
    const stamp = _markIdeologicalStamp++;
    _refs.forEach((_ref) => {
        traverseNodeParents(_ref.node(), (node) => {
            if (node.stamp == stamp) return false;
            node.stamp = stamp;
            node.ideologicalBranch(_ref);
            return true;
        });
    });
}

const traverseNodeLeftParents = (node, callback) => {
    callback(node);
    const parent = nodesById[node.parents()[0]];
    if (parent) {
        traverseNodeLeftParents(parent, callback);
    }
}

const computeNode = (_nodes) => {
    markNodesIdeologicalBranches(refs.value);

    const updateTimeStamp = moment().valueOf();
    if (HEAD.value) {
        traverseNodeLeftParents(HEAD.value, (node) => {
            node.ancestorOfHEADTimeStamp = updateTimeStamp;
        });
    }

    // Filter out nodes which doesn't have a branch (staging and orphaned nodes)
    _nodes = _nodes.filter(
        (node) => {
            var res = (node.ideologicalBranch() && !node.ideologicalBranch().isStash) || node.ancestorOfHEADTimeStamp == updateTimeStamp
            return res;
        }
    );

    let branchSlotCounter = HEAD.value ? 1 : 0;

    // Then iterate from the bottom to fix the orders of the branches
    for (let i = _nodes.length - 1; i >= 0; i--) {
        const node = _nodes[i];
        if (node.ancestorOfHEADTimeStamp == updateTimeStamp) continue;
        const ideologicalBranch = node.ideologicalBranch();

        // First occurrence of the branch, find an empty slot for the branch
        if (ideologicalBranch.lastSlottedTimeStamp != updateTimeStamp) {
            ideologicalBranch.lastSlottedTimeStamp = updateTimeStamp;
            ideologicalBranch.branchOrder = branchSlotCounter++;
        }

        node.branchOrder(ideologicalBranch.branchOrder);
    }

    heighstBranchOrder.value = branchSlotCounter - 1;
    let prevNode;
    _nodes.forEach((node) => {
        node.ancestorOfHEAD(node.ancestorOfHEADTimeStamp == updateTimeStamp);
        if (node.ancestorOfHEAD()) node.branchOrder(0);
        node.aboveNode = prevNode;
        if (prevNode) prevNode.belowNode = node;
        prevNode = node;
    });

    console.log("_nodes:", _nodes);

    return _nodes;
}

const getRef = (ref, constructIfUnavailable) => {
    if (constructIfUnavailable === undefined) constructIfUnavailable = true;
    let refViewModel = refsByRefName[ref];
    if (!refViewModel && constructIfUnavailable) {
        refViewModel = refsByRefName[ref] = new GitRefViewModel(ref, {
            currentActionContext: currentActionContext,
            checkedOutBranch: checkedOutBranch,
            HEADref: HEADref
        });
        refs.value.push(refViewModel);
        if (refViewModel.name === 'HEAD') {
            HEADref.value = refViewModel;
        }
    }
    return refViewModel;
}

const getNode = (sha1, logEntry) => {
    let nodeViewModel = nodesById[sha1];
    if (!nodeViewModel) nodeViewModel = nodesById[sha1] = new GitNodeViewModel({
        currentActionContext: currentActionContext,
        hoverGraphAction: hoverGraphAction,
        checkedOutRef: checkedOutRef,
        getRef: getRef,
        isViewable: (node) => {
            return nodes.value.includes(node);
        }
    }, sha1);
    if (logEntry) nodeViewModel.setData(logEntry);
    return nodeViewModel;
}

const getEdge = (nodeAsha1, nodeBsha1) => {
    const id = `${nodeAsha1}-${nodeBsha1}`;
    let edge = edgesById[id];
    if (!edge) {
        edge = edgesById[id] = new EdgeViewModel({
            currentActionContext: currentActionContext,
            getNode: getNode,
        }, nodeAsha1, nodeBsha1);
    }
    return edge;
}

let _isLoadNodesFromApiRunning = false;
const _loadNodesFromApi = async () => {
    console.log("_loadNodesFromApi called");
    _isLoadNodesFromApiRunning = true;
    ungit.logger.debug('graph.loadNodesFromApi() triggered');
    const nodeSize = nodes.value.length;
    const _edges = [];

    try {
        const log = await props.server.getPromise('/gitlog', {
            path: props.repoPath,
            limit: limit.value,
            skip: skip.value,
        });
        if (isSamePayload(log)) {
            return;
        }
        const _nodes = computeNode(
            (log.nodes || []).map((logEntry) => {
                return getNode(logEntry.sha1, logEntry); // convert to node object
            })
        );

        // create edges
        _nodes.forEach((node) => {
            node.parents().forEach((parentSha1) => {
                _edges.push(getEdge(node.sha1, parentSha1));
            });
            node.render();
        });

        edges.value = _edges;
        nodes.value = _nodes;
        if (nodes.value.length > 0) {
            // TODO graphHeight.value = nodes.value[nodes.value.length - 1].cy() + 80;
            graphHeight.value = 2000;
        }
        // TODO graphWidth.value = 1000 + highestBranchOrder.value * 90;
        graphWidth.value = 3000;
    } catch (e) {
        props.server.unhandledRejection(e);
    } finally {
        if (window.innerHeight - graphHeight.value > 0 && nodeSize != nodes.value.length) {
            scrolledToEnd();
        }
        _isLoadNodesFromApiRunning = false;
        ungit.logger.debug('graph.loadNodesFromApi() finished');
    }
}

const loadNodesFromApi = _.debounce(_loadNodesFromApi, 250, defaultDebounceOption);


const _updateBranches = async () => {
    console.log("_updateBranches called");
    const checkout = await props.server.getPromise('/checkout', { path: props.repoPath });
    try {
        ungit.logger.debug('setting checkedOutBranch', checkout);
        checkedOutBranch.value  = checkout;
    } catch (err) {
        if (err.errorCode != 'not-a-repository') {
        props.server.unhandledRejection(err);
        } else {
        ungit.logger.warn('updateBranches failed', err);
        }
    }
}


const updateBranches = _.debounce(_updateBranches, 250, defaultDebounceOption);
watchEffect(updateBranches);
setTimeout(loadNodesFromApi, 1000);
</script>