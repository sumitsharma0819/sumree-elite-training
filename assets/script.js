/* ─── CARB TIMING ENGINE ─── */
function calcCarbTiming(){
  const total = +el('carbTotal').value;
  const session = el('carbSession').value;
  const trainTime = el('carbTrainTime').value;
  
  let preWorkout, duringWorkout, postWorkout, remaining, notes;
  
  if(session === 'compound'){
    preWorkout = Math.round(total * 0.25);
    duringWorkout = Math.round(total * 0.10);
    postWorkout = Math.round(total * 0.30);
    remaining = total - preWorkout - duringWorkout - postWorkout;
    notes = 'Compound days demand the most pre-loading. Front-loading carbs suppresses cortisol, tops off muscle glycogen, and directly improves top-set performance. The post-workout window is the second most anabolic carb slot of the day.';
  } else if(session === 'hypertrophy'){
    preWorkout = Math.round(total * 0.20);
    duringWorkout = 0;
    postWorkout = Math.round(total * 0.25);
    remaining = total - preWorkout - postWorkout;
    notes = 'Hypertrophy days are moderate intensity — front-load less, but keep the post-workout window well-fed to maximize muscle protein synthesis during the 2-hour repair window.';
  } else if(session === 'hike'){
    preWorkout = Math.round(total * 0.20);
    duringWorkout = Math.round(total * 0.20);
    postWorkout = Math.round(total * 0.25);
    remaining = total - preWorkout - duringWorkout - postWorkout;
    notes = 'Hike days are extended Zone 2 efforts — the most glycogen-depleting event in your week. During-hike carbs (real food: dates, banana, rice cakes) prevent bonking and protect the right ankle from fatigue-driven instability. Replenish aggressively post-hike before arm work.';
  } else {
    preWorkout = 0;
    duringWorkout = 0;
    postWorkout = 0;
    remaining = total;
    notes = 'Rest/recovery days: distribute all carbs across meals evenly. No need for peri-workout strategy. Keep protein high and use the lower carb total to accelerate fat oxidation.';
  }
  
  const timeLabels = {
    morning: {pre:'6:00–6:30am',during:'During session',post:'10:00–10:30am',rest:'Lunch + Dinner'},
    midday: {pre:'9:30–10:30am',during:'During session',post:'1:30–2:00pm',rest:'Dinner + Breakfast tomorrow'},
    afternoon: {pre:'1:30–2:30pm',during:'During session',post:'6:00–6:30pm',rest:'Breakfast + Lunch'},
    evening: {pre:'4:30–5:30pm',during:'During session',post:'8:30–9:00pm',rest:'Breakfast + Lunch'}
  };
  const times = timeLabels[trainTime] || timeLabels.afternoon;
  
  let html = '<div class="stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:10px">';
  if(preWorkout > 0) html += `<div class="stat orange"><div class="label">Pre-WO</div><div class="val">${preWorkout}g</div><div class="note">${times.pre}</div></div>`;
  if(duringWorkout > 0) html += `<div class="stat yellow"><div class="label">During</div><div class="val">${duringWorkout}g</div><div class="note">${times.during}</div></div>`;
  if(postWorkout > 0) html += `<div class="stat green"><div class="label">Post-WO</div><div class="val">${postWorkout}g</div><div class="note">${times.post}</div></div>`;
  html += `<div class="stat blue"><div class="label">Rest of day</div><div class="val">${remaining}g</div><div class="note">${times.rest}</div></div>`;
  html += '</div>';
  html += `<div class="info" style="font-size:.84rem">${notes}</div>`;
  
  el('carbTimingResult').innerHTML = html;
  pulse(['carbTimingResult']);
}

/* ─── PHASE PROGRESS ─── */
function updatePhaseProgress(){
  const cur = +el('progressWeight').value;
  const start = +el('progressStart').value;
  const goal = +el('progressGoal').value;
  if(!cur || !start || !goal || start <= goal) return;
  
  const lost = +(start - cur).toFixed(1);
  const remaining = +(cur - goal).toFixed(1);
  const pct = Math.round(Math.min(100, Math.max(0, (lost/(start-goal))*100)));
  const weeksLeft = remaining > 0 ? Math.ceil(remaining / 0.75) : 0;
  
  const fill = el('transformBarFill');
  if(fill) fill.style.width = pct + '%';
  
  const pctEl = el('transformPct');
  if(pctEl) pctEl.textContent = pct + '% complete';
  
  const lostEl = el('progressLost');
  if(lostEl) lostEl.textContent = lost > 0 ? lost : '0';
  
  const remEl = el('progressRemaining');
  if(remEl) remEl.textContent = remaining > 0 ? remaining : '🎯 Done';
  
  const wkEl = el('progressWeeks');
  if(wkEl) wkEl.textContent = weeksLeft > 0 ? '~'+weeksLeft : '✅';
  
  const badge = el('phaseProgressBadge');
  if(badge){
    const weekNum = weeksLeft > 0 ? Math.max(1, Math.ceil((lost/(start-goal))*12)) : 12;
    badge.textContent = 'Week '+weekNum+' of 12';
  }
}

/* ─── HIKE LOG ─── */
const hikeLog = [];

function logHike(){
  const dist = +el('hikeDist').value;
  const ele = +el('hikeEle').value;
  const dur = +el('hikeDur').value;
  const ankle = +el('hikeAnkle').value;
  const knee = +el('hikeKnee').value;
  const effort = +el('hikeEffort').value;
  const date = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
  
  if(!dist && !dur){ el('hikeResult').innerHTML='<div class="small" style="color:var(--red)">Enter at least distance and duration.</div>'; return; }
  
  const pace = dur > 0 ? (dur/dist).toFixed(1) : '—';
  const vert = dist > 0 ? Math.round(ele/dist) : 0;
  
  hikeLog.unshift({date,dist,ele,dur,ankle,knee,effort,pace,vert});
  if(hikeLog.length > 6) hikeLog.pop();
  
  // Joint signal interpretation
  let jointMsg = '';
  if(ankle > 3 || knee > 3){
    jointMsg = '⚠️ Joint signal elevated post-hike. Prioritize ankle rotation and knee work on Monday. Consider adding tibialis raises and terminal knee extensions before Thursday legs.';
  } else if(ankle > 1 || knee > 1){
    jointMsg = '🟡 Mild soreness noted. Continue standard rehab rotation. No changes to Thursday loading needed unless it persists.';
  } else {
    jointMsg = '✅ Joints quiet post-hike. Good tissue response. Thursday leg session proceeds as planned.';
  }
  
  // Vert gain quality
  let vertMsg = '';
  if(vert > 150) vertMsg = 'High elevation density — excellent eccentric knee stimulus.';
  else if(vert > 75) vertMsg = 'Moderate elevation — solid Zone 2 conditioning.';
  else vertMsg = 'Flat profile — prioritize duration over elevation this cycle.';
  
  el('hikeResult').innerHTML = `<div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:10px">
    <div class="stat green"><div class="label">Pace</div><div class="val">${pace}</div><div class="note">min/mile</div></div>
    <div class="stat blue"><div class="label">Vert/mile</div><div class="val">${vert}</div><div class="note">ft elevation density</div></div>
    <div class="stat orange"><div class="label">Effort</div><div class="val">${effort}/10</div><div class="note">perceived exertion</div></div>
  </div>
  <div class="${ankle>3||knee>3?'danger-box':ankle>1||knee>1?'warn-box':'good-box'}" style="font-size:.84rem;margin-bottom:8px">${jointMsg}</div>
  <div class="info" style="font-size:.84rem">${vertMsg}</div>`;
  
  renderHikeHistory();
  pulse(['hikeResult']);
}

