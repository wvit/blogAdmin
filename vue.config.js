const production = true;
const url = production ? 'www.ouchenfootball.cn' : '10.100.115.173:8080';

module.exports = {
  baseUrl: './',
  assetsDir: './static',
  devServer: {
    proxy: `https://${url}`
  }
};