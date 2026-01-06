$(document).ready(function () {
    const $form = $('#edit-password-form');
    const $btn = $('#change-password-btn-js');
    const $currentPasswordInput = $('#current-password');
    const $passwordInput = $('#password');
    const $confirmationInput = $('#confirmation');
    //==================start=================
    // --- 验证逻辑（复用）---
    function validateField($input, field) {
        const val = $input.val().trim();
        const $msg = $(`#${field}-message-js`);
        if (!val) {
            let msgKey;
            if (field === 'current-password') msgKey = 'currentPasswordRequired';
            else if (field === 'password') msgKey = 'newPasswordRequired';
            else msgKey = 'newConfirmationRequired';
            showError($msg, translations[msgKey], $input);
            return false;
        }
        if (field === 'password' && val.length < min_pass_length) {
            showError($msg, translations.newPasswordMinLength, $input);
            return false;
        }
        if (field === 'confirmation') {
            const pwd = $passwordInput.val().trim();
            if (pwd !== val) {
                showError($msg, translations.confirmationMismatch, $input);
                return false;
            }
        }
        hideError($msg, $input);
        return true;
    }
    // --- 实时清除错误 ---
    [$currentPasswordInput, $passwordInput, $confirmationInput].forEach($el => {
        //使用 input 事件：能捕获所有输入（包括粘贴、语音输入、自动填充）。
        $el.on('input', function () {
            hideError($(`#${this.id}-message-js`), $(this));
        });
    });
    // --- 失焦验证 ---
    $currentPasswordInput.on('blur', () => validateField($currentPasswordInput, 'current-password'));
    $passwordInput.on('blur', () => validateField($passwordInput, 'password'));
    $confirmationInput.on('blur', () => validateField($confirmationInput, 'confirmation'));
    // --- 密码可见切换（可封装，此处保持简洁）---
    function togglePasswordVisibility(inputId, showId, hideId) {
        $(`#${showId}`).on('click', function () {
            $(`#${inputId}`).attr('type', 'text');
            $(this).addClass('d-none');
            $(`#${hideId}`).removeClass('d-none');
        });
        $(`#${hideId}`).on('click', function () {
            $(`#${inputId}`).attr('type', 'password');
            $(this).addClass('d-none');
            $(`#${showId}`).removeClass('d-none');
        });
    }
    togglePasswordVisibility('current-password', 'display-current-password-js', 'hide-current-password-js');
    togglePasswordVisibility('password', 'display-password-js', 'hide-password-js');
    togglePasswordVisibility('confirmation', 'display-confirmation-js', 'hide-confirmation-js');

    // --- AJAX 提交 ---
    $btn.on('click', function () {
        // 1. 触发验证
        const isCurrentValid = validateField($currentPasswordInput, 'current-password');
        if (!isCurrentValid) {
            $currentPasswordInput[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            return;
        }
        const isNewValid = validateField($passwordInput, 'password');
        if (!isNewValid) {
            $passwordInput[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            return;
        }
        const isConfirmValid = validateField($confirmationInput, 'confirmation');
        if (!isConfirmValid) {
            $confirmationInput[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            return;
        }

        // 2. 防重复提交
        if ($form.data('submitting')) return;
        $form.data('submitting', true);
        $btn.prop('disabled', true).text(translations.waiting);

        // 3. 收集数据
        const formData = $form.serialize(); // 包含 CSRF + editForm[xxx]

        // 4. AJAX 请求
        $.ajax({
            url: changePwdUrl,
            method: 'POST',
            data: formData,
            dataType: 'json',
            success: function (response) {
                //恢复状态
                $form.data('submitting', false);
                $btn.prop('disabled', false).text(translations.changePasswordBtn);

                if (response.status === 'success') {
                    showToast(translations.changeSuccess, '#toast-js');
                    // ✅ 成功后：跳转到登录页（安全最佳实践）
                    setTimeout(() => {
                        window.location.href = loginUrl;
                    }, 1500);
                } else {
                    showToast(response.message, '#toast-js');
                }
            },
            error: function () {
                //恢复状态
                $form.data('submitting', false);
                $btn.prop('disabled', false).text(translations.changePasswordBtn);

                showToast(translations.systemError, '#toast-js');

            }
        });
    });
    //==================end=================

});
