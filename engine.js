// ═══════════════════════════════════════════════════════════
//  KD LIFE — 2D Canvas Engine
// ═══════════════════════════════════════════════════════════

const Engine = (() => {

  let canvas, ctx, W, H, animFrame, running = false;
  let tick = 0;
  let timeOfDay = 0;
  const DAY_TICKS = 3600;
  const MAP_W = 1800, MAP_H = 1440;

  const cam    = { x: 0, y: 0 };
  const player = { x: 640, y: 500, w: 28, h: 36, speed: 2.8, dir: 'down', frame: 0, animTick: 0, moving: false, avatar: '🧑🏿', name: 'Player' };
  const npcs   = [];
  const trees  = [];
  const cars   = [];

  // ── Road grid ─────────────────────────────────────────────
  const roads = [
    { x:0,    y:180,  w:MAP_W, h:70 },
    { x:0,    y:500,  w:MAP_W, h:70 },
    { x:0,    y:820,  w:MAP_W, h:70 },
    { x:0,    y:1140, w:MAP_W, h:70 },
    { x:180,  y:0,    w:70,    h:MAP_H },
    { x:540,  y:0,    w:70,    h:MAP_H },
    { x:900,  y:0,    w:70,    h:MAP_H },
    { x:1260, y:0,    w:70,    h:MAP_H },
    { x:1560, y:0,    w:70,    h:MAP_H },
  ];

  // ── Buildings (match data.js location ids) ────────────────
  const buildings = [
    { id:'home',       x:250,  y:30,   w:180, h:130, color:'#2ecc71', dark:'#1a7a42', label:'🏠 Home'        },
    { id:'market',     x:620,  y:30,   w:220, h:130, color:'#e67e22', dark:'#a04a0a', label:'🏪 Market'       },
    { id:'school',     x:980,  y:30,   w:200, h:130, color:'#3498db', dark:'#1a5a8a', label:'🏫 School'       },
    { id:'university', x:1340, y:30,   w:190, h:130, color:'#2980b9', dark:'#1a4a6a', label:'🎓 Poly'         },
    { id:'hospital',   x:250,  y:300,  w:210, h:150, color:'#e74c3c', dark:'#8a1a1a', label:'🏥 Hospital'     },
    { id:'office',     x:620,  y:300,  w:220, h:150, color:'#9b59b6', dark:'#5a2a7a', label:'🏢 Office'       },
    { id:'bank',       x:980,  y:300,  w:200, h:150, color:'#34495e', dark:'#1a2530', label:'🏦 Bank'         },
    { id:'park',       x:1340, y:300,  w:190, h:150, color:'#27ae60', dark:'#145a30', label:'🌳 Park'         },
    { id:'mosque',     x:250,  y:620,  w:190, h:170, color:'#1abc9c', dark:'#0a6a5a', label:'🕌 Mosque'       },
    { id:'church',     x:620,  y:620,  w:200, h:170, color:'#8e44ad', dark:'#4a1a6a', label:'⛪ Church'       },
    { id:'mall',       x:980,  y:620,  w:230, h:170, color:'#c0392b', dark:'#7a1a10', label:'🛍️ Mall'         },
    { id:'nightspot',  x:1340, y:620,  w:190, h:170, color:'#d35400', dark:'#7a2a00', label:'🍻 Night Spot'   },
    { id:'motorpark',  x:250,  y:940,  w:200, h:160, color:'#16a085', dark:'#0a5040', label:'🛺 Motor Park'   },
    { id:'realestate', x:620,  y:940,  w:210, h:160, color:'#f39c12', dark:'#b7770d', label:'🏠 Properties'   },
    { id:'bizcentre',  x:980,  y:940,  w:220, h:160, color:'#e74c3c', dark:'#8a1a1a', label:'🏭 Business'     },
  ];

  let nearBuilding = null;

  // ── District labels ───────────────────────────────────────
  const districts = [
    { name:'GRA',          x:900,  y:270,  color:'rgba(255,255,255,0.15)' },
    { name:'BARNAWA',      x:200,  y:580,  color:'rgba(255,255,255,0.12)' },
    { name:'CITY CENTRE',  x:550,  y:580,  color:'rgba(255,255,255,0.12)' },
    { name:'UNGWAN RIMI',  x:900,  y:580,  color:'rgba(255,255,255,0.12)' },
    { name:'RIGASA',       x:200,  y:900,  color:'rgba(255,255,255,0.1)'  },
    { name:'INDUSTRIAL',   x:900,  y:900,  color:'rgba(255,255,255,0.1)'  },
  ];

  // ── Init ──────────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('gameCanvas');
    ctx    = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    spawnTrees();
    spawnCars();
    spawnNPCs();
  }

  function resize() {
    // Wait until the canvas wrapper is actually visible and has size
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!wrapper) return;
    const cw = wrapper.clientWidth;
    const ch = wrapper.clientHeight;
    // Only resize if we get real dimensions
    if (cw > 0 && ch > 0) {
      W = canvas.width  = cw;
      H = canvas.height = ch;
    }
  }

  function start() {
    // Always stop any existing loop first
    stop();
    // Small delay so the screen is visible and has real dimensions
    setTimeout(() => {
      resize();
      // If canvas still has no size, try again
      if (!W || !H || W < 10 || H < 10) {
        const wrapper = document.querySelector('.canvas-wrapper');
        W = canvas.width  = wrapper ? wrapper.offsetWidth  : window.innerWidth;
        H = canvas.height = wrapper ? wrapper.offsetHeight : Math.floor(window.innerHeight * 0.55);
      }
      running = true;
      loop();
    }, 60);
  }

  function stop() {
    running = false;
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  }

  function loop() {
    if (!running) return;
    update();
    draw();
    animFrame = requestAnimationFrame(loop);
  }

  // ── Update ────────────────────────────────────────────────
  function update() {
    tick++;
    timeOfDay = (tick % DAY_TICKS) / DAY_TICKS;
    updateTimeLabel();
    movePlayer();
    moveNPCs();
    moveCars();
    checkInteraction();

    // Day advances automatically every DAY_TICKS frames (~60 seconds real time)
    // This means one in-game day = 1 minute of play
    if (tick % DAY_TICKS === 0) {
      GameState.dailyTick();
      Systems.triggerRandomEvent(0.3);
      if (typeof UI !== 'undefined') {
        UI.updateHUD();
        UI.notify('📅 Day ' + GameState.get().time.day + ' in Kaduna!');
      }
    }
  }

  function updateTimeLabel() {
    const el  = document.getElementById('timeLabel');
    const bar = document.getElementById('dayProgFill');
    const pct = Math.round(timeOfDay * 100);
    if (bar) bar.style.width = pct + '%';
    if (!el) return;
    if      (timeOfDay < 0.25) el.textContent = '🌅 Morning';
    else if (timeOfDay < 0.5)  el.textContent = '☀️ Afternoon';
    else if (timeOfDay < 0.75) el.textContent = '🌆 Evening';
    else                       el.textContent = '🌙 Night';
  }

  // ── Draw ──────────────────────────────────────────────────
  function draw() {
    if (!W || !H || W < 10 || H < 10) { resize(); return; }
    ctx.clearRect(0, 0, W, H);
    cam.x = clamp(player.x - W / 2, 0, MAP_W - W);
    cam.y = clamp(player.y - H / 2, 0, MAP_H - H);
    ctx.save();
    ctx.translate(-cam.x, -cam.y);
    drawGround();
    drawRoads();
    drawRoadMarkings();
    drawDistricts();
    drawTrees();
    drawBuildings();
    drawCars();
    drawNPCs();
    drawPlayer();
    ctx.restore();
    drawDayNight();
    drawMiniMap();
  }

  function drawGround() {
    ctx.fillStyle = '#1e3a24';
    ctx.fillRect(0, 0, MAP_W, MAP_H);
    ctx.fillStyle = '#224429';
    for (let gx = 0; gx < MAP_W; gx += 100) {
      for (let gy = 0; gy < MAP_H; gy += 100) {
        if ((gx/100 + gy/100) % 2 === 0) ctx.fillRect(gx, gy, 100, 100);
      }
    }
  }

  function drawRoads() {
    ctx.fillStyle = '#2d2d2d';
    roads.forEach(r => ctx.fillRect(r.x, r.y, r.w, r.h));
  }

  function drawRoadMarkings() {
    ctx.strokeStyle = '#f0c040';
    ctx.lineWidth   = 2;
    ctx.setLineDash([22, 15]);
    [215, 535, 855, 1175].forEach(ry => {
      ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(MAP_W, ry); ctx.stroke();
    });
    [215, 575, 935, 1295, 1595].forEach(rx => {
      ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx, MAP_H); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    [180,500,820,1140].forEach(ry => {
      [180,540,900,1260,1560].forEach(rx => {
        for (let z = 0; z < 7; z++) ctx.fillRect(rx + 4 + z*9, ry, 5, 70);
      });
    });
  }

  function drawDistricts() {
    ctx.font = 'bold 13px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    districts.forEach(d => {
      ctx.fillStyle = d.color;
      ctx.fillText(d.name, d.x + 200, d.y);
    });
  }

  function spawnTrees() {
    const pos = [
      [70,70],[120,70],[70,130],[450,70],[450,130],[460,380],[70,380],
      [810,70],[810,130],[810,380],[1170,70],[1170,130],[1170,380],
      [1470,70],[1470,130],[1470,380],
      [70,620],[70,680],[450,620],[450,680],[810,620],[810,680],
      [1170,620],[1170,680],[1470,620],[1470,680],
      [70,920],[450,920],[810,920],[1170,920],[1470,920],
    ];
    pos.forEach(([x, y]) => trees.push({ x, y, r: 14 + Math.random() * 9, sway: Math.random() * Math.PI * 2 }));
  }

  function drawTrees() {
    trees.forEach(t => {
      t.sway += 0.014;
      const sw = Math.sin(t.sway) * 1.5;
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.ellipse(t.x+2, t.y+t.r*0.6, t.r*0.7, t.r*0.3, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#5d3a1a'; ctx.fillRect(t.x-3+sw*0.3, t.y-4, 6, 12);
      const g = ctx.createRadialGradient(t.x+sw, t.y-8, 2, t.x+sw, t.y-8, t.r);
      g.addColorStop(0, '#4caf50'); g.addColorStop(1, '#1b5e20');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(t.x+sw, t.y-6, t.r, 0, Math.PI*2); ctx.fill();
    });
  }

  function spawnCars() {
    const palette = ['#e74c3c','#3498db','#f1c40f','#95a5a6','#2ecc71','#e67e22','#fff','#9b59b6'];
    [250,570,890,1210].forEach((y, i) => cars.push({ x:Math.random()*MAP_W, y, speed:0.8+Math.random()*0.9, dir:i%2===0?1:-1, axis:'h', color:palette[i%palette.length], w:34, h:19 }));
    [250,610,970,1330,1630].forEach((x, i) => cars.push({ x, y:Math.random()*MAP_H, speed:0.8+Math.random()*0.9, dir:i%2===0?1:-1, axis:'v', color:palette[(i+3)%palette.length], w:19, h:34 }));
  }

  function moveCars() {
    cars.forEach(c => {
      if (c.axis === 'h') { c.x += c.speed * c.dir; if (c.x > MAP_W+50) c.x=-50; if (c.x<-50) c.x=MAP_W+50; }
      else                { c.y += c.speed * c.dir; if (c.y > MAP_H+50) c.y=-50; if (c.y<-50) c.y=MAP_H+50; }
    });
  }

  function drawCars() {
    cars.forEach(c => {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(c.x+c.w/2+2, c.y+c.h*0.8, c.w*0.45, c.h*0.2, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, 4); ctx.fill();
      ctx.fillStyle = 'rgba(160,210,255,0.65)';
      if (c.axis==='h') ctx.fillRect(c.x+(c.dir>0?c.w*0.55:4), c.y+3, c.w*0.3, c.h-6);
      else              ctx.fillRect(c.x+3, c.y+(c.dir>0?c.h*0.55:4), c.w-6, c.h*0.3);
      ctx.fillStyle='#111';
      [[3,2],[c.w-7,2],[3,c.h-6],[c.w-7,c.h-6]].forEach(([wx,wy])=>{ ctx.beginPath(); ctx.ellipse(c.x+wx,c.y+wy,4,3,0,0,Math.PI*2); ctx.fill(); });
    });
  }

  function spawnNPCs() {
    const roadH = [250,570,890,1210];
    const roadV = [250,610,970,1330,1630];
    const emojis = ['👨🏿','👩🏿','👨🏾','👩🏾','👨🏽','👩🏽','🧔🏿','👱🏿‍♀️','🧕🏿','👲'];
    const names  = KD_DATA.npcs.map(n => n.name);
    for (let i = 0; i < 22; i++) {
      const onH = Math.random() > 0.5;
      const x   = onH ? Math.random()*MAP_W : roadV[Math.floor(Math.random()*roadV.length)] + 5 + Math.random()*20;
      const y   = onH ? roadH[Math.floor(Math.random()*roadH.length)] + 5 + Math.random()*20 : Math.random()*MAP_H;
      npcs.push({ x, y, emoji:emojis[i%emojis.length], name:names[i%names.length], speed:0.4+Math.random()*0.7, dir:Math.random()>0.5?1:-1, axis:onH?'h':'v', frame:0, animTick:0, pauseTick:0, paused:false, bobOffset:Math.random()*Math.PI*2 });
    }
  }

  function moveNPCs() {
    npcs.forEach(n => {
      n.animTick++;
      if (!n.paused && Math.random() < 0.001) { n.paused = true; n.pauseTick = 60+Math.floor(Math.random()*120); }
      if (n.paused) { n.pauseTick--; if (n.pauseTick <= 0) n.paused = false; return; }
      if (n.axis==='h') { n.x+=n.speed*n.dir; if(n.x>MAP_W-20||n.x<20) n.dir*=-1; }
      else              { n.y+=n.speed*n.dir; if(n.y>MAP_H-20||n.y<20) n.dir*=-1; }
      if (n.animTick % 12 === 0) n.frame = (n.frame+1)%4;
    });
  }

  function drawNPCs() {
    npcs.forEach(n => {
      const bob = Math.sin(n.bobOffset + tick*0.12) * (n.paused ? 0 : 2);
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(n.x, n.y+14, 10, 5, 0, 0, Math.PI*2); ctx.fill();
      if (!n.paused) {
        const sw = Math.sin(tick*0.18)*5;
        ctx.fillStyle = '#333';
        ctx.fillRect(n.x-4+sw, n.y+8+bob, 5, 10);
        ctx.fillRect(n.x-1-sw, n.y+8+bob, 5, 10);
      }
      ctx.fillStyle = `hsl(${(n.name.charCodeAt(0)*37)%360},60%,50%)`;
      ctx.beginPath(); ctx.roundRect(n.x-7, n.y-4+bob, 14, 13, 2); ctx.fill();
      ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText(n.emoji, n.x, n.y-2+bob);
      const dist = Math.hypot(n.x-player.x, n.y-player.y);
      if (dist < 85) {
        ctx.fillStyle='rgba(0,0,0,0.6)';
        ctx.font='10px Poppins,sans-serif';
        const tw = ctx.measureText(n.name).width+8;
        ctx.beginPath(); ctx.roundRect(n.x-tw/2, n.y-40+bob, tw, 16, 4); ctx.fill();
        ctx.fillStyle='#fff'; ctx.fillText(n.name, n.x, n.y-27+bob);
      }
    });
  }

  function drawBuildings() {
    buildings.forEach(b => {
      const isNear = nearBuilding && nearBuilding.id === b.id;
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(b.x+6, b.y+6, b.w, b.h);
      const g = ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
      g.addColorStop(0,b.color); g.addColorStop(1,b.dark);
      ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(b.x,b.y,b.w,b.h,6); ctx.fill();
      ctx.strokeStyle=isNear?'#fff':'rgba(255,255,255,0.12)'; ctx.lineWidth=isNear?3:1;
      ctx.beginPath(); ctx.roundRect(b.x,b.y,b.w,b.h,6); ctx.stroke();
      ctx.fillStyle=b.dark; ctx.fillRect(b.x,b.y,b.w,12);
      ctx.fillStyle='rgba(160,210,255,0.45)';
      for (let wx=b.x+12; wx<b.x+b.w-16; wx+=22) {
        for (let wy=b.y+20; wy<b.y+b.h-16; wy+=22) {
          ctx.fillRect(wx,wy,12,12);
          if (timeOfDay>0.7 && Math.sin((wx+wy)*3.7)>0) {
            ctx.fillStyle='rgba(255,220,100,0.7)'; ctx.fillRect(wx,wy,12,12); ctx.fillStyle='rgba(160,210,255,0.45)';
          }
        }
      }
      const dx=b.x+b.w/2-9, dy=b.y+b.h-20;
      ctx.fillStyle=b.dark; ctx.fillRect(dx,dy,18,20);
      ctx.fillStyle='rgba(255,200,100,0.55)'; ctx.fillRect(dx+1,dy+1,16,18);
      ctx.fillStyle=isNear?'#fff':'rgba(255,255,255,0.8)';
      ctx.font=`bold ${isNear?10:9}px Poppins,sans-serif`; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(b.label, b.x+b.w/2, b.y+b.h+5);
      if (isNear) {
        ctx.strokeStyle=`rgba(255,255,255,${0.3+Math.sin(tick*0.1)*0.2})`; ctx.lineWidth=3;
        const p=4+Math.sin(tick*0.1)*4;
        ctx.beginPath(); ctx.roundRect(b.x-p,b.y-p,b.w+p*2,b.h+p*2,6+p); ctx.stroke();
      }
    });
  }

  function movePlayer() {
    const keys = Controls.keys;
    let mx=0, my=0;
    if (keys.left  || keys.a) { mx=-1; player.dir='left'; }
    if (keys.right || keys.d) { mx= 1; player.dir='right'; }
    if (keys.up    || keys.w) { my=-1; player.dir='up'; }
    if (keys.down  || keys.s) { my= 1; player.dir='down'; }
    if (mx&&my) { mx*=0.707; my*=0.707; }
    player.moving = mx!==0||my!==0;
    const nx = clamp(player.x + mx*player.speed, 16, MAP_W-16);
    const ny = clamp(player.y + my*player.speed, 20, MAP_H-20);
    let blocked = false;
    buildings.forEach(b => {
      if (nx+10>b.x && nx-10<b.x+b.w && ny+14>b.y && ny-4<b.y+b.h) blocked=true;
    });
    if (!blocked) { player.x=nx; player.y=ny; }
    if (player.moving) { player.animTick++; if(player.animTick%10===0) player.frame=(player.frame+1)%4; } else player.frame=0;
  }

  function drawPlayer() {
    const x=player.x, y=player.y;
    const bob = player.moving ? Math.sin(tick*0.22)*3 : 0;
    ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x,y+16,12,5,0,0,Math.PI*2); ctx.fill();
    const lg = player.moving ? Math.sin(tick*0.22)*7 : 0;
    ctx.fillStyle='#1a237e'; ctx.fillRect(x-6+lg,y+6+bob,8,12); ctx.fillRect(x-2-lg,y+6+bob,8,12);
    ctx.fillStyle='#5d4037'; ctx.fillRect(x-7+lg,y+16+bob,10,5); ctx.fillRect(x-3-lg,y+16+bob,10,5);
    ctx.fillStyle='#27ae60'; ctx.beginPath(); ctx.roundRect(x-10,y-8+bob,20,16,3); ctx.fill();
    const ag = player.moving ? Math.sin(tick*0.22)*6 : 0;
    ctx.fillStyle='#1a6b3a'; ctx.fillRect(x-16,y-6-ag+bob,7,12); ctx.fillRect(x+9,y-6+ag+bob,7,12);
    ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillText(player.avatar,x,y-6+bob);
    ctx.fillStyle='#fff'; ctx.font='bold 10px Poppins,sans-serif'; ctx.textBaseline='bottom'; ctx.fillText(player.name,x,y-28+bob);
    ctx.fillStyle='#f1c40f'; ctx.font='14px serif'; ctx.fillText('▼',x,y-36+bob);
  }

  function drawDayNight() {
    let alpha=0;
    if      (timeOfDay<0.25) alpha=0.4*(1-timeOfDay/0.25);
    else if (timeOfDay<0.5)  alpha=0;
    else if (timeOfDay<0.75) alpha=0.55*((timeOfDay-0.5)/0.25);
    else                     alpha=0.55;
    if (alpha>0) { ctx.fillStyle=`rgba(5,10,30,${alpha})`; ctx.fillRect(0,0,W,H); }
    if (timeOfDay>0.7) {
      const sa=Math.min(1,(timeOfDay-0.7)/0.1);
      for (let s=0;s<50;s++) {
        const sx=((s*137+50)%W), sy=((s*89+30)%(H*0.4));
        ctx.globalAlpha=sa*(Math.sin(tick*0.05+s)*0.5+0.5);
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(sx,sy,1.5,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
    }
  }

  function drawMiniMap() {
    const mw=100, mh=80, mx2=W-110, my2=10;
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(mx2,my2,mw,mh);
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1; ctx.strokeRect(mx2,my2,mw,mh);
    const sx=mw/MAP_W, sy=mh/MAP_H;
    buildings.forEach(b => {
      ctx.fillStyle=b.color+'99'; ctx.fillRect(mx2+b.x*sx,my2+b.y*sy,b.w*sx,b.h*sy);
    });
    ctx.fillStyle='#f1c40f'; ctx.beginPath();
    ctx.arc(mx2+player.x*sx, my2+player.y*sy, 2.5, 0, Math.PI*2); ctx.fill();
  }

  function checkInteraction() {
    nearBuilding = null;
    let minDist  = 65;
    buildings.forEach(b => {
      const dist = Math.hypot(player.x-(b.x+b.w/2), player.y-(b.y+b.h));
      if (dist < minDist) { minDist=dist; nearBuilding=b; }
    });
    const prompt = document.getElementById('interactPrompt');
    const txt    = document.getElementById('interactText');
    if (nearBuilding) {
      if (txt) txt.textContent = `E — Enter ${nearBuilding.label}`;
      prompt?.classList.remove('hidden');
    } else {
      prompt?.classList.add('hidden');
    }
  }

  function interact() { if (nearBuilding) UI.enterBuilding(nearBuilding.id); }
  function setPlayer(name, avatar) { player.name=name; player.avatar=avatar; }
  function clamp(v,mn,mx) { return Math.max(mn,Math.min(mx,v)); }

  return { init, start, stop, interact, setPlayer, player, buildings };

})();

// ── Controls ──────────────────────────────────────────────
const Controls = (() => {
  const keys = {};
  function press(k)   { keys[k]=true; }
  function release(k) { keys[k]=false; }
  function interact() { Engine.interact(); }

  window.addEventListener('keydown', e => {
    const m = { ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'a',d:'d',w:'w',s:'s',KeyA:'a',KeyD:'d',KeyW:'w',KeyS:'s' };
    const k = m[e.key]||m[e.code];
    if (k) { keys[k]=true; e.preventDefault(); }
    if (e.key==='e'||e.key==='E'||e.code==='KeyE') Engine.interact();
  });
  window.addEventListener('keyup', e => {
    const m = { ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'a',d:'d',w:'w',s:'s',KeyA:'a',KeyD:'d',KeyW:'w',KeyS:'s' };
    const k = m[e.key]||m[e.code];
    if (k) keys[k]=false;
  });

  return { keys, press, release, interact };
})();
