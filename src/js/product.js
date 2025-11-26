/**
 * 这是原始文件，
 * 
 */

/**
 * 
 * @param {string} product_spu product spu to save
 * @param {number} maxHistoryLength max history length to keep
 */

function saveProductToLocalStorage(product_spu, maxHistoryLength = 30) {
    let productHistory = JSON.parse(localStorage.getItem(product_history_key)) || [];
    // product_spu exits
    const index = productHistory.indexOf(product_spu);
    if (index > -1) {
        productHistory.splice(index, 1);
    }
    productHistory.unshift(product_spu);
    // max length
    if (productHistory.length > maxHistoryLength) {
        productHistory = productHistory.slice(0, maxHistoryLength); // move
    }
    // save local
    localStorage.setItem(product_history_key, JSON.stringify(productHistory));
}

function fetchAndDisplayViewedProducts(history_url) {
    let productHistory = JSON.parse(localStorage.getItem(product_history_key) || '[]');
    if (productHistory.length === 0) {
        return;
    }
    const viewedProductsElement = $('#viewed-products-js');
    viewedProductsElement.empty();
    // get products
    $.ajax({
        url: history_url,
        method: 'POST',
        data: {
            productIds: productHistory
        },
        success: function (response) {
            viewedProductsElement.html(response.html);
        },
        error: function () {
            viewedProductsElement.html('<p>Failed to load viewed products.</p>');
        }
    });
}

/**
 * 
 * @description scroll to target element with header height offset
 * 
 * @param {jQuery} targetElement target element to scroll to
 * @param {number} header_height header height in px
 */
function scrollToElement(targetElement, header_height) {
    const headerHeight = header_height || 60; // more than 50px
    const targetOffsetTop = targetElement.offset().top - headerHeight;
    $('html, body').animate({
        scrollTop: targetOffsetTop
    }, {
        duration: 300, // ms 
        easing: 'swing' //
    });
}

function renderSizeChart() {
    const sizes = Object.keys($size_charts);

    if (sizes.length === 1) {
        renderSizeChartSingle();
    } else {
        renderSizeChartMulti();
    }

    //tab
    const tab = ['<ul class="nav nav-tabs mb-4" id="sizeTabs" role="tablist">'];
    for (i = 0; i < sizes.length; i++) {
        const key = sizes[i]; // jacket, pants, etc.
        tab.push('<li class="nav-item" role="presentation">');
        tab.push(`<button class="nav-link ${i === 0 ? 'active' : ''}" id="${key}-tab" data-bs-toggle="tab" data-bs-target="#${key}" type="button">${key}</button>`);
        tab.push('</li>');
        // const size = $size_charts[key];
        // console.log(key);
        // console.log(size);
    }
    tab.push('</ul>');

    //content
    const content = ['<div class="tab-content" id="sizeTabsContent">'];
    for (i = 0; i < sizes.length; i++) {
        const key = sizes[i]; // jacket, pants, etc.
        const size = $size_charts[key];

        content.push(`<div class="table-responsive tab-pane fade ${i === 0 ? 'show active' : ''}" id="${key}" role="tabpanel" aria-labelledby="${key}-tab">`);
        content.push(renderTable(size));
        content.push('</div>');
        // console.log(key);
        // console.log(size);
    }
    content.push('</div>');

    //append tab and content
    $('#panelsStayOpen-sizeChart .accordion-body').append(tab.join(''));
    $('#panelsStayOpen-sizeChart .accordion-body').append(content.join(''));
}

function renderSizeChartMulti() {

}

function renderSizeChartSingle() {

}
// 通用渲染函数
function renderTable(data) {
    const table = ['<table class="table table-sm table-bordered table-striped size-table">'];
    const thead = ['<thead>'];
    const tbody = ['<tbody>'];

    // 获取所有属性名（去重）
    const attrNames = [];
    for (const size in data) {
        data[size].forEach(item => {
            if (!attrNames.includes(item.attr_name)) {
                attrNames.push(item.attr_name);
            }
        });
        break; // 只需第一个尺码即可获取完整属性
    }

    // 渲染表头
    thead.push('<tr>');
    thead.push('<th>Size</th>');
    attrNames.forEach(name => {
        thead.push(`<th>${name}</th>`);
    });
    thead.push('</tr>');

    // 渲染每一行
    tbody.push('');
    for (const size in data) {
        const row = ['<tr><td>' + size.toUpperCase() + '</td>'];
        const measurements = {};
        data[size].forEach(m => {
            measurements[m.attr_name] = `${m.inch}`;
        });
        attrNames.forEach(name => {
            row.push(`<td>${measurements[name] || '—'}</td>`);
        });
        tbody.push(row.join(''));
    }
    tbody.push('</tbody>');

    // 合并表格
    table.push(thead.join(''));
    table.push(tbody.join(''));
    table.push('</table>');

    return table.join('');
}

function renderSizeChartEle() {
    const sizes = Object.keys($size_charts);
    //content
    for (i = 0; i < sizes.length; i++) {
        const key = sizes[i]; // jacket, pants, etc.
        const size = $size_charts[key]; //data

        renderTableEle(size, key + 'Table' + default_size_unit, default_size_unit);
        renderTableEle(size, key + 'Table' + second_size_unit, second_size_unit);

        // console.log(key);
    }
}
function renderTableEle(data, tableId, system) {
    const $table = $(`#${tableId}`);
    const $thead = $table.find('thead tr');
    const $tbody = $table.find('tbody');

    const key = system.toLowerCase();

    // 获取所有属性名（去重）
    const attrNames = [];
    for (const size in data) {
        data[size].forEach(item => {
            if (!attrNames.includes(item.attr_name)) {
                attrNames.push(item.attr_name);
            }
        });
        break; // 只需第一个尺码即可获取完整属性
    }

    // 渲染表头
    $thead.empty().append('<th>Size</th>');
    attrNames.forEach(name => {
        $thead.append(`<th>${name}</th>`);
    });

    // 渲染每一行
    $tbody.empty();
    for (const size in data) {
        const row = ['<tr><td>' + size.toUpperCase() + '</td>'];
        const measurements = {};
        data[size].forEach(m => {
            measurements[m.attr_name] = `${m[key]}`;
        });
        attrNames.forEach(name => {
            row.push(`<td>${measurements[name] || '—'}</td>`);
        });
        row.push('</tr>');
        $tbody.append(row.join(''));
    }

}


