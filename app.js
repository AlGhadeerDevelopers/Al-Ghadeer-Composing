/* ==========================================================================
   AL GHADEER DIGITAL SERVICES — ENTERPRISE STUDIO SCRIPT (app.js)
   Owner & Developer: Junaid Ali Hussaini | Chowk Azam, District Layyah
   ========================================================================== */

/* 1. LIVE CLOCK & SYSTEM DATE WITH +/- DAY ADJUSTER */
let dateDayOffset = 0;
function adjustDateOffset(val) {
    if (val === 0) dateDayOffset = 0;
    else dateDayOffset += val;
    updateLiveClockAndDate();
}

function updateLiveClockAndDate() {
    const now = new Date();
    if (dateDayOffset !== 0) {
        now.setDate(now.getDate() + dateDayOffset);
    }
    const timeStr = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    const clk = document.getElementById('liveClockText');
    if (clk) clk.innerText = timeStr;

    const engD = document.getElementById('liveEngDateText');
    if (engD) engD.innerText = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    try {
        const urD = document.getElementById('liveUrduDateText');
        if (urD) urD.innerText = now.toLocaleDateString('ur-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (_) {}

    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const sd = document.getElementById('sheetLiveDate');
    if (sd) sd.innerText = `${dd}-${mm}-${yyyy}`;
}
setInterval(updateLiveClockAndDate, 1000);

/* 2. GLOBAL CUSTOM LOGO UPLOADER (PERSISTENT) */
function uploadGlobalBrandLogo(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
        localStorage.setItem('ag_brand_logo', ev.target.result);
        applySavedBrandLogo();
    };
    r.readAsDataURL(f);
}
function applySavedBrandLogo() {
    const saved = localStorage.getItem('ag_brand_logo');
    if (saved) {
        const img = document.getElementById('globalBrandLogoImg');
        const svg = document.getElementById('globalBrandLogoSvg');
        if (img && svg) {
            img.src = saved;
            img.style.display = 'block';
            svg.style.display = 'none';
        }
    }
}

/* 3. NAVIGATION & UI LANGUAGE */
function switchHub(targetId) {
    document.querySelectorAll('.hub-view').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-target') === targetId);
    });
    const el = document.getElementById(targetId);
    if (el) el.classList.add('active');
}

let urduUI = true;
function toggleInterfaceLang() {
    urduUI = !urduUI;
    const h = document.getElementById('uiMainHeading');
    if (h) {
        h.innerText = urduUI
            ? "الغدیر ڈیجیٹل سروسز — انٹرپرائز اردو و ڈاکیومنٹ اسٹوڈیو"
            : "Al Ghadeer Digital Services — Enterprise Document Studio";
    }
}

/* 4. PRIVATE ADMIN AUTHENTICATION (ONLY JUNAID'S GMAIL) */
const _OWNER_GMAIL_B64 = "anVuYWlkZ21oc0BnbWFpbC5jb20="; // junaidgmhs@gmail.com
function openAdminModal() {
    document.getElementById('authErrMsg').style.display = 'none';
    document.getElementById('adminModalBox').classList.add('open');
}
function submitAdminLogin() {
    const em = (document.getElementById('authEmailField').value || "").trim().toLowerCase();
    const pw = (document.getElementById('authPassField').value || "").trim();
    const err = document.getElementById('authErrMsg');

    if (btoa(em) !== _OWNER_GMAIL_B64) {
        err.innerText = "⛔ رسائی مسترد! صرف اونر کا منظور شدہ گوگل اکاؤنٹ ہی لاگ ان کر سکتا ہے۔";
        err.style.display = 'block';
        return;
    }
    if (pw.length < 4) {
        err.innerText = "⚠️ پاس ورڈ کم از کم 4 حروف کا لکھیں۔";
        err.style.display = 'block';
        return;
    }
    const stored = localStorage.getItem('ag_owner_pw');
    if (!stored) {
        localStorage.setItem('ag_owner_pw', btoa(unescape(encodeURIComponent(pw))));
    } else if (btoa(unescape(encodeURIComponent(pw))) !== stored) {
        err.innerText = "❌ غلط پاس ورڈ!";
        err.style.display = 'block';
        return;
    }
    document.getElementById('adminModalBox').classList.remove('open');
    document.getElementById('adminVaultTabBtn').style.display = 'flex';
    document.getElementById('kpiAdminLockText').innerText = "✅ Unlocked (Owner)";
    document.getElementById('ownerPrivateNotes').value = localStorage.getItem('ag_priv_notes') || "";
    renderCashRows();
    switchHub('hub-admin');
}
function lockAdminVault() {
    document.getElementById('adminVaultTabBtn').style.display = 'none';
    document.getElementById('kpiAdminLockText').innerText = "🔒 Locked (Private)";
    switchHub('hub-sea');
}
function addCashRow() {
    const t = document.getElementById('cashTitle').value.trim() || "Composing / Card";
    const a = parseFloat(document.getElementById('cashAmt').value || 0);
    if (a <= 0) return;
    const list = JSON.parse(localStorage.getItem('ag_cash_list') || "[]");
    list.unshift({ t, a });
    localStorage.setItem('ag_cash_list', JSON.stringify(list));
    document.getElementById('cashTitle').value = "";
    document.getElementById('cashAmt').value = "";
    renderCashRows();
}
function renderCashRows() {
    const list = JSON.parse(localStorage.getItem('ag_cash_list') || "[]");
    let sum = 0;
    const html = list.map(r => { sum += Number(r.a); return `<div>• ${r.t} — <strong class="ltr">Rs. ${r.a}</strong></div>`; }).join("");
    const area = document.getElementById('cashListArea');
    if (area) area.innerHTML = html + `<hr style="margin:8px 0;"><strong>کل آمدنی: <span class="ltr">Rs. ${sum}</span></strong>`;
}

