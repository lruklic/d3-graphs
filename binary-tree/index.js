$(document).ready(function () {
    $(".link").on('click', function () {
        var action = $(this).attr("action");

        console.log(action);

        switch(action) {
            case "add":
                bTree.add(Number($("#add-value").val()));
                break;
            default:
                break;
        }
    })
});