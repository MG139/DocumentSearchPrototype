var productCode;
var updateMode;
var quantityInput;
var originalQuantity;
var canBuyProduct;
var timeoutProducts = {};
var timeoutTrolley;
var payload;
var isCartItemClicked = null;
var trolley1 = document.querySelector('div#mini-trolley');
var trolley2 = document.querySelector('div#mini-trolley-mobile');
var visible = null;
var showNote;
var note;

$(document).ready(function () {
    initializeTrolleyControls();
    handleInputQuantity();
});

function handleInputQuantity() {
    $(document).on("blur", "input", function (e) {
        var onlineExclusive = $(this).closest('div[data-onlineexclusive]').data('onlineexclusive');
        if (onlineExclusive === "True") {
            var productId = this.id.replace(/^quantity_/, "");
            var oeCookie = Cookies.get('onlineexclusiveshown') === "1";
            if (oeCookie === false) {
                checkProductIsOnlineExclusive(productId, this);
            }
        }
    });
}
/* isElementInViewPort */
function isElementInViewport(element, expandMargin) {
    var expandMargin = 0;
    var currentWindowWidth = window.innerWidth;
    var currentWindowHeight = window.innerHeight;
    var rect = element.getBoundingClientRect();
    var expandMarginX = isNaN(expandMargin) ? expandMargin.x : expandMargin;
    var expandMarginY = isNaN(expandMargin) ? expandMargin.y : expandMargin;
    var spanY = rect.top + Math.max(rect.height, 1) + expandMarginY;
    var spanX = rect.left + Math.max(rect.width, 1) + expandMarginX;

    return (
        spanY >= Math.min(0, expandMarginY) + 1 &&
        rect.top <= currentWindowHeight + expandMarginY - 1 &&
        spanX >= Math.min(0, expandMarginX) + 1 &&
        rect.left <= currentWindowWidth + expandMarginX - 1
    );
}

var elementInViewport = isElementInViewport;
/* end is elementInViewPort */

function initializeTrolleyControls() {
    $(".SubCategoriesRow").add(".alternative-products").add('.SubCategoriesRow-popUp').add('#product_detail')
        .add('.scanner-get-barcodes').add('#centralBilling_CheckOput').add('.delivery')
        .on("click", ".trolley-mode .plus-minus-icon", function (e) {

            if (typeof (userIsRegistering) !== "undefined" && userIsRegistering)
            {
                $('#accountConfirmationModal').modal('show');
                return;
            }

            productCode = $(this).data('productcode');
            updateMode = $(this).data('updatemode');
            showNote = $(this).data('show-note');
            note = $(this).data('note');
            quantityInput = $('[id=quantity_' + productCode + ']'); //we want all the quantity inputs for that product code
            originalQuantity = parseInt(quantityInput.val());

            canBuyProduct = true; //default to true until it fails a check

            if (assessTrolleyAndUser(this)) {
                AddOrSubProduct();
            }

            var mainProductCode = $(this).data('mainproductcode');
            if (mainProductCode) {
                RemoveDelistedAndUpdateView($(this));
            }

            e.preventDefault();
            e.stopImmediatePropagation();
        });

    setBuyingClass();

    $(".SubCategoriesRow").add(".alternative-products").add('.SubCategoriesRow-popUp').add('#product_detail')
        .add('.scanner-get-barcodes').add('#centralBilling_CheckOput').add('.delivery')
        .on('focus', '.trolley-mode .product-quantity', function (e) {
            $(e.target).data('previousValue', $(e.target).val());
            $(e.target).select();
        });

    $(".SubCategoriesRow").add(".alternative-products").add('.SubCategoriesRow-popUp').add('#product_detail')
        .add('.scanner-get-barcodes').add('#centralBilling_CheckOput').add('.delivery')
        .on('keyup', '.trolley-mode .product-quantity', function (e) {

            if(userIsRegistering)
            {
                $(e.target).val(0);
                $('#accountConfirmationModal').modal('show');
                return;
            }

            var condition = !$(e.target).data('previousValue').length && e.keyCode === 8;
            var previousValue = $(e.target).data('previousValue');
            var newValue = $(e.target).val();

            if (previousValue !== newValue) {
                var delayInMilliseconds = 500;
                var productCode = $(e.target).parent().find('.plus-minus-icon').attr("data-productcode");

                if (timeoutProducts[productCode] !== null) {
                    clearTimeout(timeoutProducts[productCode]);
                }

//            if ($(e.target).closest('div[data-onlineexclusive]').data('onlineexclusive') === "True" && typeof isProdEnv === "function" && isProdEnv()) {
//                $(e.target).val(previousValue);
//                return;
//            } else {
                timeoutProducts[productCode] = setTimeout(function (localProductCode, newValue) {
                    quantityInput = $('[id=quantity_' + localProductCode + ']'); //WR-211 and WR-218
                    quantityInput.val(newValue);
                    UpdateTrolley(localProductCode, newValue, quantityInput);
                    $(e.target).data('previousValue', newValue);
                }, delayInMilliseconds, productCode, newValue);
//            }
            }
        });

    $(document).on("click", ".activate-delivery", function () {
        console.log('.activate-delivery');
        modal.style.display = "none";
        ActivateTrolley('Delivery', false);
        AddOrSubProduct();
    });

    $(document).on("click", ".activate-collect", function () {
        console.log('.activate-collect');
        var $modal = $(this).closest(".modal");
        $modal.css("display", "none");
        ActivateTrolley('ClickAndCollect', false);
        AddOrSubProduct();
    });
}