/* 5. COMPOSING TEMPLATES & SMART CARET INSERTION */
const DOC_TEMPLATES = {
    kachehri: [
        {
            name: "بیانِ حلفی (Affidavit — Court & Official)",
            text: `بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ\n\t\t\t\tحـــلـــف نـــامـــہ\n\nمنکہ مسمی جنید علی حسینی ولد جمشید عارف ساکن چک نمبر 387/A ٹی ڈی اے، چوک اعظم تحصیل و ضلع لیہ، حامل قومی شناختی کارڈ نمبر 32203-5121785-1 حلفاً اقرار و بیان کرتا ہوں:\n\n1۔ یہ کہ من مظہر مندرجہ بالا پتہ کا مستقل رہائشی اور پاکستانی شہری ہے۔\n2۔ یہ کہ میرے بیان کردہ تمام کوائف میرے علم و یقین کے مطابق بالکل درست اور سچ ہیں۔\n\nلہٰذا یہ بیانِ حلفی بقائمی ہوش و حواس تحریر کروا دیا ہے تاکہ سند رہے۔\n\n\t\t\t\t\t\t\tالــــمــــقــــر\n\t\t\t\t\t\tدستخط و انگوٹھا: ______________`
        },
        {
            name: "اقرار نامہ فروخت موٹرسائیکل / گاڑی (Sale Deed)",
            text: `بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ\n\t\t\tاقرار نامہ فروخت موٹرسائیکل / گاڑی\n\nفریق اول (فروخت کنندہ): ________________________ ساکن چوک اعظم، ضلع لیہ۔\nفریق دوم (خریدار): ___________________________ ساکن چوک اعظم، ضلع لیہ۔\n\nمنکہ فریق اول اپنی مملوکہ موٹرسائیکل نمبر ________ ماڈل ______ انجن نمبر ____________ چیسز نمبر ____________ بعوض مبلغ ____________ روپے نقد فریق دوم کے ہاتھ فروخت کر کے کل رقم روبرو گواہان وصول پا لی ہے اور موٹرسائیکل مع کاغذات حوالے کر دی ہے۔`
        },
        {
            name: "معاہدہ کرایہ نامہ دکان / مکان (Rental Agreement)",
            text: `بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ\n\t\t\tمعاہدہ کرایہ نامہ دکان / مکان\n\nیہ معاہدہ مابین مالک دکان ________________ اور کرایہ دار ________________ واقع چوک اعظم ضلع لیہ ماہانہ کرایہ مبلغ ________ روپے طے پایا ہے۔ میعاد معاہدہ 11 ماہ ہوگی اور بجلی بل کرایہ دار خود ادا کرنے کا پابند ہوگا۔`
        }
    ],
    police: [
        {
            name: "درخواست بنام ایس ایچ او (SHO) تھانہ چوک اعظم",
            text: `بخدمتِ جنابِ ایس ایچ او صاحب،\nتھانہ چوک اعظم، ضلع لیہ۔\n\nعنوان: درخواست برائے اندراجِ مقدمہ و قانونی کارروائی\n\nجنابِ عالی!\nمودبانہ گزارش ہے کہ سائل چوک اعظم کا امن پسند شہری ہے۔ ملزمان نامزد ذیل نے سائل کے ساتھ زیادتی کی ہے۔ استدعا ہے کہ فوری قانونی کارروائی فرما کر انصاف فراہم کیا جائے۔\n\n\t\t\t\t\t\t\tالــــعــــارض\n\t\t\t\t\t\tسائل: ____________________`
        }
    ],
    chowkazam: [
        {
            name: "تصدیق نامہ نمبردار چک TDA چوک اعظم",
            text: `بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ\n\t\tتصدیق نامہ نمبردار حلقہ — چوک اعظم (TDA)\n\nتصدیق کی جاتی ہے کہ مسمی __________________ ولد __________________ ساکن چک نمبر 387/A ٹی ڈی اے، چوک اعظم ضلع لیہ کا مستقل رہائشی ہے اور میں اسے ذاتی طور پر جانتا ہوں۔\n\nدستخط و مہر نمبردار: ____________________`
        },
        {
            name: "درخواست بنام SDO میپکو (MEPCO) سب ڈویژن چوک اعظم",
            text: `بخدمتِ جنابِ ایس ڈی او صاحب (MEPCO)،\nمیپکو سب ڈویژن چوک اعظم، ضلع لیہ۔\n\nعنوان: درخواست برائے تبدیلی خراب میٹر و درستگی بل\n\nجنابِ عالی!\nگزارش ہے کہ سائل کا بجلی میٹر خراب ہو چکا ہے جس کی وجہ سے بل زائد آ رہا ہے۔ براہِ کرم نیا میٹر نصب کر کے بل درست فرمایا جائے۔`
        }
    ],
    banking: [
        {
            name: "درخواست بحالی بینک اکاؤنٹ (Dormant Account Activation)",
            text: `بخدمتِ جنابِ برانچ منیجر صاحب،\n__________ بینک، برانچ چوک اعظم (ضلع لیہ)۔\n\nعنوان: درخواست برائے بحالی اکاؤنٹ\n\nجنابِ عالی!\nگزارش ہے کہ سائل کا اکاؤنٹ نمبر __________________ بند ہو گیا ہے۔ بائیومیٹرک اور شناختی کارڈ کاپی لف ہذا ہے۔ براہِ کرم اکاؤنٹ فوری بحال فرمایا جائے۔`
        }
    ],
    education: [
        {
            name: "درخواست برائے رخصت ضروری کام (اردو)",
            text: `بخدمتِ جنابِ پرنسپل صاحب،\nگورنمنٹ مسلم ہائی اسکول چوک اعظم (لیہ)۔\n\nعنوان: درخواست برائے رخصت ضروری کام\n\nجنابِ عالی!\nگزارش ہے کہ فدوی کو گھر پر ضروری کام درپیش ہے جس کی وجہ سے آج حاضر ہونے سے قاصر ہے۔ براہِ کرم ایک یوم کی رخصت عنایت فرمائیں۔`
        }
    ],
    posters: [
        {
            name: "پوسٹر: بوجہ فوتگی آج دکان بند رہے گی",
            text: `\n\t\tإِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ\n\n\t\tبوجہ فوتگی آج ہماری دکان بند رہے گی۔`
        },
        {
            name: "گاڑی اسٹیکر: ماشاءاللہ! عبداللہ کی بارات",
            text: `\n\t\t✨ مَاشَآءَ اللّٰهُ تَبَارَکَ اللّٰهُ ✨\n\n\t\t🌹 عبداللہ کی بارات 🌹\n\t\tچوک اعظم، ضلع لیہ`
        }
    ],
    business: [
        {
            name: "ایکسپیرینس سرٹیفکیٹ (Experience Certificate)",
            text: `AL GHADEER DIGITAL SERVICES — CHOWK AZAM\n\nEXPERIENCE CERTIFICATE\n\nThis is to certify that Mr. __________________ S/O __________________ has worked with Al Ghadeer Digital Services, Chowk Azam as an IT & Customer Support Specialist. We found him hardworking, honest, and professional.\n\nJunaid Ali Hussaini\nFounder — Al Ghadeer Digital Services`
        }
    ]
};

