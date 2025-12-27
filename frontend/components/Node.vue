<template>
    <svg ref="element">
        <circle @mouseover="nodeIsMouseHover = true" @mouseout="nodeIsMouseHover = false" @click="selected = !selected"
            :r="r" :fill="color" data-ta-clickable="node-clickable-+ index" :cx="cx" :cy="cy" />
        <circle v-if="isNodeAccented" data-bind=" attr: { r: r() - 4 }, click: toggleSelected" stroke="#252833"
            stroke-width="4" fill="transparent" :cx="cx" :cy="cy" />
    </svg>
</template>

<script setup>
import { ref } from 'vue';

defineOptions({
  name: 'Node',
});

const props = defineProps(['r', 'color', 'cx', 'cy', 'isNodeAccented']);

const element = ref(null);
const nodeIsMouseHover = ref(false);
const selected = ref(false);

</script>

<style scoped></style>