function renderHikeHistory(){
  const h = el('hikeHistory');
  if(!h || !hikeLog.length) return;
  let html = '<div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-2);margin:14px 0 8px">Recent Hikes</div>';
  hikeLog.forEach(e => {
    const jointMax = Math.max(e.ankle||0, e.knee||0);
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(60,60,67,0.08);font-size:.82rem">
      <span style="color:var(--muted);min-width:56px">${e.date}</span>
      <span style="font-weight:700;color:var(--text-2)">${e.dist}mi · ${e.ele}ft</span>
      <span class="pill" style="font-size:.7rem">${e.pace} min/mi</span>
      <span class="pill ${jointMax>3?'red':jointMax>1?'yellow':'green'}" style="font-size:.7rem">J:${jointMax}</span>
    </div>`;
  });
  h.innerHTML = html;
}

/* ─── ASYMMETRY ENGINE ─── */
function runAsymmetry(){
  const rCalf=+el('asymRCalfR').value;
  const lCalf=+el('asymLCalfR').value;
  const rBal=+el('asymRBalance').value;
  const lBal=+el('asymLBalance').value;
  const rStep=+el('asymRStepUp').value;
  const lStep=+el('asymLStepUp').value;
  const rAnkle=+el('asymRAnkle').value;
  const lAnkle=+el('asymLAnkle').value;
  
  function asymPct(r,l){ if(!l||!r) return null; return Math.round(Math.abs(r-l)/l*100); }
  function side(r,l){ return r<l?'RIGHT deficit':'LEFT deficit'; }
  
  const metrics = [
    {name:'Calf raises', pct:asymPct(rCalf,lCalf), stronger:rCalf>=lCalf?'R':'L', r:rCalf, l:lCalf},
    {name:'Balance', pct:asymPct(rBal,lBal), stronger:rBal>=lBal?'R':'L', r:rBal, l:lBal},
    {name:'Step-ups', pct:asymPct(rStep,lStep), stronger:rStep>=lStep?'R':'L', r:rStep, l:lStep},
  ];
  const painDiff = Math.abs(rAnkle - lAnkle);
  
  let flags = [];
  metrics.forEach(m => {
    if(m.pct === null) return;
    const threshold = 15;
    if(m.pct > threshold && m.stronger === 'L'){
      flags.push({level:'red', text:`${m.name}: RIGHT is ${m.pct}% weaker than LEFT (${m.r} vs ${m.l}). Exceeds ${threshold}% threshold. Add 1 extra set right-side only until gap is <10%.`});
    } else if(m.pct > threshold && m.stronger === 'R'){
      flags.push({level:'yellow', text:`${m.name}: LEFT is ${m.pct}% weaker (${m.l} vs ${m.r}). Monitor — does not affect load decisions but note the pattern.`});
    } else if(m.pct !== null){
      flags.push({level:'green', text:`${m.name}: ${m.pct}% difference — within tolerance. Continue bilateral loading as written.`});
    }
  });
  
  if(painDiff > 2){
    flags.unshift({level:'red', text:`Pain differential: Right ankle ${rAnkle}/10 vs Left ${lAnkle}/10 — difference of ${painDiff} points. Reduce right-side load by 15% immediately. Do not chase bilateral symmetry through pain.`});
  }
  
  const c = el('asymmetryResult');
  if(!flags.length){ c.innerHTML='<div class="small" style="color:var(--muted)">Enter values above to analyze.</div>'; return; }
  c.innerHTML = flags.map(f=>'<div class="'+(f.level==='red'?'danger-box':f.level==='yellow'?'warn-box':'good-box')+'" style="margin-bottom:8px;font-size:.84rem">'+f.text+'</div>').join('');
  pulse(['asymmetryResult']);
}

/* ─── NAV ─── */
function showPage(id,btn){
  const pageNode = document.getElementById('page-'+id);
  if(!pageNode) return;
  if(!btn){
    btn=[...document.querySelectorAll('.bnav__btn')].find(b=>b.getAttribute('onclick')?.includes(`'${id}'`)) || null;
  }
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.bnav__btn').forEach(b=>b.classList.remove('active'));
  pageNode.classList.add('active');
  if(btn) btn.classList.add('active');
  pulse([btn, pageNode.querySelector('.page-header')]);
  window.scrollTo(0,0);
}

function showDay(id,btn){
  ['d1','d2','d3','d4','d5','d6','d7'].forEach(d=>{
    const panel=document.getElementById(d);
    if(panel) panel.style.display=d===id?'block':'none';
  });
  document.querySelectorAll('#page-train .day-scroll .day-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateTrainSessionCard(id);
  pulse([btn, document.getElementById(id), 'trainSelectedDay']);
}

function showFormat(f){
  document.getElementById('fmtA').style.display=f==='A'?'block':'none';
  document.getElementById('fmtB').style.display=f==='B'?'block':'none';
  document.getElementById('fmtA-btn').className='segment-btn'+(f==='A'?' active':'');
  document.getElementById('fmtB-btn').className='segment-btn'+(f==='B'?' active':'');
  pulse(['fmtA-btn','fmtB-btn', f==='A'?'fmtA':'fmtB']);
}

function showSite(id,btn){
  ['ankle','knee','shoulder'].forEach(s=>{
    document.getElementById('site-'+s).style.display=s===id?'block':'none';
  });
  document.querySelectorAll('#page-rehab .day-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  pulse([btn, 'site-'+id]);
}

function toggleCheck(el){
  el.classList.toggle('done');
}

function el(id){return document.getElementById(id)}
function pulse(ids){
  ids.forEach(id=>{
    const node=typeof id==='string'?el(id):id;
    if(!node) return;
    node.classList.remove('is-updated');
    void node.offsetWidth;
    node.classList.add('is-updated');
  });
}

const trainSessionData={
  d1:{title:'Monday Push',note:'Shoulder-safe pressing with upper chest and triceps priority. Start with the primer, then open the first compound card.',badge:'~65 min · Main lift first',focus:'Upper chest + triceps',progress:'Top set decides load next time',primer:'Shoulder day + push primer',watch:'Left shoulder quiet, clean lockout'},
  d2:{title:'Tuesday Pull',note:'Lat-width and biceps bias with lumbar-safe pulling. Win the first pull pattern, then build the V-taper work.',badge:'~65 min · Width + arms',focus:'Lats + biceps',progress:'Own top reps before adding load',primer:'Ankle day + pull primer',watch:'Scap control, no low-back takeover'},
  d3:{title:'Wednesday Active Recovery',note:'Recovery-support session with guided mobility tabs and video links so Thursday lifts better, not worse.',badge:'20–25 min · Restore',focus:'Circulation + tissue quality',progress:'No load chase today',primer:'Zone 2 + mobility flow',watch:'Walk, mobility, and zero ego'},
  d4:{title:'Thursday Legs',note:'Hinge strength and unilateral rebuilding with extra right-side attention. Technical reps beat heavier reps.',badge:'~70 min · Lower body',focus:'Posterior chain + right-side rebuild',progress:'Reps first until knee/ankle stay quiet',primer:'Knee day + leg primer',watch:'Right knee tracking, ankle pressure, brace'},
  d5:{title:'Friday Upper',note:'Shape day for delts, arms, and upper back. Think quality contractions and visible physique work, not grinders.',badge:'~60 min · Pump + shape',focus:'Delts + arms + upper back',progress:'Micro-load only after full control',primer:'Shoulder day + upper pump primer',watch:'Own the contraction, don’t chase sloppy fatigue'},
  d6:{title:'Saturday Hike + Arms',note:'The hike is the main event. Treat the arm work as clean post-hike volume, not a second max-effort session.',badge:'Variable · Hike-led',focus:'Conditioning + arm finish',progress:'Volume quality over loading',primer:'Ankle tune-up + arm switch-on',watch:'Reduce joint stress after the hike'},
  d7:{title:'Sunday Rest',note:'Full rest or a gentle walk. Use it to reset joints, sleep, and appetite so Monday starts strong.',badge:'Recovery day',focus:'Recovery + assessment',progress:'No progression today',primer:'None required',watch:'Sleep, hydration, and tissue check-in'}
};

function updateTrainSessionCard(day){
  const data=trainSessionData[day]||trainSessionData.d1;
  const map={trainSelectedDay:data.title,trainSelectedNote:data.note,trainSelectedBadge:data.badge,trainFocusOut:data.focus,trainProgressOut:data.progress,trainPrimerOut:data.primer,trainWatchOut:data.watch};
  Object.entries(map).forEach(([id,val])=>{ const node=el(id); if(node) node.textContent=val; });
}

function goTrainTool(page){
  const btn=[...document.querySelectorAll('.bnav__btn')].find(b=>b.getAttribute('onclick')?.includes(`'${page}'`));
  if(btn) showPage(page,btn);
}

/* ─── READINESS ENGINE ─── */
function setBanner(color,text,sub){
  const b=el('decisionBanner');
  b.className='banner '+color;
  b.innerHTML=text+(sub?'<div class="sub">'+sub+'</div>':'');
}

function runReadiness(){
  const sleep=+el('sleepHours').value;
  const recovery=+el('recoveryScore').value;
  const energy=+el('energyLevel').value;
  const pain=+el('jointPain').value;
  const motivation=+el('motivationLevel').value;
  const session=el('sessionType').value;
  // Normalized readiness score (0-90 possible, pain penalizes)
  const sleepScore=Math.min(sleep/8,1)*30;
  const recoveryPts=recovery*0.25;
  const energyPts=(energy/10)*25;
  const motivPts=(motivation/10)*10;
  const painPenalty=pain*8;
  let score=Math.round(sleepScore+recoveryPts+energyPts+motivPts-painPenalty);
  let mode,load,warmup;
  if(pain>=5||score<55){
    mode='Protect';load='-15%';warmup='15-min Full Body';
    setBanner('red','🔴 Red light: protect tissue. Reduce load today.','Drop heavy loading, use tempo control, keep pain ≤ 3/10. If sleep is the driver: sleep debt elevates cortisol by up to 37%, suppresses testosterone, and directly increases hunger hormones (ghrelin) — it is not a discipline problem, it is a physiology problem. Fix sleep first.');
  } else if(pain>=3||score<70||sleep<6){
    mode='Build';load='-5–10%';warmup='15-min Full Body';
    setBanner('yellow','🟡 Yellow light: quality-first session.','Progress reps or execution instead of chasing load.'+(sleep<6.5?' Note: sub-6.5 hr sleep reduces strength output by ~8–10% and slows fat oxidation. Do not cut calories today — your body needs the fuel to manage with impaired recovery.':''));
  } else if(score>=85&&recovery>=75&&pain<=2){
    mode='Push';load='+0–2.5%';warmup='Rotation';
    setBanner('green','🟢 Green light: push the planned session as written.','Compounds can earn the next load jump if they hit the top of the range cleanly.');
  } else {
    mode='Build';load='0%';warmup=session==='recovery'?'15-min Full Body':'Rotation';
    setBanner('orange','🟠 Orange light: productive, controlled day.','Own the prescribed reps and leave 1–2 reps in reserve on compounds.');
  }
  if(session==='hike'&&pain>=3){load='Reduce descent impact';warmup='Ankle/Knee Rotation';}
  el('modeOut').textContent=mode;
  el('loadOut').textContent=load;
  el('warmupOut').textContent=warmup;
  // Tissue fatigue indicator (0-100, higher = more fatigued)
  const tissueFatigue=Math.min(100,Math.round(pain*12 + (8-Math.min(sleep,8))*6 + (100-recovery)*0.15));
  const tissueState=tissueFatigue<20?'Fresh':tissueFatigue<45?'Manageable':tissueFatigue<65?'Elevated':'High — protect joints';
  const tf=el('tissueFatigueOut');
  if(tf) tf.textContent=tissueState;
  pulse(['decisionBanner','modeOut','loadOut','warmupOut','tissueFatigueOut']);
  
  // Update the coaching stack based on mode
  const s1 = el('stack1'), s2 = el('stack2'), s3 = el('stack3');
  if(s1 && s2 && s3){
    if(mode === 'Protect'){
      s1.textContent = '🔴 Protect mode: drop heavy loading 15%. Keep sets controlled and pain ≤3/10.';
      s2.textContent = 'Use Format A (15-min full-body) warm-up — do not skip on a protect day.';
      s3.textContent = 'Log the session in Hevy anyway. The data matters even on protect days.';
    } else if(mode === 'Push'){
      s1.textContent = '🟢 Push mode: compounds can earn the next load jump if form is clean.';
      s2.textContent = 'Use rotation warm-up — and do not rush the primer sets before your main lift.';
      s3.textContent = 'After the session, use Hevy Coach tab to confirm whether you earned the next step.';
    } else {
      s1.textContent = '🟠 Build/Orange: own the prescribed reps. Leave 1–2 in reserve on compounds.';
      s2.textContent = "Complete today's rehab warm-up before touching a barbell.";
      s3.textContent = 'Log every set in Hevy. Use the Hevy tab after to decide next session.';
    }
  }
}

/* ─── TDEE ENGINE ─── */
function calcTDEE(){
  const wLb=+el('tdeeWeight').value;
  const hIn=+el('tdeeHeight').value;
  const age=+el('tdeeAge').value;
  const act=+el('tdeeActivity').value;
  const goal=el('tdeeGoal').value;
  const bf=+el('tdeeBF').value/100;

  // Mifflin-St Jeor using metric conversion
  const wKg=wLb*0.453592;
  const hCm=hIn*2.54;
  const bmr=10*wKg + 6.25*hCm - 5*age + 5; // male
  const tdee=Math.round(bmr*act);
  
  // Lean body mass
  const lbm=Math.round(wLb*(1-bf));
  
  // Target calories based on goal
  let targetCal, deficitNote, weeklyRate;
  if(goal==='cut'){
    targetCal=tdee-500;
    weeklyRate='~1.0 lb/wk';
    deficitNote='500 kcal/day deficit. Add back 300 kcal on hike day. Do not exceed 700 kcal deficit on any single day — this triggers muscle catabolism.';
  } else if(goal==='build'){
    targetCal=tdee+200;
    weeklyRate='+0.25–0.5 lb/wk';
    deficitNote='Lean surplus of 200 kcal. Minimize fat gain while building lean mass. Audit every 4 weeks.';
  } else {
    targetCal=tdee;
    weeklyRate='±0 lb/wk';
    deficitNote='Maintenance phase. Use to establish true TDEE before next cut or build block.';
  }
  
  // Macro floors
  const proteinG=Math.round(lbm*1.05); // 1.05g per lb of LBM
  const fatG=Math.round(wLb*0.35);     // 0.35g per lb bodyweight (hormonal floor)
  const proteinKcal=proteinG*4;
  const fatKcal=fatG*9;
  const carbKcal=Math.max(0, targetCal-proteinKcal-fatKcal);
  const carbG=Math.round(carbKcal/4);

  el('tdeeOut').textContent=tdee.toLocaleString();
  el('tdeeTarget').textContent=targetCal.toLocaleString();
  el('tdeeLBM').textContent=lbm;
  el('tdeeProtein').textContent=proteinG+'g';
  el('tdeeFat').textContent=fatG+'g';
  el('tdeeCarbs').textContent=carbG+'g';
  el('tdeeRate').textContent=weeklyRate;
  el('tdeeNote').textContent=deficitNote;
  pulse(['tdeeOut','tdeeTarget','tdeeLBM','tdeeProtein','tdeeFat','tdeeCarbs','tdeeRate','tdeeNote']);
}

/* ─── WEEKLY ENGINE ─── */
function runWeekly(){
  const now=+el('avgWeightNow').value;
  const prev=+el('avgWeightPrev').value;
  const cal=+el('currentCalories').value;
  const trend=el('strengthTrend').value;
  const hunger=+el('hungerLevel').value;
  const comp=+el('complianceLevel').value;
  const delta=+(prev-now).toFixed(1);
  let newCal=cal,notes=[];
  if(comp<85){notes.push('Compliance is below 85%: do not cut calories yet. Tighten execution and late-night food control first.');}
  else if(delta>1.2){newCal+=150;notes.push('Loss is faster than target: add ~150 kcal around training to protect muscle and performance.');}
  else if(delta<0.3){newCal-=150;notes.push('Loss is slower than target: reduce by ~150 kcal or add one 15-min Zone 2 walk daily.');}
  else {notes.push('Rate of loss is on target: keep calories steady and win with consistency.');}
  if(trend==='down') notes.push('Strength is slipping: add 25–40g carbs around lifting, protect sleep, do not stack extra fatigue.');
  else if(trend==='up') notes.push('Strength is positive: compounds are responding — hold the structure and keep progression conservative.');
  if(hunger>=8) notes.push('Hunger is high: increase veggie volume, keep dinner protein dense, use a planned protein top-up.');
  notes.push('Updated calorie anchor: ~'+Math.max(1600,newCal)+' kcal on standard training days.');
  const list=el('weeklyList');
  list.innerHTML='';
  notes.forEach(n=>{const li=document.createElement('li');li.textContent=n;list.appendChild(li);});
  pulse(['weeklyList']);
}

/* ─── ATHLETE REVIEW ─── */
function runAthleteReview(){
  const comp=+el('weeklyCompletion').value;
  const sleep=+el('weeklySleep').value;
  const energy=+el('weeklyEnergy').value;
  const pain=+el('weeklyPain').value;
  const loss=+el('weeklyLoss').value;
  const strength=el('weeklyStrength').value;
  const p=[];
  if(comp<85) p.push('Compliance is the bottleneck: simplify the week and execute the minimum effective day instead of adding complexity.');
  if(sleep<7) p.push('Sleep is below the athletic threshold: tighten bedtime, cap caffeine early, and do not add intensity until sleep improves.');
  if(pain>3) p.push('Average pain is too high: shift one heavy day into quality-focused work and keep the deeper rehab rotation as default.');
  if(loss>1.0) p.push('Fat loss is fast: protect performance by adding carbohydrate around training instead of pushing harder.');
  else if(loss<0.3) p.push('Fat loss is slow: tighten food execution or add one low-intensity conditioning block before cutting calories further.');
  else p.push('Rate of loss is in the productive range: keep the deficit steady and let training quality stay high.');
  if(strength==='down') p.push('Strength trend is slipping: reduce fluff volume, keep top sets honest, and bias recovery this week.');
  else if(strength==='up') p.push('Strength trend is positive: you have room to push one top set harder on key compounds this week.');
  if(energy<=6) p.push('Energy is not fully recovered: use one extra 30-minute mobility-walk-rehab day instead of adding more work.');
  if(!p.length) p.push('All systems stable: stay on the current wave and win by repetition, not novelty.');
  const list=el('athletePriorityList');
  list.innerHTML='';
  p.forEach(t=>{const li=document.createElement('li');li.textContent=t;list.appendChild(li);});
  pulse(['athletePriorityList']);
}

/* ─── HEVY COACH ─── */
function maxForRep(t){return t==='5-8'?8:t==='8-10'?10:t==='10-15'?15:20;}
function runHevyCoach(){
  const lc=el('liftClass').value;
  const rt=el('repTarget').value;
  const w=+el('topSetWeight').value;
  const reps=+el('topSetReps').value;
  const rpe=+el('topSetRpe').value;
  const q=+el('qualityScore').value;
  const asym=+el('asymmetryScore').value;
  const joint=+el('jointSignal').value;
  const backoff=+el('backoffDone').value;
  const rmax=maxForRep(rt);
  let next,top,bk,focus,banner;
  if(joint>3||q<7){
    next='Protect and rebuild';top='Reduce 5–10% or slow the eccentric';bk='2 controlled back-off sets only';focus='Joint protection';
    banner='Tissue signal is elevated: this was not a day to chase heavier loading.';
  } else if(lc==='rehab'){
    next='Add control first';top='Add 2 reps, slower tempo, or longer hold';bk='No extra back-off fatigue';focus='Tendon remodeling';
    banner='Rehab work progresses through cleaner control and tissue tolerance, not ego load.';
  } else if(lc==='isolation'){
    if(reps>=rmax&&rpe<=8.5&&q>=8){next='Micro-load';top='Add smallest jump above '+w;}
    else{next='Add reps';top='Keep weight, add 1–2 reps next session';}
    bk='Back-off only if pump quality was high';focus='Hypertrophy';
    banner='Isolation lifts earn reps first, then tiny load jumps once the top of the range is owned.';
  } else if(lc==='secondary'){
    if(reps>=rmax&&rpe<=8.5&&q>=8&&asym<=3){next='Add 2.5–5 lb';top='Increase load slightly next session';}
    else{next='Add 1 rep';top='Keep load fixed and climb within the range';}
    bk=backoff>=2?'-8% to -10% from top set':'Earn full back-off volume before loading up';
    focus='Strength + size';
    banner='Secondary compounds still progress aggressively, but only after symmetry and control stay clean.';
  } else {
    if(reps>=rmax&&rpe<=8.5&&q>=8&&asym<=2){next='Add 5 lb';top='Advance the top set next session';}
    else if(rpe>=9.5){next='Hold and own it';top='Repeat the same load and improve rep quality';}
    else{next='Add 1 rep';top='Stay at the same load until the top of the range is clean';}
    bk=backoff>=2?'-10% to -15% from top set':'Complete full back-off volume before chasing heavier loading';
    focus='Performance';
    banner='Primary compounds progress only when the top set proves you are actually stronger, not just more fired up.';
  }
  el('hevyBanner').className='banner blue';
  el('hevyBanner').textContent=banner;
  el('nextMoveOut').textContent=next;
  el('topSetRuleOut').textContent=top;
  el('backoffRuleOut').textContent=bk;
  el('focusRuleOut').textContent=focus;
  pulse(['hevyBanner','nextMoveOut','topSetRuleOut','backoffRuleOut','focusRuleOut']);
}

/* ─── PHASE WAVE ─── */
function syncPhaseWeekBlocks(week){
  document.querySelectorAll('.week-block').forEach((b)=>{
    const active = b.dataset.week === String(week);
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}
function setPhaseWeek(week, autoRun){
  const select = el('phaseWeek');
  if(select) select.value = String(week);
  syncPhaseWeekBlocks(week);
  if(autoRun) runPhaseWave();
}
function runPhaseWave(){
  const week=el('phaseWeek').value;
  const goal=el('phaseGoal').value;
  const recovery=el('phaseRecovery').value;
  const joints=el('phaseJointFlag').value;
  const comp=+el('phaseCompliance').value;
  const strength=el('phaseStrengthTrend').value;
  let emphasis,compound,rpe,nutrition,coach,banner;
  if(week==='1'){emphasis='Volume foundation';compound='Normal sets, reps first';rpe='8.0';nutrition='Hold current calories';banner='Build the base this week. Keep compounds clean and let quality drive the next jump.';coach='Accumulation phase — enough work to build, not enough chaos to irritate old injury sites.';}
  else if(week==='2'){emphasis='Progressive build';compound='Push 1 rep or small load jumps';rpe='8.0–8.5';nutrition=goal==='cut'?'Hold deficit unless strength slips':'Add carbs around training if needed';banner='Push week: same movements, slightly more output, still no sloppy reps.';coach='Quietly stack wins. Compounds can climb only if quality and symmetry stayed intact.';}
  else if(week==='3'){emphasis='Strength expression';compound='Top sets matter most, trim fluff';rpe='8.5–9.0';nutrition=goal==='cut'?'Bias carbs pre/post training (+30–40g): leucine-spike every meal (eggs, whey, skyr). Protein must hit 175g this week.':'Support peak: 20–30g carbs pre-lift, protein at 175g+, leucine ≥2.5g per meal.';banner='Highest-output week: earn heavier top sets, then get out before fatigue dilutes quality.';coach='Not for hero volume. Sharp top sets, disciplined back-off work, joints quiet while strength peaks. Accessories cut to 2 sets each on this week only.';}
  else{emphasis='Deload + resensitize';compound='2–3 sets only (cut 40%), same weight, fresh reps';rpe='6.0–7.0';nutrition=goal==='cut'?'Hold calories or add 100–150 kcal. Never cut harder during deload — this is connective tissue repair time.':'Eat at maintenance. Deload week is where tendons, fascia, and CNS recover. Do not under-fuel it.';banner='Unload on purpose. Leave this week fresher, not guilty.';coach='Deload specifics: each compound gets 2–3 sets (not 4), same working weight, stop at RPE 6–7. Accessories drop to 2 sets. Right-side rehab volume maintained in full — the joint work never deloads.';}
  if(recovery==='poor'||joints==='angry'){emphasis='Protect + rebuild';compound='Downshift 5–10%, own execution';rpe='7.0 max';nutrition=goal==='cut'?'Do not cut harder this week':'Hold intake and recover';banner='Override: recovery and tissue status say protect the system this week.';coach='When recovery or joints are red-flagging, the right call is preserving momentum by reducing stress before pain steals weeks.';}
  if(strength==='down'&&week!=='4') nutrition=goal==='cut'?'Add 25–40g carbs around training before cutting harder':'Do not add more volume until strength returns';
  if(comp<85) coach+=' Compliance is the bottleneck: simplify and win with the minimum effective day.';
  el('phaseBanner').className='banner blue';
  el('phaseBanner').textContent=banner;
  el('phaseEmphasisOut').textContent=emphasis;
  el('phaseCompoundOut').textContent=compound;
  el('phaseRpeOut').textContent=rpe;
  el('phaseNutritionOut').textContent=nutrition;
  el('phaseCoachText').textContent=coach;
  syncPhaseWeekBlocks(week);
  pulse(['phaseBanner','phaseEmphasisOut','phaseCompoundOut','phaseRpeOut','phaseNutritionOut','phaseCoachText']);
}
function resetPhaseWave(){
  el('phaseWeek').value='1';el('phaseGoal').value='cut';el('phaseRecovery').value='normal';
  el('phaseJointFlag').value='quiet';el('phaseCompliance').value=90;el('phaseStrengthTrend').value='flat';
  runPhaseWave();
}

/* ─── SESSION LOG ─── */
const sessionLog = {};

function saveSessionLog(){
  const ex = el('logExercise').value;
  const w = +el('logWeight').value;
  const r = +el('logReps').value;
  const rpe = +el('logRPE').value;
  const joint = +el('logJoint').value;
  const q = +el('logQuality').value;
  const date = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
  
  if(!sessionLog[ex]) sessionLog[ex] = [];
  sessionLog[ex].unshift({date, w, r, rpe, joint, q});
  if(sessionLog[ex].length > 5) sessionLog[ex] = sessionLog[ex].slice(0,5);
  
  renderSessionLog();
  pulse(['sessionLogDisplay']);
}

function renderSessionLog(){
  const display = el('sessionLogDisplay');
  if(!display) return;
  const ex = el('logExercise').value;
  const entries = sessionLog[ex] || [];
  
  if(!entries.length){
    display.innerHTML = '<div class="small" style="color:var(--muted);text-align:center;padding:10px 0">No entries for this exercise yet. Log a set above.</div>';
    return;
  }
  
  // Next session recommendation
  const last = entries[0];
  let nextAction = '';
  const targetRanges = {
    'Barbell Bench Press':'5–8','Romanian Deadlift':'6–8','Pull-Ups':'5–8',
    'Chest-Supported Row':'6–8','default':'8–10'
  };
  const rangeStr = targetRanges[ex] || targetRanges.default;
  const [rMin, rMax] = rangeStr.split('–').map(Number);
  
  if(last.joint > 3 || last.q < 7){
    nextAction = '⚠️ Protect: reduce 5–10 lb or slow eccentric. Quality was below threshold.';
  } else if(last.r >= rMax && last.rpe <= 8.5 && last.q >= 8){
    nextAction = `✅ Earned: add smallest weight jump next session (reps hit top of range at clean RPE).`;
  } else if(last.r < rMin){
    nextAction = `📊 Hold weight: ${last.w} lb. Build reps to ${rMax} before loading.`;
  } else {
    nextAction = `📈 Add 1 rep: keep ${last.w} lb, target ${Math.min(last.r+1, rMax)} reps next session.`;
  }
  
  let html = `<div class="good-box" style="margin-bottom:10px;font-size:.84rem"><strong>Next session:</strong> ${nextAction}</div>`;
  html += '<div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-2);margin-bottom:8px">History — '+ex+'</div>';
  
  entries.forEach((e,i) => {
    const isLast = i === 0;
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(60,60,67,0.08);font-size:.83rem">
      <span style="color:var(--muted);min-width:52px">${e.date}</span>
      <span style="font-weight:700;color:var(--text-2)">${e.w} lb × ${e.r}</span>
      <span class="pill" style="font-size:.7rem">RPE ${e.rpe}</span>
      <span class="pill ${e.joint>3?'red':e.joint>1?'yellow':'green'}" style="font-size:.7rem">Joint ${e.joint}</span>
    </div>`;
  });
  
  display.innerHTML = html;
}

