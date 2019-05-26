const interfaces = require('os').networkInterfaces();
const production = true;
let address = '';

//获取本机ip
for (let devName in interfaces) {
  interfaces[devName].forEach(item => {
    if (item.family === 'IPv4' && item.address !== '127.0.0.1') {
      address = item.address;
    }
  })
}
const url = production ? '132.232.114.236:1999' : `${address}:1999`;

module.exports = {
  baseUrl: './',
  devServer: {
    proxy: `http://${url}`
  }
};