function FillInProductNote(note) {
    if (note != null) {
        $("#addNoteTextArea").val(note);
        var used_chars = note.length;
        var max = $('#addNoteTextArea').attr("maxlength");
        $("#characters-used").text(used_chars + " of " + max + " characters used");
    }
}

function PersistNote(productId, note, hidePopup) {
    $.ajax({
        type: "POST",
        url: "/api/sitecore/Trolley/AddNoteToLine",
        cache: false,
        data: { "productId": productId, "note": note, "hidePopup": hidePopup }
    })
        .done(function (data) {
            if (productId != "") {
                $("[data-item=" + productId + "]").data("note", note);
                var obj = $("#plus_" + productId);
                if (obj != null && obj.data("note") != null) {
                    obj.removeData();
                    obj.data("note", note);
                }

                var label = note.length == 0 ? "Add Note" : "Edit Note";
                $(".add-note-" + productId + " .add-note-label").html(label);
            }
        })
        .fail(function (xhr, textStatus, errorThrown) {
            console.log(xhr.responseText);
        });
}
//Adds or subtracts product from the trolley
function AddOrSubProduct() {
    var newQuantity = -1;
    if (updateMode === 'plus') {
        if (originalQuantity < 999) {
            newQuantity = originalQuantity + 1;
        }

        $("#product-note").val(productCode);
        var obj = $("#plus_" + productCode);
        if (obj != null) {
            showNote = obj.data("show-note");
            note = obj.data("note");
        }

        if (showNote != null && newQuantity <=1 && ((showNote.toLowerCase() == 'true' && Cookies.get('PU_HCWPNP') == null) ||
            (showNote.toLowerCase() == 'true' && Cookies.get('PU_HCWPNP') == 'false'))) {

            FillInProductNote(note);
            $('#add-note').modal();
        }
    }

    if (updateMode === 'minus') {
        if (originalQuantity !== 0) {
            newQuantity = originalQuantity - 1;
        }
        if (newQuantity == 0) {
            note = "";
            var obj = $("#plus_" + productCode);
            if (obj != null) {
                obj.removeData();
                obj.data("note", note);
            }
            $("[data-item=" + productCode + "]").data("note", note);
            $("#product-qty").val(0);
        }
    }

    if (newQuantity !== -1) {
        quantityInput.val(newQuantity.toString());

        var delayInMilliseconds = 500;

        if (timeoutProducts[productCode] !== null) {
            clearTimeout(timeoutProducts[productCode]);
        }

        timeoutProducts[productCode] = setTimeout(function (localProductCode, newQuantity) {
            quantityInput = $('[id=quantity_' + localProductCode + ']'); //WR-211 and WR-218
            UpdateTrolley(localProductCode, newQuantity, quantityInput);
            $(quantityInput).data('previousValue', newQuantity);
        }, delayInMilliseconds, productCode, newQuantity);
    }
}

