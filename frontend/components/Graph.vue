<template>
    <div class="graph" @click="handleBubbledClick">
        <GraphGraphics
            :graphWidth="graphWidth"
            :graphHeight="graphHeight"
            :commitNodeEdge="commitNodeEdge"
            :commitNodeColor="commitNodeColor"
            :commitOpacity="commitOpacity"
            :loadAhead="loadAhead"
            :skip="skip"
            :nodes="repositoryStore.nodes"
            :edges="repositoryStore.edges"
            @toggle-node="toggleNodeSelection"
        />

        <div v-for="node in repositoryStore.nodes" :key="node.sha1" class="nodes">
            <div
                class="nodeContainer animation"
                :class="{ selected: node.selected }"
                :style="{ left: '0px', top: node.cy + 'px' }"
                :data-ta-node-title="node.title"
            >
                <div
                    v-if="node.commitContainerVisible()"
                    class="commit-container animation"
                    :style="{ left: (node.cx - 620) + 'px' }"
                >
                    <Commit
                        :logEntry="node.logEntry"
                        :gitNode="node"
                        :sha1="node.sha1"
                        :pgpVerifiedString="node.pgpVerifiedString()"
                        :repoPath="repoPath"
                        :server="server"
                        :showDiffButtons="true"
                    />
                </div>

                <div class="rightSideContainer" :style="{ left: (node.cx + node.r - 433) + 'px' }">
                    <GraphBranch
                        v-for="branch in node.branchesToDisplay()"
                        :key="branch.name"
                        :branch="branch"
                    />

                    <span
                        v-for="tag in node.tagsToDisplay()"
                        :key="tag.name"
                        class="ref tag"
                        draggable="true"
                        tabIndex="0"
                        data-aid="tag"
                        v-html="tag.displayHtml(true)"
                        :class="{
                            current: tag.current(),
                            remote: tag.isRemoteTag,
                            dragging: tag.isDragging(),
                            focused: tag.selected(),
                        }"
                        @click="tag.selected(tag)"
                        @dblclick="tag.checkout()"
                        @dragstart="tag.dragStart()"
                        @dragend="tag.dragEnd()"
                    />

                    <span v-if="node.showNewRefAction()" class="ref-icons new-ref" :class="{ editing: node.branchingFormVisible }">
                        <button
                            v-if="!node.branchingFormVisible"
                            class="showBranchingForm"
                            type="button"
                            data-toggle="tooltip"
                            data-placement="bottom"
                            title="Create a branch or tag"
                            data-aid="create-branch-or-tag-btn"
                            @click="node.branchingFormVisible = true; node.newBranchNameHasFocus = true"
                        >
                            +
                        </button>
                        <form
                            v-if="node.branchingFormVisible"
                            class="form-inline"
                            @submit.prevent="node.createBranch()"
                        >
                            <input
                                class="name form-control"
                                type="text"
                                data-aid="new-branch-or-tag-name"
                                aria-label="New branch name"
                                v-model="node.newBranchName"
                            />
                            <button
                                class="btn btn-primary"
                                type="submit"
                                data-aid="create-branch-btn"
                                :disabled="!node.canCreateRef()"
                            >
                                Branch
                            </button>
                            <button
                                class="btn btn-default"
                                type="button"
                                data-aid="create-tag-btn"
                                :disabled="!node.canCreateRef()"
                                @click="node.createTag()"
                            >
                                Tag
                            </button>
                        </form>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import _ from 'lodash';
import programEvents from '/source/js/program-events.js';
import GraphBranch from './GraphBranch.vue';
import { useRepositoryStore } from '../stores/repositoryStore.js';

defineOptions({
    name: 'Graph',
});

const props = defineProps(['server', 'repoPath']);
const repositoryStore = useRepositoryStore();

const numberOfNodesPerLoad = ungit.config.numberOfNodesPerLoad;
const limit = ref(numberOfNodesPerLoad);
const skip = ref(0);

const commitOpacity = ref(1.0);
const graphWidth = ref(1000);
const graphHeight = ref(800);

const defaultDebounceOption = {
    maxWait: 1500,
    leading: false,
    trailing: true,
};

