const production = false;
const url = production ? '132.232.124.236:2000' : '10.100.115.100:1999';

module.exports = {
  baseUrl: './',
  devServer: {
    proxy: `http://${url}`
  }
};