// load product detail
function loadProductDetail(productInfo) {
    let rows = '';
    if (productInfo.spu_attr.length > 0) {
        for (let index = 0; index < productInfo.spu_attr.length; index++) {
            const detail = productInfo.spu_attr[index];
            const row = `
                        <tr>
                            <td>${detail.attr_name}</td>
                            <td>${detail.value_name}</td>
                        </tr>`;
            rows += row;
        }
    }
    if (productInfo.custom_attr.length > 0) {
        for (let index = 0; index < productInfo.custom_attr.length; index++) {
            const detail = productInfo.custom_attr[index];
            const tr = '<tr>';
            const td = `<td>${detail.attr_name}</td>`;
            let lists = '<td><ul>';
            for (let i = 0; i < detail.list.length; i++) {
                const value = detail.list[i];
                const listItem = `<li>${value.measurements_name}: ${value.value_with_unit}</li>`;
                lists += listItem;
            }
            lists += '</ul></td>';
            rows += tr + td + lists + '</tr>';
        }
    }
    //fill html
    $(".product_detail_img").attr("src", productInfo['image']);
    $(".product_detail_name").html(productInfo['name']);
    $(".product_detail_price").html(`${ecommerce_product.symbol}${productInfo['price']}`);
    $(".product_qty_val").html(productInfo['qty']);
    $(".product-options-js tbody").html(rows);
    // console.log(product_info);
    return;
}
/**
 * Use regular expressions to extract the foot and inch parts
 * @param {string} heightStr 
 * @returns 
 */
function parseHeight(heightStr) {
    const match = heightStr.match(/^(\d+)'?(\d*)"?$/);
    if (!match) {
        throw new Error("Invalid height format. Expected format like '5'6 or 5'6\"");
    }
    const feet = parseInt(match[1], 10) || 0;
    const inches = parseInt(match[2], 10) || 0;
    return {
        feet,
        inches
    };
}
/**
 * init product customize form
 * @param {string} relatedAttr 
 * @param {string} sizeSystem  imperial or metric
 * @param {string} attrValue 
 */
function initCustomize(relatedAttr, sizeSystem, attrValue) {
    let sizeUnit;
    if (sizeSystem === 'imperial') {
        sizeUnit = 'inch';
    } else {
        sizeUnit = 'cm';
    }
    // console.log( $size_charts[relatedAttr][attrValue]);
    let selectedAttr = {};
    let pointCode;
    for (let i = 0; i < $size_charts[relatedAttr][attrValue].length; i++) {
        pointCode = $size_charts[relatedAttr][attrValue][i]['point_code'];
        if (pointCode === 'height') {
            if (sizeUnit === 'inch') {
                // translate ft to feet and inches
                const {
                    feet,
                    inches
                } = parseHeight($size_charts[relatedAttr][attrValue][i]['ft']);
                $('#feet').val(feet);
                $('#inches').val(inches);
            } else {
                $('#cm').val($size_charts[relatedAttr][attrValue][i][sizeUnit]);
            }
        } else {
            selectedAttr[pointCode] = $size_charts[relatedAttr][attrValue][i][sizeUnit];
        }
    }


    // 渲染表单
    const $inputs = $(`#${relatedAttr}-custom-form-container input.custom-input-js`);
    $inputs.each(function () {
        const name = $(this).attr('name');
        if (selectedAttr[name]) {
            $(this).val(selectedAttr[name]);
        }
    });
}
/**
 * Calculate the product price
 * @param {object} productInfo - product_info object
 * @returns {number}
 */
function calculateProductPrice(productInfo) {
    let totalPrice = parseFloat(ecommerce_product.price);
    // add sku attr price
    if (productInfo['spu_attr'] && typeof productInfo['spu_attr'] === 'object' && productInfo['spu_attr'] !== null) {
        for (let key in productInfo['spu_attr']) {
            if (productInfo['spu_attr'][key].value_price > 0) {
                totalPrice += parseFloat(productInfo['spu_attr'][key].value_price);
            }
        }
    }
    // add custom attr price
    if (productInfo['custom_attr'] && typeof productInfo['custom_attr'] === 'object' && productInfo['custom_attr'] !== null) {
        for (let key in productInfo['custom_attr']) {
            if (productInfo['custom_attr'][key].value_price > 0) {
                totalPrice += parseFloat(productInfo['custom_attr'][key].value_price);
            }
        }
    }
    totalPrice = totalPrice.toFixed(2);
    product_info.price = totalPrice;
    return totalPrice;
}

/**
 * 
 * check custom number input value is valid
 * @param {jQuery} $input input element
 * @return {boolean}
 */
function checkCustomInfo($input) {
    const value = $input.val();
    const required = $input.prop('required');
    if (required && (value === '' || value === 0)) {
        return false;
    }
    const min = parseFloat($input.attr('min'));
    if (!isNaN(min) && value < min) {
        return false;
    }
    const max = parseFloat($input.attr('max'));
    if (!isNaN(max) && value > max) {
        return false;
    }
    return true;
}

function getSpuAttrValueInfo(attr, attrValue) {
    const attrValueInfo = {
        attr_code: attr,
        value_code: attrValue,
        attr_name: $sku_map[attr].attr_name,
        value_name: $sku_map[attr]['values'][attrValue].value_name,
        value_price: $sku_map[attr]['values'][attrValue].value_price,
        base_value_price: $sku_map[attr]['values'][attrValue].base_value_price
    };
    return attrValueInfo;
}

function getCustomAttrValueInfo(attr, attrValue, value_price, base_value_price) {
    let value_code, value_name;
    if (!attrValue) {
        value_code = '';
        value_name = '';
    } else {
        value_code = attrValue;
        value_name = $sku_map[attr]['values'][attrValue].value_name;
    }
    const attrValueInfo = {
        attr_code: attr,
        value_code: value_code,
        attr_name: $sku_map[attr].attr_name,
        value_name: value_name,
        value_price: value_price,
        base_value_price: base_value_price
    };
    return attrValueInfo;
}
/**
 * set product attr
 * Modifies the global product_info object
 * 
 * @param {string} attr - attr code
 * @param {string} attrValue - attr value code
 * @param {object} options - options object 
 * @param {string} options.attrImg - attr image code
 * @param {string} options.imgSrc - image src
 * 
 * @access product_info 
 * @return {void}
 */
function setProductSpuAttr(attr, attrValue, options) {
    const attrValueInfo = getSpuAttrValueInfo(attr, attrValue);
    const newSpuAttr = {
        ...product_info.spu_attr,
        [attr]: attrValueInfo
    };
    // console.log('newSpuAttr', newSpuAttr);
    //delete product_info.custom_attr[attr];
    if (product_info.custom_attr && product_info.custom_attr.hasOwnProperty(attr)) {
        delete product_info.custom_attr[attr];
    }
    const updates = {
        spu_attr: newSpuAttr
    };
    if (options && options.attrImg) {
        updates.image = options.imgSrc; // preview only
    }
    updateProductInfo(updates);
}
/**
 * set product custom attr
 * Modifies the global product_info object
 *  
 * @param {string} attr - attr code
 * @param {string} attrValue - attr value code
 * @param {number} value_price - attr value price
 * @param {number} base_value_price - attr value base price  USD
 * @return {void}
 */
function setProductCustomAttr(attr, attrValue, value_price, base_value_price) {
    const attrValueInfo = getCustomAttrValueInfo(attr, attrValue, value_price, base_value_price);
    const newCustomAttr = {
        ...product_info.custom_attr,
        [attr]: attrValueInfo
    };
    // delete product_info.spu_attr[attr];
    if (product_info.spu_attr && product_info.spu_attr.hasOwnProperty(attr)) {
        delete product_info.spu_attr[attr];
    }
    updateProductInfo({
        custom_attr: newCustomAttr
    });
}
/**
 * switch to spu attr when custom checkbox is not checked
 * Modifies the global product_info object
 * 
 * @param {string} attr - attr code
 * @param {string} attrValue - attr value code
 * @return {void}
 */
function switchToSpuAttr(attr, attrValue) {
    if (product_info.custom_attr && product_info.custom_attr.hasOwnProperty(attr)) {
        delete product_info.custom_attr[attr];
    }
    if (attrValue) {
        setProductSpuAttr(attr, attrValue);
    }
}
/**
 * set product image
 * Modifies the global product_info object
 * 
 * @param {string} img_src - image src
 * @return {void}
 */
function setProductImage(img_src) {
    var filename = img_src.split('/').splice(-1).toString();
    product_info['image'] = img_src; // preview only
    updateProductInfo({
        image: img_src
    });
}

/**
 * 
 * Init the global product_info object
 * 
 * @return {void}
 */
function initProductAttr() {
    product_info['name'] = ecommerce_product.name;
    product_info['price'] = ecommerce_product.price;
    product_info['image'] = $('#product-main-image-js').val(); // preview only
    product_info['product_id'] = ecommerce_product.id;
    product_info['spu'] = ecommerce_product.spu;
    product_info['qty'] = 1;
    product_info['spu_attr'] = {};
    product_info['custom_attr'] = {};
    for (let index = 0; index < $selected_sku_list.length; index++) {
        const attr = $selected_sku_list[index].attr_code;
        const attrValue = $selected_sku_list[index].value_code;
        setProductSpuAttr(attr, attrValue);
    }
}

function getFilenameFromImgSrc(imgSrc) {
    const filename = imgSrc.split('/').splice(-1).toString();
    return filename;
}
/**
 * get index by img src
 * @param {string} imgSrc 
 * @returns 
 */
function getIndexByImgSrc(imgSrc) {
    let index = -1;
    $('.swiper-slide img').each(function (i, element) {
        const currentImgSrc = $(this).data('src');
        const filename = getFilenameFromImgSrc(currentImgSrc);
        // console.log('filename', filename);
        if (filename === getFilenameFromImgSrc(imgSrc)) {
            index = i;
            return;
        }
    });
    return index;
}
function goToSlide(index, speed = null) {
    swiper.slideTo(index, speed, false);
}

// ====== 2. 统一状态更新入口 ======
function updateProductInfo(updates) {
    const keys = Object.keys(updates);
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (key === 'image') {
            const imgSrc = updates[key];
            const index = getIndexByImgSrc(imgSrc);
            // console.log('index', index);
            goToSlide(index);
        }
    }
    // console.log('updateProductInfo', keys);
    Object.assign(product_info, updates);
    // 触发 UI 更新
    $(document).trigger('product:updated', [product_info]);
}
//渲染 UI 的函数
function renderProductUI(info) {
    const price = calculateProductPrice(info);
    // console.log('renderProductUI', info);
    $('#total-price').text(`${ecommerce_product.symbol}${price}`);
}

