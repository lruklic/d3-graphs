$(document).ready(function () {
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
    })
});