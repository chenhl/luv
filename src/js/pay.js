// ========== 全局状态 ==========
window.PaymentSDKs = window.PaymentSDKs || {
    paypalLoaded: false,
    useepayLoaded: false,
    activeMethod: null
};
// ========== 支付方式管理器 ==========
const PaymentManager = {
    init() {
        // 初始化当前选中项
        const checkedRadio = document.querySelector('input[name="payment_code"]:checked');
        if (checkedRadio) {
            this.switchTo(checkedRadio.value);
        }

        // 监听radio切换
        $(document).on('change', 'input[name="payment_code"]', (e) => {
            this.switchTo(e.target.value);
        });
    },

    switchTo(method) {
        if (window.PaymentSDKs.activeMethod === method) return;

        // 隐藏所有支付体
        $('.payment-body-js').addClass('d-none');

        // 显示目标支付体
        $(`.payment-body-js[data-method="${method}"]`).removeClass('d-none');

        // 初始化对应支付方式
        if (method === 'payment_paypal_sdk') {
            initPayPal();
        } else if (method === 'payment_useepay_sdk') {
            initUseePay();
        }
        window.PaymentSDKs.activeMethod = method;
    }
};

// ========== PayPal 支付逻辑 ==========
function initPayPal() {
    // 获取PayPal整个容器
    const container = document.querySelector('.payment-body-js[data-method="payment_paypal_sdk"]');
    // 如果已渲染，直接返回
    if (!container || container.dataset.initialized === '1') return;
    if (typeof paypal === 'undefined') { //sdk未初始化
        // 加载中 ，则直接返回
        if (window.paypalScriptLoading) return;
        // 加载中
        window.paypalScriptLoading = true;
        //开始加载并渲染button
        webLoadScript(payment_ui_configs.payment_paypal_sdk.paypalSdkUrl + '&components=buttons,card-fields', () => {
            window.paypalScriptLoading = false;
            renderPayPalButtons();
            renderPayPalCardFields();
        });
    } else { //sdk已初始化
        // 开始渲染button
        renderPayPalButtons();
        renderPayPalCardFields();
    }
    container.dataset.initialized = '1';
}