function UpdateMiniTrolley(trolleyData) {
    var template = $('#mini-trolley-template').html();
    if (template) {
        var templateCompile = Handlebars.compile(template);
        $('#mini-trolley').html(templateCompile(trolleyData));
    }

    var miniTrolleyMobileTemplate = $('#mini-trolley-mobile-template').html();
    if (miniTrolleyMobileTemplate) {
        templateCompile = Handlebars.compile(miniTrolleyMobileTemplate);
        $('#mini-trolley-mobile').html(templateCompile(trolleyData));
    }
}

function UpdateOrderSummary(trolleyData) {
    var orderSummary = $('#booker_trolley_first_aside');
    template = $('#trolley-summary-template').html();
    if (template) {
        templateCompile = Handlebars.compile(template);
        orderSummary.html(templateCompile(trolleyData));
    }
}

function UpdateMinimumDeliveryPopup(trolleyData) {
    if (trolleyData.LongTailMinimumDeliveryMessage && trolleyData.LongTailMinimumDeliveryMessage.Display) {
        $('#myModalMinimumOrderQuantity').find('.minimum-delivery-message-title').html(trolleyData.LongTailMinimumDeliveryMessage.Title);
        $('#myModalMinimumOrderQuantity').find('.minimum-delivery-message-text').html(trolleyData.LongTailMinimumDeliveryMessage.Message);
        $('#myModalMinimumOrderQuantity').find('.minimum-delivery-message-link').attr("href", "/products/product-list?supplierid=" + trolleyData.LongTailMinimumDeliveryMessage.SupplierId);
    }
}

function setBuyingClass() {
    $('input[type=number]').each(function () {
        var val = parseInt($(this).val());
        var div = $(this).closest('.order-item');

        if (val > 0) {
            div.addClass("buying");
            if (div.length === 0) {
                $(this).closest('.quantity').parent().addClass('in-trolley');
            }
        } else {
            div.removeClass("buying");
        }
    });
}

function UpdateTrolley(productCode, quantity, quantityInput) {
    var isTrolleyPage = $('[id^="booker_trolley"]').length >= 1;
    var div = quantityInput.closest("#order-item-quantity-" + productCode);
    var topProductDiv = quantityInput.closest(".top-product-quantity-" + productCode);
    var featuredProducts = quantityInput.closest(".featured-product")
    var suggestedProducts = quantityInput.closest(".suggested-product")

    var isPartOfCampaign = (featuredProducts != null && featuredProducts.length > 0) || (suggestedProducts != null && suggestedProducts.length > 0);

    if (quantity > 0) {
        div.addClass("buying");
        if (topProductDiv.length > 0) {
            topProductDiv.addClass("in-trolley");
        }
    } else {
        div.removeClass("buying");
        if (topProductDiv.length > 0) {
            topProductDiv.removeClass("in-trolley");
        }
    }

    payload = {
        ProductCode: productCode,
        Quantity: quantity,
        CentralBilling: $('.centralBillingProductList').length > 0 || $('.centralBillingProductDetail').length > 0,
        SupplierId: quantityInput.data('supplier'),
        TrolleyType: trolleyType,
        BranchName: branchName
    };

    $.ajax({
        url: '/api/booker/trolleyajax/updatetrolley',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(payload),
        headers: {
            'RequestVerificationToken': rvt
        }
    }).done(function (data) {

        if (data.Quantity > 0) {
            var multiBuyUrl = quantityInput.closest(".product").attr("data-multibuy-url");
            if (multiBuyUrl !== "" && multiBuyUrl !== undefined && window.location.href.indexOf("products/multi-buy") < 0) {
                window.location.assign(multiBuyUrl);
            }

            // Are we showing alternative products?
            var alternativeProducts = quantityInput.closest("#alternative-products");
            var isScanner = quantityInput.parents('.scanner-picker').length > 0;

            // If we are not showing alternative products, and the product we are adding to the cart is not in the cart yet, refresh the page
            if (alternativeProducts.length == 0 && $("#booker_trolley_first_main").length > 0 && !isScanner) {
                if ($("#booker_trolley_first_main").find(".container-product-" + data.ProductCode).length == 0) {
                    location.reload();
                }
            }
        }

        //register campaign event
        if (updateMode === 'plus') {
            registerAddToTrolleyEvent(quantityInput, productCode);
        }

        document.cookie = "State-" + trolleyType + "=dirty;path=/;SameSite=Lax;"

        isCartItemClicked = true;
        if (typeof isTrolleyPage !== 'undefined' && isTrolleyPage) {
            timeoutUpdateTrolley();
        } else {
            checkElementInViewport();
        }
    });
}

