function isStrictMode() {
    return (function () { return !this; })();
}
// console.log(isStrictMode()); // if true, strict mode is on
function isSurportedLoading() {
    return 'loading' in HTMLImageElement.prototype;
}
// console.log(isSurportedLoading()); // if true, loading attribute is supported
function isLikelyMobile() {
    const ua = navigator.userAgent;
    // 包含 'Mobile' 或 'Tablet' 可捕获更多设备（包括部分国产浏览器）
    if (/Android|iPhone|BlackBerry|Opera Mini|IEMobile|Mobile|Tablet/i.test(ua)) {
        return true;
    }
    // 特别处理 iPad (iOS 13+)
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
        return true;
    }
    // 兜底：极小屏幕 + 触摸（谨慎）
    if (screen.width <= 768 && 'ontouchstart' in window) {
        return true;
    }
    return false;
}
/**
 * 判断是否为非人类流量（爬虫 / 自动化工具）
 * 依赖全局 isbot() 函数（由 isbot 库提供）
 * 参考：https://github.com/JamesPic/IsBot
 * 注：此函数依赖 isbot 库
 * 功能：
 * - 拦截主流搜索引擎爬虫（Googlebot, Bingbot, Yandex, Baidu 等）
 * - 拦截 Headless 浏览器（Puppeteer, Selenium, Cypress 等）
 * - 检测异常环境（零屏幕尺寸、超快加载等）
 * 
 * 使用方式：
 *   if (isLikelyAutomated()) {
 *     // 跳过埋点、分析、广告等
 *   }
 * 兼容性：IE11+ / Chrome / Firefox / Safari / Edge / 移动端 WebView
 */
