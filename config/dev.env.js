'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"/api/system"',
  BASE_WEBSOCKET: '"ws://localhost:8080/api/websocket/"'
})
