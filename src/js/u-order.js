function updateOrderStatus(order_sn, data) {
    // ✅ 更新 DOM：找到对应的订单卡片 //TODO: 当前页在“待付款”页面 也不会刷新页面，直接更改状态，可能和其他订单状态不一样了
    ////TODO: 当前页在“已发货”页面 也不会刷新页面，直接更改状态，可能和其他订单状态不一样了
    const $orderCard = $('.order-card-js[data-order-sn="' + order_sn + '"]');
    // actions html
    $orderCard.find('.order-actions-js').html(data.actions);
    // statusText
    $orderCard.find('.order-status-js').text(data.statusText);
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
            updateOrderStatus(order_sn, data);

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
            updateOrderStatus(order_sn, data);
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
    
    // ================手机端专用==================
    // ===== 3. 无限滚动 ===== infiniteScroll
    // search ajax 无限滚动 禁用history
    // product load more ajax 无限滚动 禁用history
    // category append 无限滚动 启用用history
    // 移动端专用无限滚动配置 - 支持 AJAX
    $('#product-list-more').infiniteScroll({
        // 路径配置
        path: function () {
            // console.log(url);
            if (this.loadCount < maxPage - 1) { // 限制加载次数
                return UrlUtils.mergeParams(base_url, {
                    ...url_params,
                    p: this.loadCount + 2 // 从第二页开始
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
            if (typeof lazyLoadInstance !== 'undefined') {
                lazyLoadInstance.update();
            }
            // console.log('Loaded page via AJAX:', path);
        }
    });
    // 错误处理
    $('#product-list-more').on('error.infiniteScroll', function (event, error, path) {
        console.error('Failed to load page via AJAX:', path, error);
        alert('Failed to load more items. Please try again later.');
    });
    // append事件处理 https://infinite-scroll.com/events#append
    $('#product-list-more').on('append.infiniteScroll', function (event, body, path, items) {
        // console.log(`Appended ${items.length} items from ${path}`);
    });
    // 最后一页处理
    $('#product-list-more').on('last.infiniteScroll', function () {
        // console.log('Reached the last page via AJAX');
    });
    // ===== 无限滚动 end ===== infiniteScroll
});