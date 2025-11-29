function isStrictMode() {
    return (function () { return !this; })();
}
// console.log(isStrictMode()); // if true, strict mode is on
function isSurportedLoading() {
    return 'loading' in HTMLImageElement.prototype;
}
// console.log(isSurportedLoading()); // if true, loading attribute is supported

/////////////////// url操作 start
// 添加命名空间对象 对象字面量 
// 无状态的工具函数集合
// 所有方法都是纯函数：输入 → 输出，没有副作用
// 不需要“实例”，全局只有一个共享对象
const UrlUtils = {
    // new URL 如果第一个参数不是完整的url，就需要第二个参数作为基准url
    // 创建新的URL对象
    create: (url, origin = window.location.origin) => new URL(url, origin), //ES6
    // 获取当前URL对象的查询参数
    getCurrentParams: () => new URLSearchParams(window.location.search), //现代 Web API
    // 合并URL对象和参数对象
    mergeParams: (url, paramsObj) => {
        const newUrl = typeof url === 'string' ?
            new URL(url, window.location.origin) : url;
        Object.keys(paramsObj).forEach(key => {
            if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
                newUrl.searchParams.set(key, paramsObj[key]);
            }
        });
        return newUrl.toString();
    },
    // 构建查询字符串
    buildQuery: (paramsObj) => {
        const params = new URLSearchParams();
        Object.keys(paramsObj).forEach(key => {
            if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
                params.set(key, paramsObj[key]);
            }
        });
        return params.toString();
    },
    // 从URL中获取指定参数值
    getParam: (url, paramName) => {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.searchParams.get(paramName);
        } catch (e) {
            console.error('Invalid URL:', url);
            return null;
        }
    }
};
/////////////////// url操作 end

function webLoadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (typeof (callback) != "undefined") {
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {
            script.onload = function () {
                callback();
            };
        }
    }
    script.src = url;
    document.body.appendChild(script);
}
function isValidEmail(email) {
    // 简洁但实用的邮箱正则（符合 HTML5 标准）
    // https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
}
function check_email(email) {

    if (!email || email == "") {
        return false;
    }

    const myreg = /^([a-zA-Z0-9]+[_|\_|\.|-|\-]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.|-|\-]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (!myreg.test(email)) {
        return false;
    }

    return true;
}
function check_pass(str) {
    const re = /^\w{6,30}$/;
    if (re.test(str)) {
        return true;
    } else {
        return false;
    }
}

//set cookie
function setCookie(name, value) {
    const Days = 30;
    const exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

//get cookies
function getCookie(name) {
    const arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr) {
        return unescape(arr[2]);
    } else {
        return null;
    }
}

function showToast(msg, element) {
    $(element).find('.toast-body').text(msg);
    // const toastEl = document.getElementById('toast-js');
    const toastEl = $(element);
    if (toastEl) {
        const toast = bootstrap.Toast.getOrCreateInstance(toastEl[0]);
        toast.show();
    }
}
function showError($el, message, $input) {
    $el.text(message).removeClass('d-none');
    $input.addClass('is-invalid');
}