// Re-render log when exercise changes
document.addEventListener('DOMContentLoaded', function(){
  const logEx = el('logExercise');
  if(logEx) logEx.addEventListener('change', renderSessionLog);
});

/* ─── MILESTONES ─── */
const milestones=[
  {name:'DB Press (per hand)',curId:'mPC',tarId:'mPT',barId:'mPB',textId:'mPTx',cur:40,tar:60,note:'Earn load only when shoulder stays quiet and reps stay symmetrical.'},
  {name:'RDL',curId:'mRC',tarId:'mRT',barId:'mRB',textId:'mRTx',cur:115,tar:185,note:'Tempo and spinal position matter more than ego load.'},
  {name:'Pull-Up (total reps)',curId:'mUC',tarId:'mUT',barId:'mUB',textId:'mUTx',cur:6,tar:12,note:'Lats and scapular control drive the V-taper.'},
  {name:'DB Curl (per hand)',curId:'mCC',tarId:'mCT',barId:'mCB',textId:'mCTx',cur:22.5,tar:30,note:'Elbow path and supination must stay clean for load to climb.'}
];
function buildMilestones(){
  const c=el('milestone-list');
  c.innerHTML='';
  milestones.forEach(m=>{
    const pct=m.tar>0?Math.max(0,Math.min(100,Math.round(m.cur/m.tar*100))):0;
    c.innerHTML+=`<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
        <span style="font-size:.85rem;font-weight:600;color:#fff">${m.name}</span>
        <span style="font-size:.78rem;color:var(--muted)" id="${m.textId}">${pct}%</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px">
        <div class="field"><label>Current</label><input id="${m.curId}" type="number" min="0" step="2.5" value="${m.cur}" oninput="updateMilestones()"/></div>
        <div class="field"><label>Target</label><input id="${m.tarId}" type="number" min="0" step="2.5" value="${m.tar}" oninput="updateMilestones()"/></div>
      </div>
      <div class="bar-shell"><div class="bar-fill" id="${m.barId}" style="width:${pct}%"></div></div>
      <div class="small" style="margin-top:4px">${m.note}</div>
    </div>`;
  });
}
function updateMilestones(){
  milestones.forEach(m=>{
    const cur=+el(m.curId).value;
    const tar=+el(m.tarId).value;
    const pct=tar>0?Math.max(0,Math.min(100,Math.round(cur/tar*100))):0;
    el(m.barId).style.width=pct+'%';
    el(m.textId).textContent=pct+'%';
    m.cur=cur;m.tar=tar;
  });
}