function showAttrErrorMessage(attr) {
    $(`#${attr}-error-message`).addClass('d-block');
}

function hideAttrErrorMessage(attr) {
    $(`#${attr}-error-message`).removeClass('d-block');
}

// check all required attrs are selected
function isAllRequiredAttrsSelected(requiredAttrs = $spu_attr) {
    return requiredAttrs.every(attr => {
        return product_info.spu_attr[attr] || product_info.custom_attr[attr];
    });
}

/**
 * 
 * get product info for cart
 * var $spu_attr = ["color","size"];
 * 
 * @return {object} result
 */
function getProductInfo() {
    var result = {
        success: false,
        data: {
            name: product_info.name,
            product_id: product_info.product_id,
            spu: product_info.spu,
            qty: product_info.qty,
            image: product_info.image,
            price: product_info.price,

            spu_attr: [],
            size_chart: {},
            custom_attr: [],

        },
        errors: []
    }

    var $selected_size_charts = {};
    for (var index = 0; index < $spu_attr.length; index++) {
        var errror = {
            type: null, //spu_attr or custom_attr
            key: null,
            jQueryElement: null,
        }
        var attr = $spu_attr[index];

        if (product_info.spu_attr && typeof product_info.spu_attr === 'object' && product_info.spu_attr !== null &&
            product_info.spu_attr[attr] && typeof product_info.spu_attr[attr] === 'object' && product_info.spu_attr[attr] !== null) {
            //spu attribute
            result.data.spu_attr.push(product_info.spu_attr[attr]);

            var value_code = product_info.spu_attr[attr].value_code;
            if ($size_charts.hasOwnProperty(attr) && $size_charts[attr].hasOwnProperty(value_code)) {
                $selected_size_charts[attr] = $size_charts[attr][value_code];
            }

        } else if (product_info.custom_attr && typeof product_info.custom_attr === 'object' && product_info.custom_attr !== null &&
            product_info.custom_attr[attr] && typeof product_info.custom_attr[attr] === 'object' && product_info.custom_attr[attr] !== null) {

            //additional custom attribute
            product_info.custom_attr[attr].list = [];
            cusResult = collectCustomMeasurements(attr);
            if (cusResult.errors.length > 0) {
                errror.type = 'custom_attr';
                errror.jQueryElement = cusResult.errors[0];

                result.errors.push(errror);
                return result;
            } else {
                cusResult.data.forEach(function (item) {
                    product_info.custom_attr[attr].list.push(item);
                });
            }

            result.data.custom_attr.push(product_info.custom_attr[attr]);
        } else {
            // isVvalid false
            errror.type = 'spu_attr';
            errror.key = attr;
            errror.jQueryElement = $(`#${attr}`);

            result.errors.push(errror);
            return result;
        }
    }

    if (Object.keys($selected_size_charts).length > 0) {
        product_info.size_chart = $selected_size_charts;

        result.data.size_chart = product_info.size_chart;
    }

    result.success = true;
    return result;
}

