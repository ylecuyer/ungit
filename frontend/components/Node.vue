<template>
    <g>
        <circle @click.stop="emit('toggle')"
            :r="r" :fill="color" :data-ta-clickable="clickable" :cx="cx" :cy="cy" />
        <circle v-if="isNodeAccented || selected" :r="r - 4" @click.stop="emit('toggle')"
            stroke="#252833" stroke-width="4" fill="transparent" :cx="cx" :cy="cy" />
    </g>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
  name: 'Node',
});

const props = defineProps(['r', 'color', 'cx', 'cy', 'isNodeAccented', 'selected']);
const emit = defineEmits(['toggle']);

const clickable = computed(() => 'node-clickable');

</script>

<style scoped></style>