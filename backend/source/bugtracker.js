'use strict';

const logger = require('./utils/logger');
const sysinfo = require('./sysinfo');
const config = require('./config');

class BugTracker {
  constructor(subsystem) {
    if (!config.bugtracking) return;

    this.subsystem = subsystem;
    this.appVersion = 'unknown';
    this.userHash = sysinfo.getUserHash();
    this.appVersion = config.ungitDevVersion;
    logger.info(`BugTracker set version: ${this.appVersion}`);
  }
  notify(exception) {
    if (!config.bugtracking) return;

    const options = {
      user: { id: this.userHash },
      tags: {
        version: this.appVersion,
        subsystem: this.subsystem,
        deployment: config.desktopMode ? 'desktop' : 'web',
      },
    };
  }
}
module.exports = BugTracker;
