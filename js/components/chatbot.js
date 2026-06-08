/**
 * EAUT PHONE — Trợ lý hỏi đáp rule-based (không AI API, không database)
 */
(function (global) {
    'use strict';

    var FAQ_FALLBACK = {
        welcome: 'Xin chào! Em là trợ lý EAUT PHONE. Chọn nút bên dưới hoặc gõ câu hỏi về mua hàng, COD, VNPay, tài khoản, đơn hàng…',
        fallback: 'Em chưa hiểu rõ. Thử: mua hàng, COD, VNPay, đăng nhập, chọn màu, hủy đơn, đánh giá, bảo hành, liên hệ.',
        quickMenus: [
            { id: 'buy', label: 'Hướng dẫn mua hàng' },
            { id: 'account', label: 'Đăng nhập' },
            { id: 'cod', label: 'COD' },
            { id: 'vnpay', label: 'VNPay' },
            { id: 'color', label: 'Chọn màu' },
            { id: 'order', label: 'Đơn hàng' },
            { id: 'review', label: 'Đánh giá' },
            { id: 'warranty', label: 'Bảo hành' },
            { id: 'contact', label: 'Liên hệ' },
            { id: 'news', label: 'Tin tức' },
            { id: 'search', label: 'Tìm sản phẩm' }
        ],
        rules: [],
        searchHints: {
            iphone: 'iPhone', samsung: 'Samsung', huawei: 'Huawei', oppo: 'Oppo',
            xiaomi: 'Xiaomi', nokia: 'Nokia', vivo: 'Vivo', realme: 'Realme', mobi: 'Mobi'
        }
    };

    var MENU_TRIGGERS = {
        buy: ['mua hang', 'huong dan mua', 'dat hang'],
        account: ['dang nhap', 'dang ky', 'tai khoan'],
        cod: ['cod', 'thanh toan khi nhan'],
        vnpay: ['vnpay', 'sandbox'],
        color: ['chon mau', 'mau sac', 'bien the'],
        order: ['don hang', 'lich su don', 'huy don'],
        review: ['danh gia', 'binh luan', 'review'],
        warranty: ['bao hanh', 'trung tam bao hanh'],
        contact: ['lien he', 'hotline', 'cskh'],
        news: ['tin tuc', 'tin cong nghe', 'cong nghe', 'bai viet'],
        search: ['tim kiem', 'tim san pham', 'tim sp']
    };

    var faqData = null;
    var ui = { panel: null, messages: null, input: null, toggle: null };
    var isOpen = false;
    var typingTimer = null;

    function isAdminPage() {
        var path = (global.location.pathname || '').toLowerCase();
        var href = (global.location.href || '').toLowerCase();
        return path.indexOf('admin.html') !== -1 || href.indexOf('admin.html') !== -1;
    }

    function removeVietnameseTone(str) {
        if (!str) return '';
        var map = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
            'đ': 'd'
        };
        return str.toLowerCase().split('').map(function (ch) {
            return map[ch] !== undefined ? map[ch] : ch;
        }).join('');
    }

    function normalize(text) {
        return removeVietnameseTone(String(text || '').trim())
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getFaq() {
        return faqData || FAQ_FALLBACK;
    }

    function loadFaq(callback) {
        fetch('data/chatbot-faq.json')
            .then(function (r) {
                if (!r.ok) throw new Error('FAQ load failed');
                return r.json();
            })
            .then(function (data) {
                faqData = data;
                if (callback) callback();
            })
            .catch(function () {
                faqData = FAQ_FALLBACK;
                if (callback) callback();
            });
    }

    function findRuleByKeywords(normText) {
        var faq = getFaq();
        var rules = faq.rules || [];
        var best = null;
        var bestScore = 0;

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            var kws = rule.keywords || [];
            for (var j = 0; j < kws.length; j++) {
                var kw = normalize(kws[j]);
                if (!kw) continue;
                if (normText === kw || normText.indexOf(kw) !== -1) {
                    var score = kw.length;
                    if (score > bestScore) {
                        bestScore = score;
                        best = rule;
                    }
                }
            }
        }
        return best;
    }

    function findRuleByMenuId(menuId) {
        var triggers = MENU_TRIGGERS[menuId];
        if (!triggers || !triggers.length) return null;
        return findRuleByKeywords(triggers[0]);
    }

    function detectProductSearch(normText) {
        var faq = getFaq();
        var hints = faq.searchHints || {};
        var keys = Object.keys(hints);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (normText.indexOf(key) !== -1) {
                return hints[key];
            }
        }
        if (normText.indexOf('tin tuc') !== -1 || normText.indexOf('cong nghe') !== -1) {
            return null;
        }
        var m = normText.match(/(?:tim|tim kiem|search)\s+(.+)/);
        if (m && m[1]) {
            var q = m[1].trim();
            if (q.length >= 2) return q;
        }
        return null;
    }

    function buildSearchReply(brandOrQuery) {
        return {
            answer: 'Em chuyển bạn sang Trang chủ với từ khóa "' + brandOrQuery + '". Bạn có thể tiếp tục lọc theo giá, khuyến mãi hoặc hãng.',
            actions: [{ label: 'Tìm "' + brandOrQuery + '"', action: 'search', query: brandOrQuery }]
        };
    }

    function matchUserMessage(raw) {
        var norm = normalize(raw);
        if (!norm) return { answer: 'Bạn vui lòng nhập câu hỏi hoặc chọn nút gợi ý bên dưới.', actions: [
            { label: 'Bảo hành', url: 'trungtambaohanh.html' },
            { label: 'Liên hệ', url: 'lienhe.html' },
            { label: 'Tin tức', url: 'tintuc.html' },
            { label: 'Tìm sản phẩm', action: 'search', query: 'iPhone' }
        ] };

        var productQ = detectProductSearch(norm);
        if (productQ) return buildSearchReply(productQ);

        var rule = findRuleByKeywords(norm);
        if (rule) {
            return { answer: rule.answer, actions: rule.actions || [] };
        }

        return { answer: getFaq().fallback, actions: [
            { label: 'Bảo hành', url: 'trungtambaohanh.html' },
            { label: 'Liên hệ', url: 'lienhe.html' },
            { label: 'Tin tức', url: 'tintuc.html' }
        ] };
    }

    function navigate(url) {
        if (url) global.location.href = url;
    }

    function runSearch(query) {
        var q = encodeURIComponent(query || '');
        global.location.href = 'index.html?search=' + q;
    }

    function openLoginModal() {
        if (typeof global.checkTaiKhoan === 'function') {
            global.checkTaiKhoan();
            return;
        }
        if (typeof global.showTaiKhoan === 'function') {
            global.showTaiKhoan(true);
            return;
        }
        navigate('index.html');
    }

    function handleAction(action) {
        if (!action) return;
        if (action.action === 'openLogin') {
            openLoginModal();
            return;
        }
        if (action.action === 'search' && action.query) {
            runSearch(action.query);
            return;
        }
        if (action.url) {
            navigate(action.url);
        }
    }

    function scrollMessagesToEnd() {
        if (ui.messages) {
            ui.messages.scrollTop = ui.messages.scrollHeight;
        }
    }

    function appendMessage(text, role, actions) {
        if (!ui.messages) return;

        var wrap = document.createElement('div');
        wrap.className = 'eaut-chat-msg ' + (role === 'user' ? 'user' : 'bot');

        var avatar = document.createElement('div');
        avatar.className = 'eaut-chat-avatar ' + (role === 'user' ? 'user' : 'bot');
        avatar.innerHTML = role === 'user'
            ? '<i class="fa fa-user" aria-hidden="true"></i>'
            : '<i class="fa fa-headphones" aria-hidden="true"></i>';
        wrap.appendChild(avatar);

        var bubble = document.createElement('div');
        bubble.className = 'eaut-chat-bubble';
        bubble.textContent = text;
        wrap.appendChild(bubble);

        if (actions && actions.length) {
            var row = document.createElement('div');
            row.className = 'eaut-chat-actions';
            for (var i = 0; i < actions.length; i++) {
                (function (act) {
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.textContent = act.label || 'Mở';
                    btn.onclick = function () { handleAction(act); };
                    row.appendChild(btn);
                })(actions[i]);
            }
            wrap.appendChild(row);
        }

        ui.messages.appendChild(wrap);
        scrollMessagesToEnd();
    }

    function appendTyping() {
        if (!ui.messages) return null;
        removeTyping();
        var wrap = document.createElement('div');
        wrap.className = 'eaut-chat-msg bot eaut-chat-typing';
        wrap.id = 'eaut-chat-typing';
        var bubble = document.createElement('div');
        bubble.className = 'eaut-chat-bubble';
        bubble.innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span>';
        wrap.appendChild(bubble);
        ui.messages.appendChild(wrap);
        scrollMessagesToEnd();
        return wrap;
    }

    function removeTyping() {
        var typing = document.getElementById('eaut-chat-typing');
        if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
    }

    function botReply(reply) {
        removeTyping();
        appendMessage(reply.answer, 'bot', reply.actions);
    }

    function onUserSend() {
        var text = ui.input ? ui.input.value.trim() : '';
        if (!text) return;
        appendMessage(text, 'user');
        if (ui.input) ui.input.value = '';

        appendTyping();
        if (typingTimer) clearTimeout(typingTimer);
        typingTimer = setTimeout(function () {
            var reply = matchUserMessage(text);
            botReply(reply);
        }, 450);
    }

    function onQuickMenu(menuId) {
        var rule = findRuleByMenuId(menuId);
        if (menuId === 'search') {
            botReply({
                answer: 'Bạn gõ tên máy (vd: iPhone, Samsung) hoặc bấm nút tìm nhanh:',
                actions: [
                    { label: 'iPhone', action: 'search', query: 'iPhone' },
                    { label: 'Samsung', action: 'search', query: 'Samsung' },
                    { label: 'Oppo', action: 'search', query: 'Oppo' },
                    { label: 'Tin tức', url: 'tintuc.html' },
                    { label: 'Trang chủ', url: 'index.html' }
                ]
            });
            return;
        }
        if (menuId === 'news') {
            botReply({
                answer: 'Bạn có thể xem các bài viết công nghệ, mẹo chọn máy và cập nhật sản phẩm mới tại mục Tin tức.',
                actions: [
                    { label: 'Mở tin tức', url: 'tintuc.html' },
                    { label: 'Tìm iPhone', action: 'search', query: 'iPhone' }
                ]
            });
            return;
        }
        if (rule) {
            botReply({ answer: rule.answer, actions: rule.actions || [] });
        } else if (menuId === 'news') {
            botReply({
                answer: 'Bạn có thể xem các bài viết công nghệ, mẹo chọn máy và cập nhật sản phẩm mới tại mục Tin tức.',
                actions: [
                    { label: 'Mở tin tức', url: 'tintuc.html' },
                    { label: 'Tìm iPhone', action: 'search', query: 'iPhone' }
                ]
            });
        } else {
            botReply({ answer: getFaq().fallback, actions: [
                { label: 'Bảo hành', url: 'trungtambaohanh.html' },
                { label: 'Liên hệ', url: 'lienhe.html' },
                { label: 'Tin tức', url: 'tintuc.html' }
            ] });
        }
    }

    function renderQuickMenu() {
        var bar = document.getElementById('eaut-chat-quick');
        if (!bar) return;
        bar.innerHTML = '';
        var menus = getFaq().quickMenus || [];
        for (var i = 0; i < menus.length; i++) {
            (function (item) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = item.label;
                btn.onclick = function () { onQuickMenu(item.id); };
                bar.appendChild(btn);
            })(menus[i]);
        }
    }

    function setOpen(open) {
        isOpen = open;
        if (ui.panel) ui.panel.classList.toggle('is-open', open);
        if (ui.toggle) {
            ui.toggle.classList.toggle('is-open', open);
            ui.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            ui.toggle.innerHTML = open
                ? '<i class="fa fa-times" aria-hidden="true"></i>'
                : '<i class="fa fa-comments" aria-hidden="true"></i>';
        }
        if (open && ui.messages && ui.messages.childElementCount === 0) {
            appendTyping();
            setTimeout(function () {
                botReply({ answer: getFaq().welcome, actions: [
                    { label: 'Bảo hành', url: 'trungtambaohanh.html' },
                    { label: 'Liên hệ', url: 'lienhe.html' },
                    { label: 'Tìm sản phẩm', action: 'search', query: 'iPhone' }
                ] });
            }, 350);
        }
    }

    function togglePanel() {
        setOpen(!isOpen);
    }

    function buildDom() {
        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.id = 'eaut-chatbot-toggle';
        toggle.title = 'Mở trợ lý chat EAUT PHONE';
        toggle.setAttribute('aria-label', 'Mở trợ lý chat EAUT PHONE');
        toggle.innerHTML = '<i class="fa fa-comments" aria-hidden="true"></i><span class="eaut-chatbot-toggle-label">Chatbot</span>';
        toggle.onclick = togglePanel;

        var panel = document.createElement('div');
        panel.id = 'eaut-chatbot-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Trợ lý EAUT PHONE');

        panel.innerHTML =
            '<div class="eaut-chat-header">' +
            '  <div><strong>EAUT PHONE</strong><span>Trợ lý hỗ trợ • Rule-based</span></div>' +
            '  <button type="button" class="eaut-chat-close" aria-label="Đóng">&times;</button>' +
            '</div>' +
            '<div class="eaut-chat-messages" id="eaut-chat-messages"></div>' +
            '<div class="eaut-chat-quick" id="eaut-chat-quick"></div>' +
            '<div class="eaut-chat-input-row">' +
            '  <input type="text" id="eaut-chat-input" placeholder="Nhập câu hỏi..." autocomplete="off" maxlength="300">' +
            '  <button type="button" id="eaut-chat-send" title="Gửi"><i class="fa fa-paper-plane"></i></button>' +
            '</div>';

        document.body.appendChild(toggle);
        document.body.appendChild(panel);

        ui.toggle = toggle;
        ui.panel = panel;
        ui.messages = document.getElementById('eaut-chat-messages');
        ui.input = document.getElementById('eaut-chat-input');

        panel.querySelector('.eaut-chat-close').onclick = function () { setOpen(false); };

        var sendBtn = document.getElementById('eaut-chat-send');
        if (sendBtn) sendBtn.onclick = onUserSend;
        if (ui.input) {
            ui.input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    onUserSend();
                }
            });
        }
    }

    function initEautChatbot() {
        if (isAdminPage()) return;
        if (document.getElementById('eaut-chatbot-toggle')) return;

        buildDom();
        loadFaq(function () {
            renderQuickMenu();
        });
    }

    function boot() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initEautChatbot);
        } else {
            initEautChatbot();
        }
    }

    global.initEautChatbot = initEautChatbot;
    boot();
})(window);
