const latestVersion = require('latest-version');
const util = require('util');
const getMac = util.promisify(require('getmac').getMac);
const crypto = require('crypto');
const semver = require('semver');
const config = require('./config');
const winston = require('winston');

exports.getUngitLatestVersion = () => latestVersion('ungit');

function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

exports.getUserHash = async () => {
  const mac = await getMac()
  try {
    return md5(mac);
  } catch (e) {
    return md5('abcde');
  }
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
