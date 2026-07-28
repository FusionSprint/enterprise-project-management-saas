document.querySelectorAll('.cursor-pointer').forEach(el => {
    el.addEventListener('mousedown', () => {
        el.classList.add('scale-[0.98]');
    });
    el.addEventListener('mouseup', () => {
        el.classList.remove('scale-[0.98]');
    });
});

// Toast System
const toastContainer = document.getElementById('toast-container');
function triggerToast(message, type = "success") {
    if (!toastContainer) return;
    const toastItem = document.createElement("div");
    toastItem.className = `toast-item bg-surface-container-high border border-outline-variant text-on-surface text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 toast-${type}`;
    toastItem.style.opacity = '0';
    toastItem.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    toastItem.style.transform = 'translateY(6px)';
    toastItem.innerHTML = `<span class="material-symbols-outlined text-sm ${type === 'success' ? 'text-primary' : 'text-error'}">info</span><span>${message}</span>`;
    toastContainer.appendChild(toastItem);

    requestAnimationFrame(() => {
        toastItem.style.opacity = '1';
        toastItem.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toastItem.style.opacity = '0';
        toastItem.style.transform = 'translateY(6px)';
        setTimeout(() => toastItem.remove(), 250);
    }, 3000);
}

// Global modal handlers
const actionModal = document.getElementById('settings-interactive-modal');
const modalTitle = document.getElementById('modal-title');
const modalBodyContent = document.getElementById('modal-body-content');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalActionCancel = document.getElementById('modal-action-cancel');
const modalActionConfirm = document.getElementById('modal-action-confirm');

function openModal(title, bodyHTML, confirmLabel, confirmCallback) {
    if (!actionModal) return;
    if (modalTitle) modalTitle.textContent = title;
    if (modalBodyContent) modalBodyContent.innerHTML = bodyHTML;
    if (modalActionConfirm) {
        modalActionConfirm.textContent = confirmLabel || "CONFIRM";
        const newConfirmBtn = modalActionConfirm.cloneNode(true);
        modalActionConfirm.parentNode.replaceChild(newConfirmBtn, modalActionConfirm);
        
        newConfirmBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback(newConfirmBtn);
            } else {
                closeModal();
            }
        });
    }
    actionModal.classList.remove('hidden');
}

function closeModal() {
    if (actionModal) actionModal.classList.add('hidden');
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modalActionCancel) modalActionCancel.addEventListener('click', closeModal);
if (actionModal) {
    actionModal.addEventListener('click', (e) => {
        if (e.target === actionModal) closeModal();
    });
}

// Subnav Link Anchoring (Smooth Scroll & Glow Focus)
const subnavAccount = document.getElementById('subnav-account');
const subnavSecurity = document.getElementById('subnav-security');
const subnavBilling = document.getElementById('subnav-billing');
const subnavWorkspace = document.getElementById('subnav-workspace');

const sectionProfileCard = document.getElementById('section-profile-card');
const sectionSecurityCard = document.getElementById('section-security-card');
const sectionBillingCard = document.getElementById('section-billing-card');
const sectionWorkspaceCard = document.getElementById('section-workspace-card');

/* === Corrected Scroll Logic: Prevents main window from sliding and leaving gaps === */
function scrollToSection(sectionEl, activeTabBtn) {
    if (!sectionEl) return;

    [subnavAccount, subnavSecurity, subnavBilling, subnavWorkspace].forEach(btn => {
        if (btn) btn.classList.remove('active');
    });

    if (activeTabBtn) {
        activeTabBtn.classList.add('active');
    }

    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        const containerRect = mainContainer.getBoundingClientRect();
        const targetRect = sectionEl.getBoundingClientRect();
        
        // Calculate exact scroll target relative only to the internal main viewport
        const targetScrollOffset = targetRect.top - containerRect.top + mainContainer.scrollTop - 16;

        mainContainer.scrollTo({
            top: Math.max(0, targetScrollOffset),
            behavior: 'smooth'
        });
    }

    sectionEl.classList.add('accent-glow-flash');
    setTimeout(() => {
        sectionEl.classList.remove('accent-glow-flash');
    }, 1500);
}

