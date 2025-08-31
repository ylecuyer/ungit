class ModalViewModel {
  constructor(title, taModalName) {
    this.title = title;
    this.taModalName = taModalName;
    this.timestamp = new Date().getTime();
  }

  close() {
    ungit.programEvents.dispatch({ event: 'modal-close-dialog', modal: this });
  }
}

class FormItems {
  constructor(name, value, type, autoFocus) {
    this.name = name;
    this.value = value;
    this.type = type;
    this.autoFocus = autoFocus;
  }
}

class PromptOptions {
  constructor(label, primary, taId, close) {
    this.label = label;
    this.primary = primary;
    this.taId = taId;
    this.close = close;
  }
}

export { ModalViewModel, FormItems, PromptOptions };