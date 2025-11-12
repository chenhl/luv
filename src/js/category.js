function resetUrl() {
    var url = category_url;
    var path = '';
    if (url_path_filter_field.length > 0) {
        path += '/' + url_path_filter_field.join('/');
    }
    if (url_path_filter.length > 0) {
        path += '/' + url_path_filter.join('/');
    }
    path += '/p' + pageNum;
    url += path;
    url += window.location.search;
    return url;
}

$(document).ready(function () {
    const lazyLoadInstance = new LazyLoad({
        // elements_selector: ".lazy"
    });
    ///////////filter end
    // Reset
    $(document).on('click', '#filter-reset-js', function () {
        window.location.href = category_url;
    });
    // Apply filter
    $(document).on('click', '#apply-filter-js', function () {
        var url = new URL(category_url, window.location.origin);
        var params = new URLSearchParams();
        // Keyword
        var keyword = $('#filter-keyword-js').val().trim();
        if (keyword) params.set('q', keyword);

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
            params.set('price', min + '-' + max);
        }

        // Attributes: sync selected_attr_values_map → build query
        $('.filter-attr-js').each(function () {
            var attrCode = $(this).data('attr-code');
            var selectedIds = [];
            $(this).find('.filter-value-item-js.active').each(function () {
                selectedIds.push($(this).data('value-id'));
            });
            if (selectedIds.length > 0) {
                params.set(attrCode, selectedIds.join(','));
            }
        });

        url.search = params.toString();
        // url_search = url.search;
        window.location.href = url.toString();
    });

    // Toggle filter value selection
    $(document).on('click', '.filter-value-item-js', function () {
        var $item = $(this);
        var attrCode = $item.closest('.filter-attr-js').data('attr-code');
        var valueName = $item.text().replace(/\s*✓\s*$/, '').trim(); // remove check icon text if any
        var valueId = $item.data('value-id');

        if ($item.hasClass('active')) {
            // Deselect
            $item.removeClass('active bg-primary text-white').find('i').remove();
            var idx = selected_attr_values_map[attrCode].indexOf(valueName);
            if (idx !== -1) selected_attr_values_map[attrCode].splice(idx, 1);
        } else {
            // Select
            if (selected_attr_values_map[attrCode].length >= 10) {
                alert('You can select up to ten items');
                return;
            }
            $item.addClass('active bg-primary text-white').append('<i class="fas fa-check ms-2"></i>');
            selected_attr_values_map[attrCode].push(valueName);
        }

        // // Update summary in accordion header
        // var summary = selected_attr_values_map[attrCode].join(', ');
        // $item.closest('.accordion-item')
        //     .find('.accordion-button small')
        //     .remove(); // remove old
        // if (summary) {
        //     $item.closest('.accordion-item')
        //         .find('.accordion-button span')
        //         .after('<small class="text-muted ms-auto">' + summary + '</small>');
        // }

    });
    ///////////filter end

    ////// 下拉加载更多商品
    let isLoading = false;

    function loadMoreProducts() {
        // ✅ 关键：利用 maxPage 提前终止
        if (pageNum >= maxPage) {
            console.log('已到达最后一页，停止加载');
            if (observer && document.getElementById('load-trigger')) {
                observer.unobserve(document.getElementById('load-trigger'));
            }
            $('#product-list-more').append('<div class="col-12 text-center text-muted">No more products.</div>');
            return;
        }

        if (isLoading) return;
        isLoading = true;
        // display loading more (optional)
        $('#product-list-more').append('<div id="loading-more" class="col-12 text-center my-3">Loading...</div>');
        $.ajax({
            url: resetUrl(),
            method: 'GET',
            data: {
                // p: pageNum
            },
            dataType: "json",
            timeout: 5000
        })
            .done(function (response) {
                if (response.html && response.html.trim() !== '') {
                    $('#product-list-more').append(response.html);
                    lazyLoadInstance.update();
                    pageNum = response.next_page;
                } else {
                    observer.unobserve(document.getElementById('load-trigger'));
                    $('#product-list-more').append('<div class="col-12 text-center text-muted">No more products.</div>');
                }
            })
            .fail(function () {
                alert('Failed to load more products.');
            })
            .always(function () {
                $('#loading-more').remove();
                isLoading = false;
            });
    }
    // 👇 关键：用 Lodash 节流（例如每 1000ms 最多触发一次）
    const throttledLoad = _.throttle(function () {
        if (!isLoading) {
            loadMoreProducts();
        }
    }, 1000, {
        trailing: true
    });
    // create Intersection Observer 
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            throttledLoad(); // 👈 调用节流函数
        }
    }, {
        rootMargin: '100px' // enter 100px before the bottom of the viewport
    });
    // listener for load trigger
    if (document.getElementById('load-trigger')) {
        observer.observe(document.getElementById('load-trigger'));
    }
    ////// 下拉加载更多商品 end

});