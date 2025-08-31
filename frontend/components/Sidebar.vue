<template>
    <aside class="sidebar" data-side="left">
        <nav>
            <header>
            <div class="btn-ghost p-2 w-full justify-start flex h-12">
                <img src="../public/icon.svg" class="size-8" />
                <div class="flex flex-col">
                <span class="truncate font-medium">Ungit</span>
                <span class="truncate text-xs">v1.5.28</span>
                </div>
            </div>
            </header>
            <section class="scrollbar">
            <div role="group">
                <h3>Bookmarked repositories</h3>
                <ul data-bind="foreach: bookmarkedRepos" data-aid="bookmarked-repos">
                <li v-for="repo in bookmarkedRepos">
                    <a :href="repo.link">{{ repo.name }}</a>
                </li>
                </ul>
            </div>
            </section>
            <footer>
            <a class="btn-ghost justify-start" href="https://github.com/ylecuyer/ungit" data-bind="html: githubLink" target="_blank">
                <Octicon name="mark-github"></Octicon>
                Github
            </a>
            </footer>
        </nav>
    </aside>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

import storage from '/source/js/storage.js';
import { encodePath } from '../../backend/source/address-parser.js';

defineOptions({
    name: 'Sidebar'
});

const bookmarkedRepos = ref([]);

const fetchRepositories = async () => {
    const storedPaths = JSON.parse(storage.getItem('repositories') || '[]');
    const repos = storedPaths.map(path => {
        return {
        path: path,
        name: path.split('/').pop(), // Extract the last part of the path as the name
        link: `/#/repository?path=${encodePath(path)}`,
        };
    });
    bookmarkedRepos.value = repos;
};

watchEffect(async () => {
    await fetchRepositories();
});
</script>