function renderPayPalButtons() {
    //1 获取paypal按钮的容器
    const container = document.getElementById('paypal-buttons-container');
    //2 如果已渲染，直接返回
    if (container.dataset.rendered === '1') return;
    //3 创建button https://developer.paypal.com/sdk/js/reference/#buttons
    paypal.Buttons({
        style: {
            // height:40,// 默认 25-55 之间，
            // disableMaxHeight:true,// 设置true，就可以任意修改上面的height
            // max-width:750,// 默认最大750，
            // disableMaxWidth:true, // 设置true，就可以任意修改上面的max-width
        },
        createOrder: (data, actions) => {
            var data_params = {
                order_sn: orderSN
            };
            return fetch(payment_ui_configs.payment_paypal_sdk.paypalCreateOrderUrl, {
                method: "post",
                body: JSON.stringify(data_params),
                // body: postData,
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((order) => {
                    if (order.id == '-1') {
                        // alert(order.message);
                        throw new Error(order.message);
                        // return false;
                    }
                    return order.id
                })
                .catch((error) => {
                    alert(error);
                    // console.log('There has been a problem with your fetch operation:', error);
                });
        },
        onCancel: (data) => {
            //data的值: {orderID: '35G84664V47979731'}
            //window.location.assign("/your-cancel-page");
            //TODO: 取消支付后的处理逻辑
            // console.log('PayPal支付已取消:', data);
        },
        onApprove: (data, actions) => {
            return fetch(payment_ui_configs.payment_paypal_sdk.paypalCaptureOrderUrl, {
                method: "post",
                body: JSON.stringify(data),
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((orderData) => {
                    if (orderData.order_sn == '-1') {
                        if (!orderData.is_local) { // paypal HttpException
                            if (orderData.error_issue === 'INSTRUMENT_DECLINED') { //INSTRUMENT_DECLINED
                                alert(orderData.message);
                                return actions.restart();
                            } else {
                                throw new Error(orderData.message);
                            }
                        } else { //local Exception: paypal正常支付了但更新本地库失败，需紧急处理
                            alert(orderData.message);
                            // actions.redirect(`${failPayUrl}?order_sn=${orderSN}&error=${orderData.message}`);
                        }
                    }

                    // const transaction = orderData.purchase_units[0].payments.captures[0];
                    // const order_sn = orderData.order_sn; // transaction.status;
                    // actions.redirect(`${finishPayUrl}?order_sn=${orderSN}`);
                    window.location.href = `${finishPayUrl}?order_sn=${orderSN}`;
                })
                .catch((error) => {
                    alert(error);
                    // console.log('There has been a problem with your fetch operation:', error);
                    //Restart the payment
                    // return actions.restart();
                });
        },
        onError: (error) => {
            //处理错误信息
            const errDetail = error.data?.body?.details?.[0];
            if (errDetail) {
                alert(errDetail.description);
            } else {
                const errorMessage = error.data?.body?.message;
                if (errorMessage) {
                    alert(errorMessage);
                } else {
                    alert(translations.sysError);
                }
            }
            //错误信息上报
            fetch(payment_ui_configs.payment_paypal_sdk.paypalErrorReportUrl, {
                method: "post",
                body: JSON.stringify(error),
                headers: {
                    'content-type': 'application/json'
                }
            }).then((response) => { });
        }
    }).render('#paypal-buttons-container');

    //4 标记已渲染
    container.dataset.rendered = '1';
}

function renderPayPalCardFields() {
    $('#paypal-card-result-message-js').empty();
    //1 获取paypal card的容器
    const container = document.getElementById('card-form');
    //2 如果已渲染，直接返回
    if (container.dataset.rendered === '1') return;
    //3 创建cardField
    const cardField = paypal.CardFields({
        createOrder: (data, actions) => {
            var data_params = {
                order_sn: orderSN
            };
            return fetch(payment_ui_configs.payment_paypal_sdk.paypalCardCreateOrderUrl, {
                method: "post",
                body: JSON.stringify(data_params),
                // body: postData,
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((order) => {
                    if (order.id == '-1') {
                        // alert(order.message);
                        throw new Error(order.message);
                        // return false;
                    }
                    return order.id
                })
                .catch((error) => {
                    alert(error);
                    // console.log('There has been a problem with your fetch operation:', error);
                });
        },
        onApprove: (data, actions) => {
            return fetch(payment_ui_configs.payment_paypal_sdk.paypalCardCaptureOrderUrl, {
                method: "post",
                body: JSON.stringify(data),
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((orderData) => {
                    if (orderData.order_sn == '-1') {
                        if (!orderData.is_local) { // paypal HttpException
                            if (orderData.error_issue === 'INSTRUMENT_DECLINED') { //INSTRUMENT_DECLINED
                                alert(orderData.message);
                                return actions.restart();
                            } else {
                                throw new Error(orderData.message);
                            }
                        } else { //local Exception: paypal正常支付了但更新本地库失败，需紧急处理
                            alert(orderData.message);
                            // actions.redirect(`${failPayUrl}?order_sn=${orderSN}&error=${orderData.message}`);
                        }
                    }

                    // const transaction = orderData.purchase_units[0].payments.captures[0];
                    // const order_sn = orderData.order_sn; // transaction.status;
                    // actions.redirect(`${finishPayUrl}?order_sn=${orderSN}`);
                    window.location.href = `${finishPayUrl}?order_sn=${orderSN}`;
                })
                .catch((error) => {
                    alert(error);
                    // console.log('There has been a problem with your fetch operation:', error);
                    //Restart the payment
                    // return actions.restart();
                });
        },
        style: {
            input: {
                "font-size": "16px",
                "font-family": "courier, monospace",
                "font-weight": "lighter",
                color: "#ccc",
            },
            ".invalid": {
                color: "purple"
            },
        },
        onError: (error) => {
            // Handle the error object
            const errDetail = error.data?.body?.details?.[0];
            if (errDetail) {
                $('#paypal-card-result-message-js').empty().text(errDetail.description);
            } else {
                const errorMessage = error.data?.body?.message;
                if (errorMessage) {
                    $('#paypal-card-result-message-js').empty().text(errorMessage);
                } else {
                    $('#paypal-card-result-message-js').empty().text(translations.sysError);
                }
            }
            // Report error to server
            fetch(payment_ui_configs.payment_paypal_sdk.paypalErrorReportUrl, {
                method: "post",
                body: JSON.stringify(error),
                headers: {
                    'content-type': 'application/json'
                }
            }).then((response) => { });
        },
        // onCancel: () => { //不知什么时候触发
        //     console.log("Your order was cancelled due to incomplete verification");
        // },
    });
    if (cardField.isEligible()) {
        // 基于系统自有的billingAddress的name
        // const nameField = cardField.NameField({
        //     style: {
        //         input: {
        //             color: "blue"
        //         },
        //         ".invalid": {
        //             color: "purple"
        //         }
        //     },
        // });
        // nameField.render("#card-name-field-container");

        const numberField = cardField.NumberField({
            style: {
                input: {
                    color: "blue"
                }
            },
            inputEvents: {
                onChange: (data) => {
                    // Do something when an input changes
                },
                onFocus: (event) => {
                    // console.log("returns a stateObject", event);
                    $('#paypal-card-result-message-js').empty();
                },
                onBlur: (data) => {
                    // Do something when a field loses focus
                },
                onInputSubmitRequest: (data) => {
                    if (data.isFormValid) {
                        // Submit the card form for the payer
                    } else {
                        // Inform payer that some fields aren't valid
                    }
                }
            },
        });
        numberField.render("#card-number-field-container");

        const cvvField = cardField.CVVField({
            style: {
                input: {
                    color: "blue"
                }
            },
            inputEvents: {
                onChange: (data) => {
                    // Do something when an input changes
                },
                onFocus: (event) => {
                    // console.log("returns a stateObject", event);
                    $('#paypal-card-result-message-js').empty();
                },
                onBlur: (data) => {
                    // Do something when a field loses focus
                },
                onInputSubmitRequest: (data) => {
                    if (data.isFormValid) {
                        // Submit the card form for the payer
                    } else {
                        // Inform payer that some fields aren't valid
                    }
                }
            },
        });
        cvvField.render("#card-cvv-field-container");

        const expiryField = cardField.ExpiryField({
            style: {
                input: {
                    color: "blue"
                }
            },
            inputEvents: {
                onChange: (data) => {
                    // Do something when an input changes
                },
                onFocus: (event) => {
                    // console.log("returns a stateObject", event);
                    $('#paypal-card-result-message-js').empty();
                },
                onBlur: (data) => {
                    // Do something when a field loses focus
                },
                onInputSubmitRequest: (data) => {
                    if (data.isFormValid) {
                        // Submit the card form for the payer
                    } else {
                        // Inform payer that some fields aren't valid
                    }
                }
            },
        });
        expiryField.render("#card-expiry-field-container");

        // // Add click listener to submit button and call the submit function on the CardField component
        // document
        //     .getElementById("card-field-submit-button")
        //     .addEventListener("click", () => {
        //         cardField
        //             .submit({
        //                 // 基于系统自有的billingAddress
        //                 billingAddress: {
        //                     addressLine1: billingAddress.street1,
        //                     addressLine2: billingAddress.street2,
        //                     adminArea1: billingAddress.state,
        //                     adminArea2: billingAddress.city,
        //                     countryCode: billingAddress.country,
        //                     postalCode: billingAddress.zip,
        //                 },
        //             })
        //             .then(() => {
        //                 // submit successful
        //             });
        //     });
        $("#card-field-submit-button").on("click", function () {
            const $btn = $(this); // jQuery 对象，便于操作
            // 防重复点击：按钮已禁用或正在处理中则直接返回
            if ($btn.prop("disabled") || $btn.data("processing")) return;
            // 保存原始文本，禁用按钮并更新状态
            const originalText = $btn.html();
            $btn.prop("disabled", true)
                .data("processing", true)
                .html('<span class="spinner-border spinner-border-sm" role="status"></span> ' + translations.restIng);
            // 清空提示信息    
            $('#paypal-card-result-message-js').empty();
            // 执行支付提交
            cardField.submit({
                // billingAddress: {
                //     addressLine1: billingAddress.street1,
                //     addressLine2: billingAddress.street2,
                //     adminArea1: billingAddress.state,
                //     adminArea2: billingAddress.city,
                //     countryCode: billingAddress.country,
                //     postalCode: billingAddress.zip,
                // }
            })
                .then(() => {
                    // ✅ 提交成功：可跳转或提示（根据业务逻辑）
                    // window.location.href = "/success";
                })
                .catch(error => {
                    // 上面的onError回调中会返回错误信息，这里不需要处理

                    // console.error("cardField.submit error: " + error);
                    // ❌ 失败提示（示例）
                    // alert("cardField.submit error: " + error);
                })
                .finally(() => {
                    // 无论成功/失败，恢复按钮状态
                    $btn.prop("disabled", false)
                        .removeData("processing")
                        .html(originalText);
                });
        });
        $('#card-field-submit-button').removeClass('d-none');
        $('#paypal-card-or-js').removeClass('d-none');
    } else {
        $('#card-field-submit-button').addClass('d-none');
        $('#paypal-card-or-js').addClass('d-none');
    }
    //4 标记已渲染
    container.dataset.rendered = '1';
}


// ========== UseePay 支付逻辑 ==========
function initUseePay() {
    //useepay 只提供form表单，不提供button按钮
    // 获取整个容器：form表单 + 自定义按钮
    const container = document.querySelector('.payment-body-js[data-method="payment_useepay_sdk"]');
    // 如果容器不存在或者已经初始化过，则返回
    if (!container || container.dataset.initialized === '1') return;
    if (typeof useePay === 'undefined') { // sdk 未初始化
        // 加载中... 则直接返回
        if (window.useepayScriptLoading) return;
        // 加载中标识
        window.useepayScriptLoading = true;
        // 加载sdk并渲染容器
        webLoadScript(payment_ui_configs.payment_useepay_sdk.useepaySdkUrl, () => {
            window.useepayScriptLoading = false;
            setupUseePay();
        });
    } else { //sdk已初始化
        setupUseePay();
    }
    container.dataset.initialized = '1';
}

function setupUseePay() {
    //1 获取useepay表单容器
    const container = document.getElementById('useepayCardElement');
    //2 如果已渲染，直接返回
    if (container.dataset.rendered === '1') return;
    //初始化容器
    const useepay = UseePay({
        env: payment_ui_configs.payment_useepay_sdk.useepay_env,
        merchantNo: payment_ui_configs.payment_useepay_sdk.useepay_merchant_no,
        layout: 'multiLine',
        locale: navigator.language
    });
    useepay.mount(container);

    let $submitBtn = $('#useepaySubmit');
    // 监听表单输入
    useepay.on('change', (valid, code, message) => {
        if (valid) {
            // 设置按钮状态为可用
            $submitBtn.prop('disabled', false);
            // 隐藏错误提示
            $('#useepayErrorTip').removeClass('d-block').text('');
        } else {
            // 设置按钮状态为不可用
            $submitBtn.prop('disabled', true);
            // 显示错误提示
            $('#useepayErrorTip').addClass('d-block').text(message);
        }
    });

    // 定义提交表单事件
    $submitBtn.off('click').on('click', function () {
        // 1、禁用按钮，防止重复点击
        if ($submitBtn.prop('disabled')) {
            return;
        }
        // 2、设置按钮状态为提交中......  
        $submitBtn.prop('disabled', true).text(translations.restIng);
        // 3、提交 验证表单是否有效 
        useepay.validate((valid, code, message) => {
            // 3-1、验证
            if (!valid) { //验证失败
                //显示错误信息
                $('#useepayErrorTip').addClass('d-block').text(message);
                //恢复按钮
                $submitBtn.prop('disabled', false).text(translations.payOrderText);
                return;
            }
            // 3-2、提交
            $.ajax({
                url: payment_ui_configs.payment_useepay_sdk.useepayCreateTokenUrl,
                async: false, // 同步请求，等待服务器响应
                method: 'POST',
                data: {
                    order_sn: orderSN,
                    // =======客户端 浏览器browser数据 start
                    deviceChannel: 'browser',
                    acceptHeader: navigator.userAgent,
                    colorDepth: screen.colorDepth,
                    javaEnabled: navigator.javaEnabled ? 'true' : 'false',
                    language: navigator.language,
                    screenHeight: screen.height,
                    screenWidth: screen.width,
                    timeZoneOffset: new Date().getTimezoneOffset(),
                    userAgent: navigator.userAgent
                    // =======客户端 浏览器browser数据 end
                },
                success: function (res) {
                    // 恢复按钮
                    $submitBtn.prop('disabled', false).text(translations.payOrderText);
                    // 3-2-1、提交失败
                    if (res.status !== 'success') {
                        alert(res.message);
                        return;
                    }
                    // 3-2-2、提交成功 开始确认订单
                    useepay.confirm(res.data.token, function (confirmRes) {
                        // 3-2-2-1、恢复按钮
                        $submitBtn.prop('disabled', false).text(translations.payOrderText);
                        // 3-2-2-2、确认订单失败
                        if (!confirmRes.success) {
                            alert(confirmRes.message);
                            return;
                        }
                        // 3-2-2-3、跳转确认订单结果页
                        $.ajax({
                            url: payment_ui_configs.payment_useepay_sdk.useepayResultUrl,
                            async: false, // 同步请求，等待服务器响应
                            method: 'POST',
                            data: JSON.parse(confirmRes.data),
                            success: function (result) {
                                if (result.status === 'success') {
                                    window.location.href = finishPayUrl + '?order_sn=' + orderSN;
                                } else {
                                    alert(result.message);
                                }
                            }
                        });
                    });
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert('Oops! Something went wrong. Please try again in a few minutes.');
                    //enable button
                    $submitBtn.prop('disabled', false).text(translations.payOrderText);
                }
            });
        });
    });

    //4 标记已渲染
    container.dataset.rendered = '1';
}

// ========== billing address ==========
function checkAddressInput($input) {
    const value = $input.val();
    const required = $input.prop('required');
    if (required && value === '') {
        return false;
    }
    if ($input.attr('name') == 'editForm[billing_email]') {
        if (!check_email(value)) {
            return false;
        }
    }
    return true;
}
// State reload by country
function loadStatesByCountry(country) {
    $.get(changeCountryUrl, {
        country: country
    })
        .done(function (data) {
            $("#address-state-js").html(data.stateHtml);
        }).fail(function () {
            alert('Failed to load states');
        });
}
//加载账单地址
function loadBillingAddress() {
    var url = billingAddressDetailUrl + '?order_sn=' + orderSN;
    $.get(url)
        .done(function (data) {
            // 从返回的 HTML 中提取选中地址的信息
            $('#current-billing-address-name-js').text(data.title);
            $('#current-billing-address-full-js').text(data.full);
            // billingAddress = data.address;
            // console.log(billingAddress);
        })
        .fail(function () {
            alert('Failed to load address list');
        });
}
// 打开 表单Offcanvas 的通用函数 -- 新增或编辑
function openBillingAddressForm() {
    // listOffcanvas.on('hidden.bs.offcanvas', function handler() {	
    var url = billingAddressFormUrl + '?order_sn=' + orderSN;
    $('#billingAddressFormLabel').text(translations.titleBillingAddressFormEdit); // 修改标题
    $.get(url)
        .done(function (html) {
            // 注入表单到 Offcanvas body
            $('#billingAddressFormOffcanvas .offcanvas-body').html(html.html);
            // 显示表单 Offcanvas
            const formOffcanvas = new bootstrap.Offcanvas(document.getElementById('billingAddressFormOffcanvas'));
            formOffcanvas.show();
        })
        .fail(function () {
            alert('Failed to load billing address form'); // 处理错误
        });
}

function collectBillingAddressData() {
    var result = {
        success: true,
        data: {},
        error: {},
    };
    $('#billing-address-form input, #billing-address-form select').each(function () {
        var $this = $(this);
        if (!checkAddressInput($this)) {
            result.success = false;
            result.error = $this; //记录一个错误就返回
            return false; //break
        } else {
            if (typeof $this.attr('name') != 'undefined') {
                var key = $this.attr('name'); //表单字段名
                var value = $this.val(); //表单字段值
                result.data[key] = value;

                if (key == 'editForm[state]') { //省/州 的名称处理
                    if ($this.attr('id') == 'state-select-js') {
                        result.data['editForm[state_name]'] = $this.find('option:selected').text(); //省/州名称
                    } else {
                        result.data['editForm[state_name]'] = value; //省/州名称
                    }
                }
            }
        }
    });

    // result.data['order_sn'] = orderSN; //订单号 根据主键id更新 这个不需要
    return result;
}


$(document).ready(function () {
    // ==============支付模块
    PaymentManager.init();
    // ==============账单地址模块
    // 当点击 Billing Address 时：
    $('#billing-address-js').on('click', function () {
        openBillingAddressForm();
        // 3. 阻止默认行为(提交表单)
        return false;
    });
    //当 Form 提交成功或关闭时，自动返回 List（提升体验）
    document.getElementById('billingAddressFormOffcanvas').addEventListener('hidden.bs.offcanvas', function () {
        // 重新加载账单地址（通过 AJAX）
        loadBillingAddress();
    });
    // ========== country modal 收货地址和账单地址的公共方法===========开始
    // 监听 Modal 即将打开（Bootstrap 5 事件）
    $('#countryModal').on('show.bs.modal', function (e) {
        // 1. 获取当前已选国家 code
        const currentCode = $('#country-code-input-js').val(); // 可能是空字符串
        // 2. 清除之前所有选中状态（移除 check icon）
        $('.country-item-js .country-checked-js').remove();
        if (currentCode) {
            // 3. 查找匹配的 country-item
            const $item = $('.country-item-js[data-code="' + currentCode + '"]');
            if ($item.length) {
                // 4. 添加选中标记
                $item.find('span').after('<span class="country-checked-js"><i class="fa-solid fa-check text-danger"></i></span>');
                // 5. 确保所在字母组可见（如果是按字母分组）
                const $group = $item.closest('.alphabet-group-js');
                if ($group.length) {
                    $group.removeClass('d-none');
                }
                // 6. 滚动到该元素（稍等 DOM 更新）
                setTimeout(() => {
                    $item[0].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
                return; // 选中完成
            }
        }
        // 如果没找到（或为空），默认滚动到“常用国家”顶部
        setTimeout(() => {
            document.getElementById('common-group-js')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    });
    // 字母导航点击
    $(document).on('click', '.alphabet-js', function () {
        const letter = $(this).attr('rel');
        const $group = $('#alphabet-' + letter);
        if ($group.hasClass('d-none')) {
            $group.removeClass('d-none');
        }
        // 滚动到该字母组
        $group[0].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
    // 使用事件委托（因为 country-item 是静态但可能被重复操作）
    $(document).on('click', '.country-item-js', function () {
        const code = $(this).data('code');
        const name = $(this).data('name');
        // 更新表单字段
        $('#country-code-input-js').val(code);
        $('#country-name-readonly-js').val(name); //readonly 国家名称
        $('#country-name-input-js').val(name); //hidden 国家名称
        // 清除所有
        // $('.country-item-js .country-checked-js').remove();
        // 关闭 Modal
        $('#countryModal').modal('hide');
        // 可选：触发省/州联动加载
        loadStatesByCountry(code);
    });
    // ========== country modal 收货地址和账单地址的公共方法===========结束

    // billing address 信息表单验证
    $(document).on('focus', '#billing-address-form input:not([readonly])', function () {
        $(this).removeClass("is-invalid");
        // feedback
        $(this).next().removeClass("d-block");
    }).on('blur', '#billing-address-form input:not([readonly])', function () {
        if (!checkAddressInput($(this))) {
            $(this).addClass("is-invalid");
            // feedback
            $(this).next().addClass("d-block");
        }
    });
    //提交billing address信息 修改
    $(document).on('click', '#btn-save-billing-address-js', function () {
        var $btn = $(this);
        if ($btn.prop('disabled')) {
            return false;
        }
        //disable button
        $btn.prop('disabled', true).text(translations.savIng);
        //收集表单数据
        var addressData = collectBillingAddressData();
        // // test
        // console.log(addressData);
        // $(this).prop('disabled', false).text(translations.save);
        // return false;

        if (!addressData.success) {
            //enable button
            $(this).prop('disabled', false).text(translations.save);
            // feedback
            addressData.error.addClass("is-invalid");
            addressData.error.next().addClass("d-block");
            return false;
        }
        $.ajax({
            url: billingAddressSaveUrl,
            timeout: 6000,
            dataType: 'json',
            type: 'post',
            data: addressData.data,
            success: function (data) {
                $btn.prop('disabled', false).text(translations.save);
                if (data.status == 'success') {
                    //关闭billing address表单offcanvas dialog
                    bootstrap.Offcanvas.getInstance(document.getElementById('billingAddressFormOffcanvas'))?.hide();
                    //显示toast提示信息
                    showToast(translations.toastUpdateBillingAddressSuccess, '#toast-js');
                } else {
                    alert(data.message);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Oops! Something went wrong. Please try again in a few minutes.');
                //enable button
                $btn.prop('disabled', false).text(translations.save);
            }
        });
    });


});