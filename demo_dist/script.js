// Translations
const translations = {
    'TH': {
        'new_entry': 'บันทึกใหม่',
        'date': 'วันที่',
        'hours': 'ชั่วโมง',
        'description': 'รายละเอียด',
        'work_link': 'ลิงก์งาน',
        'save_entry': 'บันทึกข้อมูล',
        'save_changes': 'บันทึกการแก้ไข',
        'recent_logs': 'บันทึกล่าสุด',
        'hours_suffix': 'ชม.',
        'holiday_leave': 'วันหยุด / ลา',
        'custom': 'กำหนดเอง',
        'view_work': 'ดูผลงาน',
        'export': 'ส่งออกเป็น Excel',
        'delete': 'ลบ',
        'total_hours': 'ชั่วโมง',
        'days': 'วัน',
        'months': 'เดือน',
        'edit_entry': 'แก้ไขบันทึก',
        'placeholder_desc': 'วันนี้เรียนรู้อะไรบ้าง?'
    },
    'EN': {
        'new_entry': 'New Entry',
        'date': 'Date',
        'hours': 'Hours',
        'description': 'Description',
        'work_link': 'Work Link',
        'save_entry': 'Save Entry',
        'save_changes': 'Save Changes',
        'recent_logs': 'Recent Logs',
        'hours_suffix': 'hrs',
        'holiday_leave': 'Holiday / Leave',
        'custom': 'Custom',
        'view_work': 'View Work',
        'export': 'Export to Excel',
        'delete': 'Delete',
        'total_hours': 'Hours',
        'days': 'Days',
        'months': 'Months',
        'edit_entry': 'Edit Entry',
        'placeholder_desc': 'What did you learn today?'
    }
};

let currentLang = 'TH';
let currentTheme = 'dark';
let logs = [];
let selectedLogs = new Set();

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Set default date
    document.getElementById('dateInput').valueAsDate = new Date();

    // Load logs
    const savedLogs = localStorage.getItem('intern_logs');
    if (savedLogs) {
        logs = JSON.parse(savedLogs);
    }

    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        applyTheme(currentTheme);
    }

    // Sort logs desc
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderLogs();
    updateStats();
    updateLanguage();

    // Event Listeners
    document.getElementById('logForm').addEventListener('submit', handleAddLog);
    document.getElementById('hoursSelect').addEventListener('change', toggleCustomHours);
    document.getElementById('editHoursSelect').addEventListener('change', toggleEditCustomHours);
    document.getElementById('langToggle').addEventListener('click', toggleLang);
    document.getElementById('themeToggle').addEventListener('click', cycleTheme);
    document.getElementById('btnExport').addEventListener('click', exportExcel);
    document.getElementById('btnDeleteSelected').addEventListener('click', deleteSelected);

    // Edit Modal
    document.getElementById('btnCancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('editForm').addEventListener('submit', saveEdit);
});

// Logic
function toggleCustomHours(e) {
    const input = document.getElementById('customHoursInput');
    if (e.target.value === 'custom') {
        input.classList.remove('hidden');
        input.required = true;
        input.value = '';
    } else {
        input.classList.add('hidden');
        input.required = false;
    }
}

function toggleEditCustomHours(e) {
    const input = document.getElementById('editCustomHours');
    if (e.target.value === 'custom') {
        input.classList.remove('hidden');
        input.required = true;
    } else {
        input.classList.add('hidden');
        input.required = false;
    }
}

function handleAddLog(e) {
    e.preventDefault();

    const date = document.getElementById('dateInput').value;
    const desc = document.getElementById('descInput').value;
    const link = document.getElementById('linkInput').value;
    const hoursSelect = document.getElementById('hoursSelect').value;

    let hours = 0;
    if (hoursSelect === 'custom') {
        hours = parseFloat(document.getElementById('customHoursInput').value) || 0;
    } else {
        hours = parseFloat(hoursSelect);
    }

    const newLog = {
        id: Date.now().toString(),
        date,
        description: desc,
        hours,
        workLink: link,
        timestamp: Date.now()
    };

    logs.unshift(newLog); // Add to top
    // Re-sort to be safe
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveToLocal();
    renderLogs();
    updateStats();

    // Reset Form
    document.getElementById('descInput').value = '';
    document.getElementById('linkInput').value = '';
    // Keep date
}

function renderLogs() {
    const list = document.getElementById('logList');
    list.innerHTML = '';

    if (logs.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
        document.getElementById('actionBar').classList.add('hidden');
        return;
    }

    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('actionBar').classList.remove('hidden');

    logs.forEach(log => {
        const isSelected = selectedLogs.has(log.id);
        const dateObj = new Date(log.date);
        const dateStr = dateObj.toLocaleDateString(currentLang === 'TH' ? 'th-TH' : 'en-GB', {
            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
        });

        // Holiday Check
        const isHoliday = log.hours === 0;
        const hoursDisplay = isHoliday
            ? `<span class="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                   <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                 </svg>
                 ${translations[currentLang].holiday_leave}
               </span>`
            : `<span class="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mr-8">
                 ${log.hours} ${translations[currentLang].hours_suffix}
               </span>`;


        const item = document.createElement('div');
        item.className = `glass-panel p-6 rounded-2xl transition-all group cursor-pointer relative ${isSelected ? 'bg-blue-500/10 border-blue-500/30' : 'hover:bg-white/5'}`;
        item.onclick = () => openEditModal(log);

        item.innerHTML = `
            <div class="absolute top-6 right-6 z-10" onclick="event.stopPropagation()">
                <input type="checkbox" onchange="toggleSelect('${log.id}')" ${isSelected ? 'checked' : ''} class="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 cursor-pointer">
            </div>
            <div class="flex justify-between items-start mb-3 pr-8">
                <span class="text-xs font-bold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    ${dateStr}
                </span>
                ${hoursDisplay}
            </div>
            <p class="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base line-clamp-3">${log.description}</p>
            ${log.workLink ? `
            <div class="mt-3">
                <a href="${log.workLink}" target="_blank" onclick="event.stopPropagation()" class="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    ${translations[currentLang].view_work}
                </a>
            </div>` : ''}
        `;
        list.appendChild(item);
    });
}

