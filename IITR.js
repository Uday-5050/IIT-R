// Get the hamburger menu and the navigation menu elements
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

// Add a click event listener to the hamburger menu
if (hamburger) {
    hamburger.addEventListener("click", () => {
    // Toggle the 'active' class on both the hamburger and the nav menu
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    });
}

// Add a click event listener to each navigation link
document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    // When a link is clicked, remove the 'active' class to close the menu
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('alt-theme');
        // simple icon switch
        themeToggle.textContent = document.body.classList.contains('alt-theme') ? '☀️' : '🌙';
    });
}

// Search and profile (placeholder behavior)
const searchBtn = document.getElementById('searchBtn');
if (searchBtn) searchBtn.addEventListener('click', () => alert('Search clicked — implement search UI here.'));
const profileBtn = document.getElementById('profileBtn');
if (profileBtn) profileBtn.addEventListener('click', () => alert('Profile clicked — implement profile menu here.'));

// profile menu toggle
const profileMenu = document.getElementById('profileMenu');
if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const visible = profileMenu.style.display === 'block';
        profileMenu.style.display = visible ? 'none' : 'block';
    });
    // close when clicking outside
    document.addEventListener('click', () => { profileMenu.style.display = 'none'; });
}

// notifications (simple clear)
const notifBtn = document.getElementById('notifBtn');
const notifBadge = document.getElementById('notifBadge');
if (notifBtn && notifBadge) {
    notifBtn.addEventListener('click', () => {
        notifBadge.style.display = 'none';
        alert('No new notifications');
    });
}

// search modal
const searchModal = document.getElementById('searchModal');
const searchClose = document.getElementById('searchClose');
if (searchBtn && searchModal) {
    searchBtn.addEventListener('click', () => { searchModal.style.display = 'flex'; document.getElementById('searchInput').focus(); });
}
if (searchClose && searchModal) {
    searchClose.addEventListener('click', () => { searchModal.style.display = 'none'; });
}

// Auto-sync pending submissions saved to localStorage (key: iitr_pending)
// Tries to resend queued items on page load and when the browser gains network.
(function(){
    async function flushPending() {
        if (!window.localStorage) return;
        const raw = localStorage.getItem('iitr_pending');
        if (!raw) return;
        let queue;
        try { queue = JSON.parse(raw); } catch(e){ console.warn('Invalid iitr_pending payload', e); return; }
        if (!Array.isArray(queue) || queue.length === 0) return;
        console.log('Flushing', queue.length, 'pending submissions');
        const remaining = [];
        for (const item of queue) {
            try {
                const res = await fetch('/api/records', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(item) });
                if (res.ok) {
                    console.log('Flushed pending item', item);
                    // optionally notify the user via the formStatus element if present
                    const fs = document.getElementById('formStatus');
                    if (fs) fs.textContent = 'Synced saved messages to server.';
                    continue; // do not add to remaining
                }
                throw new Error('server response ' + res.status);
            } catch (err) {
                console.warn('Failed to flush item, keeping in queue', err);
                remaining.push(item);
            }
        }
        if (remaining.length) localStorage.setItem('iitr_pending', JSON.stringify(remaining));
        else localStorage.removeItem('iitr_pending');
    }

    // attempt flush on load and when browser regains connectivity
    window.addEventListener('load', () => { setTimeout(flushPending, 500); });
    window.addEventListener('online', () => { console.log('Network online - attempting to flush pending items'); flushPending(); });
})();