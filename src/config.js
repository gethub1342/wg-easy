'use strict';

const { release } = require('./package.json');

let WG_INTERFACE = process.env.WG_INTERFACE || 'wg0';
let INTERNET_INTERFACE = process.env.INTERNET_INTERFACE || 'eth0';

module.exports.RELEASE = release;
module.exports.PORT = process.env.PORT || 51821;
module.exports.PASSWORD = process.env.PASSWORD;
module.exports.WG_PATH = process.env.WG_PATH || '/etc/wireguard/';
module.exports.WG_HOST = process.env.WG_HOST;
module.exports.WG_PORT = process.env.WG_PORT || 51820;
module.exports.WG_INTERFACE = WG_INTERFACE;
module.exports.INTERNET_INTERFACE = INTERNET_INTERFACE;
module.exports.WG_MTU = process.env.WG_MTU || null;
module.exports.WG_PERSISTENT_KEEPALIVE = process.env.WG_PERSISTENT_KEEPALIVE || 0;
module.exports.WG_DEFAULT_ADDRESS = process.env.WG_DEFAULT_ADDRESS || '10.8.0.x';
module.exports.WG_DEFAULT_DNS = typeof process.env.WG_DEFAULT_DNS === 'string'
  ? process.env.WG_DEFAULT_DNS
  : '1.1.1.1';
module.exports.WG_ALLOWED_IPS = process.env.WG_ALLOWED_IPS || '0.0.0.0/0, ::/0';

module.exports.WG_PRE_UP = process.env.WG_PRE_UP || '';

/**
 * Default Post Up adds iptables rules for forwarding and masquerading
 * traffic from the WireGuard interface to the internet
 * Allow incoming traffic on the WireGuard port
 * Secures clients from each other by forbidding forwarding traffic from the WireGuard interface to itself
 */
module.exports.WG_POST_UP = process.env.WG_POST_UP || `
iptables -A FORWARD -i %i -o %i -j DROP;
iptables -A FORWARD -i %i -j ACCEPT;
iptables -A FORWARD -o %i -j ACCEPT;
iptables -A INPUT -p udp -m udp --dport ${WG_PORT} -j ACCEPT;

iptables -t nat -A POSTROUTING -s ${module.exports.WG_DEFAULT_ADDRESS.replace('x', '0')}/24 -o ${INTERNET_INTERFACE} -j MASQUERADE;
`.split('\n').join(' ');

module.exports.WG_PRE_DOWN = process.env.WG_PRE_DOWN || '';

// Default Post Down removes all iptables rules
module.exports.WG_POST_DOWN = process.env.WG_POST_DOWN || `
iptables -D FORWARD -i %i -o %i -j DROP;
iptables -D FORWARD -i %i -j ACCEPT;
iptables -D FORWARD -o %i -j ACCEPT;
iptables -D INPUT -p udp -m udp --dport ${WG_PORT} -j ACCEPT;

iptables -t nat -D POSTROUTING -s ${module.exports.WG_DEFAULT_ADDRESS.replace('x', '0')}/24 -o ${INTERNET_INTERFACE} -j MASQUERADE;
`.split('\n').join(' ');
