window.onload = function () {
	var dataset = tree().add(25).add(10).add(5).add(40).add(45).add(35);
	bTree = new BinaryTree(500, 700, dataset);
	bTree.plotTree();
};

const BTREE_ANIMATION = {
	"appearDuration": 200,
	"defaultWait": 500,
	"pointerMoveDuration": 500,
	"pointerMoveDelay": 1200,
	"treeUpdateDuration": 750
}

const DISTANCE = {
	"depthWidth": 180
}

function BinaryTree(width, height, dataset) {
	this.width = width;
	this.height = height;
	this.dataset = dataset;
}

BinaryTree.prototype.plotTree = function () {

	this.svg = d3.select("#binary-tree")
		.append("svg")
		.attr("width", this.width)
		.attr("height", this.height)
		.style("padding-top", "20px");

	this.treemap = d3.tree().size([this.width, this.height]);

	// Compute the new tree layout.
	var root = d3.hierarchy(this.dataset.toD3Format(), function (d) { return d.children; });
	root.x0 = this.height / 2;
	root.y0 = 0;

	// Define nodes and links, filter out undefined (undefined node will have NaN as value, and NaN is not equal to itself)
	var nodes = this.treemap(root).descendants().filter(function (node) { return node.value == node.value }),
		links = this.treemap(root).descendants().slice(1).filter(function (node) { return node.value == node.value });

	// Normalize for fixed-depth.
	nodes.forEach(function (d) { d.y = d.depth * DISTANCE.depthWidth; });

	// Draw nodes
	var nodes = this.svg.selectAll('g.node')
		.data(nodes).enter()
		.append('g')
		.attr('class', 'node')
		.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
		
	nodes.append("circle")
		.transition().delay(BTREE_ANIMATION.appearDuration)
		.attr("r", 20)
		.style("fill", "#fff");

	nodes.append('text')
		.attr('class', 'node-value')
		.attr('dy', '.3em')
		.attr('text-anchor', 'middle')
		//.attr('x', function(d) {return d.x})
		//.attr('y', function(d) {return d.y})
		.transition().delay(BTREE_ANIMATION.appearDuration)		
		.text(function (d) { return d.value;})

	// Draw links
	this.svg.selectAll("path.link")
		.data(links).enter()
		.insert("path", "g")
		.attr("class", "link")
		.transition().delay(BTREE_ANIMATION.appearDuration)
		.attr("d", function (d) {
			return "M" + d.x + "," + d.y + "L" + d.parent.x + "," + d.parent.y;
		});
}

BinaryTree.prototype.search = function(newElement, moveArray) {

	// Compute the new tree layout.
	var root = this.treemap(d3.hierarchy(this.dataset.toD3Format(), function (d) { return d.children; }));

	function recursiveTreeSearch(root, value) {
		// If moveArray is passed as argument, remember the travel path
		if (moveArray) moveArray.push(root.x);	 

		if (root.data.value == value) {
			return 1;
		} else if (!root.children) {
			return 0;
		}
		if (root.data.value > value) {
			if (root.children[0] && root.children[0].value == root.children[0].value) {
				return recursiveTreeSearch(root.children[0], value);
			} else {
				return 0;
			}
		} else {
			if (root.children[1] && root.children[1].value == root.children[1].value) {
				return recursiveTreeSearch(root.children[1], value);
			} else {
				return 0;
			}
		}
	}

	return recursiveTreeSearch(root, newElement);
}

BinaryTree.prototype.remove = function(removeValue) {

	var root = this.treemap(d3.hierarchy(this.dataset.toD3Format(), function (d) { return d.children; }));

	var pointerMoveTotal = 0;
	var moveArray = [];

	var removeElement = this.svg.append("circle")
		.attr("class", "remove-pointer")
		.attr("r", 17)
		.attr("fill-opacity", 0)
		.attr("stroke", "red")
		.attr("stroke-width", "3px")
		.attr("transform", "translate(" + root.x + "," + root.y + ")");
	
	this.search(removeValue, moveArray);

	for (i = 0; i < moveArray.length; i++) {
		d3.select(".remove-pointer")
			.transition().delay(i * BTREE_ANIMATION.pointerMoveDelay).duration(BTREE_ANIMATION.pointerMoveDuration)
			.attr("transform", "translate(" + moveArray[i] + "," + i * 180 + ")");
	}
	pointerMoveTotal += moveArray.length * BTREE_ANIMATION.pointerMoveDelay;

	this.dataset.remove(removeValue);

	// Compute the new tree layout.
	var root = d3.hierarchy(this.dataset.toD3Format(), function (d) { return d.children; });
	root.x0 = this.height / 2;
	root.y0 = 0;

	// Define nodes and links, filter out undefined
	var nodes = this.treemap(root).descendants().filter(function (node) { return node.value == node.value }),
		links = this.treemap(root).descendants().slice(1).filter(function (node) { return node.value == node.value });

	// Normalize for fixed-depth.
	nodes.forEach(function (d) { d.y = d.depth * DISTANCE.depthWidth; });
	// Update the nodes...
	var node = this.svg.selectAll('g.node')
		.data(nodes, function (d) {
			return d.value;
		});

	// Remove node with removed value.
	var nodeExit = node.exit()
		.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.style("r", 0)
      	.remove();

	// Transition nodes to their new position.
	node.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.duration(BTREE_ANIMATION.treeUpdateDuration)
		.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

	// Declare the links…
	var link = this.svg.selectAll("path.link")
		.data(links, function (d) {
			return d.value;
		});

	// Enter the links.
	link.exit()
		.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.style("opacity", 0)
		.remove();

	link.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.duration(BTREE_ANIMATION.treeUpdateDuration)
		.attr("d", function (d) {
			return "M" + d.x + "," + d.y
				+ "L" + d.parent.x + "," + d.parent.y;
		});

	removeElement.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.style("opacity", 0)
		.remove();

}