if (subnavAccount) subnavAccount.addEventListener('click', () => scrollToSection(sectionProfileCard, subnavAccount));
if (subnavSecurity) subnavSecurity.addEventListener('click', () => scrollToSection(sectionSecurityCard, subnavSecurity));
if (subnavBilling) subnavBilling.addEventListener('click', () => scrollToSection(sectionBillingCard, subnavBilling));
if (subnavWorkspace) subnavWorkspace.addEventListener('click', () => scrollToSection(sectionWorkspaceCard, subnavWorkspace));

const urlParams = new URLSearchParams(window.location.search);
const initialSettingsTab = urlParams.get('tab');

if (initialSettingsTab === 'account' && subnavAccount && sectionProfileCard) {
    scrollToSection(sectionProfileCard, subnavAccount);
} else if (initialSettingsTab === 'security' && subnavSecurity && sectionSecurityCard) {
    scrollToSection(sectionSecurityCard, subnavSecurity);
} else if (initialSettingsTab === 'billing' && subnavBilling && sectionBillingCard) {
    scrollToSection(sectionBillingCard, subnavBilling);
} else if (initialSettingsTab === 'workspace' && subnavWorkspace && sectionWorkspaceCard) {
    scrollToSection(sectionWorkspaceCard, subnavWorkspace);
}

// Theme Toggle Logic
const themeLight = document.getElementById('theme-light');
const themeDark = document.getElementById('theme-dark');
const themeSystem = document.getElementById('theme-system');

function applyThemeVisual(themeOption) {
    const themeOptions = [themeLight, themeDark, themeSystem];
    themeOptions.forEach(opt => {
        if (!opt) return;
        const border = opt.querySelector('.aspect-\\[16\\/10\\]');
        const label = opt.querySelector('.text-label-md');
        const indicator = opt.querySelector('.rounded-full');
        
        border.classList.remove('border-2', 'border-primary', 'shadow-lg', 'shadow-primary/10');
        border.classList.add('border', 'border-outline-variant');
        if (label) {
            label.classList.remove('text-primary');
            label.classList.add('text-on-surface');
        }
        indicator.classList.remove('bg-primary');
        indicator.innerHTML = '';
        indicator.classList.add('border', 'border-outline-variant');
    });
    
    const border = themeOption.querySelector('.aspect-\\[16\\/10\\]');
    const label = themeOption.querySelector('.text-label-md');
    const indicator = themeOption.querySelector('.rounded-full');
    
    border.classList.add('border-2', 'border-primary', 'shadow-lg', 'shadow-primary/10');
    border.classList.remove('border-outline-variant');
    if (label) label.classList.add('text-primary');
    indicator.classList.add('bg-primary');
    indicator.classList.remove('border', 'border-outline-variant');
    indicator.innerHTML = '<span class="material-symbols-outlined text-on-primary text-[10px] external-style-006">check</span>';
}

function updateTheme(theme, isInitialLoad = false) {
    // Persist preferred state
    localStorage.setItem('theme_preference', theme);

    if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        if (themeLight) applyThemeVisual(themeLight);
        if (!isInitialLoad) triggerToast("Light theme applied");
    } else if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        if (themeDark) applyThemeVisual(themeDark);
        if (!isInitialLoad) triggerToast("Dark theme applied");
    } else if (theme === 'system') {
        if (themeSystem) applyThemeVisual(themeSystem);
        
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        if (!isInitialLoad) triggerToast("System theme applied");
    }
}

// Bind click event triggers
if (themeLight) themeLight.addEventListener('click', () => updateTheme('light'));
if (themeDark) themeDark.addEventListener('click', () => updateTheme('dark'));
if (themeSystem) themeSystem.addEventListener('click', () => updateTheme('system'));

