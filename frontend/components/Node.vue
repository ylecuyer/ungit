<template>
    <g ref="element">
        <circle @mouseover="nodeIsMouseHover = true" @mouseout="nodeIsMouseHover = false" @click="selected = !selected"
            :r="r" :fill="color" :data-ta-clickable="clickable" :cx="cx" :cy="cy" />
        <circle v-if="isNodeAccented" :r="r - 4" @click="selected = !selected"
            stroke="#252833" stroke-width="4" fill="transparent" :cx="cx" :cy="cy" />
    </g>
</template>

<script setup>
import { ref, computed } from 'vue';

defineOptions({
  name: 'Node',
});

const props = defineProps(['r', 'color', 'cx', 'cy', 'isNodeAccented']);

const element = ref(null);
const nodeIsMouseHover = ref(false);
const selected = ref(false);
const index = ref(0);

const clickable = computed(() => "node-clickable-" + index.value);

const isNodeAccented = computed(() => selected.value);

</script>

<style scoped></style>