function updateStats() {
    // Fix: count 0 hours also
    const totalH = logs.reduce((acc, log) => acc + (log.hours !== undefined ? Number(log.hours) : 8), 0);
    const totalD = totalH / 8;
    const totalM = totalD / 22;

    document.getElementById('totalHours').innerText = totalH;
    document.getElementById('totalDays').innerText = totalD.toFixed(1);
    document.getElementById('totalMonths').innerText = totalM.toFixed(1);
}

function saveToLocal() {
    localStorage.setItem('intern_logs', JSON.stringify(logs));
}

// Selection
window.toggleSelect = function (id) {
    if (selectedLogs.has(id)) {
        selectedLogs.delete(id);
    } else {
        selectedLogs.add(id);
    }
    document.getElementById('selectedCount').innerText = selectedLogs.size;
    renderLogs();
}

function deleteSelected() {
    if (!confirm('Area you sure you want to delete selected logs?')) return;

    logs = logs.filter(log => !selectedLogs.has(log.id));
    selectedLogs.clear();
    document.getElementById('selectedCount').innerText = 0;
    saveToLocal();
    renderLogs();
    updateStats();
}

// Edit Modal
function openEditModal(log) {
    document.getElementById('editModal').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('editModal').classList.add('modal-active');
        document.getElementById('editModalContent').classList.add('modal-content-active');
    }, 10);

    document.getElementById('editId').value = log.id;
    document.getElementById('editDate').value = log.date;
    document.getElementById('editDesc').value = log.description;
    document.getElementById('editLink').value = log.workLink || '';

    const h = log.hours;
    const select = document.getElementById('editHoursSelect');
    const customInput = document.getElementById('editCustomHours');

    if (h === 8 || h === 4 || h === 0) {
        select.value = h.toString();
        customInput.classList.add('hidden');
    } else {
        select.value = 'custom';
        customInput.classList.remove('hidden');
        customInput.value = h;
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    const content = document.getElementById('editModalContent');

    modal.classList.remove('modal-active');
    content.classList.remove('modal-content-active');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function saveEdit(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const date = document.getElementById('editDate').value;
    const desc = document.getElementById('editDesc').value;
    const link = document.getElementById('editLink').value;

    const hoursSelect = document.getElementById('editHoursSelect').value;
    let hours = 0;
    if (hoursSelect === 'custom') {
        hours = parseFloat(document.getElementById('editCustomHours').value) || 0;
    } else {
        hours = parseFloat(hoursSelect);
    }

    const index = logs.findIndex(l => l.id === id);
    if (index !== -1) {
        logs[index] = { ...logs[index], date, description: desc, hours, workLink: link };
        saveToLocal();
        renderLogs();
        updateStats();
        closeEditModal();
    }
}

// Export
function exportExcel() {
    const data = logs.map(log => ({
        Date: log.date,
        Hours: log.hours,
        Description: log.description,
        Link: log.workLink
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs");
    XLSX.writeFile(wb, "intern_logs_demo.xlsx");
}

// Language
function toggleLang() {
    currentLang = currentLang === 'TH' ? 'EN' : 'TH';
    document.getElementById('langToggle').innerText = currentLang;
    document.body.classList.toggle('lang-th', currentLang === 'TH');
    updateLanguage();
    renderLogs(); // Re-render for holiday text check
}

function updateLanguage() {
    const t = translations[currentLang];

    // Update simple IDs
    const map = {
        'labelNewEntry': 'new_entry',
        'labelDate': 'date',
        'labelHours': 'hours',
        'labelDesc': 'description',
        'labelLink': 'work_link',
        'btnSave': 'save_entry',
        'labelRecent': 'recent_logs',
        'labelTotalHours': 'total_hours',
        'labelTotalDays': 'days',
        'labelTotalMonths': 'months',
        'labelExport': 'export',
        'msgNoLogs': 'no_logs',
        'labelEditEntry': 'edit_entry',
        'labelEditDate': 'date',
        'labelEditHours': 'hours',
        'labelEditDesc': 'description',
        'labelEditLink': 'work_link'
    };

    for (const [id, key] of Object.entries(map)) {
        if (document.getElementById(id)) {
            document.getElementById(id).innerText = t[key];
        }
    }

    document.getElementById('descInput').placeholder = t['placeholder_desc'];
}

// Themes
function cycleTheme() {
    if (currentTheme === 'dark') applyTheme('blue');
    else if (currentTheme === 'blue') applyTheme('light');
    else applyTheme('dark');
}

function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update Icon
    const btn = document.getElementById('themeToggle');
    if (theme === 'dark') btn.innerText = '🌙';
    else if (theme === 'blue') btn.innerText = '🌊';
    else btn.innerText = '☀️';
}