// Real-time system preferences change listener (when in system mode)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentPreference = localStorage.getItem('theme_preference') || 'system';
    if (currentPreference === 'system') {
        if (e.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
});

// Initialize configuration on page load
const savedTheme = localStorage.getItem('theme_preference') || 'dark';
updateTheme(savedTheme, true);
// GitHub Synchronization simulation
const githubSyncBtn = document.getElementById('github-sync-btn');
const syncIcon = document.getElementById('sync-icon');
const syncText = document.getElementById('sync-text');
const commitsCount = document.getElementById('commits-count');
const commitBarsContainer = document.getElementById('commit-bars-container');

if (githubSyncBtn && syncIcon && syncText) {
    githubSyncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        syncIcon.classList.add('animate-spin');
        syncText.textContent = "Syncing...";
        
        setTimeout(() => {
            syncIcon.classList.remove('animate-spin');
            syncText.textContent = "Last synced: Just now";
            if (commitsCount) commitsCount.textContent = "1,274";
            
            // Randomly oscillate stats visual bars
            if (commitBarsContainer) {
                const bars = commitBarsContainer.querySelectorAll('div');
                bars.forEach(bar => {
                    const randomHeight = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
                    bar.style.height = `${randomHeight}%`;
                });
            }
            triggerToast("GitHub activity synced successfully!");
        }, 1500);
    });
}

// Public Share profile copies
const shareProfileBtn = document.getElementById('share-profile-btn');
if (shareProfileBtn) {
    shareProfileBtn.addEventListener('click', () => {
        navigator.clipboard.writeText("https://acme.corp/user/arivera-dev").then(() => {
            triggerToast("Profile link copied to clipboard!");
        }).catch(() => {
            triggerToast("Failed to copy link.", "error");
        });
    });
}

// Open Interactive Kanban Board
const openBoardBtn = document.getElementById('open-board-btn');
if (openBoardBtn) {
    openBoardBtn.addEventListener('click', () => {
        const boardHTML = `
            <p class="text-on-surface-variant mb-4 leading-relaxed">Interactive board overview for the <strong>Apollo-Core Engine</strong> release cycle.</p>
            <div class="grid grid-cols-3 gap-2 text-[11px]">
                <div class="bg-surface-container-high p-2 rounded border border-outline-variant space-y-2">
                    <p class="font-bold text-[10px] text-primary uppercase">To Do</p>
                    <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Migrate API Keys</div>
                    <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Optimize Bundle</div>
                </div>
                <div class="bg-surface-container-high p-2 rounded border border-outline-variant space-y-2">
                    <p class="font-bold text-[10px] text-secondary uppercase">Active</p>
                    <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Shard routing tables</div>
                    <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Run stress tests</div>
                </div>
                <div class="bg-surface-container-high p-2 rounded border border-outline-variant space-y-2">
                    <p class="font-bold text-[10px] text-success uppercase">Done</p>
                    <div class="bg-surface-container-low p-2 rounded opacity-60">• Patch login vulnerability</div>
                </div>
            </div>
            <p class="text-[10px] text-on-surface-variant italic mt-3">Click on any card to dismiss or complete it dynamically.</p>
        `;
        openModal("Apollo-Core Kanban Board", boardHTML, "CLOSE", () => {
            closeModal();
        });
    });
}

