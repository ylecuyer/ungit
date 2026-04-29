import { defineStore } from 'pinia';
import md5 from 'blueimp-md5';
import octicons from '@primer/octicons';
import programEvents from '/source/js/program-events.js';

const maxBranchesToDisplay = parseInt((ungit.config.numRefsToShow / 5) * 3, 10);
const maxTagsToDisplay = ungit.config.numRefsToShow - maxBranchesToDisplay;

const asTagRefName = (name) => name.replace('refs/tags', 'tag: refs/tags');

function removeRefFromNode(node, refModel) {
    if (!node) return;
    if (refModel.isRemoteTag) {
        node.remoteTags = node.remoteTags.filter((ref) => ref !== refModel);
        return;
    }
    node.branchesAndLocalTags = node.branchesAndLocalTags.filter((ref) => ref !== refModel);
}

function addRefToNode(node, refModel) {
    if (!node) return;
    if (refModel.isRemoteTag) {
        if (!node.remoteTags.includes(refModel)) node.remoteTags.push(refModel);
        return;
    }
    if (!node.branchesAndLocalTags.includes(refModel)) node.branchesAndLocalTags.push(refModel);
}

function createNodeModel(store, sha1) {
    return {
        sha1,
        title: '',
        parents: [],
        commitTime: undefined,
        date: undefined,
        ideologicalBranch: null,
        remoteTags: [],
        branchesAndLocalTags: [],
        signatureDate: '',
        signatureMade: '',
        ancestorOfHEAD: false,
        nodeIsMousehover: false,
        isEdgeHighlighted: false,
        selected: false,
        newBranchName: '',
        newBranchNameHasFocus: true,
        branchingFormVisible: false,
        branchOrder: 0,
        aboveNode: null,
        belowNode: null,
        refSearchFormVisible: false,
        r: 15,
        cx: 610,
        cy: 120,
        stamp: -1,
        ancestorOfHEADTimeStamp: -1,
        isInited: false,
        logEntry: null,
        pgpVerifiedString() {
            if (this.signatureMade) {
                return `PGP by: ${this.signatureMade} at ${this.signatureDate}`;
            }
            return '';
        },
        refs() {
            return [...this.branchesAndLocalTags, ...this.remoteTags].sort((a, b) => {
                if (b.current()) return 1;
                if (a.current()) return -1;
                if (a.isLocal && !b.isLocal) return -1;
                if (!a.isLocal && b.isLocal) return 1;
                return a.refName < b.refName ? -1 : 1;
            });
        },
        branches() {
            return this.refs().filter((r) => r.isBranch);
        },
        tags() {
            return this.refs().filter((r) => r.isTag);
        },
        branchesToDisplay() {
            const branches = this.branches();
            const tags = this.tags();
            return branches.slice(
                0,
                ungit.config.numRefsToShow - Math.min(tags.length, maxTagsToDisplay)
            );
        },
        tagsToDisplay() {
            const tags = this.tags();
            return tags.slice(0, ungit.config.numRefsToShow - this.branchesToDisplay().length);
        },
        commitContainerVisible() {
            return this.ancestorOfHEAD || this.nodeIsMousehover || this.selected;
        },
        isNodeAccented() {
            return this.selected || this.isEdgeHighlighted;
        },
        showNewRefAction() {
            return !store.currentActionContext;
        },
        showRefSearch() {
            return this.branches().length + this.tags().length > ungit.config.numRefsToShow;
        },
        canCreateRef() {
            return this.newBranchName && this.newBranchName.trim() && !this.newBranchName.includes(' ');
        },
        setData(logEntry) {
            this.logEntry = logEntry;
            this.title = logEntry.message.split('\n')[0];
            this.parents = logEntry.parents || [];
            this.commitTime = logEntry.commitDate;
            this.date = Date.parse(this.commitTime);
            this.signatureMade = logEntry.signatureMade;
            this.signatureDate = logEntry.signatureDate;
            (logEntry.refs || []).forEach((refName) => {
                store.ensureRef(refName).setNode(this);
            });
            this.isInited = true;
        },
        async createBranch() {
            if (!this.canCreateRef()) return;
            const branchName = this.newBranchName;
            try {
                await store.server.postPromise('/branches', {
                    path: store.repoPath,
                    name: branchName,
                    sha1: this.sha1,
                });
                store.ensureRef(`refs/heads/${branchName}`).setNode(this);
                if (ungit.config.autoCheckoutOnBranchCreate) {
                    await store.server.postPromise('/checkout', {
                        path: store.repoPath,
                        name: branchName,
                    });
                }
            } catch (e) {
                store.server.unhandledRejection(e);
            } finally {
                this.branchingFormVisible = false;
                this.newBranchName = '';
                programEvents.dispatch({ event: 'branch-updated' });
            }
        },
        async createTag() {
            if (!this.canCreateRef()) return;
            const tagName = this.newBranchName;
            try {
                await store.server.postPromise('/tags', {
                    path: store.repoPath,
                    name: tagName,
                    sha1: this.sha1,
                });
                store.ensureRef(`refs/tags/${tagName}`).setNode(this);
            } catch (e) {
                store.server.unhandledRejection(e);
            } finally {
                this.branchingFormVisible = false;
                this.newBranchName = '';
            }
        },
    };
}

