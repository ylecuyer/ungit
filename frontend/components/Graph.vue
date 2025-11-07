<template>
    <div class="graph" data-bind="scrolledToEnd: scrolledToEnd, click: handleBubbledClick">
    <GraphGraphics />

    <div class="nodes" data-bind="foreach: nodes">
        <div
        class="nodeContainer animation"
        data-bind="style: { left: '0px', top: cy() + 'px' }, attr: { 'data-ta-node-title': title }"
        >
        <div
            class="commit-container animation"
            data-bind="visible: commitContainerVisible, style: { left: cx() - 620 + 'px' }"
        >
            <!-- ko component: commitComponent -->
            <!-- /ko -->
        </div>

        <div class="rightSideContainer" data-bind="style: { left: cx() + r() - 433 + 'px' }">
            <!-- ko foreach: branchesToDisplay -->
            <span
            class="ref branch"
            draggable="true"
            tabIndex="-1"
            data-aid="branch"
            data-bind="css: { current: current, remote: isRemoteBranch, dragging: isDragging, focused: selected },
                html: displayHtml(true),
                click: selected,
                event: { dblclick: checkout },
                dragStart: dragStart, dragEnd: dragEnd, attr: { 'data-ta-name': localRefName, 'data-ta-local': isLocal }"
            >
            </span>
            <!-- /ko -->

            <!-- ko foreach: tagsToDisplay -->
            <span
            class="ref tag"
            draggable="true"
            tabIndex="0"
            data-aid="tag"
            data-bind="css: { current: current, remote: isRemoteTag, dragging: isDragging, focused: selected },
                html: displayHtml(true),
                click: selected,
                event: { dblclick: checkout },
                dragStart: dragStart, dragEnd: dragEnd, attr: { 'data-ta-name': localRefName }"
            >
            </span>
            <!-- /ko -->

            <!-- ko foreach: dropareaGraphActions -->
            <span
            class="graphAction"
            data-bind="css: cssClasses, visible: visible, attr: { 'data-ta-action': style }, event: { mouseover: mouseover, mouseout: mouseout }"
            >
            <span data-bind="html: icon"></span>
            <span data-bind="text: text"></span>
            <div
                class="dropmask"
                tabindex="0"
                role="button"
                data-bind="dropOver: visible, drop: doPerform, dragEnter: dragEnter, dragLeave: dragLeave, click: doPerform"
            ></div>
            </span>
            <!-- /ko -->

            <!-- ko if: showNewRefAction -->
            <span class="ref-icons new-ref" data-bind="css: { editing: branchingFormVisible }">
            <button
                class="showBranchingForm"
                type="button"
                data-bind="html: $parent.plusIcon, click: showBranchingForm, visible: !branchingFormVisible()"
                data-toggle="tooltip"
                data-placement="bottom"
                title="Create a branch or tag"
                data-aid="create-branch-or-tag-btn"
            ></button>
            <!-- ko if: branchingFormVisible -->
            <form
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
            <!-- /ko -->
            </span>
            <!-- /ko -->

            <!-- ko if: showRefSearch -->
            <span class="ref-icons" data-bind="css: { editing: branchingFormVisible }">
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
            <!-- /ko -->
        </div>
        </div>
    </div>
    </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import _ from 'lodash';

defineOptions({
    name: 'Graph',
});

const props = defineProps(['server', 'repoPath']);

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

let _isLoadNodesFromApiRunning = false;
const _loadNodesFromApi = async () => {
    _isLoadNodesFromApiRunning = true;
    ungit.logger.debug('graph.loadNodesFromApi() triggered');
    const nodeSize = this.nodes().length;
    const edges = [];

    try {
        const log = await props.server.getPromise('/gitlog', {
            path: props.repoPath(),
            limit: limit.value,
            skip: skip.value,
        });
        if (isSamePayload(log)) {
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
        props.server.unhandledRejection(e);
    } finally {
        if (window.innerHeight - this.graphHeight() > 0 && nodeSize != this.nodes().length) {
            this.scrolledToEnd();
        }
        _isLoadNodesFromApiRunning = false;
        ungit.logger.debug('graph.loadNodesFromApi() finished');
    }
}

const loadNodesFromApi = _.debounce(_loadNodesFromApi, 250, defaultDebounceOption);


  const _updateBranches = async () => {
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
//watchEffect(loadNodesFromApi);
watchEffect(updateBranches);
</script>