BinaryTree.prototype.add = function (newElement) {

	var root = this.treemap(d3.hierarchy(this.dataset.toD3Format(), function (d) { return d.children; }));

	var pointerMoveTotal = 0;
	var moveArray = [];

	var updateElement = this.svg.append("circle")
		.attr("class", "insert-pointer")
		.attr("r", 17)
		.attr("fill-opacity", 0)
		.attr("stroke", "red")
		.attr("stroke-width", "3px")
		.attr("transform", "translate(" + root.x + "," + root.y + ")");

	this.search(newElement, moveArray);

	for (i = 0; i < moveArray.length; i++) {
		d3.select(".insert-pointer")
			.transition().delay(i * BTREE_ANIMATION.pointerMoveDelay).duration(BTREE_ANIMATION.pointerMoveDuration)
			.attr("transform", "translate(" + moveArray[i] + "," + i * 180 + ")");
	}
	pointerMoveTotal += moveArray.length * BTREE_ANIMATION.pointerMoveDelay;
	
	this.dataset.add(newElement);

	// Compute the new tree layout.
	var root = d3.hierarchy(this.dataset.toD3Format(), function (d) { return d.children; });
	root.x0 = this.height / 2;
	root.y0 = 0;

	// Define nodes and links, filter out undefined
	var nodes = this.treemap(root).descendants().filter(function (node) { return node.value == node.value }),
		links = this.treemap(root).descendants().slice(1).filter(function (node) { return node.value == node.value });

	var nodeIndex = 0;
	var newNode = nodes.filter(function (node, j) {
		if (node.value == newElement) {
			nodeIndex = j;
			return true;
		} else {
			return false;
		}
	})[0];

	var linkIndex = 0;
	var newLink = links.filter(function (link, j) {
		if (link.value == newElement) {
			linkIndex = j;
			return true;
		} else {
			return false;
		}
	})[0];

	nodes.push(nodes.splice(nodeIndex, 1)[0]);
	links.push(links.splice(linkIndex, 1)[0]);

	// Normalize for fixed-depth.
	nodes.forEach(function (d) { d.y = d.depth * DISTANCE.depthWidth; });
	// Update the nodes...
	var node = this.svg.selectAll('g.node')
		.data(nodes, function (d) {
			return d.value;
		});

	// Enter any new modes at the parent's previous position.
	var nodeEnter = node.enter().append('g')
		.attr('class', 'node')
		.attr("transform", function (d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	nodeEnter.append("circle")
		.transition().delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait + BTREE_ANIMATION.treeUpdateDuration + BTREE_ANIMATION.pointerMoveDuration - 200)
		.attr("r", 20)
		.style("fill", "#fff");

	nodeEnter.append("text")
		.transition().delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait + BTREE_ANIMATION.treeUpdateDuration + BTREE_ANIMATION.pointerMoveDuration - 180)
		.attr('class', 'node-value')
		.attr('dy', '.3em')
		.attr('text-anchor', 'middle')	
		.text(function (d) { return d.value;})

	// Transition nodes to their new position.
	node.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.duration(BTREE_ANIMATION.treeUpdateDuration)
		.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

	// Add Circle for the nodes
	nodeEnter.append('circle')
		.attr('class', 'node')
		.attr('r', 1e-6)
		.style("fill", function (d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

	updateElement.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.duration(BTREE_ANIMATION.treeUpdateDuration)
		.attr("transform", "translate(" + newNode.parent.x + "," + newNode.parent.y + ")");
	updateElement.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait + BTREE_ANIMATION.treeUpdateDuration)
		.duration(BTREE_ANIMATION.pointerMoveDuration)
		.attr("transform", "translate(" + newNode.x + "," + newNode.y + ")")
		.style("opacity", 0)
		.remove();


	// Declare the links…
	var link = this.svg.selectAll("path.link")
		.data(links, function (d) {
			return d.value;
		});

	// Enter the links.
	link.enter()
		.insert("path", "g")
		.attr("class", "link")
		.transition().delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait + BTREE_ANIMATION.treeUpdateDuration + BTREE_ANIMATION.pointerMoveDuration)
		.attr("d", function (d) {
			return "M" + d.x + "," + d.y
				+ "L" + d.parent.x + "," + d.parent.y;
		});

	link.transition()
		.delay(pointerMoveTotal + BTREE_ANIMATION.defaultWait)
		.duration(BTREE_ANIMATION.treeUpdateDuration)
		.attr("d", function (d) {
			return "M" + d.x + "," + d.y
				+ "L" + d.parent.x + "," + d.parent.y;
		});
}