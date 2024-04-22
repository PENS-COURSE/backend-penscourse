module.exports = {
  name: 'online-classroom-pens-v1',
  watch: true,
  script: './dist/src/main.js',
  ignore_watch: ['node_modules', 'dist', 'logs', 'public'],
  interpreter: 'bun',
  exec_mode: 'cluster',
  instances: 'max',
};
