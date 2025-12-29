class Edge {
  constructor(graph, nodeAsha1, nodeBsha1) {
    this.nodeAsha1 = nodeAsha1;
    this.nodeBsha1 = nodeBsha1;
    this.nodeA = graph.getNode(nodeAsha1);
    this.nodeB = graph.getNode(nodeBsha1);
  }
  }

export default Edge;