function isLikelyAutomated() {
    const ua = navigator.userAgent;

    // === 1. 使用 isbot 检测搜索引擎与已知爬虫（权威列表）===
    // isbot 返回 true 表示是 bot（包括 Googlebot, Bingbot, Applebot, Yandex, Baidu, Discordbot 等 200+）
    if (typeof isbot === 'function' && isbot(ua)) {
        return true;
    } else {
        // 1. 明确爬虫 UA（Googlebot, Bingbot 等）
        if (/Googlebot|Bingbot|YandexBot|Baiduspider|DuckDuckBot|Slurp|Sogou|Applebot/i.test(ua)) {
            return true;
        }
    }

    // === 2. 自动化工具特征（isbot 不覆盖 WebDriver/Headless）===
    if (
        navigator.webdriver === true ||
        /HeadlessChrome|PhantomJS|Selenium|Puppeteer|Cypress|Playwright/i.test(ua)
    ) {
        return true;
    }

    // === 3. 异常屏幕尺寸 ===
    if (screen.width === 0 || screen.height === 0) {
        return true;
    }

    // === 4. 超快加载检测（使用现代 Performance API）===
    let domContentLoadedTime = null;

    if (performance.getEntriesByType) {
        const entries = performance.getEntriesByType('navigation');
        if (entries.length > 0) {
            domContentLoadedTime = entries[0].domContentLoadedEventEnd;
        }
    }

    // 降级到 performance.timing（旧设备兼容）
    if (domContentLoadedTime === null && performance.timing) {
        domContentLoadedTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    }

    if (domContentLoadedTime !== null && domContentLoadedTime > 0 && domContentLoadedTime < 10) {
        return true;
    }

    return false;
}
// =============== 1. 追踪策略控制中心 (GDPR + Debug) ===============
window.TrackingPolicy = {
    isDebug: (function () {
        return (
            window.location.search.indexOf('debug=1') > -1 ||
            (typeof window.DEBUG_TRACKING !== 'undefined' && window.DEBUG_TRACKING)
        );
    })(),

    isAllowed: (function () {

        // 用户明确拒绝
        if (getCookie('tracking_consent') === '0') return false;
        // 用户已同意
        if (getCookie('tracking_consent') === '1') return true;

        // 默认：允许（可根据业务改为 false）因为没有上面的cooke设置，所以默认是允许的
        return true;
    })(),

    log: function (...args) {
        if (this.isDebug) {
            console.log('[Tracking]', ...args);
        }
    },
    warn: function (...args) {
        console.warn('[Tracking Warn]', ...args);
    },

    error: function (...args) {
        console.error('[Tracking Error]', ...args);
    }
};
// =============== 2. Cookie 工具 ==============
// 基于UTC时间戳的cookie
//set cookie with timestamp
function setCookieTimestamp(name, value, expiresAt) {
    const expires = new Date(expiresAt * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}
//set cookie with days
function setCookie(name, value, days) {
    days = days || 30;
    var expires = '';
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
    // const Days = 30;
    // const exp = new Date();
    // exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    // document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

//get cookies
function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? decodeURIComponent(v[2]) : null;
}
// =============== 3. URL 工具集 ===============
// const UrlUtils 与 window.UrlUtils 写法的区别
// const UrlUtils 是一个对象字面量，而 window.UrlUtils 是一个全局对象
// const UrlUtils 是一个无状态的工具函数集合，而 window.UrlUtils 是一个有状态的对象
// const UrlUtils 是一个纯函数集合，而 window.UrlUtils 是一个有副作用的对象

// 添加命名空间对象 对象字面量 
// 无状态的工具函数集合
// 所有方法都是纯函数：输入 → 输出，没有副作用
// 不需要“实例”，全局只有一个共享对象
const UrlUtils = {
    // new URL 如果第一个参数不是完整的url，就需要第二个参数作为基准url
    // 创建新的URL对象
    create: (url, origin = window.location.origin) => new URL(url, origin), //ES6
    // 获取当前URL对象的查询参数
    getCurrentParams: () => new URLSearchParams(window.location.search), //现代 Web API
    // 合并URL对象和参数对象
    mergeParams: (url, paramsObj) => {
        const newUrl = typeof url === 'string' ?
            new URL(url, window.location.origin) : url;
        Object.keys(paramsObj).forEach(key => {
            if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
                newUrl.searchParams.set(key, paramsObj[key]);
            }
        });
        return newUrl.toString();
    },
    // 构建查询字符串
    buildQuery: (paramsObj) => {
        const params = new URLSearchParams();
        Object.keys(paramsObj).forEach(key => {
            if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
                params.set(key, paramsObj[key]);
            }
        });
        return params.toString();
    },
    /**
     * Extracts the effective root domain (eTLD+1) from a host.
     * Handles common public suffixes like .co.uk, .com.au, .github.io, etc.
     * 
     * Examples:
     *   'www.example.com'        → 'example.com'
     *   'shop.example.co.uk'     → 'example.co.uk'
     *   'user.github.io'         → 'github.io'
     *   'a.b.example.com.au'     → 'example.com.au'
     */
    getEffectiveRootDomain: (host) => {
        if (typeof host !== 'string') return null;
        const parts = host.toLowerCase().split('.').filter(p => p.length > 0);
        if (parts.length < 2) return host;

        // Common two-part public suffixes (extend as needed for your markets)
        const TWO_PART_SUFFIXES = new Set([
            // UK
            'co.uk'
            // , 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk',
            // 'net.uk', 'sch.uk', 'ac.uk', 'gov.uk',
            // // Australia
            // 'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au',
            // // New Zealand
            // 'co.nz', 'net.nz', 'org.nz', 'govt.nz',
            // // South Africa
            // 'co.za', 'org.za', 'net.za',
            // // Japan
            // 'co.jp', 'ne.jp', 'or.jp', 'ac.jp', 'go.jp',
            // // Brazil
            // 'com.br', 'net.br', 'org.br', 'edu.br',
            // // Platform domains (common in dev/staging)
            // 'github.io', 'gitlab.io', 'bitbucket.io',
            // 'netlify.app', 'vercel.app', 'pages.dev'
        ]);

        // Check for two-part suffix first (e.g., co.uk)
        if (parts.length >= 3) {
            const lastTwo = parts.slice(-2).join('.');
            if (TWO_PART_SUFFIXES.has(lastTwo)) {
                return parts.slice(-3).join('.'); // e.g., example.co.uk
            }
        }
        // Fallback: assume standard two-part domain (example.com)
        return parts.slice(-2).join('.');
    },
    isValidUrl: (url) => {
        if (typeof url !== 'string' || !url.startsWith('https://')) {
            return false;
        }
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    /**
     * Checks if candidateUrl belongs to the same effective root domain as mainUrl.
     * 
     * @param {string} mainUrl      - Your canonical site URL (e.g., 'https://mysite.co.uk')
     * @param {string} candidateUrl - The URL to validate (e.g., referrer)
     * @returns {boolean}
     */
    isSameDomain: (mainUrl, candidateUrl) => {
        if (!UrlUtils.isValidUrl(mainUrl) || !UrlUtils.isValidUrl(candidateUrl)) {
            return false;
        }
        try {
            const mainHost = new URL(mainUrl).host;
            const candidateHost = new URL(candidateUrl).host;

            const mainRoot = UrlUtils.getEffectiveRootDomain(mainHost);
            const candidateRoot = UrlUtils.getEffectiveRootDomain(candidateHost);

            return mainRoot === candidateRoot;
        } catch {
            return false;
        }
    },

    // 从URL中获取指定query参数值
    /**
     * 从查询字符串中安全获取参数值（自动解码）
     * @param {string} name - 参数名
     * @param {string} [url=window.location.href] - 可选 URL
     * @returns {string} 解码后的值，未找到返回空字符串
     */
    getQueryParam: (name, url) => {
        url = url || window.location.href;
        try {
            var params = new URL(url).searchParams;
            return params.get(name) || '';
        } catch (e) {
            // Fallback for very old browsers (unlikely in EU/US mobile)
            var regex = new RegExp('[?&]' + escapeRegExp(name) + '=([^&]*)');
            var match = regex.exec(url);
            if (match) {
                return decodeURIComponent((match[1] || '').replace(/\+/g, ' '));
            }
            return '';
        }
    },

    // ✅【新增】从路径中提取 "pretty" 参数值，如 /product/123/aff/alice → aff=alice
    getPathParam: (key, path = window.location.pathname) => {
        const parts = path.split('/').filter(Boolean); // 移除空段
        for (let i = 0; i < parts.length - 1; i++) {
            if (parts[i] === key) {
                // 自动解码（兼容 + 和 %xx）
                try {
                    return decodeURIComponent(parts[i + 1].replace(/\+/g, ' '));
                } catch (e) {
                    return parts[i + 1]; // fallback if decode fails
                }
            }
        }
        return '';
    },

    /**
     * 构建参数url ?a=b&c=d
     * 向 URL 添加或更新查询参数（自动编码 value）
     * @param {string} param - 参数名
     * @param {string} value - 参数值（将被 encodeURIComponent）
     * @param {string} url - 原始 URL
     * @returns {string} 新 URL
     */
    addQueryParam: (param, value, url) => {
        try {
            var urlObj = new URL(url, window.location.origin); // 支持相对路径
            urlObj.searchParams.set(param, value); // 自动编码
            return urlObj.href;
        } catch (e) {
            // Fallback
            var hashSplit = url.split('#');
            var baseUrl = hashSplit[0];
            var hash = hashSplit[1] || '';
            var regex = new RegExp('[?&]' + escapeRegExp(param) + '=([^&]*)');
            var hasParam = regex.test(baseUrl);

            var encodedValue = encodeURIComponent(value);
            if (hasParam) {
                baseUrl = baseUrl.replace(regex, function (match, p1, offset, str) {
                    return match.charAt(0) + param + '=' + encodedValue;
                });
            } else {
                var separator = baseUrl.indexOf('?') === -1 ? '?' : '&';
                baseUrl += separator + param + '=' + encodedValue;
            }

            return hash ? baseUrl + '#' + hash : baseUrl;
        }
    },
    /**
     * 构建友好 URL：/base/param/value/
     * @param {string} param - 参数名（如 'aff'）
     * @param {string} value - 值（将被 encodeURIComponent）
     * @param {string} url - 原始 URL
     * @returns {string} 新 URL
     */
    buildFriendlyUrl: (param, value, url) => {
        try {
            const urlObj = new URL(url, window.location.origin);
            let pathname = urlObj.pathname;

            // 转义 param 用于正则（防御性）
            const safeParam = param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // 移除已存在的 /param/xxx/ 段
            const friendlyRegex = new RegExp(`/${safeParam}/[^/?#]+/?`);
            pathname = pathname.replace(friendlyRegex, '');

            // 移除结尾可能残留的 /param
            const trailingRegex = new RegExp(`/${safeParam}$`);
            pathname = pathname.replace(trailingRegex, '');

            // 清理结尾斜杠
            pathname = pathname.replace(/\/+$/, '');

            // 添加新的友好段（自动编码 value）
            pathname += `/${param}/${encodeURIComponent(value)}/`;

            // 重建 URL
            urlObj.pathname = pathname;
            return urlObj.href;
        } catch (error) {
            console.error('UrlUtils.buildFriendlyUrl failed:', error, { param, value, url });
            // Fallback: simple string manipulation (no encoding)
            let cleanUrl = url.split('#')[0];
            const hash = url.includes('#') ? url.slice(url.indexOf('#')) : '';
            cleanUrl = cleanUrl.replace(new RegExp(`/${param}/[^/?#]+/?`), '');
            cleanUrl = cleanUrl.replace(new RegExp(`/${param}$`), '');
            cleanUrl = cleanUrl.replace(/\/+$/, '');
            return `${cleanUrl}/${param}/${value}/${hash}`;
        }
    }

};
/////////////////// url操作 end
function getBrowserData() {
    return {
        deviceChannel: 'browser',
        screenWidth: screen.width || 0,
        screenHeight: screen.height || 0,
        colorDepth: screen.colorDepth || 0,
        language: (navigator.language || 'en').split('-')[0],
        timezoneOffset: new Date().getTimezoneOffset(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown', // 新增时区字段
        javaScriptEnabled: true,
        userAgent: navigator.userAgent //保留原始 UA 用于 debug
    }
}
function getBrowserDataWithBowser() {
    var browserData = getBrowserData();
    //注意大小写
    if (typeof bowser !== 'undefined' && typeof bowser.getParser === 'function') {
        try {
            var parser = bowser.getParser(navigator.userAgent);
            var result = parser.getResult();
            // 浏览器
            browserData.browserName = result.browser?.name || 'Unknown';
            browserData.browserVersion = result.browser?.version || '';
            // 操作系统
            browserData.osName = result.os?.name || 'Unknown';
            browserData.osVersion = result.os?.version || '';
            // 平台
            browserData.platform = result.platform?.type || 'desktop'; //mobile/desktop/tablet
            // 设备厂商（如 Apple, Huawei）
            browserData.deviceVendor = result.platform?.vendor || ''; //如 Apple, Samsung
            browserData.engineName = result.engine?.name || 'Unknown';
        } catch (e) {
            TrackingPolicy.error('bowser parse error:', e);
        }
    }
    // bowser 未加载 或 解析失败，尝试简单 UA 判断
    if (typeof browserData.browserName === 'undefined') {
        var ua = navigator.userAgent;
        browserData.browserName = 'Unknown';
        browserData.browserVersion = '';
        if (/iPad|iPhone|iPod/.test(ua)) {
            browserData.osName = 'iOS';
            browserData.osVersion = '';
            browserData.platform = 'mobile';
        } else if (/Android/.test(ua)) {
            browserData.osName = 'Android';
            browserData.osVersion = '';
            browserData.platform = 'mobile';
        }
        browserData.deviceVendor = '';
        browserData.engineName = 'Unknown';
    }

    return browserData;
}
// =============== 4. Affiliate Tracker ===============
window.AffiliateTracker = {
    _config: null,
    _hasRun: false,
    _getBrowserData: function () {
        return getBrowserDataWithBowser();
    },

    _shouldTrack: function (aff, cookieAff) {
        if (!aff) return false;
        var rule = this._config.affiliate_credit;
        if (rule === 'first' && cookieAff) return false;
        if (rule === 'last' && cookieAff && cookieAff === aff) return false;
        return true;
    },

    _sendToServer: function (aff) {
        var payload = {
            event: 'affiliate',
            browser: this._getBrowserData(),
            data: {
                aff: aff,
                landing_url: document.URL,
                referrer_url: document.referrer
            }
        };

        TrackingPolicy.log('Sending affiliate click:', aff, payload);

        //fetch 在 IE11 不支持。如果你需要兼容 IE11，请改回 $.ajax 或加 polyfill。
        fetch(this._config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.visit_id > 0) {
                    setCookie('luv_aff', data.aff, this._config.cookie_duration);
                    setCookie('luv_visit', data.visit_id, this._config.cookie_duration);
                    TrackingPolicy.log('Affiliate tracked. Visit ID:', data.visit_id);
                }
            }
                .bind(this))
            .catch(function (err) {
                TrackingPolicy.error('Affiliate tracking failed:', err);
            });
    },

    init: function () {
        if (this._hasRun) return;
        this._hasRun = true;

        if (!TrackingPolicy.isAllowed) {
            TrackingPolicy.log('Affiliate tracking skipped: consent declined.');
            return;
        }

        if (typeof window.affiliate_config === 'undefined') {
            return;
        }
        // ✅ 使用独立的自动化检测函数检测非人类流量
        if (isLikelyAutomated()) {
            TrackingPolicy.log('Automated traffic detected, skipping tracking.');
            return;
        }
        this._config = window.affiliate_config;

        var aff = UrlUtils.getQueryParam(this._config.affiliate_keyword) ||
            UrlUtils.getPathParam(this._config.affiliate_keyword);
        var cookieAff = getCookie('luv_aff');

        if (this._shouldTrack(aff, cookieAff)) {
            this._sendToServer(aff);
        } else {
            TrackingPolicy.log('Affiliate skipped:', { aff, cookieAff, rule: this._config.affiliate_credit });
        }
    }
};
// =============== 4. Search or Product Page Tracker ===============
window.PageTracker = {
    _config: null,
    _hasRun: false,
    _getBrowserData: function () {
        return getBrowserDataWithBowser();
    },

    _shouldTrack: function () {
        // 判断 data 是否存在
        if (typeof this._config.payload === 'undefined') {
            return false;
        }
        if (typeof this._config.payload.data === 'undefined') {
            return false;
        }
        // php 返回的[]，尽量避免：比如可以search页page>1时，整个config就不存在。
        if (Array.isArray(this._config.payload.data) && this._config.payload.data.length === 0) {
            return false;
        }
        // return this._config?.payload?.data != null; // 判断 data 是否存在
        return true;
    },

    _sendToServer: function () {
        var payload = this._config.payload;
        payload.browser = this._getBrowserData();
        TrackingPolicy.log('Sending page view:', payload);

        fetch(this._config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                TrackingPolicy.log('Page tracked.');
            }
                .bind(this))
            .catch(function (err) {
                TrackingPolicy.error('Page tracking failed:', err);
            });
    },

    init: function () {
        if (this._hasRun) return;
        this._hasRun = true;

        if (typeof window.trace_config === 'undefined') {
            return;
        }
        // ✅ 使用独立的自动化检测函数
        if (isLikelyAutomated()) {
            TrackingPolicy.log('Automated traffic detected, skipping tracking.');
            return;
        }

        this._config = window.trace_config;

        if (this._shouldTrack()) {
            this._sendToServer();
        } else {
            TrackingPolicy.log('Page tracking skipped:', { config: this._config });
        }
    }
};
// =============== 5. User Timezone Reporter ===============
//完全可以将这段 JS 直接放在商品详情页（或广告落地页）运行，并且这是一个非常合理、安全、高效的做法。 
window.UserTimezone = {
    // 存储用的 key
    _storageKeyReported: 'utz_reported',
    _storageKeyTimezone: 'utz_value',

    // 安全读取 localStorage
    _getStorage: function (key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },

    // 安全写入 localStorage
    _setStorage: function (key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // ignore if storage is disabled or full
        }
    },

    // 判断是否需要上报：从未上报 或 时区已变更
    _shouldReport: function (currentTz) {
        if (!currentTz) return false;

        var lastTz = this._getStorage(this._storageKeyTimezone);
        var hasReported = this._getStorage(this._storageKeyReported) === '1';

        return !hasReported || lastTz !== currentTz;
    },

    // 标记为已上报（无论成功失败都标记，避免重复请求）
    _markAsReported: function (timezone) {
        this._setStorage(this._storageKeyReported, '1');
        if (timezone) {
            this._setStorage(this._storageKeyTimezone, timezone);
        }
    },
    // 获取浏览器时区（如 "Asia/Shanghai"）
    getBrowserTimezone: function () {
        try {
            if (window.Intl && Intl.DateTimeFormat) {
                return Intl.DateTimeFormat().resolvedOptions().timeZone;
            }
        } catch (e) {
            TrackingPolicy.error('Timezone detection failed:', e);
        }
        return null;
    },
    // 上报到后端
    sendToServer: function (timezone) {
        if (!timezone) return;
        TrackingPolicy.log('Reporting timezone:', timezone);
        var data = {
            timezone: timezone
        };
        if (typeof csrfName !== 'undefined') {
            data[csrfName] = csrfVal; // Yii2 CSRF 保护
        }
        $.ajax({
            url: userTimezoneUrl,
            method: 'POST',
            data: data,
            timeout: 5000,
            success: function (res) {
                if (res && res.success) {
                    window.UserTimezone._markAsReported(timezone);
                } else {
                    // 后端返回失败（如非法时区），也标记避免重试
                    window.UserTimezone._markAsReported(timezone);
                }
            },
            error: function () {
                TrackingPolicy.error('Timezone report failed:', arguments);
                // 网络错误或超时：默认不再重试，标记为已尝试
                window.UserTimezone._markAsReported(timezone);
            }
        });
    },

    // 初始化逻辑
    init: function () {
        if (!TrackingPolicy.isAllowed) {
            TrackingPolicy.log('Timezone reporting skipped: consent declined.');
            return;
        }

        var tz = this.getBrowserTimezone();
        if (tz && this._shouldReport(tz)) {
            this.sendToServer(tz);
        } else {
            TrackingPolicy.log('Timezone not reported.', { tz, should: false });
        }
    }
};
//////////////timezone end
function webLoadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (typeof (callback) != "undefined") {
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {
            script.onload = function () {
                callback();
            };
        }
    }
    script.src = url;
    document.body.appendChild(script);
}
function isValidEmail(email) {
    // 简洁但实用的邮箱正则（符合 HTML5 标准）
    // https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
}
function check_email(email) {

    if (!email || email == "") {
        return false;
    }

    const myreg = /^([a-zA-Z0-9]+[_|\_|\.|-|\-]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.|-|\-]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (!myreg.test(email)) {
        return false;
    }

    return true;
}
function check_pass(str) {
    const re = /^\w{6,30}$/;
    if (re.test(str)) {
        return true;
    } else {
        return false;
    }
}

