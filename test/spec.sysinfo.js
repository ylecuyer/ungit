const expect = require('expect.js');
const sysinfo = require('../source/sysinfo.js');

describe('sysinfo', () => {
  describe('getUngitLatestVersion', () => {
    it('returns the latest ungit version from npm registry', async () => {
      const version = await sysinfo.getUngitLatestVersion();
      expect(version).to.match(/\d+\.\d+\.\d+/);
    });
  });

  describe('getUserHash', () => {
    it('returns the user hash', async () => {
      const hash = await sysinfo.getUserHash(); 
      expect(hash).to.match(/[a-z0-9]{32}/);
    });
  });

  describe('getGitVersionInfo', () => {
    it('returns the git version', () => {
      const gitInfo = sysinfo.getGitVersionInfo();

      expect(gitInfo.requiredVersion).to.eql('>=1.8.x');
      expect(gitInfo.version).to.match(/\d+\.\d+\.\d+/);
      expect(gitInfo.satisfied).to.be(true);
    });
  });
})
