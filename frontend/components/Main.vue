<template>
    <Crash v-if="crash" :eventcause="crash" />
    <App v-else :server="server" />
</template>

<script setup>
import { ref } from 'vue';
import programEvents from '/source/js/program-events.js';

defineOptions({
    name: 'Main',
});

const props = defineProps(['server']);

const crash = ref('');

programEvents.add(async (event) => {
    ungit.logger.info(`received event: ${event.event}`);

    if (event.event == 'disconnected' || event.event == 'git-crash-error') {
        console.error(`ungit crash: ${event.event}`, event.error, event.stacktrace);
        crash.value = event.event;
    } else if (event.event == 'connected') {
        crash.value = '';
    }
});
</script>
