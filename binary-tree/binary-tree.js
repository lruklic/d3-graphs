window.onload = function() {
	var dataset = tree().add(25).add(10).add(40).add(45).add(35);
	bTree = new BinaryTree(500, 700, dataset);
	bTree.update();
};

const BTREE_ANIMATION = {
	"defaultWait" : 500,
	"pointerMoveDuration" : 500,
	"pointerMoveDelay" : 700,
	"treeUpdateDuration" : 750
}

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

	// Compute the new tree layout.
	var root = d3.hierarchy(this.dataset.toD3Format(), function(d) {
		return d.children; 
	});
	root.x0 = this.height / 2;
	root.y0 = 0;

	// Define nodes and links, filter out undefined
	var nodes = this.treemap(root).descendants().filter(function(node) {return node.value == node.value}),
		links = this.treemap(root).descendants().slice(1).filter(function(node) {return node.value == node.value});
	
	var pointerMoveTotal = 0;

	if (newElement) {

		var updateElement = this.svg.append("circle")
			.attr("class", "insert-pointer")
			.attr("r", 12)
			.attr("fill", "red")

		function recursiveTreeSearch(root, value) {
			if (root.data.value == value || !root.children) {
				pointerMoveTotal += root.depth * BTREE_ANIMATION.pointerMoveDelay + root.depth * BTREE_ANIMATION.pointerMoveDuration;
				d3.select(".insert-pointer")
					.transition().delay(root.depth * BTREE_ANIMATION.pointerMoveDelay).duration(BTREE_ANIMATION.pointerMoveDuration)
					.attr("transform", "translate(" + root.x + "," + root.depth * 180 +")");
				return 0;
			}

			console.log(root.x + " " + root.y)
			d3.select(".insert-pointer")
				.transition().delay(root.depth * BTREE_ANIMATION.pointerMoveDelay).duration(BTREE_ANIMATION.pointerMoveDuration)
				.attr("transform", "translate(" + root.x + "," + root.depth * 180 +")");

			if (root.data.value > value) {
				if (root.children[0] && root.children[0].value == root.children[0].value) {
					return recursiveTreeSearch(root.children[0], value);
				} else {
					pointerMoveTotal += root.depth * BTREE_ANIMATION.pointerMoveDelay + root.depth * BTREE_ANIMATION.pointerMoveDuration;
					return 0;
				}
			} else {
				if (root.children[1] && root.children[0].value == root.children[0].value) {
					return recursiveTreeSearch(root.children[1], value);
				} else {
					pointerMoveTotal += root.depth * BTREE_ANIMATION.pointerMoveDelay + root.depth * BTREE_ANIMATION.pointerMoveDuration;
					return 0;
				}
			}
		}

		updateElement.attr("transform", "translate(" + root.x + "," + root.y +")");
		
		recursiveTreeSearch(root, newElement);
	}

	if (newElement) {
		this.dataset.add(newElement);

		//var i = 0;
		// Compute the new tree layout.
		var root = d3.hierarchy(this.dataset.toD3Format(), function(d) {
			//d.id = i++;
			return d.children; 
		});
		root.x0 = this.height / 2;
		root.y0 = 0;

		// Define nodes and links, filter out undefined
		var nodes = this.treemap(root).descendants().filter(function(node) {return node.value == node.value}),
			links = this.treemap(root).descendants().slice(1).filter(function(node) {return node.value == node.value});
		
		var nodeIndex = 0;
		var newNode = nodes.filter(function(node, j) {
			if (node.value == newElement) {
				nodeIndex = j;
				return true;
			} else {
				return false;
			}
			
		})[0];

		var linkIndex = 0;
		var newLink = links.filter(function(link, j) {
			if (link.value == newElement) {
				linkIndex = j;
				return true;
			} else {
				return false;
			}
		})[0];

		nodes.push(nodes.splice(nodeIndex, 1)[0]);
		links.push(links.splice(linkIndex, 1)[0]);
	}

	// Normalize for fixed-depth.
	nodes.forEach(function(d){ d.y = d.depth * 180; /*console.log(d.value)*/});

	//console.log(nodes);
	// Update the nodes...
	var node = this.svg.selectAll('g.node')
		.data(nodes, function(d) {
			return d.value;
		});

	//console.log(node._enter[0].length);

	// Enter any new modes at the parent's previous position.
	var nodeEnter = node.enter().append('g')
		.attr('class', 'node')
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	nodeEnter.append("circle")
		.transition().delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait + BTREE_ANIMATION.treeUpdateDuration + BTREE_ANIMATION.pointerMoveDuration - 200)
		.attr("r", 10)
		.style("fill", "#fff");

	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.duration(BTREE_ANIMATION.treeUpdateDuration)
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	// Add Circle for the nodes
	nodeEnter.append('circle')
		.attr('class', 'node')
		.attr('r', 1e-6)
		.style("fill", function(d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

	if (updateElement) {
		updateElement.transition()
			.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
			.duration(BTREE_ANIMATION.treeUpdateDuration)
			.attr("transform", "translate(" + newNode.parent.x + "," + newNode.parent.y +")");
		updateElement.transition()
			.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait + BTREE_ANIMATION.treeUpdateDuration)
			.duration(BTREE_ANIMATION.pointerMoveDuration)
			.attr("transform", "translate(" + newNode.x + "," + newNode.y +")")
			.style("opacity", 0)
			.remove();
	}

	// Declare the links…
	var link = this.svg.selectAll("path.link")
		.data(links, function(d) {
			return d.value;
		});

	// Enter the links.
	link.enter()
		.insert("path", "g")
		.attr("class", "link")
		.transition().delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait + BTREE_ANIMATION.treeUpdateDuration + BTREE_ANIMATION.pointerMoveDuration)
		.attr("d", function(d) {
			return "M" + d.x + "," + d.y
				+ "L" + d.parent.x + "," + d.parent.y;
      	});

	link.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.duration(BTREE_ANIMATION.treeUpdateDuration)
		.attr("d", function(d) {
			return "M" + d.x + "," + d.y
				+ "L" + d.parent.x + "," + d.parent.y;
		});
}