import ko from 'knockout';

class Selectable {
  constructor(graph) {
    this.selected = ko.computed({
      read() {
        return graph.currentActionContext.value == this;
      },
      write(val) {
        // val is this if we're called from a click ko binding
        if (val === this || val === true) {
          graph.currentActionContext.value = this;
        } else if (graph.currentActionContext.value == this) {
          graph.currentActionContext.value = null;
        }
      },
      owner: this,
    });
  }
}

export default Selectable;
