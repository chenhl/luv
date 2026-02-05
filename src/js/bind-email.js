function t(text, ...args) {
    return args.length ? text.replace(/{(\d+)}/g, (match, number) => args[number] || match) : text;
}

function validateEmail(email) {
    const messageEl = $('#email-message-js');
    if (!email) {
        showError(messageEl, translations.emailRequired, $emailInput);
        return false;
    }
    if (!isValidEmail(email)) {
        showError(messageEl, translations.emailInvalid, $emailInput);
        return false;
    }
    hideError(messageEl, $emailInput);
    return true;
}

$(document).ready(function () {

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
    var $verificationCodeInput = $('#verification_code');
    //验证时机：使用 blur 事件（离开焦点时触发）
    $verificationCodeInput.on('blur', function () {
        // const verificationCode = $(this).val().trim();
        // const messageEl = $('#verification_code-message-js');
        // if (!verificationCode) {
        //     showError(messageEl, translations.verificationCodeRequired, $verificationCodeInput);
        // } else {
        //     hideError(messageEl, $verificationCodeInput);
        //     $(this).removeClass('is-invalid');
        // }
    });
    $('#agree').on('change', function () {
        if ($(this).is(':checked')) {
            $(this).removeClass('is-invalid');
        } else {
            $(this).addClass('is-invalid');
        }
    });

    //发送验证码到邮箱
    $('#btn-send-code-js').on('click', function (e) {
        // disable the button 
        $(this).prop('disabled', true);

        const email = $emailInput.val().trim();
        const messageEl = $('#email-message-js');
        if (!email) {
            showError(messageEl, translations.emailRequired, $emailInput);
            //enable the button
            $(this).prop('disabled', false);
            return;
        } else if (!isValidEmail(email)) {
            showError(messageEl, translations.emailInvalid, $emailInput);
            //enable the button
            $(this).prop('disabled', false);
            return;
        }

        var data = {
            email: email,
        };
        data[csrfName] = csrfVal;

        $.ajax({
            url: sendCodeUrl,
            // async: false,//// ❌ 同步 AJAX 已被现代浏览器弃用，会导致页面卡死
            method: 'POST',
            data: data,
            success: function (response) {
                // console.log('Verification code sent successfully:', response);
                if (response.status == 'success') {
                    //start countdown logic
                    var countdown = countdownTime;
                    var interval = setInterval(function () {
                        if (countdown === 0) {

                            // countdown is 0, so we stop the interval
                            clearInterval(interval);
                            $('#btn-send-code-js')
                                .text(translations.sendCodeText) // recover the button text
                                .prop('disabled', false); // enable the button
                        } else {
                            // update the button text with countdown
                            $('#btn-send-code-js').text(t(translations.resendText, countdown));
                            countdown--;
                        }
                    }, 1000); //execute every second
                } else {
                    // if failed, recover the button state
                    console.error('Failed to send verification code:', response);
                    alert(response.message);
                    $('#btn-send-code-js')
                        .text(translations.sendCodeText)
                        .prop('disabled', false);
                }
            },
            error: function (error) {
                // console.error('Failed to send verification code:', error);
                // if failed, recover the button state
                alert(translations.sendCodeError);
                $('#btn-send-code-js')
                    .text(translations.sendCodeText)
                    .prop('disabled', false);
            }
        });

    });
    //form验证 提交 
    $('#bind-form').on('submit', function (e) {

        const $form = $(this);
        const $btn = $('#btn-bind-email-js');
        // 防重复提交
        if ($form.data('submitting')) {
            e.preventDefault();
            return false;
        }

        // 验证
        let isValid = true;
        // 触发 blur 验证逻辑（或复用验证函数）
        $('#email,#verification_code').trigger('blur');
        if (!$('#agree').is(':checked')) {
            $('#agree').addClass('is-invalid');
        }

        // 检查是否有错误提示显示
        if ($('#email').hasClass('is-invalid') ||
            $('#verification_code').hasClass('is-invalid') ||
            $('#agree').hasClass('is-invalid')
        ) {
            isValid = false;
        }
        if (!isValid) {
            e.preventDefault();
            // 可选：聚焦第一个错误字段
            if ($('#email').hasClass('is-invalid')) {
                $('#email').focus();
            } else if ($('#verification_code').hasClass('is-invalid')) {
                $('#verification_code').focus();
            } else if ($('#agree').hasClass('is-invalid')) {
                $('#agree').focus();
            }

            return false; // 阻止表单提交
        }

        // 标记并禁用
        $form.data('submitting', true);
        $btn.prop('disabled', true).text(translations.bindIng);

    });

});