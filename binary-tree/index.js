$(document).ready(function () {

    $(".dropdown").dropdown({action: 'combo'});

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
    });
});