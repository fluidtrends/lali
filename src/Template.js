'use strict'

let coreUtils = require('coreutils')
let path = require('path')
let fs = require('fs-extra')

class Template {

    static get GITHUB_SOURCE_TYPE() {
        return "github"
    }

    static get DefaultName() {
        return
    }

    static get DefaultVersion() {
        return "0.1.0"
    }

    static get DefaultSourceType() {
        return Template.GITHUB_SOURCE_TYPE
    }

    constructor(name) {
        // Let's look for the source type first
        var data, src;
        var parts = (name ? name.split(":") : [])

        if (parts.length === 1) {
          data = parts[0]
        } else if (parts.length === 2) {
          src = parts[0]
          data = parts[1]
        }

        // Let's keep track of the source type
        this._sourceType = src

        if (data) {
          // Next, let's parse the name and version
          var dataParts = data.split("@")

          if (dataParts.length >= 1) {
            this._name = dataParts[0]
          }

          if (dataParts.length === 2) {
            this._version = dataParts[1]
          }
        }
    }

    get name() {
        return this._name || Template.DefaultName
    }
    
    get version() {
        return this._version || Template.DefaultVersion
    }

    get sourceType() {
        return this._sourceType || Template.DefaultSourceType
    }

    get source() {
        if (!this.name) {
            return
        }

        // We only support GitHub at the moment
        if (this.sourceType === Template.GITHUB_SOURCE_TYPE) {
            return `http://github.com/${this.name}/archive/${this.version}.tar.gz`
        }
    }

    sourceExists() {
      // Look up the theme remotely
      return coreUtils.remote.checkIfUrlExists(this.source)
    }

    download(dir, options) {
      // Fetch the remote archive and unarchive it locally
      return coreUtils.remote.downloadFromUrl(this.source, dir, options)
    }

    configure(dir) {
    }
}

module.exports = Template
