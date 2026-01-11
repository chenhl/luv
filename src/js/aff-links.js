var message;

$(document).ready(function () {

    // Copy Affiliate Link
    $(document).on('click', '.btn-copy-link-js', function (e) {
        e.preventDefault();
        // 1 获取目标元素
        const $btn = $(this);
        const targetId = $btn.data('clipboard-target'); // 获取 data-clipboard-target 值
        const $input = $('#' + targetId);
        if (!$input.length) {
            console.warn('Copy button target not found:', targetId);
            return;
        }
        const textToCopy = $input.val().trim();
        console.log(textToCopy);
        if (!textToCopy) {
            // 可选：提示用户链接为空
            return;
        }
        // 2 新方案 调用封装好的复制函数 js.js 封装的函数
        copyTextToClipboard(textToCopy).then(function (success) {
            // 切换“Copied”状态
            $btn.find('.copy-label-js').addClass('d-none');
            $btn.find('.copied-label-js').removeClass('d-none');

            setTimeout(function () {
                $btn.find('.copy-label-js').removeClass('d-none');
                $btn.find('.copied-label-js').addClass('d-none');
            }, 2000);
            // 可选：处理失败情况
            if (!success) {
                // console.error('Failed to copy link.');
                // 例如：显示错误提示给用户
            }
        });
    });

    function checkInput($input) {
        const value = $input.val().trim();
        if (!value) {
            message = translations.urlRequired;
            return false;
        }
        if ((!UrlUtils.isValidUrl(value)) || (!UrlUtils.isSameDomain(site_url, value))) {
            message = translations.urlInvalid;
            return false;
        }
        return true;
    }
    /**
     * 失焦验证
     *
     */
    $(document).on('input', '#generate-link-input-js', function () {
        $(this).removeClass("is-invalid");
        // feedback
        $(this).next().removeClass("d-block");
    }).on('blur', '#generate-link-input-js', function () {
        if (!checkInput($(this))) {
            $(this).addClass("is-invalid");
            // feedback
            $(this).next().addClass("d-block").text(message);
        }
    });
    /**
     * Generate Affiliate Link
     *
     */
    $(document).on('click', '#btn-generate-link-js', function (e) {
        e.preventDefault();
        const $btn = $(this);
        const $input = $('#generate-link-input-js');
        const $feedback = $input.next('.invalid-feedback');

        const custom_url = $input.val().trim();
        //隐藏错误提示
        $input.removeClass('is-invalid');
        $feedback.removeClass('d-block').text('');
        //隐藏生成结果
        $('#generated-element-js').addClass('d-none');

        if (!checkInput($input)) {
            //显示错误提示
            $input.addClass('is-invalid');
            $feedback.addClass('d-block').text(message);
        } else {
            // 切换“Generated”状态
            $btn.find('.generate-label-js').addClass('d-none');
            $btn.find('.generated-label-js').removeClass('d-none');

            setTimeout(function () {
                $btn.find('.generate-label-js').removeClass('d-none');
                $btn.find('.generated-label-js').addClass('d-none');
            }, 2000);

            //显示生成结果
            //1 生成链接
            var affiliate_url = UrlUtils.addQueryParam(affKey, affValue, custom_url);
            $('#generated-link-input-js').val(affiliate_url);
            //2 显示生成结果
            $('#generated-element-js').removeClass('d-none');
        }
    });
});