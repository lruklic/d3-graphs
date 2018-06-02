const SORT_ANIMATION = {
    "basic" : 1000,
    "swapDuration" : 1000,
    "stepDuration" : 500,
}

const STARTING_POSITIONS = {
    "sortingMinimumX" : -30,
    "sortingMinimumY" : 320
}

function Sort(width, height, dataset) {
    this.width = width;
    this.height = height;

    this.time = 0;

    var indexedArray = [];
    for (var i = 0; i < dataset.length; i++) {
        indexedArray.push({"index" : i, "value" : dataset[i]});
    }

    this.dataset = indexedArray;

    this.x = d3.scaleBand()
        .range([0, this.width])
        .padding(0.1)
        .domain(dataset.map(function(d, i) {
            return i;
        }));
    
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
        .attr("y", function(d) { return y(d.value) - 50; })
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", "cornflowerblue");

    this.svg.append("text")
        .attr("id", "sorting-minimum")
        .attr("x", STARTING_POSITIONS.sortingMinimumX)
        .attr("y", STARTING_POSITIONS.sortingMinimumY)
        .text("MIN");
}

Sort.prototype.bubbleSort = function (a) {

    var sortSteps = [];

    var swapped;
    do {
        swapped = false;
        for (var i = 0; i < a.length-1; i++) {
            var compareResult = (a[i].value > a[i+1].value);

            sortSteps.push({"action" : "compare", "index1" : i, "index2" : (i+1), "swap" : compareResult});
            //console.log("compare: " + a[i].value + " " + a[i+1].value);
            if (compareResult) {
                sortSteps.push({"action" : "swap", "index1" : i, "index2" : (i+1)});
                //console.log("swap:" + a[i].index + " " + a[i].value + " with " +  a[i+1].index + " " + a[i+1].value);
                var temp = a[i];
                a[i] = a[i+1];
                a[i+1] = temp;
                swapped = true;
            }
        }

    } while (swapped);

    return sortSteps;
}

Sort.prototype.selectionSort = function(a) {

    var sortSteps = [];

    for (var i = 0; i < a.length-1; i++) {
        sortSteps.push({"action" : "select", "index" : i});

        var min = i;
        sortSteps.push({"action" : "set minimum", "index" : i, "value" : a[i]});

        for (var j = i+1; j < a.length; j++) {
            var compareResult = (a[j].value < a[min].value);   
            sortSteps.push({"action" : "compare", "index1" : j, "index2" : min, "swap" : compareResult});
            
            if (compareResult) {
                min = j;
                sortSteps.push({"action" : "set minimum", "index" : min, "value" : a[i]});        
            }
        }

        sortSteps.push({"action" : "swap", "index1" : min, "index2" : i});
        var temp = a[min];
        a[min] = a[i];
        a[i] = temp;

    }

    return sortSteps;
}

Sort.prototype.compareBars = function (index1, index2, step, swap) {

    var INTERNAL_DELAY = 0.3;

    var selection = d3.selectAll(this.barSelector(index1) + ", " + this.barSelector(index2));

    selection.transition(step).delay(step * SORT_ANIMATION.swapDuration).duration(1)
        .attr("stroke", "black").attr("stroke-width", 2);

    selection.transition(step).delay(step * SORT_ANIMATION.swapDuration + INTERNAL_DELAY * SORT_ANIMATION.swapDuration).duration(0.3 * SORT_ANIMATION.swapDuration)
        .attr("fill", (swap ? "red" : "green"));

    selection.transition(step).delay(step * SORT_ANIMATION.swapDuration + 2*INTERNAL_DELAY * SORT_ANIMATION.swapDuration).duration(0.3 * SORT_ANIMATION.swapDuration)
        .attr("fill", "cornflowerblue");

    selection.transition(step).delay(step * SORT_ANIMATION.swapDuration + 3*INTERNAL_DELAY * SORT_ANIMATION.swapDuration).duration(0.1 * SORT_ANIMATION.swapDuration)
        .attr("stroke", "none");
/*    d3.select(this.barSelector(index1))
        .transition().delay(step * SORT_ANIMATION.swapDuration).duration(1)
        .attr("stroke", black).attr("stroke-width", 2);*/
}

Sort.prototype.selectElement = function(index, step) {
    var INTERNAL_DELAY = 0.4;

    var all = d3.selectAll("rect").transition().delay(step * SORT_ANIMATION.swapDuration).duration(1).attr("stroke", "none");
    var selection = d3.selectAll(this.barSelector(index));
    //var text = d3.select("#sorting-minimum");

    for (var i = 0; i < index; i++) {
        var sortedSelection = d3.selectAll(this.barSelector(i));
        sortedSelection.transition().delay(step * SORT_ANIMATION.swapDuration + SORT_ANIMATION.swapDuration).duration(INTERNAL_DELAY * SORT_ANIMATION.swapDuration)
            .attr("fill", "cadetblue");
    }

    selection.transition().delay(step * SORT_ANIMATION.swapDuration + 2*INTERNAL_DELAY * SORT_ANIMATION.swapDuration).duration(1)
        .attr("stroke", "blue");

}

Sort.prototype.setMinimum = function (index, step) {

    var INTERNAL_DELAY = 0.25;

    var selection = d3.selectAll(this.barSelector(index));
    var textSvg = d3.select("#sorting-minimum");

    textSvg
        .transition().delay(step * SORT_ANIMATION.swapDuration).duration(INTERNAL_DELAY*SORT_ANIMATION.swapDuration)
        .attr("x", (this.x.bandwidth()*index) + (sort.x.paddingInner()*sort.x.step() * index)  + this.x.bandwidth()/2 - 5)
        .attr("y", STARTING_POSITIONS.sortingMinimumY)

    selection.transition().delay(step * SORT_ANIMATION.swapDuration).duration(1)
        .attr("stroke", "green").attr("stroke-width", 2);

}

Sort.prototype.swapBars = function (index1, index2, step) {
    var x = this.x;

    var bar1 = d3.select(this.barSelector(index1));
    var bar2 = d3.select(this.barSelector(index2));

    bar1
        .attr("start-index", index2)
        .transition(step).delay(step * SORT_ANIMATION.swapDuration).duration(SORT_ANIMATION.swapDuration)
        .attr("x", x(index2));
    
    bar2
        .attr("start-index", index1)
        .transition(step).delay(step * SORT_ANIMATION.swapDuration).duration(SORT_ANIMATION.swapDuration)
        .attr("x", x(index1));     
}

Sort.prototype.barSelector = function (number) {
    return 'rect[start-index="' + number + '"]';
}

Sort.prototype.sortAnimate = function (sortSteps) {

    var self = this;

    this.timer = setInterval(function() {
        console.log(self.time);
        self.time += 100;
    }, 100);

    console.log(sortSteps);
    for (var i = 0; i < sortSteps.length; i++) {
        var step = sortSteps[i];
        if (step.action == "compare") {
            this.compareBars(step.index1, step.index2, i, step.swap);
        } else if (step.action == "swap") {
            this.swapBars(step.index1, step.index2, i);
        } else if (step.action == "set minimum") {
            this.setMinimum(step.index, i);
        } else if (step.action == "select") {
            this.selectElement(step.index, i);
        }
    }
}

Sort.prototype.cancelAll = function () {
    console.log(this.time);
    //for (var i = 10; i < 59; i++)
    //d3.selectAll("rect").interrupt(i);
}