let pagesArr = [""];
let currPageIdx = 0;

function updateDocTemplatesDropdown() {
    const cat = document.getElementById('docCatSelect').value;
    const sel = document.getElementById('docTplSelect');
    if (!sel) return;
    sel.innerHTML = "";
    (DOC_TEMPLATES[cat] || []).forEach((t, idx) => {
        const o = document.createElement('option');
        o.value = idx;
        o.innerText = t.name;
        sel.appendChild(o);
    });
    applySelectedDocTemplate();
}

function applySelectedDocTemplate() {
    const cat = document.getElementById('docCatSelect').value;
    const sel = document.getElementById('docTplSelect');
    if (!sel) return;
    const idx = parseInt(sel.value || 0);
    const item = (DOC_TEMPLATES[cat] || [])[idx];
    if (item) {
        pagesArr[currPageIdx] = item.text;
        const area = document.getElementById('docEditableArea');
        if (area) area.innerText = item.text;
    }
}

function saveCurrentPageContent() {
    const area = document.getElementById('docEditableArea');
    if (area) pagesArr[currPageIdx] = area.innerText;
}

function renderPageTabs() {
    const box = document.getElementById('multiPageTabs');
    if (!box) return;
    box.innerHTML = "";
    pagesArr.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'btn-light';
        if (i === currPageIdx) { b.style.background = 'var(--emerald-800)'; b.style.color = '#fff'; }
        b.innerText = `صفحہ ${i + 1}`;
        b.onclick = () => {
            saveCurrentPageContent();
            currPageIdx = i;
            const area = document.getElementById('docEditableArea');
            if (area) area.innerText = pagesArr[i];
            renderPageTabs();
        };
        box.appendChild(b);
    });
}

function addDocPage() {
    saveCurrentPageContent();
    pagesArr.push("بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ\n\n");
    currPageIdx = pagesArr.length - 1;
    const area = document.getElementById('docEditableArea');
    if (area) area.innerText = pagesArr[currPageIdx];
    renderPageTabs();
}