function createRefModel(store, fullRefName) {
    const refModel = {
        name: fullRefName,
        localRefName: fullRefName,
        refName: fullRefName,
        nodeSha1: null,
        show: true,
        dragging: false,
        isSelected: false,
        version: 0,
        current() {
            return this.isLocalBranch && store.checkedOutBranch === this.refName;
        },
        selected(value) {
            if (typeof value === 'undefined') {
                return this.isSelected;
            }
            if (typeof value === 'boolean') {
                this.isSelected = value;
                store.currentActionContext = value ? this : null;
                return;
            }
            if (value === this) {
                this.isSelected = !this.isSelected;
                store.currentActionContext = this.isSelected ? this : null;
                return;
            }
            this.isSelected = !!value;
            store.currentActionContext = this.isSelected ? this : null;
        },
        isDragging() {
            return this.dragging;
        },
        node() {
            if (!this.nodeSha1) return null;
            return store.nodesById[this.nodeSha1] || null;
        },
        setNode(node) {
            const oldNode = this.node();
            if (oldNode === node) return;
            removeRefFromNode(oldNode, this);
            this.nodeSha1 = node ? node.sha1 : null;
            addRefToNode(node, this);
        },
        displayHtml(largeCurrent) {
            const size = largeCurrent && this.current() ? 26 : 18;
            let prefix = '';
            if (this.isRemote) {
                prefix = `<span>${octicons.globe.toSVG({ height: size })}</span> `;
            }
            if (this.isBranch) {
                prefix += `<span>${octicons['git-branch'].toSVG({ height: size })}</span> `;
            } else if (this.isTag) {
                prefix += `<span>${octicons.tag.toSVG({ height: size })}</span> `;
            }
            return prefix + this.localRefName;
        },
        dragStart() {
            store.currentActionContext = this;
            this.dragging = true;
            if (document.activeElement) document.activeElement.blur();
        },
        dragEnd() {
            store.currentActionContext = null;
            this.dragging = false;
        },
        getLocalRef() {
            return store.ensureRef(this.getLocalRefFullName(), false);
        },
        getLocalRefFullName() {
            if (this.isRemoteBranch) return `refs/heads/${this.refName}`;
            if (this.isRemoteTag) return `tag: ${this.refName}`;
            return null;
        },
        getRemoteRef(remote) {
            return store.ensureRef(this.getRemoteRefFullName(remote), false);
        },
        getRemoteRefFullName(remote) {
            if (this.isLocalBranch) return `refs/remotes/${remote}/${this.refName}`;
            if (this.isLocalTag) return `remote-tag: ${remote}/${this.refName}`;
            return null;
        },
        async remove(isClientOnly) {
            let url = this.isTag ? '/tags' : '/branches';
            if (this.isRemote) url = `/remote${url}`;
            try {
                if (!isClientOnly) {
                    await store.server.delPromise(url, {
                        path: store.repoPath,
                        remote: this.isRemote ? this.remote : null,
                        name: this.refName,
                    });
                }
                removeRefFromNode(this.node(), this);
                this.nodeSha1 = null;
                store.refs = store.refs.filter((ref) => ref !== this);
                delete store.refsByRefName[this.name];
            } catch (e) {
                store.server.unhandledRejection(e);
            } finally {
                if (!isClientOnly) {
                    if (url === '/remote/tags') {
                        programEvents.dispatch({ event: 'request-fetch-tags' });
                    } else {
                        programEvents.dispatch({ event: 'branch-updated' });
                    }
                }
            }
        },
        async checkout() {
            const isRemote = this.isRemoteBranch;
            const localRef = this.getLocalRef();
            const isLocalCurrent = localRef && localRef.current();
            try {
                if (isRemote && !isLocalCurrent) {
                    await store.server.postPromise('/branches', {
                        path: store.repoPath,
                        name: this.refName,
                        sha1: this.name,
                        force: true,
                    });
                }
                await store.server.postPromise('/checkout', { path: store.repoPath, name: this.refName });
                if (isRemote && isLocalCurrent) {
                    await store.server.postPromise('/reset', {
                        path: store.repoPath,
                        to: this.name,
                        mode: 'hard',
                    });
                }
                const headRef = store.ensureRef('HEAD');
                headRef.setNode(this.node());
            } catch (err) {
                if (err.errorCode !== 'merge-failed') {
                    store.server.unhandledRejection(err);
                }
            }
        },
        async push() {
            try {
                await store.server.postPromise('/push', {
                    path: store.repoPath,
                    remote: store.currentRemote,
                    refSpec: this.refName,
                });
            } catch (err) {
                store.server.unhandledRejection(err);
            }
        },
        async reset() {
            try {
                await store.server.postPromise('/reset', {
                    path: store.repoPath,
                    to: this.name,
                    mode: 'hard',
                });
            } catch (err) {
                store.server.unhandledRejection(err);
            }
        },
        async squash() {
            try {
                await store.server.postPromise('/squash', {
                    path: store.repoPath,
                    target: this.refName,
                });
            } catch (err) {
                store.server.unhandledRejection(err);
            }
        },
    };

    refModel.isRemoteTag = refModel.name.indexOf('remote-tag: ') === 0;
    refModel.isLocalTag = refModel.name.indexOf('tag: ') === 0;
    refModel.isTag = refModel.isLocalTag || refModel.isRemoteTag;
    const isRemoteBranchOrHEAD = refModel.name.indexOf('refs/remotes/') === 0;
    refModel.isLocalHEAD = refModel.name === 'HEAD';
    refModel.isRemoteHEAD = refModel.name.includes('/HEAD');
    refModel.isLocalBranch = refModel.name.indexOf('refs/heads/') === 0;
    refModel.isRemoteBranch = isRemoteBranchOrHEAD && !refModel.isRemoteHEAD;
    refModel.isStash = refModel.name.indexOf('refs/stash') === 0;
    refModel.isHEAD = refModel.isLocalHEAD || refModel.isRemoteHEAD;
    refModel.isBranch = refModel.isLocalBranch || refModel.isRemoteBranch;
    refModel.isRemote = isRemoteBranchOrHEAD || refModel.isRemoteTag;
    refModel.isLocal = refModel.isLocalBranch || refModel.isLocalTag;

    if (refModel.isLocalBranch) {
        refModel.localRefName = refModel.name.slice('refs/heads/'.length);
        refModel.refName = refModel.localRefName;
    }
    if (refModel.isRemoteBranch) {
        refModel.localRefName = refModel.name.slice('refs/remotes/'.length);
    }
    if (refModel.isLocalTag) {
        refModel.localRefName = refModel.name.slice('tag: refs/tags/'.length);
        refModel.refName = refModel.localRefName;
    }
    if (refModel.isRemoteTag) {
        refModel.localRefName = refModel.name.slice('remote-tag: '.length);
    }
    const splitName = refModel.localRefName.split('/');
    if (refModel.isRemote) {
        refModel.remote = splitName[0];
        refModel.refName = splitName.slice(1).join('/');
    }
    refModel.value = splitName[splitName.length - 1];
    refModel.label = refModel.localRefName;
    refModel.color = `#${md5(refModel.name).toString().slice(0, 6)}`;

    return refModel;
}

