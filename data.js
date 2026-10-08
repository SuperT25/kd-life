// ═══════════════════════════════════════════════════════════
//  KD LIFE — Static Game Data
// ═══════════════════════════════════════════════════════════

const KD_DATA = {

  // ── Avatars ───────────────────────────────────────────────
  avatars: [
    { id:'a1', emoji:'👨🏿', label:'Guy 1' },
    { id:'a2', emoji:'👨🏾', label:'Guy 2' },
    { id:'a3', emoji:'👨🏽', label:'Guy 3' },
    { id:'a4', emoji:'👩🏿', label:'Girl 1' },
    { id:'a5', emoji:'👩🏾', label:'Girl 2' },
    { id:'a6', emoji:'👩🏽', label:'Girl 3' },
    { id:'a7', emoji:'🧔🏿', label:'Bearded' },
    { id:'a8', emoji:'👱🏿‍♀️', label:'Natural' },
    { id:'a9', emoji:'🧕🏿', label:'Hijab' },
    { id:'a10',emoji:'👲🏿', label:'Traditional' },
  ],

  // ── Personality Traits ────────────────────────────────────
  traits: [
    { id:'ambitious',  label:'🔥 Ambitious',  desc:'Work harder, earn more. -5 happiness.',    bonus:{ workBonus:0.2, happyDrain:5 } },
    { id:'social',     label:'🤝 Social',     desc:'Relationships build faster. +happiness.',  bonus:{ relBonus:0.3, happyGain:3 } },
    { id:'intelligent',label:'🧠 Intelligent',desc:'Learn skills faster. Excel in school.',    bonus:{ skillBonus:0.3, studyBonus:0.25 } },
    { id:'lucky',      label:'🍀 Lucky',      desc:'Better random event outcomes.',            bonus:{ luckBonus:0.25 } },
    { id:'creative',   label:'🎨 Creative',   desc:'Business and art opportunities.',          bonus:{ businessBonus:0.2 } },
    { id:'resilient',  label:'💪 Resilient',  desc:'Recover health/energy faster.',            bonus:{ recoveryBonus:0.3 } },
  ],

  // ── Life Goals ────────────────────────────────────────────
  goals: [
    { id:'tycoon',   label:'💰 Kaduna Tycoon',    desc:'Become the richest person in KD.',     target:{ money:5000000 } },
    { id:'career',   label:'💼 Career Champion',  desc:'Reach the top of your profession.',    target:{ jobLevel:5 } },
    { id:'family',   label:'👨‍👩‍👧 Family Builder',  desc:'Build a loving family in Kaduna.',    target:{ children:2, married:true } },
    { id:'scholar',  label:'🎓 Scholar',           desc:'Get every degree and certificate.',    target:{ degrees:3 } },
    { id:'landlord', label:'🏠 Property King',    desc:'Own 3 or more properties in KD.',     target:{ properties:3 } },
    { id:'social',   label:'🌟 Community Legend', desc:'Become the most reputable person.',   target:{ reputation:100 } },
  ],

  // ── Backgrounds ───────────────────────────────────────────
  backgrounds: [
    { id:'poor',    label:'🏚️ Street Kid',   desc:'Grew up in Rigasa. Tough life, street smart.',     bonus:{ money:50000,   skill:5,  happiness:-10, reputation:10 } },
    { id:'middle',  label:'🏠 Middle Class', desc:'Grew up in Barnawa. Solid foundation.',            bonus:{ money:500000,  skill:15, happiness:10,  reputation:30 } },
    { id:'rich',    label:'🏰 Rich Family',  desc:'Grew up in GRA. Silver spoon life.',               bonus:{ money:1000000, skill:5,  happiness:20,  reputation:50 } },
    { id:'student', label:'🎓 Scholar',      desc:'Moved to KD for education. Brilliant but broke.',  bonus:{ money:100000,  skill:35, happiness:5,   reputation:20 } },
  ],

  // ── Housing ───────────────────────────────────────────────
  housing: [
    { id:'hostel',    label:'🛏️ Hostel Room',    rent:3000,  buyPrice:0,       desc:'Shared room in a student hostel.',      comfort:10, security:20, prestige:5  },
    { id:'selfcon',   label:'🏠 Self-Contained', rent:15000, buyPrice:500000,  desc:'Your own 1-room apartment.',            comfort:35, security:40, prestige:20 },
    { id:'flat',      label:'🏢 2-Bedroom Flat', rent:35000, buyPrice:1500000, desc:'A proper flat in Kaduna.',              comfort:60, security:60, prestige:40 },
    { id:'apartment', label:'🏙️ Luxury Apt',     rent:80000, buyPrice:4000000, desc:'Modern apartment with amenities.',      comfort:75, security:75, prestige:65 },
    { id:'duplex',    label:'🏡 Duplex',          rent:0,     buyPrice:8000000, desc:'Your own duplex in a good area.',       comfort:88, security:85, prestige:80 },
    { id:'mansion',   label:'🏰 Mansion',         rent:0,     buyPrice:25000000,desc:'A mansion in KD GRA. You made it.',    comfort:100,security:100,prestige:100 },
  ],

  // ── Furniture & Items ─────────────────────────────────────
  furniture: [
    { id:'bed',       label:'🛏️ Good Bed',       price:25000,  effect:{ energyBonus:10 } },
    { id:'tv',        label:'📺 Television',      price:80000,  effect:{ happyBonus:5 } },
    { id:'fridge',    label:'🧊 Refrigerator',    price:120000, effect:{ healthBonus:5 } },
    { id:'ac',        label:'❄️ Air Conditioner', price:200000, effect:{ energyBonus:15, happyBonus:10 } },
    { id:'generator', label:'⚡ Generator',       price:350000, effect:{ happyBonus:15 } },
    { id:'sofa',      label:'🛋️ Sofa Set',        price:60000,  effect:{ happyBonus:5 } },
  ],

  // ── Education ─────────────────────────────────────────────
  education: [
    { id:'waec',    label:'📚 WAEC/NECO',         cost:15000,  duration:4,  skillGain:20, req:null,     degree:'WAEC Certificate' },
    { id:'nd',      label:'🎓 ND (Polytechnic)',  cost:80000,  duration:8,  skillGain:35, req:'waec',   degree:'National Diploma' },
    { id:'hnd',     label:'🎓 HND',               cost:120000, duration:8,  skillGain:45, req:'nd',     degree:'HND Certificate' },
    { id:'bsc',     label:'🎓 BSc (University)',  cost:200000, duration:12, skillGain:55, req:'waec',   degree:'Bachelor\'s Degree' },
    { id:'msc',     label:'🎓 MSc',               cost:350000, duration:8,  skillGain:70, req:'bsc',    degree:'Master\'s Degree' },
    { id:'prof',    label:'📜 Professional Cert', cost:50000,  duration:2,  skillGain:25, req:null,     degree:'Professional Certificate' },
    { id:'trade',   label:'🔧 Vocational',        cost:30000,  duration:3,  skillGain:30, req:null,     degree:'Trade Certificate' },
    { id:'online',  label:'💻 Online Course',     cost:5000,   duration:1,  skillGain:10, req:null,     degree:'Online Certificate' },
  ],

  // ── Careers ───────────────────────────────────────────────
  careers: [
    {
      id:'vendor', title:'Market Vendor', icon:'🛒', category:'Trade',
      levels:[
        { level:1, title:'Apprentice',   pay:5000,   skillReq:0,  energy:25 },
        { level:2, title:'Trader',       pay:15000,  skillReq:10, energy:30 },
        { level:3, title:'Senior Trader',pay:35000,  skillReq:25, energy:35 },
      ]
    },
    {
      id:'driver', title:'Transport', icon:'🛺', category:'Transport',
      levels:[
        { level:1, title:'Keke Driver',   pay:8000,   skillReq:0,  energy:35 },
        { level:2, title:'Taxi Driver',   pay:20000,  skillReq:5,  energy:40 },
        { level:3, title:'Fleet Manager', pay:80000,  skillReq:30, energy:30 },
      ]
    },
    {
      id:'teacher', title:'Education', icon:'📖', category:'Education',
      levels:[
        { level:1, title:'School Teacher', pay:30000,  skillReq:25, energy:35 },
        { level:2, title:'Senior Teacher', pay:60000,  skillReq:40, energy:35 },
        { level:3, title:'Head Teacher',   pay:100000, skillReq:55, energy:30 },
        { level:4, title:'Principal',      pay:180000, skillReq:65, energy:25 },
      ]
    },
    {
      id:'medical', title:'Healthcare', icon:'🩺', category:'Health',
      levels:[
        { level:1, title:'Nurse',          pay:40000,  skillReq:30, energy:45 },
        { level:2, title:'Senior Nurse',   pay:80000,  skillReq:45, energy:45 },
        { level:3, title:'Doctor',         pay:200000, skillReq:60, energy:50 },
        { level:4, title:'Specialist',     pay:500000, skillReq:75, energy:50 },
        { level:5, title:'Chief Medical',  pay:900000, skillReq:85, energy:40 },
      ]
    },
    {
      id:'civil', title:'Civil Service', icon:'📋', category:'Government',
      levels:[
        { level:1, title:'Clerk',          pay:25000,  skillReq:15, energy:20 },
        { level:2, title:'Officer',        pay:60000,  skillReq:25, energy:25 },
        { level:3, title:'Senior Officer', pay:120000, skillReq:40, energy:25 },
        { level:4, title:'Director',       pay:300000, skillReq:55, energy:20 },
        { level:5, title:'Permanent Sec',  pay:600000, skillReq:70, energy:20 },
      ]
    },
    {
      id:'tech', title:'Technology', icon:'💻', category:'Tech',
      levels:[
        { level:1, title:'Tech Support',   pay:50000,  skillReq:25, energy:30 },
        { level:2, title:'Developer',      pay:150000, skillReq:45, energy:35 },
        { level:3, title:'Senior Dev',     pay:350000, skillReq:60, energy:35 },
        { level:4, title:'Tech Lead',      pay:700000, skillReq:75, energy:30 },
        { level:5, title:'CTO',            pay:1500000,skillReq:90, energy:25 },
      ]
    },
    {
      id:'business', title:'Entrepreneur', icon:'💼', category:'Business',
      levels:[
        { level:1, title:'Side Hustler',   pay:20000,  skillReq:10, energy:40 },
        { level:2, title:'Small Business', pay:80000,  skillReq:30, energy:45 },
        { level:3, title:'Business Owner', pay:250000, skillReq:50, energy:50 },
        { level:4, title:'Company CEO',    pay:800000, skillReq:65, energy:45 },
        { level:5, title:'Conglomerate',   pay:3000000,skillReq:80, energy:40 },
      ]
    },
    {
      id:'politics', title:'Politics', icon:'🗳️', category:'Government',
      levels:[
        { level:1, title:'Community Leader',pay:50000,  skillReq:40, energy:35 },
        { level:2, title:'Councillor',      pay:200000, skillReq:55, energy:35 },
        { level:3, title:'LGA Chairman',    pay:800000, skillReq:70, energy:40 },
        { level:4, title:'State Rep',       pay:2000000,skillReq:80, energy:35 },
        { level:5, title:'Senator',         pay:5000000,skillReq:90, energy:30 },
      ]
    },
  ],

  // ── Businesses ────────────────────────────────────────────
  businesses: [
    { id:'foodshop',   label:'🍲 Food Business',    startCost:500000,   dailyRevMax:150000,   employeesMax:3 },
    { id:'boutique',   label:'👗 Boutique',          startCost:800000,   dailyRevMax:200000,   employeesMax:2 },
    { id:'phoneshop',  label:'📱 Phone Shop',        startCost:1500000,  dailyRevMax:500000,   employeesMax:3 },
    { id:'supermarket',label:'🛒 Supermarket',       startCost:3000000,  dailyRevMax:1000000,  employeesMax:8 },
    { id:'transport',  label:'🚌 Transport Co.',     startCost:5000000,  dailyRevMax:1500000,  employeesMax:10 },
    { id:'realestate', label:'🏠 Real Estate',       startCost:10000000, dailyRevMax:3000000,  employeesMax:5 },
    { id:'farm',       label:'🌾 Farm',              startCost:2000000,  dailyRevMax:500000,   employeesMax:6 },
    { id:'tech',       label:'💻 Tech Startup',      startCost:2000000,  dailyRevMax:2000000,  employeesMax:15 },
  ],

  // ── Vehicles ──────────────────────────────────────────────
  vehicles: [
    { id:'bicycle',  label:'🚲 Bicycle',      price:25000,   fuel:0,    speed:1, prestige:5  },
    { id:'keke',     label:'🛺 Keke Napep',   price:350000,  fuel:500,  speed:2, prestige:10 },
    { id:'bike',     label:'🏍️ Motorcycle',   price:400000,  fuel:800,  speed:3, prestige:15 },
    { id:'taxi',     label:'🚕 Old Taxi',      price:800000,  fuel:2000, speed:4, prestige:25 },
    { id:'car',      label:'🚗 Saloon Car',    price:2500000, fuel:3000, speed:5, prestige:50 },
    { id:'suv',      label:'🚙 SUV',           price:8000000, fuel:5000, speed:6, prestige:75 },
    { id:'luxury',   label:'🏎️ Luxury Car',    price:25000000,fuel:8000, speed:7, prestige:100 },
  ],

  // ── Shopping Items ────────────────────────────────────────
  shop: {
    clothes: [
      { id:'casual',   label:'👕 Casual Outfit',   price:3000,   prestige:5,  happiness:5 },
      { id:'formal',   label:'👔 Formal Suit',      price:25000,  prestige:20, happiness:10 },
      { id:'ankara',   label:'👘 Ankara Wear',      price:8000,   prestige:10, happiness:15 },
      { id:'designer', label:'🥻 Designer Wear',    price:150000, prestige:40, happiness:20 },
    ],
    phones: [
      { id:'basic',    label:'📱 Basic Phone',     price:15000,  prestige:5  },
      { id:'android',  label:'📱 Android Phone',   price:80000,  prestige:15 },
      { id:'flagship', label:'📱 Flagship Phone',  price:400000, prestige:35 },
      { id:'iphone',   label:'🍎 iPhone',           price:800000, prestige:60 },
    ],
    food: [
      { id:'local',    label:'🍲 Local Meal',       price:500,   energy:20, health:10 },
      { id:'restaurant',label:'🍽️ Restaurant',      price:3000,  energy:30, health:15, happiness:10 },
      { id:'suya',     label:'🥩 Suya Night',       price:1500,  energy:15, happiness:20 },
      { id:'groceries',label:'🛒 Groceries (week)', price:8000,  energy:50, health:25 },
    ],
    gifts: [
      { id:'flowers',  label:'💐 Flowers',          price:2000,  relBonus:10 },
      { id:'perfume',  label:'🧴 Perfume',           price:8000,  relBonus:20 },
      { id:'ring',     label:'💍 Ring',              price:50000, relBonus:40 },
      { id:'car_gift', label:'🚗 Car (gift)',        price:2000000,relBonus:80 },
    ],
  },

  // ── Kaduna Locations ──────────────────────────────────────
  locations: [
    // === BARNAWA ===
    { id:'home',      name:'Your Home',           icon:'🏠', district:'Barnawa', desc:'Your residence in Kaduna.',                    color:'#2ecc71', dark:'#1a7a42',
      actions:[
        { label:'😴 Full Sleep',      fn:'sleepHome' },
        { label:'📺 Watch TV',        fn:'watchTv' },
        { label:'📖 Read Book',       fn:'readBook' },
        { label:'🍲 Cook Meal',       fn:'cookMeal' },
        { label:'🏠 Manage Home',     fn:'manageHome' },
      ]
    },
    { id:'market',    name:'Kaduna Market',        icon:'🏪', district:'Central', desc:'The heart of trade in Kaduna.',                color:'#e67e22', dark:'#a04a0a',
      actions:[
        { label:'🛍️ Buy Food',        fn:'buyFood' },
        { label:'🤝 Find Work',       fn:'findWorkMarket' },
        { label:'📦 Sell Items',      fn:'sellItems' },
        { label:'💬 Chat Traders',    fn:'chatTraders' },
        { label:'🏪 Open Stall',      fn:'openStall' },
      ]
    },
    // === KADUNA NORTH ===
    { id:'school',    name:'KD Secondary School',  icon:'🏫', district:'Kaduna North', desc:'Build your academic foundation.',         color:'#3498db', dark:'#1a5a8a',
      actions:[
        { label:'📚 Attend Class',    fn:'attendClass' },
        { label:'📝 Self Study',      fn:'selfStudy' },
        { label:'🤝 Make Friends',    fn:'makeFriends' },
        { label:'🏆 Write Exam',      fn:'takeExam' },
        { label:'🎓 Check Results',   fn:'checkResults' },
      ]
    },
    { id:'university',name:'Kaduna Polytechnic',   icon:'🎓', district:'Kaduna North', desc:'Higher education hub of KD.',             color:'#2980b9', dark:'#1a4a6a',
      actions:[
        { label:'📚 Attend Lecture',  fn:'attendLecture' },
        { label:'📝 Study Hard',      fn:'studyHard' },
        { label:'💼 Internship',      fn:'doInternship' },
        { label:'🤝 Campus Social',   fn:'campusSocial' },
        { label:'🎓 Graduate',        fn:'graduate' },
      ]
    },
    // === HOSPITAL ROAD ===
    { id:'hospital',  name:'Barau Dikko Hospital',  icon:'🏥', district:'Hospital Rd', desc:'Premier hospital in Kaduna.',             color:'#e74c3c', dark:'#8a1a1a',
      actions:[
        { label:'💊 Full Treatment',  fn:'getTreatment' },
        { label:'🩺 Checkup',         fn:'checkup' },
        { label:'💉 Vaccination',     fn:'vaccinate' },
        { label:'🧠 Mental Health',   fn:'mentalHealth' },
        { label:'🏃 Fitness Test',    fn:'fitnessTest' },
      ]
    },
    // === GRA ===
    { id:'office',    name:'Business District',     icon:'🏢', district:'GRA', desc:'Corporate Kaduna. Jobs and deals here.',         color:'#9b59b6', dark:'#5a2a7a',
      actions:[
        { label:'💼 Apply for Job',   fn:'applyJob' },
        { label:'📊 Work Today',      fn:'doWork' },
        { label:'📈 Ask for Raise',   fn:'askRaise' },
        { label:'🤝 Network',         fn:'network' },
        { label:'📜 Get Certified',   fn:'getCertified' },
      ]
    },
    { id:'bank',      name:'KD Commercial Bank',    icon:'🏦', district:'GRA', desc:'Manage your money. Grow your wealth.',           color:'#34495e', dark:'#1a2530',
      actions:[
        { label:'💰 Check Balance',   fn:'checkBalance' },
        { label:'💸 Transfer Money',  fn:'transferMoney' },
        { label:'📈 Invest',          fn:'invest' },
        { label:'🏦 Take Loan',       fn:'takeLoan' },
        { label:'📊 Check Credit',    fn:'checkCredit' },
      ]
    },
    // === CITY CENTRE ===
    { id:'park',      name:'Lugard Hall Park',      icon:'🌳', district:'City Centre', desc:'KD\'s historic park. Relax and connect.',color:'#27ae60', dark:'#145a30',
      actions:[
        { label:'🚶 Take a Walk',     fn:'takeWalk' },
        { label:'💑 Meet Someone',    fn:'meetSomeone' },
        { label:'🎵 Enjoy Music',     fn:'enjoyMusic' },
        { label:'🏃 Exercise',        fn:'exercise' },
        { label:'🤝 Community',       fn:'communityEvent' },
      ]
    },
    { id:'mall',      name:'Kaduna Mall',           icon:'🛍️', district:'City Centre', desc:'Modern shopping in KD.',                 color:'#c0392b', dark:'#7a1a10',
      actions:[
        { label:'👗 Buy Clothes',     fn:'buyClothes' },
        { label:'📱 Buy Phone',       fn:'buyPhone' },
        { label:'🍽️ Food Court',      fn:'foodCourt' },
        { label:'🎮 Entertainment',   fn:'mallEntertain' },
        { label:'🎁 Buy Gift',        fn:'buyGift' },
      ]
    },
    // === BARNAWA ===
    { id:'mosque',    name:'Friday Mosque',         icon:'🕌', district:'Barnawa', desc:'Spiritual peace and community.',               color:'#1abc9c', dark:'#0a6a5a',
      actions:[
        { label:'🤲 Pray',            fn:'pray' },
        { label:'📿 Seek Guidance',   fn:'seekGuidance' },
        { label:'🤝 Meet Community',  fn:'meetCommunity' },
        { label:'📖 Quran Study',     fn:'quranStudy' },
      ]
    },
    { id:'church',    name:'Church',                icon:'⛪', district:'Barnawa', desc:'Place of worship and fellowship.',              color:'#8e44ad', dark:'#4a1a6a',
      actions:[
        { label:'🙏 Worship',         fn:'pray' },
        { label:'📖 Bible Study',     fn:'seekGuidance' },
        { label:'🤝 Fellowship',      fn:'meetCommunity' },
      ]
    },
    // === UNGWAN RIMI ===
    { id:'nightspot', name:'KD Night Spot',         icon:'🍻', district:'Ungwan Rimi', desc:'Kaduna nightlife. Unwind and socialize.', color:'#d35400', dark:'#7a2a00',
      actions:[
        { label:'🎉 Party',           fn:'partyHard' },
        { label:'💬 Meet People',     fn:'meetPeople' },
        { label:'🎵 Live Music',      fn:'liveMusic' },
        { label:'🍻 Buy Drinks',      fn:'buyDrinks' },
      ]
    },
    // === RIGASA ===
    { id:'motorpark', name:'Rigasa Motor Park',     icon:'🛺', district:'Rigasa', desc:'Busy transport hub of KD.',                    color:'#16a085', dark:'#0a5040',
      actions:[
        { label:'🛺 Take Keke',       fn:'takeKeke' },
        { label:'🚌 Take Bus',        fn:'takeBus' },
        { label:'🤝 Find Transport',  fn:'findTransport' },
        { label:'🔧 Vehicle Repair',  fn:'vehicleRepair' },
      ]
    },
    // === REAL ESTATE ===
    { id:'realestate',name:'KD Properties',        icon:'🏠', district:'GRA', desc:'Buy, rent, or invest in Kaduna property.',       color:'#f39c12', dark:'#b7770d',
      actions:[
        { label:'🏠 Rent a Place',    fn:'rentPlace' },
        { label:'💰 Buy Property',    fn:'buyProperty' },
        { label:'🔧 Renovate Home',   fn:'renovateHome' },
        { label:'📦 Buy Furniture',   fn:'buyFurniture' },
      ]
    },
    // === BUSINESS ===
    { id:'bizcentre', name:'Business Centre',      icon:'🏭', district:'Industrial', desc:'Start and manage your own business.',      color:'#e74c3c', dark:'#8a1a1a',
      actions:[
        { label:'🏭 Start Business',  fn:'startBusiness' },
        { label:'📊 Manage Business', fn:'manageBusiness' },
        { label:'👥 Hire Staff',      fn:'hireStaff' },
        { label:'📈 Expand Business', fn:'expandBusiness' },
      ]
    },
  ],

  // ── NPC People ────────────────────────────────────────────
  npcs: [
    { name:'Amina',   icon:'👩🏿', trait:'Friendly',   relation:'friend',  district:'Barnawa' },
    { name:'Chukwu',  icon:'👨🏾', trait:'Ambitious',  relation:'friend',  district:'GRA' },
    { name:'Fatima',  icon:'👩🏾', trait:'Smart',      relation:'friend',  district:'Kaduna North' },
    { name:'Ibrahim', icon:'👨🏿', trait:'Funny',      relation:'friend',  district:'City Centre' },
    { name:'Ngozi',   icon:'👩🏽', trait:'Kind',       relation:'friend',  district:'Hospital Rd' },
    { name:'Musa',    icon:'👨🏾', trait:'Hustler',    relation:'contact', district:'Central' },
    { name:'Blessing',icon:'👩🏿', trait:'Creative',   relation:'contact', district:'Ungwan Rimi' },
    { name:'Usman',   icon:'👨🏿', trait:'Wise',       relation:'mentor',  district:'Barnawa' },
    { name:'Kemi',    icon:'👩🏽', trait:'Romantic',   relation:'stranger',district:'City Centre' },
    { name:'Danladi', icon:'👨🏿', trait:'Tough',      relation:'stranger',district:'Rigasa' },
    { name:'Hauwa',   icon:'👩🏿', trait:'Spiritual',  relation:'friend',  district:'Barnawa' },
    { name:'Emeka',   icon:'👨🏾', trait:'Clever',     relation:'contact', district:'Industrial' },
  ],

  // ── 120 Random Life Events ────────────────────────────────
  events: [
    // Money events
    { id:'e1',  icon:'💸', title:'Found Money!',         text:'You found ₦500 on the street. Lucky day!',                        effect:{ money:500 },                    weight:3 },
    { id:'e2',  icon:'📱', title:'Phone Stolen!',        text:'A pickpocket got you at the market. Lost ₦3,000.',               effect:{ money:-3000, happiness:-15 },    weight:2 },
    { id:'e3',  icon:'🏆', title:'Competition Win!',     text:'You won a local competition. ₦5,000 prize!',                     effect:{ money:5000, happiness:20 },      weight:2 },
    { id:'e4',  icon:'💰', title:'Side Hustle Pays',    text:'A quick job earned you ₦1,500 today.',                            effect:{ money:1500, energy:-10 },        weight:4 },
    { id:'e5',  icon:'🎰', title:'Bet Win!',             text:'You won a small bet — ₦2,000!',                                  effect:{ money:2000, happiness:10 },      weight:2 },
    { id:'e6',  icon:'💸', title:'Unexpected Bill',      text:'LAWMA charged extra this month. ₦5,000 gone.',                   effect:{ money:-5000, happiness:-10 },    weight:3 },
    { id:'e7',  icon:'🏦', title:'Bank Error in Favour', text:'Bank credited your account ₦1,000 by mistake. Keep quiet!',     effect:{ money:1000 },                    weight:1 },
    { id:'e8',  icon:'🎁', title:'Gift Received',        text:'A relative sent you ₦10,000 from abroad.',                      effect:{ money:10000, happiness:25 },     weight:2 },
    { id:'e9',  icon:'💸', title:'Car Breakdown',        text:'Your vehicle broke down. Spent ₦8,000 on repairs.',             effect:{ money:-8000, happiness:-10 },    weight:2 },
    { id:'e10', icon:'📈', title:'Investment Returns',   text:'Your investment paid off today! Extra income.',                  effect:{ money:15000, happiness:20 },     weight:2 },
    // Health events
    { id:'e11', icon:'🤒', title:'Feeling Sick',         text:'You woke up unwell. Visit the hospital soon.',                   effect:{ health:-25 },                    weight:3 },
    { id:'e12', icon:'💪', title:'Feeling Great!',       text:'You feel amazing today. Energy at its peak!',                   effect:{ health:15, energy:20 },          weight:3 },
    { id:'e13', icon:'🏥', title:'Medical Emergency',    text:'A health scare. You need immediate treatment.',                  effect:{ health:-40, money:-20000 },      weight:1 },
    { id:'e14', icon:'🧘', title:'Relaxation Day',       text:'You spent the day relaxing fully. Restored!',                   effect:{ health:10, happiness:15, energy:30 }, weight:3 },
    { id:'e15', icon:'🍎', title:'Eating Healthy',       text:'You\'ve been eating well lately. Health improving.',            effect:{ health:10 },                     weight:3 },
    { id:'e16', icon:'🏃', title:'Fitness Streak',       text:'7 days of exercise. Your body thanks you.',                    effect:{ health:20, happiness:10 },       weight:2 },
    { id:'e17', icon:'🤕', title:'Minor Accident',       text:'You tripped and hurt your ankle. Slight injury.',               effect:{ health:-10, energy:-15 },        weight:2 },
    { id:'e18', icon:'😷', title:'Caught Malaria',       text:'Classic KD malaria season. Take your drugs!',                  effect:{ health:-30, money:-5000 },       weight:2 },
    // Happiness events
    { id:'e19', icon:'🎉', title:'Street Party!',        text:'Neighbours holding a naming ceremony. You joined in!',          effect:{ happiness:20, energy:-10 },      weight:4 },
    { id:'e20', icon:'⚡', title:'NEPA Strikes Again',   text:'No light for 3 days. KD classic.',                              effect:{ happiness:-15 },                 weight:5 },
    { id:'e21', icon:'🌅', title:'Beautiful Morning',    text:'Kaduna sunrise was stunning. You feel inspired.',               effect:{ happiness:15, energy:10 },       weight:4 },
    { id:'e22', icon:'🎵', title:'Music Festival',       text:'Amazing KD music festival today. Great time!',                  effect:{ happiness:25, energy:-5 },       weight:2 },
    { id:'e23', icon:'😤', title:'Traffic Jam',          text:'Stuck in Kaduna traffic for 2 hours. Annoying!',               effect:{ happiness:-10, energy:-10 },     weight:5 },
    { id:'e24', icon:'🌧️', title:'Heavy Rain',          text:'Serious flood on Ahmadu Bello Way. Roads blocked.',             effect:{ happiness:-10, energy:-5 },      weight:3 },
    { id:'e25', icon:'🎊', title:'New Year Celebration', text:'KD is alive! Celebrations everywhere.',                        effect:{ happiness:30 },                  weight:1 },
    { id:'e26', icon:'🕌', title:'Eid Celebration',      text:'Eid Mubarak! Community celebration lifts your spirit.',        effect:{ happiness:25, health:5 },        weight:1 },
    { id:'e27', icon:'⛪', title:'Christmas Joy',        text:'Merry Christmas from KD! Joy in the air.',                    effect:{ happiness:25 },                  weight:1 },
    // Career events
    { id:'e28', icon:'💼', title:'Job Offer!',           text:'A company wants to hire you. Check the career board!',         effect:{ happiness:20 },                  weight:2 },
    { id:'e29', icon:'📈', title:'Performance Bonus',    text:'Your boss is impressed. ₦15,000 bonus!',                      effect:{ money:15000, happiness:25 },     weight:2 },
    { id:'e30', icon:'😤', title:'Difficult Boss',       text:'Your boss is giving you stress at work today.',                effect:{ happiness:-15, energy:-10 },     weight:3 },
    { id:'e31', icon:'🤝', title:'New Work Contact',     text:'You made a valuable professional connection today.',           effect:{ reputation:5, happiness:10 },    weight:3 },
    { id:'e32', icon:'⚠️', title:'Almost Fired!',        text:'Your boss issued a warning. You need to perform better.',     effect:{ happiness:-20 },                 weight:2 },
    { id:'e33', icon:'🚀', title:'Promotion!',           text:'Congratulations! You got promoted today!',                    effect:{ happiness:30, money:5000 },      weight:1 },
    // Relationship events
    { id:'e34', icon:'❤️', title:'Love Interest!',       text:'Someone caught your eye today. Could be something special.',  effect:{ happiness:20 },                  weight:3 },
    { id:'e35', icon:'💔', title:'Heartbreak',           text:'Your relationship hit a rough patch. Feeling down.',          effect:{ happiness:-25 },                 weight:2 },
    { id:'e36', icon:'👶', title:'New Baby!',            text:'A family member had a new baby. Joy everywhere!',             effect:{ happiness:20 },                  weight:2 },
    { id:'e37', icon:'💍', title:'Wedding Invitation',   text:'Your friend is getting married. You\'re invited!',           effect:{ happiness:15, money:-5000 },     weight:3 },
    { id:'e38', icon:'🤝', title:'Old Friend',           text:'You ran into an old friend from school. Great reunion!',     effect:{ happiness:20 },                  weight:3 },
    { id:'e39', icon:'👨‍👩‍👧', title:'Family Visit',       text:'Your family visited. Warm and supportive.',                  effect:{ happiness:25, energy:-5 },       weight:3 },
    // Education events
    { id:'e40', icon:'🎓', title:'Scholarship!',         text:'You received a partial scholarship! Save ₦50,000 on fees.',  effect:{ money:50000, happiness:30 },     weight:1 },
    { id:'e41', icon:'📚', title:'Free Workshop',        text:'Attended a free skills workshop. Knowledge gained.',          effect:{ skill:10, happiness:10 },        weight:3 },
    { id:'e42', icon:'📝', title:'Failed Exam',          text:'You failed an important test. Study harder!',                 effect:{ happiness:-15, skill:-5 },       weight:2 },
    { id:'e43', icon:'🏆', title:'Exam Success',         text:'You aced your exam! Top of the class!',                      effect:{ happiness:25, skill:10 },        weight:2 },
    // Community/Civic events
    { id:'e44', icon:'🕌', title:'Community Help',       text:'Your community helped you. Feeling supported.',              effect:{ happiness:20, health:10 },       weight:3 },
    { id:'e45', icon:'🌆', title:'Kaduna Development',   text:'New road built near you. Property value rising!',            effect:{ happiness:10 },                  weight:2 },
    { id:'e46', icon:'⚠️', title:'Robbery Attempt',      text:'Someone tried to rob you. Escaped safely but shaken.',      effect:{ happiness:-20, health:-5 },      weight:1 },
    { id:'e47', icon:'🗳️', title:'Local Election',       text:'Election in your ward. The community is buzzing.',          effect:{ happiness:5 },                   weight:2 },
    { id:'e48', icon:'🌟', title:'Community Award',      text:'You received recognition from your community!',             effect:{ reputation:15, happiness:25 },   weight:1 },
    // Business events
    { id:'e49', icon:'💰', title:'Business Deal',        text:'A big contract came your way. ₦50,000 deal!',               effect:{ money:50000, happiness:20 },     weight:1 },
    { id:'e50', icon:'📉', title:'Business Loss',        text:'A business deal fell through. Lost investment.',             effect:{ money:-20000, happiness:-20 },   weight:1 },
    { id:'e51', icon:'🤝', title:'Business Partner',     text:'Someone wants to partner with you on a venture.',           effect:{ happiness:15, reputation:5 },    weight:2 },
    { id:'e52', icon:'💡', title:'Business Idea',        text:'A brilliant idea struck you today. Write it down!',         effect:{ happiness:10, skill:5 },         weight:3 },
    // Random/Fun events
    { id:'e53', icon:'🌟', title:'Viral Moment',         text:'Something you did went viral in KD. 15 min of fame!',       effect:{ reputation:20, happiness:20 },   weight:1 },
    { id:'e54', icon:'🎯', title:'Lucky Day',            text:'Everything is going your way today!',                       effect:{ happiness:20, energy:10 },       weight:2 },
    { id:'e55', icon:'🌪️', title:'Dust Storm',           text:'Harmattan is intense today. Stay indoors if you can.',      effect:{ health:-5, happiness:-5 },       weight:3 },
    { id:'e56', icon:'🦟', title:'Mosquito Night',       text:'Couldn\'t sleep well. Mosquitoes everywhere.',              effect:{ energy:-20, health:-5 },         weight:4 },
    { id:'e57', icon:'🎂', title:'Birthday!',            text:'Happy birthday! You aged another year in KD.',              effect:{ happiness:15 },                  weight:1 },
    { id:'e58', icon:'📺', title:'Football Match',       text:'Nigeria won! You celebrated with the whole street.',        effect:{ happiness:20 },                  weight:2 },
    { id:'e59', icon:'🙏', title:'Answered Prayer',      text:'Something you\'ve been praying for came through.',         effect:{ happiness:30, health:10 },       weight:2 },
    { id:'e60', icon:'🌈', title:'Good Samaritan',       text:'You helped a stranger today. Feels good.',                  effect:{ happiness:15, reputation:5 },    weight:3 },
  ],

  // ── Life Story Templates ──────────────────────────────────
  storyMilestones: [
    { trigger:'firstJob',      text:'Got their first job as {job} in Kaduna.' },
    { trigger:'firstMillion',  text:'Crossed ₦1,000,000 in savings for the first time!' },
    { trigger:'firstHouse',    text:'Bought their first property — a {house} in Kaduna.' },
    { trigger:'firstCar',      text:'Drove off in their first car — a {car}.' },
    { trigger:'graduated',     text:'Graduated with a {degree} from KD.' },
    { trigger:'married',       text:'Got married in Kaduna. A new chapter begins.' },
    { trigger:'firstChild',    text:'Welcomed their first child into the world.' },
    { trigger:'startedBiz',    text:'Started a {business} business in Kaduna.' },
    { trigger:'promoted',      text:'Got promoted to {title} — years of hard work paying off.' },
    { trigger:'wentBroke',     text:'Hit rock bottom financially. But refused to give up.' },
    { trigger:'tenMillion',    text:'Reached ₦10,000,000. A Kaduna success story.' },
    { trigger:'politician',    text:'Entered politics as a {title} — serving the people of KD.' },
  ],

  // ── Achievements ─────────────────────────────────────────
  achievements: [
    { id:'first_job',    icon:'💼', title:'First Job',        desc:'Get your first job in KD.',               check: s => s.career.currentJob !== null },
    { id:'first_million',icon:'💰', title:'₦1 Million',       desc:'Save up ₦1,000,000.',                    check: s => s.finance.savings >= 1000000 },
    { id:'first_house',  icon:'🏠', title:'Property Owner',   desc:'Own your first property.',               check: s => s.housing.owned.length > 0 },
    { id:'first_car',    icon:'🚗', title:'Car Owner',        desc:'Buy your first vehicle.',                check: s => s.transport.owned.length > 0 },
    { id:'graduated',    icon:'🎓', title:'Graduate',         desc:'Complete a degree or diploma.',          check: s => s.education.degrees.length > 0 },
    { id:'married',      icon:'💍', title:'Married',          desc:'Get married in KD.',                     check: s => s.relationships.married },
    { id:'first_child',  icon:'👶', title:'Parent',           desc:'Have your first child.',                 check: s => s.relationships.children > 0 },
    { id:'biz_owner',    icon:'🏭', title:'Business Owner',   desc:'Start your own business.',               check: s => s.business.owned.length > 0 },
    { id:'ten_million',  icon:'💎', title:'KD Tycoon',        desc:'Accumulate ₦10,000,000.',               check: s => (s.finance.cash + s.finance.savings) >= 10000000 },
    { id:'rep_master',   icon:'🌟', title:'Community Legend', desc:'Reach 80+ reputation.',                 check: s => s.character.reputation >= 80 },
    { id:'skill_master', icon:'🧠', title:'Skill Master',     desc:'Reach 90+ skill level.',                check: s => s.character.skill >= 90 },
    { id:'day_100',      icon:'📅', title:'100 Days in KD',   desc:'Survive 100 days in Kaduna.',           check: s => s.time.day >= 100 },
    { id:'day_365',      icon:'🎂', title:'One Full Year',    desc:'Live a full year in Kaduna.',           check: s => s.time.day >= 365 },
  ],

};
