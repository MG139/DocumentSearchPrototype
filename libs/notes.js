notesLoaded = false;

$(document).ready(function () {
    
    if(notesLoaded == true){
        return;
    }
    notesLoaded = true;

    $('.add-note').click(function (e) {       
        $(this).data("item");
        $(this).data("note");
        $('#product-note').val($(this).data("item"));      
        $('#addNoteTextArea').val($(this).data("note"));                

        FillInProductNote($(this).data("note"));
       
        var checked = Cookies.get('PU_HCWPNP') != null &&
            Cookies.get('PU_HCWPNP') == 'true';
        $('#hide-popup').prop('checked', checked);
        $('#add-note').modal();
        //e.preventDefault();
    });

    
    $('#shopping-header-mobile').on('click', '.add-note', function (e) {
        $('#product-note').val($(this).data("item"));
        $('#addNoteTextArea').val($(this).data("note"));
        $('#add-note').modal();
        e.preventDefault();
    });

    $('#save-note').click(function (e) {
        var productId = $('#product-note').val();
        var note = $("#addNoteTextArea").val();
        var hidePopup = $('#hide-popup').prop('checked');

        //NOTE: this fx had to be moved to trolley.js which loads before, same code could not be in both js biles
        PersistNote(productId, note, hidePopup);
        timeoutUpdateTrolley();
        //e.preventDefault();
    });

    $('#cancel-note').click(function (e) {
        $('#add-note').modal('hide');
        e.preventDefault();
    });

    $('#shopping-header-mobile').on('click', '#save-note', function (e) {
        var productId = $('#product-note').val();
        var note = $("#addNoteTextArea").val();

        $.ajax({
            type: "POST",
            url: "/api/sitecore/Trolley/AddNoteToLine",
            cache: false,
            data: { "productId": productId, "note": note }
        })
            .done(function (data) {
                $("[data-item=" + productId + "]").data("note", note);
                $(".add-note-" + productId + " .add-note-label").html("Edit Note");
            })
            .fail(function (xhr, textStatus, errorThrown) {
                console.log(xhr.responseText);
            });

        e.preventDefault();
    });

});
