const got = require('got')
const tar = require('tar')
const zlib = require('zlib')
const bz2 = require('unbzip2-stream')

const link = function (name) {
  const url = _url(name)
  return {
    exists: () => _exists(url),
    download: (dest) => _download(url, dest),
    install: (dest) => _install(url, dest)
  }
}

function _url (name) {
  return name
}

function _install (url, dest) {
  return _download(url, dest)
}

function _download (url, dest) {
  return new Promise((resolve, reject) => {
    _exists(url)
    .then((response) => {
      got.stream(url)
          .pipe(url.endsWith('bz2') ? bz2() : zlib.createGunzip({ fromBase: false }))
          .pipe(tar.x({
            strip: 1,
            C: dest
          }))
          .on('end', () => {
            resolve()
          })
          .on('error', (error) => {
            reject(error)
          })
      })
    .catch(e => {
      reject(e)
    })
  })
}

function _exists (url) {
  if (!url) {
    return Promise.reject(new Error('Invalid url'))
  }

  return got.head(url)
}

module.exports = link
