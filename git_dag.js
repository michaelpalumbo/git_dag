// Node → [dependent nodes]
var dag = {
    'Node A': ['Node B'],
    'Node B': []
};



//in order to represent the above dag in d3.js' Force layout, Cipriani wrote this helper function
//to convert it to the expected input

var forceFormat = function(dag) {
    var orderedNodes = [],
        nodes = [],
        links = [],
        usesPack = false;

    // Basically a dumb Object.keys
    for (node in dag) {
        if ( !dag.hasOwnProperty( node ) ) continue;
        orderedNodes.push(node);
    }

    orderedNodes.forEach(function(node) {
        var sources = dag[node];

        if (!sources) return;

        sources.forEach(function(source) {
            var source = orderedNodes.indexOf(source);

            // If the source isn't in the Git DAG, it's in a packfile
            if (source < 0) {
                if (usesPack) return;
                source = orderedNodes.length;
                usesPack = true;
            }

            links.push({
                'source': source,
                'target': orderedNodes.indexOf(node)
            });
        });
        nodes.push({'name': node});
    });

    // Add pack file to end of list
    if (usesPack) nodes.push({'name': 'PACK'});

    return { 'nodes': nodes, 'links': links };
};

var forceInput = forceFormat(dag);

console.log(forceInput);