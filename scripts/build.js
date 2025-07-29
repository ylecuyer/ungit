const fsSync = require('fs');
const fs = fsSync.promises;
const path = require('path');

const browserify = require('browserify');
const babelify = require('babelify');
const exorcist = require('exorcist');
const mkdirp = require('mkdirp').mkdirp;

const baseDir = path.join(__dirname, '..');

(async () => {
  await mkdirp(path.join(baseDir, 'notpublic', 'css'));
  await mkdirp(path.join(baseDir, 'notpublic', 'js'));

  const dir = await fs.readdir('components', { withFileTypes: true });
  const components = dir
    .filter((component) => component.isDirectory())
    .map((component) => component.name);

  // browserify
  console.log('browserify:common');
  const publicSourceDir = path.join(baseDir, 'notpublic/source');
  const b = browserify(path.join(baseDir, 'notpublic/source/main.js'), {
    noParse: ['dnd-page-scroll', 'jquery', 'knockout'],
    debug: true,
    transform: [
      babelify.configure({
        presets: ['@babel/preset-env'],
      }),
    ],
  });
  b.require(path.join(publicSourceDir, 'components.js'), { expose: 'ungit-components' });
  b.require(path.join(publicSourceDir, 'main.js'), { expose: 'ungit-main' });
  b.require(path.join(publicSourceDir, 'navigation.js'), { expose: 'ungit-navigation' });
  b.require(path.join(publicSourceDir, 'program-events.js'), { expose: 'ungit-program-events' });
  b.require(path.join(publicSourceDir, 'storage.js'), { expose: 'ungit-storage' });
  b.require(path.join(baseDir, 'source/address-parser.js'), { expose: 'ungit-address-parser' });
  b.require('bluebird', { expose: 'bluebird' });
  b.require('blueimp-md5', { expose: 'blueimp-md5' });
  b.require('diff2html', { expose: 'diff2html' });
  b.require('jquery', { expose: 'jquery' });
  b.require('knockout', { expose: 'knockout' });
  b.require('lodash', { expose: 'lodash' });
  b.require(path.join(baseDir, 'node_modules/snapsvg/src/mina.js'), { expose: 'mina' });
  b.require('moment', { expose: 'moment' });
  b.require('@primer/octicons', { expose: 'octicons' });
  b.require('signals', { expose: 'signals' });
  b.require('winston', { expose: 'winston' });
  const ungitjsFile = path.join(baseDir, 'notpublic/js/ungit.js');
  const mapFile = path.join(baseDir, 'notpublic/js/ungit.js.map');
  await new Promise((resolve) => {
    const outFile = fsSync.createWriteStream(ungitjsFile);
    outFile.on('close', () => resolve());
    b.bundle().pipe(exorcist(mapFile)).pipe(outFile);
  });
  console.log(`browserify ${path.relative(baseDir, ungitjsFile)}`);

  console.log('browserify:components');
  for (const component of components) {
    console.log(`browserify:components:${component}`);
    const sourcePrefix = path.join(baseDir, `components/${component}/${component}`);
    const destination = path.join(baseDir, `components/${component}/${component}.bundle.js`);

    const jsSource = `${sourcePrefix}.js`;

    try {
      await fs.access(jsSource);
      await browserifyFile(jsSource, destination);
    } catch(e) {
      console.error(`Error processing ${jsSource}: ${e.message}`);
      console.warn(
        `${sourcePrefix} does not exist. If this component is obsolete, please remove that directory or perform a clean build.`
      );
    }
  }

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

  console.log('copy raven');
  await Promise.all(
    ['node_modules/raven-js/dist/raven.min.js', 'node_modules/raven-js/dist/raven.min.js.map'].map(
      async (file) => {
        await copyToFolder(file, 'public/js');
      }
    )
  );
})();

async function browserifyFile(source, destination) {
  const mapDestination = `${destination}.map`;
  await new Promise((resolve) => {
    const b = browserify(source, {
      bundleExternal: false,
      debug: true,
    }).transform(babelify, {
      presets: ['@babel/preset-env'],
    });
    
    const outFile = fsSync.createWriteStream(destination);
    outFile.on('close', () => resolve());
    b.bundle().pipe(exorcist(mapDestination)).pipe(outFile);
  });
  console.log(`browserify ${path.relative(baseDir, destination)}`);
}
async function copyToFolder(source, destination) {
  source = path.join(baseDir, source);
  destination = path.join(baseDir, destination, path.basename(source));
  await fs.copyFile(source, destination);
  console.log(`copy ${path.relative(baseDir, destination)}`);
}