// Smart Cursor Insertion
function insertAtCursor(txt) {
    const area = document.getElementById('docEditableArea');
    if (!area) return;
    area.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && area.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(txt);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
    } else {
        area.innerText += txt;
    }
    saveCurrentPageContent();
}

// Roman Urdu Engine
const ROMAN_MAP = {
    "bakhidmat": "بخدمتِ", "ba": "با", "khidmat": "خدمت", "janab": "جناب", "sahib": "صاحب",
    "sho": "ایس ایچ او", "thana": "تھانہ", "chowk": "چوک", "azam": "اعظم", "layyah": "لیہ",
    "kia": "کیا", "haal": "حال", "haaal": "حال", "hai": "ہے", "guzarish": "گزارش", "ke": "کہ",
    "sail": "سائل", "junaid": "جنید", "ali": "علی", "hussaini": "حسینی", "jamshaid": "جمشید",
    "arif": "عارف", "bayan": "بیان", "halfi": "حلفی", "darkhwast": "درخواست", "alarz": "العارض"
};

async function translateRomanWord(word) {
    const low = word.toLowerCase();
    if (ROMAN_MAP[low]) return ROMAN_MAP[low];
    try {
        const r = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=ur-t-i0-und&num=1`);
        const d = await r.json();
        if (d[0] === "SUCCESS" && d[1][0][1][0]) return d[1][0][1][0];
    } catch (_) {}
    return word;
}

async function processRomanInput(e) {
    const inp = document.getElementById('romanInputBox');
    if (!inp) return;
    const val = inp.value.trim();
    if ((e.key === ' ' || e.key === 'Enter') && val) {
        e.preventDefault();
        const words = val.split(/\s+/);
        const out = [];
        for (const w of words) {
            out.push(await translateRomanWord(w));
        }
        insertAtCursor(out.join(" ") + " ");
        inp.value = "";
    }
}

async function handleDirectPaperRoman(e) {
    const toggle = document.getElementById('directPaperRomanToggle');
    if (!toggle || !toggle.checked) return;
    if (e.key === ' ') {
        const area = document.getElementById('docEditableArea');
        if (!area) return;
        const text = area.innerText;
        const match = text.match(/([a-zA-Z]{2,})\s$/);
        if (match && match[1]) {
            const engWord = match[1];
            const urduWord = await translateRomanWord(engWord);
            if (urduWord !== engWord) {
                area.innerText = text.replace(new RegExp(engWord + "\\s$"), urduWord + " ");
                saveCurrentPageContent();
            }
        }
    }
}

function addMovableTextBox() {
    const sheet = document.getElementById('printableDocSheet');
    if (!sheet) return;
    const div = document.createElement('div');
    div.className = 'movable-node';
    div.style.top = '160px';
    div.style.left = '90px';
    div.innerHTML = `<span class="del-btn" onclick="this.parentElement.remove()">✕</span><div contenteditable="true">الــــعــــارض: جنید علی حسینی</div>`;
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    div.onmousedown = (e) => {
        if (e.target.classList.contains('del-btn')) return;
        p3 = e.clientX; p4 = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (ev) => {
            p1 = p3 - ev.clientX; p2 = p4 - ev.clientY;
            p3 = ev.clientX; p4 = ev.clientY;
            div.style.top = (div.offsetTop - p2) + "px";
            div.style.left = (div.offsetLeft - p1) + "px";
        };
    };
    sheet.appendChild(div);
}

function autoFormatCNIC(el) {
    let v = el.value.replace(/\D/g, '').substring(0, 13);
    if (v.length > 12) v = v.slice(0,5) + '-' + v.slice(5,12) + '-' + v.slice(12);
    else if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5);
    el.value = v;
    const info = document.getElementById('cnicGenderInfo');
    if (info) {
        if (v.length === 15) {
            const last = parseInt(v.slice(-1));
            info.innerText = (last % 2 !== 0) ? "✅ مرد (ولد / سائل)" : "✅ خاتون (دختر / زوجہ / سائلہ)";
        } else {
            info.innerText = "";
        }
    }
}

let borderIdx = 0;
const borderClasses = ["", "bdr-kachehri", "bdr-royal", "bdr-barat"];
function cycleDocBorder() {
    const s = document.getElementById('printableDocSheet');
    if (!s) return;
    borderClasses.forEach(c => { if(c) s.classList.remove(c); });
    borderIdx = (borderIdx + 1) % borderClasses.length;
    if (borderClasses[borderIdx]) s.classList.add(borderClasses[borderIdx]);
}

function refreshSheetVisuals() {
    const s = document.getElementById('printableDocSheet');
    const fzInput = document.getElementById('sheetFontSize');
    if (!s || !fzInput) return;
    const fz = fzInput.value;
    const lbl = document.getElementById('lblFontSize');
    if (lbl) lbl.innerText = fz + 'px';
    const fam = document.getElementById('sheetFontFam');
    const mar = document.getElementById('sheetTopMargin');
    if (fam) s.style.fontFamily = fam.value;
    s.style.fontSize = fz + 'px';
    if (mar) s.style.paddingTop = mar.value;
}

function toggleDocHeader() {
    const h = document.getElementById('docLetterheadBlock');
    if (h) h.style.display = (h.style.display === 'none') ? 'flex' : 'none';
}
function toggleDocWitness() {
    const w = document.getElementById('docWitnessBlock');
    if (w) w.style.display = (w.style.display === 'none') ? 'block' : 'none';
}

/* 6. MULTI-MODE CARD, VISITING, SHADI & MUG STUDIO */
let loadedUserImg = null;

function switchGraphicStudioMode() {
    const sel = document.getElementById('graphicModeSelect');
    if (!sel) return;
    const mode = sel.value;
    const idWrap = document.getElementById('modeIdCardWrap');
    const visBox = document.getElementById('modeVisitingCardBox');
    const shadiBox = document.getElementById('modeShadiCardBox');
    const mugBox = document.getElementById('modeMugWrapBox');

    if (idWrap) idWrap.style.display = (mode === 'idcard') ? 'flex' : 'none';
    if (visBox) visBox.style.display = (mode === 'visiting') ? 'flex' : 'none';
    if (shadiBox) shadiBox.style.display = (mode === 'shadi') ? 'flex' : 'none';
    if (mugBox) mugBox.style.display = (mode === 'mug') ? 'grid' : 'none';
    syncAllGraphicCards();
}

function toggleCardPhotoShape() {
    const shSel = document.getElementById('cardPhotoShape');
    if (!shSel) return;
    const sh = shSel.value;
    const holder = document.getElementById('idPhotoFrameHolder');
    if (holder) holder.classList.toggle('square-mode', sh === 'square');
}

function applyCardThemeColor() {
    const thSel = document.getElementById('cardThemeColor');
    if (!thSel) return;
    const th = thSel.value;
    const gradients = {
        emerald: "linear-gradient(135deg, #022015 0%, #059669 100%)",
        navy: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
        maroon: "linear-gradient(135deg, #450a0a 0%, #991b1b 100%)",
        dark: "linear-gradient(135deg, #09090b 0%, #27272a 100%)"
    };
    const idH = document.getElementById('idCardHeaderBox');
    const visB = document.getElementById('modeVisitingCardBox');
    const mugB = document.getElementById('modeMugWrapBox');
    if (idH) idH.style.background = gradients[th];
    if (visB) visB.style.background = gradients[th];
    if (mugB) mugB.style.background = gradients[th];
}

function syncAllGraphicCards() {
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

    const title = getVal('gTitle');
    const sub = getVal('gSub');
    const name = getVal('gName');
    const father = getVal('gFather');
    const role = getVal('gRole');
    const idNum = getVal('gIdNum');
    const extra = getVal('gExtra');
    const phone = getVal('gPhone');

    setTxt('vIdTitle', title); setTxt('vIdSub', sub); setTxt('vIdName', name);
    setTxt('vIdFather', father); setTxt('vIdRole', role);
    const badge = document.getElementById('vIdBadge');
    if (badge) badge.innerText = "ID: " + idNum;
    setTxt('vIdExtra', extra); setTxt('vIdPhone', phone); setTxt('vIdBackPhone', phone);

    setTxt('vVisTitle', title); setTxt('vVisSub', sub); setTxt('vVisName', name);
    setTxt('vVisRole', role); setTxt('vVisPhone', "📞 " + phone);

    setTxt('vShadiTitle', title); setTxt('vShadiName', name); setTxt('vShadiFather', father);
    setTxt('vShadiRole', role); setTxt('vShadiSub', sub); setTxt('vShadiPhone', phone);

    setTxt('vMugName', name); setTxt('vMugTitle', title); setTxt('vMugSub', sub); setTxt('vMugPhone', phone);

    const qr = document.getElementById('idQrContainer');
    if (qr && typeof QRCode !== 'undefined') {
        qr.innerHTML = "";
        new QRCode(qr, { text: `AlGhadeer|${name}|${idNum}|${phone}`, width: 82, height: 82 });
    }
}

function resetPhotoSliders() {
    const z = document.getElementById('photoZoomSlider');
    const px = document.getElementById('photoPanXSlider');
    const py = document.getElementById('photoPanYSlider');
    if (z) z.value = 100;
    if (px) px.value = 0;
    if (py) py.value = 0;
    drawPhotoOnCanvases();
}

function handleCardPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            loadedUserImg = img;
            resetPhotoSliders();
            renderPassLabGrid();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function drawPhotoOnCanvases() {
    const zInput = document.getElementById('photoZoomSlider');
    const pxInput = document.getElementById('photoPanXSlider');
    const pyInput = document.getElementById('photoPanYSlider');
    const zoom = parseInt(zInput ? zInput.value : 100) / 100;
    const panX = parseInt(pxInput ? pxInput.value : 0);
    const panY = parseInt(pyInput ? pyInput.value : 0);
    const lbl = document.getElementById('lblZoom');
    if (lbl) lbl.innerText = Math.round(zoom * 100) + '%';

    const canvasIds = ['idPhotoCanvas', 'visPhotoCanvas', 'mugPhotoCanvas', 'founderCanvasPhoto'];
    canvasIds.forEach(cid => {
        const c = document.getElementById(cid);
        if (!c) return;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#064e3b";
        ctx.fillRect(0, 0, c.width, c.height);

        if (loadedUserImg) {
            const baseScale = Math.max(c.width / loadedUserImg.width, c.height / loadedUserImg.height);
            const finalScale = baseScale * zoom;
            const drawW = loadedUserImg.width * finalScale;
            const drawH = loadedUserImg.height * finalScale;
            const dx = (c.width - drawW) / 2 + panX;
            const dy = (c.height - drawH) / 2 + panY;
            ctx.drawImage(loadedUserImg, dx, dy, drawW, drawH);
        } else {
            ctx.fillStyle = "#d4af37";
            ctx.beginPath();
            ctx.arc(c.width/2, c.height*0.36, c.width*0.2, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(c.width/2, c.height*0.95, c.width*0.38, Math.PI, 0);
            ctx.fill();
        }
    });
}

/* 7. PASSPORT LAB, ADJUSTABLE SUIT & CNIC A4 COPIER */
let passBgClr = "#1d4ed8";
let passSuitOn = false;
let passPhotoCount = 8;
let cnicFrontImg = null, cnicBackImg = null;

function updatePassLabBg(c) { passBgClr = c; renderPassLabGrid(); }
function togglePassSuit(s) { passSuitOn = s; renderPassLabGrid(); }
function setPassCount(n) { passPhotoCount = n; renderPassLabGrid(); }
function uploadPassLabPhoto(e) { handleCardPhotoUpload(e); }

function renderPassLabGrid() {
    const box = document.getElementById('passLabSheetBox');
    if (!box) return;
    const brInput = document.getElementById('passLabBright');
    const ctInput = document.getElementById('passLabContrast');
    const sScale = document.getElementById('suitScaleSlider');
    const sY = document.getElementById('suitYSlider');

    const br = brInput ? brInput.value : 106;
    const ct = ctInput ? ctInput.value : 108;
    const suitH = sScale ? sScale.value : 46;
    const suitY = sY ? sY.value : 0;

    box.innerHTML = "";
    for (let i = 0; i < passPhotoCount; i++) {
        const div = document.createElement('div');
        div.style.cssText = `width:132px; height:168px; background:${passBgClr}; border:2px solid #000; position:relative; overflow:hidden;`;
        const c = document.createElement('canvas');
        c.width = 160; c.height = 200;
        c.style.cssText = `width:100%; height:100%; filter:brightness(${br}%) contrast(${ct}%); display:block;`;
        const ctx = c.getContext('2d');
        ctx.fillStyle = passBgClr;
        ctx.fillRect(0,0,160,200);
        if (loadedUserImg) {
            const sc = Math.max(160/loadedUserImg.width, 200/loadedUserImg.height);
            ctx.drawImage(loadedUserImg, (160 - loadedUserImg.width*sc)/2, (200 - loadedUserImg.height*sc)/2, loadedUserImg.width*sc, loadedUserImg.height*sc);
        }
        div.appendChild(c);
        if (passSuitOn) {
            div.innerHTML += `<svg viewBox="0 0 120 65" style="position:absolute; bottom:${suitY}px; left:0; width:100%; height:${suitH}%; pointer-events:none;"><path d="M0 65 L22 12 L60 44 L98 12 L120 65 Z" fill="#0f172a"/><polygon points="55,26 65,26 63,65 57,65" fill="#dc2626"/></svg>`;
        }
        box.appendChild(div);
    }
}