// 依赖bootstrap Toast组件 bootstrap js
function showToast(msg, element) {
    // const toastEl = document.getElementById('toast-js');
    element = element || '#toast-js';
    const toastEl = $(element);
    if (toastEl) {
        $(element).find('.toast-body').text(msg);
        const toast = bootstrap.Toast.getOrCreateInstance(toastEl[0]);
        toast.show();
    }
}
function showError($el, message, $input) {
    $el.text(message).removeClass('d-none');
    $input.addClass('is-invalid');
}

function hideError($el, $input) {
    $el.addClass('d-none');
    $input.removeClass('is-invalid');
}
/**
 * 复制文本到剪贴板（兼容现代浏览器和旧浏览器）
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} - 成功返回 true，失败返回 false
 */
function copyTextToClipboard(text) {
    return new Promise(function (resolve) {
        // 优先使用 Clipboard API（需安全上下文）
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(function () {
                    resolve(true);
                })
                .catch(function (err) {
                    console.warn('Clipboard API failed, falling back to execCommand:', err);
                    // 回退到 execCommand
                    resolve(fallbackCopyText(text));
                });
        } else {
            // 直接使用降级方案
            resolve(fallbackCopyText(text));
        }
    });
}

/**
 * 使用 document.execCommand 的降级复制方法
 * @param {string} text
 * @returns {boolean}
 */
