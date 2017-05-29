$(document).ready(function () {

	var dataset = tree().add(5).add(2).add(-4).add(3).add(12).add(9).add(21); //.add(19).add(25)
	bTree = new BinaryTree(500, 700, dataset);
	bTree.plotTree(); //.orderArray();

    var dataset2 = [20, 43, 3, 16, 15];
    sort = new Sort(800, 400, dataset2);
    sort.plot();

    $(".dropdown").dropdown({action: 'combo'});

    $('.message .close').on('click', function() {
        $(this).closest('.message').transition('fade');
    });

    $(".link").on('click', function () {
        var action = $(this).attr("action");

        switch(action) {
            case "add":
                bTree.add(Number($("#add-value").val()));
                break;
            case "remove":
                bTree.remove(Number($("#remove-value").val()));
                break;
            default:
                break;
        }
    });

    $(".item").on('click', function () {
        var id = $(this).attr('id');
        
        $(".item").removeClass("active");
        $(this).addClass("active");

        $(".container").addClass("hidden");
        $("." + id).removeClass("hidden");
    });

    $(".binary-tree-order").on('click', function () {
        var action = $(this).find('i').attr('action');
        bTree.orderAnimate(action, "#binary-tree-order");
		
        var description = $("#binary-tree-msg");
		description.find(".header").html(descriptions.binaryTree[action].name.english).css('textTransform', 'capitalize');;               
		description.find("p").html(descriptions.binaryTree[action].description.english);
        description.removeClass("hidden");
    });
});