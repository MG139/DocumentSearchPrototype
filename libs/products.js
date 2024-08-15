$(document).ready(function () {

    //Triggered when sort by dropdown is selected
    $("#sortOrder, #sortOrderMobile, #sortOrderCb, #sortOrderMobileCb").on('change', function () {
        var url = new UrlHelper();
        url.addParameter('sortOrder', $(this).val());
        url.removeParameter('pageIndex');
        window.location.assign(url.getURL());
    });
    var sortOrderValue = new UrlHelper(window.location.href).queryString['sortOrder'];
    $("#sortOrder, #sortOrderMobile").val(sortOrderValue);
    $("#sortOrderCb, #sortOrderMobileCb").val(!sortOrderValue ? "Ascending" : sortOrderValue);

    //Triggered when the no of products dropdown is selected
    $('.numberOfProducts').on('change', function () {

        var url = new UrlHelper();
        url.removeParameter('page');
        url.addParameter('pageSize', $(this).val());

        var viewType = $('#viewType').val();
        url.removeParameter('viewType');
        if (viewType === "1") {
            url.addParameter('viewType', viewType);
        }

        window.location.assign(url.getURL());
    });

    //Triggered when group by shelf checkbox is selected
    $('#shelf.groupBy, #shelfMobile.groupBy').on('change', function () {

        var url = new UrlHelper();

        if ($(this).is(':checked')) {
            url.addParameter('view', 'GroupedByShelf');
            window.location.assign(url.getURL());
        }
        else {
            url.removeParameter('view');
            window.location.assign(url.getURL());
        }
    });

    function swtichGroupByView() {
        if ($('#shelf.groupBy').is(':checked')) {
            $(".SubCategoriesRow .rowMode .rowGrouped").removeClass("hidden");
            $(".SubCategoriesRow .rowMode .rowUnGrouped").addClass("hidden");
            $(".SubCategoriesRow .colMode .colGrouped").removeClass("hidden");
            $(".SubCategoriesRow .colMode .colUnGrouped").addClass("hidden");
        }
        else {
            $(".SubCategoriesRow .rowMode .rowUnGrouped").removeClass("hidden");
            $(".SubCategoriesRow .rowMode .rowGrouped").addClass("hidden");
            $(".SubCategoriesRow .colMode .colUnGrouped").removeClass("hidden");
            $(".SubCategoriesRow .colMode .colGrouped").addClass("hidden");
        }
    }

    //Sets the visible view on page load
    swtichGroupByView();

    //Alternative products section
    var viewUrl = '';
    $(".product").on("click", ".find-alternative", function (e) {
        viewUrl = "/products/alternative-products?categoryName=" + encodeURIComponent($(this).attr("categoryId")) + "&multi=False" + "&productId=" + encodeURIComponent($(this).attr("productId")) + "&returnUrl=" + encodeURIComponent(window.location.href);
        loadView(viewUrl);
        e.preventDefault();
    });

    $(".scanner-picker").on("click", ".find-alternative", function (e) {
        viewUrl = "/products/alternative-products?categoryName=" + encodeURIComponent($(this).attr("categoryId")) + "&multi=False" + "&productId=" + encodeURIComponent($(this).attr("productId")) + "&returnUrl=" + encodeURIComponent(window.location.href);
        loadView(viewUrl);
        e.preventDefault();
    });

    //when a pagination link is clicked
    $(document.body).on('click', '#alternative-products .page-item a.page-link', function (e) {

        if ($(this).attr('href') !== undefined) {

            var url = new UrlHelper(viewUrl);
            var page = parseInt(url.getParameter('pageIndexSec') === undefined ? 0 : url.getParameter('pageIndexSec'));
            var text = $(this).text();

            if (isNaN(text)) {
                if (text.indexOf('>') > -1) {
                    page = page + 1;
                }
                else {
                    page = page - 1;
                }
            }
            else {
                page = text -1;
            }

            url.removeParameter('returnUrl');
            url.addParameter('pageIndexSec', page);
            url.addParameter('returnUrl', encodeURIComponent(window.location.href));
            viewUrl = url.getURL();

            loadView(viewUrl);
        }

        e.preventDefault();
    });

    //Alternative products filter
    $(document.body).on('click', '#alternative-products .filtro input', function () {

        var url = new UrlHelper(viewUrl);
        url.removeParameter('returnUrl');
        var params = '';
        var fltid = this.id.replace('-popUp', '');

        if (this.checked) {

            if (url.hasParameter('flt')) {
                params = url.getParameter('flt');
                url.addParameter('flt', params + '|' + fltid);
            }
            else {
                url.addParameter('flt', fltid);
            }

            url.addParameter('returnUrl', encodeURIComponent(window.location.href));
            viewUrl = url.getURL();
            loadView(viewUrl);
        }
        else {
            params = url.getParameter('flt');
            if (params !== '') {

                var array = params.split('|');
                const index = array.indexOf(fltid);
                if (index > -1) {
                    array.splice(index, 1);
                }
                params = array.join('|');

                params !== '' ? url.addParameter('flt', params) : url.removeParameter('flt');
                url.addParameter('returnUrl', encodeURIComponent(window.location.href));
                viewUrl = url.getURL();
                loadView(viewUrl);
            }
        }

    });

    //Triggered when sort by dropdown is selected
    $(document.body).on('change', '#alternative-products #sortOrder', function () {

        var url = new UrlHelper(viewUrl);
        url.removeParameter('returnUrl');
        url.addParameter('sortOrder', $(this).val());
        url.removeParameter('pageIndex');
        url.addParameter('returnUrl', encodeURIComponent(window.location.href));
        viewUrl = url.getURL();
        loadView(viewUrl);
    });

    //Triggered when group by shelf checkbox is selected
    $(document.body).on('change', '#shelf-popUp.groupBy, #shelfMobile-popUp.groupBy', function () {

        var url = new UrlHelper(viewUrl);

        if ($(this).is(':checked')) {
            url.addParameter('view', 1);
            viewUrl = url.getURL();
            loadView(viewUrl);
        }
        else {
            url.removeParameter('view');
            viewUrl = url.getURL();
            loadView(viewUrl);
        }
    });
    
    // Triggered when customer clicks on 'Complete your registration'
    $(document.body).on('click', '.complete-your-registration-button', function (){
        $('#accountConfirmationModal').modal('show');
    });

});



