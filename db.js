var mysql = require('mysql')
var tunnel = require('tunnel-ssh')
var async = require('async')
var config = require('./config')

exports.MODE_TEST = 'mode-test'
exports.MODE_PRODUCTION = 'mode-production'

var state = {
  pool: null,
  mode: null
}

exports.connect = function(mode, useSsh, done) {
  if (mode === exports.MODE_TEST) {
    state.pool = mysql.createPool(config.settings.sqlTest)
  } else {
    if (useSsh) {
      tunnel(config.settings.ssh, function(err, server) {
        if (err)
          return done (err)
      })

      state.pool = mysql.createPool(config.settings.sqlTunnel)
    } else {
      state.pool = mysql.createPool(config.settings.sqlDirect)
    }
  }

  done(null)
}

exports.get = function(done) {
  var pool = state.pool
  if (!pool)
    return done(new Error('Missing database connection'))
  return pool
}