/* ─── EXERCISE DATA ─── */
function mkEx(name,muscle,muscleCls,muscleLbl,equip,sets,load,loadCls,loadReason,prog,progReason,rest,videoUrl){
  return {name,muscle,muscleCls,muscleLbl,equip,sets,load,loadCls,loadReason,prog,progReason,rest,videoUrl};
}
const days={
  d1:[
    mkEx('Barbell Bench Press','CH','chest','Chest','Barbell','4 × 5–8','Heavy','load-heavy','Primary strength anchor. Drive muscle memory and chest-triceps force production.','Add Weight When Earned','Add weight only after all 4 sets hit 8 clean reps at ≤RPE 8 for two weeks.','2.5–3 min','https://www.youtube.com/watch?v=gRVjAtPip0Y'),
    mkEx('High-Incline Neutral-Grip DB Press','SH','shoulders','Shoulders','Dumbbells','3 × 6–8','Moderate','load-moderate','Safer pressing path for left shoulder dislocation history while building upper chest.','Add Reps First','Move from 6→8 reps first. Add 5 lb only when all sets reach 8 with zero shoulder instability.','2 min','https://www.youtube.com/watch?v=GFblCmuEE18'),
    mkEx('Low-Incline DB Press','CH','chest','Upper Chest','Dumbbells + bench','3 × 8–10','Moderate','load-moderate','Upper-chest volume builder. Controlled tension matters more than max loading.','Add Reps First','Add reps first. When all sets reach 10 clean reps with 2-sec lower, add smallest jump.','90 sec','https://www.youtube.com/watch?v=IP4oeKh1Sd4'),
    mkEx('Low-Incline DB Squeeze Press','CH','chest','Chest','Dumbbells + bench','2–3 × 10–12','Light','load-light','Chest hypertrophy with reduced shoulder strain. Squeeze and control beat chasing load.','Add Weight When Earned','Keep same weight until all sets reach 12 with strong squeeze and no shoulder shift.','75 sec','https://www.youtube.com/watch?v=sC-PHtkYqI0'),
    mkEx('DB Rolling Triceps Extension','AR','arms','Triceps','Dumbbells','3 × 8–10','Moderate','load-moderate','Main triceps size driver. Enough load to grow, not so much that elbows dominate.','Add Weight When Earned','Add reps to 10 first. Add weight only when every rep stays smooth and elbow path pain-free.','75 sec','https://www.youtube.com/watch?v=6IrhvGp8kRg'),
    mkEx('Seated Overhead DB Extension','AR','arms','Triceps Long Head','Dumbbell','2 × 10–12','Moderate','load-moderate','Long-head triceps builder — the 2/3 of arm size that matters most for visible mass.','Add Weight When Earned','Progress reps before weight. Add smallest jump when all sets reach 12 with no shoulder discomfort.','60 sec','https://www.youtube.com/watch?v=fYqswDVbJDg'),
    mkEx('Push-Up Plus','CH','chest','Serratus','Bodyweight','2 × 12–15','Rehab','load-rehab','Serratus and scap control for left shoulder centering after dislocation history.','Add Control Only','Do not chase load. Add 1–2 reps or 1-sec pause only when shoulder stays perfectly controlled.','60 sec','https://www.youtube.com/watch?v=_l3ySVKYVJ8'),
    mkEx('Front-Foot Elevated Split Squat','LG','legs','Quads/Glutes','Dumbbells','2 × 8–10/side','Light','load-light','Support work for knee resilience. Stays light — this is not your main leg stimulus.','Add Weight When Earned','Increase range control first, then reps. Add load only when both sides stable and right knee quiet next day.','90 sec','https://www.youtube.com/watch?v=2C-uNgKwPLE'),
    mkEx('Seated DB Wrist Extension','GR','grip','Wrist / Forearm','Dumbbell','2 × 15–20/side','Light','load-light','Direct wrist-extensor work to balance all the pressing and improve forearm durability.','Add Reps First','Hit 20 clean reps with a full top squeeze before adding the smallest load jump.','45 sec','https://www.youtube.com/watch?v=6TtkRqPjmsg'),
    mkEx('RKC Plank','CO','core','Core','Bodyweight','2 × 25–35s','Rehab','load-rehab','Trunk stiffness for low-back protection. Quality bracing is the entire point.','Add Time Only','Add 5–10 seconds per set before any external load variation.','60 sec','https://www.youtube.com/watch?v=0c1np4dV7ec')
  ],
  d2:[
    mkEx('Pull-Ups (Assisted if needed)','BK','back','Lats','Rack / Pull-up bar','4 × 5–8','Heavy','load-heavy','Primary back-width strength movement and neural driver for your V-taper.','Add Reps First','Add weight only once all 4 sets hit 8 clean reps from a dead hang.','2.5 min','https://www.youtube.com/watch?v=ZHllQTJf7eA'),
    mkEx('Chest-Supported Incline Row','BK','back','Mid-Back','Dumbbells + bench','3–4 × 6–8','Heavy','load-heavy','Safe heavy rowing without lumbar cost. Main mid-back thickness builder.','Add Weight When Earned','Push reps to top of range first. Add load when all sets reach 8 with chest glued to bench.','2 min','https://www.youtube.com/watch?v=vmX58YYK3-8'),
    mkEx('Single-Arm Lat Row','BK','back','Lats','Dumbbell + bench','3 × 8–10/side','Moderate','load-moderate','Lat-focused hypertrophy. Moderate load keeps line of pull clean toward the hip.','Add Reps First','Add reps first. Add weight once all sets hit 10 and lats are felt more than biceps.','90 sec','https://www.youtube.com/shorts/q65uDGJ9ZPs'),
    mkEx('Standing DB Curl','AR','arms','Biceps','Dumbbells','3 × 8–10','Moderate','load-moderate','Main biceps builder that should actually move some load — this is strength work.','Add Weight When Earned','Add reps to top of range, then increase by 2.5–5 lb total only if there is zero swing.','75 sec','https://www.youtube.com/watch?v=6DeLZ6cbgWQ'),
    mkEx('Spider Curl','AR','arms','Biceps Peak','Dumbbells + incline bench','3 × 10–12','Light','load-light','Strict curl — zero momentum. Builds the peak without any swing compensation.','Add Reps First','Progress reps before weight. Load only after all sets hit 12 with perfect elbow path.','60 sec','https://www.youtube.com/watch?v=jmXXRM755MM'),
    mkEx('Hammer Curl','AR','arms','Brachialis','Dumbbells','2 × 10–12','Light','load-light','Arm thickness between biceps and triceps. Elbow-friendly and brachialis-dominant.','Add Reps First','Add reps before weight. No swinging — strict alternating or simultaneous.','60 sec','https://www.youtube.com/watch?v=BRVDS6HVR9Q'),
    mkEx('Incline Reverse Fly','SH','shoulders','Rear Delts','Dumbbells + bench','3 × 12–15','Light','load-light','Posture correction and shoulder joint balance. Finisher — controlled, not heavy.','Add Reps First','Progress reps and squeeze quality long before adding any load.','60 sec','https://www.youtube.com/watch?v=vpWuYp2p5rE'),
    mkEx('Reverse Wrist Curl','GR','grip','Forearm Extensors','Dumbbells','2 × 15–20','Light','load-light','Direct forearm extensor work so wrist strength is trained separately from curls and rows.','Add Reps First','Build to 20 clean reps with zero elbow swing before increasing load.','45 sec','https://www.youtube.com/watch?v=krZ6pWGZ8xo'),
    mkEx('Farmer Carry','GR','grip','Grip/Core','Dumbbells','3 × 35–45 sec','Moderate','load-moderate','Loaded carry — most underrated fat-loss and core stability exercise in this program.','Add Load Gradually','Add 2.5–5 lb per hand once you can complete full holds without grip failure.','75 sec','https://www.youtube.com/watch?v=NH7Xv-7NQNQ')
  ],
  d3:[
    mkEx('Ankle Alphabets','LG','legs','Ankle Mobility','Bodyweight','2 × A–Z/side','Rehab','load-rehab','Full-range ankle mobility to restore joint motion before the rest of the recovery flow.','Add Smoother Control','Keep the alphabet slow and complete. Progress by cleaner, fuller letters rather than speed.','30–45 sec','https://youtu.be/rnCrYAd81aM'),
    mkEx('Clamshells','LG','legs','Glute Med','Mini-band','2–3 × 12–15/side','Rehab','load-rehab','Hip-stability work that supports knee tracking and pelvic control for Thursday.','Add Reps First','Own the top range and glute squeeze before increasing band tension.','45–60 sec','https://youtu.be/LKtEwJ4s93o'),
    mkEx('Slow Eccentric Step-Downs','LG','legs','Knee Control','Box / step','2–3 × 6–8/side','Rehab','load-rehab','Controlled 4-second lowering builds tendon tolerance and downhill knee control.','Add Control First','Progress by smoother 4-second lowers and cleaner tracking before adding any height.','60 sec','https://www.youtube.com/watch?v=ViqzPCa9Ris'),
    mkEx('Single-Leg Balance (Eyes Closed)','LG','legs','Ankle Stability','Bodyweight','2 × 30 sec/side','Rehab','load-rehab','Proprioception rebuild for ankles and feet without adding fatigue.','Add Time Only','Add 5–10 seconds only when balance stays controlled without toe-gripping.','45 sec','https://www.youtube.com/shorts/T2WwK2JT2d0'),
    mkEx('Band Pull-Aparts','SH','shoulders','Rear Delts / Scap','Band','2 × 20','Rehab','load-rehab','Left-shoulder maintenance and scapular positioning work on a low-fatigue day.','Add Reps First','Progress reps or pause quality before using a stiffer band.','45 sec','https://www.youtube.com/watch?v=stwYTTPXubo'),
    mkEx('Standing Calf Stretch','LG','legs','Calf Mobility','Wall','60 sec/side','Rehab','load-rehab','Keeps calf-Achilles tissue length and ankle motion ready for hiking and leg work.','Add Relaxed Range','Let the heel settle lower over time without bouncing or forcing range.','30 sec','https://www.youtube.com/watch?v=LntxVU3jpgo'),
    mkEx('Hamstring Stretch','LG','legs','Hamstring Mobility','Floor / strap optional','60 sec/side','Rehab','load-rehab','Restores posterior-chain length after pulling and before Thursday hinges.','Add Relaxed Range','Breathe into the stretch and gradually increase range without low-back rounding.','30 sec','https://youtu.be/9tri-Hn03gU')
  ],
  d4:[
    mkEx('Dumbbell Step-Ups','LG','legs','Unilateral','Dumbbells','3–4 × 6–8/side','Moderate','load-moderate','Unilateral leg strength — right side first every time. Box at knee-height max.','Add Weight When Earned','Increase range control first, then reps. Add load only when both sides stable and right knee quiet.','90 sec','https://www.youtube.com/watch?v=dQqApCGd5Ss'),
    mkEx('Romanian Deadlift','LG','legs','Posterior Chain','Barbell','4 × 6–8','Heavy','load-heavy','Primary posterior-chain strength movement. 3-sec lowering phase, no bouncing.','Add Weight When Earned','Add load only when bar stays close, back stays flat, and all 4 sets hit 8 clean reps.','2.5 min','https://www.youtube.com/watch?v=3VXmecChYYM'),
    mkEx('Heels-Elevated Goblet Squat','LG','legs','Quads','Dumbbell / KB','3 × 8–10','Moderate','load-moderate','Quad bias with minimal spinal loading. Plate or wedge under heels.','Add Reps First','Add reps to 10 first. Add weight once all sets clean with heels elevated throughout.','90 sec','https://www.youtube.com/watch?v=CMH5QYN4saE'),
    mkEx('Paused Hip Thrust','LG','legs','Glutes','Dumbbell / Barbell + bench','3 × 8–10','Moderate','load-moderate','Glute builder. 2-sec pause and squeeze at top. Do not hyperextend lower back at lockout.','Add Weight When Earned','Add weight after all sets reach 10 with full squeeze and no low-back compensation.','90 sec','https://www.youtube.com/watch?v=29OfN4ztW_g'),
    mkEx('DB Pronation / Supination','GR','grip','Wrist Rotation','Light dumbbell / hammer','2 × 12–15/side','Rehab','load-rehab','Forearm-rotation strength for wrist resilience, hiking grip, and elbow health without adding much fatigue.','Add Range and Reps','Own the full turn with a slow tempo before adding weight or lever length.','45 sec','https://www.youtube.com/watch?v=VV7zsl6LafM'),
    mkEx('Hamstring Slide Curl','LG','legs','Hamstrings','Bodyweight + sliders','3 × 8–12','Light','load-light','Posterior chain without extra lumbar fatigue. Slow eccentric is where the adaptation lives.','Add Reps First','Progress reps before adding any external load. Slow eccentric is the load.','75 sec','https://www.youtube.com/watch?v=Dlazt593cuA'),
    mkEx('Reverse Nordic','LG','legs','Knee Tendon','Bodyweight','2 × 6–8','Rehab','load-rehab','Patellar tendon capacity builder for hiking descents. Small range ONLY to start.','Add Range Gradually','Start with 6-inch range only. Add range over weeks as tendon tolerance builds.','90 sec','https://www.youtube.com/watch?v=PvJDjcfZe1c'),
    mkEx('Single-Leg Calf Raise','LG','legs','Calf','Bodyweight / DB','L: 3 × 12–15, R: 4 × 12–15','Moderate','load-moderate','Right calf rebuild — right gets the extra set always. Deficit on step for full ROM.','Add Weight When Earned','Add reps across all sets first. Add load (dumbbell) only when full ROM is owned with a 1-sec pause at top.','60 sec','https://www.youtube.com/watch?v=KcTEGifMTDY'),
    mkEx('Tibialis Raise','LG','legs','Shin','Wall / bodyweight','3 × 15–20','Rehab','load-rehab','Shin strength and downhill control — prevents shin splints on hikes.','Add Reps Only','Progress reps only. Add a weight vest only once 20 reps feel easy with a 1-sec pause.','45 sec','https://www.youtube.com/watch?v=VzIcGAgBiaM'),
    mkEx('Dead Bug','CO','core','Core','Bodyweight','2 × 8/side','Rehab','load-rehab','Anti-extension core control for low-back protection.','Add Pause Duration','Add 1–2 sec hold at extension before any load variation.','60 sec','https://www.youtube.com/watch?v=UIL7VI5_EQg')
  ],
  d5:[
    mkEx('Neutral-Grip Pull-Ups','BK','back','Lats','Rack','3 × 6–8','Moderate','load-moderate','Second pull stimulus for width and scapular control. Neutral grip is shoulder-friendlier.','Add Reps First','Add weight once all 3 sets hit 8 clean dead-hang reps.','2 min','https://www.youtube.com/watch?v=cd_38C6LuvY'),
    mkEx('Flat DB Press','CH','chest','Chest','Dumbbells','3 × 8–10','Moderate','load-moderate','Hypertrophy press. Not the strength anchor — quality contractions over load.','Add Reps First','Add reps first. Add weight once all 3 sets hit 10 with a controlled touch at chest.','90 sec','https://www.youtube.com/watch?v=O7ECGhZj_Hc'),
    mkEx('Straight-Arm DB Pullover','BK','back','Lats','Dumbbell','3 × 10–12','Light','load-light','Full lat stretch. Left shoulder monitored for instability throughout.','Add Reps First','Progress reps. Add weight only when full range feels completely pain-free.','75 sec','https://www.youtube.com/watch?v=QZ_UC5SjvK4'),
    mkEx('Half-Kneeling Landmine Press','SH','shoulders','Shoulders','Barbell (corner)','3 × 8–10/side','Moderate','load-moderate','Most shoulder-friendly pressing path — natural arc, no impingement risk.','Add Reps First','Add reps first. Add weight once all sets hit 10 with no shoulder instability.','75 sec','https://www.youtube.com/watch?v=LN1zCeoIfbE'),
    mkEx('Standing DB Fly','CH','chest','Chest','Dumbbells','2–3 × 10–12','Light','load-light','Pump and chest stretch — not a load-chasing exercise. Control beats weight here.','Add Reps Only','Progress reps and quality of contraction only. Load increase is not the goal.','60 sec','https://www.youtube.com/watch?v=XSdcma4EIWs'),
    mkEx('Lean-Away DB Lateral Raise','SH','shoulders','Shoulder Cap','Dumbbell','3 × 12–15','Light','load-light','Most important exercise for a wider, more athletic silhouette. Light and precise.','Add Reps First','Add reps and squeeze quality. Add tiny load only when all 3 sets hit 15 with zero momentum.','60 sec','https://www.youtube.com/watch?v=S7Bjyw2ccg0'),
    mkEx('Incline Bench Chest Supported Dumbbell Reverse Flys','SH','shoulders','Rear Delts','Dumbbells + bench','3 × 12–15','Light','load-light','Rear delt and posture work. Keep it feather-light — this builds shape not strength.','Add Reps First','Progress reps and squeeze before any load change.','60 sec','https://www.youtube.com/watch?v=vpWuYp2p5rE'),
    mkEx('Step-Ups (light)','LG','legs','Right-Side Support','Bodyweight or light DB','2 × 8/side','Light','load-light','Maintains right-leg neural drive before Saturday hike. Intentionally easy.','Keep Light','This movement stays light on Friday. Its job is priming, not loading.','75 sec','https://www.youtube.com/watch?v=dQqApCGd5Ss'),
    mkEx('Wrist Roller','GR','grip','Forearm Burn','Wrist roller / plate + rope','2–3 rounds','Moderate','load-moderate','Direct wrist-flexor and extensor finisher for visible forearm density without stealing from the upper-body compounds.','Add Time or Weight','Add one extra up-and-down pass first, then add a small amount of weight.','60 sec','https://www.youtube.com/watch?v=-lOFG0U_rlY')
  ],
  d6:[
    mkEx('Spider Curl','AR','arms','Biceps','Dumbbells','3 × 10–12','Light','load-light','Post-hike arm work — light and focused. Pump quality, not load.','Add Reps First','Progress reps. Arm work after hike stays conservative by design.','60 sec','https://www.youtube.com/watch?v=jmXXRM755MM'),
    mkEx('Hammer Curl','AR','arms','Brachialis','Dumbbells','3 × 10–12','Light','load-light','Arm thickness work. Keep strict, no swinging after a long hike.','Add Reps First','Add reps before weight. Fatigue from hike means load is not the priority.','60 sec','https://www.youtube.com/watch?v=BRVDS6HVR9Q'),
    mkEx('Overhead DB Extension','AR','arms','Triceps Long Head','Dumbbell','3 × 10–12','Light','load-light','Long-head triceps for arm mass. Both arms, controlled range.','Add Reps First','Progress reps before load. This is recovery-compatible arm work.','60 sec','https://www.youtube.com/watch?v=fYqswDVbJDg'),
    mkEx('Close-Grip Push-Up','AR','arms','Triceps','Bodyweight','2 sets to near-failure','Rehab','load-rehab','Finisher. Stop 2 reps before form breaks — never grind these out.','Add Reps Only','Add reps only when near-failure is consistently above 15 clean reps.','60 sec','https://www.youtube.com/watch?v=0LZF3OY87uU'),
    mkEx('Wrist Flexion with Dumbbell','GR','grip','Wrist / Forearm','Dumbbell','2 × 15–20/side','Light','load-light','Low-stress direct forearm finisher that fits well after the hike and arm work.','Add Reps First','Build smooth full-range reps to 20 before adding the smallest plate increase.','45 sec','https://www.youtube.com/watch?v=yYZPq0nm6QQ')
  ]
};

