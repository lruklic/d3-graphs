var dataset = {
	"value": 25,
	"children": [
	{ 	
		"value": 10,
	},
	{ 
		"value": 40,
		"children": [
		{ "value": 45 },
		{ "value": 35 }
		]
	}
	]
};

window.onload = function() {
	bTree = new BinaryTree(500, 500, dataset);
	bTree.update();
};

function BinaryTree(width, height, dataset) {

	this.width = width;
	this.height = height;
	this.dataset = dataset;

	this.svg = d3.select("#binary-tree")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	this.treemap = d3.tree().size([width, height]);

	var i = 0,
    	duration = 750,
    	root;

}

BinaryTree.prototype.update = function(newElement) {

	var i = 0;

	// Compute the new tree layout.
	var root = d3.hierarchy(this.dataset, function(d) { return d.children; });
	root.x0 = this.height / 2;
	root.y0 = 0;

	var nodes = this.treemap(root).descendants(),
		links = this.treemap(root).descendants().slice(1);

	if (newElement) {

		function recursiveTreeSearch(root, value) {
			if (root.data.value == value || !root.children) {
				d3.select(".insert-pointer")
					.transition().delay(root.depth * 700).duration(500)
					.attr("transform", "translate(" + root.x + "," + root.depth * 180 +")");
				return 0;
			}

			d3.select(".insert-pointer")
				.transition().delay(root.depth * 700).duration(500)
				.attr("transform", "translate(" + root.x + "," + root.depth * 180 +")");

			if (root.data.value > value) {
				return recursiveTreeSearch(root.children[0], value);
			} else {
				return recursiveTreeSearch(root.children[1], value);
			}
		}

		var updateElem = this.svg.append("circle")
			.attr("class", "insert-pointer")
			.attr("r", 12)
			.attr("fill", "red")
			.attr("transform", "translate(" + root.x + "," + root.y +")");
		
		recursiveTreeSearch(root, newElement);
	}

	// Normalize for fixed-depth.
	nodes.forEach(function(d){ d.y = d.depth * 180});

	// Update the nodes...
	var node = this.svg.selectAll('g.node')
		.data(nodes, function(d) {return d.id || (d.id = ++i); });

	// Enter any new modes at the parent's previous position.
	var nodeEnter = node.enter().append('g')
		.attr('class', 'node')
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	nodeEnter.append("circle")
		.attr("r", 10)
		.style("fill", "#fff");

	  // Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.duration(750)
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	// Add Circle for the nodes
	nodeEnter.append('circle')
		.attr('class', 'node')
		.attr('r', 1e-6)
		.style("fill", function(d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

	// Declare the links…
	var link = this.svg.selectAll("path.link")
		.data(links, function(d) { return d.id; });

	// Enter the links.
	link.enter().insert("path", "g")
		.attr("class", "link")
		.attr("d", function(d) {
			return "M" + d.x + "," + d.y
				+ "L" + d.parent.x + "," + d.parent.y;
      	});

	link.transition()
		.duration(750)
		.attr("d", function(d) {
			return "M" + d.x + "," + d.y
				+ "L" + d.parent.x + "," + d.parent.y;
		});
}