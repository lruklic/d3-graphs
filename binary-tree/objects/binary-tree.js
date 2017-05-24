window.onload = function () {
	var dataset = tree().add(5).add(2).add(-4).add(3).add(12).add(9).add(21); //.add(19).add(25)
	bTree = new BinaryTree(500, 700, dataset);
	bTree.plotTree(); //.orderArray();
};

const BTREE_ANIMATION = {
	"startTime" : 1000,
	"endTime" : 1000,
	"appearDuration": 200,
	"defaultWait": 500,
	"pointerMoveDuration": 500,
	"pointerMoveDelay": 1200,
	"treeUpdateDuration": 750
}

const DISTANCE = {
	"depthWidth": 180,
	"nodeRadius" : 20,
	"orderTokenRadius" : 5,
	"orderTokenGap" : 2
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
		.attr("class", "padding-top-30");

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

	return this;
}

BinaryTree.prototype.preorder = function() {
	return this.order(0);
}

BinaryTree.prototype.inorder = function() {
	return this.order(1);
}

BinaryTree.prototype.postorder = function() {
	return this.order(2);
}

BinaryTree.prototype.orderArray = function() {
	var orderArray = [];
	this.order(0, orderArray);
	return orderArray;
}

BinaryTree.prototype.order = function(type, orderArray) {
	
	var root = this.treemap(d3.hierarchy(this.dataset.toD3Format(), function (d) { return d.children; }));

	function recursiveOrder(root) {
		// Preorder
		orderArray.push([root.x, root.depth, root.value, "preorder"]);
		if (type == 0) {	
			console.log(root.data.value);
		}

		if (root.children && root.children[0] && root.children[0].value == root.children[0].value) {
			recursiveOrder(root.children[0]);
		}

		// Inorder
		orderArray.push([root.x, root.depth, root.value, "inorder"]);
		if (type == 1) {	
			console.log(root.data.value);
		}

		if (root.children && root.children[1] && root.children[1].value == root.children[1].value) {
			recursiveOrder(root.children[1]);
		}

		// Postorder
		orderArray.push([root.x, root.depth, root.value, "postorder"]);
		if (type == 2) {	// Postorder
			console.log(root.data.value);
		}
	}

	return recursiveOrder(root);

}

BinaryTree.prototype.orderAnimate = function (type, textboxId) {

	function getShift(orderType) {	
		var shift = {"width" : 0, "height" : 0};

		if (orderType == "preorder") {
			shift.width = (-1) * (DISTANCE.nodeRadius + DISTANCE.orderTokenRadius + DISTANCE.orderTokenGap);
		} else if (orderType == "inorder") {
			shift.height = DISTANCE.nodeRadius + DISTANCE.orderTokenRadius + DISTANCE.orderTokenGap;
		} else if (orderType == "postorder") {
			shift.width = DISTANCE.nodeRadius + DISTANCE.orderTokenRadius + DISTANCE.orderTokenGap;
		}

		return shift;
	}

	var orderArray = this.orderArray();

	var selectedOrderArray = orderArray.filter(function (el) { return el[3] == type});

	var shift = getShift(type);

	this.svg.selectAll(".order-visit")
		.data(selectedOrderArray).enter()
		.append("circle")
		.attr("class", "order-visit")
		.attr("cx", function(d) { return d[0] + shift.width})
		.attr("cy", function(d) { return d[1] * DISTANCE.depthWidth + shift.height})
		.attr("r", DISTANCE.orderTokenRadius)
		.style("fill", "red");

	var pointer = this.svg.append("circle")
		.attr("class", "order-visit-pointer")
		.attr("cx", orderArray[0][0])
		.attr("cy", orderArray[0][1] * DISTANCE.depthWidth)
		.attr("r", DISTANCE.nodeRadius)
		.attr("fill-opacity", 0)
		.attr("stroke", "steelblue")
		.attr("stroke-width", "3px");

	pointer
		.transition().delay(BTREE_ANIMATION.startTime).duration(BTREE_ANIMATION.pointerMoveDuration)
		.attr("cx", orderArray[0][0] - DISTANCE.nodeRadius - DISTANCE.orderTokenRadius - DISTANCE.orderTokenGap)
		.attr("r", DISTANCE.orderTokenRadius)
		.attr("fill-opacity", 1)
		.attr("stroke-width", "0px")
		.style("fill", "steelblue");
	
	// Fill order text step-by-step
	if (textboxId) {
		d3.select(textboxId).text("");

		var currentOrderArray = [];
		for (var i = 0; i < orderArray.length; i++) {
			if (orderArray[i][3] == type) {
				currentOrderArray.push(orderArray[i]);
			}
		}

		var counter = 1;
		for (var i = 0; i < orderArray.length; i++) {
			var currentOrder = "";
			if (orderArray[i][3] == type) {
				for (j = 0; j < counter; j++) {
					currentOrder += currentOrderArray[j][2] + ", ";
				}
				counter++;
				d3.select("#binary-tree-order").transition()
					.delay(BTREE_ANIMATION.startTime + i * BTREE_ANIMATION.pointerMoveDelay + i * BTREE_ANIMATION.pointerMoveDuration)
					.text(type.toUpperCase() + ": " + currentOrder.substring(0, currentOrder.length - 2));
			}
		}
	}

	// Turn pointer green when item is found
	if (orderArray[0][3] == type) {
		pointer
			.transition().delay(BTREE_ANIMATION.startTime + BTREE_ANIMATION.pointerMoveDuration)
			.style("fill", "green");
	}

	for (i = 1; i < orderArray.length; i++) {

		var shift = getShift(orderArray[i][3]);
		
		var delay = BTREE_ANIMATION.startTime + i * BTREE_ANIMATION.pointerMoveDelay + (i - 1) * BTREE_ANIMATION.pointerMoveDuration;

		pointer.transition()
			.delay(delay)
			.duration(BTREE_ANIMATION.pointerMoveDuration)
			.attr("cx", orderArray[i][0] + shift.width)
			.attr("cy", orderArray[i][1] * DISTANCE.depthWidth + shift.height)
			.style("fill", "steelblue");

		if (orderArray[i][3] == type) {
			pointer.transition()
				.delay(BTREE_ANIMATION.startTime + i * BTREE_ANIMATION.pointerMoveDelay + i * BTREE_ANIMATION.pointerMoveDuration)
				.style("fill", "green");
		}

	}

	this.svg.selectAll(".order-visit, .order-visit-pointer")
		.transition()
		.delay(BTREE_ANIMATION.startTime + orderArray.length * BTREE_ANIMATION.pointerMoveDelay + (orderArray.length - 1) * BTREE_ANIMATION.pointerMoveDuration)
		.duration(BTREE_ANIMATION.endTime)
		.style("opacity", 0)
		.remove();
	
	return this;
}

/**
 * Find element in binary tree.
 */
BinaryTree.prototype.search = function(searchElement, moveArray) {

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

	return recursiveTreeSearch(root, searchElement);
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

	var found = this.search(newElement, moveArray);
	if (found) {
		return;
	}

	var updateElement = this.svg.append("circle")
		.attr("class", "insert-pointer")
		.attr("r", 17)
		.attr("fill-opacity", 0)
		.attr("stroke", "red")
		.attr("stroke-width", "3px")
		.attr("transform", "translate(" + root.x + "," + root.y + ")");

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