function UpdateTrolley2(productCode, quantity, supplierId)
{

    payload = {
        ProductCode: productCode,
        Quantity: quantity,
        CentralBilling: $('.centralBillingProductList').length > 0 || $('.centralBillingProductDetail').length > 0,
        SupplierId: supplierId,
        TrolleyType: trolleyType,
        BranchName: branchName
    };

    $.ajax({
        url: '/api/booker/trolleyajax/updatetrolley',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(payload),
        headers: {
            'RequestVerificationToken': rvt
        }
    }).done(function (data) {

        //register campaign event
        if (updateMode === 'plus') {
            registerAddToTrolleyEvent(quantityInput, productCode);
        }

        document.cookie = "State-" + trolleyType + "=dirty;path=/;SameSite=Lax;"

        isCartItemClicked = true;
        if (typeof isTrolleyPage !== 'undefined' && isTrolleyPage) {
            timeoutUpdateTrolley();
        } else {
            checkElementInViewport();
        }
    });
}

function timeoutUpdateTrolley() {

    clearTimeout(timeoutTrolley)
    timeoutTrolley = setTimeout(() => {
        payload = {
            TrolleyType: trolleyType,
            CentralBilling: $('.centralBillingProductList').length > 0 || $('.centralBillingProductDetail').length > 0,
            SupplierId: (typeof quantityInput !== 'undefined' ? quantityInput.data('supplier') : 0),
            IsClickAndCollectCustomer: isClickAndCollect,
            IsDeliveryCustomer: isDelivery
        };

        $.ajax({
            url: '/api/booker/trolleyajax/gettrolleysummary',
            type: 'POST',
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(payload),
            headers: {
                'RequestVerificationToken': rvt
            }
        }).done(function (data) {
            UpdateMiniTrolley(data);
            UpdateOrderSummary(data);
            UpdateMinimumDeliveryPopup(data);
        });
    }, 1000)

}

// check trolley is in view
// then trigger the updateTrolley call
function checkElementInViewport() {
    if (
        isCartItemClicked && (
            elementInViewport(trolley1) && ($(trolley1).is(":visible")) ||
            elementInViewport(trolley2) && ($(trolley2).is(":visible"))
        )
    ) {
        timeoutUpdateTrolley();
        isCartItemClicked = false;
    }
}

checkElementInViewport();

$(window).on('scroll', function(){
    checkElementInViewport();
});
// check trolley is in view

var trolley_OE_Checked = Cookies.get('onlineexclusiveshown') === "1";
var trolley_DD_Checked = Cookies.get('directdeliveredshown') === "1";
var deliverOnly = false;

var modal;
var cancel;

function assessTrolleyAndUser(element) {

    //If unknown or nomode return false.
    if ((trolley_mode & 4) === 4) {
        //addToTrolleyValues = [controlIDRoot, productId, variantId, basketName, updateGreen, updateRed, isDeleted, inTrolleyID, rowID, highlightMode, quantity];
        checkProductCanCollect(productCode, element);
        return false;
        //} else if ($(element).closest('div[data-onlineexclusive]').data('onlineexclusive') === "True" && typeof isProdEnv === "function" && isProdEnv()){
        //    return false;
    }else if ((booker_delivery_usertype === 2 || booker_delivery_usertype === 7 || booker_delivery_usertype === 3 || booker_delivery_usertype === 4 || booker_delivery_usertype === 1 || booker_delivery_usertype === 11) && trolley_OE_Checked === false) //Can Deliver only Not OE
    {
        //addToTrolleyValues = [controlIDRoot, productId, variantId, basketName, updateGreen, updateRed, isDeleted, inTrolleyID, rowID, highlightMode, quantity];
        checkProductIsOnlineExclusive(productCode, element);
        return false;
    } else if (!trolley_DD_Checked) {
        //addToTrolleyValues = [controlIDRoot, productId, variantId, basketName, updateGreen, updateRed, isDeleted, inTrolleyID, rowID, highlightMode, quantity];
        checkProductIsDirectDelivery(productCode, element);
        return false;
    } else {
        return true;
    }
}

