// ═══════════════════════════════════════════════════════════
//  KD LIFE — Game State Manager
// ═══════════════════════════════════════════════════════════

const GameState = (() => {

  const SAVE_KEY = 'kdlife_v3';

  // ── Default State ─────────────────────────────────────────
  function createDefault() {
    return {
      // Character
      character: {
        name:        'Player',
        gender:      'male',
        age:         18,
        avatar:      '🧑🏿',
        background:  'middle',
        trait:       'ambitious',
        goal:        'tycoon',
        reputation:  30,
        skill:       15,
        health:      100,
        energy:      100,
        happiness:   80,
        looks:       50,         // affects relationships
        stress:      0,          // increases with overwork
        mentalHealth:100,
      },

      // Time
      time: {
        day:         1,
        week:        1,
        month:       1,
        year:        1,
        timeOfDay:   'morning',  // morning/afternoon/evening/night
        season:      'dry',      // dry/rainy/harmattan
      },

      // Finance
      finance: {
        cash:        5000,
        savings:     0,
        salary:      0,
        creditScore: 500,        // 300–850
        loans: [],               // [{amount, interest, dueDay}]
        investments: [],         // [{amount, returnDay, returnMultiplier}]
        bills: {
          rent:      0,
          utilities: 0,
          insurance: 0,
          lastPaid:  0,
        },
        taxesPaid:   0,
        totalEarned: 0,
        totalSpent:  0,
      },

      // Housing
      housing: {
        current:    'hostel',    // current housing id
        owned:      [],          // owned property ids
        furniture:  [],          // owned furniture ids
        hasElec:    true,
        hasWater:   true,
        hasSecurity:false,
        rentDue:    0,           // day rent is due
      },

      // Career
      career: {
        currentJob:  null,       // career id
        jobLevel:    1,
        daysAtJob:   0,
        performance: 50,         // 0–100
        warnings:    0,
        applied: [],             // jobs applied to
        certifications: [],
        workStreak:  0,
      },

      // Education
      education: {
        current:    null,        // current course id
        courseDay:  0,           // days into course
        degrees:    [],          // completed degree ids
        gpa:        0,
        studying:   false,
      },

      // Business
      business: {
        owned:      [],          // [{id, name, level, employees, revenue, day}]
        totalRevenue: 0,
      },

      // Transport
      transport: {
        owned:      [],          // vehicle ids
        current:    'walking',
        fuelLevel:  100,
      },

      // Relationships
      relationships: {
        contacts:   [],          // [{name, icon, level, type, days}]
        married:    false,
        spouse:     null,
        children:   0,
        dating:     null,
        parents:    { alive: true, relationship: 70 },
        siblings:   1,
      },

      // Health
      health: {
        conditions:  [],         // active illnesses
        medications: [],
        lastCheckup: 0,
        fitnessLevel:30,
        nutritionLevel:50,
        hasInsurance:false,
      },

      // Shopping / Inventory
      inventory: {
        clothes:  [],
        phone:    'basic',
        laptop:   false,
        food:     50,            // food supply 0–100
        gifts:    [],
      },

      // Life Story
      story: {
        entries:    [],          // narrative log
        milestones: [],          // achieved milestones
        decisions:  [],          // major decisions made
      },

      // Achievements
      achievements: [],

      // Phone
      phone: {
        messages:   [],
        contacts:   [],
        socialFeed: [],
        notifications: [],
        apps: ['chats','bank','jobs','social','map','news','dating'],
        chats: [],       // [{id, name, avatar, messages: [{from, text, time}], isGroup}]
        groups: [],      // [{id, name, members: [], messages: [{from, text, time}]}]
      },

      // Meta
      meta: {
        version:    3,
        created:    Date.now(),
        lastPlayed: Date.now(),
        totalPlayTime: 0,
        gameOver:   false,
      },
    };
  }

  let _state = createDefault();

  // ── Getters ───────────────────────────────────────────────
  function get()           { return _state; }
  function getChar()       { return _state.character; }
  function getFinance()    { return _state.finance; }
  function getCareer()     { return _state.career; }
  function getHousing()    { return _state.housing; }
  function getRelations()  { return _state.relationships; }
  function getTime()       { return _state.time; }
  function getStory()      { return _state.story; }

  // ── Init from Character Creation ──────────────────────────
  function initCharacter(data) {
    const bg = KD_DATA.backgrounds.find(b => b.id === data.background);
    const tr = KD_DATA.traits.find(t => t.id === data.trait);

    _state = createDefault();
    _state.character.name       = data.name;
    _state.character.gender     = data.gender;
    _state.character.age        = data.age;
    _state.character.avatar     = data.avatar;
    _state.character.background = data.background;
    _state.character.trait      = data.trait;
    _state.character.goal       = data.goal;
    _state.character.skill      = bg.bonus.skill;
    _state.character.happiness  = 80 + (bg.bonus.happiness || 0);
    _state.character.reputation = bg.bonus.reputation || 30;
    _state.finance.cash         = bg.bonus.money;

    // Set housing by background
    if (data.background === 'rich') {
      _state.housing.current = 'flat';
    } else if (data.background === 'middle') {
      _state.housing.current = 'selfcon';
    } else {
      _state.housing.current = 'hostel';
    }

    // Set rent
    const house = KD_DATA.housing.find(h => h.id === _state.housing.current);
    _state.finance.bills.rent = house.rent;
    _state.housing.rentDue    = 30;

    // Trait bonuses
    if (tr) {
      if (tr.bonus.happyGain)  _state.character.happiness += tr.bonus.happyGain;
      if (tr.bonus.happyDrain) _state.character.happiness -= tr.bonus.happyDrain;
    }

    // Phone messages welcome
    addPhoneMessage('KD Life', '🏙️ Welcome to Kaduna! Your journey begins today. Explore the city, find a job, and live YOUR KD Life!');
    addPhoneMessage('KD Bank', '🏦 Your account has been activated. Balance: ₦' + _state.finance.cash.toLocaleString());

    // Create default groups
    createGroup('KD Hustlers 🔥', ['Musa', 'Chukwu', 'Emeka', 'Danladi']);
    createGroup('Kaduna Connect 🏙️', ['Amina', 'Fatima', 'Ibrahim', 'Ngozi']);
    createGroup('KD Business Forum 💼', ['Chukwu', 'Emeka', 'Musa']);
    createGroup('Barnawa Fam 🏠', ['Hauwa', 'Usman', 'Amina']);

    // Seed initial chats with contacts
    sendChat('Amina',   'Hey! Welcome to Kaduna! Let me know if you need anything 😊', false);
    sendChat('Ibrahim', 'Omo KD is the place to be! Welcome bro 🔥', false);

    save();
  }

  // ── Apply Effects ─────────────────────────────────────────
  function apply(effect) {
    const c = _state.character;
    const f = _state.finance;
    const tr = KD_DATA.traits.find(t => t.id === c.trait);

    if (effect.money    !== undefined) {
      const amt = effect.money;
      f.cash = Math.max(0, f.cash + amt);
      if (amt > 0) f.totalEarned += amt;
      else         f.totalSpent  += Math.abs(amt);
    }
    if (effect.health    !== undefined) c.health    = clamp(c.health    + effect.health,    0, 100);
    if (effect.energy    !== undefined) c.energy    = clamp(c.energy    + effect.energy,    0, 100);
    if (effect.happiness !== undefined) {
      let gain = effect.happiness;
      if (tr && tr.bonus.happyGain && gain > 0) gain += tr.bonus.happyGain;
      c.happiness = clamp(c.happiness + gain, 0, 100);
    }
    if (effect.skill     !== undefined) {
      let gain = effect.skill;
      if (tr && tr.bonus.skillBonus && gain > 0) gain *= (1 + tr.bonus.skillBonus);
      c.skill = Math.max(0, c.skill + Math.round(gain));
    }
    if (effect.reputation!== undefined) c.reputation= clamp(c.reputation + effect.reputation, 0, 100);
    if (effect.stress    !== undefined) c.stress    = clamp(c.stress    + effect.stress,    0, 100);
    if (effect.mental    !== undefined) c.mentalHealth = clamp(c.mentalHealth + effect.mental, 0, 100);

    save();
    checkStatus();
    checkAchievements();
  }

  // ── Daily Tick ────────────────────────────────────────────
  function dailyTick() {
    const s  = _state;
    const c  = s.character;
    const f  = s.finance;
    const h  = s.housing;
    const t  = s.time;

    // Advance time
    t.day++;
    t.week  = Math.ceil(t.day / 7);
    t.month = Math.ceil(t.day / 30);
    t.year  = Math.ceil(t.day / 365);
    if (t.day % 365 === 0) c.age++;

    // Season changes
    const mth = t.day % 365;
    if      (mth < 91)  t.season = 'dry';
    else if (mth < 274) t.season = 'rainy';
    else                t.season = 'harmattan';

    // Passive stat drain
    c.health    = clamp(c.health    - 1, 0, 100);
    c.energy    = clamp(c.energy    - 8, 0, 100);
    c.happiness = clamp(c.happiness - 3, 0, 100);

    // Stress buildup from overwork
    if (s.career.workStreak > 6) {
      c.stress = clamp(c.stress + 5, 0, 100);
      c.health = clamp(c.health - 3, 0, 100);
    }

    // Mental health drain from stress
    if (c.stress > 60) c.mentalHealth = clamp(c.mentalHealth - 5, 0, 100);

    // Food depletion
    s.inventory.food = clamp(s.inventory.food - 5, 0, 100);
    if (s.inventory.food < 20) {
      c.health    = clamp(c.health    - 5, 0, 100);
      c.energy    = clamp(c.energy    - 10, 0, 100);
      c.happiness = clamp(c.happiness - 5, 0, 100);
    }

    // Pay rent monthly
    if (t.day === h.rentDue) {
      const house = KD_DATA.housing.find(hh => hh.id === h.current);
      if (house && house.rent > 0 && !h.owned.includes(h.current)) {
        if (f.cash >= house.rent) {
          f.cash -= house.rent;
          f.totalSpent += house.rent;
          h.rentDue += 30;
          addStoryEntry(`Paid ₦${house.rent.toLocaleString()} rent for ${house.label}.`);
        } else {
          c.happiness = clamp(c.happiness - 20, 0, 100);
          c.stress    = clamp(c.stress    + 15, 0, 100);
          addPhoneMessage('Landlord', '⚠️ Your rent is overdue! Pay immediately or face eviction.');
        }
      }
    }

    // Pay loans weekly
    if (t.day % 7 === 0) {
      f.loans = f.loans.filter(loan => {
        if (t.day >= loan.dueDay) {
          if (f.cash >= loan.amount) {
            f.cash -= loan.amount;
            f.creditScore = clamp(f.creditScore + 10, 300, 850);
            addPhoneMessage('KD Bank', `✅ Loan of ₦${loan.amount.toLocaleString()} repaid. Credit score improved!`);
            return false;
          } else {
            c.health = clamp(c.health - 10, 0, 100);
            f.creditScore = clamp(f.creditScore - 20, 300, 850);
            addPhoneMessage('KD Bank', `⚠️ Loan overdue! ₦${loan.amount.toLocaleString()} still owed. Credit score dropped.`);
          }
        }
        return true;
      });
    }

    // Investment returns
    f.investments = f.investments.filter(inv => {
      if (t.day >= inv.returnDay) {
        const ret = Math.round(inv.amount * inv.returnMultiplier);
        f.cash += ret;
        f.totalEarned += ret;
        const profit = ret - inv.amount;
        addPhoneMessage('KD Bank', `📈 Investment returned ₦${ret.toLocaleString()} (profit: ₦${profit.toLocaleString()})!`);
        return false;
      }
      return true;
    });

    // Business revenue daily
    s.business.owned.forEach(biz => {
      const bizData = KD_DATA.businesses.find(b => b.id === biz.id);
      if (bizData) {
        const daily = Math.floor(bizData.dailyRevMax * (biz.level / 5) * (0.5 + Math.random() * 0.5));
        const expenses = Math.floor(daily * 0.4);
        const profit = daily - expenses;
        f.cash += profit;
        f.totalEarned += profit;
        s.business.totalRevenue += profit;
        biz.revenue = (biz.revenue || 0) + profit;
      }
    });

    // Social feed update
    updateSocialFeed();

    save();
    checkStatus();
    checkAchievements();
  }

  // ── Phone Messages ────────────────────────────────────────
  function addPhoneMessage(sender, text) {
    _state.phone.messages.unshift({
      id:     Date.now() + Math.random(),
      sender,
      text,
      time:   `Day ${_state.time.day}`,
      read:   false,
    });
    if (_state.phone.messages.length > 50) _state.phone.messages.pop();
    _state.phone.notifications.push({ type:'message', sender, time: Date.now() });
  }

  // ── Chat System ───────────────────────────────────────────
  function sendChat(contactName, text, fromPlayer = true) {
    const s = _state;
    let chat = s.phone.chats.find(c => c.name === contactName);
    if (!chat) {
      const contact = s.relationships.contacts.find(c => c.name === contactName);
      chat = {
        id: Date.now(),
        name: contactName,
        avatar: contact ? contact.icon : '👤',
        isGroup: false,
        messages: [],
        unread: 0,
      };
      s.phone.chats.push(chat);
    }
    chat.messages.push({
      from: fromPlayer ? s.character.name : contactName,
      text,
      time: `Day ${s.time.day}`,
      isMe: fromPlayer,
    });
    if (!fromPlayer) chat.unread = (chat.unread || 0) + 1;
    if (chat.messages.length > 100) chat.messages.shift();
    save();
  }

  function sendGroupChat(groupName, text, fromPlayer = true) {
    const s = _state;
    let group = s.phone.groups.find(g => g.name === groupName);
    if (!group) return;
    group.messages.push({
      from: fromPlayer ? s.character.name : group.members[Math.floor(Math.random() * group.members.length)],
      text,
      time: `Day ${s.time.day}`,
      isMe: fromPlayer,
    });
    if (!fromPlayer) group.unread = (group.unread || 0) + 1;
    if (group.messages.length > 100) group.messages.shift();
    save();
  }

  function createGroup(name, members) {
    const s = _state;
    if (s.phone.groups.find(g => g.name === name)) return;
    s.phone.groups.push({
      id: Date.now(),
      name,
      icon: '👥',
      members,
      messages: [],
      unread: 0,
    });
    sendGroupChat(name, `Welcome to ${name}! 🎉`, false);
    save();
  }

  // ── NPC auto-replies ──────────────────────────────────────
  const NPC_REPLIES = {
    Amina:   ['How are you doing? 😊','Hope KD is treating you well!','Let\'s hang out at the park soon!','I just got a new job! 🎉'],
    Chukwu:  ['Bro, we need to network more seriously!','Have you checked the job board lately?','Big moves happening in GRA this week.','Let\'s meet at the Business District.'],
    Fatima:  ['Are you studying? Don\'t slack! 📚','I just passed my exams! So happy!','The library at KD Poly is open today.','Knowledge is power, keep learning!'],
    Ibrahim: ['Lol you won\'t believe what happened today 😂','KD traffic today was something else!','Have you eaten? Try the suya on Zaria Road!','We should watch the match together tonight!'],
    Musa:    ['Any business opportunity? I\'m ready!','The market was crazy busy today.','I made ₦50k today from one deal! 🔥','Hustle hard, rest later!'],
    Blessing:['I just finished a new painting!','The KD arts scene is growing fast.','Come check my new boutique soon!','Creativity pays in Kaduna!'],
    Usman:   ['May Allah guide your steps today.','Patience brings great rewards, my friend.','The Friday sermon was powerful today.','Always remember your community.'],
    Ngozi:   ['I treated 20 patients today. Exhausting!','Health is wealth, take care of yourself.','The hospital got new equipment! 🏥','Have you had your checkup this year?'],
    Hauwa:   ['Subhanallah, what a beautiful day!','Ramadan preparation starts soon!','Come for tea and dates later 🫖','May your day be blessed!'],
    Kemi:    ['I was thinking about you today... 😊','Are you free this evening?','I saw something that reminded me of you.','You\'re different from other people I know.'],
    Danladi: ['KD roads are mad today!','I heard there\'s a business deal in Rigasa.','Don\'t trust everyone you meet in this city.','Stay sharp out there.'],
    Emeka:   ['Tech is the future bro, learn to code!','My startup just got its first client! 🚀','Kaduna tech scene is rising.','Let\'s collaborate on something.'],
  };

  function npcAutoReply(contactName) {
    const replies = NPC_REPLIES[contactName];
    if (!replies) return;
    setTimeout(() => {
      const reply = replies[Math.floor(Math.random() * replies.length)];
      sendChat(contactName, reply, false);
      addPhoneMessage(contactName, reply);
    }, 1500 + Math.random() * 2000);
  }

  // ── Social Feed ───────────────────────────────────────────
  function updateSocialFeed() {
    const posts = [
      '🏙️ Kaduna is moving forward! Big things happening in KD.',
      '☀️ Another beautiful morning in the heart of the north.',
      '🍲 Just had the best tuwo at Barnawa market. So good!',
      '🛺 Traffic on Ahmadu Bello Way today is terrible!',
      '⚡ NEPA took light again. Who else is suffering?',
      '🎉 Big naming ceremony on my street tonight. Come join!',
      '🏆 KD United won again! We move! 🔥',
      '🌧️ Rainy season is here in KD. Stay safe everyone.',
      '💼 Anybody with job connection in GRA should message me.',
      '🕌 Jumu\'ah Mubarak to all my KD brothers and sisters.',
      '📱 Just bought the new iPhone at Kaduna Mall. Dreams do come true!',
      '🌅 Watching the sunrise from Ungwan Rimi. KD is beautiful.',
    ];
    _state.phone.socialFeed.unshift({
      id:    Date.now(),
      text:  posts[Math.floor(Math.random() * posts.length)],
      likes: Math.floor(Math.random() * 200),
      time:  `Day ${_state.time.day}`,
    });
    if (_state.phone.socialFeed.length > 30) _state.phone.socialFeed.pop();
  }

  // ── Story Log ─────────────────────────────────────────────
  function addStoryEntry(text) {
    _state.story.entries.unshift({
      day:  _state.time.day,
      text,
      time: new Date().toLocaleDateString(),
    });
    if (_state.story.entries.length > 100) _state.story.entries.pop();
  }

  function addMilestone(trigger, vars) {
    const tpl = KD_DATA.storyMilestones.find(m => m.trigger === trigger);
    if (!tpl) return;
    if (_state.story.milestones.find(m => m.trigger === trigger)) return; // once only
    let text = tpl.text;
    if (vars) Object.keys(vars).forEach(k => { text = text.replace('{'+k+'}', vars[k]); });
    _state.story.milestones.push({ trigger, text, day: _state.time.day });
    addStoryEntry('🏆 ' + text);
    addPhoneMessage('KD Life', `🌟 Milestone: ${text}`);
  }

  // ── Status Checks ─────────────────────────────────────────
  function checkStatus() {
    const c = _state.character;
    if (c.health <= 0 && !_state.meta.gameOver) {
      _state.meta.gameOver = true;
      if (typeof UI !== 'undefined') {
        UI.showModal('💀', 'Game Over',
          `${c.name} has passed away after ${_state.time.day} days in Kaduna.\n\nYour KD Life story:\n${_state.story.milestones.map(m => '• ' + m.text).join('\n') || 'Just getting started...'}`,
          true);
      }
    }
  }

  // ── Achievements Check ────────────────────────────────────
  function checkAchievements() {
    KD_DATA.achievements.forEach(ach => {
      if (_state.achievements.includes(ach.id)) return;
      try {
        if (ach.check(_state)) {
          _state.achievements.push(ach.id);
          if (typeof UI !== 'undefined') {
            UI.notify(`🏆 Achievement Unlocked: ${ach.icon} ${ach.title}!`);
          }
          addStoryEntry(`🏆 Achievement: ${ach.title} — ${ach.desc}`);
          addMilestone(ach.id, {});
        }
      } catch(e) {}
    });
  }

  // ── Relationship ──────────────────────────────────────────
  function addContact(name, icon, type = 'friend') {
    const existing = _state.relationships.contacts.find(r => r.name === name);
    if (existing) {
      existing.level = clamp(existing.level + 10, 0, 100);
      existing.days++;
    } else {
      _state.relationships.contacts.push({ name, icon, type, level: 20, days: 1 });
      // Auto-create chat thread
      sendChat(name, `Hey ${_state.character.name}! Nice to meet you 👋`, false);
      addPhoneMessage(name, `👋 Hey ${_state.character.name}! Nice to meet you. Let's keep in touch.`);
    }
    apply({ happiness: 5 });
    save();
  }

  // ── Save / Load ───────────────────────────────────────────
  function save() {
    _state.meta.lastPlayed = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(_state));
  }

  function load() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;
    try {
      _state = JSON.parse(saved);
      return true;
    } catch(e) {
      return false;
    }
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    _state = createDefault();
  }

  // ── Helpers ───────────────────────────────────────────────
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function getTrait() { return KD_DATA.traits.find(t => t.id === _state.character.trait); }

  function getCareerData() {
    if (!_state.career.currentJob) return null;
    const c = KD_DATA.careers.find(c => c.id === _state.career.currentJob);
    if (!c) return null;
    return { ...c, currentLevel: c.levels[Math.min(_state.career.jobLevel - 1, c.levels.length - 1)] };
  }

  function getHousingData() {
    return KD_DATA.housing.find(h => h.id === _state.housing.current);
  }

  function totalWealth() {
    const s = _state;
    let w = s.finance.cash + s.finance.savings;
    s.housing.owned.forEach(id => {
      const h = KD_DATA.housing.find(hh => hh.id === id);
      if (h) w += h.buyPrice;
    });
    s.transport.owned.forEach(id => {
      const v = KD_DATA.vehicles.find(vv => vv.id === id);
      if (v) w += Math.round(v.price * 0.7);
    });
    return w;
  }

  // ── Public ────────────────────────────────────────────────
  return {
    get, getChar, getFinance, getCareer, getHousing, getRelations, getTime, getStory,
    initCharacter, apply, dailyTick, save, load, reset,
    addPhoneMessage, addStoryEntry, addMilestone, addContact,
    sendChat, sendGroupChat, createGroup, npcAutoReply,
    checkAchievements, getTrait, getCareerData, getHousingData, totalWealth,
    clamp,
  };

})();
