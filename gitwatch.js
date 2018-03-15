var filewatcher = require('filewatcher');

var watcher = filewatcher();
var child;

watcher.add(__dirname + "/.git/objects");

watcher.on('change', function(file, stat) {

	child = exec("node makedag.js")
  console.log('File modified: %s', file);
  if (!stat) console.log('deleted');
});("node makedag.js")