//check the product is available for click and collect
function checkProductCanCollect(productCode, element) {
    $.ajax({
        url: '/api/sitecore/Trolley/IsProductAvailableForCollection',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({sucode: productCode})
    })
        .done(function (result) {
            if (result === false) {
                deliverOnly = true;
            }

            availableBasketModes(element);
        });
}

//check what basket modes are available to logged in user.
function availableBasketModes(element) //AVAILABLE basket modes - NOT current basket mode
{
    var Delivered = 1;
    var Collect = 2;

    $.ajax({
        url: '/api/sitecore/Trolley/GetAvailableTrolleyMode',
        type: 'POST',
        contentType: 'application/json',
        data: {}
    })
        .done(function (basket_mode) {
            if ((basket_mode & (Delivered + Collect)) === (Delivered + Collect)) //User are able to Deliver AND Collect
            {
                console.log('User are able to Deliver AND Collect');
            } else if ((basket_mode & Collect) === Collect) //User can only collect
            {
                console.log('User can only collect');

                if (deliverOnly)//Item cannot be purchased for collection - so clear out.
                {
                    modal = document.getElementById("no-delivery-option");
                    //request delivery action implemented in the setup
                    setupModalBox(modal);
                } else {
                    if (trolley_mode !== Collect) {
                        checkProductIsDirectDeliveryNoMode(productCode, element);
                    } else {
                        if (!trolley_OE_Checked)
                            checkProductIsOnlineExclusive(productCode, element);
                        else {
                            AddOrSubProduct();
                        }
                    }
                }
            } else if ((basket_mode & Delivered) === Delivered) //User can only have deliver
            {
                modal = document.getElementById("trolley-option");
                //activate trolley actions handled globally
                setupModalBox(modal);
                console.log('User can only have deliver');
            }

            deliverOnly = false;
        });
}

//check the product is Direct Delivery with no mode selected
function checkProductIsDirectDeliveryNoMode(productCode, element) {

    var directDelivered = $(element).closest('div[data-directdelivered]').data('directdelivered');

    if (directDelivered === "True") {
        trolley_DD_Checked = true;
        Cookies.set('directdeliveredshown', '1')

        modal = document.getElementById("direct-delivery-option");
        setupModalBox(modal);
    } else {
        modal = document.getElementById("collect-no-delivery-option");
        $(modal).find(".request-delivery-content").hide();
        //activate trolley actions handled globally
        setupModalBox(modal);
    }

}

//check the product is Direct Delivery
function checkProductIsDirectDelivery(productcode, element) {

    var directDelivered = $(element).closest('div[data-directdelivered]').data('directdelivered');

    if (directDelivered === "True") {
        modal = document.getElementById("direct-delivery-option");

        setupModalBox(modal);

        trolley_DD_Checked = true;
        Cookies.set('directdeliveredshown', '1');
    } else {
        //Product not Direct Direct - proceed with purchase.
        AddOrSubProduct();
    }
}

function checkProductIsOnlineExclusive(productCode, element) {
    var onlineExlusive = $(element).closest('div[data-onlineexclusive]').data('onlineexclusive');

    if (onlineExlusive === "True") //Product IS Online Exclusive - show correct popup based on userdeliverytype.
    {
        modal = document.getElementById("online-exclusive-option");

        if (booker_delivery_usertype === 2 || booker_delivery_usertype === 7)//Can Deliver only Not OE
        {
            $(modal).find(".deliver-content").show();
        }

        if (booker_delivery_usertype === 3 || booker_delivery_usertype === 4)//Can Collect only
        {
            $(modal).find(".collect-content").show();
            $(modal).find(".continue").show();
        }

        if (booker_delivery_usertype === 1 || booker_delivery_usertype === 11)//Can Collect and Deliver
        {
            $(modal).find(".collect-deliver-content").show();
        }

        setupModalBox(modal);

        trolley_OE_Checked = true;
        Cookies.set("onlineexclusiveshown", "1");

    } else { //Product not Online Exclusive - proceed with purchase.
        if (!trolley_DD_Checked) {
            checkProductIsDirectDelivery(element);
        } else {
            AddOrSubProduct();
        }
    }
}