let apiCache;
let isLoadNodesFromApiRunning = false;

const headNode = computed(() => repositoryStore.headNode());

const commitNodeColor = computed(() => {
    if (headNode.value) {
        return headNode.value.ideologicalBranch ? headNode.value.ideologicalBranch.color : '#666';
    }
    return '#4A4A4A';
});

const commitNodeEdge = computed(() => {
    if (!headNode.value || !headNode.value.cx || !headNode.value.cy) return '';
    return `M 610 68 L ${headNode.value.cx} ${headNode.value.cy}`;
});

const isSamePayload = (value) => {
    const jsonString = JSON.stringify(value);
    if (apiCache === jsonString) {
        ungit.logger.debug('ignoring redraw for same branches payload.');
        return true;
    }
    ungit.logger.debug(`redrawing branches payload.\n${jsonString}`);
    apiCache = jsonString;
    return false;
};

const scrolledToEnd = _.debounce(
    () => {
        limit.value += numberOfNodesPerLoad;
        loadNodesFromApi();
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

const _loadNodesFromApi = async () => {
    if (isLoadNodesFromApiRunning) return;
    isLoadNodesFromApiRunning = true;
    const previousNodeCount = repositoryStore.nodes.length;

    try {
        const log = await props.server.getPromise('/gitlog', {
            path: props.repoPath,
            limit: limit.value,
            skip: skip.value,
        });

        if (isSamePayload(log)) return;

        repositoryStore.hydrateNodesFromLog(log);

        if (repositoryStore.nodes.length > 0) {
            graphHeight.value = repositoryStore.nodes[repositoryStore.nodes.length - 1].cy + 80;
        } else {
            graphHeight.value = 800;
        }
        graphWidth.value = 1000 + repositoryStore.highestBranchOrder * 90;
    } catch (e) {
        props.server.unhandledRejection(e);
    } finally {
        if (window.innerHeight - graphHeight.value > 0 && previousNodeCount !== repositoryStore.nodes.length) {
            scrolledToEnd();
        }
        isLoadNodesFromApiRunning = false;
    }
};

const loadNodesFromApi = _.debounce(_loadNodesFromApi, 250, defaultDebounceOption);

const _updateBranches = async () => {
    try {
        const checkout = await props.server.getPromise('/checkout', { path: props.repoPath });
        repositoryStore.setCheckedOutBranch(checkout);
    } catch (err) {
        if (err.errorCode !== 'not-a-repository') {
            props.server.unhandledRejection(err);
        }
    }
};

const updateBranches = _.debounce(_updateBranches, 250, defaultDebounceOption);

const toggleNodeSelection = (node) => {
    const nextSelected = !node.selected;
    repositoryStore.nodes.forEach((candidate) => {
        candidate.selected = false;
    });
    node.selected = nextSelected;
    repositoryStore.currentActionContext = nextSelected ? node : null;
};

const handleBubbledClick = (event) => {
    if (event.target.closest('button, input, textarea, a, .nodeContainer, .graphAction')) {
        return;
    }
    repositoryStore.nodes.forEach((node) => {
        node.selected = false;
    });
    repositoryStore.currentActionContext = null;
};

const onProgramEvent = (event) => {
    if (event.event === 'git-directory-changed' || event.event === 'working-tree-changed') {
        loadNodesFromApi();
        updateBranches();
    } else if (event.event === 'request-app-content-refresh') {
        loadNodesFromApi();
    } else if (event.event === 'remote-tags-update') {
        repositoryStore.setRemoteTags(event.tags || []);
        loadNodesFromApi();
    } else if (event.event === 'current-remote-changed') {
        repositoryStore.currentRemote = event.newRemote;
    }
};

onMounted(() => {
    repositoryStore.initializeContext(props.server, props.repoPath);
    updateBranches();
    setTimeout(loadNodesFromApi, 1000);
    programEvents.add(onProgramEvent);
});

onBeforeUnmount(() => {
    programEvents.remove(onProgramEvent);
});

defineExpose({
    getNode: repositoryStore.ensureNode,
    getRef: repositoryStore.ensureRef,
    refs: () => repositoryStore.refs,
    loadNodesFromApi,
    updateBranches,
});
</script>