function renderExercises(){
  Object.keys(days).forEach(day=>{
    const container=el(day+'-exercises');
    if(!container) return;
    container.innerHTML='';
    days[day].forEach((ex,i)=>{
      const id='ex-'+day+'-'+i;
      const mTag=`<span class="muscle muscle--${ex.muscleCls}"><span class="mi">${ex.muscle}</span>${ex.muscleLbl}</span>`;
      container.innerHTML+=`<div class="ex-card">
        <div class="ex-header" onclick="toggleEx('${id}')">
          <div>
            <div style="margin-bottom:4px">${mTag}</div>
            <div class="ex-name">${ex.name}</div>
            <div style="margin-top:5px;display:flex;gap:6px;flex-wrap:wrap"><span class="load-badge ${ex.loadCls}">${ex.load}</span><span class="pill" style="font-size:.72rem">${ex.sets}</span></div>
          </div>
          <button class="ex-toggle" onclick="event.stopPropagation();toggleEx('${id}')">▾</button>
        </div>
        <div class="ex-body" id="${id}">
          <div class="ex-row"><span class="key">Equipment</span><span class="v">${ex.equip}</span></div>
          <div class="ex-row"><span class="key">Rest</span><span class="v">${ex.rest}</span></div>
          <div class="ex-row"><span class="key">Load rationale</span><span class="v">${ex.loadReason}</span></div>
          <div class="ex-row"><span class="key">Progression</span><span class="v">${ex.prog}</span></div>
          <div class="ex-row"><span class="key">When to progress</span><span class="v">${ex.progReason}</span></div>
          <a class="video-btn" href="${ex.videoUrl}" target="_blank">▶ Watch form</a>
        </div>
      </div>`;
    });
  });
}
function toggleEx(id){
  const b=el(id);
  const toggle=b.previousElementSibling?.querySelector('.ex-toggle');
  b.classList.toggle('open');
  if(toggle) toggle.classList.toggle('open', b.classList.contains('open'));
}