//Alternative products Modal View

var pageUrl = '';

function loadView(url) {

    var modal = $('#alternative-products');
   

    $(".cancel").on("click", function () {
        modal.modal('hide');
        reoladIfOnTrolleyPage();
    });

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.modal('hide');
            reoladIfOnTrolleyPage();
        }
    };

    var loadingText = '<div class="d-flex flex-column align-items-center text-center h-100" >' +
        '<p class="mt-auto">We are getting alternative products.</p>' +
        '<p>Please wait...</p>' +
        '<img class="mb-auto" src="/images/ajax-loader.gif" />' +
        '</div>';

    $('#alternative-products  #page-content').html(loadingText);
    modal.modal('show');

    $.ajax({
        type: "GET",
        url: url,
        cache: false,
        dataType: "html",
    })
        .done(function (data) {
            $('#alternative-products #page-content').html(data);
            modal.modal('show');
            console.log('loaded...');
            //keeps view above every element
            //$('#alternative-products').css({ 'z-index': 999999 });
        })
        .fail(function (xhr, textStatus, errorThrown) {
            console.log(xhr.responseText);
        });


    pageUrl = '';

    return false;
}

function reoladIfOnTrolleyPage() {
    var currentUrl = window.location.href;
    if (currentUrl.includes("checkout/trolley")) {
        window.location.reload(true);
    }
}


/* Booker Shelves filter */
$("#show-more").click(function () {
    $("#shelves-show-more").toggleClass("hidden");
    $("#show-more").toggleClass("hidden");
});

$("#show-all").click(function () {
    $("#shelves-show-all").toggleClass("hidden");
    $("#show-all").toggleClass("hidden");
});

$("#show-more-mobile").click(function () {
    $("#shelves-show-more-mobile").toggleClass("hidden");
    $("#show-more-mobile").toggleClass("hidden");
});

$("#show-all-mobile").click(function () {
    $("#shelves-show-all-mobile").toggleClass("hidden");
    $("#show-all-mobile").toggleClass("hidden");
});

