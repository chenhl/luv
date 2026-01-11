function renderSearchHistory() {
    let searchHistory = SearchHistory.getKeywords();
    if (searchHistory.length === 0) {
        // $('#search-history-js').addClass('d-none');
        return;
    }
    const $searchHistoryList = $('#search-history-items-js').empty();
    // render search history list
    searchHistory.forEach(function (keyword) {
        // create li
        const $listItem = $('<li>', {
            'class': 'q-js py-2 px-2',
            'text': keyword // text 安全
        });
        // add li to ul
        $searchHistoryList.append($listItem); //多次append ,但只有20条，不存在性能问题
    });
    $('#search-history-js').removeClass('d-none');
}
$(function () {
    // // test
    // var url = 'http://localhost:8080/search/index?a=b&q=test1111';
    // console.log(url);
    // console.log(UrlUtils.mergeParams(url, {
    //     'q': 'test'
    // }));
    // console.log(window.location.origin);
    // const urlObj = new URL(url, window.location.origin);
    // console.log(urlObj);


    // pull history from remote
    SearchHistory.pullFromServer(pullSearchHistoryUrl);
    // render history
    renderSearchHistory();

    $("#removeDialog .btn-primary").click(function () {
        SearchHistory.clear(removeHistoryUrl);
        location.reload();
    });

    const $input = $('#q');
    const $btnClearContainer = $('#btn-clear-container-js');
    const $btnContainer = $('#btn-container-js');
    // 输入时切换清除图标
    $input.on('input focus', function () {
        const q = $(this).val().trim();
        if (q.length > 0) {
            $btnClearContainer.removeClass('d-none');
            $btnContainer.addClass('d-none');
        } else {
            $btnClearContainer.addClass('d-none');
            $btnContainer.removeClass('d-none');
        }
    });
    // 点击清除图标
    $btnClearContainer.on('click', function () {
        $input.val('').focus();
        $(this).addClass('d-none');
        $btnContainer.removeClass('d-none');
    });
    // submit search form
    $('#searchForm').on('submit', function (e) {
        const q = $input.val().trim();
        if (!q) {
            e.preventDefault();
            $input.focus();
            return false;
        }
        // save search history 游客的url为空，不保存到远程
        SearchHistory.save(q, saveSearchHistoryUrl);
    });

    $(".q-js").click(function () {
        const search_text = $(this).text();
        $("#q").val(search_text);
        $("#searchForm").submit();
    });

    // /////////////
    // $('.search_text').bind('keypress', function(event) { //回车事件绑定 
    //     if (event.keyCode == "13") { //js监测到为为回车事件时 触发
    //         event.preventDefault(); //阻止页面自动刷新，重复加载
    //         //search_text = $(this).val();
    //         //$(".search_text").val(search_text);
    //         $(".js_topSeachForm").submit();
    //     }
    // });
    // $(".clear_search_text").click(function() {
    //     $(".search_text").val('');
    //     $(".clear_search_text").hide();
    // });
    // // 搜索框输入文字，显示删除按键
    // $(".search_text").on("input", function() {
    //     search_text = $(this).val();
    //     l = search_text.length;
    //     if (l >= 1) {
    //         $(".clear_search_text").show();
    //     } else {
    //         $(".clear_search_text").hide();
    //     }
    // });
    // $(".hot_search_text").click(function() {
    //     search_text = $(this).html();
    //     $(".search_text").val(search_text);
    //     $(".js_topSeachForm").submit();
    // });
});