// Manage Security Keys Form Modal
const securityKeysBtn = document.getElementById('security-keys-btn');
if (securityKeysBtn) {
    securityKeysBtn.addEventListener('click', () => {
        const keysHTML = `
            <p class="text-on-surface-variant mb-4 leading-relaxed">Manage registered FIDO2 / WebAuthn hardware security credentials.</p>
            <div class="space-y-2">
                <div class="flex items-center justify-between p-2.5 bg-surface-container-high border border-outline-variant rounded-lg">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">key</span>
                        <div>
                            <p class="font-semibold text-on-surface">Yubikey 5C NFC</p>
                            <p class="text-[10px] text-on-surface-variant">Registered July 04, 2026</p>
                        </div>
                    </div>
                    <button class="text-error text-[10px] font-bold hover:underline" onclick="this.parentNode.remove()">REMOVE</button>
                </div>
            </div>
            <button class="w-full mt-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg font-bold text-xs" id="btn-add-mock-key">REGISTER NEW SECURITY KEY</button>
        `;
        openModal("Hardware Security Keys", keysHTML, "SAVE CHANGES", () => {
            closeModal();
            triggerToast("Security key configurations synchronized.");
        });

        const addKeyBtn = document.getElementById('btn-add-mock-key');
        if (addKeyBtn) {
            addKeyBtn.addEventListener('click', () => {
                addKeyBtn.innerHTML = `<span class="btn-spinner"></span> Waiting for key activation...`;
                addKeyBtn.disabled = true;
                setTimeout(() => {
                    triggerToast("New key registered successfully!");
                    closeModal();
                }, 1500);
            });
        }
    });
}

// Change Password validation
const securityPasswordBtn = document.getElementById('security-password-btn');
if (securityPasswordBtn) {
    securityPasswordBtn.addEventListener('click', () => {
        const passHTML = `
            <div class="space-y-3">
                <label class="block">
                    <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">Current Password</span>
                    <input type="password" id="input-old-pass" class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface focus:border-primary">
                </label>
                <label class="block">
                    <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">New Password</span>
                    <input type="password" id="input-new-pass" class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface focus:border-primary">
                </label>
                <label class="block">
                    <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">Confirm New Password</span>
                    <input type="password" id="input-confirm-pass" class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface focus:border-primary">
                </label>
            </div>
        `;
        openModal("Modify Credentials", passHTML, "UPDATE PASSWORD", (confirmBtn) => {
            const old = document.getElementById('input-old-pass').value;
            const newP = document.getElementById('input-new-pass').value;
            const conf = document.getElementById('input-confirm-pass').value;

            if (!old || !newP || !conf) {
                triggerToast("Please populate all credential inputs.", "error");
                return;
            }
            if (newP !== conf) {
                triggerToast("New passwords do not match.", "error");
                return;
            }

            confirmBtn.innerHTML = `<span class="btn-spinner"></span> Updating database...`;
            confirmBtn.disabled = true;

            setTimeout(() => {
                triggerToast("Credentials modified successfully!");
                closeModal();
            }, 1200);
        });
    });
}

