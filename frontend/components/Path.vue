<template>
    <div class="path" data-bind="shown: shown">
        <div v-if="status == 'uninited'" class="uninited container">
            <div class="alert alert-info" data-bind="visible: showDirectoryCreatedAlert">
            Directory "<span data-bind="text: dirName"></span>" created.
            </div>

            <div class="row create-repo-container panel">
            <div class="alert flex gap-2 border-blue-50 bg-blue-50 text-blue-900">
                <div data-bind="html: infoIcon"></div>
                <div data-bind="text: alertText"></div>
            </div>

            <div data-bind="visible: isShowCreateRepo">
                <div class="grid grid-cols-2 gap-6">
                <button class="btn" data-bind="click: initRepository" data-aid="init-repository">
                    Create Repository
                </button>
                <div>
                    <div class="card">
                    <section>
                        <form class="form" data-bind="submit: cloneRepository">
                            <div class="grid gap-2">
                            <label for="cloneFromInput">Clone from</label>
                            <input id="cloneFromInput" type="text" placeholder="URL" data-bind="value: cloneUrl, valueUpdate: 'afterkeydown'" required />
                            <label for="cloneToInput">into</label>
                            <input id="cloneToInput" type="text" data-bind="value: cloneDestination, attr: { placeholder: cloneDestinationImplicit }" />
                            <label>
                                <input type="checkbox" data-bind="checked: isRecursiveSubmodule" />
                                Recurse submodules
                            </label>
                            <button class="btn btn-primary btn-lg" type="submit">Clone Repository</button>
                            </div>
                        </form>
                    </section>
                    </div>
                </div>
                </div>
            </div>
            </div>

            <div class="list-group" data-bind="foreach: subRepos">
            <a class="list-group-item repository" data-bind="attr: { href: link }">
                <span class="arrow-icon octicon-circled pull-left" data-bind="html: arrowIcon"></span>
                <h4 class="list-group-item-heading" data-bind="text: title"></h4>
                <p class="list-group-item-text" data-bind="text: remote"></p>
            </a>
            </div>
        </div>

        <div v-if="status == 'no-such-path'" class="invalid-path container">
            <h1>Invalid path</h1>
            <p>"<span data-bind="text: repoPath"></span>" doesn't seem to be a valid path.</p>
            <div class="create-dir">
            <button class="btn btn-primary btn-lg" data-bind="click: createDir">Create Directory</button>
            </div>
        </div>

        <div v-if="status == 'inited' || status == 'bare'">
            <Repository :server="server" :repoPath="repoPath" :status="status"/>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import programEvents from '../source/js/program-events';

defineOptions({
    name: 'Path',
});

const props = defineProps(['server', 'repoPath']);

const status = ref('loading');

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

const updateStatus = async () => {
    ungit.logger.debug('path.updateStatus() triggered');
    const res = await props.server.getPromise('/quickstatus', { path: props.repoPath });
    try {
        if (isSamePayload(res)) {
            return;
        }

        if (res.type == 'inited' || res.type == 'bare') {
            if (props.repoPath !== res.gitRootPath) {
                // TODO props.repoPath = res.gitRootPath;
                programEvents.dispatch({ event: 'navigated-to-path', path: props.repoPath });
                programEvents.dispatch({ event: 'working-tree-changed' });
            }
            status.value = res.type;
        } else if (res.type == 'uninited' || res.type == 'no-such-path') {
            if (res.subRepos && res.subRepos.length > 0) {
                this.subRepos(
                    res.subRepos.map((subRepo) => new SubRepositoryViewModel(this.server, subRepo))
                );
            }
            status.value = res.type;
            this.repository(null);
        }
    } catch (err) {
        ungit.logger.debug('path.updateStatus() errored', err);
    } finally {
        ungit.logger.debug('path.updateStatus() finished');
    }
}

watchEffect(() => {
    updateStatus();
});

</script>

<style>
.create-dir {
  margin-top: 50px;
}

.create-repo-container {
  background-color: white;
  box-shadow: 0 -1px 15px #252833;
  padding: 5px 10px 5px 10px;
}

.create-repo-toggle {
  float: right;
  margin-top: -75px;
  margin-right: 10px;
}
</style>