#!/usr/bin/env nodejs
/* makeDag - creates a JSON dependency graph from .git/objects */
console.log(__dirname + 'dependency_graph.json')
var glob = require('glob'),
    fs = require('fs'),
    zlib = require('zlib');

var types = ['tree', 'commit', 'blob'],
    treeRegex = {
        // 100644 README\0[20 byte sha1]
        regex: /[0-9]+\s[^\0]+\0((.|\n){20})/gm,
        fn: function(sha) {
            var buf = new Buffer(sha[1], 'binary');
            return buf.toString('hex') + '.b';
        }
    },
    commitRegex = {
        // tree 098e6de29daf4e55f83406b49f5768df9bc7d624
        regex: /(tree|parent)\s([a-f0-9]{40})/gm,
        fn: function(sha) {
            if (sha[1] === 'tree') {
                return sha[2] + '.t';
            }
            return sha[2] + '.c';
        }
    },
    total = 0,
    final = {};

// determine file type, parse out SHA1s
var handleObjects = function(objData, name) {
    types.forEach(function(type) {
        var re, regex, match, key;

        if (!objData.startsWith(type)) { return; }

        key = name + '.' + type[0];
        final[key] = [];
        if (type === 'tree') { objType = treeRegex; }
        if (type === 'commit') { objType = commitRegex; }
        if (type === 'blob') { return; }

        // Remove the object-type and size from file
        objData = objData.split('\0');
        objData.shift();
        objData = objData.join('\0');

        // Recursive regex match remainder
        while ((match = objType.regex.exec(objData)) !== null) {
            final[key].push(objType.fn(match));
        }
    });

    // Don't output until you've got it all
    if (Object.keys(final).length !== total) {
        return;
    }

    // Output what ya got.
   console.log(final);
    fs.writeFile(__dirname + 'dependency_graph.json', final, 'utf8', function (err) {
        
        if (err) {
            return console.log(err);
                }
        })
};

// Readable object names not file names
var getName = function(file) {
    var fileParts = file.split('/'),
        len = fileParts.length;
    return fileParts[len - 2] + fileParts[len - 1];
}

// Inflate the deflated git object file
var handleFile = function(file, out) {
    var name = getName(file);

    fs.readFile(file, function(e, data) {
        zlib.inflate(data, function(e, data) {
            if (e) { console.log(file, e); return; }
            handleObjects(data.toString('binary'), name);
        });
    });
};

// Sort through the gitobjects directory
var handleFiles = function(files) {
    files.forEach(function(file) {
        fs.stat(file, function(e, f) {
            if (e) { return; }
            if (f.isFile()) {
                // Don't worry about pack files for now
                if (file.indexOf('pack') > -1) { return; }
                total++;
                handleFile(file);
            }
        });

    });
};

(function() {
    glob('.git/objects/**/*', function(e, f) {
        if (e) { throw e; }
        handleFiles(f);
    });
})();