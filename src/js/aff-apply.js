//验证输入框
function checkInput($input) {
    const value = $input.val().trim();
    const required = $input.prop('required');
    if (required && value === '') {
        return false;
    }
    return true;
}

function validateForm($form) {
    let isValid = true;
    $form.find('input').each(function () {
        const $this = $(this);
        const id = $this.attr('id');
        if (!checkInput($this)) {
            $this.addClass("is-invalid");
            // feedback
            $this.next().addClass("d-block");
            isValid = false;
        }
    });
    return isValid;
}
$(document).ready(function () {
    // 信息表单验证
    $(document).on('input', '#settings-form input', function () {
        $(this).removeClass("is-invalid");
        // feedback
        $(this).next().removeClass("d-block");
    }).on('blur', '#settings-form input', function () {
        if (!checkInput($(this))) {
            $(this).addClass("is-invalid");
            // feedback
            $(this).next().addClass("d-block");
        }
    });

    // //form提交
    $('#settings-form').on('submit', function (e) {
        const $form = $('#settings-form');
        const $btn = $('#btn-save-js');
        // 防重复提交
        if ($form.data('submitting')) {
            e.preventDefault();
            return false;
        }
        // 验证表单
        if (!validateForm($form)) {
            e.preventDefault();
            // ✅ 手机端：不 focus，不滚动，只显示错误
            return false;
        }
        // 标记并禁用
        $form.data('submitting', true);
        $btn.prop('disabled', true).text(translations.waitingText);

    });
});