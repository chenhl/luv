// ========================
// 表单验证函数（移动端优化版）
// ========================
function validateForm($form) {
    let isValid = true;
    $form.find('input').each(function () {
        const $this = $(this);
        const id = $this.attr('id');
        let $msgEle;
        let transKey;
        if (id == 'height_ft' || id == 'height_cm') {
            $msgEle = $('#height-message-js');
            if (id == 'height_ft') {
                transKey = 'heightImperialRange';
            } else {
                transKey = 'heightMetricRange';
            }

        } else if (id == 'weight_lbs' || id == 'weight_kg') {
            $msgEle = $('#weight-message-js');
            if (id == 'weight_lbs') {
                transKey = 'weightImperialRange';
            } else {
                transKey = 'weightMetricRange';
            }
        } else {
            $msgEle = $(`#${id}-message-js`);
            transKey = id + 'Required';
        }
        if (!checkInput($this)) {
            showError($msgEle, translations[transKey], $this);
            isValid = false;
        }
    });
    // // 清除旧错误样式和提示
    // $form.find('.is-invalid').removeClass('is-invalid');
    // $form.find('.invalid-feedback').remove();



    return isValid;
}

//验证输入框
function checkInput($input) {
    const id = $input.attr('id');
    // let $msgEle;
    if (id == 'height_ft' || id == 'height_cm') {
        if ($('#system_metric').is(':checked')) {
            const $cmInput = $('#height_cm');
            const cm = parseFloat($cmInput.val());
            const minCm = parseFloat($cmInput.data('min'));
            const maxCm = parseFloat($cmInput.data('max'));
            if (isNaN(cm) || cm < minCm || cm > maxCm) {
                return false;
            }
        } else {
            const $ftInput = $('#height_ft');
            const ft = parseInt($ftInput.val());
            const minFt = parseInt($ftInput.data('min'));
            const maxFt = parseInt($ftInput.data('max'));
            if (isNaN(ft) || ft < minFt || ft > maxFt) {
                return false;
            }
        }
    } else if (id == 'weight_lbs' || id == 'weight_kg') {

        if ($('#system_metric').is(':checked')) {
            const $kgInput = $('#weight_kg');
            const kg = parseFloat($kgInput.val());
            const minKg = parseFloat($kgInput.data('min'));
            const maxKg = parseFloat($kgInput.data('max'));
            if (isNaN(kg) || kg < minKg || kg > maxKg) {

                return false;
            }
        } else {
            const $lbsInput = $('#weight_lbs');
            const lbs = parseFloat($lbsInput.val());
            const minLbs = parseFloat($lbsInput.data('min'));
            const maxLbs = parseFloat($lbsInput.data('max'));
            if (isNaN(lbs) || lbs < minLbs || lbs > maxLbs) {
                return false;
            }
        }

    } else {
        const value = $input.val().trim();
        const required = $input.prop('required');

        if (required && value === '') {
            return false;
        }
    }
    return true;
}

$(document).ready(function () {
    // Cache DOM elements
    // radio button
    const $systemMetric = $('#system_metric');
    const $systemImperial = $('#system_imperial');
    // Bind events
    $systemMetric.on('change', toggleMeasurementSystem);
    $systemImperial.on('change', toggleMeasurementSystem);
    // Toggle UI based on selected system
    function toggleMeasurementSystem() {
        const $heightMetric = $('#height-metric');
        const $heightImperial = $('#height-imperial');
        const $weightMetric = $('#weight-metric');
        const $weightImperial = $('#weight-imperial');
        if ($systemMetric.is(':checked')) {
            $heightMetric.removeClass('d-none');
            $weightMetric.removeClass('d-none');

            $heightImperial.addClass('d-none');
            $weightImperial.addClass('d-none');
        } else {
            $heightMetric.addClass('d-none');
            $weightMetric.addClass('d-none');

            $heightImperial.removeClass('d-none');
            $weightImperial.removeClass('d-none');
        }
        $('#height-message-js').toggleClass('d-none');
        $('#weight-message-js').toggleClass('d-none');
    }

    // 用户开始输入时清除错误
    $('#edit-account-form input').on('input', function (e) {
        const $this = $(this);
        const id = $this.attr('id');
        let $msgEle;
        if (id == 'height_ft' || id == 'height_cm') {
            $msgEle = $('#height-message-js');
        } else if (id == 'weight_lbs' || id == 'weight_kg') {
            $msgEle = $('#weight-message-js');
        } else {
            $msgEle = $(`#${id}-message-js`);
        }
        hideError($msgEle, $this);
    }).on('blur', function (e) { //失去焦点时验证输入框
        const $this = $(this);
        const id = $this.attr('id');
        let $msgEle;
        let transKey;
        if (id == 'height_ft' || id == 'height_cm') {
            $msgEle = $('#height-message-js');
            if (id == 'height_ft') {
                transKey = 'heightImperialRange';
            } else {
                transKey = 'heightMetricRange';
            }
        } else if (id == 'weight_lbs' || id == 'weight_kg') {
            $msgEle = $('#weight-message-js');
            if (id == 'weight_lbs') {
                transKey = 'weightImperialRange';
            } else {
                transKey = 'weightMetricRange';
            }
        } else {
            $msgEle = $(`#${id}-message-js`);
            transKey = id + 'Required';
        }
        if (!checkInput($this)) {
            showError($msgEle, translations[transKey], $this);
        }
    });

    // //form提交
    $('#edit-account-form').on('submit', function (e) {
        const $form = $('#edit-account-form');
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