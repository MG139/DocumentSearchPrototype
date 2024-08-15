   /* function to mock the stock level and colour being passed in for each product */
  
  function randomStockLevel() {
    
    let stockLevels = [
      {
        level: 'IN STOCK',
        color: '#51AF39'
      },
      {
        level: 'LOW STOCK',
        color: '#EE8E1B'
      },
      {
        level: 'NO STOCK',
        color: '#808080'
      },
    ];
    let stock = Math.floor(Math.random() * stockLevels.length);
    return stockLevels[stock];
  }

  function findMoreAvailabilityToggle() {
    document.querySelector('.find-more-availability').classList.toggle('d-none');
  }


    /* get all products in "list" pages - ones where there are list and grid views */
    let productsList = document.querySelectorAll('.d-flex.product.row.product-model');

    let page = window.location.href;

if (page.includes('scanner')) {
      let tableHeaders = document.querySelectorAll('.table-desktop > thead > tr > th');
      let newHeader = document.createElement('th');
      newHeader.colSpan = 2;
      tableHeaders[tableHeaders.length - 1].before(newHeader);
      let colSpan = document.querySelectorAll('.table-desktop > tbody > tr');
      colSpan[colSpan.length - 1].firstElementChild.colSpan = 16;
      let desktopProducts = document.querySelectorAll('.table-desktop > tbody > .product-row');
      [...desktopProducts].map(product => {
        let stock = randomStockLevel();
        let newCell = document.createElement('td');
        newCell.colSpan = 2;
        newCell.innerHTML = `<stock-label data-stocklevel="${stock.level}" data-stocklevel-bgcolor="${stock.color}"></stock-label>`;
        product.lastElementChild.before(newCell);
        product.lastElementChild.lastElementChild.lastElementChild.innerHTML = `<add-to-list></add-to-list>`;
        product.lastElementChild.lastElementChild.classList.add('justify-content-center');
      });

      let mobileProducts = document.querySelectorAll('.mobile-view > .accordion > .card');
      [...mobileProducts].map(product => {
        let stock = randomStockLevel();
        let headerCells = product.querySelectorAll('table > thead > tr > th');
        let newHeader = document.createElement('th');
        newHeader.colSpan = 2;
        headerCells[0].after(newHeader);
        
        let productCells = product.querySelectorAll('table > tbody > tr > td');
        let newCell = document.createElement('td');
        newCell.colSpan = 2;
        newCell.innerHTML = `<stock-label data-stocklevel="${stock.level}" data-stocklevel-bgcolor="${stock.color}"></stock-label>`;
        productCells[productCells.length - 1].before(newCell);
        productCells[productCells.length - 1].firstElementChild.firstElementChild.innerHTML = `<add-to-list></add-to-list>`;
        productCells[productCells.length - 1].firstElementChild.classList.add('justify-content-center');
      });
    }

      if (page.includes('print-product-list')) {
        let headerRow = document.querySelectorAll('#print-table > .table-desktop > thead > tr');
        let tableRows = document.querySelectorAll('#print-table > .table-desktop > tbody > tr');
        let newHeader = document.createElement('th');
        headerRow[0].children[2].after(newHeader);
        [...tableRows].filter(row => row.children[0].attributes.colspan == undefined).map(product => {
            let newCell = document.createElement('td');
            newCell.innerHTML = `<stock-label data-stocklevel="${randomStockLevel().level}" data-stocklevel-bgcolor="${randomStockLevel().color}"></stock-label>`;
            product.children[2].after(newCell);
        });
    }