function fallbackCopyText(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        var success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    } catch (err) {
        document.body.removeChild(textarea);
        return false;
    }
}

$(function () {
    //1. 联盟跟踪上报（安全调用）
    if (typeof affiliate_config !== 'undefined') {
        try {
            AffiliateTracker.init();
        } catch (e) {
            // console.error('Failed to init UserTimezone:', e);
        }
    }
    //2. 页面跟踪上报（安全调用）
    if (typeof trace_config !== 'undefined') {
        try {
            PageTracker.init();
        } catch (e) {
            // console.error('Failed to init UserTimezone:', e);
        }
    }
    //3. 用户时区上报（安全调用）
    if (typeof userTimezoneUrl !== 'undefined') {
        try {
            UserTimezone.init();
        } catch (e) {
            // console.error('Failed to init UserTimezone:', e);
        }
    }
    //4.广告位
    //渲染bannerUI
    if (typeof promoCouponConfig !== 'undefined' && promoCouponConfig.checkPromo && !PromoBannerManager.isClosedToday(promoCouponConfig.promoZoneId)) {
        $('[data-promo-zone]').each(function () {
            const $el = $(this);
            const zone = $el.data('promo-zone');
            let requestData = {}; // 请求参数
            requestData['zone'] = zone;
            //分类
            const attr_group = $el.data('attr-group');
            if (attr_group) {
                requestData['group'] = attr_group;
            }
            //商品
            const spu = $el.data('spu');
            if (spu) {
                requestData['spu'] = spu;
            }
            $.get(promoCouponConfig.promoCouponUrl, requestData).done(function (res) {
                if (res.success && res.html) {
                    // // GDPR 合规：即使有数据，也要检查是否已被用户关闭
                    // if (isClosedToday(promoZoneId)) {
                    //     return; // 不渲染
                    // }
                    PromoBannerManager.renderPromoBanner($el, res.html);
                }
                // 否则不渲染（静默）
            }).fail(function () {
                // 静默失败，不影响主流程
            });
        });
    }
    //5. 会员检查（安全调用）
    if (typeof memberCheckUrl !== 'undefined') {
        const ajax_params = {};
        if (typeof product_id !== 'undefined') {
            ajax_params['product_id'] = product_id;
        }
        $.ajax({
            async: true,
            timeout: 6000,
            dataType: 'json',
            type: 'get',
            data: ajax_params,
            url: memberCheckUrl,
            success: function (data, textStatus) {
                if (data.loginStatus) {
                    $('#header-welcome-js').removeClass('d-none'); //show welcome
                    $('#header-email-js').text(data.customer_email);
                    $('#header-login-js').addClass('d-none'); //hide login
                }
                if (data.favorite) {
                    $('#product-favorite-js').addClass('text-danger');
                }
                if (data.favorite_product_count) {
                    // $(".header-right-user-wishlist-num-js").html(data.favorite_product_count);
                }
                if (data.affiliate) {
                    $("#affiliate-link-js").show(); //show affiliate link
                }
                if (data.cart_qty) {
                    $(".cart-item-count-js").text(data.cart_qty);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) { }
        });
    }
    //6. header ajax 邮件订阅
    $("#subscribe_btn").click(function () {
        var $btn = $(this);
        //disable button
        $btn.prop('disabled', true);

        email = $("#subscribe_email").val();
        if (!check_email(email)) {
            alert('Enter your email address');
            //enable button
            $btn.prop('disabled', false);
            return false;
        }
        $.ajax({
            dataType: 'json',
            type: 'post',
            data: { 'email': email },
            // url: currentBaseUrl + "/member/account/subscribe",
            url: "/member/account/subscribe",
            success: function (data, textStatus) {
                //enable button
                $btn.prop('disabled', false);
                if (data.success) {
                    alert(data.message);
                    $("#subscribe_email").val("");
                } else {
                    alert(data.message);
                }
            },
            error: function (error) {
                alert('Oops! Something went wrong. Please try again in a few minutes.');
                //enable button
                $btn.prop('disabled', false);
            }
        })
    });
});

//===============搜索历史search==========================
window.SearchHistory = {
    // 配置项
    config: {
        HISTORY_KEY: 'search_history',
        MAX_LENGTH: 20,
        SYNC_INTERVAL_MINUTES: 15,
        KEYWORD_MAX_LENGTH: 100,
        SAFE_KEYWORD_PATTERN: /^[\p{L}\p{N}\s.;:'"!?-]+$/u //废弃
    },
    //简单校验，判断是否为空字符串或超过最大长度
    isValidKeyword: function (keyword) {
        if (typeof keyword !== 'string') return false;
        const t = keyword.trim();
        return t.length > 0 && t.length <= this.config.KEYWORD_MAX_LENGTH;
    },
    //废弃 正则校验 不需要这么严格的校验
    isValidKeywordWithRegex: function (keyword, maxLength) {
        if (typeof keyword !== 'string') return false;
        maxLength = maxLength || this.config.KEYWORD_MAX_LENGTH;
        var trimmed = keyword.trim();
        if (!trimmed || trimmed.length > maxLength) return false;
        return this.config.SAFE_KEYWORD_PATTERN.test(trimmed);
    },

    // 本地存储读取（兼容旧版）
    getLocalHistory: function () {
        var raw = localStorage.getItem(this.config.HISTORY_KEY);
        if (!raw) {
            return { update_time: null, last_sync_time: null, data: [] };
        }
        try {
            var history = JSON.parse(raw);
            if (Array.isArray(history)) {
                history = { update_time: null, last_sync_time: null, data: history };
                localStorage.setItem(this.config.HISTORY_KEY, JSON.stringify(history));
            }
            if (!history.data || !Array.isArray(history.data)) history.data = [];
            return history;
        } catch (e) {
            // console.warn('Search history parse error, resetting.', e);
            return { update_time: null, last_sync_time: null, data: [] };
        }
    },

    // 保存到本地
    saveToLocal: function (keyword) {
        if (!this.isValidKeyword(keyword)) return false;
        var h = this.getLocalHistory();
        var k = keyword.trim();
        h.data = h.data.filter(x => x !== k);
        h.data.unshift(k);
        if (h.data.length > this.config.MAX_LENGTH) {
            h.data = h.data.slice(0, this.config.MAX_LENGTH);
        }
        h.update_time = new Date().toISOString();
        localStorage.setItem(this.config.HISTORY_KEY, JSON.stringify(h));
        return true;
    },

    // 从本地移除
    removeFromLocal: function (keyword) {
        if (keyword == null) {
            localStorage.removeItem(this.config.HISTORY_KEY);
            return;
        }
        var h = this.getLocalHistory();
        var k = String(keyword).trim();
        h.data = h.data.filter(x => x !== k);
        h.update_time = new Date().toISOString();
        localStorage.setItem(this.config.HISTORY_KEY, JSON.stringify(h));
    },

    // 是否需要同步
    isSyncNeeded: function (localHistory) {
        if (!localHistory || !localHistory.last_sync_time) return true;
        var diff = (new Date() - new Date(localHistory.last_sync_time)) / (1000 * 60);
        return diff > this.config.SYNC_INTERVAL_MINUTES;
    },

    // 合并服务端数据
    mergeWithServer: function (serverKeywords) {
        if (!Array.isArray(serverKeywords)) return;
        var local = this.getLocalHistory();
        local.last_sync_time = new Date().toISOString();

        // 去重合并：优先保留本地顺序
        var seen = {};
        var merged = [];

        // 先加本地（保证新在前）
        local.data.forEach(k => {
            if (this.isValidKeyword(k) && !seen[k]) {
                seen[k] = true;
                merged.push(k);
            }
        });

        // 再加服务端（补漏）
        serverKeywords.forEach(k => {
            if (this.isValidKeyword(k) && !seen[k]) {
                seen[k] = true;
                merged.push(k);
            }
        });

        local.data = merged.slice(0, this.config.MAX_LENGTH);
        local.update_time = new Date().toISOString();
        localStorage.setItem(this.config.HISTORY_KEY, JSON.stringify(local));
    },

    // 网络操作（保留 jQuery）
    pullFromServer: function (url) {
        var local = this.getLocalHistory();
        if (!this.isSyncNeeded(local)) return;

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            timeout: 6000,
            success: (data) => {
                if (data && Array.isArray(data.data)) {
                    this.mergeWithServer(data.data);
                }
            },
            error: () => { }
        });
    },
    // 保存到服务端 注登录后才能永久保存
    pushToServer: function (url, keyword) {
        if (!this.isValidKeyword(keyword)) return;
        $.ajax({
            url: url,
            type: 'POST',
            data: { keyword: keyword.trim() },
            dataType: 'json',
            timeout: 6000,
            error: () => { }
        });
    },

    removeFromServer: function (url, keyword) {
        var data = keyword != null ? { keyword: keyword } : {};
        $.ajax({ url, type: 'POST', data, dataType: 'json', timeout: 6000, error: () => { } });
    },

    // 便捷 API（对外暴露）
    save: function (keyword, serverUrl) {
        if (this.saveToLocal(keyword) && serverUrl) {
            this.pushToServer(serverUrl, keyword);
        }
    },
    getKeywords: function () {
        return this.getLocalHistory().data;
    },
    clear: function (serverUrl) {
        this.removeFromLocal();
        if (serverUrl) this.removeFromServer(serverUrl);
    }
};

