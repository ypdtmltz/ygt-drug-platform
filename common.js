/* 全局公共脚本：顶部日期 + 登录态用户条 + toast + 通用弹窗 + 各“更多/检索/无障碍”等入口的真实交互 */
(function () {
    var ROLE_NAMES = window.ROLE_NAMES || { public: '参保群众', village: '村医', county: '县级医生', pharmacy: '县药剂科' };

    /* ---------- 角色页面权限：各角色可见的导航 / 可访问页面 ---------- */
    var ROLE_PAGES = {
        public:   ['index', 'dashboard', 'chronic-service', 'guide', 'effect'],
        village:  ['index', 'dashboard', 'drug-manage', 'prescription', 'chronic-service', 'guide', 'effect'],
        county:   ['index', 'dashboard', 'prescription', 'chronic-service', 'guide', 'effect'],
        pharmacy: ['index', 'dashboard', 'drug-manage', 'chronic-service', 'guide', 'effect']
    };
    // 未登录游客仅可访问公开信息页
    var GUEST_PAGES = ['index', 'guide', 'effect'];
    function qs(name) {
        try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; }
    }
    function currentRole() {
        try { var r = localStorage.getItem('ygt_role'); if (r) return r; } catch (e) {}
        return qs('role');
    }
    function currentName() {
        try { var n = localStorage.getItem('ygt_name'); if (n) return n; } catch (e) {}
        return qs('name');
    }
    function allowedPages() {
        var r = currentRole();
        return r ? (ROLE_PAGES[r] || GUEST_PAGES) : GUEST_PAGES;
    }
    // 从 href 提取页面标识（如 drug-manage.html -> drug-manage）
    function pageKeyOf(href) {
        var m = (href || '').match(/([^/\\]+)\.html?$/i);
        return m ? m[1].replace(/\.html?$/i, '') : '';
    }
    var PAGE_KEY = pageKeyOf(location.href.split('#')[0]);

    /* 按角色过滤：顶部导航 + 页脚快速链接 + 页内权限模块 + 页面访问守卫 */
    function applyRoleAccess() {
        var role = currentRole();
        var allowed = (role && ROLE_PAGES[role]) ? ROLE_PAGES[role] : GUEST_PAGES;

        // 1) 顶部主导航
        document.querySelectorAll('.main-nav a').forEach(function (a) {
            var key = pageKeyOf(a.getAttribute('href'));
            if (key && allowed.indexOf(key) === -1) a.style.display = 'none';
        });
        // 2) 页脚快速链接
        document.querySelectorAll('.site-footer a').forEach(function (a) {
            var key = pageKeyOf(a.getAttribute('href'));
            if (key && allowed.indexOf(key) === -1) a.style.display = 'none';
        });
        // 3) 页内权限模块（标注 data-roles 的模块仅对指定角色展示）
        document.querySelectorAll('[data-roles]').forEach(function (el) {
            var roles = (el.getAttribute('data-roles') || '').split(/\s+/).filter(Boolean);
            if (roles.length && roles.indexOf(role) === -1) el.style.display = 'none';
        });

        // 4) 当前页面访问守卫：无权限则跳转（游客→登录页，已登录→工作台）
        if (PAGE_KEY && PAGE_KEY !== 'login' && PAGE_KEY !== 'dashboard' && allowed.indexOf(PAGE_KEY) === -1) {
            location.replace(role ? 'dashboard.html' : 'login.html');
        }
    }

    /* ---------- 顶部日期 ---------- */
    function renderDate() {
        var d = new Date(), w = ['日', '一', '二', '三', '四', '五', '六'];
        var s = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + w[d.getDay()];
        var el = document.getElementById('today');
        if (el) el.textContent = s;
    }

    /* ---------- 登录态：把 header-actions 里的“登录”按钮替换成当前用户信息 ---------- */
    function renderUser() {
        var role = currentRole();
        var name = currentName();
        if (!role) return;
        var box = document.querySelector('.header-actions');
        if (!box) return;
        box.innerHTML =
            '<span class="user-chip">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">' +
            '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>' +
            '<span>' + (name || '演示用户') + '</span>' +
            '<span class="role-tag">' + (ROLE_NAMES[role] || role) + '</span>' +
            '<a class="logout" href="javascript:void(0)" onclick="logout()">退出</a>' +
            '</span>';
    }

    window.logout = function () {
        try { localStorage.removeItem('ygt_role'); localStorage.removeItem('ygt_name'); } catch (e) {}
        location.href = 'login.html';
    };

    /* ---------- 通用 toast ---------- */
    window.toast = function (msg, type) {
        var box = document.getElementById('toast');
        if (!box) return;
        var t = document.createElement('div');
        t.className = 'toast' + (type ? ' ' + type : '');
        t.textContent = msg;
        box.appendChild(t);
        setTimeout(function () {
            t.style.opacity = '0';
            t.style.transition = 'opacity .3s';
            setTimeout(function () { t.remove(); }, 300);
        }, 2600);
    };

    /* ---------- 通用弹窗 ---------- */
    function ensureModal() {
        if (document.getElementById('jsModal')) return;
        var mask = document.createElement('div');
        mask.id = 'jsModal';
        mask.className = 'modal-mask';
        mask.innerHTML =
            '<div class="modal" style="max-width:820px">' +
            '<div class="modal-head"><h4 id="jsModalTitle"></h4><button class="close" onclick="closeModal()">✕</button></div>' +
            '<div id="jsModalBody" style="font-size:13.5px;line-height:1.9;color:var(--text)"></div>' +
            '</div>';
        mask.addEventListener('click', function (e) { if (e.target === mask) window.closeModal(); });
        document.body.appendChild(mask);
    }
    window.openModal = function (title, html) {
        ensureModal();
        document.getElementById('jsModalTitle').textContent = title;
        document.getElementById('jsModalBody').innerHTML = html;
        document.getElementById('jsModal').classList.add('show');
    };
    window.closeModal = function () {
        var m = document.getElementById('jsModal');
        if (m) m.classList.remove('show');
    };

    /* ---------- 详情正文模板 ---------- */
    function detailHtml(title, date) {
        date = date || '2026-08-14';
        return '<p class="muted" style="padding-bottom:10px;border-bottom:1px dashed var(--line)">发文单位：甘肃省临夏回族自治州卫生健康委员会　|　发布日期：' + date + '</p>' +
            '<p style="margin-top:12px;text-indent:2em">为进一步深化紧密型县域医共体建设，规范基层药品目录、处方流转与慢病用药管理，现将《' + title + '》有关内容予以发布（演示正文）。</p>' +
            '<p style="margin-top:8px;text-indent:2em">各县级医疗机构、乡镇卫生院、村卫生室要对照本内容抓好贯彻落实，及时通过平台完成相关业务办理，确保基层群众用药可及、取药便捷。</p>' +
            '<p style="margin-top:8px;text-indent:2em">正式系统上线后，此处将展示文件原文、适用范围、办理流程与咨询渠道。</p>';
    }

    /* ---------- “更多”扩展列表 ---------- */
    var MORE_DATA = {
        '通知公告': [
            ['关于开展2026年度基层药品目录动态调整工作的通知', '2026-08-10'],
            ['关于慢病长处方续方权限管理规范的说明', '2026-08-05'],
            ['县药械供应保障中心药品配送工作提示', '2026-07-28'],
            ['关于规范村卫生室缺药申报流程的通知', '2026-07-15'],
            ['关于进一步做好慢病用药配送服务的通知', '2026-07-02'],
            ['2026年上半年基层药品保障情况通报', '2026-06-30']
        ],
        '政策文件': [
            ['《国家基本药物目录（2026年版）》', '2026-06', 'https://www.gov.cn/zhengce/zhengceku/202607/content_7074868.htm'],
            ['基本药物使用考核有关要求（"986"口径解读）', '2026-07', 'https://www.nhc.gov.cn/yaozs/c100098/new_list.shtml'],
            ['紧密型县域医共体建设实施方案', '2025-12', 'https://www.gov.cn/zhengce/zhengceku/202312/content_6923447.htm'],
            ['处方流转与医保结算衔接工作规范', '2026-03', 'https://www.nhsa.gov.cn/'],
            ['基层慢病长处方管理办法', '2026-02', 'https://www.nhc.gov.cn/'],
            ['药品集中带量采购落地实施工作要点', '2026-04', 'https://www.nhsa.gov.cn/']
        ]
    };
    function moreHtml(group) {
        var items = MORE_DATA[group] || [
            [group + ' 相关条目（一）', '2026-08'],
            [group + ' 相关条目（二）', '2026-07'],
            [group + ' 相关条目（三）', '2026-06']
        ];
        var lis = items.map(function (it) {
            var url = it[2];
            var a = url
                ? '<a href="' + url + '" target="_blank" rel="noopener">' + it[0] + '</a>'
                : '<a href="javascript:void(0)" class="js-detail" data-title="' + it[0] + '" data-date="' + it[1] + '">' + it[0] + '</a>';
            return '<li><span class="tag">' + (group === '政策文件' ? '文件' : '公告') + '</span>' + a + '<span class="date">' + it[1] + '</span></li>';
        }).join('');
        return '<ul class="notice-list">' + lis + '</ul>';
    }

    /* ---------- 检索索引：服务/政策/指南条目（药品由 DRUG_DB 提供） ---------- */
    var SEARCH_INDEX = [
        { t: '慢病长处方续方', k: '续方 慢病 长处方', c: '服务', link: 'chronic-service.html' },
        { t: '慢病用药电子档案', k: '档案 慢病 建档', c: '服务', link: 'chronic-service.html' },
        { t: '国家基本药物目录（2026年版）', k: '基药 目录', c: '政策', link: 'https://www.gov.cn/zhengce/zhengceku/202607/content_7074868.htm' },
        { t: '基本药物使用考核要求（986）', k: '986 基药考核', c: '政策', link: 'https://www.nhc.gov.cn/yaozs/c100098/new_list.shtml' },
        { t: '缺药申报与在线审核', k: '缺药 申报 审核', c: '指南', link: 'drug-manage.html' },
        { t: '处方流转与权限协同', k: '处方 流转 审核 授权', c: '指南', link: 'prescription.html' }
    ];
    // 药品是否命中关键词（名称 / 关键词含商品名·别名·适应症）
    function drugMatch(d, kw) {
        if (!kw) return false;
        return (d.name + ' ' + d.k + ' ' + d.cat + ' ' + d.ind + ' ' + d.fac).toLowerCase().indexOf(kw) > -1;
    }
    function drugResultHtml(hits) {
        var rows = hits.map(function (d) {
            var badge = d.cls === '甲类' ? '<span class="badge pass">甲类</span>' : '<span class="badge info">乙类</span>';
            return '<tr>' +
                '<td style="text-align:left"><b>' + d.name + '</b><div class="muted" style="font-size:12px">' + d.ind + '</div></td>' +
                '<td>' + d.form + '</td>' +
                '<td>' + d.cat + '</td>' +
                '<td>' + badge + '</td>' +
                '<td>' + d.fac + '</td>' +
                '</tr>';
        }).join('');
        return '<table class="data"><thead><tr><th>药品通用名</th><th>剂型</th><th>类别</th><th>医保</th><th>生产企业</th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table>';
    }
    function serviceResultHtml(hits) {
        var lis = hits.map(function (i) {
            var ext = /^https?:/i.test(i.link) ? ' target="_blank" rel="noopener"' : '';
            return '<li><span class="tag' + (i.c === '政策' ? ' doc' : '') + '">' + i.c + '</span>' +
                '<a href="' + i.link + '"' + ext + '>' + i.t + '</a></li>';
        }).join('');
        return '<ul class="notice-list">' + lis + '</ul>';
    }
    function doSearch(kw) {
        kw = (kw || '').trim().toLowerCase();
        var allowed = allowedPages();

        // 药品库检索（需输入关键词，最多 30 条）
        var drugHits = [];
        if (window.DRUG_DB && kw) {
            drugHits = DRUG_DB.filter(function (d) { return drugMatch(d, kw); }).slice(0, 30);
        }
        // 服务/政策/指南检索，并按角色过滤内部链接
        var servHits = SEARCH_INDEX.filter(function (i) {
            var ok = !kw || i.t.toLowerCase().indexOf(kw) > -1 || (i.k || '').toLowerCase().indexOf(kw) > -1;
            if (!ok) return false;
            if (allowed && !/^https?:/i.test(i.link)) {
                if (allowed.indexOf(pageKeyOf(i.link)) === -1) return false;
            }
            return true;
        });

        if (!drugHits.length && !servHits.length) {
            return '<div class="empty">未找到与「' + (kw || '') + '」相关的内容，请更换关键词后重试。</div>';
        }
        var html = '';
        if (drugHits.length) {
            html += '<div style="margin-bottom:6px;font-size:13px;color:var(--blue-deep);font-weight:700">药品检索结果（' + drugHits.length + ' 条）</div>' + drugResultHtml(drugHits);
        }
        if (servHits.length) {
            if (html) html += '<div style="margin:18px 0 8px;font-size:13px;color:var(--blue-deep);font-weight:700">服务 / 政策 / 指南</div>';
            html += serviceResultHtml(servHits);
        }
        html += '<div class="data-note" style="margin-top:12px">数据来源：国家基本药物目录（2026年版）与国家医保药品目录（2023年版）节选 · 演示数据，仅供参考。</div>';
        return html;
    }

    /* ---------- 统一交互路由：让所有 href="javascript:void(0)" 的链接都有响应 ---------- */
    document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href="javascript:void(0)"]');
        if (!a) return;

        // 已有内联 onclick 的（如“退出”）交由其自身处理，不重复响应
        if (a.hasAttribute('onclick')) return;
        // 工作台左侧菜单（data-action）由 dashboard 自身脚本处理
        if (a.hasAttribute('data-action')) return;

        // 1) 顶部工具条：无障碍 / 适老 / 设首页 / 收藏
        if (a.closest('.topbar')) { handleUtility(a); return; }

        // 2) 页脚：意见反馈等
        if (a.closest('.site-footer')) { handleFooter(a); return; }

        // 3) “更多”
        if (a.classList.contains('more') && a.textContent.indexOf('更多') > -1) { handleMore(a); return; }

        // 4) 通用详情（通知/政策条目、表格“查看”等）
        var title = a.getAttribute('data-title') || a.textContent.trim();
        var date = a.getAttribute('data-date') || (function () {
            var li = a.closest('li'); if (li) { var d = li.querySelector('.date'); if (d) return d.textContent; }
            var tr = a.closest('tr'); if (tr) { var c = tr.querySelector('.date'); if (c) return c.textContent; }
            return '';
        })();
        openModal(title, detailHtml(title, date));
    });

    function handleUtility(a) {
        var t = a.textContent.trim();
        if (t.indexOf('无障碍') > -1) {
            document.body.classList.toggle('bf-mode');
            toast(document.body.classList.contains('bf-mode') ? '已开启无障碍浏览（字号放大）' : '已关闭无障碍浏览');
        } else if (t.indexOf('适老') > -1) {
            document.body.classList.toggle('elder-mode');
            toast(document.body.classList.contains('elder-mode') ? '已开启适老模式（大字号）' : '已关闭适老模式');
        } else if (t.indexOf('设为首页') > -1) {
            toast('请在浏览器菜单中选择“设置 > 主页”，将本站设为首页');
        } else if (t.indexOf('加入收藏') > -1) {
            toast('请按快捷键 Ctrl + D 收藏本站');
        }
    }
    function handleFooter(a) {
        var t = a.textContent.trim();
        if (t.indexOf('意见反馈') > -1 || t.indexOf('在线留言') > -1) {
            openModal('意见反馈', '<label>反馈内容<span class="req">*</span></label><textarea id="fbText" rows="4" placeholder="请输入您的意见建议..."></textarea>' +
                '<div class="actions"><button class="btn" onclick="submitFeedback()">提交反馈</button></div>');
        } else {
            toast(t);
        }
    }
    window.submitFeedback = function () {
        var v = (document.getElementById('fbText') ? document.getElementById('fbText').value : '').trim();
        if (!v) { toast('请先填写反馈内容', 'warn'); return; }
        closeModal();
        toast('反馈提交成功，感谢您的宝贵意见！');
    };
    function handleMore(a) {
        var head = a.closest('.sec-head') || a.closest('.panel-head');
        var title = head ? ((head.querySelector('h2,h3') || {}).textContent || '').trim() : '';
        openModal(title + '（更多）', moreHtml(title));
    }

    /* ---------- 页头检索框 ---------- */
    function bindSearch() {
        var box = document.querySelector('.searchbox');
        if (!box) return;
        var input = box.querySelector('input');
        var btn = box.querySelector('button');
        function run() {
            var kw = input.value;
            openModal('检索结果', doSearch(kw));
        }
        btn.addEventListener('click', run);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
    }

    /* ---------- 初始化 ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        // 若登录态通过 URL 参数传入（localStorage 被禁用时的兜底），回填 localStorage 以便后续页面保持登录态
        var _r = qs('role'), _n = qs('name');
        if (_r) {
            try { localStorage.setItem('ygt_role', _r); if (_n) localStorage.setItem('ygt_name', _n); } catch (e) {}
        }
        renderDate();
        renderUser();
        applyRoleAccess();
        bindSearch();
        // 检索框提示语：支持通用名 / 商品名 / 别名
        var si = document.querySelector('.searchbox input');
        if (si) si.placeholder = '请输入药品名称 / 商品名检索';
    });
})();