export const useRepositoryStore = defineStore('repository', {
    state: () => ({
        server: null,
        repoPath: '',
        nodes: [],
        edges: [],
        nodesById: {},
        refs: [],
        refsByRefName: {},
        checkedOutBranch: null,
        currentRemote: null,
        currentActionContext: null,
        highestBranchOrder: 0,
        ideologicalStamp: 0,
    }),
    actions: {
        initializeContext(server, repoPath) {
            this.server = server;
            this.repoPath = repoPath;
        },
        clearGraphData() {
            this.nodes = [];
            this.edges = [];
            this.nodesById = {};
            this.refs = [];
            this.refsByRefName = {};
            this.currentActionContext = null;
            this.highestBranchOrder = 0;
            this.ideologicalStamp = 0;
        },
        ensureNode(sha1, logEntry) {
            let node = this.nodesById[sha1];
            if (!node) {
                node = createNodeModel(this, sha1);
                this.nodesById[sha1] = node;
            }
            if (logEntry) node.setData(logEntry);
            return node;
        },
        ensureRef(refName, constructIfUnavailable = true) {
            if (!refName) return null;
            let refModel = this.refsByRefName[refName];
            if (!refModel && constructIfUnavailable) {
                refModel = createRefModel(this, refName);
                this.refsByRefName[refName] = refModel;
                this.refs.push(refModel);
            }
            return refModel || null;
        },
        setCheckedOutBranch(checkout) {
            this.checkedOutBranch = checkout;
        },
        headRef() {
            return this.ensureRef('HEAD', false);
        },
        headNode() {
            const headRef = this.headRef();
            return headRef ? headRef.node() : null;
        },
        traverseNodeParents(node, callback) {
            if (!node || !callback(node)) return;
            for (let i = 0; i < node.parents.length; i += 1) {
                const parent = this.nodesById[node.parents[i]];
                if (parent) this.traverseNodeParents(parent, callback);
            }
        },
        traverseNodeLeftParents(node, callback) {
            if (!node) return;
            callback(node);
            const parent = this.nodesById[node.parents[0]];
            if (parent) this.traverseNodeLeftParents(parent, callback);
        },
        markNodesIdeologicalBranches() {
            const refs = this.refs
                .filter((ref) => !!ref.node())
                .sort((a, b) => {
                    if (a.isLocal && !b.isLocal) return -1;
                    if (b.isLocal && !a.isLocal) return 1;
                    if (a.isBranch && !b.isBranch) return -1;
                    if (b.isBranch && !a.isBranch) return 1;
                    if (a.isHEAD && !b.isHEAD) return 1;
                    if (!a.isHEAD && b.isHEAD) return -1;
                    if (a.isStash && !b.isStash) return 1;
                    if (b.isStash && !a.isStash) return -1;
                    if (a.node() && a.node().date && b.node() && b.node().date) {
                        return a.node().date - b.node().date;
                    }
                    return a.refName < b.refName ? -1 : 1;
                });
            const stamp = this.ideologicalStamp;
            this.ideologicalStamp += 1;
            refs.forEach((refModel) => {
                this.traverseNodeParents(refModel.node(), (node) => {
                    if (node.stamp === stamp) return false;
                    node.stamp = stamp;
                    node.ideologicalBranch = refModel;
                    return true;
                });
            });
        },
        computeNodesLayout(logNodes) {
            this.markNodesIdeologicalBranches();

            const updateTimeStamp = Date.now();
            const headNode = this.headNode();
            if (headNode) {
                this.traverseNodeLeftParents(headNode, (node) => {
                    node.ancestorOfHEADTimeStamp = updateTimeStamp;
                });
            }

            const filteredNodes = logNodes.filter((node) => {
                return (
                    (node.ideologicalBranch && !node.ideologicalBranch.isStash) ||
                    node.ancestorOfHEADTimeStamp === updateTimeStamp
                );
            });

            let branchSlotCounter = headNode ? 1 : 0;
            for (let i = filteredNodes.length - 1; i >= 0; i -= 1) {
                const node = filteredNodes[i];
                if (node.ancestorOfHEADTimeStamp === updateTimeStamp) continue;
                const ideologicalBranch = node.ideologicalBranch;
                if (ideologicalBranch.lastSlottedTimeStamp !== updateTimeStamp) {
                    ideologicalBranch.lastSlottedTimeStamp = updateTimeStamp;
                    ideologicalBranch.branchOrder = branchSlotCounter;
                    branchSlotCounter += 1;
                }
                node.branchOrder = ideologicalBranch.branchOrder;
            }

            this.highestBranchOrder = branchSlotCounter - 1;
            let prevNode = null;
            filteredNodes.forEach((node) => {
                node.ancestorOfHEAD = node.ancestorOfHEADTimeStamp === updateTimeStamp;
                if (node.ancestorOfHEAD) node.branchOrder = 0;
                node.aboveNode = prevNode;
                if (prevNode) prevNode.belowNode = node;
                prevNode = node;
            });

            filteredNodes.forEach((node) => {
                node.refSearchFormVisible = false;
                if (!node.isInited) return;
                if (node.ancestorOfHEAD) {
                    node.r = 30;
                    node.cx = 610;
                    if (!node.aboveNode) {
                        node.cy = 120;
                    } else if (node.aboveNode.ancestorOfHEAD) {
                        node.cy = node.aboveNode.cy + 120;
                    } else {
                        node.cy = node.aboveNode.cy + 60;
                    }
                } else {
                    node.r = 15;
                    node.cx = 610 + 90 * node.branchOrder;
                    node.cy = node.aboveNode ? node.aboveNode.cy + 60 : 120;
                }
            });

            return filteredNodes;
        },
        hydrateNodesFromLog(log) {
            const nodes = this.computeNodesLayout(
                (log.nodes || []).map((logEntry) => this.ensureNode(logEntry.sha1, logEntry))
            );
            const edges = [];
            nodes.forEach((node) => {
                node.parents.forEach((parentSha1) => {
                    edges.push({
                        id: `${node.sha1}-${parentSha1}`,
                        nodeAsha1: node.sha1,
                        nodeBsha1: parentSha1,
                    });
                });
            });
            this.nodes = nodes;
            this.edges = edges;
        },
        setRemoteTags(remoteTags) {
            const version = Date.now();
            const sha1Map = {};
            remoteTags.forEach((tag) => {
                if (tag.name.includes('^{}')) {
                    const tagRef = tag.name.slice(0, tag.name.length - '^{}'.length);
                    sha1Map[tagRef] = tag.sha1;
                } else if (!sha1Map[tag.name]) {
                    sha1Map[tag.name] = tag.sha1;
                }
            });

            remoteTags.forEach((ref) => {
                if (ref.name.includes('^{}')) return;
                const name = `remote-tag: ${ref.remote}/${ref.name.split('/')[2]}`;
                const targetNode = this.ensureNode(sha1Map[ref.name]);
                const targetRef = this.ensureRef(name);
                targetRef.setNode(targetNode);
                targetRef.version = version;
            });

            this.refs.slice().forEach((refModel) => {
                if (refModel.isRemoteTag && (!refModel.version || refModel.version < version)) {
                    refModel.remove(true);
                }
            });
        },
        applyRefsPayload(refsPayload, options = { showRemote: true, showBranch: true, showTag: true }) {
            const version = Date.now();
            const sorted = refsPayload
                .map((refPayload) => {
                    const refModel = this.ensureRef(asTagRefName(refPayload.name));
                    refModel.setNode(this.ensureNode(refPayload.sha1));
                    refModel.version = version;
                    return refModel;
                })
                .sort((a, b) => {
                    if (a.current() || b.current()) return a.current() ? -1 : 1;
                    if (a.isRemoteBranch === b.isRemoteBranch) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    }
                    return a.isRemoteBranch ? 1 : -1;
                })
                .filter((refModel) => {
                    if (refModel.localRefName === 'refs/stash') return false;
                    if (refModel.localRefName.endsWith('/HEAD')) return false;
                    if (!options.showRemote && refModel.isRemote) return false;
                    if (!options.showBranch && refModel.isBranch) return false;
                    if (!options.showTag && refModel.isTag) return false;
                    return true;
                });

            this.refs.slice().forEach((refModel) => {
                if (!refModel.isRemoteTag && refModel.value !== 'HEAD' && (!refModel.version || refModel.version < version)) {
                    refModel.remove(true);
                }
            });

            return sorted;
        },
    },
});