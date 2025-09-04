<template>
    <button class="btn-secondary add-to-repolist" 
    type="button"
    data-aid="bookmark-repo-btn"
    data-bind="html: addIcon, visible: showAddToRepoListButton" data-side="bottom"
    data-tooltip="Add current git directory to Ungit home page"
    @click="addCurrentPathToRepoList"
    v-if="showAddToRepoListButton"
    >
        <Octicon name="plus" />
    </button>
</template>

<script setup>
import programEvents from '../source/js/program-events';
import storage from '/source/js/storage.js';
import { encodePath } from '../../backend/source/address-parser.js';
import Octicon from './Octicon.vue';
import { ref, watchEffect } from 'vue';

const props = defineProps(['path']);

const showAddToRepoListButton = ref(false);

defineOptions({
    name: 'BookmarkButton',
});

const addCurrentPathToRepoList = () => {
    programEvents.dispatch({ event: 'request-remember-repo', repoPath: props.path });
    return true;
};

const fetchRepositories = async () => {
    const storedPaths = JSON.parse(storage.getItem('repositories') || '[]');
    const repos = storedPaths.map(path => {
        return {
        path: path,
        name: path.split('/').pop(), // Extract the last part of the path as the name
        link: `/#/repository?path=${encodePath(path)}`,
        };
    });
    return repos;
};


watchEffect(async () => {
    if (!props.path) return false;

    const repos = await fetchRepositories();
    showAddToRepoListButton.value = !repos.find(repo => repo.path === props.path);
});

</script>