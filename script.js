let networkData = JSON.parse(localStorage.getItem('core_net_v7')) || [];
let recruiterMode = false;
window.onload = renderTable;

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// PDF Generation Logic
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    showToast("Preparing PDF Report...");

    doc.setFontSize(20);
    doc.setTextColor(0, 242, 255);
    doc.text("Network Intelligence Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Connections: ${networkData.length}`, 14, 35);

    const tableRows = networkData.map(item => [
        item.name,
        item.college,
        item.post,
        (item.sent ? 'Sent ' : '') + (item.made ? 'Connected' : ''),
        item.link
    ]);

    doc.autoTable({
        startY: 45,
        head: [['Name', 'Organization', 'Quality', 'Status', 'LinkedIn']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 20, 30], textColor: [0, 242, 255] },
        styles: { fontSize: 8 },
        columnStyles: { 4: { cellWidth: 50 } }
    });

    doc.save(`Network_Report_${Date.now()}.pdf`);
    showToast("PDF Downloaded");
}

function toggleRecruiterMode() {
    recruiterMode = !recruiterMode;
    document.body.classList.toggle('recruiter-active');
    document.getElementById('mode-label').innerText = recruiterMode ? "RECRUITER MODE" : "STANDARD";
    document.getElementById('main-title').innerText = recruiterMode ? "Talent Pipeline" : "Network Manager";
    renderTable();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function normalizeOrg(org) {
    if (!org) return "N/A";
    let o = org.toUpperCase();
    if (o.includes('VIT')) return 'VITS';
    if (o.includes('ABES')) return 'ABES';
    if (o.includes('RECRUIT')) return 'RECRUITERS';
    return o.split(' ')[0].substring(0, 10);
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const totalDisp = document.getElementById('totalCount');
    tbody.innerHTML = '';
    const stats = {};

    networkData.forEach(item => {
        const norm = normalizeOrg(item.college);
        stats[norm] = (stats[norm] || 0) + 1;

        const isAplus = item.post.toUpperCase().includes('A+');
        const tr = document.createElement('tr');
        if (isAplus) tr.className = 'row-premium';

        // Styling for the buttons: active state uses accent colors
        const sentStyle = item.sent ? 'border-color: var(--accent); color: var(--accent); background: rgba(0, 242, 255, 0.1);' : '';
        const madeStyle = item.made ? 'border-color: var(--accent); color: var(--accent); background: rgba(0, 242, 255, 0.1);' : '';

        tr.innerHTML = `
            <td>
                <div style="font-weight:700">${item.name}</div>
                <a href="${item.link}" target="_blank" style="color:var(--accent); font-size:10px; text-decoration:none">🔗 PROFILE</a>
            </td>
            <td class="hide-in-recruiter"><span style="opacity:0.6">${item.college}</span></td>
            <td><span style="${isAplus ? 'color:var(--accent); font-weight:bold' : ''}">${item.post}</span></td>
            <td class="hide-in-recruiter">
                <button class="status-btn" style="${sentStyle}" onclick="updateStatus(${item.id}, 'sent')">${item.sent ? '✓' : 'S'}</button>
                <button class="status-btn" style="${madeStyle}" onclick="updateStatus(${item.id}, 'made')">${item.made ? '✓' : 'C'}</button>
            </td>
            <td>
                <span onclick="loadEdit(${item.id})" style="cursor:pointer; margin-right:15px">✎</span>
                <span onclick="deleteItem(${item.id})" style="cursor:pointer; color:#ff4d4d">✕</span>
            </td>
        `;
        tbody.appendChild(tr);
    });

    totalDisp.innerText = `${networkData.length} Total Connections`;
    renderStats(stats);
}

function renderStats(stats) {
    const container = document.getElementById('collegeStats');
    const total = networkData.length || 1;
    container.innerHTML = Object.entries(stats)
        .sort((a,b) => b[1] - a[1])
        .map(([name, count]) => {
            const pct = (count / total) * 100;
            return `
                <div class="stat-item">
                    <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px">
                        <span>${name}</span>
                        <span>${count}</span>
                    </div>
                    <div style="width:100%; height:3px; background:#111; border-radius:2px">
                        <div style="width:${pct}%; height:100%; background:var(--accent)"></div>
                    </div>
                </div>
            `;
        }).join('');
}

function saveEntry() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('nameIn').value;
    const org = document.getElementById('orgIn').value;
    if(!name || !org) return showToast("Name and Org are required");

    const entry = {
        id: id ? parseInt(id) : Date.now(),
        name, college: org,
        post: document.getElementById('qualIn').value || 'A',
        link: document.getElementById('linkIn').value || '#',
        sent: false, made: false
    };

    if(id) {
        const idx = networkData.findIndex(x => x.id == id);
        entry.sent = networkData[idx].sent;
        entry.made = networkData[idx].made;
        networkData[idx] = entry;
        showToast("Entry Updated");
    } else {
        networkData.push(entry);
        showToast("Contact Added");
    }
    localStorage.setItem('core_net_v7', JSON.stringify(networkData));
    resetForm();
    renderTable();
}

function loadEdit(id) {
    if(recruiterMode) toggleRecruiterMode();
    const item = networkData.find(x => x.id === id);
    document.getElementById('editId').value = item.id;
    document.getElementById('nameIn').value = item.name;
    document.getElementById('orgIn').value = item.college;
    document.getElementById('qualIn').value = item.post;
    document.getElementById('linkIn').value = item.link;
    document.getElementById('submitBtn').innerText = "Update";
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function updateStatus(id, key) {
    const idx = networkData.findIndex(x => x.id === id);
    if(idx !== -1) {
        networkData[idx][key] = !networkData[idx][key];
        localStorage.setItem('core_net_v7', JSON.stringify(networkData));
        renderTable(); // Re-render to show new tick state
    }
}

function deleteItem(id) {
    if(confirm("Permanently delete?")) {
        networkData = networkData.filter(x => x.id !== id);
        localStorage.setItem('core_net_v7', JSON.stringify(networkData));
        showToast("Contact Removed");
        renderTable();
    }
}

function resetForm() {
    document.getElementById('editId').value = "";
    document.getElementById('submitBtn').innerText = "Add Connection";
    ['nameIn','orgIn','qualIn','linkIn'].forEach(id => document.getElementById(id).value = "");
}

function runFilters() {
    const q = document.getElementById('searchBar').value.toLowerCase();
    document.querySelectorAll('tbody tr').forEach(tr => {
        tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
    });
}

function sortByAlpha() {
    networkData.sort((a,b) => a.name.localeCompare(b.name));
    renderTable();
}

function exportToFile() {
    const blob = new Blob([JSON.stringify(networkData)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Network_Backup.json';
    a.click();
}

function importFromFile(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        networkData = JSON.parse(ev.target.result);
        localStorage.setItem('core_net_v7', JSON.stringify(networkData));
        showToast("Import Complete");
        renderTable();
    };
    reader.readAsText(e.target.files[0]);
}