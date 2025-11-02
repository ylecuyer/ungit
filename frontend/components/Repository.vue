<template>
    <div class="repository-view animated fadeInLeft" data-bind="attr: { style: 'tab-size: ' + ungit.config.tabSize }">
        <GitErrors :repoPath="repoPath" />

        <!-- ko if: isSubmodule -->
        <div class="submodule alert alert-warning">
            <h4>This is a submodule</h4>
            Base repository: <a data-bind="text: parentModulePath, attr: { href: parentModuleLink}"></a>
        </div>
        <!-- /ko -->

        <Stash :repoPath="repoPath" />
        <Staging :repoPath="repoPath" :graph="null" />

        <!-- ko if: staging.conflictText -->
        <h2 class="text-muted">
            <span data-bind="text: staging.conflictText" /> in progress
            <small>resolve conflicts to continue</small>
        </h2>
        <!-- /ko -->

        <!-- ko if: showLog -->

        <div class="repository-actions flex gap-2">
            <!-- ko if: refreshButton -->
            <!-- ko component: refreshButton --><!-- /ko -->
            <!-- /ko -->
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
import { graph } from '@primer/octicons';
import GitErrors from './GitErrors.vue';

defineOptions({
    name: 'Repository',
});

const props = defineProps(['server', 'repoPath']);
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