function requestDelivery() {
    $.ajax({
        url: '/api/sitecore/Trolley/SendOrderingRequestEmail',
        type: 'POST',
        contentType: 'application/json',
        data: {}
    })
        .done(function () {
            modal = document.getElementById("delivery-thank-you");
            setupModalBox(modal);
        });
}

function setupModalBox(modal) {
    if(modal != null && modal.style != null)
        modal.style.display = "block";

    $(modal).find('.cancel').click(function () {
        modal.style.display = "none";
    });

    // close when user clicks outside modal
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    $(modal).find('.request-delivery').click(function () {
        modal.style.display = "none";
        console.log('requesting delivery...');
        canBuyProduct = false;
        requestDelivery();
    });

    $(modal).find(".continue").click(function () {
        modal.style.display = "none";

        if (canBuyProduct) {
            AddOrSubProduct();
        }
    });
}

function RemoveDelistedAndUpdateView(plusButtonDiv) {
    var mainProductCode = plusButtonDiv.data('mainproductcode');
    var removeDelistedModel = {};
    removeDelistedModel.DelistedProductCode = mainProductCode;

    $.ajax({
        type: "POST",
        url: '/api/sitecore/TrolleyCheckout/RemoveDelistedFromTrolley',
        data: JSON.stringify(removeDelistedModel),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            updateView(plusButtonDiv);
        },
        error: function (data) {
            console.log("error");
            console.log(data);
        }
    });

}

function updateView(plusButtonDiv) {
    var dataUpdateMode = $(plusButtonDiv).data('updatemode');
    var dataProductCode = $(plusButtonDiv).data('productcode');

    plusButtonDiv.data('mainproductcode', '');

    $("div[data-updatemode='" + dataUpdateMode + "'][data-productcode='" + dataProductCode+"']").each(function () {
        var addedSubstituteDiv = $(this).closest(".product.product-model");
        var delistedItemSubClass = "delisted-item-sub";
        var delistedItemSubLastClass = "delisted-last-item-sub";

        removePrevious(addedSubstituteDiv);
        if (addedSubstituteDiv.hasClass(delistedItemSubClass)) {
            removeNext(addedSubstituteDiv);
            addedSubstituteDiv.removeClass(delistedItemSubClass);
        }

        if (addedSubstituteDiv.hasClass(delistedItemSubLastClass)) {
            addedSubstituteDiv.removeClass(delistedItemSubLastClass);
        }
    });
}

function removeNext(addedSubstituteRow) {
    var nextRow = addedSubstituteRow.next();
    if (nextRow.hasClass("delisted-item-sub")) {
        removeNext(nextRow);
        nextRow.remove();
    }

    if (nextRow.hasClass("delisted-last-item-sub")) {
        nextRow.remove();
    }
}

function removePrevious(addedSubstituteRow) {
    var previousRow = addedSubstituteRow.prev();
    if (previousRow.hasClass("delisted-item-sub")) {
        removePrevious(previousRow);
        previousRow.remove();
    }
    if (previousRow.hasClass("delisted-item")) {
        previousRow.remove();
    }
}

function registerAddToTrolleyEvent(quantityInput, productCode) {

    var productElement = quantityInput.closest(".featured-product");
    if (productElement.length === 0) {
        productElement = quantityInput.closest(".suggested-product");
    }
    var campaignDiv = productElement.prevAll("div.product-list-campaign:first");
    var campaignId = null;
    if(campaignDiv.length === 0) {
        campaignDiv = quantityInput.closest("div[data-campaignid]");
        campaignId = $(campaignDiv[campaignDiv.length-1]).data('campaignid');
    } else {
        campaignId = campaignDiv.data('campaignid');
    }

    if (campaignId && campaignId != "") {
        var payload = {
            Type: "ADDTOTROLLEY",
            Referer: window.location.pathname+window.location.search,
            ProductId: productCode,
            CampaignId: campaignId,
            PageId: campaignDiv.data('pageid'),
            DatasourceId: campaignDiv.data('datasourceid'),
            RenderingId: campaignDiv.data('renderingid')
        };

        $.ajax({
            url: '/api/booker/analytics/registerevent',
            type: 'POST',
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(payload)
        }).done(function (data) {});
    }
}