function renderErrorMsg(err) {
    scrollToElement(err.jQueryElement);
    if (err.type === 'spu_attr') {
        showAttrErrorMessage(err.key);
    } else if (err.type === 'custom_attr') {
        err.jQueryElement.addClass('is-invalid');
        err.jQueryElement.focus();
    }
}

function collectCustomMeasurements(attr) {
    var result = {
        success: true,
        data: [],
        errors: []
    };

    var $container = $('#' + attr + '-custom-form-container');

    // var unitSystem = $('#' + attr + '-unit-system').val(); // imperial or metric 
    // loop all custom input group
    $container.find('div.input-group').each(function () {
        var $group = $(this);
        // only visible fields
        if (!$group.is(':visible')) {
            return true; // = continue
        }

        // get first input element, because height has multiple inputs
        var $input = $group.find('input').first();
        if (!checkCustomInfo($input)) {
            // $input.addClass('is-invalid');
            result.success = false;
            result.errors.push($input);
            return false; // = break 
        }

        var name = $input.attr('name');

        var $labelSpan = $group.find('.measurements-label-js');
        var measurements_name = $labelSpan.length ? $labelSpan.text().trim() : 'Unknown';

        if (name === 'feet') {
            var feet = $input.val();
            var $inchesEle = $group.find('#inches');
            if (!checkCustomInfo($inchesEle)) {
                // $inchesEle.addClass('is-invalid');
                result.success = false;
                result.errors.push($inchesEle);
                return false; // break 
            }
            var inches = $inchesEle.val();
            if (feet !== '' && inches !== '') {
                var measurements_code = $group.data('measurements-code');
                result.data.push({
                    measurements_code: measurements_code,
                    measurements_name: measurements_name,
                    value_with_unit: feet + '\'' + inches + '"',
                });
            }
        } else { //普通输入框
            var value = $input.val();
            if (value !== '') {
                var measurements_code = name;
                var $unitSpan = $group.find('.custom-input-unit-js');
                var unit = $unitSpan.length ? $unitSpan.text().trim() : '';
                result.data.push({
                    measurements_code: measurements_code,
                    measurements_name: measurements_name,
                    value_with_unit: value + ' ' + unit,
                });
            }

        }
    });
    return result;
}
/**
 * share 
 *
 * @return void
 */
function init_share() {
    //init 
    var ogUrl = $('meta[property="og:url"]').attr('content');
    var ogTitle = $('meta[property="og:title"]').attr('content');
    var elems = $('[data-sharer]');
    // var metaOgUrl = document.querySelector('meta[property="og:url"]');
    // var ogUrl = metaOgUrl ? metaOgUrl.getAttribute('content') : null;
    for (var i = 0; i < elems.length; i++) {
        elems[i].setAttribute('data-url', ogUrl);
        elems[i].setAttribute('data-title', ogTitle);
    }
    $('#affiliate-link-url-input-js').val(ogUrl);
}
// 点赞：节流 1s 不推荐
function handleFavoriteClickThrottle(e) {
    e.preventDefault();
    var self = $(this); //// 注意：this 指向被点击的元素
    $.ajax({
        url: productFavoriteUrl,
        method: 'GET',
        data: {
            spu: ecommerce_product.spu,
        },
        dataType: "json",
        timeout: 5000
    })
        .done(function (response) {
            loginStatus = response.loginStatus;
            if (!loginStatus) {
                window.location.href = memberLoginUrl;
                return;
            }
            // update UI
            if (response.favoriteStatus) {
                self.addClass("text-danger");
            } else {
                self.removeClass("text-danger");
            }
            // show Toast
            showToast(response.content, '#toast-js');
        })
        .fail(function () {
            alert('Operation failed. Please try again later.');
        })
        .always(function () {

        });
}
// 禁用按钮 + 即时视觉反馈（推荐 ✅）
function handleFavoriteClickA(e) {
    e.preventDefault(); // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
    var self = $(this); //// 注意：this 指向被点击的元素

    // 🔒 防重：如果正在请求，直接返回
    if (self.prop('disabled')) {
        return;
    }
    // 启用加载状态
    self.prop('disabled', true); // 禁用点击
    // 可选：添加 loading 样式，例如淡出颜色
    self.addClass('opacity-50'); // Bootstrap class

    $.ajax({
        url: productFavoriteUrl,
        method: 'GET',
        data: {
            spu: ecommerce_product.spu,
        },
        dataType: "json",
        timeout: 5000
    })
        .done(function (response) {
            loginStatus = response.loginStatus;
            if (!loginStatus) {
                window.location.href = memberLoginUrl;
                return;
            }
            // update UI
            if (response.favoriteStatus) {
                self.addClass("text-danger");
            } else {
                self.removeClass("text-danger");
            }
            // show Toast
            showToast(response.content, '#toast-js');
        })
        .fail(function () {
            alert('Operation failed. Please try again later.');
        })
        .always(function () {
            self.prop('disabled', false);
            self.removeClass('opacity-50'); // Bootstrap class
        });
}
//乐观更新（Optimistic Update）+ 回滚（高级）
function handleFavoriteClickB(e) {
    e.preventDefault(); // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
    var self = $(this); //// 注意：this 指向被点击的元素
    // 立即切换 UI
    // const wasFavorited = self.hasClass('text-danger');
    self.toggleClass('text-danger');

    $.ajax({
        url: productFavoriteUrl,
        method: 'GET',
        data: {
            spu: ecommerce_product.spu,
        },
        dataType: "json",
        timeout: 5000
    })
        .done(function (response) {
            loginStatus = response.loginStatus;
            if (!loginStatus) {
                window.location.href = memberLoginUrl;
                return;
            }
            // update UI
            if (response.favoriteStatus) {
                self.addClass("text-danger");
            } else {
                self.removeClass("text-danger");
            }
            // show Toast
            showToast(response.content, '#toast-js');
        })
        .fail(function () {
            // 失败则回滚
            self.toggleClass('text-danger');
            showToast('Operation failed', '#toast-js');
        })
        .always(function () {

        });
}
function checkRemark(customer_remark) {
    if (customer_remark.length > order_remark_max_length) {
        return false;
    }
    return true;
}

