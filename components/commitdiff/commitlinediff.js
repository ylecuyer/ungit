const ko = require('knockout');
const components = require('../../public/source/components');
const inherits = require('util').inherits;
const programEvents = require('../../public/source/program-events');

class CommitLineDiff {
  constructor(args, fileLineDiff) {
    this.added = ko.observable(fileLineDiff[0]);
    this.removed = ko.observable(fileLineDiff[1]);
    this.fileName = ko.observable(fileLineDiff[2]);
    this.fileType = fileLineDiff[3];
    this.isShowingDiffs = ko.observable(false);
    this.repoPath = args.repoPath;
    this.server = args.server;
    this.sha1 = args.sha1;
    this.textDiffType = args.textDiffType;
    this.wordWrap = args.wordWrap;
    this.whiteSpace = args.whiteSpace;
    this.specificDiff = ko.observable(this.getSpecificDiff());
  }

  getSpecificDiff() {
    return components.create(`${this.fileType}diff`, {
      filename: this.fileName(),
      repoPath: this.repoPath,
      server: this.server,
      sha1: this.sha1,
      textDiffType: this.textDiffType,
      isShowingDiffs: this.isShowingDiffs,
      whiteSpace: this.whiteSpace,
      wordWrap: this.wordWrap
    });
  }

  fileNameClick() {
    this.isShowingDiffs(!this.isShowingDiffs());
    programEvents.dispatch({ event: 'graph-render' });
  }
}

exports.CommitLineDiff = CommitLineDiff;