$("#all-shelves").click(function () {
    var checkedFilters = 0;
    var checkboxFilters = $(".filtroShelves input");

    selectedCategories = [];

    if (checkedFilters > 0) {
        checkboxFilters = $("#all-shelves");
        checkboxFilters[0].checked = false;
    } else {
        if ($("#all-shelves").is(':checked')) {
            for (var i = 0; i < checkboxFilters.length; i++) {
                checkboxFilters[i].checked = true;
                selectedCategories.push(checkboxFilters[i].id);
            }
        } else {
            for (var i = 0; i < checkboxFilters.length; i++) {
                checkboxFilters[i].checked = false;
            }
        }
    }

    var url = new UrlHelper();
    url.removeParameter("categoryName");
    url.addParameter("categoryName", selectedCategories);
    window.location.assign(url.getURL());

});

$(".filtroShelves input").click(function (event) {
    console.log(event.target.id);
    var checkboxFilters = $("#all-shelves");

    if ($("#all-shelves").is(':checked')) {
        checkboxFilters[0].checked = false;
    }

    if (event.target.checked) {
        // Add target id to list of selected categories
        selectedCategories.push(event.target.id);
    } else {
        // Remove target id from list of selected categories
        var index = selectedCategories.indexOf(event.target.id);
        if (index >= 0) {
            selectedCategories.splice(index, 1);
        }    
    }

    var url = new UrlHelper();
    url.removeParameter("categoryName");
    url.addParameter("categoryName", selectedCategories);
    window.location.assign(url.getURL());
});

/* Mobile */
$("#all-shelvesMobile").click(function () {
    var checkedFilters = 0;
    var checkboxFilters = $(".filtroShelves input");

    if (checkedFilters > 0) {
        var checkboxFilters = $("#all-shelvesMobile");
        checkboxFilters[0].checked = false;
    } else {
        if ($("#all-shelvesMobile").is(':checked')) {
            for (var i = 0; i < checkboxFilters.length; i++) {
                checkboxFilters[i].checked = true;
                selectedCategories.push(checkboxFilters[i].id);
            }
        } else {
            for (var i = 0; i < checkboxFilters.length; i++) {
                checkboxFilters[i].checked = false;
            }
        }
    }

    var url = new UrlHelper();
    url.removeParameter("categoryName");
    url.addParameter("categoryName", selectedCategories);
    window.location.assign(url.getURL());
});

$(".filtroShelves input").click(function () {
    var checkboxFilters = $("#all-shelvesMobile");

    if ($("#all-shelvesMobile").is(':checked')) {
        checkboxFilters[0].checked = false;
    }
});

function initializeShelveFilter(selectedCategories) {
    var checkboxFilters = $(".filtroShelves input");
    
    if (selectedCategories.length > 0) {

        for (var i = 0; i < checkboxFilters.length; i++) {
            var cb = checkboxFilters[i];
            if (selectedCategories.indexOf(cb.id) > -1) {
                cb.checked = true;

                if (i > 15) {
                    $("#shelves-show-all").removeClass("hidden");
                    $("#show-all").addClass("hidden");
                    $("#shelves-show-all-mobile").removeClass("hidden");
                    $("#show-all-mobile").addClass("hidden");
                }
                else if (i > 5) {
                    $("#shelves-show-more").removeClass("hidden");
                    $("#show-more").addClass("hidden");
                    $("#shelves-show-more-mobile").removeClass("hidden");
                    $("#show-more-mobile").addClass("hidden");
                } 
            }
        }
    }
}




// Telesales Products Search filter
$(document.body).on('click', '#search-for-item-results-container .filtro input', function () {

    // TODO: change for the alternative products form
    var formName = 'searchForItemForm';

    var searchForItemForm = document.getElementById(formName);

    if (!searchForItemForm) {
        return;
    }

    var url = new UrlHelper(searchForItemForm.action);
    var params = '';

    if (this.checked) {

        if (url.hasParameter('flt')) {
            params = url.getParameter('flt');
            url.addParameter('flt', params + '|' + this.id);
        }
        else {
            url.addParameter('flt', this.id);
        }
    }
    else {
        params = url.getParameter('flt');
        if (params !== '') {

            var array = params.split('|');
            const index = array.indexOf(this.id);
            if (index > -1) {
                array.splice(index, 1);
            }
            params = array.join('|');

            params !== '' ? url.addParameter('flt', params) : url.removeParameter('flt');
        }
    }

    searchForItemForm.action = url.getURL();

    $(searchForItemForm).find(':submit').click();

});