let networkData = JSON.parse(localStorage.getItem('network_final_v1')) || [];
window.onload = renderTable;

function normalizeOrg(org) {
    let lower = org.toLowerCase();
    if (lower.includes('abes')) return 'ABES';
    if (lower.includes('dtu')) return 'DTU';
    if (lower.includes('nit')) return 'NIT';
    if (lower.includes('iit')) return 'IIT';
    if (lower.includes('igdtw')) return 'IGDTW';
    if (lower.includes('kiet')) return 'KIET';
    return org.split(',')[0].trim();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    const collegeMap = {};
    networkData.forEach(item => {
        const norm = normalizeOrg(item.college);
        collegeMap[norm] = (collegeMap[norm] || 0) + 1;
        const row = document.createElement('tr');
        row.setAttribute('data-id', item.id);
        row.innerHTML = `<td><b>${item.name}</b><br><a href="${item.link}" target="_blank" style="color:var(--accent-lime)">PROFILE</a></td>
            <td>${item.college}</td><td>${item.post.toUpperCase()}</td>
            <td>
                <button class="tick ${item.sent ? 'active' : ''}" onclick="toggleState(${item.id}, 'sent')">S</button>
                <button class="tick ${item.made ? 'active' : ''}" onclick="toggleState(${item.id}, 'made')">C</button>
            </td>
            <td><button onclick="deleteEntry(${item.id})" style="background:none; border:none; color:red; cursor:pointer;">✕</button></td>`;
        tbody.appendChild(row);
    });
    renderSummary(collegeMap);
}

function renderSummary(map) {
    const bar = document.getElementById('collegeStats');
    bar.innerHTML = '';
    Object.entries(map).sort((a,b) => b[1] - a[1]).forEach(([name, count]) => {
        bar.innerHTML += `<div class="stat-chip">${name}: <b>${count}</b></div>`;
    });
}

function toggleState(id, key) {
    const index = networkData.findIndex(x => x.id === id);
    networkData[index][key] = !networkData[index][key];
    sync();
}

function createNewEntry() {
    networkData.push({ id: Date.now(), name: document.getElementById('nameIn').value, college: document.getElementById('orgIn').value, post: document.getElementById('qualIn').value || 'A', link: document.getElementById('linkIn').value, sent: false, made: false });
    sync();
}

function deleteEntry(id) { if(confirm("Delete?")) { networkData = networkData.filter(x => x.id !== id); sync(); } }
function sync() { localStorage.setItem('network_final_v1', JSON.stringify(networkData)); renderTable(); }
function exportToFile() { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(networkData)], {type: "application/json"})); a.download = `Backup.json`; a.click(); }
function importFromFile(e) { const r = new FileReader(); r.onload = (e) => { networkData = JSON.parse(e.target.result); sync(); }; r.readAsText(e.target.files[0]); }
function sortByAlpha() { networkData.sort((a, b) => a.name.localeCompare(b.name)); sync(); }
function runFilters() { 
    const q = document.getElementById('searchBar').value.toLowerCase();
    document.querySelectorAll('#tableBody tr').forEach(row => { row.classList.toggle('hidden', !row.innerText.toLowerCase().includes(q)); });
}