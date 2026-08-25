/** GNOSTIRI — App Shell Controller. Handles auth UI, active tabs, and global navigation. */

import { axiomAuth } from "./auth.js";
function setActiveTab() { const path = window.location.pathname; document.querySelectorAll('.nav-item').forEach(item => { const tab = item.dataset.tab; if (!tab) return; item.classList.remove('active'); if (tab === 'read' && path.includes('/read/')) item.classList.add('active'); else if (tab === 'quiz' && path.includes('/quiz/')) item.classList.add('active'); else if (tab === 'flash' && path.includes('/flash/')) item.classList.add('active'); else if (tab === 'profile' && path.includes('/profile/')) item.classList.add('active'); }); }
function updateAuthUI(user, isAnonymous) { const btn = document.getElementById('auth-btn'); if (!btn) return; if (user && !isAnonymous) { btn.textContent = user.displayName || 'Profile'; btn.onclick = () => window.location.href = getBasePath() + 'profile/'; } else { btn.textContent = 'Sign In'; btn.onclick = () => { if (typeof openAuthModal === 'function') openAuthModal(); }; } }
function getBasePath() { const base = document.querySelector('base')?.getAttribute('href') || '/'; return base.endsWith('/') ? base : base + '/'; }
setActiveTab();
axiomAuth.onAuthChange(updateAuthUI);
window.addEventListener('popstate', setActiveTab);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && typeof closeAuthModal === 'function') closeAuthModal(); });
