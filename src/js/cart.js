// ================== 辅助函数 ==================

function updateQty(item_id, up_type, qty = null) {
    var data = {
        item_id: item_id,
        up_type: up_type
    };
    if (qty !== null) data.qty = qty;
    data[csrfName] = csrfVal;

    $.ajax({
        url: updateCartInfoUrl,
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function (response) {
            if (response.status === 'success') {
                // 若是删除，则移除 DOM 节点
                if (up_type === 'remove') {
                    $('.cart-item-js[data-item-id="' + item_id + '"]').fadeOut(300, function () {
                        $(this).remove();
                        updateCheckoutButton();
                        // // 如果购物车空了，隐藏 footer
                        // if ($('.cart-item-js').length === 0) {
                        //     $('footer').addClass('d-none');
                        // }
                    });
                } else {
                    updateCheckoutButton();
                }
            } else {
                alert(response.message || 'Update failed');
            }
        },
        error: function () {
            alert('Network error');
        }
    });
}

function updateCheckoutButton() {
    const $checkedItems = $('.item-checkbox-js:checked');
    const checkedCount = $checkedItems.length;

    let total = 0;
    $checkedItems.each(function () {
        const price = parseFloat($(this).data('price')) || 0;
        const qty = parseInt($('#qty-js-' + $(this).val()).val()) || 0;
        total += price * qty;
    });

    $('#total-price-js').text(total.toFixed(2));
    $('#checkout-count-js').text(checkedCount);
    $('#btn-checkout-js').prop('disabled', checkedCount === 0);

    // 同步全选按钮状态
    const allChecked = $('.item-checkbox-js').length > 0 && $checkedItems.length === $('.item-checkbox-js').length;
    $('#check-all-js').prop('checked', allChecked);

    // // 显示/隐藏结算区域
    // $('#checkout-js').toggleClass('d-none', checkedCount === 0);
}

function paypalBuynowCreatePayment() {
    if (!paypal_client_id) return;

    // 清空容器
    $('#paypal-button-container').empty();

    var fundingSources = [paypal.FUNDING.PAYPAL];
    fundingSources.forEach(function (fundingSource) {
        var button = paypal.Buttons({
            fundingSource: fundingSource,
            style: {
                height: 38,
                // color: 'black',
                // tagline: true,
                label: 'buynow'
            },
            onClick: function () {
                const total = parseFloat($('#total-price-js').text());
                if (isNaN(total) || total <= 0) {
                    showToast(translations.itemRequired, '#toast-js');
                    return false;
                }
                return true;
            },
            createOrder: function (data, actions) {
                return fetch(paypalCreateOrderUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        [csrfName]: csrfVal
                    })
                }).then(function (res) {
                    return res.json();
                }).then(function (order) {
                    if (order.id === '-1') throw new Error(order.message);
                    return order.id;
                });
            },
            onCancel: (data) => {
                //data的值: {orderID: '35G84664V47979731'}
                //window.location.assign("/your-cancel-page");
                //TODO: 取消支付后的处理逻辑
                // console.log('PayPal支付已取消:', data);
            },
            onApprove: function (data, actions) {
                return fetch(paypalCaptureOrderUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.assign(data, {
                        [csrfName]: csrfVal
                    }))
                }).then(function (res) {
                    return res.json();
                }).then(function (orderData) {
                    const order_sn = orderData.order_sn;
                    if (order_sn == '-1') {
                        if (!orderData.is_local) { // paypal HttpException
                            if (orderData.error_issue === 'INSTRUMENT_DECLINED') {
                                alert(orderData.message);
                                return actions.restart();
                            }
                            throw new Error(orderData.message);//抛出错误，会被catch捕获
                        } else {// local Exception: paypal正常支付了但更新本地库失败，需紧急处理
                            //TODO: 本地订单处理失败，需紧急处理
                            // console.log('本地订单处理失败:', orderData);
                        }
                    }
                    actions.redirect(`${paypalFinishOrderUrl}?order_sn=${order_sn}`);
                    // window.location.href = paypalFinishOrderUrl + '?order_sn=' + encodeURIComponent(order_sn);
                }).catch(function (error) {
                    alert(error);
                    // console.log('There has been a problem with your fetch operation:', error);
                    // captue如果发生错误，全部重启支付：现在改成只有INSTRUMENT_DECLINED时才重启
                    // return actions.restart();
                });
            },
            onError: function (err) {
                alert(err.toString());
            }
        });

        if (button.isEligible()) {
            button.render('#paypal-button-container');
        }
    });
}