// Edit Avatar Modal
const profileEditAvatarBtn = document.getElementById('profile-edit-avatar-btn');
const profileAvatarImg = document.getElementById('profile-avatar-img');
if (profileEditAvatarBtn && profileAvatarImg) {
    profileEditAvatarBtn.addEventListener('click', () => {
        const avatarsHTML = `
            <p class="text-on-surface-variant mb-4 leading-relaxed">Select from default company team avatars or upload a custom image.</p>
            <div class="grid grid-cols-4 gap-2">
                <div class="w-16 h-16 rounded-xl overflow-hidden border border-outline-variant cursor-pointer hover:border-primary" onclick="window.updateMockAvatar('https://lh3.googleusercontent.com/aida-public/AB6AXuD3ptAj699oxYUR75s59wY4QM1i11gkHkM2MZ0jqJmbRB1_Txim1or_CMD12jBx2wMaHpz7h9QAoDYVMA4rlhG_ygS9y3czD7bdUqAg2Lfu5PsMfw_eYrU7JMu-kYZ4R_AwGGCOG01pLAKfDWzZ7JvaSioTWQtIqasgwl-xoHeugcP2lqooz21Qg7Hb_BNV5C-Hgf-zvSWeaJI4qqLM64s-U8roPjHdYL2AEXLUCS7Ukn1kNKtXmval1A')">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3ptAj699oxYUR75s59wY4QM1i11gkHkM2MZ0jqJmbRB1_Txim1or_CMD12jBx2wMaHpz7h9QAoDYVMA4rlhG_ygS9y3czD7bdUqAg2Lfu5PsMfw_eYrU7JMu-kYZ4R_AwGGCOG01pLAKfDWzZ7JvaSioTWQtIqasgwl-xoHeugcP2lqooz21Qg7Hb_BNV5C-Hgf-zvSWeaJI4qqLM64s-U8roPjHdYL2AEXLUCS7Ukn1kNKtXmval1A" class="w-full h-full object-cover">
                </div>
                <div class="w-16 h-16 rounded-xl overflow-hidden border border-outline-variant cursor-pointer hover:border-primary" onclick="window.updateMockAvatar('https://lh3.googleusercontent.com/aida-public/AB6AXuD8tx6E1eZII4mQ9oixuAcPrqlU_IndeM8ML1THwFYgMEDohmWFO8D6GfOixOqaqEbXn9Hd7Co7_zYi9fhrzUateLRGVBFnaKWnK2u_7EAFyM8CR-0Vy_jNYvcFVyEIyUnO1-aOc9nJmMA-wcC_2D8QPx9ubnYBEBBzUSCH3vqYslJpyTQ8FPkqHA_7nhysJj13S4770INLap9AIDH9fj54R32dwpzc83Sw2mYTFs9zvXaTPUuJujHGWg')">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8tx6E1eZII4mQ9oixuAcPrqlU_IndeM8ML1THwFYgMEDohmWFO8D6GfOixOqaqEbXn9Hd7Co7_zYi9fhrzUateLRGVBFnaKWnK2u_7EAFyM8CR-0Vy_jNYvcFVyEIyUnO1-aOc9nJmMA-wcC_2D8QPx9ubnYBEBBzUSCH3vqYslJpyTQ8FPkqHA_7nhysJj13S4770INLap9AIDH9fj54R32dwpzc83Sw2mYTFs9zvXaTPUuJujHGWg" class="w-full h-full object-cover">
                </div>
                <div class="w-16 h-16 rounded-xl overflow-hidden border border-outline-variant cursor-pointer hover:border-primary flex items-center justify-center bg-surface-container" onclick="window.updateMockAvatar('https://lh3.googleusercontent.com/aida-public/AB6AXuDAaE92vrYJl9IITUD7PFDLMJX9dkTP9F5VuRsZ2jYN7ebUN3FYHbJP0WYE4YETzrGWtupx6lHpMvDPtywE8AlAb-F2RyzoQ-5ZInUesG9mK6y8sBfkWScGxj24h2SWyxMeNAQZpRlOFWsAVVNJxks_XVDTYrKz0c5UMHedM-GrrBneVNTsgVHO2KI4bjKZhsmOUjbrPmo36W5fZCZjFaLOZKa5nNkoRFQ5vxtoJg0KOd8m3baCw5mhfQ')">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAaE92vrYJl9IITUD7PFDLMJX9dkTP9F5VuRsZ2jYN7ebUN3FYHbJP0WYE4YETzrGWtupx6lHpMvDPtywE8AlAb-F2RyzoQ-5ZInUesG9mK6y8sBfkWScGxj24h2SWyxMeNAQZpRlOFWsAVVNJxks_XVDTYrKz0c5UMHedM-GrrBneVNTsgVHO2KI4bjKZhsmOUjbrPmo36W5fZCZjFaLOZKa5nNkoRFQ5vxtoJg0KOd8m3baCw5mhfQ" class="w-full h-full object-cover">
                </div>
            </div>
        `;
        openModal("Modify Avatar", avatarsHTML, "UPLOAD IMAGE", () => {
            triggerToast("Custom avatar upload simulation triggered.");
            closeModal();
        });

        window.updateMockAvatar = (imgUrl) => {
            profileAvatarImg.src = imgUrl;
            triggerToast("Profile picture updated!");
            closeModal();
        };
    });
}

