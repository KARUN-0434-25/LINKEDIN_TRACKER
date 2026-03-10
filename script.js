let networkData = JSON.parse(localStorage.getItem('core_net_v4')) || [];
window.onload = renderTable;

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

        tr.innerHTML = `
            <td>
                <div style="font-weight:700">${item.name}</div>
                <a href="${item.link}" target="_blank" style="color:var(--accent); font-size:10px; text-decoration:none">🔗 PROFILE</a>
            </td>
            <td><span style="opacity:0.6">${item.college}</span></td>
            <td><span class="${isAplus ? 'premium-text' : ''}">${item.post}</span></td>
            <td>
                <button class="status-btn ${item.sent ? 'active' : ''}" onclick="updateStatus(${item.id}, 'sent')">S</button>
                <button class="status-btn ${item.made ? 'active' : ''}" onclick="updateStatus(${item.id}, 'made')">C</button>
            </td>
            <td>
                <span onclick="loadEdit(${item.id})" style="cursor:pointer; margin-right:15px">✎</span>
                <span onclick="deleteItem(${item.id})" style="cursor:pointer; color:#ff4d4d">✕</span>
            </td>
        `;
        tbody.appendChild(tr);
    });

    totalDisp.innerText = `${networkData.length} Connections Tracked`;
    renderStats(stats);
}

function renderStats(stats) {
    const container = document.getElementById('collegeStats');
    const total = networkData.length || 1;
    container.innerHTML = Object.entries(stats)
        .sort((a,b) => b[1] - a[1])
        .map(([name, count]) => {
            const percentage = (count / total) * 100;
            return `
                <div class="stat-item">
                    <div class="stat-info">
                        <span>${name}</span>
                        <span>${count}</span>
                    </div>
                    <div style="width:100%; height:4px; background:#111; border-radius:2px; overflow:hidden">
                        <div style="width:${percentage}%; height:100%; background:var(--accent); box-shadow:0 0 5px var(--accent)"></div>
                    </div>
                </div>
            `;
        }).join('');
}

function saveEntry() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('nameIn').value;
    const org = document.getElementById('orgIn').value;
    
    if(!name || !org) return alert("Fill Name and Org!");

    const entry = {
        id: id ? parseInt(id) : Date.now(),
        name,
        college: org,
        post: document.getElementById('qualIn').value || 'A',
        link: document.getElementById('linkIn').value || '#',
        sent: false,
        made: false
    };

    if(id) {
        const idx = networkData.findIndex(x => x.id == id);
        entry.sent = networkData[idx].sent;
        entry.made = networkData[idx].made;
        networkData[idx] = entry;
    } else {
        networkData.push(entry);
    }

    localStorage.setItem('core_net_v4', JSON.stringify(networkData));
    resetForm();
    renderTable();
}

function loadEdit(id) {
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
    networkData[idx][key] = !networkData[idx][key];
    localStorage.setItem('core_net_v4', JSON.stringify(networkData));
    renderTable();
}

function deleteItem(id) {
    if(confirm("Remove connection?")) {
        networkData = networkData.filter(x => x.id !== id);
        localStorage.setItem('core_net_v4', JSON.stringify(networkData));
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
    a.download = 'Network_Export.json';
    a.click();
}

function importFromFile(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        networkData = JSON.parse(ev.target.result);
        localStorage.setItem('core_net_v4', JSON.stringify(networkData));
        renderTable();
    };
    reader.readAsText(e.target.files[0]);
}