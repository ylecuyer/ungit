const fsSync = require('fs');
const fs = fsSync.promises;
const path = require('path');
const express = require('express');
const logger = require('./utils/logger');
const config = require('./config');

const assureArray = (obj) => {
  return Array.isArray(obj) ? obj : [obj];
};

class UngitPlugin {
  constructor(args) {
    this.dir = args.dir;
    this.path = args.path;
    this.httpBasePath = args.httpBasePath;
    this.manifest = JSON.parse(
      fsSync.readFileSync(path.join(this.path, 'ungit-plugin.json'), { encoding: 'utf8' })
    );
    this.name = this.manifest.name || this.dir;
    this.config = config.pluginConfigs[this.name] || {};
  }

  init(env) {
    if (this.manifest.server) {
      const serverScript = require(path.join(this.path, this.manifest.server));
      serverScript.install({
        app: env.app,
        httpServer: env.httpServer,
        ensureAuthenticated: env.ensureAuthenticated,
        ensurePathExists: env.ensurePathExists,
        git: require('./git-promise'),
        config: env.config,
        socketIO: env.socketIO,
        socketsById: env.socketsById,
        pluginConfig: this.config,
        httpPath: `${env.pathPrefix}/plugins/${this.name}`,
        pluginApiVersion: require('../package.json').ungitPluginApiVersion,
      });
    }
    env.app.use(`/plugins/${this.name}`, express.static(this.path));
  }
}
module.exports = UngitPlugin;