// Danger Zone: Archive Workspace validation
const archiveWorkspaceBtn = document.getElementById('archive-workspace-btn');
if (archiveWorkspaceBtn) {
    archiveWorkspaceBtn.addEventListener('click', () => {
        const archiveHTML = `
            <p class="text-on-surface-variant leading-relaxed mb-4">Are you absolutely sure you want to archive Acme Corp workspace? This will suspend all deployments and projects permanently.</p>
            <label class="block">
                <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">Type "ARCHIVE" to confirm</span>
                <input type="text" id="archive-confirm-input" placeholder="ARCHIVE" class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface focus:border-error">
            </label>
        `;
        openModal("Archive Workspace", archiveHTML, "CONFIRM ARCHIVE", (confirmBtn) => {
            const val = document.getElementById('archive-confirm-input').value;
            if (val !== "ARCHIVE") {
                triggerToast("Validation phrase mismatch. Access Denied.", "error");
                return;
            }

            confirmBtn.className = "flex-1 py-2 bg-error text-on-error rounded-lg text-xs font-bold hover:opacity-90";
            confirmBtn.innerHTML = `<span class="btn-spinner"></span> Archiving workspace...`;
            confirmBtn.disabled = true;

            setTimeout(() => {
                triggerToast("Acme Corp Workspace archived.", "error");
                closeModal();
            }, 1500);
        });
    });
}

// Billing upgrade modal
const billingUpgradeBtn = document.getElementById('billing-upgrade-btn');
if (billingUpgradeBtn) {
    billingUpgradeBtn.addEventListener('click', () => {
        const billHTML = `
            <p class="text-on-surface-variant leading-relaxed mb-4">Verify current plan parameters and manage billing cycles.</p>
            <div class="space-y-2 text-xs">
                <div class="p-2.5 bg-surface-container-high rounded border border-outline-variant flex justify-between">
                    <span class="text-on-surface-variant">Active Plan</span>
                    <span class="font-bold text-primary">Pro Enterprise</span>
                </div>
                <div class="p-2.5 bg-surface-container-high rounded border border-outline-variant flex justify-between">
                    <span class="text-on-surface-variant">Billing Cycle</span>
                    <span class="font-bold">Monthly</span>
                </div>
                <div class="p-2.5 bg-surface-container-high rounded border border-outline-variant flex justify-between">
                    <span class="text-on-surface-variant">Next invoice date</span>
                    <span class="font-bold">October 12, 2026</span>
                </div>
            </div>
        `;
        openModal("Billing Details", billHTML, "MANAGE SUBSCRIPTION", () => {
            closeModal();
            triggerToast("Navigating to Stripe Portal...");
        });
    });
}

// Help button trigger
const headerHelpBtn = document.getElementById('header-help-btn');
if (headerHelpBtn) {
    headerHelpBtn.addEventListener('click', () => {
        const helpHTML = `
            <p class="text-on-surface-variant mb-4">Access Acme help guides, technical documentation, and product support channels.</p>
            <div class="space-y-2">
                <a href="#" class="block p-3 bg-surface-container-high border border-outline-variant rounded-lg hover:border-primary">
                    <p class="font-bold">Acme API Reference</p>
                    <p class="text-[10px] text-on-surface-variant mt-1">Verify endpoints, routing patterns, and database setups.</p>
                </a>
                <a href="#" class="block p-3 bg-surface-container-high border border-outline-variant rounded-lg hover:border-primary">
                    <p class="font-bold">Workspace Sharding Guide</p>
                    <p class="text-[10px] text-on-surface-variant mt-1">Read guidelines on database routing configurations.</p>
                </a>
            </div>
        `;
        openModal("Acme Help Center", helpHTML, "OK", () => {
            closeModal();
        });
    });
}

