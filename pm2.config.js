module.exports = {
  name: 'online-classroom-pens-v1',
  interpreter: '~/.bun/bin/bun',
  watch: true,
  script: './dist/src/main.js',
  ignore_watch: ['node_modules', 'dist', 'logs', 'public'],
};