function hideError($el, $input) {
    $el.addClass('d-none');
    $input.removeClass('is-invalid');
}
$(document).ready(function () {

    if (typeof memberCheckUrl !== 'undefined') {
        const ajax_params = {};
        if (typeof product_id !== 'undefined') {
            ajax_params['product_id'] = product_id;
        }
        $.ajax({
            async: true,
            timeout: 6000,
            dataType: 'json',
            type: 'get',
            data: ajax_params,
            url: memberCheckUrl,
            success: function (data, textStatus) {

                if (data.loginStatus) {
                    $('#header-welcome-js').removeClass('d-none'); //show welcome
                    $('#header-email-js').text(data.customer_email);
                    $('#header-login-js').addClass('d-none'); //hide login
                }

                if (data.favorite) {
                    $('#product-favorite-js').addClass('text-danger');
                }

                if (data.favorite_product_count) {
                    // $(".header-right-user-wishlist-num-js").html(data.favorite_product_count);
                }

                if (data.affiliate) {
                    $("#affiliate-link-js").show(); //show affiliate link
                }

                if (data.cart_qty) {
                    $(".cart-item-count-js").text(data.cart_qty);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) { }
        });
    }


    // $(".span_click").click(function () {
    //     url = $(this).attr('rel');
    //     window.location.href = url;
    // });
    //ajax subscribe
    $("#subscribe_btn").click(function () {
        //disable button
        $(this).prop('disabled', true);

        email = $("#subscribe_email").val();
        if (!check_email(email)) {
            alert('Enter your email address');
            //enable button
            $('#subscribe_btn').prop('disabled', false);
            return false;
        }
        $.ajax({
            dataType: 'json',
            type: 'post',
            data: { 'email': email },
            // url: currentBaseUrl + "/member/account/subscribe",
            url: "/member/account/subscribe",
            success: function (data, textStatus) {
                //enable button
                $('#subscribe_btn').prop('disabled', false);
                if (data.success) {
                    alert(data.message);
                    $("#subscribe_email").val("");
                } else {
                    alert(data.message);
                }
            },
            error: function (error) {

                alert('Oops! Something went wrong. Please try again later.');
                //enable button
                $('#subscribe_btn').prop('disabled', false);
            }
        })
    });
});


/////////////////////////////// 本地搜索历史 ///////////////////////////////
function isValidSearchKeyword(keyword, maxLength = 100) {
    // 
    keyword = keyword.trim();
    if (keyword === '') {
        return false;
    }
    // 
    if (keyword.length > maxLength) {
        return false;
    }
    // Unicode
    // const safePattern = /^[\p{L}\p{N}\s.,;:'"!?-]+$/u;
    const safePattern = /^[\p{L}\p{N}\s.;:'"!?-]+$/u;
    if (!safePattern.test(keyword)) {
        return false;
    }
    // 
    const escapedKeyword = keyword.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    // 
    return true;
}

const historyKey = 'search_history';
function pullSearchHistory(Url) {
    // let localHistory = getSearchHistoryFromLocalStorage();
    let localHistory = getCompatibleSearchHistoryFromLocalStorage();
    if (!isSyncNeeded(localHistory)) {
        return;
    }
    $.ajax({
        async: true,
        timeout: 6000,
        dataType: 'json',
        type: 'get',
        url: Url,
        success: function (data, textStatus) {
            if (data.data.length > 0) {
                // console.log(data.data);
                mergeLocalSearchHistory(data.data);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

        }
    });
}
function removeHistory(url, keyword) {
    data = {};
    if (keyword) {
        data['keyword'] = keyword;
    }
    $.ajax({
        async: true,
        timeout: 6000,
        dataType: 'json',
        data: data,
        type: 'post',
        url: url,
        success: function (data, textStatus) {

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

        }
    });
}
/**
 * save search history to server
 * @param {string} keyword 
 * @param {string} Url 
 */
function saveOneSearchHistory(keyword, Url) {
    $.ajax({
        async: true,
        timeout: 6000,
        dataType: 'json',
        type: 'post',
        url: Url,
        data: {
            keyword: keyword
        },
        success: function (data, textStatus) {

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

        }
    });
}
/**
 * save search history to local storage
 * @param {string} keyword 
 */
function saveSearchToLocalStorage(keyword) {
    // let searchHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
    let searchHistory = getCompatibleSearchHistoryFromLocalStorage();

    // data
    // data keyword exits
    const index = searchHistory.data.indexOf(keyword);
    if (index > -1) {
        searchHistory.data.splice(index, 1);
    }
    searchHistory.data.unshift(keyword);
    // data keywords max length
    if (searchHistory.data.length > maxSearchHistoryLength) {
        searchHistory.data = searchHistory.data.slice(0, maxSearchHistoryLength); // move
    }

    //update_time
    searchHistory.update_time = new Date().toISOString();

    // save local
    localStorage.setItem(historyKey, JSON.stringify(searchHistory));
}

function removeSearchFromLocalStorage(keyword) {
    // get local search history
    let searchHistory = JSON.parse(localStorage.getItem(historyKey));
    // search history exists
    if (searchHistory && Array.isArray(searchHistory.data)) {
        if (keyword) {
            // if keyword exists in search history, remove it
            searchHistory.data = searchHistory.data.filter(item => item !== keyword);
        } else {
            // // set search history to empty
            // searchHistory.data = [];
            // remove search history from local storage
            localStorage.removeItem(historyKey);
            return;
        }
        //update_time
        searchHistory.update_time = new Date().toISOString();
        // update local storage
        localStorage.setItem(historyKey, JSON.stringify(searchHistory));
        return;
    } else {
        // remove search history from local storage
        localStorage.removeItem(historyKey);
        return;
    }

}

function getSearchHistoryFromLocalStorage() {
    let searchHistory = JSON.parse(localStorage.getItem(historyKey)) || {
        update_time: null,
        last_sync_time: null,
        data: []
    };
    return searchHistory;
}
function getCompatibleSearchHistoryFromLocalStorage() {
    const rawHistory = localStorage.getItem(historyKey);
    if (!rawHistory) {
        // if no history, return default new structure
        return {
            update_time: null,
            last_sync_time: null,
            data: []
        };
    }

    let history;
    try {
        history = JSON.parse(rawHistory);
    } catch (e) {
        console.error('Failed to parse history:', e);
        return {
            update_time: null,
            last_sync_time: null,
            data: []
        };
    }
    // check if it's old array structure
    if (Array.isArray(history)) {
        // convert to new object structure
        history = {
            update_time: null, // assume old data has no update time
            last_sync_time: null, // assume old data has no sync time
            data: history
        };
        // update to localStorage, ensure subsequent use of new structure
        localStorage.setItem(historyKey, JSON.stringify(history));
    }

    return history;
}
function isSyncNeeded(history) {
    if (!history || !history.last_sync_time) return true;

    const lastSyncTime = new Date(history.last_sync_time);
    const currentTime = new Date();
    const diffInMinutes = (currentTime - lastSyncTime) / (1000 * 60);

    return diffInMinutes > 15;
}
function mergeLocalSearchHistory(serverHistory) {
    // let localHistory = getSearchHistoryFromLocalStorage();
    let localHistory = getCompatibleSearchHistoryFromLocalStorage();
    //last_sync_time
    localHistory.last_sync_time = new Date().toISOString();

    // merge
    let mergedData = Array.from(new Set([...localHistory.data, ...serverHistory]));
    localHistory.data = mergedData;
    // save
    localStorage.setItem(historyKey, JSON.stringify(localHistory));
}



////////////////////////后台分销url操作
/**
* Checks if the provided URL is valid
*
* @param string url
*
* @return bool
*
*/
function is_valid_url(url) {

    var regex = new RegExp(/^(https?|s):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);

    return regex.test(url);

}
/**
 * Checks if the two provided URLs are from the same domain
 *
 * @param string base_url
 * @param string custom_url
 *
 * @return bool
 *
 */
function is_same_domain(base_url, custom_url) {

    base_url = base_url.replace('http://', '').replace('https://', '').replace('www.', '').replace('m.', '').split(/[/?#]/)[0];
    custom_url = custom_url.replace('http://', '').replace('https://', '').replace('www.', '').replace('m.', '').split(/[/?#]/)[0];

    return (base_url == custom_url || base_url.indexOf(custom_url) != -1 || custom_url.indexOf(base_url) != -1);

}
/**
 * Adds the the friendly affiliate parameters to the url
 *
 */
function process_friendly_url(param, value, url) {

    // Save the hash, if it's present.
    var hash = url.split('#')[1];

    url = url.split('#')[0];

    // Check if this is already an affiliate friendly url
    var re = new RegExp("([\/]" + param + "[\/][^?]*)"),
        match = re.exec(url);

    // Check if we have any parameters in the url
    var re2 = new RegExp("([?].*)"),
        match2 = re2.exec(url);

    // Remove the affiliate friendly endpoint
    if (match && match[0])
        url = url.replace(match[0], '');

    // Remove the url parameters
    if (match2 && match2[0])
        url = url.replace(match2[0], '');

    // Check if we have the affiliate parameter without affiliate id in the url
    var re3 = new RegExp("([\/]" + param + "$)"),
        match3 = re3.exec(url);

    // Remove the affiliate parameter
    if (match3 && match3[0])
        url = url.replace(match3[0], '');

    // Remove the trailing slash
    url = url.replace(/\/+$/, '');

    // Add the affiliate friendly endpoint
    url = url + '/' + param + '/' + value + '/';

    // Add back the parameters to the url
    if (match2 && match2[0])
        url = url + match2[0];

    // Add back the hash if it exists.
    if (hash)
        url += '#' + hash;

    return url;

}
/**
 * Adds an argument name, value pair to a given URL string
 *
 */
function add_query_arg(param, value, url) {

    var re = new RegExp("[\\?&]" + param + "=([^&#]*)"),
        match = re.exec(url),
        delimiter, newString;
    var hash = url.split('#')[1];

    url = url.split('#')[0];

    if (match === null) {

        var hasQuestionMark = /\?/.test(url);
        delimiter = hasQuestionMark ? "&" : "?";
        newString = url + delimiter + param + "=" + value;

    } else {

        delimiter = match[0].charAt(0);
        newString = url.replace(re, delimiter + param + "=" + value);

    }

    if (hash) {
        newString += '#' + hash;
    }

    return newString;
}



// /**
//  * InfiniteLoader - 使用 jQuery 简化 DOM 操作，适用于已引入 jQuery 的现代移动项目
//  */
// class InfiniteLoader {
//     constructor(options = {}) {
//         this.options = $.extend({
//             triggerSelector: '#load-trigger',
//             containerSelector: '#product-list-more',
//             loadingHtml: '<div id="loading-more" class="col-12 text-center my-3">Loading...</div>',
//             noMoreHtml: '<div class="col-12 text-center text-muted infinite-loader-no-more">No more products.</div>',
//             fetchData: null, // (page) => Promise or jqXHR
//             onPageChange: () => {},
//             maxPage: Infinity,
//             rootMargin: '100px'
//         }, options);

//         this.pageNum = 1;
//         this.isLoading = false;
//         this.observer = null;

//         this.init();
//     }

//     init() {
//         const $trigger = $(this.options.triggerSelector);
//         if ($trigger.length === 0 || !this.options.fetchData) return;

//         // 所有现代手机都支持 IntersectionObserver
//         this.observer = new IntersectionObserver(
//             (entries) => {
//                 if (entries[0].isIntersecting && !this.isLoading) {
//                     this.loadMore();
//                 }
//             }, {
//                 rootMargin: this.options.rootMargin
//             }
//         );
//         this.observer.observe($trigger[0]); // 取原生 DOM 元素
//     }

//     loadMore() {
//         if (this.pageNum > this.options.maxPage || this.isLoading) {
//             this.stopAndShowNoMore();
//             return;
//         }

//         this.isLoading = true;
//         const $container = $(this.options.containerSelector);
//         if ($container.length === 0) {
//             this.isLoading = false;
//             return;
//         }

//         $container.append(this.options.loadingHtml);

//         const request = this.options.fetchData(this.pageNum);

//         // 支持 jQuery Deferred（$.ajax）或原生 Promise
//         $.when(request).done((response) => {
//             $('#loading-more').remove();

//             if (response && response.html && response.html.trim()) {
//                 $container.append(response.html);
//                 this.pageNum = response.next_page ?? (this.pageNum + 1);
//                 this.options.onPageChange(this.pageNum - 1);

//                 if (this.pageNum > this.options.maxPage) {
//                     this.stopAndShowNoMore();
//                 }
//             } else {
//                 this.stopAndShowNoMore();
//             }
//         }).fail((xhr, status, error) => {
//             $('#loading-more').remove();
//             console.error('Load more failed:', error);
//             alert('加载失败，请重试。');
//         }).always(() => {
//             this.isLoading = false;
//         });
//     }

//     stopAndShowNoMore() {
//         if (this.observer) {
//             const $trigger = $(this.options.triggerSelector);
//             if ($trigger.length) this.observer.unobserve($trigger[0]);
//             this.observer.disconnect();
//             this.observer = null;
//         }

//         const $container = $(this.options.containerSelector);
//         if ($container.length && !$container.find('.infinite-loader-no-more').length) {
//             $container.append(this.options.noMoreHtml);
//         }
//     }

//     destroy() {
//         this.stopAndShowNoMore();
//     }
// }