/* ─── REHAB DATA ─── */
function buildRehab(){
  const fmtA=[
    {block:'1. General Heat',dose:'4 min incline walk or easy row',why:'Raise temperature and reduce stiffness without creating fatigue before the actual work.'},
    {block:'2. Core Lock-In',dose:'Bird-Dog 1×5/side (3-sec hold) + Dead Bug 1×6/side',why:'Quiet the low back before pressing, rowing, hinging, or split-stance work.'},
    {block:'3. Right Ankle',dose:'Banded ankle rock 1×10/side + Tibialis raise 1×15 + Single-leg balance 1×30s/side',why:'Restores dorsiflexion, foot control, and ankle stiffness for hiking, step-ups, and squatting.'},
    {block:'4. Right Knee',dose:'Spanish squat hold 1×30s + Slow step-down 1×6/side + Terminal knee extension 1×12/side',why:'Builds quad support and tracking control without creating soreness before training.'},
    {block:'5. Left Shoulder',dose:'Band pull-apart 1×15 + Face pull 1×12 + 90/90 rotation 1×8/side',why:'Centers the shoulder and switches on scapular stabilizers before upper-body work.'}
  ];
  const fmtAHtml=fmtA.map(b=>`<div class="acc-item">
    <div class="acc-header" onclick="toggleAcc(this)">
      <span class="acc-title">${b.block}</span><span class="acc-arrow">▾</span>
    </div>
    <div class="acc-body">
      <div class="ex-row"><span class="key">Dose</span><span class="v">${b.dose}</span></div>
      <div class="ex-row"><span class="key">Why</span><span class="v">${b.why}</span></div>
    </div>
  </div>`).join('');
  el('fmtA-content').innerHTML=fmtAHtml;

  const sites={
    ankle:[
      {n:'Ankle Alphabet Circles',d:'2×A–Z per foot (right first)',r:'Full ROM mobilization. Draw each letter slowly and deliberately.',v:'https://youtu.be/rnCrYAd81aM'},
      {n:'Banded Ankle Rocks',d:'2×10 rocks/direction, right side',r:'Restores dorsiflexion lost from 2012 injury. Rock forward so knee tracks over pinky toe.',v:'https://www.youtube.com/watch?v=ETRAWzq4Y2Y'},
      {n:'Tibialis Raises (Wall)',d:'2–3×20 reps',r:'Shin + anterior compartment activation. Pause 1 sec at top. Critical for descent control on hikes.',v:'https://www.youtube.com/watch?v=VzIcGAgBiaM'},
      {n:'Single-Leg Balance (Eyes Closed)',d:'2×30 sec/side (right first)',r:'Rebuilds proprioception lost from 2012 sprain. Eyes closed forces true neuromuscular adaptation.',v:'https://www.youtube.com/shorts/T2WwK2JT2d0'},
      {n:'Single-Leg Calf Raise (Deficit)',d:'L: 3×12-15 · R: 4×12–15 + 10-sec hold',r:'Right calf rebuild tool. Deficit ensures full Achilles ROM.',v:'https://www.youtube.com/watch?v=gUEffJQ2IdU'}
    ],
    knee:[
      {n:'Clamshells',d:'2–3×15/side (right first)',r:'Glute medius activation — prevents valgus collapse at right knee. Keep pelvis completely still.',v:'https://youtu.be/LKtEwJ4s93o'},
      {n:'Spanish Squat Isometric Hold',d:'3×35–45 sec',r:'Patellar tendon loading without pain. If pain > 3/10 shorten hold time, do not push through.',v:'https://www.youtube.com/watch?v=qGI0mvJk2SQ'},
      {n:'Slow Eccentric Step-Down',d:'2–3×6–8/side (right first), 4-sec lower',r:'VMO strength + patellar tracking control. Control is the point, not speed.',v:'https://www.youtube.com/watch?v=ViqzPCa9Ris'},
      {n:'Terminal Knee Extension (Banded)',d:'2×15/leg (right emphasis)',r:'VMO isolation + knee stabilizer activation. Band behind knee, straighten fully to activate VMO.',v:'https://www.youtube.com/watch?v=rV3FLFIF_Ag'}
    ],
    shoulder:[
      {n:'Band Pull-Aparts',d:'3×15–20 reps',r:'Posterior rotator cuff + rear delt activation before any pressing. Most important daily shoulder exercise.',v:'https://www.youtube.com/watch?v=C3AvL5QyPwk'},
      {n:'Face Pulls (Band or Cable)',d:'3×15 reps',r:'External rotation strength — single most important post-dislocation exercise. Elbows high and wide.',v:'https://www.youtube.com/watch?v=iB7odzgWo8E'},
      {n:'90/90 Shoulder Rotations',d:'2×10 each direction (left emphasis)',r:'Internal/external rotation mobility. Full range, no pain. Stop if pain > 2/10.',v:'https://www.youtube.com/watch?v=PKXJ3W6ZTDs'},
      {n:'Scapular Wall Slides',d:'2×10 slow reps',r:'Serratus anterior + lower trap activation — stabilizes the shoulder capsule post-dislocation.',v:'https://www.youtube.com/watch?v=JN9MNZVfFg8'}
    ]
  };
  ['ankle','knee','shoulder'].forEach(site=>{
    const c=el('site-'+site);
    const color=site==='ankle'?'orange':site==='knee'?'yellow':'blue';
    c.innerHTML=sites[site].map(ex=>`<div class="ex-card" style="margin-bottom:10px">
      <div class="ex-header" onclick="this.nextElementSibling.classList.toggle('open')">
        <div class="ex-name">${ex.n}</div>
        <button class="ex-toggle">▾</button>
      </div>
      <div class="ex-body">
        <div class="ex-row"><span class="key">Dose</span><span class="v">${ex.d}</span></div>
        <div class="ex-row"><span class="key">Rationale</span><span class="v">${ex.r}</span></div>
        <a class="video-btn" href="${ex.v}" target="_blank">▶ Watch form</a>
      </div>
    </div>`).join('');
  });
}