/**
    * PromoBannerManager.js - 促销优惠券 Banner 管理器
    * 功能：按区域请求并渲染促销 Banner，支持“今日不再显示”
    * 
    * 一：IIFE: “创建私有作用域 + 控制暴露接口”。
    * 二：确保 依赖的全局函数 在 PromoBannerManager 初始化前已定义
    * 如果未来升级到 ES6+，可以用 import/export 替代 IIFE，但核心思想（封装 + 依赖管理）永远不变
    */
window.PromoBannerManager = (function () {
    'use strict';
    // === 配置（可外部覆盖）===
    const CONFIG = {
        EXPIRE_KEY_SUFFIX: '_expires',
        CLOSED_KEY_SUFFIX: '_closed'
    };
    // 工具函数：安全设置存储（优先 localStorage，否则 sessionStorage）
    function setSafeStorage(key, value, expiresAtTimestamp = null) {
        try {
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem(key, value);
                if (expiresAtTimestamp) {
                    localStorage.setItem(key + CONFIG.EXPIRE_KEY_SUFFIX, expiresAtTimestamp);
                }
            } else if (typeof (Storage) !== "undefined") {
                sessionStorage.setItem(key, value);
            }
        } catch (e) {
            // 忽略（隐私模式可能禁用 storage）
        }
    }
    // 工具函数：读取存储
    function getSafeStorage(key) {
        try {
            // 优先尝试 localStorage（检查是否过期）
            const storedValue = localStorage.getItem(key);
            if (storedValue !== null) {
                const expireKey = key + CONFIG.EXPIRE_KEY_SUFFIX;
                const expireTime = localStorage.getItem(expireKey);
                if (expireTime) {
                    const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
                    if (now >= parseInt(expireTime, 10)) {
                        // 已过期，清理并返回 null
                        localStorage.removeItem(key);
                        localStorage.removeItem(expireKey);
                        return null;
                    }
                }
                return storedValue;
            }
            // 回退到 sessionStorage
            return sessionStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }
    // 生成今日结束时间的时间戳（UTC）
    function getEndOfDayTimestamp() {
        const now = new Date();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return Math.floor(endOfDay.getTime() / 1000);
    }
    // === 判断今日是否已关闭 ===
    function isClosedToday(promoId) {
        const key = promoId + CONFIG.CLOSED_KEY_SUFFIX;
        // 先查 Cookie（如果合规）
        if (TrackingPolicy.isAllowed) {
            return getCookie(key) === 'true';
        }
        // 再查 Storage
        return getSafeStorage(key) === 'true';
    }

    function setCookieTimestamp(name, value, expiresAt) {
        const expires = new Date(expiresAt * 1000);
        document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
    }
    // 设置“今日不再显示”的标记
    function setCloseForToday(promoId) {
        const key = promoId + CONFIG.CLOSED_KEY_SUFFIX;
        const expiresAt = getEndOfDayTimestamp();
        console.log('expiresAt', expiresAt);
        // 如果用户已同意 Cookie，使用 Cookie（可跨会话但限当天）
        if (TrackingPolicy.isAllowed) {
            setCookieTimestamp(key, 'true', expiresAt);
        } else {
            // 否则用 storage
            setSafeStorage(key, 'true', expiresAt);
        }
    }

    function renderPromoBanner($container, promoData) {
        $container.html(promoData);
        // 绑定关闭事件
        $container.find('.btn-close').on('click', function () {
            setCloseForToday(promoCouponConfig.promoZoneId);
            $container.remove();
        });

        // 绑定领取事件
        $container.find('.btn-claim-js').on('click', function () {

            var $btn = $(this); //按钮
            if ($btn.prop('disabled')) {
                return false;
            }
            //disable button
            $btn.prop('disabled', true).text(promoCouponConfig.translations.claimIng);

            var coupon_code = $btn.data('coupon-code').trim();
            // return false; //test
            //参数
            var $data = {
                coupon_code: coupon_code,
            };
            if (typeof (promoCouponConfig.csrfName) != 'undefined') {
                $data[promoCouponConfig.csrfName] = promoCouponConfig.csrfVal;
            }
            $.ajax({
                timeout: 6000,
                dataType: 'json',
                type: 'post',
                data: $data,
                url: promoCouponConfig.couponClaimUrl,
                success: function (data, textStatus) {
                    showToast(data.message, '#promo-toast-js');
                    console.log('ajax success', data);
                    if (data.status == 'success') {
                        // 领取成功后，更新按钮状态
                        // $btn.prop('disabled', true).text(promoCouponConfig.translations.claimed); //领取成功后，按钮显示已领取
                        // 更新状态显示
                        console.log('claim success');
                        $btn.closest('.claim-status-js').html(`
                                <span class="fw-bold text-success">${coupon_code}</span>
                                <span class="badge bg-success">${promoCouponConfig.translations.claimed}</span>
                            `);
                    }
                    //enable button
                    $btn.prop('disabled', false).text(promoCouponConfig.translations.claim); //恢复按钮
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(promoCouponConfig.translations.systemError);
                    //enable button
                    $btn.prop('disabled', false).text(promoCouponConfig.translations.claim);
                }
            });

        });
    }
    // === 对外暴露 API ===
    return {
        renderPromoBanner: renderPromoBanner,
        isClosedToday: isClosedToday,
        setCloseForToday: setCloseForToday,
        setSafeStorage: setSafeStorage,
        getSafeStorage: getSafeStorage,
        getEndOfDayTimestamp: getEndOfDayTimestamp
    };

})();
/**
 * I18nHelper.js - 轻量级本地化工具（兼容 Yii2 + jQuery）
 * 功能：货币、日期、数字的本地化格式化
 * 
 * 一：IIFE: “创建私有作用域 + 控制暴露接口”。
 * 二：确保 依赖的全局函数 在 I18nHelper 初始化前已定义
 * 如果未来升级到 ES6+，可以用 import/export 替代 IIFE，但核心思想（封装 + 依赖管理）永远不变
 * 
 */
