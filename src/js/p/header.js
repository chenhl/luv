function renderSearchHistory() {
        const $list = $('#search-history-items-js');
        const history = SearchHistory.getKeywords();

        if (history.length === 0) {
            $('#search-history-js').addClass('d-none');
            return;
        }
        $('#search-history-js').removeClass('d-none');
        $list.empty();
        history.forEach(keyword => {
            const $item = $(`<li><a href="${searchUrl}?q=${encodeURIComponent(keyword)}" class="badge bg-light text-dark text-decoration-none">${keyword}</a></li>`);
            $list.append($item);
        });
    }

    $(document).ready(function() {
        // //0 =================menu =================
        $(".luv-nav-item").hover(function() {
            $(this).addClass("active");
            $(this).find(".nav-link").addClass("active");
        }, function() {
            $(this).removeClass("active");
            $(this).find(".nav-link").removeClass("active");
        });
        //1 =================搜索框search=================
        const $qInput = $('#keywords');
        const $searchSuggestions = $('#search-suggestions-js');
        const $searchForm = $('#search-form-js');

        // 显示建议面板
        $qInput.on('focus', function() {
            // pull history from remote
            SearchHistory.pullFromServer(pullSearchHistoryUrl);
            // 渲染历史
            renderSearchHistory();
            $searchSuggestions.removeClass('d-none');
            $qInput.attr('aria-expanded', 'true');
        });

        // 提交时保存历史
        $searchForm.on('submit', function() {
            const q = $input.val().trim();
            if (!q) {
                e.preventDefault();
                $input.focus();
                return false;
            }
            // save search history 游客的url为空，不保存到远程
            SearchHistory.save(q, saveSearchHistoryUrl);
        });

        // 点击外部关闭
        $(document).on('click', function(e) {
            if (!$searchForm[0].contains(e.target)) {
                $searchSuggestions.addClass('d-none');
                $qInput.attr('aria-expanded', 'false');
            }
        });
        // ESC 关闭
        $qInput.on('keydown', function(e) {
            if (e.key === 'Escape') {
                $searchSuggestions.addClass('d-none');
                $qInput.attr('aria-expanded', 'false');
                $qInput.blur();
            }
        });
        // 清空历史
        $("#removeSearchDialog .btn-primary").click(function() {
            SearchHistory.clear(removeHistoryUrl);
            location.reload();
        });
        // 点击（委托）
        $searchSuggestions.on('click', 'a', function(e) {
            const q = new URL(this.href).searchParams.get('q');
            if (q)
                SearchHistory.save(q, saveSearchHistoryUrl);
        });
        //2 ==================Account=================


        //3 ==================Cart=================

        //4 ================= Language/Currency Submit ==========
        $('.lang_currency_submit').on('click', function() {
            var changeStore = $('.currentLangSelect').val();
            var currentCurrency = $('.currentCurrencySelect').val();
            // First: change currency via AJAX
            $.ajax({
                url: "<?= Yii::$service->url->getUrl('cms/home/changecurrency') ?>?currency=" + currentCurrency,
                async: false
            });
            // Then: redirect to new store/language
            var currentUrl = window.location.href;
            var currentStore = $(".current_lang").val();
            var redirectUrl = currentUrl.replace("://" + currentStore, "://" + changeStore);
            redirectUrl = redirectUrl.split('#')[0]; // remove hash
            window.location.href = redirectUrl;
        });

        // // Sticky header on scroll up/down
        // let lastScrollTop = 0;
        // $(window).on('scroll', _.throttle(function() {
        //     let scrollTop = $(this).scrollTop();
        //     const $header = $('.sticky-top');
        //     if (scrollTop > lastScrollTop && scrollTop > 100) {
        //         $header.addClass('d-none');
        //     } else {
        //         $header.removeClass('d-none');
        //     }
        //     lastScrollTop = scrollTop;
        // }, 100));

        // // 桌面端专用：无节流 + 连续方向判断 + 顶部保护
        // (function() {
        //     const $header = $('.sticky-top');
        //     const HEADER_HEIGHT = $header.outerHeight() || 70;
        //     const TOP_THRESHOLD = HEADER_HEIGHT * 1.5; // 顶部安全区
        //     let lastScrollPos = window.pageYOffset || document.documentElement.scrollTop;
        //     let isHeaderVisible = true;

        //     // 直接监听，不节流（桌面端滚动事件性能完全可承受）
        //     window.addEventListener('scroll', function() {
        //         const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        //         const delta = currentScroll - lastScrollPos; // 精确滚动变化量

        //         // 1. 过滤无效滚动（惯性结束抖动/微小回弹）
        //         if (Math.abs(delta) < 3) {
        //             lastScrollPos = currentScroll;
        //             return;
        //         }

        //         // 2. 顶部区域强制显示（用户体验保障）
        //         if (currentScroll < TOP_THRESHOLD) {
        //             if (!isHeaderVisible) {
        //                 $header.removeClass('d-none');
        //                 isHeaderVisible = true;
        //             }
        //             lastScrollPos = currentScroll;
        //             return;
        //         }

        //         // 3. 核心逻辑：仅根据滚动方向切换（复刻旧代码精髓）
        //         if (delta > 0 && isHeaderVisible) { // 向下滚动且当前显示
        //             $header.addClass('d-none');
        //             isHeaderVisible = false;
        //         } else if (delta < 0 && !isHeaderVisible) { // 向上滚动且当前隐藏
        //             $header.removeClass('d-none');
        //             isHeaderVisible = true;
        //         }

        //         lastScrollPos = currentScroll; // ✅ 关键：每次更新基准点
        //     }, {
        //         passive: true
        //     }); // 提升滚动性能
        // })();

    });