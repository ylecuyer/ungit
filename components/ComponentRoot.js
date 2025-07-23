class ComponentRoot {
  constructor() {
    this._apiCache = undefined;
    this.defaultDebounceOption = {
      maxWait: 1500,
      leading: false,
      trailing: true
    };
  }

  isSamePayload(value) {
    const jsonString = JSON.stringify(value);

    if (this._apiCache === jsonString) {
      ungit.logger.debug(`ignoring redraw for same ${this.constructor.name} payload.`);
      return true;
    }
    ungit.logger.debug(`redrawing ${this.constructor.name} payload.  \n${jsonString}`);

    this._apiCache = jsonString;
    return false;
  }

  clearApiCache() {
    this._apiCache = undefined;
  }
}

module.exports = { ComponentRoot };
