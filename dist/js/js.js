function isStrictMode() {
    return (function () { return !this; })();
}
// console.log(isStrictMode()); // if true, strict mode is on
function isSurportedLoading() {
    return 'loading' in HTMLImageElement.prototype;
}
// console.log(isSurportedLoading()); // if true, loading attribute is supported

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

$(document).ready(function () {

    const currentBaseUrl = $("#currentBaseUrl").val();
    if (currentBaseUrl) {
        const loginInfoUrl = currentBaseUrl + "/member/ajax";
        const product_id = $("#cart_product_spu").val(); 
        product_id = product_id ? product_id : null;
        if (product_id) {
            const ajax_params = {
                'product_id': product_id
            };
        } else {
            const ajax_params = {};
        }
        $.ajax({
            async: true,
            timeout: 6000,
            dataType: 'json',
            type: 'get',
            data: ajax_params,
            url: loginInfoUrl,
            success: function (data, textStatus) {

                if (data.loginStatus) {
                    $(".header_welcome").show();
                    $(".header_account").hide();
                }

                if (data.favorite) {
                    $('.product-favorite').addClass("icon-like");
                    $('.product-favorite').addClass("wish-pink");

                }

                if (data.favorite_product_count) {
                    // $(".header-right-user-wishlist-num-js").html(data.favorite_product_count);
                }

                if (data.affiliate) {
                    $(".affiliate_link-js").show();
                }

                if (data.cart_qty) {
                    $(".bag-count").text(data.cart_qty);
                    $(".num-tag").text(data.cart_qty);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) { }
        });
    }
    $(".app-header-left .showMenu").click(function () {
        $(".js-side-nav.side-nav").addClass("side-nav--visible");
        $(".js-side-nav-container").css({ left: "-8rem" });
        $(".js-side-nav-container").animate({ left: "0" }, 400);
    });

    $(".js-side-nav.side-nav").click(function () {
        $(".js-side-nav.side-nav").removeClass("side-nav--visible");

    });
    $(".js-side-nav-container").click(function (e) {
        e.stopPropagation();
    });

    $("body").on("click", ".span_click", function () {
        url = $(this).attr('rel');
        window.location.href = url;
    });

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
            url: currentBaseUrl + "/member/account/subscribe",
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


/////////////////////////////// 

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


function getUrlParams() {
    // get current page URL
    const url = new URL(window.location.href);
    // create URLSearchParams
    const searchParams = new URLSearchParams(url.search);

    // loop all params
    // for (const [key, value] of searchParams.entries()) {
    //     // console.log(`Key: ${key}, Value: ${value}`);
    // }

    // return searchParams object;
    return searchParams;
}


///////////////////////

/////////////////////// start product
const product_history_key = 'viewed_products';
function saveProductToLocalStorage(product_id, maxHistoryLength = 30) {
    let productHistory = JSON.parse(localStorage.getItem(product_history_key)) || [];
    // product_id exits
    const index = productHistory.indexOf(product_id);
    if (index > -1) {
        productHistory.splice(index, 1);
    }
    productHistory.unshift(product_id);
    // max length
    if (productHistory.length > maxHistoryLength) {
        productHistory = productHistory.slice(0, maxHistoryLength); // move
    }
    // save local
    localStorage.setItem(product_history_key, JSON.stringify(productHistory));
}
function fetchAndDisplayViewedProducts(history_url) {
    let productHistory = JSON.parse(localStorage.getItem(product_history_key) || '[]');
    if (productHistory.length === 0) {
        return;
    }
    const viewedProductsElement = $('#viewed-products');
    viewedProductsElement.empty();
    // get products
    $.ajax({
        url: history_url,
        method: 'POST',
        data: { productIds: productHistory },
        success: function (response) {
            viewedProductsElement.html(response.html);
            lazyLoadInstance.update(); // lazy load
        },
        error: function () {
            viewedProductsElement.html('<p>Failed to load viewed products.</p>');
        }
    });

}
/////////////////////// end product

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