function loadCnicSide(e, side) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
        if (side === 'front') cnicFrontImg = ev.target.result;
        else cnicBackImg = ev.target.result;
    };
    r.readAsDataURL(f);
}

function renderCnicA4Sheet() {
    const box = document.getElementById('passLabSheetBox');
    if (!box) return;
    box.innerHTML = "";
    for (let i = 0; i < 4; i++) {
        const row = document.createElement('div');
        row.style.cssText = "display:flex; gap:16px; width:100%; justify-content:center; margin-bottom:10px;";
        const fBox = `<div style="width:260px; height:164px; border:1.5px dashed #334155; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:#f8fafc;">${cnicFrontImg ? `<img src="${cnicFrontImg}" style="width:100%; height:100%; object-fit:cover;">` : 'CNIC Front'}</div>`;
        const bBox = `<div style="width:260px; height:164px; border:1.5px dashed #334155; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:#f8fafc;">${cnicBackImg ? `<img src="${cnicBackImg}" style="width:100%; height:100%; object-fit:cover;">` : 'CNIC Back'}</div>`;
        row.innerHTML = fBox + bBox;
        box.appendChild(row);
    }
}

/* 8. SHAJRA-E-NASAB, NOTE COUNTER & SMART CALCULATORS */
function buildShajraChart() {
    const rEl = document.getElementById('shjRoot');
    const wEl = document.getElementById('shjWidow');
    const cEl = document.getElementById('shjChildren');
    if (!rEl || !cEl) return;

    const root = rEl.value;
    const widow = wEl ? wEl.value : '';
    const kids = cEl.value.split(',').map(s => s.trim()).filter(Boolean);
    const kidsHtml = kids.map(k => `<div style="border:1.5px solid #043927; padding:5px 10px; border-radius:6px; background:#ecfdf5; font-weight:700; font-size:13px;">${k}</div>`).join("");
    const box = document.getElementById('shajraPreviewBox');
    if (box) {
        box.innerHTML = `
            <div style="font-weight:800; color:#043927; margin-bottom:6px;">شجرہ نسب وراثت — ${root}</div>
            <div style="display:inline-block; border:2px solid #d4af37; background:#043927; color:#fff; padding:6px 16px; border-radius:8px; font-weight:700;">${root} (متوفی)</div>
            ${widow ? `<div style="margin-top:6px; font-size:13px;">زوجہ / بیوہ: <strong>${widow}</strong></div>` : ''}
            <div style="margin:8px 0; color:#64748b;">⬇️ وارثان (اولاد) ⬇️</div>
            <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">${kidsHtml}</div>
        `;
    }
}

