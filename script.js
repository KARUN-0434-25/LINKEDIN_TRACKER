const grid = document.getElementById('mainGrid');
    const modal = document.getElementById('modalOverlay');
    let connections = JSON.parse(localStorage.getItem('myNetwork')) || [];
    let deleteId = null;

    // Load saved data and render initial grid
    window.onload = () => connections.forEach(data => renderCard(data));

    function saveAndAdd() {
        const name = document.getElementById('newName').value;
        const college = document.getElementById('newCollege').value;
        const post = document.getElementById('newPost').value;
        const link = document.getElementById('newLink').value;

        if(!name || !college) return alert("Fill in Name and College!");

        const newConn = { id: Date.now(), name, college, post, link };
        connections.push(newConn);
        localStorage.setItem('myNetwork', JSON.stringify(connections));
        renderCard(newConn);
        ['newName', 'newCollege', 'newPost', 'newLink'].forEach(id => document.getElementById(id).value = '');
    }

    function renderCard(data) {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', data.id);
        card.setAttribute('data-name', data.name.toLowerCase());
        card.setAttribute('data-search', (data.name + data.college).toLowerCase());
        card.innerHTML = `
            <div class="card-header" onclick="toggleCard(this)">${data.name}</div>
            <div class="details">
                <div class="detail-row"><span class="label">College:</span> <span>${data.college}</span></div>
                <div class="detail-row"><span class="label">Quality:</span> <span>${data.post}</span></div>
                <div class="btn-group">
                    ${data.link ? `<a href="${data.link}" target="_blank" class="link-btn">LinkedIn</a>` : ''}
                    <button class="del-btn" onclick="openModal(${data.id})">Delete</button>
                </div>
            </div>
        `;
        grid.prepend(card);
    }

    function sortConnections() {
        // Sort the data array alphabetically by name
        connections.sort((a, b) => a.name.localeCompare(b.name));
        
        // Save the sorted order back to LocalStorage
        localStorage.setItem('myNetwork', JSON.stringify(connections));
        
        // Clear grid and re-render in sorted order
        grid.innerHTML = '';
        connections.forEach(data => renderCard(data));
        // Reset search filter after sort
        filterCards();
    }

    function openModal(id) { deleteId = id; modal.style.display = 'flex'; }
    function closeModal() { modal.style.display = 'none'; deleteId = null; }

    document.getElementById('confirmDelete').onclick = () => {
        if (deleteId) {
            connections = connections.filter(c => c.id !== deleteId);
            localStorage.setItem('myNetwork', JSON.stringify(connections));
            document.querySelector(`[data-id="${deleteId}"]`).remove();
            closeModal();
        }
    };

    function toggleCard(header) {
        const card = header.parentElement;
        const isActive = card.classList.contains('active');
        document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
        if (!isActive) card.classList.add('active');
    }

    function filterCards() {
        const q = document.getElementById('searchInput').value.toLowerCase();
        document.querySelectorAll('.card').forEach(c => c.classList.toggle('hidden', !c.getAttribute('data-search').includes(q)));
    }