/* ─── SUPPLEMENT ACCORDION ─── */
function buildSupplements(){
  const slots=[
    {time:'6:30 AM',title:'Fasted / Hydration Prime',color:'yellow',items:['L-Carnitine 1g (fasted or with light meal)','Green Tea Extract 400mg (with food if stomach-sensitive)','L-Theanine 100mg (only if also taking coffee)','Ginkgo Biloba 120mg (morning only — can disrupt sleep if taken late)']},
    {time:'8:00 AM',title:'Breakfast — Core Stack',color:'orange',items:['Whey Isolate (per meal plan)','Creatine Monohydrate 5g (with shake or meal)','D3 + K2 (with fat-containing food)','Biotin (any time, morning easiest)','Vitamin B12 (morning, with or without food)','L-Leucine 2–3g only if this meal is unexpectedly low in protein']},
    {time:'12:30 PM',title:'Lunch — Joint Support',color:'blue',items:['Turmeric / Curcumin 500mg (with fat-containing meal)','Omega-3 / Fish Oil 1–2g EPA+DHA (with fat for absorption)','L-Proline 500–1,000mg (optional split dose)']},
    {time:'4:00 PM',title:'Pre-Workout',color:'green',items:['Beta-Alanine 1.6–2.4g (with food — split dose if tingling is strong)','Taurine 1–1.5g (empty stomach or light pre-workout meal)','L-Glutamine 5g (empty stomach or around training)','L-Theanine 100mg (only if pre-workout caffeine causes jitteriness)','Whey 1 scoop + carb source']},
    {time:'6:00 PM',title:'Post-Workout',color:'green',items:['Whey 1 scoop (within 30 min)','Creatine 5g (only if missed at breakfast — do not double dose)','L-Leucine only if protein dose was clearly low']},
    {time:'8:00 PM',title:'Dinner — Repair & Downshift',color:'purple',items:['KSM-66 Ashwagandha 300mg (best slot for cortisol reduction and sleep prep)','Zinc 25–30mg (always with food)','Turmeric / Curcumin 500mg (second daily dose)','L-Proline 500–1,000mg (second dose if using)']},
    {time:'9:30 PM',title:'Pre-Bed Sleep Stack',color:'purple',items:['Magnesium Glycinate 400mg (after final meal)','L-Theanine 100–200mg (for sleep onset — does not cause grogginess)','Optional: casein or skyr if protein target is short']}
  ];
  const c=el('supp-accordion');
  c.innerHTML='';
  slots.forEach(s=>{
    c.innerHTML+=`<div class="acc-item">
      <div class="acc-header" onclick="toggleAcc(this)">
        <span class="acc-title"><strong style="color:var(--${s.color})">${s.time}</strong> — ${s.title}</span>
        <span class="acc-arrow">▾</span>
      </div>
      <div class="acc-body">
        <ul class="tl-list" style="margin:0;padding-left:14px">${s.items.map(i=>`<li style="margin:6px 0">${i}</li>`).join('')}</ul>
      </div>
    </div>`;
  });
}

/* ─── FAIL-SAFE ACCORDION ─── */
/* ─── STREAK ENGINE ─── */
const streaks = {train:0, nutrition:0, sleep:0};
const streakHistory = [];

function logStreakDay(){
  const training = el('dayTraining').value;
  const nutrition = el('dayNutrition').value;
  const sleep = +el('daySleeep').value;
  const date = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
  
  // Update streaks
  if(training === 'yes' || training === 'min') streaks.train++;
  else { streaks.train = 0; }
  
  if(nutrition === 'yes') streaks.nutrition++;
  else if(nutrition === 'partial') { /* partial doesn't break but doesn't add */ }
  else { streaks.nutrition = 0; }
  
  if(sleep >= 7) streaks.sleep++;
  else { streaks.sleep = 0; }
  
  streakHistory.unshift({date, training, nutrition, sleep});
  if(streakHistory.length > 14) streakHistory.pop();
  
  // Update display
  el('trainStreak').textContent = streaks.train;
  el('nutritionStreak').textContent = streaks.nutrition;
  el('sleepStreak').textContent = streaks.sleep;
  
  // Message
  const minStreak = Math.min(streaks.train, streaks.nutrition, streaks.sleep);
  let msg = '', cls = '';
  if(training === 'no'){
    msg = '⚠️ Training missed. The only rule: do not miss tomorrow. Activate minimum effective day protocol — one compound + rehab, 25 minutes, then leave.';
    cls = 'warn-box';
  } else if(nutrition === 'no'){
    msg = '⚠️ Off-plan day. Reset with the very next meal — do not wait until tomorrow. Log your next meal before eating it.';
    cls = 'warn-box';
  } else if(sleep < 6.5){
    msg = '🔴 Sleep below athletic threshold. Protect tomorrow: cut evening screen time, no caffeine after 1pm, dim lights by 8pm.';
    cls = 'danger-box';
  } else if(minStreak >= 14){
    msg = '🏆 2-week clean streak across all systems. This is the identity of the athlete you are becoming. Keep the structure.';
    cls = 'good-box';
  } else if(minStreak >= 7){
    msg = '✅ Solid week logged. The protocol is becoming automatic. This phase is where yo-yo cycles used to break — stay structural.';
    cls = 'good-box';
  } else {
    msg = '✅ Day logged. Show up tomorrow. The compound interest of daily consistency is invisible for 30 days, then undeniable.';
    cls = 'good-box';
  }
  el('streakMessage').innerHTML = '<div class="'+cls+'" style="font-size:.84rem">'+msg+'</div>';
  
  // Yo-yo warning check
  updateYoyoWarnings();
  pulse(['trainStreak','nutritionStreak','sleepStreak','streakMessage']);
}

function updateYoyoWarnings(){
  const warnings = [];
  const recentMissed = streakHistory.filter(d => d.training === 'no').length;
  const recentOffPlan = streakHistory.filter(d => d.nutrition === 'no').length;
  const recentLowSleep = streakHistory.filter(d => d.sleep < 6.5).length;
  
  if(recentMissed >= 1 && recentOffPlan >= 1){
    warnings.push({level:'red', text:'Early spiral signature detected: missed session + off-plan eating in the same window. This is your historical failure pattern. Activate if-then protocol immediately.'});
  }
  if(recentLowSleep >= 3){
    warnings.push({level:'yellow', text:'3+ low-sleep nights logged. Sleep debt degrades willpower, hunger regulation, and recovery. Protect sleep above all other interventions this week.'});
  }
  if(streaks.train === 0 && streaks.nutrition === 0){
    warnings.push({level:'red', text:'Both training and nutrition streaks at zero. Do not let this become day 2. The minimum effective day protocol exists for exactly this moment.'});
  }
  if(!warnings.length){
    warnings.push({level:'green', text:'No early warning signs detected. All systems operating within tolerance.'});
  }
  
  const c = el('yoyo-warnings');
  if(!c) return;
  c.innerHTML = warnings.map(w => '<div class="'+(w.level==='red'?'danger-box':w.level==='yellow'?'warn-box':'good-box')+'" style="margin-bottom:8px;font-size:.84rem">'+w.text+'</div>').join('');
}

function buildFailSafes(){
  const safes=[
    {trigger:'I ate off-plan for one meal',response:'The next meal is exactly on-plan. One meal is not a relapse. A relapse is three consecutive off-plan days. Reset with the very next eating opportunity.'},
    {trigger:'I missed a training session',response:'Note why it was missed. Do not make up the missed session with extra volume — continue to the next scheduled day. Missing one session never justified missing two.'},
    {trigger:'I feel a strong craving',response:'Drink 500ml water immediately. Wait 12 minutes. If craving persists, choose from the pre-approved craving buffer list. Never decide from an open fridge.'},
    {trigger:'Life disrupts routine 3+ days (travel, illness, stress)',response:'Activate Minimum Viable Protocol: 20-min walk + protein targets only. No training expectations. Full protocol resumes Day 1 of restored routine. The MVP keeps identity intact through chaos.'},
    {trigger:'Weight plateaus for 2+ weeks',response:'Do not panic-restrict. Spend 3 days tracking food precisely to find where calories are drifting. Add one 15-min Zone 2 walk per day for 2 weeks. Give the protocol time before modifying it.'},
    {trigger:'I feel like it is not working',response:'Look at where you started (209 lb) and where you are. Re-read the protocol. Feelings are not data. Progress photos and measurements every 4 weeks replace subjective feelings with objective evidence.'},
    {trigger:'I hit 170 lb and feel done',response:'Immediately activate Phase 3 (lean muscle gain protocol) with no gap. The done feeling is the most dangerous moment of the yo-yo cycle. The protocol never ends — it evolves.'}
  ];
  const c=el('fail-safe-accordion');
  c.innerHTML='';
  safes.forEach(s=>{
    c.innerHTML+=`<div class="acc-item">
      <div class="acc-header" onclick="toggleAcc(this)">
        <span class="acc-title" style="font-size:.85rem">IF: ${s.trigger}</span>
        <span class="acc-arrow">▾</span>
      </div>
      <div class="acc-body">
        <div class="good-box"><strong>THEN:</strong> ${s.response}</div>
      </div>
    </div>`;
  });
}

function toggleAcc(header){
  const body=header.nextElementSibling;
  const arrow=header.querySelector('.acc-arrow');
  body.classList.toggle('open');
  arrow.classList.toggle('open');
  pulse([header]);
}

/* ─── INIT ─── */
renderExercises();
buildMilestones();
buildRehab();
buildSupplements();
buildFailSafes();
runReadiness();
runWeekly();
runAthleteReview();
runPhaseWave();
updateTrainSessionCard('d1');
calcTDEE();
renderSessionLog();
updateYoyoWarnings();
updatePhaseProgress();

