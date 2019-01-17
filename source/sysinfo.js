const latestVersion = require('latest-version');
const util = require('util');
const getMac = util.promisify(require('getmac').getMac);
const crypto = require('crypto');

const md5 = require('blueimp-md5');
const semver = require('semver');
const npm = require('npm');
const RegClient = require('npm-registry-client');
const config = require('./config');
const Bluebird = require('bluebird');
const winston = require('winston');

exports.getUngitLatestVersion = () => latestVersion('ungit');

exports.getUserHash = async () => {
  mac = await getMac()
  return crypto.createHash('md5').update(mac).digest('hex');
};

exports.getGitVersionInfo = () => {
  let gitInfo = {
    requiredVersion: '>=1.8.x',
    version: 'unkown',
    satisfied: false
  };

  gitInfo.version = config.gitVersion;
  gitInfo.satisfied = semver.satisfies(gitInfo.version, gitInfo.requiredVersion);

  if (!gitInfo.satisfied) {
    gitInfo.error = `Ungit requires git version ${gitInfo.requiredVersion}, you are currently running ${gitInfo.version}`;
  }

  return gitInfo;
}