function insertShajraIntoPaper() {
    const root = document.getElementById('shjRoot').value;
    const widow = document.getElementById('shjWidow').value;
    const kids = document.getElementById('shjChildren').value;
    insertAtCursor(`\n--- شجرہ نسب مرحوم ${root} ---\nبیوہ: ${widow}\nپسران و دختران: ${kids}\n-----------------------------\n`);
    switchHub('hub-composing');
}

function runNoteCounter() {
    const n5 = document.getElementById('n5000');
    const n1 = document.getElementById('n1000');
    const n05 = document.getElementById('n500');
    if (!n5 || !n1 || !n05) return;

    const c5000 = parseInt(n5.value || 0) * 5000;
    const c1000 = parseInt(n1.value || 0) * 1000;
    const c500 = parseInt(n05.value || 0) * 500;
    const tot = c5000 + c1000 + c500;
    const out = document.getElementById('noteCounterOut');
    if (out) {
        out.innerHTML = `
            <div>5000 کے نوٹ: <span class="ltr">Rs. ${c5000.toLocaleString()}</span></div>
            <div>1000 کے نوٹ: <span class="ltr">Rs. ${c1000.toLocaleString()}</span></div>
            <div>500 کے نوٹ: <span class="ltr">Rs. ${c500.toLocaleString()}</span></div>
            <hr style="margin:4px 0;">
            <div style="color:var(--emerald-700); font-size:16px;">کل کیش رقم: <span class="ltr">Rs. ${tot.toLocaleString()}</span></div>
        `;
    }
}

