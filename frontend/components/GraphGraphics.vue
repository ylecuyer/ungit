<template>
    <svg
    class="graphLog"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    :width="graphWidth"
    :height="graphHeight"
    >
    <defs>
        <marker
        id="rebaseArrowEnd"
        viewBox="0 0 10 10"
        refX="0"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="4"
        markerHeight="3"
        orient="auto"
        >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#22252E" />
        </marker>
        <marker
        id="pushArrowEnd"
        viewBox="0 0 10 10"
        refX="0"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="4"
        markerHeight="3"
        orient="auto"
        >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(61, 139, 255)" />
        </marker>
    </defs>
    <g>
        <g v-if="commitNodeEdge"
        class="load-ahead-button"
        :opacity="commitOpacity"
        @click="loadAhead"
        >
            <path
                :d="commitNodeEdge"
                stroke="#4A4A4A"
                stroke-width="8"
                stroke-dasharray="10, 5"
            />
            <circle
                :stroke="commitNodeColor"
                cx="610"
                cy="35"
                r="30"
                stroke-dasharray="10, 7"
                stroke-width="10"
                fill="transparent"
            />
            <circle v-if="skip > 0"
                class="loadAhead"
                :fill="commitNodeColor"
                cx="610"
                cy="35"
                r="15"
            />
        </g>

        <!-- ko with: hoverGraphActionGraphic -->
        <!-- ko foreach: bgEdges -->
        <path
        data-bind="attr: { d: d, stroke: stroke, 'stroke-width': strokeWidth, 'stroke-dasharray': strokeDasharray, 'marker-end': markerEnd }"
        />
        <!-- /ko -->
        <!-- /ko -->

        <Edge v-for="edge in edges" :nodeAsha1="edge.nodeAsha1" :nodeBsha1="edge.nodeBsha1" :getNode="getNode" />

        <Node v-for="node in nodes" :r="node.r()" :color="node.ideologicalBranch() ? node.ideologicalBranch().color : '#666'" :isNodeAccented="node.isNodeAccented()" :cx="node.cx()" :cy="node.cy()" :key="node.sha1" />

        <!-- ko with: hoverGraphActionGraphic -->
        <!-- ko foreach: nodes -->
        <circle
        data-bind="attr: { cx: cx, cy: cy, r: r, fill: fill, stroke: stroke, 'stroke-width': strokeWidth, 'stroke-dasharray': strokeDasharray }"
        />
        <!-- /ko -->
        <!-- ko foreach: fgEdges -->
        <path
        data-bind="attr: { d: d, stroke: stroke, 'stroke-width': strokeWidth, 'stroke-dasharray': strokeDasharray, 'marker-end': markerEnd }"
        />
        <!-- /ko -->
        <!-- /ko -->
    </g>
    </svg>
</template>

<script setup>
defineOptions({
  name: 'GraphGraphics',
});

const props = defineProps(['graphWidth', 'graphHeight', 'commitNodeEdge', 'commitNodeColor', 'commitOpacity', "loadAhead", "skip", "edges", "nodes", "getNode"]);
</script>