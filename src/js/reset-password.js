$(function () {

    var $passwordInput = $('#password');
    var $confirmationInput = $('#confirmation');

    //使用 input 事件：能捕获所有输入（包括粘贴、语音输入、自动填充）。
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
    $confirmationInput.on('input', function () {
        // var confirmation = $(this).val().trim();
    });
    $confirmationInput.on('blur', function () {
        const confirmation = $(this).val().trim();
        const messageEl = $('#confirmation-message-js');

        if (!confirmation) {
            showError(messageEl, translations.confirmationRequired, $confirmationInput);
        } else {
            const password = $passwordInput.val().trim();
            if (password !== confirmation) {
                showError(messageEl, translations.confirmationMismatch, $confirmationInput);
            } else {
                hideError(messageEl, $confirmationInput);
            }
        }
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

    // 显示密码（点击眼睛）
    $('#display-confirmation-js').on('click', function () {
        $('#confirmation').attr('type', 'text');
        $(this).addClass('d-none');
        $('#hide-confirmation-js').removeClass('d-none');
    });
    // 隐藏密码（点击斜线眼睛）
    $('#hide-confirmation-js').on('click', function () {
        $('#confirmation').attr('type', 'password');
        $(this).addClass('d-none');
        $('#display-confirmation-js').removeClass('d-none');
    });

    //form提交
    $('#reset-password-form').on('submit', function (e) {

        const $form = $(this);
        const $btn = $('#btn-reset-password-js');
        // 防重复提交
        if ($form.data('submitting')) {
            e.preventDefault();
            return false;
        }

        // 验证
        let isValid = true;
        // 触发 blur 验证逻辑（或复用验证函数）
        $('#password, #confirmation').trigger('blur');
        // 检查是否有错误提示显示
        if ($('#password').hasClass('is-invalid') ||
            $('#confirmation').hasClass('is-invalid')) {
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
            // 可选：聚焦第一个错误字段
            if ($('#password').hasClass('is-invalid')) {
                $('#password').focus();
            } else if ($('#confirmation').hasClass('is-invalid')) {
                $('#confirmation').focus();
            }
            return false; // 阻止表单提交
        }

        // 标记并禁用
        $form.data('submitting', true);
        $btn.prop('disabled', true).text(translations.restIng);

    });

});