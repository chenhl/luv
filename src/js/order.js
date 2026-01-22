function updateCartTotal() {
    var productTotal = parseFloat($('#product-total-js').data('product-total'));
    var shippingCost = parseFloat($('#shipping-cost-js').data('shipping-cost'));
    var couponCost = parseFloat($('#coupon-cost-js').data('coupon-cost'));
    var grandTotal = productTotal + shippingCost - couponCost;
    // //币种
    // const currency = $('#grand-total-js').data('currency');

    $('#grand-total-js').text(I18nHelper.formatCurrency(grandTotal, currencyInfo.code));
}
// 收集收货地址表单数据
function collectAddressData() {
    var result = {
        success: true,
        data: {},
        error: {},
    };
    $('#address-form input, #address-form select').each(function () {
        var $this = $(this);
        if (!checkAddressInput($this)) {
            result.success = false;
            result.error = $this; //记录一个错误就返回
            return false; //break
        } else {
            if (typeof $this.attr('name') != 'undefined') {
                result.data[$this.attr('name')] = $this.val();
            }
        }
    });
    return result;
}

function checkAddressInput($input) {
    const value = $input.val();
    const required = $input.prop('required');
    if (required && value === '') {
        return false;
    }
    if ($input.attr('name') == 'editForm[email]') {
        if (!check_email(value)) {
            return false;
        }
    }
    return true;
}
// State reload by country
function loadStatesByCountry(country) {
    $.get(changeCountryUrl, {
        country: country
    })
        .done(function (data) {
            $("#address-state-js").html(data.stateHtml);
        }).fail(function () {
            alert('Failed to load states');
        });
}

//重新加载地址列表
function loadAddressList(addressId = null) {
    var url = addressListUrl;
    if (addressId) {
        url += '?address_id=' + addressId;
    }
    $.get(url)
        .done(function (data) {
            $('#address-list-js').html(data.html);
        })
        .fail(function () {
            alert('Failed to load address list');
        });
}


// 打开 表单Offcanvas 的通用函数 -- 新增或编辑
function openAddressForm(addressId = null) {
    // 1. 先隐藏 Address List Offcanvas
    const listOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasAddressList'));
    if (listOffcanvas) listOffcanvas.hide(); // hide

    // 监听列表关闭后加载表单
    // 2. 等它完全关闭后，再打开 Form Offcanvas 
    document.getElementById('offcanvasAddressList').addEventListener('hidden.bs.offcanvas', function handler() { // hidden
        // listOffcanvas.on('hidden.bs.offcanvas', function handler() {	
        var url = addressFormUrl;
        if (addressId) { //修改
            $('#addressFormLabel').text(translations.titleAddressFormEdit); // 修改标题
            url = addressFormUrl + '?address_id=' + addressId;
        } else { //新增
            $('#addressFormLabel').text(translations.titleAddressFormAdd); // 修改标题
        }

        $.get(url)
            .done(function (html) {
                // 注入表单到 Offcanvas body
                $('#addressFormOffcanvas .offcanvas-body').html(html.html);
                if (addressId) {
                    // 设置addressFormOffcanvas的data-address-id 属性 好像没用到
                    $('#addressFormOffcanvas').data('address-id', addressId);
                }
                // 显示表单 Offcanvas
                const formOffcanvas = new bootstrap.Offcanvas(document.getElementById('addressFormOffcanvas'));
                formOffcanvas.show();
            })
            .fail(function () {
                alert('Failed to load address form');
            });
        // 移除监听器避免重复触发
        this.removeEventListener('hidden.bs.offcanvas', handler);
    });
}


