<template>
    <path data-bind="element: element, event: { mouseover: edgeMouseOver, mouseout: edgeMouseOut }"
        :element="element" stroke="#4A4A4A" stroke-width="8" />
</template>

<script setup>
import { ref } from 'vue';

defineOptions({
    name: 'Edge',
});

const element = ref(null);
</script>

<style scoped></style>