function runRaqamCalc() {
    const num = document.getElementById('calcRaqamNum');
    if (!num) return;
    const v = parseInt(num.value || 0);
    const box = document.getElementById('calcRaqamText');
    if (box) box.innerText = `مبلغ ${v.toLocaleString()} روپے سکہ رائج الوقت پاکستانی (نصف جس کے مبلغ ${Math.floor(v/2).toLocaleString()} روپے ہوتے ہیں)۔`;
}

function runPercCalc() {
    const obt = document.getElementById('calcObt');
    const tot = document.getElementById('calcTot');
    if (!obt || !tot) return;
    const o = parseFloat(obt.value || 0);
    const t = parseFloat(tot.value || 1);
    const p = ((o/t)*100).toFixed(2);
    const box = document.getElementById('calcPercOut');
    if (box) box.innerHTML = `فیصد: <span class="ltr" style="color:var(--emerald-700); font-size:18px;">${p}%</span> | گریڈ: <span class="ltr">${p>=80?'A+':p>=70?'A':'B'}</span>`;
}

function runWarasatCalc() {
    const kInput = document.getElementById('cKanal');
    const sInput = document.getElementById('cSons');
    const dInput = document.getElementById('cDaughters');
    if (!kInput || !sInput || !dInput) return;

    const k = parseFloat(kInput.value || 0) * 20;
    const s = parseInt(sInput.value || 0);
    const d = parseInt(dInput.value || 0);
    const widow = k * 0.125;
    const rem = k - widow;
    const parts = (s*2) + d;
    const perD = parts > 0 ? rem/parts : 0;
    const box = document.getElementById('calcWarasatOut');
    if (box) box.innerHTML = `بیوہ (1/8): <b class="ltr">${widow.toFixed(2)} Marla</b> | فی بیٹا: <b class="ltr">${(perD*2).toFixed(2)} Marla</b> | فی بیٹی: <b class="ltr">${perD.toFixed(2)} Marla</b>`;
}

