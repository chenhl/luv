// 收集收货地址表单数据
function collectAddressData() {
    var result = {
        success: true,
        data: {},
        error: {},
    };
    $('#address-form input, #address-form select').each(function () {
        var $this = $(this);
        if (!checkAddressInput($this)) {
            result.success = false;
            result.error = $this; //记录一个错误就返回
            return false; //break
        } else {
            if (typeof $this.attr('name') != 'undefined') {
                result.data[$this.attr('name')] = $this.val();
            }
        }
    });
    return result;
}

function checkAddressInput($input) {
    const value = $input.val();
    const required = $input.prop('required');
    if (required && value === '') {
        return false;
    }
    if ($input.attr('name') == 'editForm[email]') {
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

$(document).ready(function () {
    // address 信息表单验证
    $(document).on('focus', '#address-form input:not([readonly])', function () {
        $(this).removeClass("is-invalid");
        // feedback
        $(this).next().removeClass("d-block");
    }).on('blur', '#address-form input:not([readonly])', function () {
        // console.log($(this).attr('name'));
        if (!checkAddressInput($(this))) {
            $(this).addClass("is-invalid");
            // feedback
            $(this).next().addClass("d-block");
        }
    });


    //3 提交address信息 新增或修改
    $(document).on('click', '#btn-save-address-js', function () {
        var $btn = $(this);
        if ($btn.prop('disabled')) {
            return false;
        }
        //disable button
        $btn.prop('disabled', true).text(translations.savIng);

        var addressData = collectAddressData(); //收集表单数据
        // console.log(addressData);
        if (!addressData.success) {
            //enable button
            $(this).prop('disabled', false).text(translations.save);
            // feedback
            addressData.error.addClass("is-invalid");
            addressData.error.next().addClass("d-block");
            return false;
        }

        // return false
        $.ajax({
            url: addressSaveUrl,
            timeout: 6000,
            dataType: 'json',
            type: 'post',
            data: addressData.data,
            success: function (data) {
                $btn.prop('disabled', false).text(translations.save);
                if (data.status == 'success') {
                    // //关闭address表单offcanvas dialog
                    // bootstrap.Offcanvas.getInstance(document.getElementById('addressFormOffcanvas'))?.hide();
                    // 跳转刷新地址列表
                    window.location.href = addressListUrl;

                    // //显示toast提示信息
                    // if (addressData.data['editForm[address_id]']) {
                    // 	showToast(translations.toastUpdateAdressSuccess, '#toast-js'); //显示提示信息	
                    // } else {
                    // 	showToast(translations.toastAddAdressSuccess, '#toast-js'); //显示提示信息	
                    // }
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
    // // 3 form提交
    // $('#address-form').on('submit', function(e) {
    // 	const $form = $('#address-form');
    // 	const $btn = $('#btn-save-address-js');
    // 	// 防重复提交
    // 	if ($form.data('submitting')) {
    // 		e.preventDefault();
    // 		return false;
    // 	}
    // 	// 验证表单
    // 	if (!validateForm($form)) {
    // 		e.preventDefault();
    // 		// ✅ 手机端：不 focus，不滚动，只显示错误
    // 		return false;
    // 	}
    // 	// 标记并禁用
    // 	$form.data('submitting', true);
    // 	$btn.prop('disabled', true).text(translations.savIng);
    // });
    // ==========country modal============
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
                // 4. 添加选中标记（复用你原有的图标）
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

    // Country select
    // 使用事件委托（因为 country-item 是静态但可能被重复操作）
    $(document).on('click', '.country-item-js', function () {
        const code = $(this).data('code');
        const name = $(this).data('name');

        // 更新表单字段
        $('#country-code-input-js').val(code);
        $('#country-name-input-js').val(name);

        // 清除所有
        // $('.country-item-js .country-checked-js').remove();

        // 关闭 Modal
        $('#countryModal').modal('hide');

        // 可选：触发省/州联动加载
        loadStatesByCountry(code);
    });
    // ==========country modal============
});