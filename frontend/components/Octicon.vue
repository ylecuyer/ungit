<template>
    <span v-html="icon"></span>
</template>

<script setup>
import { computed } from 'vue';
import octicons from '@primer/octicons';

const props = defineProps(['name']);

const icon = computed(() => {
    return octicons[props.name].toSVG();
});

defineOptions({
    name: 'Octicon'
});
</script>