// Header bell trigger
const headerBellBtn = document.getElementById('header-bell-btn');
if (headerBellBtn) {
    headerBellBtn.addEventListener('click', () => {
        triggerToast("Checking for new alerts...");
    });
}

// Interactive Branch Selection Dropdown
const branchTrigger = document.getElementById('branch-dropdown-trigger');
const branchMenu = document.getElementById('branch-dropdown-menu');
const branchNameText = document.getElementById('branch-name');

if (branchTrigger && branchMenu) {
    branchTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        branchMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        branchMenu.classList.add('hidden');
    });

    const branchItems = branchMenu.querySelectorAll('[data-branch]');
    branchItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedBranch = item.getAttribute('data-branch');
            if (branchNameText) {
                branchNameText.textContent = selectedBranch;
            }
            branchMenu.classList.add('hidden');
            triggerToast(`Default branch set to: ${selectedBranch}`);
        });
    });
}

// Workspace Interactive Toggles
const toggleAutosave = document.getElementById('toggle-autosave');
const dotAutosave = document.getElementById('dot-autosave');
let autosaveEnabled = true;

if (toggleAutosave && dotAutosave) {
    toggleAutosave.addEventListener('click', () => {
        autosaveEnabled = !autosaveEnabled;
        if (autosaveEnabled) {
            toggleAutosave.classList.remove('bg-surface-container-highest');
            toggleAutosave.classList.add('bg-primary');
            dotAutosave.classList.remove('left-1', 'bg-outline');
            dotAutosave.classList.add('right-1', 'bg-on-primary');
            triggerToast("Auto-save enabled");
        } else {
            toggleAutosave.classList.remove('bg-primary');
            toggleAutosave.classList.add('bg-surface-container-highest');
            dotAutosave.classList.remove('right-1', 'bg-on-primary');
            dotAutosave.classList.add('left-1', 'bg-outline');
            triggerToast("Auto-save disabled");
        }
    });
}

const toggleAnalytics = document.getElementById('toggle-analytics');
const dotAnalytics = document.getElementById('dot-analytics');
let analyticsEnabled = false;

if (toggleAnalytics && dotAnalytics) {
    toggleAnalytics.addEventListener('click', () => {
        analyticsEnabled = !analyticsEnabled;
        if (analyticsEnabled) {
            toggleAnalytics.classList.remove('bg-surface-container-highest');
            toggleAnalytics.classList.add('bg-primary');
            dotAnalytics.classList.remove('left-1', 'bg-outline');
            dotAnalytics.classList.add('right-1', 'bg-on-primary');
            triggerToast("Public analytics enabled");
        } else {
            toggleAnalytics.classList.remove('bg-primary');
            toggleAnalytics.classList.add('bg-surface-container-highest');
            dotAnalytics.classList.remove('right-1', 'bg-on-primary');
            dotAnalytics.classList.add('left-1', 'bg-outline');
            triggerToast("Public analytics disabled");
        }
    });
}

