const SORT_ANIMATION = {
    "swapDuration" : 1000,
    "stepDuration" : 500,
}

function Sort(width, height, dataset) {
    this.width = width;
    this.height = height;

    var indexedArray = [];
    for (var i = 0; i < dataset.length; i++) {
        indexedArray.push({"index" : i, "value" : dataset[i]});
    }

    this.dataset = indexedArray;

    this.x = d3.scaleBand()
        .range([0, this.width])
        .padding(0.1)
        .domain([0,1,2,3,4]);
    
    this.y = d3.scaleLinear()
        .range([this.height, 0])
        .domain([0, 50]);
}

Sort.prototype.plot = function () {

    height = this.height;
    x = this.x;
    y = this.y;

    this.svg = d3.select("#sorting-frame")
		.append("svg")
		.attr("width", this.width)
		.attr("height", this.height);

    this.svg.selectAll(".bar")
        .data(this.dataset)
        .enter().append("rect")
        .attr("start-index", function(d) { return d.index})
        .attr("x", function (d, i) {return x(i)})
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", "cornflowerblue");
}

Sort.prototype.bubbleSort = function (a) {

    var swapped;
    do {
        swapped = false;
        for (var i = 0; i < a.length-1; i++) {
            console.log("compare: " + a[i].value + " " + a[i+1].value);
            if (a[i].value > a[i+1].value) {
                console.log("swap:" + a[i].index + " " + a[i].value + " with " +  a[i+1].index + " " + a[i+1].value);
                var temp = a[i].value;
                a[i].value = a[i+1].value;
                a[i+1].value = temp;
                swapped = true;
            }
        }

    } while (swapped);

}

Sort.prototype.compareBars = function (index1, index2, step) {

    var selection = d3.selectAll(this.barSelector(index1) + ", " + this.barSelector(index2));

    selection.transition().delay(step * SORT_ANIMATION.swapDuration).duration(1)
        .attr("stroke", "black").attr("stroke-width", 2);

    selection.transition().delay(step * SORT_ANIMATION.swapDuration + SORT_ANIMATION.swapDuration / 2).duration(500)
        .attr("stroke", "none");
/*    d3.select(this.barSelector(index1))
        .transition().delay(step * SORT_ANIMATION.swapDuration).duration(1)
        .attr("stroke", black).attr("stroke-width", 2);*/
}

Sort.prototype.swapBars = function (index1, index2, step) {
    var x = this.x;

    d3.select(this.barSelector(index1))
        .transition().delay(step * SORT_ANIMATION.swapDuration).duration(SORT_ANIMATION.swapDuration)
        .attr("start-index", index2)
        .attr("x", x(index2));
    
    d3.select(this.barSelector(index2))
        .transition().delay(step * SORT_ANIMATION.swapDuration).duration(SORT_ANIMATION.swapDuration)
        .attr("start-index", index1)
        .attr("x", x(index1));    
}

Sort.prototype.barSelector = function (number) {
    return 'rect[start-index="' + number + '"]';
}

Sort.prototype.proba = function () {
    this.compareBars(0, 1, 0);
    this.compareBars(1, 2, 1);
    this.swapBars()
}