$(document).ready(function () {
    // 当点击 Billing Address 时：
    $('#billing-address-js').on('click', function (e) {
        e.preventDefault();
        window.location.href = billingAddressUrl;
    });

    // 1 radio change 设置为默认收货地址
    $('#shipping-address-js input[name="address_id"]').on('change', function () {
        const $layer = $('#shipping-address-js');
        const $this = $(this);
        if ($layer.prop('disabled')) {
            return;
        }
        //验证是否选择了地址
        const address_id = $this.val();
        if (!address_id) {
            return;
        }
        // 显示 loading 状态 防止重复点击
        $layer.prop('disabled', true);
        $this.closest('.address-item-js').find('.address-item-name-js').append(' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
        // 发送请求
        $.ajax({
            url: setDefaultUrl,
            type: 'post',
            data: {
                address_id: address_id,
                [csrfName]: csrfVal
            },
            dataType: 'json',
            success: function (response) {
                if (response.status == 'success') {
                    // 刷新当前页面
                    location.reload();
                } else {
                    // 显示错误信息
                    showToast(translations.systemError, '#toast-js');
                    $layer.prop('disabled', false); // 恢复状态
                    $this.closest('.address-item-js').find('.address-item-name-js').find('.spinner-border').remove(); // 移除 loading 图标
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                // 显示错误信息
                showToast(translations.systemError, '#toast-js');
                $layer.prop('disabled', false); // 恢复状态
                $this.closest('.address-item-js').find('.address-item-name-js').find('.spinner-border').remove(); // 移除 loading 图标
            }
        });
    });
});