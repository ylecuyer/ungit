import ko from 'knockout';
import { CommitLineDiff } from './commitlinediff.js';
import components from '/source/source/components.js';
import commitDiffTemplate from './commitdiff.html?raw';

components.register('commitDiff', (args) => new CommitDiff(args));
const commitDiffElement = document.createElement('template');
commitDiffElement.id = 'commitdiff';
commitDiffElement.innerHTML = commitDiffTemplate;
document.body.appendChild(commitDiffElement);

class CommitDiff {
  constructor(args) {
    this.sha1 = args.sha1;

    this.showDiffButtons = args.showDiffButtons;
    this.textDiffType = args.textDiffType = args.textDiffType || components.create('textdiff.type');
    this.wordWrap = args.wordWrap = args.wordWrap || components.create('textdiff.wordwrap');
    this.whiteSpace = args.whiteSpace = args.whiteSpace || components.create('textdiff.whitespace');

    this.commitLineDiffs = args.fileLineDiffs.map(
      (fileLineDiff) => new CommitLineDiff(args, fileLineDiff)
    );
  }

  updateNode(parentElement) {
    ko.renderTemplate('commitdiff', this, {}, parentElement);
  }
}

export default CommitDiff;