window.I18nHelper = (function () {
    'use strict';
    // === 1. 获取全局配置（优先级从高到低）===
    function getLocale() {
        // 1. 从 window.APP_CONFIG（Yii2 布局注入）
        if (typeof window.APP_CONFIG !== 'undefined' && typeof window.APP_CONFIG.locale !== 'undefined') {
            return window.APP_CONFIG.locale;
        }
        // 2. 从 <html lang="en"> 本项目是多语言但不是本地站，比如de，而不是de-DE地区，但de的currency默认是de-DE,
        const htmlLang = document.documentElement.lang;
        if (htmlLang) {
            return htmlLang;
        }
        // 3. 默认
        return 'en-US';
    }

    function getCurrency() {
        if (window.APP_CONFIG && window.APP_CONFIG.currency) {
            return window.APP_CONFIG.currency;
        }
        // 可根据 locale 推断默认币种（可选）
        const locale = getLocale();
        if (locale.startsWith('de')) return 'EUR';
        if (locale.startsWith('fr')) return 'EUR';
        if (locale.startsWith('en-GB')) return 'GBP';
        if (locale.startsWith('en')) return 'USD';
        return 'USD';
    }

    // === 2. 检查浏览器是否支持 Intl（现代浏览器都支持）===
    const hasIntl = typeof Intl !== 'undefined' && Intl.NumberFormat && Intl.DateTimeFormat;

    // === 3. 货币格式化 ===
    function formatCurrency(amount, currency = null, locale = null) {
        currency = currency || getCurrency();
        locale = locale || getLocale();

        if (hasIntl) {
            try {
                return new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(amount);
            } catch (e) {
                // 货币不被 locale 支持时降级
                console.warn('Currency format fallback:', e);
            }
        }

        // === 降级方案：简单格式化（仅支持 USD/GBP/EUR 符号）===
        const sign = currency === 'GBP' ? '£' :
            currency === 'EUR' ? '€' :
                currency === 'USD' ? '$' : currency + ' ';
        return sign + parseFloat(amount).toFixed(2);
    }

    // === 4. 日期格式化 ===
    function formatDate(date, locale = null, options = {}) {
        locale = locale || getLocale();
        const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        options = Object.assign(defaultOptions, options);

        if (hasIntl) {
            try {
                return new Intl.DateTimeFormat(locale, options).format(new Date(date));
            } catch (e) {
                console.warn('Date format fallback:', e);
            }
        }

        // 降级：YYYY-MM-DD
        const d = new Date(date);
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    }

    // === 5. 日期+时间格式化 ===
    function formatDateTime(date, locale = null, options = {}) {
        locale = locale || getLocale();
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        options = Object.assign(defaultOptions, options);

        if (hasIntl) {
            try {
                return new Intl.DateTimeFormat(locale, options).format(new Date(date));
            } catch (e) {
                console.warn('DateTime format fallback:', e);
            }
        }

        // 降级
        const d = new Date(date);
        return formatDate(d) + ' ' +
            String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0');
    }

    // === 6. 数字格式化（千分位）===
    function formatNumber(number, locale = null, fractionDigits = 0) {
        locale = locale || getLocale();

        if (hasIntl) {
            try {
                return new Intl.NumberFormat(locale, {
                    minimumFractionDigits: fractionDigits,
                    maximumFractionDigits: fractionDigits
                }).format(number);
            } catch (e) {
                console.warn('Number format fallback:', e);
            }
        }

        // 降级：仅处理英文千分位
        return parseFloat(number).toLocaleString('en-US', {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });
    }

    // === 导出公共 API ===
    return {
        formatCurrency: formatCurrency,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        formatNumber: formatNumber,
        getLocale: getLocale,
        getCurrency: getCurrency
    };
})();