$(document).ready(function () {

    // 初始化：计算初始总价和全选状态 由服务端php渲染好了
    // updateCheckoutButton();

    // === 1. 商品复选框变化 ===
    $(document).on('change', '.item-checkbox-js', function () {
        var item_id = $(this).val();
        var checked = $(this).is(":checked") ? 1 : 0;
        var data = {
            item_id: item_id,
            checked: checked
        };
        data[csrfName] = csrfVal;

        $.ajax({
            url: selectOneProductUrl,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (response) {
                if (response.status === 'success') {
                    updateCheckoutButton();
                }
            }
        });
    });

    // === 2. 全选/取消全选 ===
    $('#check-all-js').on('change', function () {
        var checked = $(this).is(':checked') ? 1 : 0;
        var data = {
            checked: checked
        };
        data[csrfName] = csrfVal;

        $.ajax({
            url: selectAllProductUrl,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (response) {
                if (response.status === 'success') {
                    $('.item-checkbox-js').prop('checked', checked);
                    updateCheckoutButton();
                }
            }
        });
    });

    // === 3. 数量加减 ===
    $(document).on('click', '.item-plus-js', function () {
        var $input = $('#qty-js-' + $(this).data('item-id'));
        var qty = parseInt($input.val()) || 1;
        if (qty < max_qty) {
            $input.val(qty + 1);
            updateQty($(this).data('item-id'), 'add_one');
        }
    });

    $(document).on('click', '.item-minus-js', function () {
        var $input = $('#qty-js-' + $(this).data('item-id'));
        var qty = parseInt($input.val()) || 1;
        if (qty > 1) {
            $input.val(qty - 1);
            updateQty($(this).data('item-id'), 'less_one');
        }
    });

    // === 4. 手动输入数量（失去焦点或回车时触发）===
    $(document).on('change input', '[id^="qty-js-"]', function () {
        var item_id = $(this).attr('id').replace('qty-js-', '');
        var qty = parseInt($(this).val()) || 1;
        qty = Math.max(1, Math.min(max_qty, qty));
        $(this).val(qty);

        // 发送更新请求（避免频繁请求，这里用 change 触发）
        updateQty(item_id, 'set_num', qty);
    });

    // === 5. 删除商品（通过 Modal 确认）===
    var pendingDeleteItemId = null;

    $('#removeDialog').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        pendingDeleteItemId = button.data('item-id');
    });

    $('#removeDialog .btn-primary').on('click', function () {
        if (pendingDeleteItemId) {
            updateQty(pendingDeleteItemId, 'remove');
            $('#removeDialog').modal('hide');
            pendingDeleteItemId = null;
        }
    });

    // === 6. 结算按钮点击 ===
    $('#btn-checkout-js').on('click', function () {
        if ($(this).prop('disabled')) {
            return;
        }
        //disable button
        $(this).prop('disabled', true);

        const selectedCount = $('.item-checkbox-js:checked').length;
        if (selectedCount === 0) {
            //enable button
            $(this).prop('disabled', false);
            showToast(translations.itemRequired, '#toast-js');
            return false;
        }

        $(this).prop('disabled', true).text(translations.checkoutIng);

        window.location.href = checkoutUrl;
    });

    // === 7. PayPal 初始化 === 仅在有商品时初始化
    if (paypal_client_id !== '' && has_product) {
        if (typeof (paypal) === "undefined") {
            webLoadScript(paypalSdkUrl, function () {
                paypalBuynowCreatePayment();
            });
        } else {
            paypalBuynowCreatePayment();
        }
    }


});