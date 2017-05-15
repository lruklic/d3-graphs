$(document).ready(function () {

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

    $(".binary-tree-order").on('click', function () {
        var action = $(this).find('i').attr('action');
        bTree.orderAnimate(action, "#binary-tree-order");
		
        var description = $("#binary-tree-msg");
		description.find(".header").html(descriptions.binaryTree[action].name.english).css('textTransform', 'capitalize');;               
		description.find("p").html(descriptions.binaryTree[action].description.english);
        description.removeClass("hidden");
    });
});