function handleAddToCartClick(e) {
    e.preventDefault(); // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡

    var self = $(this); // 注意：this 指向被点击的元素
    // 🔒 防重：如果正在请求，直接返回
    if (self.prop('disabled')) {
        return;
    }
    // 启用加载状态
    self.prop('disabled', true); // 禁用点击
    // 可选：添加 loading 样式，例如淡出颜色
    self.addClass('opacity-50'); // Bootstrap class

    var result = getProductInfo();
    if (!result.success) {
        self.prop('disabled', false);
        self.removeClass('opacity-50'); // Bootstrap class
        showToast('Failed to obtain product information. Please refresh and try again.', '#toast-js');
        return;
    }
    var remark = $("#customer-remark-js").val();
    if (!checkRemark(remark)) {
        self.prop('disabled', false);
        self.removeClass('opacity-50'); // Bootstrap class
        showToast(order_remark_message, '#toast-js');
    }
    var data_params = result.data;
    data_params['customer_remark'] = remark;

    $.ajax({
        async: true,
        timeout: 6000,
        dataType: 'json',
        type: 'post',
        data: JSON.stringify(data_params),
        url: addToCartUrl,
        success: function (response) {
            if (response.status == 'success') {
                // update UI
                var items_count = response.items_count;
                $(".cart-item-count-js").text(items_count);

                // close modal
                var $modal = $('#productBottomSheet');
                var modalInstance = bootstrap.Modal.getOrCreateInstance($modal[0]);
                modalInstance.hide();
            }
            // show Toast
            showToast(response.message, '#toast-js');
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            let message = 'Operation failed. Please try again later.';
            if (textStatus === 'timeout') {
                message = 'Request timed out. Please check your network and try again.';
            } else if (XMLHttpRequest.status === 0) {
                message = 'Network connection failed. Please check your internet.';
            } else if (XMLHttpRequest.status === 401) {
                window.location.href = memberLoginUrl;
                return;
            } else if (XMLHttpRequest.status >= 500) {
                message = 'Server is busy. Please try again later.';
            } else if (XMLHttpRequest.status >= 400) {
                message = 'Invalid request. Please try again.';
            } else {
                console.error('AJAX Error:', textStatus, errorThrown);
            }
            console.log(message);
        },
        complete: function () {
            self.prop('disabled', false);
            self.removeClass('opacity-50'); // Bootstrap class
        }
    });
}

function paypalBuynowCreatePayment() {
    var FUNDING_SOURCES = [
        paypal.FUNDING.PAYPAL,
    ];
    FUNDING_SOURCES.forEach(function (fundingSource) {
        var button = paypal.Buttons({
            fundingSource: fundingSource,
            style: {
                // height: 40,
                // color: 'black',
                // tagline: true,
                label: 'buynow'
            },
            onClick: function () {
                var remark = $("#customer-remark-js").val();
                if (!checkRemark(remark)) {
                    self.prop('disabled', false);
                    self.removeClass('opacity-50'); // Bootstrap class
                    showToast(order_remark_message, '#toast-js');
                    return false;
                }
                return true;
            },
            createOrder: (data, actions) => {

                var result = getProductInfo();
                var data_params = result.data;
                data_params['customer_remark'] = $("#customer-remark-js").val();

                return fetch(paypalCreateOrderUrl, {
                    method: "post",
                    body: JSON.stringify(data_params),
                    headers: {
                        'content-type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then((order) => {
                        if (order.id == '-1') {
                            // alert(order.message);
                            throw new Error(order.message);
                            // return false;
                        }
                        return order.id
                    })
                    .catch((error) => {
                        alert(error);
                        // console.log('There has been a problem with your fetch operation:', error);
                    });
            },
            onApprove: (data, actions) => {
                return fetch(paypalCaptureOrderUrl, {
                    method: "post",
                    body: JSON.stringify(data),
                    headers: {
                        'content-type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok!');
                        }
                        return response.json();
                    })
                    .then((orderData) => {
                        if (orderData.order_sn == '-1') {
                            if (orderData.error_issue === 'INSTRUMENT_DECLINED') {
                                alert(orderData.message);
                                return actions.restart();
                            } else {
                                throw new Error(orderData.message);
                            }
                        }
                        // const transaction = orderData.purchase_units[0].payments.captures[0];
                        const order_sn = orderData.order_sn;
                        actions.redirect(`${paypalFinishOrderUrl}?order_sn=${order_sn}`);
                    })
                    .catch((error) => {
                        alert(error);
                        // console.log('There has been a problem with your fetch operation:', error);
                    });
            }
            // ,
            // onError: (error) => {
            //     // alert(error);
            // }

        });
        // Check if the button is eligible
        if (button.isEligible()) {
            // Render the standalone button for that funding source
            button.render('#product-paypal-container-js')
        }

    });
}



