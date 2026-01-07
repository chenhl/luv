function init_share($ele) {
    //init sharejs
    var shareUrl = $ele.data('share-url');
    var shareTitle = $ele.data('share-title');
    console.log(shareUrl);
    console.log(shareTitle);
    //share info
    var elems = $('[data-sharer]');
    for (var i = 0; i < elems.length; i++) {
        elems[i].setAttribute('data-url', shareUrl);
        elems[i].setAttribute('data-title', shareTitle);
    }
    //share product link
    $('#product-link-url-input-js').val(shareUrl);
    //share affiliate link
    var affiliateUrl = $ele.data('affiliate-url');
    $('#affiliate-link-url-input-js').val(affiliateUrl);
}

function removeFavorite(favorite_id) {
    $.ajax({
        url: removeFavoriteUrl,
        type: 'POST',
        dataType: 'json',
        data: {
            favorite_id: favorite_id,
            [csrfName]: csrfVal
        },
        success: function (response) {
            if (response.status === 'success') {
                $('.favorite-item-js[data-favorite-id="' + favorite_id + '"]').fadeOut(300, function () {
                    $(this).remove();
                });
            } else {
                alert(response.message || 'Update failed');
            }
        },
        error: function () {
            alert('Network error');
        }
    });
}
$(document).ready(function () {
    //. 懒加载图片
    const lazyLoadInstance = new LazyLoad({
        // elements_selector: ".lazy"
    });

    // === 1. 删除商品（通过 Modal 确认）===
    var pendingDeleteFavoriteId = null;
    $('#removeDialog').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        pendingDeleteFavoriteId = button.data('favorite-id');
    });
    $('#removeDialog .btn-primary').on('click', function () {
        if (pendingDeleteFavoriteId) {
            removeFavorite(pendingDeleteFavoriteId);
            $('#removeDialog').modal('hide');
            pendingDeleteFavoriteId = null;
        }
    });

    // ==== 2. 分享按钮 =====
    $(document).on('click', '.product-detail-icon-share-js', function (e) {
        e.preventDefault();
        init_share($(this));
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
    //affiliate-link-url-copy-js
    $(document).on('click', '.btn-copy-link-js', function (e) {
        e.preventDefault();

        const $btn = $(this);
        const targetId = $btn.data('clipboard-target'); // 获取 data-clipboard-target 值
        const $input = $('#' + targetId);
        if (!$input.length) {
            console.warn('Copy button target not found:', targetId);
            return;
        }
        const textToCopy = $input.val().trim();
        console.log(textToCopy);
        if (!textToCopy) {
            // 可选：提示用户链接为空
            return;
        }
        // 复制文本到剪贴板
        // 2 新方案 调用封装好的复制函数 js.js 封装的函数
        copyTextToClipboard(textToCopy).then(function (success) {
            // 切换“Copied”状态
            $btn.find('.copy-label-js').addClass('d-none');
            $btn.find('.copy-label-copied-js').removeClass('d-none');

            setTimeout(function () {
                $btn.find('.copy-label-js').removeClass('d-none');
                $btn.find('.copy-label-copied-js').addClass('d-none');
            }, 2000);
            // 可选：处理失败情况
            if (!success) {
                // console.error('Failed to copy link.');
                // 例如：显示错误提示给用户
            }
        });
    });


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
    // ===== 无限滚动 end ===== 


});
