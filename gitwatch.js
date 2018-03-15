var filewatcher = require('filewatcher');

var watcher = filewatcher();
watcher.add(__dirname + "/.git/objects");

watcher.on('change', function(file, stat) {
  console.log('File modified: %s', file);
  if (!stat) console.log('deleted');
});