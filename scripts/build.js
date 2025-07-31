const fsSync = require('fs');
const fs = fsSync.promises;
const path = require('path');

const browserify = require('browserify');
const babelify = require('babelify');
const exorcist = require('exorcist');
const mkdirp = require('mkdirp').mkdirp;

const baseDir = path.join(__dirname, '..');

(async () => {
  // copy
  console.log('copy bootstrap fonts');
  await Promise.all(
    [
      'node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.eot',
      'node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.svg',
      'node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.ttf',
      'node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.woff',
      'node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.woff2',
    ].map(async (file) => {
      await copyToFolder(file, 'public/fonts');
    })
  );
})();

async function copyToFolder(source, destination) {
  source = path.join(baseDir, source);
  destination = path.join(baseDir, destination, path.basename(source));
  await fs.copyFile(source, destination);
  console.log(`copy ${path.relative(baseDir, destination)}`);
}
