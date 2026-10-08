// ═══════════════════════════════════════════════════════════
//  KD LIFE — UI Controller (Clean Rebuild)
// ═══════════════════════════════════════════════════════════

const UI = (() => {

  let selAvatar = '🧑🏿';
  let selBg     = 'middle';
  let selTrait  = 'ambitious';
  let selGoal   = 'tycoon';
  let _activeChatName    = null;
  let _activeChatIsGroup = false;
  let _adTimer = null;

  // ── Helpers ───────────────────────────────────────────────
  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ── Screen Navigation ─────────────────────────────────────
  function goTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    if (id === 'screen-game') {
      updateHUD();
      requestAnimationFrame(() => requestAnimationFrame(() => Engine.start()));
    } else {
      Engine.stop();
    }
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    renderAvatarGrid();
    renderBgGrid();
    renderTraitGrid();
    renderGoalGrid();
    Engine.init();
    startAdRotation();
  }

  // ── Character Creation ────────────────────────────────────
  function renderAvatarGrid() {
    const el = document.getElementById('avatarGrid');
    if (!el) return;
    el.innerHTML = KD_DATA.avatars.map(a =>
      `<div class="avatar-item ${a.emoji === selAvatar ? 'selected':''}" onclick="UI.pickAvatar('${a.emoji}',this)">
        <span class="avatar-emoji">${a.emoji}</span>
        <span class="avatar-label">${a.label}</span>
      </div>`).join('');
  }

  function renderBgGrid() {
    const el = document.getElementById('bgGrid');
    if (!el) return;
    el.innerHTML = KD_DATA.backgrounds.map(b =>
      `<div class="bg-item ${b.id === selBg ? 'selected':''}" onclick="UI.pickBg('${b.id}',this)">
        <div class="bg-label">${b.label}</div>
        <div class="bg-desc">${b.desc}</div>
        <div class="bg-bonus">💰 ₦${b.bonus.money.toLocaleString()} · 🧠 +${b.bonus.skill} · ⭐ +${b.bonus.reputation} rep</div>
      </div>`).join('');
  }

  function renderTraitGrid() {
    const el = document.getElementById('traitGrid');
    if (!el) return;
    el.innerHTML = KD_DATA.traits.map(t =>
      `<div class="trait-item ${t.id === selTrait ? 'selected':''}" onclick="UI.pickTrait('${t.id}',this)">
        <div class="trait-label">${t.label}</div>
        <div class="trait-desc">${t.desc}</div>
      </div>`).join('');
  }

  function renderGoalGrid() {
    const el = document.getElementById('goalGrid');
    if (!el) return;
    el.innerHTML = KD_DATA.goals.map(g =>
      `<div class="goal-item ${g.id === selGoal ? 'selected':''}" onclick="UI.pickGoal('${g.id}',this)">
        <div class="goal-label">${g.label}</div>
        <div class="goal-desc">${g.desc}</div>
      </div>`).join('');
  }

  function pickAvatar(e, el) { selAvatar = e; document.querySelectorAll('.avatar-item').forEach(i => i.classList.remove('selected')); el.classList.add('selected'); }
  function pickBg(id, el)    { selBg = id;    document.querySelectorAll('.bg-item').forEach(i => i.classList.remove('selected'));     el.classList.add('selected'); }
  function pickTrait(id, el) { selTrait = id; document.querySelectorAll('.trait-item').forEach(i => i.classList.remove('selected'));  el.classList.add('selected'); }
  function pickGoal(id, el)  { selGoal = id;  document.querySelectorAll('.goal-item').forEach(i => i.classList.remove('selected'));   el.classList.add('selected'); }

  function selectGender(el) {
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  }

  function startGame() {
    const name   = document.getElementById('charName')?.value.trim();
    const age    = parseInt(document.getElementById('charAge')?.value || 18);
    const gender = document.querySelector('.gender-btn.active')?.dataset.gender || 'male';
    if (!name)                { notify('⚠️ Enter your name!'); return; }
    if (age < 16 || age > 25) { notify('⚠️ Age must be 16–25.'); return; }

    GameState.initCharacter({ name, age, gender, avatar: selAvatar, background: selBg, trait: selTrait, goal: selGoal });
    Engine.setPlayer(name, selAvatar);
    goTo('screen-game');
    showModal('🏙️', `Welcome to Kaduna, ${name}!`,
      `Your KD Life begins today.\n\n🎮 Arrow Keys / WASD to walk\n🏢 Press E to enter buildings\n📱 Tap the phone to open it\n\nGoal: ${KD_DATA.goals.find(g => g.id === selGoal)?.desc}`);
  }

  // ── HUD ───────────────────────────────────────────────────
  function updateHUD() {
    const s  = GameState.get();
    const c  = s.character;
    const f  = s.finance;
    const t  = s.time;
    const cd = GameState.getCareerData();

    setEl('hudAvatar', c.avatar);
    setEl('hudName',   c.name);
    setEl('hudJob',    cd ? cd.currentLevel.title : 'Unemployed');
    setEl('statMoney', '₦' + f.cash.toLocaleString());
    setEl('statDay',   'Day ' + t.day);
    setEl('statAge',   c.age + ' yrs');
    setEl('statRep',   '⭐' + c.reputation);

    const clamp = (v) => Math.max(0, Math.min(100, v));
    [['barHealth','numHealth', clamp(c.health)],
     ['barEnergy','numEnergy', clamp(c.energy)],
     ['barHappy', 'numHappy',  clamp(c.happiness)],
     ['barSkill', 'numSkill',  Math.min(100, c.skill)],
    ].forEach(([bid, nid, val]) => {
      const el = document.getElementById(bid);
      if (el) el.style.width = val + '%';
      setEl(nid, Math.round(bid === 'barSkill' ? c.skill : val));
    });

    // Phone notification badge
    const unread = (s.phone.chats || []).reduce((a, c) => a + (c.unread||0), 0)
                 + (s.phone.groups || []).reduce((a, g) => a + (g.unread||0), 0)
                 + s.phone.messages.filter(m => !m.read).length;
    const badge = document.getElementById('phoneBadge');
    if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'flex' : 'none'; }

    setEl('seasonLabel', {dry:'☀️ Dry',rainy:'🌧️ Rainy',harmattan:'🌬️ Harmattan'}[t.season] || '');
  }

  // ── Location ──────────────────────────────────────────────
  function enterBuilding(locId) {
    const loc = KD_DATA.locations.find(l => l.id === locId);
    if (!loc) return;
    Engine.stop();
    setEl('locIcon',     loc.icon);
    setEl('locName',     loc.name);
    setEl('locDesc',     loc.desc);
    setEl('locDistrict', '📍 ' + loc.district);
    document.getElementById('locLog').innerHTML = '';
    const actEl = document.getElementById('locActions');
    if (actEl) actEl.innerHTML = loc.actions.map(a =>
      `<button class="loc-btn" onclick="Systems.run('${a.fn}')">${a.label}</button>`).join('');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-location')?.classList.add('active');
  }

  function exitLocation() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-game')?.classList.add('active');
    updateHUD();
    requestAnimationFrame(() => requestAnimationFrame(() => Engine.start()));
  }

  function logLoc(msg) {
    const el = document.getElementById('locLog');
    if (!el) return;
    const d = document.createElement('div');
    d.className   = 'log-entry';
    d.textContent = msg;
    el.prepend(d);
  }

  // ══════════════════════════════════════════════════════════
  //  PHONE — Visual Smartphone UI
  // ══════════════════════════════════════════════════════════

  function openPhone() {
    const s = GameState.get();
    s.phone.messages.forEach(m => m.read = true);
    document.querySelectorAll('.screen').forEach(sc => sc.classList.remove('active'));
    document.getElementById('screen-phone')?.classList.add('active');
    showPhoneHome();
    updateHUD();
  }

  function closePhone() {
    document.getElementById('screen-phone')?.classList.remove('active');
    document.getElementById('screen-game')?.classList.add('active');
    updateHUD();
    requestAnimationFrame(() => requestAnimationFrame(() => Engine.start()));
  }

  // ── Phone Home (app grid) ─────────────────────────────────
  function showPhoneHome() {
    const s    = GameState.get();
    const el   = document.getElementById('phoneScreen');
    if (!el) return;
    const unreadChats = (s.phone.chats||[]).reduce((a,c)=>a+(c.unread||0),0)
                      + (s.phone.groups||[]).reduce((a,g)=>a+(g.unread||0),0);

    // Phone wallpaper + status bar + app grid
    el.innerHTML = `
      <div class="phone-status-bar">
        <span>${s.time.timeOfDay || 'Morning'}</span>
        <span>Day ${s.time.day} · ₦${s.finance.cash.toLocaleString()}</span>
        <span>🔋95%</span>
      </div>

      <div class="phone-wallpaper">
        <div class="phone-avatar-big">${s.character.avatar}</div>
        <div class="phone-wp-name">${s.character.name}</div>
        <div class="phone-wp-sub">⭐${s.character.reputation} rep · ${GameState.getCareerData()?.currentLevel.title || 'Unemployed'}</div>
      </div>

      <div class="phone-app-grid">
        <div class="phone-app" onclick="UI.openPhoneApp('chats')">
          <div class="phone-app-icon" style="background:#25D366">💬</div>
          <div class="phone-app-name">KD Chat</div>
          ${unreadChats > 0 ? `<div class="app-badge">${unreadChats}</div>` : ''}
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('groups')">
          <div class="phone-app-icon" style="background:#128C7E">👥</div>
          <div class="phone-app-name">Groups</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('bank')">
          <div class="phone-app-icon" style="background:#003087">🏦</div>
          <div class="phone-app-name">KD Bank</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('jobs')">
          <div class="phone-app-icon" style="background:#0077B5">💼</div>
          <div class="phone-app-name">Jobs</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('social')">
          <div class="phone-app-icon" style="background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)">📸</div>
          <div class="phone-app-name">KDGram</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('dating')">
          <div class="phone-app-icon" style="background:#FE3C72">❤️</div>
          <div class="phone-app-name">KD Match</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('map')">
          <div class="phone-app-icon" style="background:#4285F4">🗺️</div>
          <div class="phone-app-name">KD Map</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('news')">
          <div class="phone-app-icon" style="background:#CC0000">📰</div>
          <div class="phone-app-name">KD News</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('stocks')">
          <div class="phone-app-icon" style="background:#00C805">📈</div>
          <div class="phone-app-name">Stocks</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('crime')">
          <div class="phone-app-icon" style="background:#222">⚠️</div>
          <div class="phone-app-name">Underworld</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('therapy')">
          <div class="phone-app-icon" style="background:#7c3aed">🧠</div>
          <div class="phone-app-name">Therapy</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('notifications')">
          <div class="phone-app-icon" style="background:#f39c12">🔔</div>
          <div class="phone-app-name">Alerts</div>
        </div>
      </div>

      <div class="phone-bottom-dock">
        <div class="phone-app" onclick="UI.openPhoneApp('chats')">
          <div class="phone-app-icon" style="background:#25D366;width:44px;height:44px;font-size:1.3rem">💬</div>
          <div class="phone-app-name">Chat</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('bank')">
          <div class="phone-app-icon" style="background:#003087;width:44px;height:44px;font-size:1.3rem">🏦</div>
          <div class="phone-app-name">Bank</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('map')">
          <div class="phone-app-icon" style="background:#4285F4;width:44px;height:44px;font-size:1.3rem">🗺️</div>
          <div class="phone-app-name">Map</div>
        </div>
        <div class="phone-app" onclick="UI.openPhoneApp('social')">
          <div class="phone-app-icon" style="background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);width:44px;height:44px;font-size:1.3rem">📸</div>
          <div class="phone-app-name">KDGram</div>
        </div>
      </div>`;
  }

  // ── Open Phone App ────────────────────────────────────────
  function openPhoneApp(app) {
    const el = document.getElementById('phoneScreen');
    if (!el) return;
    const s = GameState.get();

    // Build app header
    const header = `<div class="phone-app-header">
      <button class="phone-back-btn" onclick="UI.showPhoneHome()">←</button>
      <span class="phone-app-title">${getAppTitle(app)}</span>
    </div>`;

    switch(app) {

      // ── CHATS ──────────────────────────────────────────────
      case 'chats': {
        const chats = s.phone.chats || [];
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="phone-search-bar"><input placeholder="🔍 Search chats..." readonly/></div>
            ${chats.length === 0
              ? '<p class="empty-msg">No chats yet. Go meet people in KD!</p>'
              : chats.map(c => {
                  const last = c.messages[c.messages.length-1];
                  return `<div class="chat-list-item" onclick="UI.openChatView('${c.name}',false)">
                    <div class="chat-list-avatar">${c.avatar||'👤'}</div>
                    <div class="chat-list-info">
                      <div class="chat-list-top">
                        <span class="chat-list-name">${c.name}</span>
                        <span class="chat-list-time">${last ? last.time : ''}</span>
                      </div>
                      <div class="chat-list-preview">${last ? (last.isMe ? 'You: ':'') + last.text.substring(0,38)+'...' : 'Say hello!'}</div>
                    </div>
                    ${(c.unread||0) > 0 ? `<div class="chat-unread-badge">${c.unread}</div>` : ''}
                  </div>`;
                }).join('')}
          </div>`;
        break;
      }

      // ── GROUPS ─────────────────────────────────────────────
      case 'groups': {
        const groups = s.phone.groups || [];
        el.innerHTML = header + `
          <div class="phone-content-area">
            ${groups.length === 0
              ? '<p class="empty-msg">No groups yet.</p>'
              : groups.map(g => {
                  const last = g.messages[g.messages.length-1];
                  return `<div class="chat-list-item" onclick="UI.openChatView('${g.name}',true)">
                    <div class="chat-list-avatar" style="background:#128C7E;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem">👥</div>
                    <div class="chat-list-info">
                      <div class="chat-list-top">
                        <span class="chat-list-name">${g.name}</span>
                        <span class="chat-list-members">${g.members.length} members</span>
                      </div>
                      <div class="chat-list-preview">${last ? last.from+': '+last.text.substring(0,35)+'...' : 'Group created'}</div>
                    </div>
                    ${(g.unread||0) > 0 ? `<div class="chat-unread-badge">${g.unread}</div>` : ''}
                  </div>`;
                }).join('')}
          </div>`;
        break;
      }

      // ── BANK ───────────────────────────────────────────────
      case 'bank': {
        const f = s.finance;
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="bank-hero-card">
              <div class="bank-hero-label">Total Balance</div>
              <div class="bank-hero-amount">₦${(f.cash + f.savings).toLocaleString()}</div>
              <div class="bank-hero-sub">Cash: ₦${f.cash.toLocaleString()} · Savings: ₦${f.savings.toLocaleString()}</div>
            </div>
            <div class="bank-actions-row">
              <button class="bank-action-btn" onclick="Systems.run('invest')">📈<span>Invest</span></button>
              <button class="bank-action-btn" onclick="Systems.run('transferMoney')">💸<span>Transfer</span></button>
              <button class="bank-action-btn" onclick="Systems.run('takeLoan')">🏦<span>Loan</span></button>
              <button class="bank-action-btn" onclick="Systems.run('checkCredit')">📊<span>Credit</span></button>
            </div>
            <div class="phone-section-title">Account Details</div>
            ${[
              ['💳 Credit Score', `${f.creditScore}/850`, f.creditScore>=650?'#27ae60':f.creditScore>=500?'#f39c12':'#e74c3c'],
              ['📈 Investments',  `${f.investments.length} active`, '#3498db'],
              ['⚠️ Active Loans', `₦${f.loans.reduce((a,l)=>a+l.amount,0).toLocaleString()}`, '#e74c3c'],
              ['💰 Total Earned', `₦${f.totalEarned.toLocaleString()}`, '#27ae60'],
              ['💸 Total Spent',  `₦${f.totalSpent.toLocaleString()}`, '#e74c3c'],
            ].map(([k,v,c])=>`<div class="bank-row"><span>${k}</span><strong style="color:${c}">${v}</strong></div>`).join('')}
          </div>`;
        break;
      }

      // ── JOBS ───────────────────────────────────────────────
      case 'jobs': {
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="phone-section-title">💼 Job Board</div>
            ${KD_DATA.careers.map(career => {
              const lv = career.levels[0];
              const ok = s.character.skill >= lv.skillReq;
              return `<div class="job-card-phone ${ok?'':'locked-job'}">
                <div class="job-icon">${career.icon}</div>
                <div class="job-info">
                  <div class="job-title">${career.title}</div>
                  <div class="job-pay">₦${lv.pay.toLocaleString()}/day · 🧠 ${lv.skillReq}</div>
                  <div class="job-desc">${career.levels.length} levels</div>
                </div>
                ${ok ? `<button class="btn-take-job" onclick="Systems.takeJob('${career.id}',1);UI.notify('✅ Applied!')">Apply</button>`
                     : `<span class="badge-locked">🔒${lv.skillReq}</span>`}
              </div>`;
            }).join('')}
            <div class="phone-section-title" style="margin-top:1rem">🎓 Education</div>
            ${KD_DATA.education.map(ed => {
              const ok = !ed.req || s.education.degrees.includes(ed.req);
              return `<div class="job-card-phone ${ok?'':'locked-job'}">
                <div class="job-icon">📚</div>
                <div class="job-info">
                  <div class="job-title">${ed.label}</div>
                  <div class="job-pay">₦${ed.cost.toLocaleString()} · ${ed.duration}wks · +${ed.skillGain}🧠</div>
                </div>
                ${ok ? `<button class="btn-take-job" onclick="Systems.enrollCourse('${ed.id}');UI.notify('📚 Enrolled!')">Enrol</button>`
                     : `<span class="badge-locked">🔒${ed.req}</span>`}
              </div>`;
            }).join('')}
          </div>`;
        break;
      }

      // ── SOCIAL (KDGram) ────────────────────────────────────
      case 'social': {
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="kdgram-profile">
              <div class="kdgram-avatar">${s.character.avatar}</div>
              <div class="kdgram-info">
                <div class="kdgram-name">${s.character.name}</div>
                <div class="kdgram-stats">
                  <span><strong>${s.story.milestones.length}</strong> posts</span>
                  <span><strong>${s.relationships.contacts.length}</strong> friends</span>
                  <span><strong>⭐${s.character.reputation}</strong> rep</span>
                </div>
              </div>
            </div>
            <div class="phone-section-title">📱 KD Feed</div>
            ${s.phone.socialFeed.map(p => `
              <div class="social-post-card">
                <div class="post-header">
                  <span class="post-avatar">😊</span>
                  <span class="post-username">@kdlife_user</span>
                  <span class="post-time">${p.time}</span>
                </div>
                <div class="post-body">${p.text}</div>
                <div class="post-actions">
                  <button class="post-action-btn">❤️ ${p.likes}</button>
                  <button class="post-action-btn">💬 Comment</button>
                  <button class="post-action-btn">🔁 Share</button>
                </div>
              </div>`).join('')}
          </div>`;
        break;
      }

      // ── DATING (KD Match) ──────────────────────────────────
      case 'dating': {
        const contacts = s.relationships.contacts;
        el.innerHTML = header + `
          <div class="phone-content-area">
            ${s.relationships.married
              ? `<div class="dating-married">💍 Married to <strong>${s.relationships.spouse}</strong>! 🎊</div>`
              : s.relationships.dating
                ? `<div class="dating-current">
                    ❤️ Dating: <strong>${s.relationships.dating}</strong>
                    <button class="btn-primary" style="margin-top:.75rem;width:100%" onclick="Systems.propose('${s.relationships.dating}')">💍 Propose!</button>
                    ${s.relationships.married ? '' : `<button class="btn-secondary" style="margin-top:.4rem;width:100%;padding:.6rem" onclick="Systems.haveChild()">👶 Have Child</button>`}
                  </div>`
                : '<div class="dating-empty">Swipe through KD — find your match!</div>'}
            <div class="phone-section-title">Your Contacts (${contacts.length})</div>
            ${contacts.map(c => `
              <div class="rel-card">
                <span class="rel-icon">${c.icon}</span>
                <div class="rel-info">
                  <div class="rel-name">${c.name} <span class="rel-type">${c.type}</span></div>
                  <div class="rel-bar-track"><div class="rel-bar-fill" style="width:${c.level}%"></div></div>
                </div>
                <div style="display:flex;flex-direction:column;gap:.3rem;align-items:flex-end">
                  <span class="rel-level">${c.level}%</span>
                  <button class="btn-take-job" onclick="UI.openChatView('${c.name}',false)">Chat</button>
                  ${!s.relationships.married && !s.relationships.dating && c.level >= 40
                    ? `<button class="btn-take-job" style="background:#FE3C72" onclick="Systems.startDating('${c.name}')">Date</button>` : ''}
                </div>
              </div>`).join('')}
            ${contacts.length === 0 ? '<p class="empty-msg">No contacts. Go explore KD!</p>' : ''}
          </div>`;
        break;
      }

      // ── MAP ────────────────────────────────────────────────
      case 'map': {
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="phone-section-title">🗺️ Kaduna City</div>
            <div class="map-district-label">Tap any location to go there instantly</div>
            ${['GRA','Barnawa','City Centre','Kaduna North','Hospital Rd','Rigasa','Ungwan Rimi','Industrial'].map(district => {
              const locs = KD_DATA.locations.filter(l => l.district === district);
              if (!locs.length) return '';
              return `<div class="map-district">
                <div class="map-district-title">📍 ${district}</div>
                <div class="map-locs-row">
                  ${locs.map(loc => `
                    <div class="map-loc-card" onclick="UI.closePhone();UI.enterBuilding('${loc.id}')" style="border-color:${loc.color}">
                      <div class="map-loc-icon">${loc.icon}</div>
                      <div class="map-loc-name">${loc.name}</div>
                    </div>`).join('')}
                </div>
              </div>`;
            }).join('')}
          </div>`;
        break;
      }

      // ── NEWS ───────────────────────────────────────────────
      case 'news': {
        const day = s.time.day;
        const news = [
          { cat:'💼 Business', text:'KD entrepreneur raises ₦50M for new tech startup' },
          { cat:'🏥 Health', text:'Barau Hospital launches free health screening for residents' },
          { cat:'⚡ Power', text:'NEPA promises 18 hours light daily for GRA by next month' },
          { cat:'🚧 Infrastructure', text:'Zaria Road expansion project to be completed in 6 months' },
          { cat:'🎓 Education', text:'KD Polytechnic offers 200 new scholarships for students' },
          { cat:'🏆 Sports', text:'Kaduna United beats rivals 3-0 in NPFL derby' },
          { cat:'💰 Economy', text:'CBN raises MPR — how this affects your savings in KD' },
          { cat:'🌧️ Weather', text:'Meteorologists predict heavy rain this week across Kaduna' },
          { cat:'🗳️ Politics', text:'LGA elections scheduled — register your vote now' },
          { cat:'🕌 Community', text:'Eid celebration brings thousands together in KD City Centre' },
        ];
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="news-hero">📰 KD Daily — Day ${day}</div>
            ${news.map(n => `
              <div class="news-card">
                <div class="news-cat">${n.cat}</div>
                <div class="news-text">${n.text}</div>
              </div>`).join('')}
          </div>`;
        break;
      }

      // ── STOCKS ─────────────────────────────────────────────
      case 'stocks': {
        const stocks = getStockData();
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="bank-hero-card">
              <div class="bank-hero-label">Your Portfolio</div>
              <div class="bank-hero-amount">₦${(s.finance.portfolioValue||0).toLocaleString()}</div>
              <div class="bank-hero-sub">Cash available: ₦${s.finance.cash.toLocaleString()}</div>
            </div>
            <div class="phone-section-title">📈 Nigerian Stock Exchange — KD</div>
            ${stocks.map(st => `
              <div class="stock-card">
                <div class="stock-left">
                  <div class="stock-name">${st.icon} ${st.name}</div>
                  <div class="stock-sector">${st.sector}</div>
                </div>
                <div class="stock-right">
                  <div class="stock-price" style="color:${st.change>=0?'#27ae60':'#e74c3c'}">₦${st.price.toLocaleString()}</div>
                  <div class="stock-change" style="color:${st.change>=0?'#27ae60':'#e74c3c'}">${st.change>=0?'▲':'▼'}${Math.abs(st.change)}%</div>
                </div>
                <div class="stock-btns">
                  <button class="btn-take-job" onclick="UI.buyStock('${st.id}')">Buy</button>
                  <button class="btn-take-job" style="background:#e74c3c" onclick="UI.sellStock('${st.id}')">Sell</button>
                </div>
              </div>`).join('')}
          </div>`;
        break;
      }

      // ── CRIME / UNDERWORLD ─────────────────────────────────
      case 'crime': {
        const crimeRep = s.character.crimeRecord || 0;
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="crime-warning">⚠️ Warning: These actions are risky. Getting caught has serious consequences.</div>
            <div class="phone-section-title">🌑 Underworld Activities</div>
            ${[
              { icon:'🎭', label:'Run a Scam',     risk:'Medium', reward:'₦50,000', fn:'runScam' },
              { icon:'🎰', label:'Underground Bet', risk:'High',   reward:'₦200,000', fn:'undergroundBet' },
              { icon:'🕵️', label:'Black Market',   risk:'High',   reward:'₦100,000', fn:'blackMarket' },
              { icon:'💊', label:'Drug Trade',      risk:'Very High', reward:'₦500,000', fn:'drugTrade' },
            ].map(cr => `
              <div class="crime-card">
                <div class="crime-icon">${cr.icon}</div>
                <div class="crime-info">
                  <div class="crime-label">${cr.label}</div>
                  <div class="crime-risk">⚠️ Risk: ${cr.risk} · 💰 ${cr.reward}</div>
                </div>
                <button class="btn-take-job" style="background:#333" onclick="Systems.doCrime('${cr.fn}')">Do It</button>
              </div>`).join('')}
            <div class="phone-section-title">Your Record</div>
            <div class="crime-record">
              Criminal record: ${crimeRep === 0 ? '✅ Clean' : `⚠️ ${crimeRep} offences`}<br/>
              ${crimeRep > 0 ? 'Police attention: HIGH. Be careful.' : 'You are clean. Keep it that way.'}
            </div>
          </div>`;
        break;
      }

      // ── THERAPY ────────────────────────────────────────────
      case 'therapy': {
        const c = s.character;
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="therapy-hero">
              <div class="therapy-icon">🧠</div>
              <div class="therapy-title">KD Mental Wellness</div>
              <div class="therapy-sub">Your mental health matters</div>
            </div>
            <div class="therapy-stats">
              <div class="therapy-stat">
                <div class="therapy-stat-label">Mental Health</div>
                <div class="bar-track"><div class="bar-fill" style="width:${c.mentalHealth||100}%;background:linear-gradient(90deg,#7c3aed,#a78bfa)"></div></div>
                <div class="therapy-stat-val">${Math.round(c.mentalHealth||100)}%</div>
              </div>
              <div class="therapy-stat">
                <div class="therapy-stat-label">Stress Level</div>
                <div class="bar-track"><div class="bar-fill" style="width:${c.stress||0}%;background:linear-gradient(90deg,#e74c3c,#ff6b6b)"></div></div>
                <div class="therapy-stat-val">${Math.round(c.stress||0)}%</div>
              </div>
            </div>
            <div class="phone-section-title">Sessions</div>
            ${[
              { icon:'💬', label:'Talk Therapy',    cost:5000,   effect:'Stress -30, Mental +25', fn:'talkTherapy' },
              { icon:'🧘', label:'Meditation',       cost:0,      effect:'Stress -15, Happy +10', fn:'meditate' },
              { icon:'📓', label:'Journaling',       cost:0,      effect:'Stress -10, Mental +10', fn:'journal' },
              { icon:'🏃', label:'Exercise Therapy', cost:2000,   effect:'Stress -20, Health +15', fn:'exerciseTherapy' },
              { icon:'💊', label:'Medication',       cost:10000,  effect:'Mental +40', fn:'takeMeds' },
            ].map(th => `
              <div class="therapy-card">
                <div class="therapy-card-icon">${th.icon}</div>
                <div class="therapy-card-info">
                  <div class="therapy-card-label">${th.label}</div>
                  <div class="therapy-card-cost">${th.cost > 0 ? '₦'+th.cost.toLocaleString() : 'Free'} · ${th.effect}</div>
                </div>
                <button class="btn-take-job" style="background:#7c3aed" onclick="Systems.doTherapy('${th.fn}')">Start</button>
              </div>`).join('')}
          </div>`;
        break;
      }

      // ── NOTIFICATIONS ──────────────────────────────────────
      case 'notifications': {
        const msgs = s.phone.messages.slice(0, 20);
        el.innerHTML = header + `
          <div class="phone-content-area">
            <div class="phone-section-title">🔔 Recent Alerts</div>
            ${msgs.length === 0
              ? '<p class="empty-msg">No notifications.</p>'
              : msgs.map(m => `
                <div class="notif-card">
                  <div class="notif-sender">${m.sender}</div>
                  <div class="notif-text">${m.text}</div>
                  <div class="notif-time">${m.time}</div>
                </div>`).join('')}
          </div>`;
        break;
      }

      default:
        el.innerHTML = header + '<div class="phone-content-area"><p class="empty-msg">🚧 Coming soon!</p></div>';
    }
  }

  function getAppTitle(app) {
    return { chats:'💬 KD Chat', groups:'👥 Groups', bank:'🏦 KD Bank',
      jobs:'💼 Jobs & Education', social:'📸 KDGram', dating:'❤️ KD Match',
      map:'🗺️ KD Map', news:'📰 KD News', stocks:'📈 Stock Market',
      crime:'⚠️ Underworld', therapy:'🧠 Wellness', notifications:'🔔 Notifications' }[app] || app;
  }

  // ── Stock Market ──────────────────────────────────────────
  function getStockData() {
    const seed = GameState.get().time.day;
    return [
      { id:'dangote', icon:'🏭', name:'Dangote Group',  sector:'FMCG',    price:Math.round(850+Math.sin(seed*0.3)*120),  change:+(Math.sin(seed*0.3)*5).toFixed(1) },
      { id:'gtbank',  icon:'🏦', name:'GTBank',         sector:'Banking',  price:Math.round(45+Math.sin(seed*0.5)*8),    change:+(Math.sin(seed*0.5)*3).toFixed(1) },
      { id:'airtel',  icon:'📡', name:'Airtel Nigeria', sector:'Telecom',  price:Math.round(180+Math.sin(seed*0.7)*25),  change:+(Math.sin(seed*0.7)*4).toFixed(1) },
      { id:'mtnn',    icon:'📱', name:'MTN Nigeria',    sector:'Telecom',  price:Math.round(220+Math.sin(seed*0.4)*30),  change:+(Math.sin(seed*0.4)*6).toFixed(1) },
      { id:'zenith',  icon:'💳', name:'Zenith Bank',    sector:'Banking',  price:Math.round(35+Math.sin(seed*0.6)*5),    change:+(Math.sin(seed*0.6)*2).toFixed(1) },
      { id:'nnpc',    icon:'⛽', name:'NNPC Energy',    sector:'Oil & Gas',price:Math.round(520+Math.sin(seed*0.2)*80),  change:+(Math.sin(seed*0.2)*7).toFixed(1) },
    ];
  }

  function buyStock(stockId) {
    const s    = GameState.get();
    const st   = getStockData().find(s => s.id === stockId);
    if (!st) return;
    const cost = st.price * 10; // buy 10 units
    if (s.finance.cash < cost) { notify(`💸 Need ₦${cost.toLocaleString()} to buy 10 shares.`); return; }
    GameState.apply({ money: -cost });
    s.finance.portfolioValue = (s.finance.portfolioValue || 0) + cost;
    if (!s.finance.stocks) s.finance.stocks = {};
    s.finance.stocks[stockId] = (s.finance.stocks[stockId] || 0) + 10;
    notify(`📈 Bought 10 ${st.name} shares for ₦${cost.toLocaleString()}!`);
    GameState.save();
    openPhoneApp('stocks');
  }

  function sellStock(stockId) {
    const s  = GameState.get();
    const st = getStockData().find(s => s.id === stockId);
    if (!st) return;
    const held = (s.finance.stocks || {})[stockId] || 0;
    if (held === 0) { notify('You have no shares to sell.'); return; }
    const earned = Math.round(st.price * held * (1 + st.change/100));
    GameState.apply({ money: earned });
    s.finance.portfolioValue = Math.max(0, (s.finance.portfolioValue||0) - (st.price * held));
    s.finance.stocks[stockId] = 0;
    notify(`💰 Sold ${held} ${st.name} shares for ₦${earned.toLocaleString()}!`);
    GameState.save();
    openPhoneApp('stocks');
  }

  // ── Chat View ─────────────────────────────────────────────
  function openChatView(name, isGroup) {
    _activeChatName    = name;
    _activeChatIsGroup = isGroup;
    const s    = GameState.get();
    const chat = isGroup
      ? (s.phone.groups||[]).find(g => g.name === name)
      : (s.phone.chats||[]).find(c => c.name === name);
    if (!chat) return;
    chat.unread = 0;
    GameState.save();

    const el = document.getElementById('phoneScreen');
    if (!el) return;

    el.innerHTML = `
      <div class="phone-app-header">
        <button class="phone-back-btn" onclick="UI.openPhoneApp('${isGroup ? 'groups':'chats'}')">←</button>
        <div class="chat-header-info">
          <div class="chat-header-avatar">${isGroup ? '👥' : (chat.avatar||'👤')}</div>
          <div>
            <div class="chat-header-name">${name}</div>
            ${isGroup ? `<div class="chat-header-sub">${chat.members?.length||0} members</div>` : '<div class="chat-header-sub">Online</div>'}
          </div>
        </div>
        ${!isGroup ? `<button class="chat-header-btn" onclick="Systems.startDating('${name}');UI.notify('❤️ Sent a flirt!')">❤️</button>` : ''}
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-input-bar">
        <input type="text" id="chatInput" placeholder="Type a message..." maxlength="120"
          onkeydown="if(event.key==='Enter')UI.sendChatMessage()"/>
        <button class="chat-send-btn" onclick="UI.sendChatMessage()">➤</button>
      </div>`;

    renderChatMessages(chat);
  }

  function renderChatMessages(chat) {
    const el = document.getElementById('chatMessages');
    if (!el) return;
    const msgs = chat.messages || [];
    el.innerHTML = msgs.length === 0
      ? '<p class="empty-msg" style="padding-top:2rem">No messages yet. Say hi!</p>'
      : msgs.map(m => `
          <div class="chat-bubble-wrap ${m.isMe ? 'me' : 'them'}">
            ${!m.isMe && _activeChatIsGroup ? `<div class="chat-bubble-sender">${m.from}</div>` : ''}
            <div class="chat-bubble ${m.isMe ? 'bubble-me' : 'bubble-them'}">${m.text}</div>
            <div class="chat-bubble-time">${m.time}</div>
          </div>`).join('');
    el.scrollTop = el.scrollHeight;
  }

  function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text  = input?.value.trim();
    if (!text || !_activeChatName) return;
    input.value = '';
    const s = GameState.get();

    if (_activeChatIsGroup) {
      GameState.sendGroupChat(_activeChatName, text, true);
      setTimeout(() => {
        const group = (s.phone.groups||[]).find(g => g.name === _activeChatName);
        if (!group) return;
        const replies = ['😂 Lol!','Facts!','KD no dey carry last 🔥','Amen 🙏','Big moves!','💯','Say that again!','This group dey mad 😄'];
        group.messages.push({ from:group.members[Math.floor(Math.random()*group.members.length)], text:replies[Math.floor(Math.random()*replies.length)], time:`Day ${s.time.day}`, isMe:false });
        GameState.save();
        const chat = (s.phone.groups||[]).find(g => g.name === _activeChatName);
        if (chat && document.getElementById('chatMessages')) renderChatMessages(chat);
      }, 1200 + Math.random()*1500);
    } else {
      GameState.sendChat(_activeChatName, text, true);
      GameState.npcAutoReply(_activeChatName);
      setTimeout(() => {
        const chat = (s.phone.chats||[]).find(c => c.name === _activeChatName);
        if (chat && document.getElementById('chatMessages')) renderChatMessages(chat);
      }, 2000);
    }
    const chat = _activeChatIsGroup
      ? (s.phone.groups||[]).find(g => g.name === _activeChatName)
      : (s.phone.chats||[]).find(c => c.name === _activeChatName);
    if (chat) renderChatMessages(chat);
    GameState.apply({ happiness: 2 });
  }

  // ── Ads System ────────────────────────────────────────────
  const IN_GAME_ADS = [
    { id:'a1', text:'🏠 KD Properties — Buy your dream home in Kaduna!',          reward:500  },
    { id:'a2', text:'📱 KD Tech Store — Latest phones at the best prices!',        reward:300  },
    { id:'a3', text:'🚗 AutoPark KD — Drive your dream car today!',                reward:400  },
    { id:'a4', text:'🎓 KD Online Academy — Learn skills, earn more!',             reward:200  },
    { id:'a5', text:'🍲 TastyKD Food Delivery — Order now, eat in 30 mins!',       reward:150  },
    { id:'a6', text:'💊 Barnawa Pharmacy — Quality healthcare products!',           reward:200  },
    { id:'a7', text:'🏦 FinanceKD — Best loan rates in Kaduna!',                   reward:300  },
    { id:'a8', text:'⚡ SolarKD — Never suffer NEPA again. Solar solutions!',      reward:500  },
  ];

  function startAdRotation() {
    // Show an in-game ad every 3 minutes of play
    _adTimer = setInterval(() => {
      const ad = IN_GAME_ADS[Math.floor(Math.random() * IN_GAME_ADS.length)];
      showInGameAd(ad);
    }, 180000); // 3 minutes
  }

  function showInGameAd(ad) {
    const el = document.getElementById('adBanner');
    if (!el) return;
    el.innerHTML = `
      <div class="ad-content">
        <span class="ad-label">AD</span>
        <span class="ad-text">${ad.text}</span>
        <button class="ad-watch-btn" onclick="UI.watchAd(${ad.reward})">Watch +₦${ad.reward.toLocaleString()}</button>
        <button class="ad-close-btn" onclick="UI.closeAd()">✕</button>
      </div>`;
    el.classList.remove('hidden');
  }

  function watchAd(reward) {
    closeAd();
    // Simulate ad watch (in production this would be a real ad SDK call)
    notify(`📺 Ad watched! You earned ₦${reward.toLocaleString()}!`);
    GameState.apply({ money: reward, happiness: 2 });
    GameState.addStoryEntry(`Earned ₦${reward.toLocaleString()} by watching an ad.`);
  }

  function closeAd() {
    document.getElementById('adBanner')?.classList.add('hidden');
  }

  function triggerAd() {
    const ad = IN_GAME_ADS[Math.floor(Math.random() * IN_GAME_ADS.length)];
    showInGameAd(ad);
  }

  // ── Panels ────────────────────────────────────────────────
  function showJobPanel() {
    const s  = GameState.get();
    const el = document.getElementById('jobPanelContent');
    if (!el) return;
    let html = '';
    const cd = GameState.getCareerData();
    if (cd) {
      html += `<div class="current-job-display">
        <div class="cj-icon">${cd.icon}</div>
        <div class="cj-info">
          <div class="cj-title">${cd.currentLevel.title}</div>
          <div class="cj-pay">₦${cd.currentLevel.pay.toLocaleString()}/day</div>
          <div class="cj-energy">Perf: ${s.career.performance}% · Days: ${s.career.daysAtJob}</div>
        </div>
        <div style="display:flex;gap:.4rem;flex-direction:column">
          <button class="btn-work" onclick="Systems.run('doWork');UI.showJobPanel()">💼 Work</button>
          <button class="btn-secondary" style="padding:.4rem .8rem;font-size:.72rem;border-radius:50px" onclick="Systems.quitJob();UI.showJobPanel()">🚪 Quit</button>
        </div>
      </div><hr/>`;
    }
    html += KD_DATA.careers.map(career => {
      const lv = career.levels[0];
      const isCurrent = s.career.currentJob === career.id;
      const canApply  = s.character.skill >= lv.skillReq && !isCurrent;
      return `<div class="job-card ${isCurrent?'current-job':''} ${s.character.skill<lv.skillReq?'locked-job':''}">
        <div class="job-icon">${career.icon}</div>
        <div class="job-info">
          <div class="job-title">${career.title} <span style="color:var(--mut);font-size:.68rem">${career.category}</span></div>
          <div class="job-pay">₦${lv.pay.toLocaleString()}–₦${career.levels[career.levels.length-1].pay.toLocaleString()}/day</div>
          <div class="job-desc">${career.levels.length} levels</div>
        </div>
        <div class="job-action">
          ${isCurrent ? '<span class="badge-current">✓</span>'
            : !canApply ? `<span class="badge-locked">🔒${lv.skillReq}</span>`
            : `<button class="btn-take-job" onclick="Systems.takeJob('${career.id}',1);UI.showJobPanel()">Apply</button>`}
        </div>
      </div>`;
    }).join('');
    el.innerHTML = html;
    showPanel('jobPanel');
  }

  function showStatsPanel() {
    const s  = GameState.get();
    const c  = s.character;
    const f  = s.finance;
    const el = document.getElementById('statsPanelContent');
    if (!el) return;
    el.innerHTML = `
      <div class="summary-grid">
        ${[['👤 Name',c.name],['🎂 Age',c.age],['📅 Day',s.time.day],
           ['💰 Cash','₦'+f.cash.toLocaleString()],['💾 Savings','₦'+f.savings.toLocaleString()],
           ['💎 Wealth','₦'+GameState.totalWealth().toLocaleString()],
           ['❤️ Health',Math.round(c.health)+'%'],['⚡ Energy',Math.round(c.energy)+'%'],
           ['😄 Happy',Math.round(c.happiness)+'%'],['🧠 Skill',Math.round(c.skill)],
           ['⭐ Rep',c.reputation],['😤 Stress',(c.stress||0)+'%'],
           ['🏠 Home',GameState.getHousingData()?.label||'None'],
           ['💍 Status',s.relationships.married?'💍 Married':s.relationships.dating?'❤️ Dating':'Single'],
           ['👶 Kids',s.relationships.children],['👥 Contacts',s.relationships.contacts.length],
           ['💼 Job',GameState.getCareerData()?.currentLevel.title||'None'],
           ['🎓 Degrees',s.education.degrees.length],['🏭 Businesses',s.business.owned.length],
           ['🏆 Achievements',s.achievements.length],
        ].map(([k,v])=>`<div class="sum-item"><span>${k}</span><strong>${v}</strong></div>`).join('')}
      </div>
      <div style="margin-top:1rem">
        <div class="phone-section-title">🌟 Life Story</div>
        ${s.story.milestones.length===0
          ? '<p class="empty-msg">No milestones yet.</p>'
          : s.story.milestones.map(m=>`<div class="log-entry">Day ${m.day}: ${m.text}</div>`).join('')}
      </div>`;
    showPanel('statsPanel');
  }

  function showHousingPanel(mode) {
    const s  = GameState.get();
    const el = document.getElementById('housingPanelContent');
    if (!el) return;
    el.innerHTML = `
      <div class="panel-section-title">${mode==='rent'?'🔑 Rent':'🏠 Buy'}</div>
      <div style="font-size:.82rem;color:var(--mut);margin-bottom:.75rem">Current: ${GameState.getHousingData()?.label}</div>` +
      KD_DATA.housing.filter(h => mode==='buy'?h.buyPrice>0:h.rent>0).map(h =>
        `<div class="job-card">
          <div class="job-icon">🏠</div>
          <div class="job-info">
            <div class="job-title">${h.label}</div>
            <div class="job-pay">${mode==='rent'?'₦'+h.rent.toLocaleString()+'/mo':'₦'+h.buyPrice.toLocaleString()}</div>
            <div class="job-desc">${h.desc}</div>
          </div>
          <button class="btn-take-job" onclick="Systems.upgradeHousing('${h.id}','${mode}')">${mode==='rent'?'Rent':'Buy'}</button>
        </div>`).join('');
    showPanel('housingPanel');
  }

  function showBusinessPanel() {
    const s  = GameState.get();
    const el = document.getElementById('bizPanelContent');
    if (!el) return;
    let html = '';
    if (s.business.owned.length > 0) {
      html += '<div class="panel-section-title">📊 Your Businesses</div>';
      html += s.business.owned.map(b => {
        const bd = KD_DATA.businesses.find(bz => bz.id === b.id);
        return `<div class="job-card current-job">
          <div class="job-icon">🏭</div>
          <div class="job-info">
            <div class="job-title">${b.name}</div>
            <div class="job-pay">Lvl ${b.level} · ${b.employees} staff · ₦${(b.revenue||0).toLocaleString()} earned</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:.3rem">
            <button class="btn-take-job" onclick="Systems.run('hireStaff')">+Staff</button>
            <button class="btn-take-job" onclick="Systems.run('expandBusiness')">Expand</button>
          </div>
        </div>`;
      }).join('');
      html += '<hr/>';
    }
    html += '<div class="panel-section-title">🚀 Start a Business</div>';
    html += KD_DATA.businesses.map(biz => {
      const can = s.finance.cash >= biz.startCost;
      const own = s.business.owned.find(b => b.id === biz.id);
      return `<div class="job-card ${can?'':'locked-job'}">
        <div class="job-icon">🏭</div>
        <div class="job-info">
          <div class="job-title">${biz.label}</div>
          <div class="job-pay">Start: ₦${biz.startCost.toLocaleString()} · Max ₦${biz.dailyRevMax.toLocaleString()}/day</div>
        </div>
        ${own ? '<span class="badge-current">Owned</span>'
          : can ? `<button class="btn-take-job" onclick="Systems.launchBusiness('${biz.id}')">Launch</button>`
          : `<span class="badge-locked">💸${(biz.startCost/1000000).toFixed(1)}M</span>`}
      </div>`;
    }).join('');
    el.innerHTML = html;
    showPanel('bizPanel');
  }

  function showShopPanel(cat) {
    const s  = GameState.get();
    const el = document.getElementById('shopPanelContent');
    if (!el) return;
    const items = KD_DATA.shop[cat] || [];
    el.innerHTML = `
      <div class="panel-section-title">🛍️ ${cat}</div>
      <div style="font-size:.8rem;color:var(--mut);margin-bottom:.75rem">Cash: ₦${s.finance.cash.toLocaleString()}</div>` +
      items.map(item => `<div class="job-card ${s.finance.cash>=item.price?'':'locked-job'}">
        <div class="job-info">
          <div class="job-title">${item.label}</div>
          <div class="job-pay">₦${item.price.toLocaleString()}</div>
        </div>
        ${s.finance.cash>=item.price
          ? `<button class="btn-take-job" onclick="Systems.purchaseItem('${cat}','${item.id}')">Buy</button>`
          : `<span class="badge-locked">💸</span>`}
      </div>`).join('');
    showPanel('shopPanel');
  }

  function showFurniturePanel() {
    const s  = GameState.get();
    const el = document.getElementById('furniturePanelContent');
    if (!el) return;
    el.innerHTML = `<div class="panel-section-title">🛋️ Furniture</div>` +
      KD_DATA.furniture.map(item => {
        const owned = s.housing.furniture.includes(item.id);
        const can   = s.finance.cash >= item.price && !owned;
        return `<div class="job-card ${owned?'current-job':can?'':'locked-job'}">
          <div class="job-info">
            <div class="job-title">${item.label}</div>
            <div class="job-pay">₦${item.price.toLocaleString()}</div>
          </div>
          ${owned ? '<span class="badge-current">Owned</span>'
            : can ? `<button class="btn-take-job" onclick="Systems.purchaseFurniture('${item.id}')">Buy</button>`
            : `<span class="badge-locked">💸</span>`}
        </div>`;
      }).join('');
    showPanel('furniturePanel');
  }

  function showAchievementsPanel() {
    const s  = GameState.get();
    const el = document.getElementById('achPanelContent');
    if (!el) return;
    el.innerHTML = `<div class="panel-section-title">🏆 Achievements (${s.achievements.length}/${KD_DATA.achievements.length})</div>` +
      KD_DATA.achievements.map(ach => {
        const done = s.achievements.includes(ach.id);
        return `<div class="job-card ${done?'current-job':'locked-job'}">
          <div class="job-icon" style="opacity:${done?1:.3}">${ach.icon}</div>
          <div class="job-info">
            <div class="job-title" style="opacity:${done?1:.5}">${ach.title}</div>
            <div class="job-desc">${ach.desc}</div>
          </div>
          ${done ? '<span class="badge-current">✓</span>' : '<span class="badge-locked">🔒</span>'}
        </div>`;
      }).join('');
    showPanel('achPanel');
  }

  function showVehiclePanel() {
    const s  = GameState.get();
    const el = document.getElementById('vehiclePanelContent');
    if (!el) return;
    el.innerHTML = `<div class="panel-section-title">🚗 Vehicles</div>` +
      KD_DATA.vehicles.map(v => {
        const owned = s.transport.owned.includes(v.id);
        const can   = s.finance.cash >= v.price;
        return `<div class="job-card ${owned?'current-job':can?'':'locked-job'}">
          <div class="job-icon">${v.label.split(' ')[0]}</div>
          <div class="job-info">
            <div class="job-title">${v.label}</div>
            <div class="job-pay">₦${v.price.toLocaleString()} · ⭐${v.prestige}</div>
          </div>
          ${owned ? '<span class="badge-current">Owned</span>'
            : can ? `<button class="btn-take-job" onclick="Systems.buyVehicle('${v.id}');UI.closePanel('vehiclePanel')">Buy</button>`
            : `<span class="badge-locked">💸</span>`}
        </div>`;
      }).join('');
    showPanel('vehiclePanel');
  }

  function showPanel(id)  { document.getElementById(id)?.classList.remove('hidden'); }
  function closePanel(id) { document.getElementById(id)?.classList.add('hidden'); }

  // ── Menu ──────────────────────────────────────────────────
  function toggleMenu() {
    document.getElementById('menuOverlay')?.classList.toggle('hidden');
  }

  // ── Modal ─────────────────────────────────────────────────
  function showModal(icon, title, text, isGameOver = false) {
    setEl('modalIcon',  icon);
    setEl('modalTitle', title);
    setEl('modalText',  text);
    const closeBtn   = document.getElementById('modalClose');
    const restartBtn = document.getElementById('modalRestart');
    if (closeBtn)   closeBtn.style.display   = isGameOver ? 'none'  : 'block';
    if (restartBtn) restartBtn.style.display = isGameOver ? 'block' : 'none';
    document.getElementById('eventModal')?.classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('eventModal')?.classList.add('hidden');
  }

  // ── Notify ────────────────────────────────────────────────
  function notify(msg) {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.classList.remove('show'); el.classList.add('hidden'); }, 3500);
  }

  // ── Reset ─────────────────────────────────────────────────
  function resetGame() {
    if (confirm('Start a brand new life? All progress will be lost.')) {
      Engine.stop();
      GameState.reset();
      toggleMenu();
      goTo('screen-landing');
    }
  }

  // ── Public ────────────────────────────────────────────────
  return {
    init, goTo, pickAvatar, pickBg, pickTrait, pickGoal, selectGender, startGame,
    updateHUD, enterBuilding, exitLocation, logLoc,
    openPhone, closePhone, showPhoneHome, openPhoneApp,
    openChatView, sendChatMessage, renderChatMessages,
    buyStock, sellStock,
    watchAd, closeAd, triggerAd,
    showJobPanel, showStatsPanel, showHousingPanel, showBusinessPanel,
    showShopPanel, showFurniturePanel, showAchievementsPanel, showVehiclePanel,
    showPanel, closePanel,
    toggleMenu, showModal, closeModal, notify, resetGame,
  };

})();
