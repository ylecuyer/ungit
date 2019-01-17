const expect = require('expect.js');
const sysinfo = require('../source/sysinfo.js');

describe('sysinfo', () => {
  describe('getUngitLatestVersion', () => {
    it('returns the latest ungit version from npm registry', () => {
      sysinfo.getUngitLatestVersion().then((version) => {
        expect(version).to.be('1.4.36');
      })
    });
  });

  describe('getUserHash', () => {
    it('returns the user hash', () => {
      sysinfo.getUserHash().then((hash) => {
        expect(hash).to.be('df9710c69934be3982ac7d3b354f4b19');
      })
    });
  });

  describe('getGitVersionInfo', () => {
    it('returns the git version', () => {
      expect(sysinfo.getGitVersionInfo()).to.eql({
        requiredVersion: '>=1.8.x',
        version: '2.14.1',
        satisfied: true,
      });
    });
  });
})
