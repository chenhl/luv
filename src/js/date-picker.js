function getFormattedTimeZone() {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(offset / 60);
    const sign = offset < 0 ? '+' : '-';
    return `${sign}${hours.toString().padStart(2, '0')}`;
}

$(document).ready(function () {
    var date_picker_element = $('.slicewp-date-picker').first();
    var picker = new SliceWP_Litepicker({
        element: date_picker_element[0],
        inlineMode: true,
        singleMode: false,
        lang: $('html').attr('lang'),
        numberOfMonths: 2,
        numberOfColumns: 2,
        switchingMonths: 1,
        format: 'D MMM, YYYY',
        showTooltip: false,
        buttonText: {
            'previousMonth': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>',
            'nextMonth': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>'
        },

        setup: function (picker) {
            picker.on('before:show', function () {
                if ($(window).width() < 721) {
                    picker.options.numberOfMonths = 1;
                    picker.options.numberOfColumns = 1;
                } else {
                    var date = picker.getDate();
                    if (!date) {
                        date = new Date();
                        date.setMonth(date.getMonth() - 1);
                        picker.gotoDate(date);
                    }
                }
            });

            picker.on('selected', function (date_start, date_end) {
                var options = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                };
                var locale = $('html').attr('lang');
                // var locale = 'en-US';
                var wrapper = $(this.options.element).closest('.slicewp-date-picker-wrapper');

                // Set span input value.
                if (this.options.selected_date_range && typeof window.predefined_date_ranges[this.options.selected_date_range] != 'undefined') {
                    wrapper.find('.slicewp-date-picker-input span.slicewp-date-picker-input-date-range').text(window.predefined_date_ranges[this.options.selected_date_range]);
                } else {
                    wrapper.find('.slicewp-date-picker-input span.slicewp-date-picker-input-date-range').text(wrapper.find('.slicewp-date-picker-predefined-date-range[data-range="custom"]').text());
                }

                wrapper.find('.slicewp-date-picker-input span.slicewp-date-picker-input-dates').text(date_start.dateInstance.toLocaleDateString(locale, options) + ' - ' + date_end.dateInstance.toLocaleDateString(locale, options));
                wrapper.find('.slicewp-date-picker-input span.slicewp-date-picker-input-dates').css('display', 'block');


                // Hide the date picker modal.
                wrapper.removeClass('slicewp-is-open');

                // Add the dates to the hidden inputs.
                var formatted_date_start = date_start.toLocaleString('en-US', {
                    year: 'numeric'
                }) + '-' +
                    date_start.toLocaleString('en-US', {
                        month: '2-digit'
                    }) + '-' +
                    date_start.toLocaleString('en-US', {
                        day: '2-digit'
                    });
                var formatted_date_end = date_end.toLocaleString('en-US', {
                    year: 'numeric'
                }) + '-' +
                    date_end.toLocaleString('en-US', {
                        month: '2-digit'
                    }) + '-' +
                    date_end.toLocaleString('en-US', {
                        day: '2-digit'
                    });

                wrapper.find('input.slicewp-date-picker-input-date-range').val(this.options.selected_date_range || 'custom');
                wrapper.find('input.slicewp-date-picker-input-date-start').val(formatted_date_start);
                wrapper.find('input.slicewp-date-picker-input-date-end').val(formatted_date_end);

                // Set the go to date.
                var date_go_to = date_end;

                date_go_to.setDate(15);

                if (this.options.numberOfMonths == 2) {
                    date_go_to.setMonth(date_go_to.getMonth() - 1);
                }

                if (this.options.trigger_sync) {

                }

                // Submit the form if it's AJAX powered.
                if (this.options.was_selected) {
                    console.log('submit');
                    var parent_form = $(this.options.element).closest('form');
                    if (parent_form.length > 0 && parent_form.attr('action').indexOf('_action_ajax_') >= 0) {
                        apply_filters(parent_form);
                    }
                }

                this.options.was_selected = true;
                this.options.selected_date_range = '';

                this.gotoDate(date_go_to);

            });

            // Clear selection. 
            // 清空时
            picker.on('clear:selection', function () {
                var wrapper = $(this.options.element).closest('.slicewp-date-picker-wrapper');
                // Set span input value.
                wrapper.find('.slicewp-date-picker-input span.slicewp-date-picker-input-date-range').text(wrapper.find('.slicewp-date-picker-predefined-date-range[data-range="all_time"]').text());
                wrapper.find('.slicewp-date-picker-input span.slicewp-date-picker-input-dates').css('display', 'none');

                // Hide the date picker modal.
                wrapper.removeClass('slicewp-is-open');

                wrapper.find('input.slicewp-date-picker-input-date-range').val('');
                wrapper.find('input.slicewp-date-picker-input-date-start').val('');
                wrapper.find('input.slicewp-date-picker-input-date-end').val('');

                // Reset the selected date range.
                this.options.selected_date_range = '';

                var date_go_to = new Date();
                date_go_to.setMonth(date_go_to.getMonth() - 1, 1);

                // Sync all date range pickers on the page.
                if (this.options.trigger_sync) {

                }
                this.gotoDate(date_go_to);
            });
        }

    });

    // init Set date start and end.
    // 初始化设置日期开始和结束。
    var wrapper = $('.slicewp-date-picker-wrapper');
    var date_range = wrapper.find('input.slicewp-date-picker-input-date-range').val();
    var date_start = wrapper.find('input.slicewp-date-picker-input-date-start').val();
    var date_end = wrapper.find('input.slicewp-date-picker-input-date-end').val();
    if (date_start != '' && date_end != '') {
        picker.options.selected_date_range = date_range;
        picker.setDateRange(date_start, date_end);
    }

    /**
     * Select date start and date end based on predefined options.
     * 基于预定义defined的选项进行选择日期开始和日期结束。
     */
    $(document).on('click', '.slicewp-date-picker-predefined-date-range', function (e) {
        e.preventDefault();
        const $this = $(this); // jquery this
        if (!$this.data('range')) {
            return false;
        }
        console.log('click', $this.data('range'));
        //const timezone = getFormattedTimeZone();
        //const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dayInMs = 24 * 60 * 60 * 1000;
        const today = new Date();

        const todayYear = today.toLocaleString('en-US', {
            year: 'numeric'
        });
        const todayMonth = today.toLocaleString('en-US', {
            month: '2-digit'
        });
        const todayDay = today.toLocaleString('en-US', {
            day: '2-digit'
        });

        let dateStart = '';
        let dateEnd = '';

        const range = $this.data('range'); // jQuery data()

        if (range === 'past_7_days') {
            dateStart = new Date(today - dayInMs * 6);
            dateEnd = today;
        } else if (range === 'past_30_days') {
            dateStart = new Date(today - dayInMs * 29);
            dateEnd = today;
        } else if (range === 'week_to_date') {
            const dayOfWeek = today.getDay();
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            dateStart = new Date();
            dateStart.setDate(diff);
            dateEnd = today;
        } else if (range === 'month_to_date') {
            dateStart = new Date(`${todayYear}-${todayMonth}-01`);
            dateEnd = today;
        } else if (range === 'year_to_date') {
            dateStart = new Date(`${todayYear}-01-01`);
            dateEnd = today;
        } else if (range === 'last_week') {
            const lastWeekDate = new Date(today - dayInMs * 7);
            const dayOfWeek = lastWeekDate.getDay();
            const diff = lastWeekDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            dateStart = new Date();
            dateStart.setDate(diff);
            dateEnd = new Date(dateStart);
            dateEnd.setDate(dateEnd.getDate() + 6);
        } else if (range === 'last_month') {
            dateEnd = new Date(today - dayInMs * todayDay);
            dateStart = new Date(dateEnd.getFullYear(), dateEnd.getMonth());
        } else if (range === 'last_year') {
            dateStart = new Date(`${todayYear - 1}-01-01`);
            dateEnd = new Date(`${todayYear - 1}-12-31`);
        }

        if (dateStart !== '' && dateEnd !== '') {
            picker.options.was_selected = true;
            picker.options.selected_date_range = (range !== 'all_time' ? range : '');
            picker.setDateRange(dateStart, dateEnd);
        } else {
            picker.clearSelection();
            var parent_form = $(picker.options.element).closest('form');
            if (parent_form.length > 0 && parent_form.attr('action').indexOf('_action_ajax_') >= 0) {
                apply_filters(parent_form);
            }
        }
    });
    /**
     * Opens and closes the date picker when clicking on the date picker span field.
     * 打开和关闭日期选择器
     */
    // $(document).on('click', function(e) {
    $(document).on('click', '.slicewp-date-picker-input', function (e) {
        e.preventDefault();
        var date_picker_wrapper = $('.slicewp-date-picker-wrapper');
        if (date_picker_wrapper.hasClass('slicewp-is-open')) {
            date_picker_wrapper.removeClass('slicewp-is-open');
        } else {
            date_picker_wrapper.addClass('slicewp-is-open');
        }
    });
    //  $(document).on('click', function(e) {
    //     e.preventDefault();
    //     var date_picker_wrapper = $('.slicewp-date-picker-wrapper');
    //     date_picker_wrapper.removeClass('slicewp-is-open');
    //  });


});