/////////////////////////////// 本地搜索历史 ///////////////////////////////
function isValidSearchKeyword(keyword, maxLength = 100) {
    // 
    keyword = keyword.trim();
    if (keyword === '') {
        return false;
    }
    // 
    if (keyword.length > maxLength) {
        return false;
    }
    // Unicode
    // const safePattern = /^[\p{L}\p{N}\s.,;:'"!?-]+$/u;
    const safePattern = /^[\p{L}\p{N}\s.;:'"!?-]+$/u;
    if (!safePattern.test(keyword)) {
        return false;
    }
    // 
    const escapedKeyword = keyword.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    // 
    return true;
}

const historyKey = 'search_history';
function pullSearchHistory(Url) {
    // let localHistory = getSearchHistoryFromLocalStorage();
    let localHistory = getCompatibleSearchHistoryFromLocalStorage();
    if (!isSyncNeeded(localHistory)) {
        return;
    }
    $.ajax({
        async: true,
        timeout: 6000,
        dataType: 'json',
        type: 'get',
        url: Url,
        success: function (data, textStatus) {
            if (data.data.length > 0) {
                // console.log(data.data);
                mergeLocalSearchHistory(data.data);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

        }
    });
}
function removeHistory(url, keyword) {
    data = {};
    if (keyword) {
        data['keyword'] = keyword;
    }
    $.ajax({
        async: true,
        timeout: 6000,
        dataType: 'json',
        data: data,
        type: 'post',
        url: url,
        success: function (data, textStatus) {

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

        }
    });
}
/**
 * save search history to server
 * @param {string} keyword 
 * @param {string} Url 
 */
function saveOneSearchHistory(keyword, Url) {
    $.ajax({
        async: true,
        timeout: 6000,
        dataType: 'json',
        type: 'post',
        url: Url,
        data: {
            keyword: keyword
        },
        success: function (data, textStatus) {

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

        }
    });
}
/**
 * save search history to local storage
 * @param {string} keyword 
 */
function saveSearchToLocalStorage(keyword) {
    // let searchHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
    let searchHistory = getCompatibleSearchHistoryFromLocalStorage();

    // data
    // data keyword exits
    const index = searchHistory.data.indexOf(keyword);
    if (index > -1) {
        searchHistory.data.splice(index, 1);
    }
    searchHistory.data.unshift(keyword);
    // data keywords max length
    if (searchHistory.data.length > maxSearchHistoryLength) {
        searchHistory.data = searchHistory.data.slice(0, maxSearchHistoryLength); // move
    }

    //update_time
    searchHistory.update_time = new Date().toISOString();

    // save local
    localStorage.setItem(historyKey, JSON.stringify(searchHistory));
}

function removeSearchFromLocalStorage(keyword) {
    // get local search history
    let searchHistory = JSON.parse(localStorage.getItem(historyKey));
    // search history exists
    if (searchHistory && Array.isArray(searchHistory.data)) {
        if (keyword) {
            // if keyword exists in search history, remove it
            searchHistory.data = searchHistory.data.filter(item => item !== keyword);
        } else {
            // // set search history to empty
            // searchHistory.data = [];
            // remove search history from local storage
            localStorage.removeItem(historyKey);
            return;
        }
        //update_time
        searchHistory.update_time = new Date().toISOString();
        // update local storage
        localStorage.setItem(historyKey, JSON.stringify(searchHistory));
        return;
    } else {
        // remove search history from local storage
        localStorage.removeItem(historyKey);
        return;
    }

}

function getSearchHistoryFromLocalStorage() {
    let searchHistory = JSON.parse(localStorage.getItem(historyKey)) || {
        update_time: null,
        last_sync_time: null,
        data: []
    };
    return searchHistory;
}
function getCompatibleSearchHistoryFromLocalStorage() {
    const rawHistory = localStorage.getItem(historyKey);
    if (!rawHistory) {
        // if no history, return default new structure
        return {
            update_time: null,
            last_sync_time: null,
            data: []
        };
    }

    let history;
    try {
        history = JSON.parse(rawHistory);
    } catch (e) {
        console.error('Failed to parse history:', e);
        return {
            update_time: null,
            last_sync_time: null,
            data: []
        };
    }
    // check if it's old array structure
    if (Array.isArray(history)) {
        // convert to new object structure
        history = {
            update_time: null, // assume old data has no update time
            last_sync_time: null, // assume old data has no sync time
            data: history
        };
        // update to localStorage, ensure subsequent use of new structure
        localStorage.setItem(historyKey, JSON.stringify(history));
    }

    return history;
}
function isSyncNeeded(history) {
    if (!history || !history.last_sync_time) return true;

    const lastSyncTime = new Date(history.last_sync_time);
    const currentTime = new Date();
    const diffInMinutes = (currentTime - lastSyncTime) / (1000 * 60);

    return diffInMinutes > 15;
}
function mergeLocalSearchHistory(serverHistory) {
    // let localHistory = getSearchHistoryFromLocalStorage();
    let localHistory = getCompatibleSearchHistoryFromLocalStorage();
    //last_sync_time
    localHistory.last_sync_time = new Date().toISOString();

    // merge
    let mergedData = Array.from(new Set([...localHistory.data, ...serverHistory]));
    localHistory.data = mergedData;
    // save
    localStorage.setItem(historyKey, JSON.stringify(localHistory));
}



////////////////////////后台分销url操作

/**
 * 逐步废弃，使用UrlUtils.IsValidUrl替代
* Checks if the provided URL is valid
*
* @param string url
*
* @return bool
*
*/
function is_valid_url(url) {

    var regex = new RegExp(/^(https?|s):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);

    return regex.test(url);

}
/**
 * 逐步废弃，使用UrlUtils.IsSameDomain替代
 * Checks if the two provided URLs are from the same domain
 *
 * @param string base_url
 * @param string custom_url
 *
 * @return bool
 *
 */
function is_same_domain(base_url, custom_url) {

    base_url = base_url.replace('http://', '').replace('https://', '').replace('www.', '').replace('m.', '').split(/[/?#]/)[0];
    custom_url = custom_url.replace('http://', '').replace('https://', '').replace('www.', '').replace('m.', '').split(/[/?#]/)[0];

    return (base_url == custom_url || base_url.indexOf(custom_url) != -1 || custom_url.indexOf(base_url) != -1);

}
/**
 * 逐步废弃 使用UrlUtils替代
 * @deprecated 20260109
 * Adds the the friendly affiliate parameters to the url
 *
 */
function process_friendly_url(param, value, url) {

    // Save the hash, if it's present.
    var hash = url.split('#')[1];

    url = url.split('#')[0];

    // Check if this is already an affiliate friendly url
    var re = new RegExp("([\/]" + param + "[\/][^?]*)"),
        match = re.exec(url);

    // Check if we have any parameters in the url
    var re2 = new RegExp("([?].*)"),
        match2 = re2.exec(url);

    // Remove the affiliate friendly endpoint
    if (match && match[0])
        url = url.replace(match[0], '');

    // Remove the url parameters
    if (match2 && match2[0])
        url = url.replace(match2[0], '');

    // Check if we have the affiliate parameter without affiliate id in the url
    var re3 = new RegExp("([\/]" + param + "$)"),
        match3 = re3.exec(url);

    // Remove the affiliate parameter
    if (match3 && match3[0])
        url = url.replace(match3[0], '');

    // Remove the trailing slash
    url = url.replace(/\/+$/, '');

    // Add the affiliate friendly endpoint
    url = url + '/' + param + '/' + value + '/';

    // Add back the parameters to the url
    if (match2 && match2[0])
        url = url + match2[0];

    // Add back the hash if it exists.
    if (hash)
        url += '#' + hash;

    return url;

}
/**
 * 逐步废弃 使用UrlUtils替代
 * @deprecated 20260109
 * Adds an argument name, value pair to a given URL string
 * 
 */
function add_query_arg(param, value, url) {
    var re = new RegExp("[\\?&]" + param + "=([^&#]*)"),
        match = re.exec(url),
        delimiter, newString;
    var hash = url.split('#')[1];
    url = url.split('#')[0];

    if (match === null) {

        var hasQuestionMark = /\?/.test(url);
        delimiter = hasQuestionMark ? "&" : "?";
        newString = url + delimiter + param + "=" + value;

    } else {

        delimiter = match[0].charAt(0);
        newString = url.replace(re, delimiter + param + "=" + value);

    }

    if (hash) {
        newString += '#' + hash;
    }

    return newString;
}



// /**
//  * InfiniteLoader - 使用 jQuery 简化 DOM 操作，适用于已引入 jQuery 的现代移动项目
//  */
// class InfiniteLoader {
//     constructor(options = {}) {
//         this.options = $.extend({
//             triggerSelector: '#load-trigger',
//             containerSelector: '#product-list-more',
//             loadingHtml: '<div id="loading-more" class="col-12 text-center my-3">Loading...</div>',
//             noMoreHtml: '<div class="col-12 text-center text-muted infinite-loader-no-more">No more products.</div>',
//             fetchData: null, // (page) => Promise or jqXHR
//             onPageChange: () => {},
//             maxPage: Infinity,
//             rootMargin: '100px'
//         }, options);

//         this.pageNum = 1;
//         this.isLoading = false;
//         this.observer = null;

//         this.init();
//     }

//     init() {
//         const $trigger = $(this.options.triggerSelector);
//         if ($trigger.length === 0 || !this.options.fetchData) return;

//         // 所有现代手机都支持 IntersectionObserver
//         this.observer = new IntersectionObserver(
//             (entries) => {
//                 if (entries[0].isIntersecting && !this.isLoading) {
//                     this.loadMore();
//                 }
//             }, {
//                 rootMargin: this.options.rootMargin
//             }
//         );
//         this.observer.observe($trigger[0]); // 取原生 DOM 元素
//     }

//     loadMore() {
//         if (this.pageNum > this.options.maxPage || this.isLoading) {
//             this.stopAndShowNoMore();
//             return;
//         }

//         this.isLoading = true;
//         const $container = $(this.options.containerSelector);
//         if ($container.length === 0) {
//             this.isLoading = false;
//             return;
//         }

//         $container.append(this.options.loadingHtml);

//         const request = this.options.fetchData(this.pageNum);

//         // 支持 jQuery Deferred（$.ajax）或原生 Promise
//         $.when(request).done((response) => {
//             $('#loading-more').remove();

//             if (response && response.html && response.html.trim()) {
//                 $container.append(response.html);
//                 this.pageNum = response.next_page ?? (this.pageNum + 1);
//                 this.options.onPageChange(this.pageNum - 1);

//                 if (this.pageNum > this.options.maxPage) {
//                     this.stopAndShowNoMore();
//                 }
//             } else {
//                 this.stopAndShowNoMore();
//             }
//         }).fail((xhr, status, error) => {
//             $('#loading-more').remove();
//             console.error('Load more failed:', error);
//             alert('加载失败，请重试。');
//         }).always(() => {
//             this.isLoading = false;
//         });
//     }

//     stopAndShowNoMore() {
//         if (this.observer) {
//             const $trigger = $(this.options.triggerSelector);
//             if ($trigger.length) this.observer.unobserve($trigger[0]);
//             this.observer.disconnect();
//             this.observer = null;
//         }

//         const $container = $(this.options.containerSelector);
//         if ($container.length && !$container.find('.infinite-loader-no-more').length) {
//             $container.append(this.options.noMoreHtml);
//         }
//     }

//     destroy() {
//         this.stopAndShowNoMore();
//     }
// }
