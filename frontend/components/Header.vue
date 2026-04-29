<template>
    <header class="bg-background sticky inset-x-0 top-0 isolate flex shrink-0 items-center gap-2 border-b z-10">
        <div class="flex h-14 w-full items-center gap-2 px-4">
            <Octicon name="arrow-left" v-if="showBackButton" class="btn-sm-icon-ghost mr-2 size-7 -ml-1.5" @click.prevent="goHome()" aria-label="Go back" />
            <button type="button" onclick="document.dispatchEvent(new CustomEvent('basecoat:sidebar'))" aria-label="Toggle sidebar"
            data-tooltip="Toggle sidebar" data-side="bottom" data-align="start" class="btn-sm-icon-ghost mr-2 size-7 -ml-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M9 3v18"></path>
            </svg>
            </button>
            <form class="path-input-form flex w-full" @submit.prevent="submitPath">
            <input
                class="w-full"
                type="text"
                v-model="path"
                placeholder="Enter path to repository"
                aria-label="Path to repository"
            />
            </form>
            <BookmarkButton :path="path" />
            <RefreshButton />
        </div>
    </header>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

import navigation from '/source/js/navigation.js';
import { encodePath } from '../../backend/source/address-parser.js';
import programEvents from '/source/js/program-events.js';

const path = ref('');
const showBackButton = ref(false);

programEvents.add((event) => {
    if (event.event == 'navigation-changed') {
      showBackButton.value = event.path != '';
      if (event.path == '') path.value = '';
    } else if (event.event == 'navigated-to-path') {
      path.value = event.path;
    }
});

watchEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
    const pathParam = urlParams.get('path');
    if (pathParam) {
        path.value = pathParam;
    }
});

defineOptions({
    name: 'Header',
});

const goHome = () => {
    navigation.browseTo('');
};

const submitPath = () => {
    navigation.browseTo(`repository?path=${encodePath(path.value)}`);
};
</script>

<style scoped>
header {
    background-color: #fff;
}
</style>