(function(){
  function clearCommandPriority(prefix){document.querySelectorAll('[id^="'+prefix+'"]').forEach(function(node){node.classList.remove('priority');});}
  function setPriority(id){var node=document.getElementById(id); if(node) node.classList.add('priority');}
  function syncGlobalHeader(){
    var mode=(document.getElementById('modeOut')?.textContent||'Build').trim()||'Build';
    var modeText=document.getElementById('globalModeText');
    var modeDot=document.getElementById('globalModeDot');
    if(modeText) modeText.textContent=mode;
    if(modeDot){
      modeDot.className='global-sumo-dot';
      if(/push/i.test(mode)) modeDot.classList.add('green');
      else if(/protect/i.test(mode)) modeDot.classList.add('red');
      else modeDot.classList.add('orange');
    }
    var week=(document.getElementById('phaseWeek')?.value||'1');
    var labels={'1':'Week 1 · Build','2':'Week 2 · Push','3':'Week 3 · Peak','4':'Week 4 · Deload'};
    var waveText=document.getElementById('globalWaveText');
    if(waveText) waveText.textContent=labels[week] || ('Week '+week);
  }
  function updateCommandPanels(){
    ['cmd-today-','cmd-train-','cmd-rehab-','cmd-nutrition-','cmd-psych-'].forEach(clearCommandPriority);
    var mode=(document.getElementById('modeOut')?.textContent||'Build').trim();
    var warmup=(document.getElementById('warmupOut')?.textContent||'Rotation').trim();
    var phaseWeek=document.getElementById('phaseWeek')?.value||'1';
    var phaseRecovery=document.getElementById('phaseRecovery')?.value||'normal';
    var phaseJoint=document.getElementById('phaseJointFlag')?.value||'quiet';
    var phaseGoal=document.getElementById('phaseGoal')?.value||'cut';
    var strengthTrend=document.getElementById('strengthTrend')?.value||'flat';
    var weeklyStrength=document.getElementById('weeklyStrength')?.value||'flat';
    if(mode==='Protect'){ setPriority('cmd-today-5'); setPriority('cmd-psych-5'); }
    else if(mode==='Push'){ setPriority('cmd-today-2'); setPriority('cmd-psych-1'); }
    else { setPriority('cmd-today-1'); setPriority('cmd-psych-4'); }
    setPriority('cmd-today-3');
    if(phaseJoint==='angry' || phaseRecovery==='poor'){ setPriority('cmd-train-5'); setPriority('cmd-rehab-4'); }
    else if(phaseWeek==='4'){ setPriority('cmd-train-1'); setPriority('cmd-rehab-2'); }
    else if(phaseWeek==='3'){ setPriority('cmd-train-2'); setPriority('cmd-rehab-1'); }
    else { setPriority('cmd-train-3'); setPriority('cmd-rehab-1'); }
    if(warmup.indexOf('Full')!==-1) setPriority('cmd-rehab-2'); else setPriority('cmd-rehab-1');
    if((strengthTrend==='down' || weeklyStrength==='down') && phaseGoal!=='build') setPriority('cmd-nutrition-3');
    else if(phaseGoal==='cut') setPriority('cmd-nutrition-2');
    else setPriority('cmd-nutrition-1');
    setPriority('cmd-nutrition-5');
  }
  function syncAll(){ syncGlobalHeader(); updateCommandPanels(); }
  ['runReadiness','runPhaseWave','runWeekly','runAthleteReview','showFormat','showPage'].forEach(function(name){
    var orig=window[name];
    if(typeof orig==='function' && !orig.__wrapped){
      var wrapped=function(){ var out=orig.apply(this, arguments); setTimeout(syncAll, 20); return out; };
      wrapped.__wrapped=true;
      window[name]=wrapped;
    }
  });
  document.querySelectorAll('button, select, input').forEach(function(node){
    node.addEventListener('change', function(){ setTimeout(syncAll, 20); });
    node.addEventListener('input', function(){ setTimeout(syncAll, 20); });
    node.addEventListener('click', function(){ setTimeout(syncAll, 20); });
  });
  setTimeout(syncAll, 50);
})();

(function(){
  function q(id){ return document.getElementById(id); }

  function clearPriority(prefix){
    document.querySelectorAll('[id^="'+prefix+'"]').forEach(function(node){
      node.classList.remove('priority');
      node.removeAttribute('data-priority');
    });
  }

  function markPriority(id){
    var node = q(id);
    if(node){
      node.classList.add('priority');
      node.setAttribute('data-priority','true');
    }
  }

  function syncHeader(){
    var mode = (q('modeOut') && q('modeOut').textContent || '').trim() || 'Build';
    var week = (q('phaseWeek') && q('phaseWeek').value || '1').trim();
    var weekLabels = {
      '1':'Week 1 · Build',
      '2':'Week 2 · Push',
      '3':'Week 3 · Peak',
      '4':'Week 4 · Deload'
    };

    var modeText = q('globalModeText');
    var waveText = q('globalWaveText');
    var modeDot = q('globalModeDot');

    if(modeText) modeText.textContent = mode;
    if(waveText) waveText.textContent = weekLabels[week] || ('Week ' + week);

    if(modeDot){
      modeDot.className = 'global-sumo-dot';
      if(/push/i.test(mode)) modeDot.classList.add('green');
      else if(/protect/i.test(mode)) modeDot.classList.add('red');
      else modeDot.classList.add('orange');
    }
  }

  function ensureStateLabels(){
    var states = document.querySelectorAll('.command-card .command-state');
    var labels = [
      'Priority changes with readiness',
      'Priority changes with wave',
      'Priority changes with warm-up',
      'Priority changes with goal',
      'Priority changes with mode'
    ];
    states.forEach(function(node, i){
      if(node) node.textContent = labels[i] || 'Live priority';
    });
  }

  function syncPanels(){
    clearPriority('cmd-today-');
    clearPriority('cmd-train-');
    clearPriority('cmd-rehab-');
    clearPriority('cmd-nutrition-');
    clearPriority('cmd-psych-');

    var mode = (q('modeOut') && q('modeOut').textContent || '').trim() || 'Build';
    var warmup = (q('warmupOut') && q('warmupOut').textContent || '').trim() || 'Rotation';
    var phaseWeek = (q('phaseWeek') && q('phaseWeek').value || '1').trim();
    var phaseRecovery = (q('phaseRecovery') && q('phaseRecovery').value || 'normal').trim();
    var phaseJoint = (q('phaseJointFlag') && q('phaseJointFlag').value || 'quiet').trim();
    var phaseGoal = (q('phaseGoal') && q('phaseGoal').value || 'cut').trim();
    var strengthTrend = (q('strengthTrend') && q('strengthTrend').value || 'flat').trim();
    var weeklyStrength = (q('weeklyStrength') && q('weeklyStrength').value || 'flat').trim();

    if(/protect/i.test(mode)){
      markPriority('cmd-today-5');
      markPriority('cmd-psych-5');
    } else if(/push/i.test(mode)){
      markPriority('cmd-today-2');
      markPriority('cmd-psych-1');
    } else {
      markPriority('cmd-today-1');
      markPriority('cmd-psych-4');
    }
    markPriority('cmd-today-3');

    if(phaseJoint === 'angry' || phaseRecovery === 'poor'){
      markPriority('cmd-train-5');
      markPriority('cmd-rehab-4');
    } else if(phaseWeek === '4'){
      markPriority('cmd-train-1');
      markPriority('cmd-rehab-2');
    } else if(phaseWeek === '3'){
      markPriority('cmd-train-2');
      markPriority('cmd-rehab-1');
    } else {
      markPriority('cmd-train-3');
      markPriority('cmd-rehab-1');
    }

    if(/full/i.test(warmup)) markPriority('cmd-rehab-2');
    else markPriority('cmd-rehab-1');

    if((strengthTrend === 'down' || weeklyStrength === 'down') && phaseGoal !== 'build'){
      markPriority('cmd-nutrition-3');
    } else if(phaseGoal === 'cut'){
      markPriority('cmd-nutrition-2');
    } else {
      markPriority('cmd-nutrition-1');
    }
    markPriority('cmd-nutrition-5');
  }

  function syncEliteChrome(){
    ensureStateLabels();
    syncHeader();
    syncPanels();
  }

  function wrap(name){
    var orig = window[name];
    if(typeof orig !== 'function' || orig.__eliteWrapped) return;
    var wrapped = function(){
      var out = orig.apply(this, arguments);
      requestAnimationFrame(syncEliteChrome);
      setTimeout(syncEliteChrome, 30);
      return out;
    };
    wrapped.__eliteWrapped = true;
    window[name] = wrapped;
  }

  document.addEventListener('DOMContentLoaded', function(){
    ['runReadiness','runPhaseWave','runWeekly','runAthleteReview','showFormat','showPage'].forEach(wrap);

    ['sleepHours','recoveryScore','energyLevel','jointPain','sessionType','motivationLevel',
     'phaseWeek','phaseGoal','phaseRecovery','phaseJointFlag','phaseCompliance','phaseStrengthTrend',
     'strengthTrend','weeklyStrength','weeklyCompletion','weeklySleep','weeklyEnergy','weeklyPain',
     'weeklyLoss','warmupOut','modeOut'].forEach(function(id){
      var node = q(id);
      if(!node) return;
      node.addEventListener('input', syncEliteChrome);
      node.addEventListener('change', syncEliteChrome);
    });

    var observerTargets = ['modeOut','warmupOut','phaseBanner','phaseWeek'];
    observerTargets.forEach(function(id){
      var node = q(id);
      if(!node) return;
      var obs = new MutationObserver(syncEliteChrome);
      obs.observe(node, {childList:true, subtree:true, characterData:true, attributes:true});
    });

    syncEliteChrome();
    setTimeout(syncEliteChrome, 100);
    setTimeout(syncEliteChrome, 500);
  });

  window.syncEliteChrome = syncEliteChrome;
})();

/* ─── VISUAL THEMING FOR GITHUB PAGES ─── */
const pageBackgrounds = {
  today: 'assets/images/bg-page-today.svg',
  train: 'assets/images/bg-page-train.jpg',
  rehab: 'assets/images/bg-page-rehab.svg',
  nutrition: 'assets/images/bg-page-nutrition.jpg',
  psych: 'assets/images/bg-page-psych.svg',
  wave: 'assets/images/bg-page-wave.svg',
  hevy: 'assets/images/bg-page-hevy.svg',
  milestones: 'assets/images/bg-page-milestones.svg',
  rpe: 'assets/images/bg-page-rpe.svg',
  primer: 'assets/images/bg-page-primer.svg'
};

const trainDayBackgrounds = {
  d1: 'assets/images/bg-train-monday.jpg',
  d2: 'assets/images/bg-train-tuesday.svg',
  d3: 'assets/images/bg-train-wednesday.svg',
  d4: 'assets/images/bg-train-thursday.svg',
  d5: 'assets/images/bg-train-friday.svg',
  d6: 'assets/images/bg-train-saturday.jpg',
  d7: 'assets/images/bg-train-sunday.svg'
};

function getActivePageId(){
  const activePage = document.querySelector('.page.active');
  return activePage ? activePage.id.replace('page-', '') : 'today';
}

function getActiveTrainDayId(){
  const activeBtn = document.querySelector('#page-train .day-scroll .day-btn.active');
  if (!activeBtn) return 'd1';
  const dataDay = activeBtn.getAttribute('data-day');
  if (dataDay) return dataDay;
  const onclick = activeBtn.getAttribute('onclick') || '';
  const match = onclick.match(/showDay\('([^']+)'/);
  return match ? match[1] : 'd1';
}

function applyVisualTheme(){
  const pageId = getActivePageId();
  const trainDayId = pageId === 'train' ? getActiveTrainDayId() : '';
  const imagePath = (pageId === 'train' && trainDayBackgrounds[trainDayId])
    ? trainDayBackgrounds[trainDayId]
    : (pageBackgrounds[pageId] || pageBackgrounds.today);

  const resolvedPath = new URL(imagePath, document.baseURI).href;
  document.body.dataset.page = pageId;
  document.body.dataset.trainDay = trainDayId;
  document.body.style.setProperty('--page-bg-image', `url("${resolvedPath}")`);
}

const __sumoShowPage = showPage;
showPage = function(id, btn){
  __sumoShowPage(id, btn);
  applyVisualTheme();
};

const __sumoShowDay = showDay;
showDay = function(id, btn){
  __sumoShowDay(id, btn);
  applyVisualTheme();
};

document.addEventListener('DOMContentLoaded', function(){
  applyVisualTheme();
});