// =========================================================
// UNIFIED NOTIFICATION & MESSAGES DROPDOWN SYSTEM
// =========================================================
(function() {
    const notifTrigger = document.getElementById('notif-trigger');
    const notifMenu = document.getElementById('notif-menu');
    const bellDot = document.getElementById('bell-dot');
    const notifUnreadCount = document.getElementById('header-unread-count');
    const viewAllNotifs = document.getElementById('view-all-notifs');

    const msgTrigger = document.getElementById('msg-trigger');
    const msgMenu = document.getElementById('msg-menu');
    const msgDot = document.getElementById('msg-dot');
    const msgUnreadCount = document.getElementById('msg-unread-count');
    const msgSearch = document.getElementById('msg-search');
    const msgItems = document.querySelectorAll('.msg-item');
    const markAllRead = document.getElementById('mark-all-read');
    const markMsgsRead = document.getElementById('mark-msgs-read');

    function updateNotifBadge() {
        if (!notifMenu) return;
        const count = notifMenu.querySelectorAll('.dot-indicator').length;
        if (notifUnreadCount) notifUnreadCount.textContent = count;
        if (bellDot) bellDot.style.display = count > 0 ? 'block' : 'none';
    }

    function updateMsgBadge() {
        if (!msgMenu) return;
        const count = msgMenu.querySelectorAll('.dot-indicator').length;
        if (msgUnreadCount) msgUnreadCount.textContent = count;
        if (msgDot) msgDot.style.display = count > 0 ? 'block' : 'none';
    }

    if (notifTrigger && notifMenu) {
        notifTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            notifMenu.classList.toggle('dropdown-open');
            if (msgMenu) msgMenu.classList.remove('dropdown-open');
        });
    }

    if (msgTrigger && msgMenu) {
        msgTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            msgMenu.classList.toggle('dropdown-open');
            if (notifMenu) notifMenu.classList.remove('dropdown-open');
        });
    }

    document.addEventListener('click', (e) => {
        if (notifMenu && !notifMenu.contains(e.target) && e.target !== notifTrigger) {
            notifMenu.classList.remove('dropdown-open');
        }
        if (msgMenu && !msgMenu.contains(e.target) && e.target !== msgTrigger) {
            msgMenu.classList.remove('dropdown-open');
        }
    });

    document.querySelectorAll('#notif-menu .notif-row').forEach(row => {
        row.addEventListener('click', () => {
            const dot = row.querySelector('.dot-indicator');
            if (dot) dot.remove();
            updateNotifBadge();
        });
    });

    if (msgItems && msgItems.length > 0) {
        msgItems.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.add('is-read');
                item.classList.remove('unread');
                const dot = item.querySelector('.dot-indicator');
                if (dot) dot.remove();
                updateMsgBadge();
            });
        });
    }

    if (markAllRead && notifMenu) {
        markAllRead.addEventListener('click', (e) => {
            e.stopPropagation();
            notifMenu.querySelectorAll('.dot-indicator').forEach(dot => dot.remove());
            updateNotifBadge();
            if (typeof triggerToast === 'function') triggerToast("All notifications marked as read");
            else if (typeof showToast === 'function') showToast("All notifications marked as read");
        });
    }

    if (markMsgsRead && msgMenu) {
        markMsgsRead.addEventListener('click', (e) => {
            e.stopPropagation();
            msgItems.forEach(item => {
                item.classList.add('is-read');
                item.classList.remove('unread');
                const dot = item.querySelector('.dot-indicator');
                if (dot) dot.remove();
            });
            updateMsgBadge();
            if (typeof triggerToast === 'function') triggerToast("All messages marked as read");
            else if (typeof showToast === 'function') showToast("All messages marked as read");
        });
    }

    if (viewAllNotifs) {
        viewAllNotifs.addEventListener('click', () => {
            window.location.href = "../notification_center/index.html";
        });
    }

    if (msgSearch && msgItems && msgItems.length > 0) {
        msgSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            msgItems.forEach(item => {
                const nameAttr = item.getAttribute('data-name');
                const name = nameAttr ? nameAttr.toLowerCase() : '';
                item.style.display = name.includes(term) ? '' : 'none';
            });
        });
    }

    const typingTargets = document.querySelectorAll('.typing-target');
    function simulateTyping() {
        if (typingTargets.length === 0) return;
        const target = typingTargets[Math.floor(Math.random() * typingTargets.length)];
        const originalText = target.innerText;
        setTimeout(() => {
            target.innerHTML = `<span class="text-secondary typing-indicator"><span></span><span></span><span></span> typing...</span>`;
            setTimeout(() => { target.innerText = originalText; }, 4000);
        }, Math.random() * 5000 + 5000);
    }
    if (typingTargets.length > 0) {
        setInterval(simulateTyping, 12000);
    }

    updateNotifBadge();
    updateMsgBadge();
})();