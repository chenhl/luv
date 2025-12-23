$(function () {

    var $emailInput = $('#email');
    //验证时机：使用 blur 事件（离开焦点时触发）
    $emailInput.on('blur', function () {
        const email = $(this).val().trim();
        const messageEl = $('#email-message-js');
        if (!email) {
            showError(messageEl, translations.emailRequired, $emailInput);
        } else if (!isValidEmail(email)) {
            showError(messageEl, translations.emailInvalid, $emailInput);
        } else {
            hideError(messageEl, $emailInput);
            $(this).removeClass('is-invalid');
        }
    });
    if (forgotCaptcha) {
        var $captchaInput = $('#captcha');
        $captchaInput.on('blur', function () {
            const captcha = $(this).val().trim();
            const messageEl = $('#captcha-message-js');
            if (captcha == '') {
                showError(messageEl, translations.captchaRequired, $captchaInput);
            } else {
                hideError(messageEl, $captchaInput);
                $(this).removeClass('is-invalid');
            }
        });

    }

    //form提交 不需要再添加 btn-sign-js的click事件
    $('#forgot-form').on('submit', function (e) {

        const $form = $(this);
        const $btn = $('#btn-send-js');
        // 防重复提交
        if ($form.data('submitting')) {
            e.preventDefault();
            return false;
        }

        // 验证
        let isValid = true;
        // 触发 blur 验证逻辑（或复用验证函数）
        $('#email').trigger('blur');
        if (forgotCaptcha) {
            $('#captcha').trigger('blur');
        }
        // 检查是否有错误提示显示
        if ($('#email').hasClass('is-invalid')) {
            isValid = false;
        }
        if (!isValid) {
            e.preventDefault();
            // 可选：聚焦第一个错误字段
            if ($('#email').hasClass('is-invalid')) {
                $('#email').focus();
            }
            if (forgotCaptcha && $('#captcha').hasClass('is-invalid')) {
                $('#captcha').focus();
            }

            return false; // 阻止表单提交
        }

        // 标记并禁用
        $form.data('submitting', true);
        $btn.prop('disabled', true).text(translations.sendIng);

    });


});