// $(document).ready(function() {
$(function () {

    //////////////////// init ////////////////////
    // lazyload();
    const lazyLoadInstance = new LazyLoad({
        // elements_selector: ".lazy"
    });
    //监听数据变化，自动刷新 UI
    $(document).on('product:updated', (e, info) => {
        renderProductUI(info);
    });
    // swiper https://v8.swiperjs.com/swiper-api#parameters
    swiper = new Swiper('.swiper', {
        autoplay: {
            delay: 5000,
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction',
            renderFraction: function (currentClass, totalClass) {
                return '<span class="swiper-pagination-current">' + currentClass + '</span> / <span class="swiper-pagination-total">' + totalClass + '</span>';
            },
        },
    });

    //1 product info for cat
    initProductAttr();
    //2 get brwosing history
    fetchAndDisplayViewedProducts(historyUrl);
    // save brwosing history
    saveProductToLocalStorage(ecommerce_product.spu);

    //3 more product dropload
    if (products_more_count > products_more_count_min) {
        // 方案一：infiniteScroll
        //////////////////infiniteScroll start
        // search ajax 无限滚动 禁用history
        // product load more ajax 无限滚动 禁用history
        // category append 无限滚动 启用用history

        // 移动端专用无限滚动配置 - 支持 AJAX
        $('#product-list-more').infiniteScroll({
            // 路径配置
            path: function () {
                // console.log(url);
                if (this.loadCount < products_more_max_page - 1) { // 限制加载次数
                    return UrlUtils.mergeParams(productsMoreUrl, {
                        p: this.loadCount + 1 // 从第一页开始
                    });
                }
            },
            // append: '.col-6.col-sm-4.col-md-3.flex-shrink-0',
            // // 历史记录管理（对SEO友好）
            // history: 'replace', // push/replace
            // historyTitle: false, // 不修改页面标题

            // 禁用自动追加，我们手动处理 AJAX 响应
            append: false,
            history: false,
            // 设置响应体为 JSON 格式
            responseBody: 'json', // 默认为 'text'
            // AJAX 请求配置
            fetchOptions: {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            },
            // 最后一页检查 https://infinite-scroll.com/options#checklastpage
            checkLastPage: true,
            // 滚动阈值
            scrollThreshold: 100, // 滚动距离 100px

            // 状态显示
            status: '.page-load-status', // 显示加载状态

            // 禁用自动加载 https://infinite-scroll.com/options#loadonscroll
            // loadOnScroll: false, 
            // 预填充 https://infinite-scroll.com/options#prefill 
            prefill: false,
            // 调试模式
            debug: false,
        });

        // load处理 AJAX 响应 https://infinite-scroll.com/events#load
        $('#product-list-more').on('load.infiniteScroll', function (event, body, path) {
            // 处理从 AJAX 返回的 JSON 数据
            if (body && body.html && body.html.trim() !== '') { // 如果有商品数据
                // 手动追加 HTML 内容
                $(this).append(body.html);
                // 更新懒加载
                if (lazyLoadInstance) {
                    lazyLoadInstance.update();
                }
                // console.log('Loaded page via AJAX:', path);
            }
        });
        // 错误处理
        $('#product-list-more').on('error.infiniteScroll', function (event, error, path) {
            // console.error('Failed to load page via AJAX:', path, error);
            alert('Failed to load more products.');
        });

        // append事件处理 https://infinite-scroll.com/events#append
        $('#product-list-more').on('append.infiniteScroll', function (event, body, path, items) {
            // console.log(`Appended ${items.length} items from ${path}`);
        });
        // 最后一页处理
        $('#product-list-more').on('last.infiniteScroll', function () {
            // console.log('Reached the last page via AJAX');
        });
        //////////////////infiniteScroll end

        // // 方案二：自定义。Intersection Observer
        // // is loading (prevent repeat request)
        // let isLoading = false;
        // let morePageNum = 1;

        // function loadMoreProducts() {
        //     if (isLoading) return;
        //     isLoading = true;
        //     // display loading more (optional)
        //     $('#product-list-more').append('<div id="loading-more" class="col-12 text-center my-3">Loading...</div>');
        //     $.ajax({
        //         url: productsMoreUrl,
        //         method: 'GET',
        //         data: {
        //             p: morePageNum
        //         },
        //         dataType: "json",
        //         timeout: 5000
        //     })
        //         .done(function (response) {
        //             if (response.html && response.html.trim() !== '') { //除非你有 CSS 动画或布局延迟，否则 500ms 是多余的。
        //                 $('#product-list-more').append(response.html);
        //                 lazyLoadInstance.update();
        //                 morePageNum = response.next_page;
        //             } else {
        //                 observer.unobserve(document.getElementById('load-trigger'));
        //                 $('#product-list-more').append('<div class="col-12 text-center text-muted">No more products.</div>');
        //             }
        //         })
        //         .fail(function () {
        //             alert('Failed to load more products.');
        //         })
        //         .always(function () {
        //             $('#loading-more').remove();
        //             isLoading = false;
        //         });
        // }
        // // 👇 关键：用 Lodash 节流（例如每 1000ms 最多触发一次）
        // const throttledLoad = _.throttle(function () {
        //     if (!isLoading) {
        //         loadMoreProducts();
        //     }
        // }, 1000, {
        //     trailing: true
        // });

        // // create Intersection Observer 
        // const observer = new IntersectionObserver((entries) => {
        //     if (entries[0].isIntersecting) {
        //         throttledLoad(); // 👈 调用节流函数
        //     }
        // }, {
        //     rootMargin: '100px' // enter 100px before the bottom of the viewport
        // });
        // // listener for load trigger
        // if (document.getElementById('load-trigger')) {
        //     observer.observe(document.getElementById('load-trigger'));
        // }
    }
    // 监听尺码表手风琴的展开事件
    $('#panelsStayOpen-sizeChart').on('show.bs.collapse', function () {
        // 只在第一次展开时渲染数据
        if (!$(this).data('rendered')) {
            renderSizeChartEle();
            $(this).data('rendered', true);
        }
    });

    let currentUnit = default_size_unit;

    function switchSizeUnit(unit) {
        currentUnit = unit;
        // 获取当前激活的 tab（Jacket 或 Pant）
        const activeTabContentPrefix = $('#sizeTabs .nav-link.active').data('content-prefix');
        const contentId = activeTabContentPrefix + unit;

        // 使用 Bootstrap 的 tab('show') 方法激活对应面板
        $('#' + contentId).addClass('show active').siblings('.tab-pane').removeClass('show active');

        // 更新按钮样式
        if (unit === default_size_unit) {
            $('#switchToDefault-js').addClass('btn-danger').removeClass('btn-secondary');
            $('#switchToSecond-js').addClass('btn-secondary').removeClass('btn-danger');
        } else {
            $('#switchToSecond-js').addClass('btn-danger').removeClass('btn-secondary');
            $('#switchToDefault-js').addClass('btn-secondary').removeClass('btn-danger');
        }
    }
    // 绑定切换按钮点击事件
    $('#switchToDefault-js').on('click', function () {
        switchSizeUnit(default_size_unit);
    });
    $('#switchToSecond-js').on('click', function () {
        switchSizeUnit(second_size_unit);
    });
    // 【可选】当用户切换 Jacket/Pant Tab 时，自动同步到当前单位
    $('#sizeTabs .nav-link').on('shown.bs.tab', function () {
        switchSizeUnit(currentUnit);
    });
    // ///////////////event/////////////////////

    //affiliate-link-url-copy-js
    $('#affiliate-link-url-copy-js').on('click', function (e) {
        e.preventDefault();
        var $this = $(this);
        $('#affiliate-link-url-input-js').select();
        document.execCommand('copy'); // copy
        $this.find('.affiliate-link-url-copy-label-js').addClass('d-none');
        $this.find('.affiliate-link-url-copy-label-copied-js').removeClass('d-none');
        setTimeout(function () {
            $this.find('.affiliate-link-url-copy-label-js').removeClass('d-none');
            $this.find('.affiliate-link-url-copy-label-copied-js').addClass('d-none');
        }, 2000)
    });

    ////////////////////////////////
    // attr value click
    $(".product-info-attr-js").on("click", ".attr-value-js button", function (e) {
        e.preventDefault();
        const self = $(this);
        const $fieldset = self.closest('fieldset');
        const attr = $fieldset.attr('id'); // = size or color
        const attrValue = self.data('attr-value'); // = us6 or red selected

        //1. basic ui change
        //1.1 selected style
        self.closest('div').find('button').removeClass('border-danger'); // remove all border-danger
        self.removeClass('border-light'); //remove myself border-light
        self.addClass('border-danger'); // add border-danger
        //1.2 hide error msg
        hideAttrErrorMessage(attr);
        //1.3 show selected attr value name
        $fieldset.find('.product-selected-attr-value-js')
            .data('value', attrValue)
            .data('value-for-restore', attrValue) // for restore after click custom size
            // .attr('data-value', attrValue) //test
            // .attr('data-value-for-restore', attrValue) // test
            .text($sku_map[attr]['values'][attrValue].value_name);

        //2. update product spu attr change event
        const attrHasPrice = $sku_map[attr].attr_has_price;
        // img attribute
        const attrImg = self.data('attr-img');
        const options = {
            attrHasPrice: attrHasPrice,
            attrImg: attrImg,
        }
        if (attrImg === 1) {
            var img_src = self.find('img').attr('src');
            options.imgSrc = img_src;
            // setProductImage(img_src);
        }
        setProductSpuAttr(attr, attrValue, options);

        // display size chart
        const showSizeChart = $sku_map[attr].show_size_value_chart;
        if (showSizeChart === 1) { // .data() int
            const $chartContainer = $fieldset.find('.product-selected-chart-js');
            const $chartBody = $chartContainer.find('tbody');
            if ($size_charts[attr][attrValue]) {
                let rows = '';
                $.each($size_charts[attr][attrValue], function (index, detail) {
                    const imperialValue = detail.ft ? detail.ft : (detail.inch ? detail.inch + ' in' : '');
                    const row = `
                    <tr>
                        <td>${detail.attr_name}</td>
                        <td>${imperialValue}</td>
                        <td>${detail.cm} cm</td>
                    </tr>`;
                    rows += row;
                });
                $chartBody.html(rows);
                $chartContainer.removeClass('d-none');
            }
        }
        //custom size
        const showSizeCustom = $sku_map[attr].show_size_custom;
        if (showSizeCustom === 1) {
            const $customCheckbox = $fieldset.find('.custom-toggle-checkbox-js');
            // if custom size is checked, then uncheck it
            if ($customCheckbox.is(':checked')) {
                $customCheckbox.prop('checked', false).trigger('change');
            }
        }

        // // update product price
        // if (attrHasPrice === 1) {
        //     calculateProductPrice();
        // }
    });

    // custom checkbox
    $('.product-info-attr-js').on('change', '.custom-toggle-checkbox-js', function () {
        const self = $(this);
        const customPrice = self.data('custom_price');
        const baseCustomPrice = self.data('base-custom-price');

        const $fieldset = self.closest('fieldset');

        // switch custom form display
        const targetFormId = self.attr('aria-controls');
        const isChecked = self.is(':checked');
        $('#' + targetFormId)
            .toggleClass('d-none', !isChecked)
            .attr('aria-hidden', !isChecked);
        self.attr('aria-expanded', isChecked);

        // related attr and value
        const relatedAttr = $fieldset.attr('id');
        const relatedAttrValue = $fieldset.find('.product-selected-attr-value-js').data('value-for-restore');
        // console.log(relatedAttr, relatedAttrValue);

        if (isChecked) {
            // related attr value hide
            $fieldset.find('.d-flex button').removeClass('border-danger');
            $fieldset.find('.product-selected-attr-value-js')
                .data('value', '')
                // .attr('data-value', '') // test
                .text('');
            // hide error message
            hideAttrErrorMessage(relatedAttr);
            // init custom size
            if (relatedAttrValue) {
                const size_unit = $('#' + targetFormId).find('.unit-selector-js').val();
                // console.log(size_unit);
                initCustomize(relatedAttr, size_unit, relatedAttrValue);
            }
            // size chart hide
            $fieldset.find('.product-selected-chart-js').addClass('d-none');

            setProductCustomAttr(relatedAttr, relatedAttrValue, customPrice, baseCustomPrice);

        } else {
            // size show
            $fieldset.find('.d-flex button').each(function () {
                if ($(this).data('attr-value') == relatedAttrValue) {
                    $(this).removeClass('border-light');
                    $(this).addClass('border-danger');
                }
            });
            if (relatedAttrValue) {
                $fieldset.find('.product-selected-attr-value-js')
                    .data('value', relatedAttrValue)
                    .data('value-for-restore', relatedAttrValue) // for restore after click custom size

                    // .attr('data-value', relatedAttrValue) // test
                    // .attr('data-value-for-restore', relatedAttrValue) // test

                    .text($sku_map[relatedAttr]['values'][relatedAttrValue].value_name);
            }
            // size chart show
            $fieldset.find('.product-selected-chart-js').removeClass('d-none');

            switchToSpuAttr(relatedAttr, relatedAttrValue);
        }

        // console.log(product_info);
        // // update product price
        // calculateProductPrice();
    });
    //size unit change
    $('.product-info-attr-js').on('change', '.unit-selector-js', function () {
        const $this = $(this);
        const sizeUnit = $this.val();

        const $fieldset = $this.closest('fieldset');
        // related attr and value
        const relatedAttr = $fieldset.attr('id');
        const relatedAttrValue = $fieldset.find('.product-selected-attr-value-js').data('value-for-restore');

        // 1 just for height and weight
        const imperialHeight = $('#imperial-height'); //
        const metricHeight = $('#metric-height');
        const weightUnitLabel = $('#weight-unit-label');
        // 2 just for common units
        const $cus_units = $fieldset.find('.custom-input-unit-js');
        if (sizeUnit === 'imperial') {
            if (imperialHeight) {
                imperialHeight.removeClass('d-none');
                metricHeight.addClass('d-none');
                weightUnitLabel.text('lb');
            }
            $cus_units.each(function () {
                $(this).text('in');
            });
        } else {
            if (imperialHeight) {
                imperialHeight.addClass('d-none');
                metricHeight.removeClass('d-none');
                weightUnitLabel.text('kg');
            }
            $cus_units.each(function () {
                $(this).text('cm');
            });
        }
        if (relatedAttrValue) {
            initCustomize(relatedAttr, sizeUnit, relatedAttrValue);
        }
    });
    //custom input check
    $('.product-info-attr-js').on('focus', '.custom-form-container-js input', function () {
        $(this).removeClass("is-invalid");
    }).on('blur', '.custom-form-container-js input', function () {
        if (!checkCustomInfo($(this))) {
            $(this).addClass("is-invalid");
        }
    });
    // qty minus ,plus
    $("#qty-minus-js").click(function () {
        let v = parseInt($("#quantity").val());
        v -= 1;
        if (v <= 1) {
            v = 1;
        }
        $("#quantity").val(v);
        product_info.qty = v;
        if (v <= 1) {
            $(this).addClass("disabled");
        } else {
            $(this).removeClass("disabled");
        }
    });
    // qty plus
    $("#qty-plus-js").click(function () {
        let v = parseInt($("#quantity").val());
        v += 1;
        if (v >= 100) {
            v = 100;
        }
        $("#quantity").val(v);
        product_info.qty = v;
        $("#qty-minus-js").removeClass("disabled");
    });

    //show share bar
    $("#product-detail-icon-share-js").click(function (e) {
        e.preventDefault();
        init_share();
        // show modal
        var $modal = $('#shareBottomSheet');
        var modalInstance = new bootstrap.Modal($modal[0]);
        modalInstance.show();
    });
    // when shareBottomSheet modal is hidden
    $('#shareBottomSheet').on('hidden.bs.modal', function () {
        // var triggerSource = $(this).data('trigger-source');
        // console.log('this modal is triggered by:', triggerSource, 'and it is hidden');
        // // remove trigger source
        // $(this).removeData('trigger-source');
    });

    // custom measurement helper
    $(".product-info-attr-js").on("click", "button.measurement-trigger-js", function (e) {
        e.preventDefault();
        var code = $(this).data("measurements-code");

        var name = $size_custom_image[code]['local_img_title'];
        $('#measurementBottomSheetModalLabel').text(name);
        const imagePath = $size_custom_image[code]['local_img'];
        if (imagePath) {
            $('#modalImage').attr('src', imagePath);
        }
        const htmlContent = $size_custom_image[code]['local_img_desc'];
        if (htmlContent) {
            $('#modalHtml').html(htmlContent);
        }

        var trigger = code;
        // 3 save trigger source to modal
        var $modal = $('#measurementBottomSheet');
        $modal.data('trigger-source', trigger); // 保存来源
        console.log('this modal is triggered by:', trigger);
        // 4 show modal
        var modalInstance = new bootstrap.Modal($modal[0]);
        modalInstance.show();
    });
    // when modal is hidden
    $('#measurementBottomSheet').on('hidden.bs.modal', function () {
        // console.log('Bottom Sheet is hidden');
        var triggerSource = $(this).data('trigger-source');
        console.log('this modal is triggered by:', triggerSource, 'and it is hidden');
        // remove trigger source
        $(this).removeData('trigger-source');
    });

    // add to favorite: throttle 1s 
    // const throttledFavoriteClick = _.throttle(handleFavoriteClickThrottle, 1000, {
    //     trailing: false //disable trailing trigger
    // });
    $("#product-favorite-js").click(handleFavoriteClickA);
    // $('#product-favorite-js').on('click', function(e) {
    //     handleFavoriteClickA(e);
    // });
    //add to cart or buy now
    $('.product-view-js').on('click', 'button', function (e) {
        e.preventDefault();
        //1 check product info
        var result = getProductInfo();
        if (!result.success) {
            // scrollToElement(result.errors[0]);
            renderErrorMsg(result.errors[0]);
            return false;
        }
        // console.log(result);
        loadProductDetail(result.data);

        //2 get trigger source
        var trigger = $(this).data('trigger'); // product-add-cart-view-js or product-buy-now-view-js

        $('#productBottomSheetModalLabel').text($(this).text());
        if (trigger == 'product-add-cart-view-js') {
            // 1.1 add to cart
            $('#product-add-cart-js').removeClass('d-none');
            $('#product-paypal-container-js').addClass('d-none');
        } else if (trigger == 'product-buy-now-view-js') {
            //paypal
            if (typeof (paypal) == "undefined") {
                webLoadScript(paypalSdkUrl, function () {
                    paypalBuynowCreatePayment();
                });
            } else {
                paypalBuynowCreatePayment();
            }
            // 1.2 buy now
            $('#product-add-cart-js').addClass('d-none');
            $('#product-paypal-container-js').removeClass('d-none');
        }
        // 3 save trigger source to modal
        var $modal = $('#productBottomSheet');
        $modal.data('trigger-source', trigger); // 保存来源
        console.log('该 modal 是由:', trigger, '触发的');
        // 4 show modal
        var modalInstance = bootstrap.Modal.getOrCreateInstance($modal[0]);
        modalInstance.show();
    });
    // when productBottomSheet modal is hidden
    $('#productBottomSheet').on('hidden.bs.modal', function () {
        // console.log('Bottom Sheet is hidden');
        var triggerSource = $(this).data('trigger-source');
        console.log('this modal is triggered by:', triggerSource, 'and it is hidden');
        // if Use PayPal JS SDK , clear paypal button container (to prevent duplicate rendering)
        // tips: PayPal not provide destroy API, but can clear DOM
        if (triggerSource === 'product-buy-now-view-js') {
            $('#paypal-button-container').empty(); //clear paypal button
            // or remove the component
            // $('#paypal-button-container').html('');
        }
        // remove trigger source
        $(this).removeData('trigger-source');
    });

    // click add to cart button
    $('#product-add-cart-js').click(handleAddToCartClick);
    //remark textarea check
    $('#customer-remark-js').on('focus', function () {
        $(this).removeClass("is-invalid");
    }).on('blur', function () {
        if (!checkRemark($(this).val())) {
            $(this).addClass("is-invalid");
            showToast(order_remark_message, '#toast-js');
        }
    });

});