function resetUrl(p) {
    var url = category_url;
    var path = '';
    // // 20251123 改变了url规则现在都为空了
    // if (url_path_filter_field.length > 0) {
    //     path += '/' + url_path_filter_field.join('/');
    // }
    // if (url_path_filter.length > 0) {
    //     path += '/' + url_path_filter.join('/');
    // }

    path += '/p' + p;
    url += path;
    url += window.location.search;
    return url;
}

$(document).ready(function () {
    const lazyLoadInstance = new LazyLoad({
        // elements_selector: ".lazy"
    });

    ///////////filter start
    // Reset
    $(document).on('click', '#filter-reset-js', function () {
        window.location.href = category_url;
    });
    // Apply filter
    $(document).on('click', '#apply-filter-js', function () {
        // var url = new URL(category_url, window.location.origin);
        // var params = new URLSearchParams();
        var params = {};
        // Keyword
        var keyword = $('#filter-keyword-js').val().trim();
        if (keyword) {
            // params.set('q', keyword);
            params['q'] = keyword;
        }

        // Price
        var begin = $('#filter-price-min-js').val().trim();
        var end = $('#filter-price-max-js').val().trim();
        var priceValid = (val) => {
            let n = parseFloat(val);
            return !isNaN(n) && n >= 0;
        };
        if ((begin && priceValid(begin)) || (end && priceValid(end))) {
            let min = begin && priceValid(begin) ? parseFloat(begin) : 0;
            let max = end && priceValid(end) ? parseFloat(end) : 0;
            // params.set('price', min + '-' + max);
            params['price'] = min + '-' + max;
        }

        // Attributes: sync selected_attr_values_map → build query
        $('.filter-attr-js').each(function () {
            var attrCode = $(this).data('attr-code');
            var selectedIds = [];
            $(this).find('.filter-value-item-js.active').each(function () {
                selectedIds.push($(this).data('value-id'));
            });
            if (selectedIds.length > 0) {
                // params.set(attrCode, selectedIds.join(','));
                params[attrCode] = selectedIds.join(',');
            }
        });
        // url.search = params.toString();
        // window.location.href = url.toString();
        const finalUrl = UrlUtils.mergeParams(category_url, params);
        window.location.href = finalUrl;
    });

    // Toggle filter value selection 多选
    $(document).on('click', '.filter-value-item-js', function () {
        var $item = $(this);
        var attrCode = $item.closest('.filter-attr-js').data('attr-code');
        var valueName = $item.text().replace(/\s*✓\s*$/, '').trim(); // remove check icon text if any
        var valueId = $item.data('value-id');

        if ($item.hasClass('active')) {
            // Deselect
            $item.removeClass('active bg-primary text-white');

            var idx = selected_attr_values_map[attrCode].indexOf(valueName);
            if (idx !== -1) selected_attr_values_map[attrCode].splice(idx, 1);
        } else {
            // Select
            if (selected_attr_values_map[attrCode].length >= 10) {
                alert('You can select up to ten items');
                return;
            }
            $item.addClass('active bg-primary text-white');
            selected_attr_values_map[attrCode].push(valueName);
        }
    });
    ///////////filter end


    //////////////////infiniteScroll start
    // search ajax 无限滚动 禁用history
    // product load more ajax 无限滚动 禁用history
    // category append 无限滚动 启用用history

    // 移动端专用无限滚动配置 - 支持 AJAX
    $('#product-list-more').infiniteScroll({
        // 路径配置
        //TODO:使用隐藏的分页地址是否有利于seo爬虫？
        path: function () {
            // console.log(url);
            if (this.loadCount < maxPage - 1) { // 限制加载次数
                return resetUrl(this.loadCount + 2);
                // return UrlUtils.mergeParams(base_search_url, {
                //     ...url_params,
                //     p: this.loadCount + 2 // 从第二页开始
                // });
            }
        },
        append: '.col-6.col-sm-4.col-md-3.flex-shrink-0',
        // 历史记录管理（对SEO友好）
        history: 'replace', // push/replace
        historyTitle: false, // 不修改页面标题
        responseBody: 'text', // 默认为 'text'

        // // 禁用自动追加，我们手动处理 AJAX 响应
        // append: false,
        // history: false,
        // 设置响应体为 JSON 格式
        // responseBody: 'json', // 默认为 'text'
        // AJAX 请求配置
        // fetchOptions: {
        //     method: 'GET',
        //     headers: {
        //         'X-Requested-With': 'XMLHttpRequest',
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json'
        //     }
        // },

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
        // // 处理从 AJAX 返回的 JSON 数据
        // if (body && body.html && body.html.trim() !== '') { // 如果有商品数据
        //     // 手动追加 HTML 内容
        //     $(this).append(body.html);
        //     // 更新懒加载
        //     if (lazyLoadInstance) {
        //         lazyLoadInstance.update();
        //     }
        //     // console.log('Loaded page via AJAX:', path);
        // }
    });
    // 错误处理
    $('#product-list-more').on('error.infiniteScroll', function (event, error, path) {
        // console.error('Failed to load page via AJAX:', path, error);
        alert('Failed to load more products.');
    });

    // append事件处理 https://infinite-scroll.com/events#append
    $('#product-list-more').on('append.infiniteScroll', function (event, body, path, items) {
        // 更新懒加载
        if (typeof lazyLoadInstance !== 'undefined') {
            lazyLoadInstance.update();
        }
        // console.log(`Appended ${items.length} items from ${path}`);
    });
    // 最后一页处理
    $('#product-list-more').on('last.infiniteScroll', function () {
        // console.log('Reached the last page via AJAX');
    });
    //////////////////infiniteScroll end

    // ////// 下拉加载更多商品
    // let isLoading = false;
    // function loadMoreProducts() {
    //     // ✅ 关键：利用 maxPage 提前终止
    //     if (pageNum >= maxPage) {
    //         // console.log('已到达最后一页，停止加载');
    //         if (observer && document.getElementById('load-trigger')) {
    //             observer.unobserve(document.getElementById('load-trigger'));
    //         }
    //         $('#product-list-more').append('<div class="col-12 text-center text-muted">No more products.</div>');
    //         return;
    //     }

    //     if (isLoading) return;
    //     isLoading = true;
    //     // display loading more (optional)
    //     $('#product-list-more').append('<div id="loading-more" class="col-12 text-center my-3">Loading...</div>');
    //     $.ajax({
    //         url: resetUrl(),
    //         method: 'GET',
    //         data: {
    //             // p: pageNum
    //         },
    //         dataType: "json",
    //         timeout: 5000
    //     })
    //         .done(function (response) {
    //             if (response.html && response.html.trim() !== '') {
    //                 $('#product-list-more').append(response.html);
    //                 lazyLoadInstance.update();
    //                 pageNum = response.next_page;
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
    // ////// 下拉加载更多商品 end

});