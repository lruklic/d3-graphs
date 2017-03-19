/**
 * Array that represents binary tree.
 * 
 * For this type of tree:
 * 
 *          25
 *         /  \
 *        10  40
 *           /  \
 *          35  45
 * 
 * array would be [25, [10], [40, [35], [45]]]. Every tree (and subsequently every subtree) is represented 
 * with an array.
 * 
 * Duplicate elements are not supported.
 * 
 */
function TreeJson(array) {
    this.array = array;
}
 
function tree() {
    return new TreeJson();
}

/**
 * Add new numeric value to binary tree. Can be used fluently.
 */
TreeJson.prototype.add = function(value) {
    if (!this.array) this.array = [];
        
    if (this.array.length == 0) {
        this.array[0] = value;
    } else {
        addRecursive(this.array, value);
    }

    return this;

    function addRecursive(root, value) {
        if (root[0] == value) {
            return 0;
        } else if (root[0] > value) {
            if (!root[1]) {
                root[1] = [value];
                return true;
            } else {
                return addRecursive(root[1], value);
            }
        } else {
             if (!root[2]) {
                 root[2] = [value];
                 return true;
             } else {
                 return addRecursive(root[2], value);
             }
        }
    }
}

TreeJson.prototype.remove = function(value) {
    if (!this.array) this.array = [];
        
    if (this.array.length == 0) {
        return 0;
    } else {
        removeRecursive(this.array, value);
    }

    function minValueNode(root) {
        while (root[1]) root = root[1];
        return root;
    }

    function removeRecursive(root, value) {
        if (!root) return root;

        if (value < root[0]) {
            root[1] = removeRecursive(root[1], value);
        } else if (value > root[0]) {
            root[2] = removeRecursive(root[2], value)
        } else {
            if (!root[1]) {
                var temp = root[2];
                root = null;
                return temp;
            } else if (!root[2]) {
                var temp = root[1];
                root = null;
                return temp;
            }

            var temp = minValueNode(root[2]);
            root[0] = temp[0];
            root[2] = removeRecursive(root[2], temp[0]);

        }

        return root;
    }
}

/**
 * Converts TreeJson object to D3-compliant tree object with "value" and "children" parameters.
 */
TreeJson.prototype.toD3Format = function() {
    
    return toD3FormatRecursive(this.array);

    function toD3FormatRecursive(array) {
        if (!array) {
            return {"value" : undefined};
        } else if (!array[1] && !array[2]) {
            return {"value" : array[0]};
        } else {
            return {"value" : array[0], "children" : [toD3FormatRecursive(array[1]), toD3FormatRecursive(array[2])]};
        }
    }
}

