<template>
    <button
    class="btn-secondary"
    data-tooltip="Refresh changes"
    data-side="bottom"
    data-align="end"
    data-aid="refresh-button"
    @click="refresh"
    >
        <Octicon name="sync" />
    </button>
</template>

<script setup>
import programEvents from '../source/js/program-events';
import Octicon from './Octicon.vue';

defineOptions({
    name: 'RefreshButton',
});

const refresh = () => {
    programEvents.dispatch({ event: 'request-app-content-refresh' });
};
</script>