if (page.includes('rep-orders')) {
      let headerRow = document.querySelectorAll('.table-desktop > thead > tr > th');
      let newHeader = document.createElement('th');
      newHeader.colSpan = 2;
      headerRow[headerRow.length - 1].before(newHeader);
      
      let productRow = document.querySelectorAll('.table-desktop > tbody > tr');
      productRow[productRow.length - 1].firstElementChild.colSpan = 16;
      [...productRow].map(product => {
        if (product.classList.contains('product-row')) {
          let stock = randomStockLevel();
          let newCell = document.createElement('td');
          newCell.colSpan = 2;
          newCell.innerHTML = `<stock-label data-stocklevel="${stock.level}" data-stocklevel-bgcolor="${stock.color}"></stock-label>`;
          product.lastElementChild.before(newCell);
        }
      });


     }


    /* product information contains RTS stock locator, need to pass the product to the component */
    if (page.includes('product-information')) {

        let stock = randomStockLevel();
        let stockLevelDiv = document.createElement('div');
        stockLevelDiv.innerHTML = `<stock-label data-stocklevel="${stock.level}" data-stocklevel-bgcolor="${stock.color}"></stock-label>`;

        let productDetails = document.querySelectorAll('.product-main');
        let midasCode = productDetails[0].children[0].innerText;

        let findMoreAvailability = document.createElement('div');
        findMoreAvailability.innerHTML = `<find-more-availability data-midascode=${midasCode}></find-more-availability>`;
        document.body.appendChild(findMoreAvailability);

        let findMoreAvailabilityUrl = document.createElement('a');
        findMoreAvailabilityUrl.classList.add('findMoreAvailabilityUrl');
        findMoreAvailabilityUrl.text = `Find More Availability`;
        findMoreAvailabilityUrl.href = `#`;
        findMoreAvailabilityUrl.addEventListener('click', findMoreAvailabilityToggle);
        stockLevelDiv.appendChild(findMoreAvailabilityUrl);


        let productDesktop = document.querySelectorAll('.product-price > .filaDesktop');

        // add text-center to align the Find More Availability URL
        document.querySelectorAll('.shopProduct.trolley-mode')[0].classList.add('text-center');
        
        
        productDesktop[0].children[2].children[1].classList.remove('d-flex', 'align-items-center', 'mt-0', 'flex-grow-1');
        productDesktop[0].children[2].children[1].children[1].innerHTML = `<add-to-list></add-to-list>`;
        let addNote = productDesktop[0].children[2].children[2].getAttribute('data-show-note');

        let newAddNote;

        if (addNote == 'True') {
            productDesktop[0].children[2].children[2].classList.remove('d-flex','align-items-center', 'mt-0'); 
            productDesktop[0].children[2].children[2].children[1].innerHTML = `<add-to-note></add-to-note>`;
            newAddNote = productDesktop[0].children[2].children[2].cloneNode(true);
        }

        // need to clone the add to list and add to note nodes, and then remove them from where they currently are

        let newAddToList = productDesktop[0].children[2].children[1].cloneNode(true);

        let onlineExclusive = productDesktop[0].children[2].children[0] !== undefined ? productDesktop[0].children[2].children[0].getAttribute('data-onlineexclusive') : 'False';

        let showNote = productDesktop[0].children[2].children[0].children[2] !== undefined ? productDesktop[0].children[2].children[0].children[2].getAttribute('data-show-note') : 'False';

        
        
        if (onlineExclusive == 'False') {
            productDesktop[0].children[2].lastElementChild.remove();
            if (showNote == 'True') {
                productDesktop[0].children[2].lastElementChild.remove();
            }
            productDesktop[0].children[2].lastElementChild.after(stockLevelDiv);
            //productDesktop[0].children[2].lastElementChild.after(findMoreAvailabilityUrl);
        }

        let iconsDiv = document.createElement('div');
        iconsDiv.classList.add('row', 'd-flex', 'position-absolute', 'fixed-bottom', 'ml-3', 'mb-2');
        iconsDiv.appendChild(newAddToList);
        iconsDiv.appendChild(newAddNote);
       
        productDesktop[0].children[1].lastChild.after(iconsDiv);
       
        let productMobile = document.querySelectorAll('.product-price > .filaMobile');
        let addToListMobile = productMobile[0].children[1].children[3];
        addToListMobile.classList.remove('d-flex', 'align-items-center', 'mt-0', 'flex-grow-1');
        addToListMobile.children[1].innerHTML = `<add-to-list></add-to-list>`;
        let addNoteMobile = productMobile[0].children[1].children[4];
        
        addNoteMobile.children[1].innerHTML = `<add-to-note></add-to-note>`;

        let iconsDivMobile = document.createElement('div');
        iconsDivMobile.classList.add('row', 'd-flex', 'justify-content-end');
        iconsDivMobile.appendChild(addToListMobile);
        iconsDivMobile.appendChild(addNoteMobile);

        productMobile[0].children[1].lastElementChild.after(iconsDivMobile);


        let stockLevelDivMobile = document.createElement('div');
        stockLevelDivMobile.classList.add('row', 'd-inline-block', 'position-absolute', 'fixed-bottom', 'p-0');
        stockLevelDivMobile.innerHTML = `<stock-label data-stocklevel="${stock.level}" data-stocklevel-bgcolor="${stock.color}">`;

        let findMoreAvailabilityUrlMobile = document.createElement('a');
        findMoreAvailabilityUrlMobile.classList.add('findMoreAvailabilityUrl');
        findMoreAvailabilityUrlMobile.text = `Find More Availability`;
        findMoreAvailabilityUrlMobile.href = `#`;
        findMoreAvailabilityUrlMobile.addEventListener('click', findMoreAvailabilityToggle);
        
        stockLevelDivMobile.appendChild(findMoreAvailabilityUrlMobile);

        productMobile[0].children[0].lastElementChild.after(stockLevelDivMobile);
        productMobile[0].children[1].children[3].classList.add('my-3');

    }




    /* List & mobile views */
    
    [...productsList].map((product) => {
    
        /* mock stock level data for each product - assumption for now is that a data attribute "data-stocklevel" is going to be served from the backend */ 
        let stock = randomStockLevel();
        product.setAttribute('data-stocklevel', stock.level);
        product.setAttribute('data-stocklevel-bgcolor', stock.color);

        let stockLevelDiv = document.createElement('div');
        stockLevelDiv.classList.add('stockLevelDiv');
    
        let stockLevelDivMobile = document.createElement('div');
        stockLevelDivMobile.classList.add('stockLevelDiv', 'row', 'text-right');
    
        let showNote;
        let directDelivered;
        let onlineExclusive;
        
        // desktopProductNode being the "buy-this-product product-counter" div, which does not exist for online exclusive collect.
        let desktopProductNode = product.children[1].children[1].children[0].children[1].children[1]; 

        let mobileProductNode = page.includes('multibuy') ? product.children[1].children[1].children[1].children[0].children[0].children[1].children[1].children[1] : product.children[1].children[1].children[1].children[0].children[0].children[1].children[0].children[1].children[1];

        // remove the current Add to List icon - also set .list-img to display none in the css
        desktopProductNode.children[0].children[0].src = '';

        // Add to List - change the "Add to List" text to be the icon component
        desktopProductNode.children[0].children[1].innerHTML = `<add-to-list></add-to-list>`;
        
        // to show or not show the note for each product is determined by these data attributes - not applicable to online exclusive collect, undefined here means online exclusive / available to purchase in branch?
        if (desktopProductNode.children[1] !== undefined) {

            showNote = desktopProductNode.children[1].getAttribute('data-show-note') ? desktopProductNode.children[1].getAttribute('data-show-note') : 'False';
            directDelivered = product.children[2].getAttribute('data-directdelivered') ? product.children[2].getAttribute('data-directdelivered') : 'False';
            onlineExclusive = product.children[2].getAttribute('data-onlineexclusive') ? product.children[2].getAttribute('data-onlineexclusive') : 'False';
        
        // remove add note img, also set .note-img to display none in the css
        desktopProductNode.children[1].children[0].src = '';

        // replace "Add Note" url text with the icon
        desktopProductNode.children[1].children[1].innerHTML = `<add-to-note class="ml-2"></add-to-note>`;

        } else {
            // to handle OE collect, who should be able to see stock labels
            directDelivered = 'False';
            onlineExclusive = 'False';
        }


        if (page.includes('recent-purchases') && desktopProductNode.children[2] !== undefined) {
          let hideBtn = desktopProductNode.children[2] !== 'undefined' ? desktopProductNode.children[2].cloneNode(true) : false;
          desktopProductNode.children[2].remove();
          desktopProductNode.parentNode.lastChild.after(hideBtn);
        }


        // remove flex-column class and add justify-content-center from parent div of the new list and note icons to make them line up better
        desktopProductNode.classList.remove('flex-column');
        desktopProductNode.classList.add('justify-content-center', 'rtsIcons');

        // remove the classes from the div wrapped around the icons
        desktopProductNode.children[0].classList.remove('col', 'd-flex', 'flex-row');
        
        desktopProductNode.children[1] !== undefined ? desktopProductNode.children[1].classList.remove('col', 'd-flex', 'flex-row') : false;


        if (directDelivered == 'False' && onlineExclusive == 'False') {
            stockLevelDiv.innerHTML = `<stock-label data-stocklevel="${stock.level}" data-stocklevel-bgcolor="${stock.color}"></stock-label>`;
            desktopProductNode.parentElement.children[0].after(stockLevelDiv);
        }

       /* Mobile View - add to list does not show for any products */
        stockLevelDivMobile.innerHTML = (directDelivered == 'False' && onlineExclusive == 'False') ? `<stock-label data-stocklevel="${stock.level}" data-stocklevel-bgcolor="${stock.color}"></stock-label>` : ``;


        //add d-flex to the div which is going to contain the add to note icon and stock level, and the add to note icon to replace the Add Note link, otherwise just add the stock without the note
        if (mobileProductNode.parentElement.dataset.showNote == 'True') {
            mobileProductNode.classList.add('d-flex', 'align-items-center', 'mobileAddNoteStock'); 
            mobileProductNode.innerHTML = `<add-to-note></add-to-note>`;
            mobileProductNode.innerHTML += stockLevelDivMobile.innerHTML;
        } else {
            mobileProductNode.parentElement.parentElement.children[0].after(stockLevelDivMobile);
        }
    });

    /* grid view */

    let gridProductList = document.querySelectorAll('.product-model.d-flex.flex-column');
    
    [...gridProductList].map((product) => {
        let stock = randomStockLevel();
        product.setAttribute('data-stocklevel', stock.level);
        product.setAttribute('data-stocklevel-bgcolor', stock.color);
        let stockLevelDivGrid = document.createElement('div');
        stockLevelDivGrid.classList.add('stockLevelDiv', 'row', 'pl-2');

        let showNote = product.children[4].getAttribute('data-show-note');

        let directDelivered = product.children[4].children[5].children[0].getAttribute('data-directdelivered') ? product.children[4].children[5].children[0].getAttribute('data-directdelivered') : 'False';
        let onlineExclusive = product.children[4].children[5].children[0].getAttribute('data-onlineexclusive') ? product.children[4].children[5].children[0].getAttribute('data-onlineexclusive') : 'False';

        // add stockLevelDiv to the mobile view, if not direct delivered or online exclusive

        stockLevelDivGrid.innerHTML = (directDelivered == 'False' && onlineExclusive == 'False') ? `<stock-label data-stocklevel="${stock.level}" data-stocklevel-bgcolor="${stock.color}"></stock-label>` : ``;
        

        let gridProductNode = product.children[4].children[1].children[0].children[0];
        gridProductNode.parentElement.classList.remove('pl-0');
        gridProductNode.parentElement.classList.add('pl-2');
        gridProductNode.children[1].children[0].innerHTML = `<add-to-list></add-to-list>`;
        
        if (showNote == 'True') {
        
        // clone the current addToNote because it is in its own row, so we want to clone it and then inject it in the same col of the add to list icon. 
         let addToNoteClone = product.children[4].children[2].children[0].children[0].cloneNode(true);
         product.children[4].children[2].children[0].children[0].innerHTML = `&nbsp;`;
 
         addToNoteClone.children[1].children[0].innerHTML = `<add-to-note class="ml-3"></add-to-note>`;
         gridProductNode.children[1].after(addToNoteClone);
       }

        product.children[4].children[0].after(stockLevelDivGrid);
    });
