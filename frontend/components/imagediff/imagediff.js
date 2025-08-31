import ko from 'knockout';
import octicons from '@primer/octicons';
import components from '/source/js/components.js';
import { encodePath } from '../../../backend/source/address-parser.js';
import imageDiffTemplate from './imagediff.html?raw';

components.register('imagediff', (args) => new ImageDiffViewModel(args));
const imageDiffElement = document.createElement('template');
imageDiffElement.id = 'imagediff';
imageDiffElement.innerHTML = imageDiffTemplate;
document.body.appendChild(imageDiffElement);

class ImageDiffViewModel {
  constructor(args) {
    this.filename = args.filename;
    this.oldFilename = args.oldFilename;
    this.repoPath = args.repoPath;
    this.isNew = ko.observable(false);
    this.isRemoved = ko.observable(false);
    this.sha1 = args.sha1;
    this.state = ko.computed(() => {
      if (this.isNew()) return 'new';
      if (this.isRemoved()) return 'removed';
      return 'changed';
    });
    const gitDiffURL = `/api/diff/image?path=${encodePath(
      this.repoPath()
    )}`;
    this.oldImageSrc =
      gitDiffURL + `&filename=${this.oldFilename}&version=${this.sha1 ? this.sha1 + '^' : 'HEAD'}`;
    this.newImageSrc =
      gitDiffURL + `&filename=${this.filename}&version=${this.sha1 ? this.sha1 : 'current'}`;
    this.isShowingDiffs = args.isShowingDiffs;
    this.rightArrowIcon = octicons['arrow-right'].toSVG({ height: 100 });
    this.downArrowIcon = octicons['arrow-down'].toSVG({ height: 100 });
  }

  updateNode(parentElement) {
    ko.renderTemplate('imagediff', this, {}, parentElement);
  }

  invalidateDiff() {}

  newImageError() {
    this.isRemoved(true);
  }

  oldImageError() {
    this.isNew(true);
  }
}

export default ImageDiffViewModel;