$(document).ready(function () {

    //form提交 生成订单
    $('#checkout-order-form').on('submit', function (e) {
        const $form = $(this);
        const $btn = $('#btn-place-order-js');
        // 防重复提交
        if ($form.data('submitting')) {
            e.preventDefault();
            return false;
        }
        // 验证
        var order_remark = $('#order-remark-js').val();
        if (order_remark.length > order_remark_max_length) {
            showToast(order_remark_message, '#toast-js');
            $('#order-remark-js').focus();
            return false;
        }
        // 标记并禁用
        $form.data('submitting', true);
        $btn.prop('disabled', true).text(translations.restIng);
    });
    // ==================shipping method start=============
    // 选择shipping method事件
    $('#offcanvasShipping').on('change', '.shipping-method-item-js', function () {
        const $this = $(this);
        const shippingName = $this.data('name');
        const shippingFee = $this.data('fee');
        const selectedId = $this.val();

        //更新当前选中的shipping
        $('#current-shipping-name-js').text(shippingName);
        $('#current-shipping-method-js').val(selectedId);
        $('#current-shipping-fee-js').text(I18nHelper.formatCurrency(shippingFee, currencyInfo.code));
        //更新小计shipping cost

        $('#shipping-cost-js').data('shipping-cost', shippingFee).text(I18nHelper.formatCurrency(shippingFee, currencyInfo.code));

        //同步到服务端 静默处理 不提示错误信息
        $.post(updateCartShippingUrl, {
            shipping_method: selectedId,
            [csrfName]: csrfVal
        }).done(function (data) {
            if (data.status === 'success') { } else {
                // alert(data.message || 'Error');
            }
        }).fail(function () {
            // alert('Failed to update address');
        });

        //更新cart total
        updateCartTotal();

        bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasShipping'))?.hide();
    });
    // ==================选择shipping end=============

    // ==================收货地址address=============
    // 当点击 "Add New Address" 时：
    $('#openAddressFormBtn').on('click', function () {
        openAddressForm();
        // 3. 阻止默认行为(提交表单)
        return false;
    });
    // 当点击修改地址
    $(document).on('click', '.address-item-edit-js', function () {
        const id = $(this).data('address-id');
        // console.log('id:', id);
        openAddressForm(id); // 编辑
        // 3. 阻止默认行为(提交表单)
        return false;
    });
    // === 选择address ===
    $(document).on('change', '.address-item-js [type="radio"]', function () {
        var $this = $(this);
        var $item = $this.closest('.address-item-js');

        var address_id = $this.val(); //当前address id
        // var current_address_id = $('#current-address-id-js').val(); //已选中的address id

        // if (address_id != current_address_id) {
        // // 选中当前 radio
        // $this.prop('checked', true);
        // 更新当前address信息
        $('#current-address-id-js').val(address_id);
        $('#current-address-name-js').text($item.find('.address-item-name-js').text());
        $('#current-address-full-js').text($item.find('.address-item-full-js').text());

        //同步到服务端 静默处理 不提示错误信息
        $.post(updateCartAddressUrl, {
            address_id: address_id,
            [csrfName]: csrfVal
        }).done(function (data) {
            if (data.status === 'success') { } else {
                // alert(data.message || 'Error');
            }
        }).fail(function () {
            // alert('Failed to update address');
        });
        // }

        // //关闭address list offcanvas dialog
        bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasAddressList'))?.hide();
    });

    //当 Form 提交成功或关闭时，自动返回 List（提升体验）
    document.getElementById('addressFormOffcanvas').addEventListener('hidden.bs.offcanvas', function () {
        // 可选：重新加载地址列表（通过 AJAX）
        var address_id = $('#current-address-id-js').val(); //选中当前的address
        loadAddressList(address_id);
        // 然后自动打开 offcanvasAddressList
        const list = new bootstrap.Offcanvas(document.getElementById('offcanvasAddressList'));
        list.show();
    });
    // === 2. 删除地址（通过 Modal 确认）====
    var pendingDeleteAddressId = null;
    $('#removeDialog').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        pendingDeleteAddressId = button.data('address-id');
        // console.log('pendingDeleteAddressId:', pendingDeleteAddressId);
    });
    $('#removeDialog .btn-danger').on('click', function () {
        if (pendingDeleteAddressId) {
            // console.log('pendingDeleteAddressId2:', pendingDeleteAddressId);
            $('#removeDialog').modal('hide'); // 关闭模态框

            // 发送删除请求
            $.post(addressRemoveUrl, {
                address_id: pendingDeleteAddressId,
                [csrfName]: csrfVal
            }).done(function (data) {
                if (data.status === 'success') {
                    //关闭address表单offcanvas dialog
                    bootstrap.Offcanvas.getInstance(document.getElementById('addressFormOffcanvas'))?.hide();
                } else {
                    alert(data.message || 'Error');
                }
            }).fail(function () {
                alert('Failed to delete address');
            });

            pendingDeleteAddressId = null; // 重置为 null
        }
    });
    //address form modal------------------------ start 
    // Open country modal
    // 监听 Modal 即将打开（Bootstrap 5 事件）
    $('#countryModal').on('show.bs.modal', function (e) {
        // 1. 获取当前已选国家 code
        const currentCode = $('#country-code-input-js').val(); // 可能是空字符串
        // 2. 清除之前所有选中状态（移除 check icon）
        $('.country-item-js .country-checked-js').remove();

        if (currentCode) {
            // 3. 查找匹配的 country-item
            const $item = $('.country-item-js[data-code="' + currentCode + '"]');

            if ($item.length) {
                // 4. 添加选中标记（复用你原有的图标）
                $item.find('span').after('<span class="country-checked-js"><i class="fa-solid fa-check text-danger"></i></span>');

                // 5. 确保所在字母组可见（如果是按字母分组）
                const $group = $item.closest('.alphabet-group-js');
                if ($group.length) {
                    $group.removeClass('d-none');
                }

                // 6. 滚动到该元素（稍等 DOM 更新）
                setTimeout(() => {
                    $item[0].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);

                return; // 选中完成
            }
        }

        // 如果没找到（或为空），默认滚动到“常用国家”顶部
        setTimeout(() => {
            document.getElementById('common-group-js')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    });

    // 字母导航点击
    $(document).on('click', '.alphabet-js', function () {
        const letter = $(this).attr('rel');
        const $group = $('#alphabet-' + letter);
        if ($group.hasClass('d-none')) {
            $group.removeClass('d-none');
        }
        // 滚动到该字母组
        $group[0].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });

    // Country select
    // 使用事件委托（因为 country-item 是静态但可能被重复操作）
    $(document).on('click', '.country-item-js', function () {
        const code = $(this).data('code');
        const name = $(this).data('name');

        // 更新表单字段
        $('#country-code-input-js').val(code);
        $('#country-name-input-js').val(name);

        // 清除所有
        // $('.country-item-js .country-checked-js').remove();

        // 关闭 Modal
        $('#countryModal').modal('hide');

        // 可选：触发省/州联动加载
        loadStatesByCountry(code);
    });

    // Default address toggle
    $(document).on('change', '#is-default-input-js', function () {
        $(this).val(this.checked ? 1 : 2); //1:yes 2:no
    });


    // address 信息表单验证
    $(document).on('focus', '#address-form input:not([readonly])', function () {
        $(this).removeClass("is-invalid");
        // feedback
        $(this).next().removeClass("d-block");
    }).on('blur', '#address-form input:not([readonly])', function () {
        if (!checkAddressInput($(this))) {
            $(this).addClass("is-invalid");
            // feedback
            $(this).next().addClass("d-block");
        }
    });


    //提交address信息 新增或修改
    $(document).on('click', '#btn-save-address-js', function () {
        var $btn = $(this);
        if ($btn.prop('disabled')) {
            return false;
        }
        //disable button
        $btn.prop('disabled', true).text(translations.savIng);

        var addressData = collectAddressData(); //收集表单数据
        // console.log(addressData);
        if (!addressData.success) {
            //enable button
            $(this).prop('disabled', false).text(translations.save);
            // feedback
            addressData.error.addClass("is-invalid");
            addressData.error.next().addClass("d-block");
            return false;
        }

        // return false
        $.ajax({
            url: addressSaveUrl,
            timeout: 6000,
            dataType: 'json',
            type: 'post',
            data: addressData.data,
            success: function (data) {
                $btn.prop('disabled', false).text(translations.save);
                if (data.status == 'success') {
                    //关闭address表单offcanvas dialog
                    bootstrap.Offcanvas.getInstance(document.getElementById('addressFormOffcanvas'))?.hide();
                    //显示toast提示信息
                    if (addressData.data['editForm[address_id]']) {
                        showToast(translations.toastUpdateAdressSuccess, '#toast-js'); //显示提示信息	
                    } else {
                        showToast(translations.toastAddAdressSuccess, '#toast-js'); //显示提示信息	
                    }
                } else {
                    alert(data.message);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Oops! Something went wrong. Please try again in a few minutes.');
                //enable button
                $btn.prop('disabled', false).text(translations.save);
            }

        });
    });
    //address form modal------------------------ end
    // ===================收货地址address end=================

    // ================coupon start ==================
    // === 选择coupon === change事件
    $(document).on('change', '.coupon-item-js input[name="coupon_items"]', function () {
        var coupon_code = $(this).val();
        var coupon_cost = $(this).data('coupon-cost');
        // console.log(coupon_code);
        //选中 radio
        // $(this).find('input[type="radio"]').prop('checked', true);
        // 更新当前coupon信息
        $('#current-coupon-cost-input-js').val(coupon_code);
        $('#current-coupon-cost-js').text('-' + I18nHelper.formatCurrency(coupon_cost, currencyInfo.code));
        // 更新小计coupon cost
        $('#coupon-cost-js').data('coupon-cost', coupon_cost).text('-' + I18nHelper.formatCurrency(coupon_cost, currencyInfo.code));

        //同步到服务端 静默处理 不提示错误信息
        $.post(updateCartCouponUrl, {
            coupon_code: coupon_code,
            [csrfName]: csrfVal
        }).done(function (data) {
            if (data.status === 'success') { } else {
                // alert(data.message || 'Error');
            }
        }).fail(function () {
            // alert('Failed to update address');
        });
        //更新cart total
        updateCartTotal();
        // //关闭canvas dialog
        bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasCoupon'))?.hide();
    });

    // 输入coupon code 并提交
    $("#btn-coupon-apply-js").on('click', function () {
        var $btn = $(this); //按钮
        if ($btn.prop('disabled')) {
            return false;
        }
        //disable button
        $btn.prop('disabled', true).text(translations.applyIng);

        var coupon_code = $("#coupon-code-js").val().trim();
        if (coupon_code == '') {
            //enable button
            $btn.prop('disabled', false).text(translations.apply);
            //show toast message
            showToast(translations.couponCodeRequired, '#toast-js');
            return false;
        }
        // return false; //test
        //参数
        var $data = {
            coupon_code: coupon_code,
            select_coupon: true
        };
        $data[csrfName] = csrfVal;
        var product_items = [];
        var spu, attr_group, base_product_row_price;
        $('.product_info_coupon-js').each(function () {
            spu = $(this).data('spu');
            attr_group = $(this).data('attr-group');
            base_product_row_price = $(this).data('base-product-row-price');
            var item = {};
            item['spu'] = spu;
            item['attr_group'] = attr_group;
            item['base_product_row_price'] = base_product_row_price
            product_items.push(item);
        });
        $data['product_items'] = product_items;

        $.ajax({
            timeout: 6000,
            dataType: 'json',
            type: 'post',
            data: $data,
            url: applyCouponUrl,
            success: function (data, textStatus) {
                //enable button
                $btn.prop('disabled', false).text(translations.apply);
                if (data.status == 'customer_available') {
                    // available 数量增加  #coupon-available-count辅助计算

                    // var coupon_available_count = parseInt($('#coupon-available-count').val()); //当前可用数量
                    // coupon_available_count += 1;
                    // $('#coupon-available-count').val(coupon_available_count); //更新当前可用数量
                    $('#coupon-available-count').val(data.listCount); //更新当前可用数量

                    // 更新当前coupon信息 
                    // $('.coupon-available-count-js').text(coupon_available_count); //更新页面显示数量
                    $('.coupon-available-count-js').text(data.listCount); //更新页面显示数量
                    $('#current-coupon-cost-input-js').val(data.coupon_code);
                    $('#current-coupon-cost-js').text('-' + I18nHelper.formatCurrency(data.cost, currencyInfo.code));
                    // 更新小计coupon cost
                    $('#coupon-cost-js').data('coupon-cost', data.cost).text('-' + I18nHelper.formatCurrency(data.cost, currencyInfo.code));

                    //插入html
                    var $ele = $('#tab-available').find('.coupon-list-js');
                    // // if (coupon_available_count == 1) {
                    // if (data.listCount == 1) {	
                    // 	$ele.html('');
                    // }
                    // $ele.prepend(data.html);
                    $ele.html(data.html);

                    // 1 选中插入的
                    // $ele.find('.coupon-item-js:first-child').click(); //点击后会更新cart并关闭canvas

                    // 2 或更新cart total并关闭
                    updateCartTotal();
                    //关闭canvas dialog
                    bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasCoupon'))?.hide();

                } else if (data.status == 'customer_unavailable') {

                    // // unavailable 数量增加 #coupon-unavailable-count-js 辅助计算
                    // var coupon_unavailable_count = parseInt($('#coupon-unavailable-count-js').text());
                    // coupon_unavailable_count += 1;
                    // $('#coupon-unavailable-count-js').text(coupon_unavailable_count);
                    $('#coupon-unavailable-count').val(data.listCount); //更新当前可用数量

                    //插入html
                    var $ele = $('#tab-unavailable').find('.coupon-list-js');
                    // if (data.listCount == 1) {
                    // 	$ele.html('');
                    // }
                    // $ele.prepend(data.html);
                    $ele.html(data.html);

                    //切换到unavailable
                    $("#unavailable-tab").click();

                    showToast(data.message, '#toast-js');
                } else {
                    showToast(data.message, '#toast-js');
                }
                //清空输入框
                $("#coupon-code-js").val('');
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(translations.systemError);
                //enable button
                $btn.prop('disabled', false).text(translations.apply);
            }
        });
    });
    // ================coupon end ==================

});