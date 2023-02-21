const Hyperswarm = require('hyperswarm')

module.exports = function swarm (store) {
  return new Hyperswarm().on('connection', (socket) => store.replicate(socket))
}