/* 9. BLANK OFFICIAL FORMS */
function loadBlankForm(type) {
    const sheet = document.getElementById('officialBlankFormSheet');
    if (!sheet) return;
    const titles = {
        birth: "فارم اندراجِ پیدائش (Birth Registration Form — Chowk Azam / Layyah)",
        death: "فارم اندراجِ وفات (Death Registration Form — Chowk Azam / Layyah)",
        zakat: "فارم تصدیقِ مستحقِ زکوٰۃ و وظیفہ (Zakat & Welfare Verification)",
        domicile: "فارم P-1 برائے حصولِ ڈومیسائل سرٹیفکیٹ پنجاب",
        nikah: "کوائف برائے رجسٹریشن نکاح نامہ (Marriage Registration Performa)",
        aiou: "پرت مشقی کام علامہ اقبال اوپن یونیورسٹی (AIOU Assignment Cover Sheet)"
    };
    sheet.innerHTML = `
        <div style="text-align:center; border-bottom:3px double #022015; padding-bottom:10px; margin-bottom:18px;">
            <h2>${titles[type] || titles.birth}</h2>
            <p>الغدیر ڈیجیٹل سروسز — چوک اعظم، تحصیل و ضلع لیہ</p>
        </div>
        <table class="doc-table">
            <tr><td style="width:35%;"><strong>1۔ پورا نام (اردو اور انگریزی میں):</strong></td><td></td></tr>
            <tr><td><strong>2۔ والد / شوہر کا نام اور شناختی کارڈ نمبر:</strong></td><td></td></tr>
            <tr><td><strong>3۔ تاریخِ پیدائش / واقعہ اور مقام:</strong></td><td>چوک اعظم، تحصیل و ضلع لیہ</td></tr>
            <tr><td><strong>4۔ مستقل رہائشی پتہ (چک نمبر / محلہ):</strong></td><td></td></tr>
            <tr><td><strong>5۔ موبائل نمبر اور اطلاع دہندہ کے دستخط:</strong></td><td></td></tr>
            <tr><td><strong>6۔ تصدیق نمبردار / چیئرمین / متعلقہ اتھارٹی:</strong></td><td style="height:70px;"></td></tr>
        </table>
    `;
}

/* 10. EXPORT ENGINE (300-DPI PNG & WORD) */
function downloadElementAsHD(elId, namePrefix) {
    const el = document.getElementById(elId);
    if (!el) return;
    html2canvas(el, { scale: 4, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => {
        const a = document.createElement('a');
        a.download = `${namePrefix}_300DPI_HD.png`;
        a.href = canvas.toDataURL('image/png', 1.0);
        a.click();
    });
}

function downloadAsWordDoc() {
    const area = document.getElementById('docEditableArea');
    const txt = area ? area.innerText : "";
    const html = `<html dir='rtl'><head><meta charset='utf-8'></head><body style="font-family:'Noto Nastaliq Urdu',serif; font-size:16pt; direction:rtl; text-align:right;"><h2 style="text-align:center;">الغدیر ڈیجیٹل سروسز — چوک اعظم</h2><hr><div style="white-space:pre-wrap;">${txt}</div></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'AlGhadeer_Document.doc';
    a.click();
}

/* 11. GLOBAL SEARCH */
const QUICK_SEARCH_LIST = [
    { title: "⚖️ بیانِ حلفی / اسٹامپ پیپر (Affidavit)", hub: "hub-composing" },
    { title: "🪪 اسٹوڈنٹ کارڈ، وزٹنگ کارڈ، شادی کارڈ و مگ ڈیزائنر", hub: "hub-cards" },
    { title: "👶 پیدائش، وفات، زکوٰۃ اور ڈومیسائل فارم", hub: "hub-forms" },
    { title: "📸 پاسپورٹ فوٹو، کوٹ ٹائی اور شناختی کارڈ شیٹ", hub: "hub-photolab" },
    { title: "🌳 شجرہ نسب، نوٹ کاؤنٹر، زمین اور فیصد کیلکولیٹر", hub: "hub-calculators" }
];
function handleGlobalSearch(q) {
    const dd = document.getElementById('globalSearchDropdown');
    if (!dd) return;
    if (!q.trim()) { dd.style.display = 'none'; return; }
    dd.innerHTML = "";
    QUICK_SEARCH_LIST.filter(x => x.title.toLowerCase().includes(q.toLowerCase())).forEach(m => {
        const d = document.createElement('div');
        d.className = 'search-item';
        d.innerText = m.title;
        d.onclick = () => { switchHub(m.hub); dd.style.display = 'none'; };
        dd.appendChild(d);
    });
    dd.style.display = 'block';
}

/* INITIAL BOOT */
window.onload = () => {
    applySavedBrandLogo();
    updateLiveClockAndDate();
    updateDocTemplatesDropdown();
    renderPageTabs();
    loadBlankForm('birth');
    syncAllGraphicCards();
    drawPhotoOnCanvases();
    renderPassLabGrid();
    buildShajraChart();
    runNoteCounter();
    runRaqamCalc();
    runPercCalc();
    runWarasatCalc();
};
