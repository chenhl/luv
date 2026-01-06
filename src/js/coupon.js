$(document).ready(function () {
    // 点击领取优惠券
    $(".btn-redeem-item-js").on('click', function () {
        var $btn = $(this); //按钮
        if ($btn.prop('disabled')) {
            return false;
        }
        //disable button
        $btn.prop('disabled', true).text(translations.redeemIng);

        var coupon_code = $btn.data('code').trim();
        if (coupon_code == '') {
            //enable button
            $btn.prop('disabled', false).text(translations.redeem);
            //show toast message
            showToast(translations.couponCodeRequired, '#toast-js');
            return false;
        }
        // return false; //test
        //参数
        var $data = {
            coupon_code: coupon_code,
        };
        $data[csrfName] = csrfVal;

        $.ajax({
            timeout: 6000,
            dataType: 'json',
            type: 'post',
            data: $data,
            url: redeemCouponUrl,
            success: function (data, textStatus) {
                showToast(data.message, '#toast-js');
                if (data.status == 'success') {
                    setTimeout(function () {
                        window.location.href = couponUrl;
                    }, 1500);
                } else if (data.status == 'login') {
                    setTimeout(function () {
                        window.location.href = data.login_url;
                    }, 1500);
                }
                //enable button
                $btn.prop('disabled', false).text(translations.redeem); //恢复按钮
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(translations.systemError);
                //enable button
                $btn.prop('disabled', false).text(translations.redeem);
            }
        });
    });
    // 输入coupon code 并提交
    $("#btn-coupon-apply-js").on('click', function () {
        var $btn = $(this); //按钮
        if ($btn.prop('disabled')) {
            return false;
        }
        //disable button
        $btn.prop('disabled', true).text(translations.redeemIng);

        var coupon_code = $("#coupon-code-js").val().trim();
        if (coupon_code == '') {
            //enable button
            $btn.prop('disabled', false).text(translations.redeem);
            //show toast message
            showToast(translations.couponCodeRequired, '#toast-js');
            return false;
        }
        // return false; //test
        //参数
        var $data = {
            coupon_code: coupon_code,
        };
        $data[csrfName] = csrfVal;

        $.ajax({
            timeout: 6000,
            dataType: 'json',
            type: 'post',
            data: $data,
            url: redeemCouponUrl,
            success: function (data, textStatus) {
                showToast(data.message, '#toast-js');
                if (data.status == 'success') {
                    setTimeout(function () {
                        window.location.href = couponUrl;
                    }, 1500);
                } else if (data.status == 'login') {
                    setTimeout(function () {
                        window.location.href = data.login_url;
                    }, 1500);
                }
                //清空输入框
                $("#coupon-code-js").val('');
                //enable button
                $btn.prop('disabled', false).text(translations.redeem); //恢复按钮
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(translations.systemError);
                //enable button
                $btn.prop('disabled', false).text(translations.redeem);
            }
        });
    });


});