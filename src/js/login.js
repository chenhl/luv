$(document).ready(function () {

    var $emailInput = $('#email');
    var $passwordInput = $('#password');
    //使用 input 事件：能捕获所有输入（包括粘贴、语音输入、自动填充）。
    $emailInput.on('input', function () {
        var email = $(this).val().trim();
        $('#btn-clear-email-js').toggleClass('d-none', !email);
    });
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
    $passwordInput.on('input', function () {
        // var password = $(this).val().trim();
        // $('#btn-clear-password-js').toggleClass('d-none', !password);
    });
    $passwordInput.on('blur', function () {
        const password = $(this).val().trim();
        const messageEl = $('#password-message-js');

        if (!password) {
            showError(messageEl, translations.passwordRequired, $passwordInput);
        } else {
            hideError(messageEl, $passwordInput);
        }
    });

    // 点击清除按钮
    $('#btn-clear-email-js').on('click', function () {
        $('#email').val('').focus();
        $(this).addClass('d-none'); // 清空后立即隐藏
    });
    // 显示密码（点击眼睛）
    $('#display-password-js').on('click', function () {
        $('#password').attr('type', 'text');
        $(this).addClass('d-none');
        $('#hide-password-js').removeClass('d-none');
    });
    // 隐藏密码（点击斜线眼睛）
    $('#hide-password-js').on('click', function () {
        $('#password').attr('type', 'password');
        $(this).addClass('d-none');
        $('#display-password-js').removeClass('d-none');
    });

    //form提交 不需要再添加 btn-sign-js的click事件
    $('#login-form').on('submit', function (e) {

        const $form = $(this);
        const $btn = $('#btn-sign-in-js');
        // 防重复提交
        if ($form.data('submitting')) {
            e.preventDefault();
            return false;
        }

        // 验证
        let isValid = true;
        // 触发 blur 验证逻辑（或复用验证函数）
        $('#email, #password').trigger('blur');
        // 检查是否有错误提示显示
        if ($('#email').hasClass('is-invalid') ||
            $('#password').hasClass('is-invalid')) {
            isValid = false;
        }
        if (!isValid) {
            e.preventDefault();
            // 可选：聚焦第一个错误字段
            if ($('#email').hasClass('is-invalid')) {
                $('#email').focus();
            } else {
                $('#password').focus();
            }
            return false; // 阻止表单提交
        }

        // 标记并禁用
        $form.data('submitting', true);
        $btn.prop('disabled', true).text(translations.signInIng);

    });

    // 三方登录
    $('#facebook-signin-js').on('click', function (e) {
        e.preventDefault();
        if (isMobile) {
            openWindow(facebookLoginUrl, '_blank');
        } else {
            //手机版直接跳转
            window.location.href = facebookLoginUrl;
        }
    });
    $('#google-signin-js').on('click', function (e) {
        e.preventDefault();
        if (isMobile) {
            openWindow(googleLoginUrl, '_blank');
        } else {
            window.location.href = googleLoginUrl;
        }
    });

});
