function updateOrderStatus(data) {
    // actions html
    $('#order-actions-js').html(data.actions);
    // statusText
    $('#order-status-js').text(data.statusIcon + data.statusText);
}

function CancelOrder(order_sn) {
    $.ajax({
        url: cancelUrl,
        type: 'post',
        data: {
            [csrfName]: csrfVal,
            order_sn: order_sn
        },
        success: function (data) { // {"status":"success","statusText":"Canceled","actions":""}

            if (data.status == 'success') {
                showToast(translations.cancelSuccess, '#toast-js');
            }
            updateOrderStatus(data);

            // close modal
            $('#orderActionsModal').modal('hide');
        },
        error: function () {
            alert('Network error');
        }
    })
}

function ReceiptOrder(order_sn) {
    $.ajax({
        url: receiptUrl,
        type: 'post',
        data: {
            [csrfName]: csrfVal,
            order_sn: order_sn
        },
        success: function (data) {
            if (data.status == 'success') {
                showToast(translations.receiptSuccess, '#toast-js');
            }
            updateOrderStatus(data);
            // close modal
            $('#orderActionsModal').modal('hide');
        },
        error: function () {
            alert('Network error');
        }
    })
}

$(document).ready(function () {
    //. 懒加载图片
    const lazyLoadInstance = new LazyLoad({
        // elements_selector: ".lazy"
    });
    //========取消或签收订单==========
    $('#orderActionsModal').on('show.bs.modal', function (event) {
        const $button = $(event.relatedTarget); // 触发按钮（即使是动态加载的也没问题）
        const source = $button.data('source'); // 获取触发按钮的 data-source 属性值
        const orderSN = $button.data('order-sn');
        // console.log('source:', source);
        // console.log('orderSN-:', orderSN);

        // 把 orderSn 存到 modal 上，供后续使用
        $(this).data('current-order-sn', orderSN);
        $(this).data('current-source', source);

        if (source === 'cancel') {
            $("#orderActionsModal .modal-title").text(translations.cancelTitle);
            $("#orderActionsModal .modal-body").text(translations.cancelBody);
            $("#orderActionsModal .modal-footer .btn-primary").text(translations.yesCancel);
            $("#orderActionsModal .modal-footer .btn-secondary").text(translations.no);
        } else if (source === 'receipt') {
            $("#orderActionsModal .modal-title").text(translations.receiptTitle);
            $("#orderActionsModal .modal-body").text(translations.receiptBody);
            $("#orderActionsModal .modal-footer .btn-primary").text(translations.yesReceived);
            $("#orderActionsModal .modal-footer .btn-secondary").text(translations.notYet);
        }
        // pendingDeleteItemId = button.data('item-id');
    });
    $('#orderActionsModal').on('click', '.btn-primary', function () { // 点击确认按钮
        const modal = $('#orderActionsModal');
        const source = modal.data('current-source');
        const orderSN = modal.data('current-order-sn');
        // console.log('source-:', source);
        // console.log('orderSN-:', orderSN);

        // return
        if (source === 'cancel') {
            CancelOrder(orderSN);
        } else if (source === 'receipt') {
            ReceiptOrder(orderSN);
        }
    });
});