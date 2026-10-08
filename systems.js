// ═══════════════════════════════════════════════════════════
//  KD LIFE — Game Systems
//  All action handlers for every location and interaction
// ═══════════════════════════════════════════════════════════

const Systems = (() => {

  // ── Helpers ───────────────────────────────────────────────
  function log(msg)   { if (typeof UI !== 'undefined') UI.logLoc(msg); }
  function notify(msg){ if (typeof UI !== 'undefined') UI.notify(msg); }
  function modal(icon, title, text) { if (typeof UI !== 'undefined') UI.showModal(icon, title, text); }
  function clamp(v,mn,mx){ return Math.max(mn, Math.min(mx, v)); }

  // ── HOME ACTIONS ──────────────────────────────────────────
  function sleepHome() {
    const s = GameState.get();
    const furniture = s.housing.furniture;
    const hasBed = furniture.includes('bed');
    const hasAC  = furniture.includes('ac');
    const bonus  = (hasBed ? 15 : 0) + (hasAC ? 10 : 0);

    GameState.apply({ energy: 100, health: 5 + bonus * 0.1, happiness: 5 });
    s.character.stress = clamp(s.character.stress - 20, 0, 100);
    s.career.workStreak = 0;
    GameState.dailyTick();
    log('😴 You had a full night\'s rest.' + (hasBed ? ' Your good bed helped!' : '') + ' Next day begins.');
    notify('📅 Day ' + s.time.day + ' in Kaduna!');
    UI.updateHUD();
    triggerRandomEvent(0.3);
  }

  function watchTv() {
    const hasTv = GameState.get().housing.furniture.includes('tv');
    if (!hasTv) { log('📺 You don\'t have a TV. Buy one at Kaduna Mall.'); return; }
    GameState.apply({ energy: -5, happiness: 20 });
    log('📺 Watched Kannywood and NTA. Entertained!');
  }

  function readBook() {
    GameState.apply({ skill: 5, energy: -10, happiness: 8 });
    log('📖 Read a book. Knowledge grows step by step!');
  }

  function cookMeal() {
    const s = GameState.get();
    if (s.finance.cash < 400) { log('💸 Need ₦400 for ingredients.'); return; }
    const hasFridge = s.housing.furniture.includes('fridge');
    GameState.apply({ money: -400, health: 15, energy: 15, happiness: 10 });
    s.inventory.food = clamp(s.inventory.food + 30, 0, 100);
    log('🍲 Cooked a delicious KD meal!' + (hasFridge ? ' Stored extras in fridge.' : ''));
    GameState.save();
  }

  function manageHome() {
    const s   = GameState.get();
    const hd  = GameState.getHousingData();
    const own = s.housing.owned.includes(s.housing.current);
    modal('🏠', 'Your Home — ' + hd.label,
      `Location: ${s.housing.current === 'hostel' ? 'Student Hostel' : 'Kaduna'}\n` +
      `Status: ${own ? '✅ Owned' : '🔑 Renting (₦' + hd.rent.toLocaleString() + '/month)'}\n` +
      `Comfort: ${hd.comfort}% | Security: ${hd.security}%\n` +
      `Furniture: ${s.housing.furniture.length === 0 ? 'None' : s.housing.furniture.join(', ')}\n` +
      `Electricity: ${s.housing.hasElec ? '✅' : '❌'} | Water: ${s.housing.hasWater ? '✅' : '❌'}`
    );
  }

  // ── MARKET ACTIONS ────────────────────────────────────────
  function buyFood() {
    const s = GameState.get();
    if (s.finance.cash < 300) { log('💸 Need ₦300 for food.'); return; }
    GameState.apply({ money: -300, health: 10, energy: 10 });
    s.inventory.food = clamp(s.inventory.food + 40, 0, 100);
    log('🛍️ Bought a week\'s supply of food at the market!');
    GameState.save();
  }

  function findWorkMarket() {
    const s = GameState.get();
    GameState.apply({ energy: -15 });
    if (s.character.skill < 5) { log('😔 Too unskilled for casual work. Try school first.'); return; }
    const pay = 500 + Math.floor(s.character.skill * 15);
    GameState.apply({ money: pay, happiness: 5 });
    log(`🤝 Did a casual job at the market. Earned ₦${pay.toLocaleString()}!`);
  }

  function sellItems() {
    const s = GameState.get();
    if (s.inventory.clothes.length === 0) { log('🎒 Nothing to sell.'); return; }
    const earned = s.inventory.clothes.length * 2000;
    GameState.apply({ money: earned, happiness: 5 });
    s.inventory.clothes = [];
    log(`📦 Sold old clothes. Earned ₦${earned.toLocaleString()}!`);
    GameState.save();
  }

  function chatTraders() {
    GameState.apply({ happiness: 10, energy: -5, reputation: 2 });
    GameState.addContact('Musa', '👨🏾', 'contact');
    log('💬 Chatted with traders. New contact: Musa the Hustler!');
  }

  function openStall() {
    const s = GameState.get();
    if (s.finance.cash < 5000) { log('💸 Need ₦5,000 start-up capital for a stall.'); return; }
    if (s.career.currentJob) { log('💼 Quit your current job first.'); return; }
    GameState.apply({ money: -5000, energy: -30 });
    s.career.currentJob = 'vendor';
    s.career.jobLevel   = 1;
    s.career.daysAtJob  = 0;
    GameState.addStoryEntry('Started as a Market Vendor at Kaduna Market.');
    GameState.addMilestone('firstJob', { job: 'Market Vendor' });
    log('🏪 You opened your market stall! Welcome to business.');
    notify('✅ You are now a Market Vendor!');
    GameState.save();
  }

  // ── SCHOOL ACTIONS ────────────────────────────────────────
  function attendClass() {
    const s = GameState.get();
    const course = s.education.current;
    if (!course) { log('📚 You are not enrolled. Enrol in a course first!'); return; }
    if (s.finance.cash < 500) { log('💸 Need ₦500 for today\'s session fees.'); return; }
    const tr = GameState.getTrait();
    const bonus = tr && tr.bonus.studyBonus ? tr.bonus.studyBonus : 0;
    const gain  = Math.round(8 * (1 + bonus));
    GameState.apply({ money: -500, skill: gain, energy: -25, happiness: 5 });
    s.education.courseDay++;
    const ed = KD_DATA.education.find(e => e.id === course);
    if (ed && s.education.courseDay >= ed.duration * 7) {
      graduateCourse();
    } else {
      log(`📚 Attended class. Skill +${gain}. ${ed ? (ed.duration * 7 - s.education.courseDay) + ' sessions left.' : ''}`);
    }
    GameState.save();
  }

  function selfStudy() {
    const tr   = GameState.getTrait();
    const bonus = tr && tr.bonus.studyBonus ? tr.bonus.studyBonus : 0;
    const gain  = Math.round(3 * (1 + bonus));
    GameState.apply({ skill: gain, energy: -15, happiness: 3 });
    log(`📝 Self-studied. Skill +${gain}. Every bit counts!`);
  }

  function makeFriends() {
    GameState.apply({ happiness: 15, energy: -10 });
    const names = ['Fatima','Chukwu','Ibrahim','Blessing'];
    const n = names[Math.floor(Math.random() * names.length)];
    GameState.addContact(n, '👩🏾', 'friend');
    log(`🤝 Made a new friend: ${n}!`);
  }

  function takeExam() {
    const s = GameState.get();
    const minSkill = 20;
    if (s.character.skill < minSkill) {
      GameState.apply({ happiness: -15 });
      log('📝 Failed the exam. Study more — you need at least 20 skill.');
      GameState.addPhoneMessage('School', '❌ You failed your exam. Keep studying!');
      return;
    }
    const score = Math.min(100, Math.round(s.character.skill * 0.8 + Math.random() * 20));
    GameState.apply({ skill: 10, happiness: 25 });
    s.education.gpa = score;
    log(`🏆 Passed the exam! Score: ${score}/100. Great result!`);
    GameState.addPhoneMessage('School', `✅ Exam result: ${score}/100. Congratulations!`);
    GameState.save();
  }

  function checkResults() {
    const s = GameState.get();
    log(`📊 Your GPA: ${s.education.gpa}/100 | Degrees: ${s.education.degrees.length} | Current course: ${s.education.current || 'None'}`);
  }

  function enrollCourse(courseId) {
    const s  = GameState.get();
    const ed = KD_DATA.education.find(e => e.id === courseId);
    if (!ed) { notify('❌ Course not found.'); return; }
    if (ed.req && !s.education.degrees.includes(ed.req)) {
      notify(`❌ You need ${ed.req.toUpperCase()} first.`); return;
    }
    if (s.finance.cash < ed.cost) {
      notify(`💸 Need ₦${ed.cost.toLocaleString()} to enrol.`); return;
    }
    // Scholarship check
    const schol = Math.random() < 0.1;
    const cost  = schol ? Math.round(ed.cost * 0.5) : ed.cost;
    GameState.apply({ money: -cost });
    s.education.current  = courseId;
    s.education.courseDay = 0;
    s.education.studying  = true;
    if (schol) notify('🎓 You got a partial scholarship! 50% discount!');
    GameState.addStoryEntry(`Enrolled in ${ed.label} at KD.`);
    log(`📚 Enrolled in ${ed.label}. Cost: ₦${cost.toLocaleString()}. Duration: ${ed.duration} weeks.`);
    GameState.save();
  }

  function graduateCourse() {
    const s  = GameState.get();
    const ed = KD_DATA.education.find(e => e.id === s.education.current);
    if (!ed) return;
    s.education.degrees.push(ed.id);
    s.education.current  = null;
    s.education.studying  = false;
    GameState.apply({ skill: ed.skillGain, happiness: 40, reputation: 10 });
    GameState.addMilestone('graduated', { degree: ed.degree });
    modal('🎓', 'Congratulations Graduate!',
      `You completed ${ed.label} and earned your ${ed.degree}!\n\nSkill gained: +${ed.skillGain}\nThis opens new career opportunities in Kaduna!`);
    GameState.addPhoneMessage('KD Education', `🎓 Congratulations! You earned your ${ed.degree}. New doors are open!`);
    GameState.save();
  }

  function attendLecture() { attendClass(); }

  function studyHard() {
    GameState.apply({ skill: 8, energy: -25, happiness: 5 });
    log('📚 Studied intensively. Your knowledge is growing!');
  }

  function doInternship() {
    const s = GameState.get();
    if (s.character.skill < 20) { log('🧠 Need more skill for internship.'); return; }
    const pay = 5000 + Math.floor(s.character.skill * 50);
    GameState.apply({ money: pay, skill: 15, energy: -30, reputation: 5 });
    log(`💼 Completed internship! Earned ₦${pay.toLocaleString()} and gained experience.`);
  }

  function campusSocial() {
    GameState.apply({ happiness: 20, energy: -10 });
    const names = ['Fatima','Chukwu','Ngozi','Blessing'];
    const n = names[Math.floor(Math.random() * names.length)];
    GameState.addContact(n, '👩🏾', 'friend');
    log(`🎉 Campus social event. Met ${n}. Fun times in KD!`);
  }

  function graduate() {
    const s = GameState.get();
    if (!s.education.current) { log('📚 You are not enrolled in any course.'); return; }
    const ed = KD_DATA.education.find(e => e.id === s.education.current);
    if (s.education.courseDay < ed.duration * 3) {
      log(`⏳ Still ${ed.duration * 7 - s.education.courseDay} sessions remaining.`); return;
    }
    graduateCourse();
  }

  // ── HOSPITAL ACTIONS ──────────────────────────────────────
  function getTreatment() {
    const s = GameState.get();
    const ins = s.health.hasInsurance;
    const cost = ins ? 500 : 5000;
    if (s.finance.cash < cost) { log(`💸 Need ₦${cost.toLocaleString()} for treatment.`); return; }
    GameState.apply({ money: -cost, health: 50 });
    s.health.conditions = [];
    log(`💊 Full treatment received! Health +50. Cost: ₦${cost.toLocaleString()}${ins ? ' (insured)' : ''}`);
    GameState.save();
  }

  function checkup() {
    const s = GameState.get();
    if (s.finance.cash < 500) { log('💸 Need ₦500 for checkup.'); return; }
    GameState.apply({ money: -500, health: 10 });
    s.health.lastCheckup = s.time.day;
    const status = s.character.health > 70 ? 'Good' : s.character.health > 40 ? 'Fair' : 'Poor';
    log(`🩺 Checkup complete. Health status: ${status}. Keep taking care of yourself!`);
  }

  function vaccinate() {
    const s = GameState.get();
    if (s.finance.cash < 300) { log('💸 Need ₦300.'); return; }
    GameState.apply({ money: -300, health: 20 });
    log('💉 Vaccinated! Protected against seasonal diseases in KD.');
  }

  function mentalHealth() {
    const s = GameState.get();
    if (s.finance.cash < 3000) { log('💸 Need ₦3,000 for therapy session.'); return; }
    GameState.apply({ money: -3000, happiness: 25 });
    s.character.stress      = clamp(s.character.stress - 30, 0, 100);
    s.character.mentalHealth = clamp(s.character.mentalHealth + 25, 0, 100);
    log('🧠 Therapy session complete. You feel so much clearer and calmer.');
  }

  function fitnessTest() {
    const s = GameState.get();
    if (s.finance.cash < 500) { log('💸 Need ₦500.'); return; }
    GameState.apply({ money: -500, health: 5 });
    s.health.fitnessLevel = clamp(s.health.fitnessLevel + 5, 0, 100);
    log(`🏃 Fitness level: ${s.health.fitnessLevel}/100. ${s.health.fitnessLevel > 60 ? 'Looking fit!' : 'Keep exercising!'}`);
  }

  function buyInsurance() {
    const s = GameState.get();
    if (s.finance.cash < 10000) { log('💸 Need ₦10,000 for insurance.'); return; }
    GameState.apply({ money: -10000 });
    s.health.hasInsurance = true;
    GameState.addPhoneMessage('KD Insurance', '✅ Health insurance activated! Enjoy reduced medical costs.');
    log('🛡️ Health insurance activated! Medical bills now discounted.');
    GameState.save();
  }

  // ── CAREER / OFFICE ACTIONS ───────────────────────────────
  function applyJob() {
    UI.showJobPanel();
  }

  function doWork() {
    const s  = GameState.get();
    const cd = GameState.getCareerData();
    if (!cd) { log('❌ You have no job. Find one first!'); return; }
    const lv = cd.currentLevel;
    if (s.character.energy < lv.energy) { log('😴 Too tired to work! Rest first.'); return; }
    const tr     = GameState.getTrait();
    const bonus  = tr && tr.bonus.workBonus ? tr.bonus.workBonus : 0;
    const pay    = Math.round(lv.pay * (1 + bonus));
    const perfGain = 2 + Math.floor(Math.random() * 5);
    GameState.apply({ money: pay, energy: -lv.energy, happiness: 5, reputation: 1 });
    s.career.performance = clamp(s.career.performance + perfGain, 0, 100);
    s.career.daysAtJob++;
    s.career.workStreak++;
    s.finance.salary = pay;

    // Promotion check
    checkPromotion();

    log(`💼 Work done as ${lv.title}. Earned ₦${pay.toLocaleString()}. Performance: ${s.career.performance}%`);
    GameState.addStoryEntry(`Worked as ${lv.title}. Earned ₦${pay.toLocaleString()}.`);
    GameState.save();
  }

  function checkPromotion() {
    const s  = GameState.get();
    const cd = GameState.getCareerData();
    if (!cd) return;
    const nextLv = cd.levels[s.career.jobLevel];
    if (!nextLv) return;
    if (s.career.performance >= 80 && s.character.skill >= nextLv.skillReq && s.career.daysAtJob >= 30) {
      s.career.jobLevel++;
      s.career.performance = 50;
      s.career.daysAtJob   = 0;
      const newTitle = cd.levels[s.career.jobLevel - 1].title;
      GameState.apply({ happiness: 40, money: 10000, reputation: 10 });
      GameState.addMilestone('promoted', { title: newTitle });
      notify(`🎉 PROMOTED to ${newTitle}!`);
      GameState.addPhoneMessage('HR Dept', `🎉 Congratulations! You have been promoted to ${newTitle}. New salary: ₦${cd.levels[s.career.jobLevel-1].pay.toLocaleString()}/day.`);
      GameState.save();
    }
  }

  function askRaise() {
    const s  = GameState.get();
    const cd = GameState.getCareerData();
    if (!cd) { log('❌ No job.'); return; }
    if (s.career.performance < 70) { log('😔 Performance too low for a raise. Work harder!'); return; }
    if (Math.random() > 0.4) {
      GameState.apply({ happiness: 25, reputation: 5 });
      s.finance.salary = Math.round(s.finance.salary * 1.15);
      log('📈 Raise approved! Salary up 15%. Your boss likes your work!');
      GameState.addPhoneMessage('HR Dept', '✅ Your raise has been approved. Keep up the good work!');
    } else {
      GameState.apply({ happiness: -10 });
      log('😔 Raise denied this time. Improve performance and try again.');
    }
    GameState.save();
  }

  function network() {
    GameState.apply({ happiness: 10, energy: -15, reputation: 5 });
    const names = ['Chukwu','Emeka','Danladi'];
    const n = names[Math.floor(Math.random() * names.length)];
    GameState.addContact(n, '👨🏾', 'contact');
    log(`🤝 Networked professionally in GRA. New contact: ${n}!`);
  }

  function getCertified() {
    const s = GameState.get();
    if (s.finance.cash < 20000) { log('💸 Need ₦20,000 for certification course.'); return; }
    GameState.apply({ money: -20000, skill: 20, reputation: 10 });
    s.career.certifications.push('Professional Certificate');
    log('📜 Earned a professional certificate! Your career prospects just improved.');
    GameState.save();
  }

  function takeJob(careerId, level = 1) {
    const s  = GameState.get();
    const cd = KD_DATA.careers.find(c => c.id === careerId);
    if (!cd) return;
    const lv = cd.levels[level - 1];
    if (s.character.skill < lv.skillReq) { notify(`❌ Need ${lv.skillReq} skill for this job.`); return; }
    s.career.currentJob  = careerId;
    s.career.jobLevel    = level;
    s.career.daysAtJob   = 0;
    s.career.performance = 50;
    s.finance.salary     = lv.pay;
    GameState.addStoryEntry(`Got a job as ${lv.title}.`);
    GameState.addMilestone('firstJob', { job: lv.title });
    notify(`✅ You are now a ${lv.title}! Salary: ₦${lv.pay.toLocaleString()}/day`);
    GameState.addPhoneMessage('HR Dept', `✅ Welcome to the team as ${lv.title}! Report to work daily for ₦${lv.pay.toLocaleString()}.`);
    GameState.save();
  }

  function quitJob() {
    const s  = GameState.get();
    const cd = GameState.getCareerData();
    if (!cd) return;
    const title = cd.currentLevel.title;
    s.career.currentJob  = null;
    s.career.jobLevel    = 1;
    s.career.workStreak  = 0;
    GameState.apply({ happiness: -10 });
    GameState.addStoryEntry(`Resigned from ${title}.`);
    notify('You resigned from your job.');
    GameState.save();
  }

  // ── BANK ACTIONS ──────────────────────────────────────────
  function checkBalance() {
    const f = GameState.getFinance();
    const activeLoan = f.loans.reduce((sum, l) => sum + l.amount, 0);
    log(`💰 Cash: ₦${f.cash.toLocaleString()} | Savings: ₦${f.savings.toLocaleString()} | Loans: ₦${activeLoan.toLocaleString()} | Credit: ${f.creditScore}`);
  }

  function transferMoney() {
    const f = GameState.getFinance();
    if (f.cash < 1000) { log('💸 Not enough to transfer.'); return; }
    const amt = 1000;
    f.cash    -= amt;
    f.savings += amt;
    log(`💸 Moved ₦${amt.toLocaleString()} to savings. Total savings: ₦${f.savings.toLocaleString()}`);
    GameState.save();
  }

  function invest() {
    const s = GameState.get();
    const f = s.finance;
    if (f.cash < 10000) { log('💸 Need ₦10,000 to invest.'); return; }
    const amount = 10000;
    const days   = 14 + Math.floor(Math.random() * 7);
    const mult   = 1.1 + Math.random() * 0.3;
    f.cash -= amount;
    f.investments.push({ amount, returnDay: s.time.day + days, returnMultiplier: mult });
    f.creditScore = clamp(f.creditScore + 5, 300, 850);
    log(`📈 ₦${amount.toLocaleString()} invested. Returns in ${days} days at ${((mult-1)*100).toFixed(0)}% rate.`);
    GameState.addPhoneMessage('KD Bank', `📈 Investment of ₦${amount.toLocaleString()} confirmed. Returns in ${days} days.`);
    GameState.save();
  }

  function takeLoan() {
    const s = GameState.get();
    const f = s.finance;
    if (f.creditScore < 400) { log('❌ Credit score too low for a loan. Improve it first.'); return; }
    const amount    = 50000;
    const interest  = 0.1;
    const owed      = Math.round(amount * (1 + interest));
    const dueDay    = s.time.day + 30;
    f.cash += amount;
    f.loans.push({ amount: owed, dueDay });
    f.creditScore = clamp(f.creditScore - 10, 300, 850);
    log(`🏦 Loan of ₦${amount.toLocaleString()} approved. Repay ₦${owed.toLocaleString()} within 30 days.`);
    GameState.addPhoneMessage('KD Bank', `🏦 Loan of ₦${amount.toLocaleString()} disbursed. ₦${owed.toLocaleString()} due on Day ${dueDay}.`);
    GameState.save();
  }

  function checkCredit() {
    const f = GameState.getFinance();
    const rating = f.creditScore >= 750 ? 'Excellent' : f.creditScore >= 650 ? 'Good' : f.creditScore >= 550 ? 'Fair' : 'Poor';
    log(`📊 Credit Score: ${f.creditScore}/850 (${rating}). Repay loans on time to improve it.`);
  }

  // ── PARK ACTIONS ──────────────────────────────────────────
  function takeWalk() {
    GameState.apply({ health: 8, energy: -10, happiness: 15 });
    log('🚶 Walked around Lugard Hall Park. The fresh air is refreshing!');
  }

  function meetSomeone() {
    const person = KD_DATA.npcs[Math.floor(Math.random() * KD_DATA.npcs.length)];
    GameState.addContact(person.name, person.icon, 'friend');
    GameState.apply({ happiness: 20, energy: -10 });
    log(`💑 Met ${person.name} at the park! They seem ${person.trait}.`);
  }

  function enjoyMusic() {
    GameState.apply({ happiness: 25, energy: -5 });
    log('🎵 Live afrobeats at Lugard Hall Park. KD knows how to vibe!');
  }

  function exercise() {
    const s = GameState.get();
    GameState.apply({ health: 15, energy: -25, happiness: 10 });
    s.health.fitnessLevel = clamp(s.health.fitnessLevel + 8, 0, 100);
    s.character.stress    = clamp(s.character.stress - 10, 0, 100);
    log('🏃 Great workout session! Health and fitness improving.');
    GameState.save();
  }

  function communityEvent() {
    GameState.apply({ happiness: 20, reputation: 5, energy: -10 });
    log('🤝 Participated in a community event in KD. Your reputation grew!');
  }

  // ── MALL ACTIONS ──────────────────────────────────────────
  function buyClothes() { UI.showShopPanel('clothes'); }
  function buyPhone()   { UI.showShopPanel('phones'); }
  function buyGift()    { UI.showShopPanel('gifts'); }

  function foodCourt() {
    const s = GameState.get();
    if (s.finance.cash < 2000) { log('💸 Need ₦2,000 for the food court.'); return; }
    GameState.apply({ money: -2000, health: 15, energy: 20, happiness: 15 });
    log('🍽️ Had a great meal at Kaduna Mall food court!');
  }

  function mallEntertain() {
    const s = GameState.get();
    if (s.finance.cash < 3000) { log('💸 Need ₦3,000.'); return; }
    GameState.apply({ money: -3000, happiness: 30, energy: -5 });
    log('🎮 Cinema + arcade at KD Mall. Great day out!');
  }

  function purchaseItem(category, itemId) {
    const s   = GameState.get();
    const item = KD_DATA.shop[category]?.find(i => i.id === itemId);
    if (!item) return;
    if (s.finance.cash < item.price) { notify(`💸 Need ₦${item.price.toLocaleString()}.`); return; }
    GameState.apply({ money: -item.price });
    if (category === 'clothes') {
      s.inventory.clothes.push(item.id);
      if (item.prestige) GameState.apply({ reputation: Math.floor(item.prestige / 10) });
      if (item.happiness) GameState.apply({ happiness: item.happiness });
    } else if (category === 'phones') {
      s.inventory.phone = item.id;
      GameState.apply({ happiness: 20, reputation: item.prestige });
    } else if (category === 'food') {
      s.inventory.food = clamp(s.inventory.food + 40, 0, 100);
      if (item.energy) GameState.apply({ energy: item.energy });
      if (item.health) GameState.apply({ health: item.health });
    } else if (category === 'gifts') {
      s.inventory.gifts.push(item.id);
    }
    notify(`✅ Bought ${item.label}!`);
    GameState.addStoryEntry(`Bought ${item.label} for ₦${item.price.toLocaleString()}.`);
    GameState.save();
    UI.closePanel('shopPanel');
  }

  // ── MOSQUE/CHURCH ─────────────────────────────────────────
  function pray() {
    const s = GameState.get();
    GameState.apply({ happiness: 25, health: 8, energy: 15 });
    s.character.stress = clamp(s.character.stress - 15, 0, 100);
    s.character.mentalHealth = clamp(s.character.mentalHealth + 15, 0, 100);
    log('🤲 You prayed. Your heart and mind feel at peace. Alhamdulillah.');
    GameState.save();
  }

  function seekGuidance() {
    GameState.apply({ happiness: 15, skill: 5, reputation: 3 });
    log('📿 The spiritual leader gave you wise counsel. You feel guided.');
  }

  function meetCommunity() {
    GameState.apply({ happiness: 20, reputation: 5, energy: -5 });
    GameState.addContact('Hauwa', '👩🏿', 'friend');
    GameState.addContact('Usman', '👨🏿', 'mentor');
    log('🤝 Met wonderful community members. New contacts added!');
  }

  function quranStudy() {
    GameState.apply({ happiness: 15, skill: 3, energy: -10 });
    log('📖 Quran study session. Knowledge and peace in the same package.');
  }

  // ── NIGHTSPOT ─────────────────────────────────────────────
  function partyHard() {
    const s = GameState.get();
    if (s.finance.cash < 2000) { log('💸 Need ₦2,000 for a proper night out.'); return; }
    GameState.apply({ money: -2000, happiness: 35, energy: -40, health: -10 });
    log('🎉 Partied hard in KD! Great time but you\'ll feel it tomorrow...');
  }

  function meetPeople() {
    const person = KD_DATA.npcs[Math.floor(Math.random() * KD_DATA.npcs.length)];
    GameState.addContact(person.name, person.icon, Math.random() > 0.5 ? 'friend' : 'romantic');
    GameState.apply({ happiness: 20, energy: -15 });
    log(`💬 Met ${person.name} tonight. Interesting ${person.trait} person!`);
  }

  function liveMusic() {
    const s = GameState.get();
    if (s.finance.cash < 1000) { log('💸 Cover charge ₦1,000.'); return; }
    GameState.apply({ money: -1000, happiness: 30, energy: -10 });
    log('🎵 Amazing live music! KD nightlife doesn\'t miss!');
  }

  function buyDrinks() {
    const s = GameState.get();
    if (s.finance.cash < 500) { log('💸 Need ₦500.'); return; }
    GameState.apply({ money: -500, happiness: 15, health: -5 });
    log('🍻 Bought drinks. Good vibes tonight!');
  }

  // ── MOTOR PARK ────────────────────────────────────────────
  function takeKeke() {
    const s = GameState.get();
    if (s.finance.cash < 150) { log('💸 Need ₦150 for keke fare.'); return; }
    GameState.apply({ money: -150, energy: 5, happiness: 5 });
    log('🛺 Took a keke to your destination. KD transport!');
  }

  function takeBus() {
    const s = GameState.get();
    if (s.finance.cash < 200) { log('💸 Need ₦200.'); return; }
    GameState.apply({ money: -200, energy: -5 });
    log('🚌 Took the bus across KD. Busy as usual!');
  }

  function findTransport() {
    log('🚕 Found a reliable transport contact for daily commute.');
    GameState.apply({ happiness: 5 });
  }

  function vehicleRepair() {
    const s = GameState.get();
    if (s.transport.owned.length === 0) { log('🚗 You don\'t own a vehicle.'); return; }
    if (s.finance.cash < 5000) { log('💸 Need ₦5,000 for repairs.'); return; }
    GameState.apply({ money: -5000 });
    s.transport.fuelLevel = 100;
    log('🔧 Vehicle fully repaired and fuelled. Ready to roll!');
    GameState.save();
  }

  // ── REAL ESTATE ───────────────────────────────────────────
  function rentPlace() { UI.showHousingPanel('rent'); }
  function buyProperty() { UI.showHousingPanel('buy'); }

  function upgradeHousing(housingId, action) {
    const s   = GameState.get();
    const hd  = KD_DATA.housing.find(h => h.id === housingId);
    if (!hd) return;

    if (action === 'rent') {
      if (s.finance.cash < hd.rent) { notify(`💸 Need ₦${hd.rent.toLocaleString()} for first month's rent.`); return; }
      GameState.apply({ money: -hd.rent });
      s.housing.current          = housingId;
      s.finance.bills.rent       = hd.rent;
      s.housing.rentDue          = s.time.day + 30;
      GameState.addStoryEntry(`Moved into a ${hd.label}.`);
      notify(`✅ Moved into ${hd.label}!`);
    } else if (action === 'buy') {
      if (s.finance.cash < hd.buyPrice) { notify(`💸 Need ₦${hd.buyPrice.toLocaleString()} to buy.`); return; }
      GameState.apply({ money: -hd.buyPrice });
      s.housing.current       = housingId;
      s.housing.owned.push(housingId);
      s.finance.bills.rent    = 0;
      GameState.addMilestone('firstHouse', { house: hd.label });
      GameState.addStoryEntry(`Bought ${hd.label} — first property!`);
      notify(`🏠 Congratulations! You own ${hd.label}!`);
    }

    GameState.apply({ happiness: 20 + hd.prestige / 5 });
    GameState.save();
    UI.closePanel('housingPanel');
  }

  function renovateHome() {
    const s = GameState.get();
    if (s.finance.cash < 50000) { log('💸 Need ₦50,000 to renovate.'); return; }
    GameState.apply({ money: -50000, happiness: 20 });
    log('🔧 Home renovated! Fresh paint, new fittings. Looking good!');
  }

  function buyFurniture() { UI.showFurniturePanel(); }

  function purchaseFurniture(itemId) {
    const s    = GameState.get();
    const item = KD_DATA.furniture.find(f => f.id === itemId);
    if (!item) return;
    if (s.housing.furniture.includes(itemId)) { notify('Already own this!'); return; }
    if (s.finance.cash < item.price) { notify(`💸 Need ₦${item.price.toLocaleString()}.`); return; }
    GameState.apply({ money: -item.price });
    s.housing.furniture.push(itemId);
    if (item.effect.happyBonus)  GameState.apply({ happiness: item.effect.happyBonus });
    if (item.effect.energyBonus) GameState.apply({ energy: item.effect.energyBonus });
    if (item.effect.healthBonus) GameState.apply({ health: item.effect.healthBonus });
    notify(`✅ Bought ${item.label}!`);
    GameState.save();
    UI.closePanel('furniturePanel');
  }

  // ── BUSINESS CENTRE ───────────────────────────────────────
  function startBusiness() { UI.showBusinessPanel(); }

  function launchBusiness(bizId) {
    const s   = GameState.get();
    const biz = KD_DATA.businesses.find(b => b.id === bizId);
    if (!biz) return;
    if (s.finance.cash < biz.startCost) {
      notify(`💸 Need ₦${biz.startCost.toLocaleString()} to start this business.`); return;
    }
    GameState.apply({ money: -biz.startCost });
    s.business.owned.push({ id: bizId, name: biz.label, level: 1, employees: 0, revenue: 0, day: s.time.day });
    GameState.addMilestone('startedBiz', { business: biz.label });
    GameState.addStoryEntry(`Started ${biz.label} business.`);
    notify(`🏭 ${biz.label} launched! Check back daily for revenue.`);
    GameState.addPhoneMessage('Business', `🏭 Your ${biz.label} is open! Daily revenue will start flowing in.`);
    GameState.save();
    UI.closePanel('businessPanel');
  }

  function manageBusiness() {
    const s = GameState.get();
    if (s.business.owned.length === 0) { log('🏭 You don\'t own a business yet.'); return; }
    const lines = s.business.owned.map(b => `${b.name}: Level ${b.level}, Revenue ₦${(b.revenue||0).toLocaleString()}`);
    log('📊 Businesses:\n' + lines.join('\n'));
  }

  function hireStaff() {
    const s = GameState.get();
    if (s.business.owned.length === 0) { log('🏭 Start a business first.'); return; }
    if (s.finance.cash < 20000) { log('💸 Need ₦20,000 to hire.'); return; }
    const biz = s.business.owned[0];
    const bizData = KD_DATA.businesses.find(b => b.id === biz.id);
    if (biz.employees >= bizData.employeesMax) { log('👥 Already at max staff.'); return; }
    GameState.apply({ money: -20000 });
    biz.employees++;
    log(`👥 Hired a new employee for ${biz.name}! Revenue will increase.`);
    GameState.save();
  }

  function expandBusiness() {
    const s = GameState.get();
    if (s.business.owned.length === 0) { log('🏭 Start a business first.'); return; }
    const cost = 100000 * s.business.owned[0].level;
    if (s.finance.cash < cost) { log(`💸 Need ₦${cost.toLocaleString()} to expand.`); return; }
    GameState.apply({ money: -cost });
    s.business.owned[0].level++;
    log(`📈 Business expanded to Level ${s.business.owned[0].level}! Revenue cap increased.`);
    GameState.save();
  }

  // ── DATING / RELATIONSHIPS ────────────────────────────────
  function startDating(contactName) {
    const s = GameState.get();
    const contact = s.relationships.contacts.find(c => c.name === contactName);
    if (!contact) { notify('Meet them first!'); return; }
    if (contact.level < 40) { notify('You need to build more friendship first.'); return; }
    if (s.relationships.married) { notify('You are already married!'); return; }
    s.relationships.dating  = contactName;
    contact.type            = 'romantic';
    GameState.apply({ happiness: 30 });
    GameState.addStoryEntry(`Started dating ${contactName}.`);
    GameState.addPhoneMessage(contactName, `❤️ I really enjoy spending time with you. Let\'s make this official 😊`);
    notify(`❤️ You are now dating ${contactName}!`);
    GameState.save();
  }

  function propose(contactName) {
    const s = GameState.get();
    if (!s.relationships.dating) { notify('You need to be dating someone first.'); return; }
    const ring = s.inventory.gifts.includes('ring');
    if (!ring) { notify('💍 Buy a ring first from Kaduna Mall!'); return; }
    const contact = s.relationships.contacts.find(c => c.name === contactName);
    if (!contact || contact.level < 70) { notify('Your relationship needs to be stronger.'); return; }
    const accepted = Math.random() > 0.2;
    if (accepted) {
      s.relationships.married = true;
      s.relationships.spouse  = contactName;
      s.relationships.dating  = null;
      s.inventory.gifts = s.inventory.gifts.filter(g => g !== 'ring');
      GameState.apply({ happiness: 50, reputation: 10 });
      GameState.addMilestone('married', {});
      modal('💍', 'Congratulations!', `${contactName} said YES! You are now married in Kaduna!\n\nWishing you a lifetime of happiness together.`);
      GameState.addPhoneMessage(contactName, '💍 YES! I do! Can\'t wait to build our life together in KD! ❤️');
    } else {
      GameState.apply({ happiness: -30 });
      s.relationships.dating = null;
      GameState.addStoryEntry(`${contactName} rejected the proposal.`);
      modal('💔', 'Rejected', `${contactName} said no. Your heart is broken.\n\nKaduna has other fish in the sea.`);
    }
    GameState.save();
  }

  function haveChild() {
    const s = GameState.get();
    if (!s.relationships.married) { notify('You need to be married first.'); return; }
    if (s.finance.cash < 50000) { notify('💸 Need ₦50,000 for baby expenses.'); return; }
    GameState.apply({ money: -50000, happiness: 50 });
    s.relationships.children++;
    GameState.addMilestone(s.relationships.children === 1 ? 'firstChild' : 'morKids', {});
    modal('👶', 'New Baby!', `Congratulations! You and ${s.relationships.spouse} welcomed a new child into the world!\n\nKaduna just got a little bigger.`);
    GameState.addStoryEntry(`Welcomed child #${s.relationships.children}.`);
    GameState.save();
  }

  // ── TRANSPORT ─────────────────────────────────────────────
  function buyVehicle(vehicleId) {
    const s = GameState.get();
    const v = KD_DATA.vehicles.find(vv => vv.id === vehicleId);
    if (!v) return;
    if (s.finance.cash < v.price) { notify(`💸 Need ₦${v.price.toLocaleString()}.`); return; }
    GameState.apply({ money: -v.price });
    s.transport.owned.push(vehicleId);
    s.transport.current  = vehicleId;
    s.transport.fuelLevel = 100;
    GameState.apply({ happiness: 25, reputation: v.prestige / 2 });
    GameState.addMilestone('firstCar', { car: v.label });
    GameState.addStoryEntry(`Bought a ${v.label}.`);
    notify(`🚗 Congratulations! You own a ${v.label}!`);
    GameState.save();
  }

  // ── RANDOM EVENT TRIGGER ──────────────────────────────────
  function triggerRandomEvent(probability = 0.25) {
    if (Math.random() > probability) return;
    const events = KD_DATA.events;
    // Weighted random selection
    const total  = events.reduce((s, e) => s + (e.weight || 1), 0);
    let   rand   = Math.random() * total;
    let   chosen = events[0];
    for (const e of events) {
      rand -= (e.weight || 1);
      if (rand <= 0) { chosen = e; break; }
    }
    GameState.apply(chosen.effect || {});
    GameState.addStoryEntry(`Event: ${chosen.title} — ${chosen.text}`);
    if (typeof UI !== 'undefined') {
      UI.showModal(chosen.icon, chosen.title, chosen.text);
    }
  }

  // ── CRIME SYSTEM ──────────────────────────────────────────
  function doCrime(fn) {
    const s = GameState.get();
    const crimes = {
      runScam: () => {
        const caught = Math.random() < 0.35;
        if (caught) {
          GameState.apply({ money: -50000, happiness: -30, reputation: -20 });
          s.character.crimeRecord = (s.character.crimeRecord||0) + 1;
          modal('🚔','Caught!','Police arrested you for scamming. You paid ₦50,000 bail and lost reputation.');
        } else {
          GameState.apply({ money: 50000, happiness: -10 });
          log('🎭 Scam worked. Got ₦50,000. But you feel uneasy...');
        }
      },
      undergroundBet: () => {
        const win = Math.random() < 0.4;
        if (win) {
          GameState.apply({ money: 200000, happiness: 20 });
          log('🎰 You won the underground bet! ₦200,000!');
        } else {
          GameState.apply({ money: -80000, happiness: -25 });
          log('🎰 Lost the bet. ₦80,000 gone. These people are dangerous.');
        }
      },
      blackMarket: () => {
        const caught = Math.random() < 0.25;
        if (caught) {
          GameState.apply({ money: -100000, reputation: -25 });
          s.character.crimeRecord = (s.character.crimeRecord||0) + 1;
          modal('🚔','Busted!','Police raided the black market. You paid ₦100,000 and fled. Reputation damaged.');
        } else {
          GameState.apply({ money: 100000 });
          log('🕵️ Black market deal done. ₦100,000 profit. Stay low.');
        }
      },
      drugTrade: () => {
        const caught = Math.random() < 0.5;
        if (caught) {
          GameState.apply({ money: -500000, happiness: -50, reputation: -40, health: -30 });
          s.character.crimeRecord = (s.character.crimeRecord||0) + 3;
          modal('🚔','ARRESTED!','You were arrested for drug trafficking. Heavy fines, prison time, reputation destroyed. This is not the way.');
        } else {
          GameState.apply({ money: 500000, happiness: -20 });
          log('💊 Deal done. ₦500,000. But this life has a price...');
        }
      },
    };
    if (crimes[fn]) { crimes[fn](); GameState.save(); if (typeof UI!=='undefined') UI.updateHUD(); }
  }

  // ── THERAPY SYSTEM ────────────────────────────────────────
  function doTherapy(fn) {
    const s = GameState.get();
    const therapies = {
      talkTherapy: () => {
        if (s.finance.cash < 5000) { notify('💸 Need ₦5,000.'); return; }
        GameState.apply({ money: -5000, happiness: 25 });
        s.character.stress = GameState.clamp((s.character.stress||0) - 30, 0, 100);
        s.character.mentalHealth = GameState.clamp((s.character.mentalHealth||100) + 25, 0, 100);
        log('💬 Talk therapy done. You feel heard and lighter.');
      },
      meditate: () => {
        GameState.apply({ happiness: 10, energy: 10 });
        s.character.stress = GameState.clamp((s.character.stress||0) - 15, 0, 100);
        s.character.mentalHealth = GameState.clamp((s.character.mentalHealth||100) + 10, 0, 100);
        log('🧘 Meditated for 30 minutes. Mind feels clear.');
      },
      journal: () => {
        GameState.apply({ happiness: 8 });
        s.character.stress = GameState.clamp((s.character.stress||0) - 10, 0, 100);
        s.character.mentalHealth = GameState.clamp((s.character.mentalHealth||100) + 10, 0, 100);
        log('📓 Wrote in your journal. Processing thoughts helps.');
      },
      exerciseTherapy: () => {
        if (s.finance.cash < 2000) { notify('💸 Need ₦2,000.'); return; }
        GameState.apply({ money: -2000, health: 15 });
        s.character.stress = GameState.clamp((s.character.stress||0) - 20, 0, 100);
        log('🏃 Exercise therapy complete. Body and mind reset.');
      },
      takeMeds: () => {
        if (s.finance.cash < 10000) { notify('💸 Need ₦10,000.'); return; }
        GameState.apply({ money: -10000, happiness: 20 });
        s.character.mentalHealth = GameState.clamp((s.character.mentalHealth||100) + 40, 0, 100);
        log('💊 Medication taken. Mental health significantly improved.');
      },
    };
    if (therapies[fn]) { therapies[fn](); GameState.save(); if (typeof UI!=='undefined') UI.updateHUD(); }
  }

  // ── Action Router ─────────────────────────────────────────
  const ACTION_MAP = {
    // Home
    sleepHome, watchTv, readBook, cookMeal, manageHome,
    // Market
    buyFood, findWorkMarket, sellItems, chatTraders, openStall,
    // School
    attendClass, selfStudy, makeFriends, takeExam, checkResults,
    attendLecture, studyHard, doInternship, campusSocial, graduate,
    // Hospital
    getTreatment, checkup, vaccinate, mentalHealth, fitnessTest,
    // Office
    applyJob, doWork, askRaise, network, getCertified,
    // Bank
    checkBalance, transferMoney, invest, takeLoan, checkCredit,
    // Park
    takeWalk, meetSomeone, enjoyMusic, exercise, communityEvent,
    // Mall
    buyClothes, buyPhone, foodCourt, mallEntertain, buyGift,
    // Mosque/Church
    pray, seekGuidance, meetCommunity, quranStudy,
    // Nightspot
    partyHard, meetPeople, liveMusic, buyDrinks,
    // Motor park
    takeKeke, takeBus, findTransport, vehicleRepair,
    // Real estate
    rentPlace, buyProperty, renovateHome, buyFurniture,
    // Business
    startBusiness, manageBusiness, hireStaff, expandBusiness,
  };

  function run(fn) {
    if (ACTION_MAP[fn]) ACTION_MAP[fn]();
    else log('🚧 Coming soon!');
    if (typeof UI !== 'undefined') UI.updateHUD();
  }

  return {
    run, takeJob, quitJob, enrollCourse, upgradeHousing,
    launchBusiness, buyVehicle, purchaseItem, purchaseFurniture,
    startDating, propose, haveChild, triggerRandomEvent,
    doCrime, doTherapy,
  };

})();
