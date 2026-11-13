// 檔案名稱：widget.js | 用途：校網「每日英語」三合一挑戰版（免資料庫版：讀取 feed.js）
(function() {
    // [免資料庫版] 資料來源：同資料夾的靜態檔 feed.js（以 <script> 載入，不受 CORS 與免費主機防護頁影響）
    const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || (function () {
        const all = document.getElementsByTagName('script');
        for (let i = all.length - 1; i >= 0; i--) { if (/widget\.js(\?|$)/.test(all[i].src)) return all[i].src; }
        return '';
    })();
    const FEED_URL = window.DAILY_ENGLISH_FEED_URL || (SCRIPT_SRC ? SCRIPT_SRC.replace(/widget\.js(\?.*)?$/, 'feed.js') : 'feed.js');
    const CONTAINER_ID = 'daily-english-widget-container';

    const CISIAN_THEME = {
        primary: '#005599',
        secondary: '#fbbf24',
        success: '#16a34a',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#0ea5e9',
        bg: '#ffffff'
    };

    function injectStyles() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fa);
        }

        const css = `
            #${CONTAINER_ID}.english-widget {
                background: ${CISIAN_THEME.bg};
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                font-family: 'Noto Sans TC', sans-serif;
                width: 100%; max-width: 100%; height: auto; min-height: 280px;
                box-sizing: border-box; display: flex; flex-direction: column;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; margin: 0 auto; position: relative;
            }
            #${CONTAINER_ID} .w-header {
                padding: 10px 20px; border-bottom: 2px dashed ${CISIAN_THEME.secondary};
                display: flex; justify-content: flex-start; align-items: center; gap: 12px; background: #fdfdfd; flex-shrink: 0;
            }
            #${CONTAINER_ID} .w-header .title { font-size: 1.1rem; font-weight: 800; color: ${CISIAN_THEME.primary}; }
            #${CONTAINER_ID} .w-header .cat-badge { 
                background: ${CISIAN_THEME.primary}; color: white; padding: 3px 12px; border-radius: 6px; font-size: 0.85rem; white-space: nowrap;
            }
            #${CONTAINER_ID} .w-main {
                flex: 1; display: flex; flex-direction: column; padding: 20px 30px;
                align-items: center; justify-content: center; gap: 15px; position: relative;
            }
            #${CONTAINER_ID} .view-section {
                width: 100%; display: none; flex-direction: column; align-items: center; gap: 10px; animation: fadeIn 0.3s ease-in;
            }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            #${CONTAINER_ID} .view-normal { display: flex; }
            #${CONTAINER_ID} .w-en { 
                font-size: 1.8rem; font-weight: 900; color: #0f172a; text-align: center; width: 100%; line-height: 1.3; cursor: pointer;
            }
            #${CONTAINER_ID} .w-pho { color: #64748b; font-family: 'Courier New', monospace; font-size: 1.1rem; }
            #${CONTAINER_ID} .w-ch { font-size: 1.3rem; color: #475569; font-weight: 600; text-align: center; }
            #${CONTAINER_ID} .w-content-tags { display: flex; justify-content: center; align-items: center; gap: 15px; flex-wrap: wrap; width: 100%; }
            #${CONTAINER_ID} .tag-row { 
                display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; 
                border-radius: 8px; padding: 6px 12px; position: relative; cursor: help;
            }
            #${CONTAINER_ID} .tooltip {
                visibility: hidden; width: 220px; background-color: #334155; color: #fff;
                text-align: left; border-radius: 6px; padding: 10px; position: absolute;
                z-index: 20; bottom: 120%; left: 50%; transform: translateX(-50%);
                opacity: 0; transition: opacity 0.3s; font-size: 0.85rem; pointer-events: none;
            }
            #${CONTAINER_ID} .tag-row:hover .tooltip { visibility: visible; opacity: 1; }
            #${CONTAINER_ID} .tag-label { width: 28px; height: 28px; border-radius: 6px; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
            #${CONTAINER_ID} .bg-syn { background: ${CISIAN_THEME.success}; }
            #${CONTAINER_ID} .bg-ant { background: ${CISIAN_THEME.danger}; }
            #${CONTAINER_ID} .game-menu-title { font-size: 1.2rem; font-weight: bold; color: #475569; margin-bottom: 10px; }
            #${CONTAINER_ID} .game-menu-btns { display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; }
            #${CONTAINER_ID} .btn-game-mode {
                width: 130px; height: 110px; border: 2px solid #e2e8f0; border-radius: 12px;
                background: white; color: ${CISIAN_THEME.primary}; cursor: pointer;
                display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
                transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; overflow: hidden;
            }
            #${CONTAINER_ID} .btn-game-mode:hover { transform: translateY(-5px); border-color: ${CISIAN_THEME.primary}; background: #f0f9ff; }
            #${CONTAINER_ID} .btn-game-mode i { font-size: 2rem; }
            #${CONTAINER_ID} .btn-game-mode span { font-weight: bold; font-size: 0.95rem; text-align: center; }
            #${CONTAINER_ID} .btn-game-mode small { font-size: 0.75rem; color: #64748b; }
            #${CONTAINER_ID} .quiz-header {
                width: 100%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
                border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 5px;
            }
            #${CONTAINER_ID} .quiz-title { font-weight: bold; color: #64748b; font-size: 1rem; display: flex; align-items: center; gap: 5px; }
            #${CONTAINER_ID} .quiz-timer { font-family: monospace; font-size: 1.1rem; font-weight: bold; color: #ef4444; background: #fee2e2; padding: 2px 8px; border-radius: 4px; }
            #${CONTAINER_ID} .quiz-tools { display: flex; gap: 8px; }
            #${CONTAINER_ID} .btn-hint {
                background: #e0f2fe; color: ${CISIAN_THEME.primary}; border: 1px solid #bae6fd;
                padding: 4px 10px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; font-weight: bold;
                display: flex; align-items: center; gap: 5px; transition: all 0.2s;
            }
            #${CONTAINER_ID} .btn-hint:hover { background: #bae6fd; }
            #${CONTAINER_ID} .quiz-area {
                width: 100%; min-height: 60px; border: 2px dashed #cbd5e1; border-radius: 8px;
                display: flex; flex-wrap: wrap; gap: 8px; padding: 15px; justify-content: center; align-items: center;
                background: #f8fafc; margin-bottom: 10px; transition: all 0.3s;
            }
            #${CONTAINER_ID} .quiz-area.correct-flash { background: #dcfce7; border-color: #22c55e; }
            #${CONTAINER_ID} .word-pool { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; padding: 5px; min-height: 50px; }
            #${CONTAINER_ID} .word-btn {
                background: white; border: 2px solid ${CISIAN_THEME.primary}; color: ${CISIAN_THEME.primary};
                padding: 8px 18px; border-radius: 25px; font-weight: bold; cursor: pointer;
                transition: all 0.1s; user-select: none; font-size: 1.15rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            #${CONTAINER_ID} .word-btn:hover { background: ${CISIAN_THEME.primary}; color: white; transform: translateY(-2px); }
            #${CONTAINER_ID} .spelling-sentence { font-size: 1.5rem; color: #334155; font-weight: bold; text-align: center; line-height: 1.5; margin-bottom: 10px; }
            #${CONTAINER_ID} .blank-word { display: inline-block; min-width: 80px; border-bottom: 3px solid ${CISIAN_THEME.primary}; color: ${CISIAN_THEME.primary}; padding: 0 5px; text-align: center; cursor: pointer; }
            #${CONTAINER_ID} .char-btn {
                width: 45px; height: 45px; border-radius: 8px; font-size: 1.5rem; font-weight: bold;
                background: white; border: 2px solid #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center;
                cursor: pointer; transition: all 0.1s; user-select: none;
            }
            #${CONTAINER_ID} .char-btn.selected { background: ${CISIAN_THEME.info}; color: white; border-color: ${CISIAN_THEME.info}; }
            #${CONTAINER_ID} .mic-btn {
                width: 80px; height: 80px; border-radius: 50%; background: ${CISIAN_THEME.danger}; color: white;
                border: 4px solid #fee2e2; font-size: 2.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 10px rgba(239,68,68,0.3); transition: all 0.2s; margin: 10px auto;
            }
            #${CONTAINER_ID} .mic-btn:hover { transform: scale(1.05); }
            #${CONTAINER_ID} .mic-btn.listening { animation: pulse 1.5s infinite; background: #dc2626; }
            @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(220, 38, 38, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); } }
            #${CONTAINER_ID} .speak-result { min-height: 40px; font-size: 1.2rem; text-align: center; color: #64748b; font-weight: bold; }
            #${CONTAINER_ID} .stars { color: #fbbf24; font-size: 2rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); letter-spacing: 5px; }
            #${CONTAINER_ID} .quiz-msg { font-size: 1.2rem; font-weight: bold; min-height: 28px; color: ${CISIAN_THEME.success}; text-align: center; }
            #${CONTAINER_ID} .quiz-msg.error { color: ${CISIAN_THEME.danger}; }
            #${CONTAINER_ID} .w-footer {
                padding: 10px 20px; background: #f8fafc; border-top: 2px dashed #f97316;
                display: flex; justify-content: flex-end; align-items: center; gap: 10px; flex-wrap: wrap;
            }
            #${CONTAINER_ID} .btn-circle { width: 40px; height: 40px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #475569; font-size: 1.1rem; }
            #${CONTAINER_ID} .btn-long { padding: 0 15px; height: 40px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; color: white; font-size: 0.95rem; }
            #${CONTAINER_ID} .btn-play { background: ${CISIAN_THEME.primary}; }
            #${CONTAINER_ID} .btn-quiz { background: #8b5cf6; }
            #${CONTAINER_ID} .btn-link { background: #ef4444; }
            #${CONTAINER_ID} .btn-next { background: #bef264; color: #365314; }
            #${CONTAINER_ID} .btn-quit-quiz { background: #64748b; color: white; }
            @media screen and (max-width: 600px) {
                #${CONTAINER_ID} .w-footer { justify-content: center; }
                #${CONTAINER_ID} .btn-long { flex-grow: 1; justify-content: center; }
                #${CONTAINER_ID} .w-en { font-size: 1.5rem; }
                #${CONTAINER_ID} .quiz-header { justify-content: center; }
            }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function buildLayout() {
        const container = document.getElementById(CONTAINER_ID);
        if(!container) return;
        container.className = 'english-widget';
        container.innerHTML = `
            <div id="w-loading" style="position:absolute; inset:0; background:rgba(255,255,255,0.8); z-index:10; display:none; align-items:center; justify-content:center;"><i class="fa-solid fa-sync fa-spin fa-2x"></i></div>
            <div class="w-header">
                <i class="fa-solid fa-graduation-cap"></i>
                <span class="title">Daily English</span>
                <span id="cat-badge" class="cat-badge">---</span>
            </div>
            
            <div class="w-main">
                <div id="view-normal" class="view-section view-normal">
                    <div class="w-en" id="w-en">Loading...</div>
                    <div class="w-pho" id="w-pho"></div>
                    <div class="w-ch" id="w-ch"></div>
                    <div class="w-content-tags">
                        <div class="tag-row" id="row-syn"><span class="tag-label bg-syn">同</span><span class="tag-text" id="w-syn"></span><div class="tooltip" id="tip-syn"></div></div>
                        <div class="tag-row" id="row-ant"><span class="tag-label bg-ant">反</span><span class="tag-text" id="w-ant"></span><div class="tooltip" id="tip-ant"></div></div>
                    </div>
                </div>
                <div id="view-menu" class="view-section">
                    <div class="game-menu-title">請選擇挑戰模式：</div>
                    <div class="game-menu-btns">
                        <button type="button" class="btn-game-mode" id="btn-mode-sentence"><i class="fa-solid fa-layer-group"></i><span>句子重組<br><small>Sentence</small></span></button>
                        <button type="button" class="btn-game-mode" id="btn-mode-spelling"><i class="fa-solid fa-font"></i><span>單字拼字<br><small>Spelling</small></span></button>
                        <button type="button" class="btn-game-mode" id="btn-mode-speaking"><i class="fa-solid fa-microphone-lines"></i><span>跟讀挑戰<br><small>Speaking</small></span></button>
                    </div>
                    <button type="button" class="btn-long btn-quit-quiz" id="btn-cancel-menu" style="margin-top:10px;"><i class="fa-solid fa-times"></i> 取消</button>
                </div>
                <div id="view-quiz-sentence" class="view-section">
                    <div class="quiz-header"><span class="quiz-title"><i class="fa-solid fa-headphones"></i> 聽音組句</span><div class="quiz-timer" id="timer-sen">00:00</div><div class="quiz-tools"><button type="button" class="btn-hint" id="btn-hint-sen-all"><i class="fa-solid fa-volume-high"></i> 聽整句</button></div></div>
                    <div id="quiz-sen-target" class="quiz-area"></div><div id="quiz-sen-msg" class="quiz-msg"></div><div id="quiz-sen-pool" class="word-pool"></div>
                    <button type="button" class="btn-long btn-quit-quiz" onclick="document.getElementById('btn-quit').click()">結束挑戰</button>
                </div>
                <div id="view-quiz-spelling" class="view-section">
                    <div class="quiz-header"><span class="quiz-title"><i class="fa-solid fa-pencil"></i> 單字拼字</span><div class="quiz-timer" id="timer-spell">00:00</div><div class="quiz-tools"><button type="button" class="btn-hint" id="btn-hint-spell-word"><i class="fa-solid fa-volume-high"></i> 聽單字</button></div></div>
                    <div id="spelling-display" class="spelling-sentence"></div><div id="quiz-spell-target" class="quiz-area" style="min-height:50px; padding:10px;"></div><div id="quiz-spell-msg" class="quiz-msg"></div><div id="quiz-spell-pool" class="word-pool"></div>
                    <button type="button" class="btn-long btn-quit-quiz" onclick="document.getElementById('btn-quit').click()">結束挑戰</button>
                </div>
                <div id="view-quiz-speaking" class="view-section">
                    <div class="quiz-header"><span class="quiz-title"><i class="fa-solid fa-microphone"></i> 跟讀挑戰</span><div class="quiz-timer" id="timer-speak">00:00</div></div>
                    <div class="spelling-sentence" style="font-size:1.6rem; color:#0f172a;" id="speak-target"></div>
                    <button type="button" class="mic-btn" id="btn-mic"><i class="fa-solid fa-microphone"></i></button>
                    <div id="speak-result" class="speak-result">點擊麥克風開始錄音</div><div id="speak-stars" class="stars"></div>
                    <button type="button" class="btn-long btn-quit-quiz" onclick="document.getElementById('btn-quit').click()" style="margin-top:10px;">結束挑戰</button>
                </div>
            </div>

            <div class="w-footer">
                <button type="button" class="btn-circle" id="btn-speed" title="調整語速"><i class="fa-solid fa-person-running" id="icon-speed"></i></button>
                <button type="button" class="btn-circle" id="btn-voice" title="切換發音"><i class="fa-solid fa-user-tie"></i></button>
                <button type="button" class="btn-long btn-link" id="btn-link" style="display:none;"><i class="fa-brands fa-youtube"></i> 延伸影片</button>
                <button type="button" class="btn-long btn-quiz" id="btn-quiz"><i class="fa-solid fa-gamepad"></i> 遊戲中心</button>
                <button type="button" class="btn-long btn-play" id="btn-play"><i class="fa-solid fa-volume-high"></i> 播放</button>
                <button type="button" class="btn-circle btn-next" id="btn-next" title="下一句"><i class="fa-solid fa-chevron-right"></i></button>
                <button type="button" id="btn-quit" style="display:none;"></button>
            </div>
        `;
    }

    function initLogic() {
        let currentData = null;
        let currentRate = 1.0;
        let voices = [];
        let currentVoiceIndex = 0;
        let isQuizMode = false;
        let timerInterval = null;
        let startTime = 0;
        let senSelected = [], senOriginal = [], senPool = [];
        let spellTargetWord = "", spellOriginalChars = [], spellSelectedChars = [], spellPoolChars = [];
        let recognition = null;

        // [免資料庫版] 以 <script> 載入 feed.js，在瀏覽器端挑選今日句子／隨機句子
        let feedPromise = null;
        function loadFeed() {
            if (feedPromise) return feedPromise;
            feedPromise = new Promise((resolve, reject) => {
                const sc = document.createElement('script');
                sc.charset = 'utf-8';
                sc.src = FEED_URL + (FEED_URL.indexOf('?') > -1 ? '&' : '?') + 't=' + Math.floor(Date.now() / 600000); // 約 10 分鐘更新一次
                sc.onload = () => {
                    const f = window.DAILY_ENGLISH_FEED;
                    sc.remove();
                    if (f && Array.isArray(f.items)) resolve(f.items); else reject(new Error('資料檔格式不正確'));
                };
                sc.onerror = () => { sc.remove(); reject(new Error('無法載入資料檔 feed.js')); };
                document.head.appendChild(sc);
            });
            feedPromise.catch(() => { feedPromise = null; });
            return feedPromise;
        }
        function todayStr() {
            const t = new Date(Date.now() + (new Date().getTimezoneOffset() + 480) * 60000); // 以台北時間 (UTC+8) 為準
            return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
        }
        function toData(x) {
            return { id: x.id, category: x.c, en_sentence: x.en, ch_sentence: x.ch, phonetic: x.p, synonyms: x.s, antonyms: x.a, ext_link: x.l };
        }
        function pickItem(items, isRandom) {
            if (!isRandom) {
                const t = todayStr();
                const hit = items.find(i => i.d === t);
                if (hit) return hit;
            }
            let pool = items;
            if (currentData && items.length > 1) pool = items.filter(i => i.id !== currentData.id);
            return pool[Math.floor(Math.random() * pool.length)];
        }
        function showData(d, autoPlay) {
            currentData = d;
            const enEl = document.getElementById('w-en');
            enEl.style.color = '';
            enEl.innerText = d.en_sentence;
            document.getElementById('w-ch').innerText = d.ch_sentence;
            document.getElementById('w-pho').innerText = d.phonetic || '';
            document.getElementById('cat-badge').innerText = d.category;
            document.getElementById('speak-target').innerText = d.en_sentence;

            const rowSyn = document.getElementById('row-syn');
            if (d.synonyms) {
                rowSyn.style.display = 'flex';
                document.getElementById('w-syn').innerText = d.synonyms.split(';')[0];
                document.getElementById('tip-syn').innerText = "筆記/同義字：" + d.synonyms;
            } else rowSyn.style.display = 'none';

            const rowAnt = document.getElementById('row-ant');
            if (d.antonyms) {
                rowAnt.style.display = 'flex';
                document.getElementById('w-ant').innerText = d.antonyms.split(';')[0];
                document.getElementById('tip-ant').innerText = "反義字：" + d.antonyms;
            } else rowAnt.style.display = 'none';

            const btnLink = document.getElementById('btn-link');
            if (d.ext_link && /^https?:\/\//i.test(d.ext_link)) {
                btnLink.style.display = 'flex';
                btnLink.onclick = (e) => { e.preventDefault(); window.open(d.ext_link, '_blank', 'noopener'); };
            } else { btnLink.style.display = 'none'; }

            if (autoPlay) setTimeout(() => speak(), 300);
        }
        function loadData(autoPlay = false, isRandom = false) {
            const loadingEl = document.getElementById('w-loading');
            const enEl = document.getElementById('w-en');
            if (loadingEl) loadingEl.style.display = 'flex';
            quitAllModes();
            loadFeed()
                .then(items => {
                    if (!items.length) throw new Error('目前還沒有句子');
                    showData(toData(pickItem(items, isRandom)), autoPlay);
                })
                .catch(err => {
                    console.error('Widget Error:', err);
                    enEl.style.color = '#ef4444';
                    enEl.innerText = '資料載入失敗';
                    document.getElementById('w-ch').innerText = err.message + '（請檢查網路或聯繫管理員）';
                })
                .finally(() => { if (loadingEl) loadingEl.style.display = 'none'; });
        }

        // [修改 3] 語音播放邏輯：優化語音選擇
        function speakText(text, rateOverride) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-US'; u.rate = rateOverride || currentRate;
            
            // 優先使用已選擇的優質聲音
            if(voices.length > 0 && voices[currentVoiceIndex]) {
                u.voice = voices[currentVoiceIndex];
            }
            window.speechSynthesis.speak(u);
        }
        function speak(e) {
            if(e) e.preventDefault(); 
            if(!currentData || isQuizMode) return;
            speakText(currentData.en_sentence);
        }

        function switchView(viewId) {
            ['view-normal', 'view-menu', 'view-quiz-sentence', 'view-quiz-spelling', 'view-quiz-speaking'].forEach(id => {
                document.getElementById(id).style.display = 'none';
            });
            document.getElementById(viewId).style.display = 'flex';
        }
        
        function startTimer(elementId) {
            stopTimer();
            startTime = Date.now();
            const el = document.getElementById(elementId);
            el.innerText = "00:00";
            timerInterval = setInterval(() => {
                const diff = Math.floor((Date.now() - startTime) / 1000);
                const m = Math.floor(diff / 60).toString().padStart(2, '0');
                const s = (diff % 60).toString().padStart(2, '0');
                el.innerText = `${m}:${s}`;
            }, 1000);
        }
        function stopTimer() { if(timerInterval) clearInterval(timerInterval); }

        function openGameMenu(e) {
            if(e) e.preventDefault();
            isQuizMode = true;
            document.getElementById('btn-play').style.display = 'none';
            document.getElementById('btn-link').style.display = 'none';
            document.getElementById('btn-quiz').style.display = 'none';
            document.getElementById('btn-next').style.display = 'none';
            switchView('view-menu');
        }

        function quitAllModes(e) {
            if(e) e.preventDefault();
            stopTimer();
            isQuizMode = false;
            switchView('view-normal');
            document.getElementById('btn-play').style.display = 'flex';
            document.getElementById('btn-next').style.display = 'flex';
            if(currentData && currentData.ext_link) document.getElementById('btn-link').style.display = 'flex';
            document.getElementById('btn-quiz').style.display = 'flex';
        }

        function startSentenceGame() {
            if(!currentData) return;
            switchView('view-quiz-sentence');
            startTimer('timer-sen');
            const cleanSentence = currentData.en_sentence.replace(/[.,!?;:]/g, '');
            senOriginal = cleanSentence.split(/\s+/);
            senPool = [...senOriginal].sort(() => Math.random() - 0.5);
            senSelected = [];
            renderSentenceQuiz();
            document.getElementById('quiz-sen-msg').innerText = '';
            document.getElementById('quiz-sen-msg').className = 'quiz-msg';
            speakText(currentData.en_sentence, 0.8);
        }

        function escHtml(t) { return String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

        function renderSentenceQuiz() {
            const poolEl = document.getElementById('quiz-sen-pool');
            const targetEl = document.getElementById('quiz-sen-target');
            poolEl.innerHTML = ''; targetEl.innerHTML = '';
            senSelected.forEach((word, idx) => {
                const span = document.createElement('span');
                span.className = 'word-btn'; span.innerText = word;
                span.style.background = CISIAN_THEME.primary; span.style.color = 'white';
                span.onclick = () => {
                    senSelected.splice(idx, 1);
                    senPool.splice(Math.floor(Math.random()*(senPool.length+1)), 0, word);
                    renderSentenceQuiz(); speakText(word);
                };
                targetEl.appendChild(span);
            });
            senPool.forEach((word, idx) => {
                const btn = document.createElement('div');
                btn.className = 'word-btn'; btn.innerText = word;
                btn.onclick = () => {
                    senPool.splice(idx, 1); senSelected.push(word);
                    renderSentenceQuiz(); checkSentenceAnswer(); speakText(word);
                };
                poolEl.appendChild(btn);
            });
        }

        function checkSentenceAnswer() {
            const currentStr = senSelected.join(' ');
            const cleanOriginal = senOriginal.join(' ');
            const msg = document.getElementById('quiz-sen-msg');
            const area = document.getElementById('quiz-sen-target');
            if (currentStr === cleanOriginal) {
                stopTimer();
                msg.innerHTML = '<i class="fa-solid fa-star"></i> Excellent! 答對了！';
                msg.className = 'quiz-msg';
                area.classList.add('correct-flash'); 
                const u = new SpeechSynthesisUtterance("Excellent!");
                u.lang = 'en-US'; window.speechSynthesis.speak(u);
                setTimeout(() => speakText(currentData.en_sentence), 1200);
            } else if (senPool.length === 0) {
                msg.innerText = '再試試看！'; msg.className = 'quiz-msg error'; area.classList.remove('correct-flash');
            } else { msg.innerText = ''; area.classList.remove('correct-flash'); }
        }

        function startSpellingGame() {
            if(!currentData) return;
            const cleanSentence = currentData.en_sentence.replace(/[.,!?;:]/g, '');
            const words = cleanSentence.split(/\s+/).filter(w => w.length > 2);
            if(words.length === 0) { alert("此句單字太短，請玩句子重組！"); return; }
            spellTargetWord = words.reduce((a, b) => a.length >= b.length ? a : b);
            switchView('view-quiz-spelling');
            startTimer('timer-spell');
            document.getElementById('spelling-display').innerHTML = escHtml(currentData.en_sentence).replace(escHtml(spellTargetWord), '<span class="blank-word" id="blank-hint">[ ? ]</span>');
            document.getElementById('blank-hint').onclick = () => speakText(spellTargetWord);
            spellOriginalChars = spellTargetWord.split('');
            spellPoolChars = [...spellOriginalChars].sort(() => Math.random() - 0.5);
            spellSelectedChars = [];
            renderSpellingQuiz();
            document.getElementById('quiz-spell-msg').innerText = '';
            document.getElementById('quiz-spell-msg').className = 'quiz-msg';
            setTimeout(() => speakText(spellTargetWord), 500);
        }

        function renderSpellingQuiz() {
            const poolEl = document.getElementById('quiz-spell-pool');
            const targetEl = document.getElementById('quiz-spell-target');
            poolEl.innerHTML = ''; targetEl.innerHTML = '';
            spellSelectedChars.forEach((char, idx) => {
                const btn = document.createElement('div');
                btn.className = 'char-btn selected'; btn.innerText = char;
                btn.onclick = () => {
                    spellSelectedChars.splice(idx, 1);
                    spellPoolChars.splice(Math.floor(Math.random()*(spellPoolChars.length+1)), 0, char);
                    renderSpellingQuiz();
                };
                targetEl.appendChild(btn);
            });
            spellPoolChars.forEach((char, idx) => {
                const btn = document.createElement('div');
                btn.className = 'char-btn'; btn.innerText = char;
                btn.onclick = () => {
                    spellPoolChars.splice(idx, 1); spellSelectedChars.push(char);
                    renderSpellingQuiz(); checkSpellingAnswer();
                };
                poolEl.appendChild(btn);
            });
        }

        function checkSpellingAnswer() {
            const currentStr = spellSelectedChars.join('');
            const msg = document.getElementById('quiz-spell-msg');
            const area = document.getElementById('quiz-spell-target');
            if (currentStr === spellTargetWord) {
                stopTimer();
                msg.innerHTML = '<i class="fa-solid fa-star"></i> Correct! 拼對了！';
                msg.className = 'quiz-msg';
                area.classList.add('correct-flash');
                document.getElementById('blank-hint').innerText = spellTargetWord;
                document.getElementById('blank-hint').style.color = CISIAN_THEME.success;
                const u = new SpeechSynthesisUtterance("Correct!");
                u.lang = 'en-US'; window.speechSynthesis.speak(u);
                setTimeout(() => speakText(spellTargetWord), 1000);
            } else if (spellPoolChars.length === 0) {
                msg.innerText = '拼字有誤！'; msg.className = 'quiz-msg error';
            } else { msg.innerText = ''; }
        }

        function startSpeakingGame() {
            if(!currentData) return;
            if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                alert("您的瀏覽器不支援語音辨識功能，請使用 Chrome 瀏覽器。");
                return;
            }
            switchView('view-quiz-speaking');
            startTimer('timer-speak');
            document.getElementById('speak-result').innerText = "點擊麥克風開始錄音...";
            document.getElementById('speak-stars').innerHTML = "";
            document.getElementById('btn-mic').className = "mic-btn";
        }

        function toggleMic() {
            if(recognition && recognition.isStarted) { recognition.stop(); return; }
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.onstart = function() {
                recognition.isStarted = true;
                document.getElementById('btn-mic').className = "mic-btn listening";
                document.getElementById('speak-result').innerText = "聆聽中...請大聲唸出來";
            };
            recognition.onend = function() {
                recognition.isStarted = false;
                document.getElementById('btn-mic').className = "mic-btn";
            };
            recognition.onresult = function(event) {
                stopTimer();
                const transcript = event.results[0][0].transcript;
                document.getElementById('speak-result').innerText = `你說：${transcript}`;
                calculateScore(transcript, currentData.en_sentence);
            };
            recognition.onerror = function(event) {
                document.getElementById('speak-result').innerText = "聽不清楚，請再試一次";
            };
            recognition.start();
        }

        function calculateScore(userSaid, target) {
            const s1 = userSaid.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
            const s2 = target.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
            const set2 = new Set(s2);
            let match = 0;
            s1.forEach(w => { if(set2.has(w)) match++; });
            const score = (match / Math.max(s1.length, s2.length)) * 100;
            let stars = "", msg = "";
            if(score > 80) { stars = "⭐⭐⭐"; msg = "Excellent!"; } 
            else if(score > 50) { stars = "⭐⭐"; msg = "Good Try!"; } 
            else { stars = "⭐"; msg = "Keep Going!"; }
            document.getElementById('speak-stars').innerHTML = stars + `<div style='font-size:1rem; color:#64748b;'>${msg}</div>`;
            const u = new SpeechSynthesisUtterance(msg);
            u.lang = 'en-US'; window.speechSynthesis.speak(u);
        }

        document.getElementById('btn-speed').onclick = (e) => { e.preventDefault(); currentRate = (currentRate === 1.0) ? 0.6 : 1.0; document.getElementById('icon-speed').className = (currentRate === 1.0) ? "fa-solid fa-person-running" : "fa-solid fa-tortoise"; speak(e); };
        document.getElementById('btn-voice').onclick = (e) => { e.preventDefault(); if(voices.length <= 1) return; currentVoiceIndex = (currentVoiceIndex + 1) % voices.length; speak(e); };
        
        document.getElementById('btn-next').onclick = (e) => { e.preventDefault(); loadData(true, true); };
        
        document.getElementById('btn-play').onclick = (e) => speak(e);
        document.getElementById('w-en').onclick = (e) => speak(e);
        document.getElementById('btn-quiz').onclick = (e) => openGameMenu(e);
        document.getElementById('btn-cancel-menu').onclick = (e) => quitAllModes(e);
        document.getElementById('btn-quit').onclick = (e) => quitAllModes(e);
        document.getElementById('btn-mode-sentence').onclick = () => startSentenceGame();
        document.getElementById('btn-mode-spelling').onclick = () => startSpellingGame();
        document.getElementById('btn-mode-speaking').onclick = () => startSpeakingGame();
        document.getElementById('btn-hint-sen-all').onclick = () => speakText(currentData.en_sentence, 0.7);
        document.getElementById('btn-hint-spell-word').onclick = () => speakText(spellTargetWord);
        document.getElementById('btn-mic').onclick = () => toggleMic();

        // [修改 4] 語音初始化邏輯：優先找 Google 或 Zira 等自然發音
        if('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => {
                const allVoices = window.speechSynthesis.getVoices();
                voices = allVoices.filter(v => v.lang.includes('en')); // 只留英文
                
                // 嘗試尋找比較好聽的聲音 (優先序: Google US > Microsoft Zira > 預設)
                const preferredIndex = voices.findIndex(v => 
                    v.name.includes('Google US English') || 
                    v.name.includes('Zira') || 
                    v.name.includes('Samantha')
                );
                
                if(preferredIndex > -1) {
                    currentVoiceIndex = preferredIndex;
                }
            };
        }
        loadData(false);
    }

    function boot() {
        if (!document.getElementById(CONTAINER_ID)) return;
        injectStyles();
        buildLayout();
        initLogic();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();