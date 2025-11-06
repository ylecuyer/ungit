<template>
    <div class="repository-view animated fadeInLeft" data-bind="attr: { style: 'tab-size: ' + ungit.config.tabSize }">
        <GitErrors :repoPath="repoPath" />

        <div v-if="isSubmodule" class="submodule alert alert-warning">
            <h4>This is a submodule</h4>
            Base repository: <a v-text="parentModulePath" :href="parentModuleLink"></a>
        </div>

        <Stash :repoPath="repoPath" />
        <!-- <Staging :repoPath="repoPath" :graph="null" /> -->

        <!-- ko if: staging.conflictText -->
        <h2 class="text-muted">
            <span data-bind="text: staging.conflictText" /> in progress
            <small>resolve conflicts to continue</small>
        </h2>
        <!-- /ko -->

        <!-- ko if: showLog -->

        <div class="repository-actions flex gap-2">
            <Remotes :repoPath="repoPath" />
            <Submodules :repoPath="repoPath" />
            <!-- <Branches :repoPath="repoPath" :graph="graph" /> --> 
            <Gitignore :repoPath="repoPath" />
        </div>

        <!-- ko component: graph --><!-- /ko -->

        <!-- /ko -->
    </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { encodePath } from '../../backend/source/address-parser.js';

defineOptions({
    name: 'Repository',
});

const props = defineProps(['server', 'repoPath']);

const parentModulePath = ref(undefined);
const parentModuleLink = ref(undefined);
const isSubmodule = computed(() => {
    return parentModulePath.value && parentModuleLink.value;
});

const refreshSubmoduleStatus = () => {
    console.log("Refreshing submodule status for", props.repoPath);
    return props.server
        .getPromise('/baserepopath', { path: props.repoPath })
        .then((baseRepoPath) => {
            console.log("Base repo path", baseRepoPath);
            if (baseRepoPath.path) {
                return props.server
                    .getPromise('/submodules', { path: baseRepoPath.path })
                    .then((submodules) => {
                        console.log("Submodules", submodules);
                        const baseName = props.repoPath.substring(baseRepoPath.path.length + 1);
                        for (let n = 0; n < submodules.length; n++) {
                            console.log("Checking submodule", submodules[n].path, "against", baseName);
                            if (submodules[n].path === baseName) {
                                parentModulePath.value = baseRepoPath.path;
                                parentModuleLink.value = `/#/repository?path=${encodePath(baseRepoPath.path)}`;
                                return;
                            }
                        }
                    });
            }
        })
        .catch((err) => {
            console.error("Error refreshing submodule status:", err);
            parentModuleLink.value = undefined;
            parentModulePath.value = undefined;
        });
}

watchEffect(
    refreshSubmoduleStatus
);
</script>

<style>
.repository-view {
  position: relative;
  height: auto;
  margin-bottom: 1px;
  padding-bottom: 1px;

  .repository-actions {
    position: absolute;
    margin-top: 20px;
    right: 0;
    z-index: 30;
  }
}
</style>