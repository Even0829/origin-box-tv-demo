const stage = document.getElementById('stage');
const title = document.getElementById('expression-title');
const subtitle = document.getElementById('expression-subtitle');
const expression = document.querySelector('.expression');
const presence = document.getElementById('presence');
const activity = document.getElementById('activity');
const airState = document.getElementById('air-state');
const worldCard = document.getElementById('world-card');
const eventCard = document.getElementById('event-card');
const eventNumber = document.getElementById('event-number');
const eventTrend = document.getElementById('event-trend');
const eventService = document.getElementById('event-service');
const eventServiceValue = document.getElementById('event-service-value');
const deviceReceipt = document.getElementById('device-receipt');
const deviceReceiptImage = document.getElementById('device-receipt-image');
const deviceReceiptName = document.getElementById('device-receipt-name');
const deviceReceiptDescription = document.getElementById('device-receipt-description');
const deviceReceiptLevel = document.getElementById('device-receipt-level');
const deviceReceiptFill = document.getElementById('device-receipt-fill');
const deviceReceiptPercent = document.getElementById('device-receipt-percent');
const pulse = document.getElementById('world-pulse');
const detail = document.getElementById('detail');
const detailTitle = document.getElementById('detail-title');
const detailKicker = document.getElementById('detail-kicker');
const detailContent = document.getElementById('detail-content');
const detailFoot = document.querySelector('.detail-foot');
const voice = document.getElementById('voice');
const voiceText = document.getElementById('voice-text');
const logToggle = document.getElementById('log-toggle');
const logPanel = document.getElementById('log-panel');
const logClose = document.getElementById('log-close');
const logList = document.getElementById('log-list');
const logEmpty = document.getElementById('log-empty');
const logPrev = document.getElementById('log-prev');
const logNext = document.getElementById('log-next');
const logPageStatus = document.getElementById('log-page-status');
const nav = [...document.querySelectorAll('.nav-item')];

const deviceReceipts = {
  lamp: { image:'./assets/lamp-device.png', name:'客厅灯光', description:'主灯已调至 60%', level:60 },
  air: { image:'./assets/air-device.png', name:'空气置地机', description:'已切至低噪模式' },
};

// Each frame is a coherent mock of what was observed, inferred, commanded and verified.
const story = [
  { key:'idle', ms:6000, title:'客厅安静如常', sub:'小元在安静地照看这个家', people:'未见人在场', activity:'暂无', air:'正常', co2:'750 ppm', trend:'平稳', window:'关闭', service:'尚无行动', evidence:'环境读数平稳；当前未见人在场。' },
  { key:'presence', ms:6500, title:'客厅有人了', sub:'我会留意这里的变化', people:'1 人在场', activity:'安静停留', air:'正常', co2:'810 ppm', trend:'平稳', window:'关闭', service:'尚无行动', evidence:'人在场与低活动量来自模拟感知；“安静停留”是情境推测。' },
  { key:'trend', ms:8000, title:'客厅空气有点闷', sub:'空气变化正在持续', people:'1 人在场', activity:'安静停留', air:'轻微异常', co2:'960 ppm', trend:'持续上升', window:'关闭', service:'继续观察', evidence:'CO₂ 从此前读数持续上升至 960 ppm，门窗关闭；不是由单次读数触发。' },
  { key:'intent', ms:7000, title:'我会慢慢调整', sub:'尽量不打扰你', people:'1 人在场', activity:'安静停留', air:'持续变差', co2:'1150 ppm', trend:'持续上升', window:'关闭', service:'选择低噪新风', evidence:'结合人在场、低活动量、空气趋势及预设授权，选择低噪换气。' },
  { key:'sent', ms:6500, title:'我请新风轻轻启动', sub:'先确认它是否开始工作', people:'1 人在场', activity:'安静停留', air:'待改善', co2:'1150 ppm', trend:'尚未改善', window:'关闭', service:'指令已发送 · 待设备确认', evidence:'已发送模拟控制请求；此时尚未收到设备反馈，更未证明空气改善。' },
  { key:'confirmed', ms:7500, title:'新风已经轻轻运转', sub:'我再看看空气的变化', people:'1 人在场', activity:'安静停留', air:'待观察', co2:'1120 ppm', trend:'仍待观察', window:'关闭', service:'新风确认运行', evidence:'模拟设备反馈已确认运行；环境结果仍需后续读数验证。' },
  { key:'improving', ms:8000, title:'空气正在恢复', sub:'客厅会慢慢清爽起来', people:'1 人在场', activity:'安静停留', air:'正在改善', co2:'930 ppm', trend:'连续回落', window:'关闭', service:'低噪新风运行中', evidence:'设备确认运行后，新的 CO₂ 读数呈连续回落趋势。' },
  { key:'settled', ms:8500, title:'客厅空气回稳了', sub:'我会继续安静地照看', people:'1 人在场', activity:'安静停留', air:'正常', co2:'790 ppm', trend:'已回稳', window:'关闭', service:'本次调整已验证', evidence:'模拟环境读数持续回落并回稳；设备确认与环境验证已分别完成。' },
];
const logDescriptions = {
  trend:'发现客厅空气持续变闷',
  intent:'选择低噪新风，准备调整空气',
  sent:'已发送低噪新风启动请求',
  confirmed:'确认新风开始运行，继续观察',
  improving:'观察到客厅空气持续改善',
  settled:'确认客厅空气回稳，结束调整',
};
const logPageSize = 7;
function yesterdayAt(hour, minute) {
  const date = new Date();
  date.setDate(date.getDate()-1);
  date.setHours(hour,minute,0,0);
  return date;
}
const previousLogs = [
  { key:'past-settled', description:'确认卧室空气回稳，结束调整', at:yesterdayAt(21,31) },
  { key:'past-confirmed', description:'确认卧室新风开始运行', at:yesterdayAt(21,18) },
  { key:'past-trend', description:'发现卧室空气持续变闷', at:yesterdayAt(21,16) },
];
let logHistory = [...previousLogs];
let loggedThisCycle = new Set();
let logPage = 0;
let index = 0;
let timer = null;
let transitionTimer = null;
let paused = false;
let panel = '';
let resumeAfterPanel = false;
let voiceTimer = null;
let receiptTriggerTimer = null;
let receiptHideTimer = null;

function formatLogTime(date) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate()-1);
  const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  const day = sameDay(date,now)?'今天':sameDay(date,yesterday)?'昨天':`${date.getMonth()+1}月${date.getDate()}日`;
  const clock = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  return `${day} ${clock}${sameDay(date,now)?`:${String(date.getSeconds()).padStart(2,'0')}`:''}`;
}
function renderLogPage() {
  const pages = Math.max(1,Math.ceil(logHistory.length/logPageSize));
  logPage = Math.min(logPage,pages-1);
  logList.replaceChildren();
  const visible = logHistory.slice(logPage*logPageSize,(logPage+1)*logPageSize);
  visible.forEach(entry=>{
    const item = document.createElement('li');
    item.className = 'log-entry';
    const dot = document.createElement('span');
    dot.className = 'log-dot';
    dot.setAttribute('aria-hidden','true');
    const description = document.createElement('p');
    description.className = 'log-description';
    description.textContent = entry.description;
    const time = document.createElement('time');
    time.className = 'log-time';
    time.dateTime = entry.at.toISOString();
    time.textContent = formatLogTime(entry.at);
    item.append(dot,description,time);
    logList.append(item);
  });
  logEmpty.hidden = visible.length>0;
  logPrev.disabled = logPage===0;
  logNext.disabled = logPage>=pages-1;
  logPageStatus.textContent = `${logPage+1} / ${pages}`;
}
function changeLogPage(offset) {
  const pages = Math.max(1,Math.ceil(logHistory.length/logPageSize));
  const next = Math.max(0,Math.min(pages-1,logPage+offset));
  if(next===logPage)return;
  logPage=next;
  renderLogPage();
}
function recordLog(key) {
  const description = logDescriptions[key];
  if(!description || loggedThisCycle.has(key))return;
  loggedThisCycle.add(key);
  logHistory = [{ key, description, at:new Date() },...logHistory.filter(item=>item.key!==key)];
  if(panel==='logs') { logPage=0; renderLogPage(); }
}

function hideDeviceReceipt() {
  clearTimeout(receiptHideTimer);
  deviceReceipt.classList.add('is-hidden');
  deviceReceipt.setAttribute('aria-hidden','true');
}
function showDeviceReceipt(data) {
  clearTimeout(receiptHideTimer);
  deviceReceiptImage.src=data.image;
  deviceReceiptName.textContent=data.name;
  deviceReceiptDescription.textContent=data.description;
  const hasLevel=Number.isFinite(data.level);
  deviceReceipt.classList.toggle('has-level',hasLevel);
  deviceReceiptLevel.hidden=!hasLevel;
  if(hasLevel){
    deviceReceiptFill.style.width=`${Math.max(0,Math.min(100,data.level))}%`;
    deviceReceiptPercent.textContent=`${data.level}%`;
  }
  deviceReceipt.classList.remove('is-hidden');
  deviceReceipt.setAttribute('aria-hidden','false');
  receiptHideTimer=setTimeout(hideDeviceReceipt,3600);
}

function fit() {
  const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(${(innerWidth - 1920 * scale) / 2}px,${(innerHeight - 1080 * scale) / 2}px) scale(${scale})`;
}
addEventListener('resize', fit);
fit();

function updateClock() {
  const now = new Date();
  const day = ['周日','周一','周二','周三','周四','周五','周六'][now.getDay()];
  document.getElementById('clock').textContent = `${now.getMonth()+1}月${now.getDate()}日 ${day}  ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}
updateClock();
setInterval(updateClock, 30000);

function row(label, value) {
  const div = document.createElement('div');
  div.className = 'detail-row';
  const a = document.createElement('span');
  const b = document.createElement('strong');
  a.textContent = label; b.textContent = value;
  div.append(a,b);
  return div;
}
function fillDetail() {
  const s = story[index];
  detailContent.replaceChildren();
  const placeholder=panel!=='world';
  detail.classList.toggle('is-placeholder',placeholder);
  detailFoot.hidden=placeholder;
  if (panel === 'world') {
    detailKicker.textContent = '小元 World Model · 状态依据';
    detailTitle.textContent = '客厅正在发生什么';
    [['在场感知',s.people],['活动理解',s.activity==='暂无'?'暂无':s.activity+'（推测）'],['门窗',s.window],['空气趋势',s.trend],['CO₂',s.co2],['本次服务',s.service]].forEach(x=>detailContent.append(row(...x)));
    const note=document.createElement('p');note.className='detail-note';note.textContent=s.evidence;detailContent.append(note);
  } else if (panel === 'space') {
    detailKicker.textContent='空间'; detailTitle.textContent='等待接入';
  } else if (panel === 'device') {
    detailKicker.textContent='设备'; detailTitle.textContent='等待接入';
  } else if (panel === 'memory') {
    detailKicker.textContent='记忆'; detailTitle.textContent='等待接入';
  } else if (panel === 'tv') {
    detailKicker.textContent='电视'; detailTitle.textContent='电视节目尚未接入';
    const note=document.createElement('p');note.className='detail-note';note.textContent='按返回键回到主页。';detailContent.append(note);
  }
}
function openLogPanel() {
  if(!panel)resumeAfterPanel=!paused;
  panel='logs';
  pause(true);
  clearTimeout(receiptTriggerTimer);
  hideDeviceReceipt();
  render(index,true);
  detail.classList.add('hidden');
  logPanel.classList.remove('hidden');
  logPanel.inert=false;
  logPanel.setAttribute('aria-hidden','false');
  logToggle.setAttribute('aria-expanded','true');
  document.getElementById('world-trigger').setAttribute('aria-expanded','false');
  worldCard.setAttribute('aria-expanded','false');
  nav.forEach(b=>b.classList.toggle('active',b.dataset.page==='home'));
  logPage=0;
  renderLogPage();
  logClose.focus();
}
function openPanel(name) {
  if(name==='logs'){openLogPanel();return;}
  if(!panel){resumeAfterPanel=!paused;pause(true);}
  const fromLogs=panel==='logs';
  logPanel.classList.add('hidden');
  logPanel.inert=true;
  logPanel.setAttribute('aria-hidden','true');
  logToggle.setAttribute('aria-expanded','false');
  panel=name;
  fillDetail();
  detail.classList.remove('hidden');
  const worldOpen=name==='world';
  document.getElementById('world-trigger').setAttribute('aria-expanded',worldOpen);
  document.getElementById('world-card').setAttribute('aria-expanded',worldOpen);
  nav.forEach(b=>b.classList.toggle('active',b.dataset.page===(worldOpen?'home':name)));
  if(name!=='world'||fromLogs) document.getElementById('detail-close').focus();
}
function closePanel() {
  panel='';detail.classList.add('hidden');
  logPanel.classList.add('hidden');
  logPanel.inert=true;
  logPanel.setAttribute('aria-hidden','true');
  logToggle.setAttribute('aria-expanded','false');
  document.getElementById('world-trigger').setAttribute('aria-expanded','false');
  document.getElementById('world-card').setAttribute('aria-expanded','false');
  nav.forEach(b=>b.classList.toggle('active',b.dataset.page==='home'));
  if(resumeAfterPanel){resumeAfterPanel=false;pause(false);}
}
function render(next, immediate=false) {
  clearTimeout(transitionTimer);
  clearTimeout(receiptTriggerTimer);
  hideDeviceReceipt();
  const nextIndex=(next+story.length)%story.length;
  if(nextIndex===0&&index===story.length-1)loggedThisCycle.clear();
  index=nextIndex;
  const s=story[index];
  const change=()=>{
    title.textContent=s.title; subtitle.textContent=s.sub;
    recordLog(s.key);
    presence.textContent='· 人数：'+s.people;
    activity.textContent='· 活动：'+s.activity;
    airState.textContent=s.air;
    airState.dataset.tone=['trend','intent','sent','confirmed'].includes(s.key)?'warning':s.key==='improving'?'service':'normal';
    const eventActive=['trend','intent','sent','confirmed','improving'].includes(s.key);
    const serviceProgress={intent:'准备启动',sent:'启动请求已发送',confirmed:'已确认运行',improving:'运行中'}[s.key];
    eventNumber.textContent=s.co2.split(' ')[0];
    eventTrend.hidden=!eventActive;
    eventTrend.textContent={sent:'读数持平',confirmed:'较前次低 30'}[s.key]||s.trend;
    eventService.hidden=!serviceProgress;
    eventServiceValue.textContent=serviceProgress||'';
    const airTone=s.key==='improving'?'service':eventActive?'warning':'normal';
    eventNumber.dataset.tone=airTone;
    eventCard.setAttribute('aria-label',`CO₂ ${s.co2}，${eventTrend.textContent}${serviceProgress?`；低噪新风${serviceProgress}`:''}。按确认查看依据`);
    const wasVisible=!eventCard.classList.contains('is-hidden');
    if(!eventActive&&document.activeElement===eventCard)worldCard.focus();
    eventCard.classList.toggle('is-hidden',!eventActive);
    eventCard.setAttribute('aria-hidden',String(!eventActive));
    eventCard.tabIndex=eventActive?0:-1;
    eventCard.classList.remove('refresh');
    if(eventActive&&wasVisible&&!immediate){void eventCard.offsetWidth;eventCard.classList.add('refresh');}
    stage.classList.toggle('air-concern',['trend','intent','sent','confirmed'].includes(s.key));
    stage.classList.toggle('air-recover',s.key==='improving');
    if(!panel&&s.key==='presence')receiptTriggerTimer=setTimeout(()=>{if(!panel&&story[index].key==='presence')showDeviceReceipt(deviceReceipts.lamp);},1500);
    if(!panel&&s.key==='confirmed')receiptTriggerTimer=setTimeout(()=>{if(!panel&&story[index].key==='confirmed')showDeviceReceipt(deviceReceipts.air);},1000);
    if(panel&&panel!=='logs')fillDetail();
    pulse.classList.remove('active');void pulse.offsetWidth;pulse.classList.add('active');
    requestAnimationFrame(()=>expression.classList.remove('changing'));
  };
  if(immediate){expression.classList.remove('changing');change();} else {expression.classList.add('changing');transitionTimer=setTimeout(change,650);}
  clearTimeout(timer);
  if(!paused) timer=setTimeout(()=>render(index+1),s.ms);
}
function pause(value) {paused=value;clearTimeout(timer);if(!paused)timer=setTimeout(()=>render(index+1),story[index].ms);}
render(0,true);

document.getElementById('world-trigger').addEventListener('click',()=>panel==='world'?closePanel():openPanel('world'));
document.getElementById('world-card').addEventListener('click',()=>panel==='world'?closePanel():openPanel('world'));
document.getElementById('world-card').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.click();}});
eventCard.addEventListener('click',()=>panel==='world'?closePanel():openPanel('world'));
document.getElementById('detail-close').addEventListener('click',()=>{closePanel();document.querySelector('.nav-item.active').focus();});
nav.forEach(b=>b.addEventListener('click',()=>b.dataset.page==='home'?closePanel():openPanel(b.dataset.page)));
logToggle.addEventListener('click',()=>panel==='logs'?closePanel():openPanel('logs'));
logClose.addEventListener('click',()=>{closePanel();logToggle.focus();});
logPrev.addEventListener('click',()=>changeLogPage(-1));
logNext.addEventListener('click',()=>changeLogPage(1));
voice.addEventListener('click',()=>{
  if(voice.classList.contains('listening')||voiceText.textContent==='小元正在回应')return;
  clearTimeout(voiceTimer);
  const wasPaused=paused;
  pause(true);
  voice.classList.add('listening');
  voiceText.textContent='模拟聆听中';
  voiceTimer=setTimeout(()=>{
    voice.classList.remove('listening');voice.classList.add('responding');voiceText.textContent='小元正在回应';
    const old=panel;openPanel('world');
    detailKicker.textContent='小元回应 · 模拟语音';
    detailTitle.textContent='这里怎么样？';
    detailContent.replaceChildren();
    const replies={
      idle:'客厅现在很平稳。我会继续安静地留意。',
      presence:'客厅有人在安静停留，空气目前平稳。我会继续留意。',
      trend:'客厅空气正在变闷。我在看看，怎样调整更合适。',
      intent:'客厅空气有点闷。我会用低噪方式慢慢调整，尽量不打扰。',
      sent:'我已请新风启动，还在等它回应。空气有没有改善，我会继续看。',
      confirmed:'新风已经运行。我还在看空气的变化。',
      improving:'空气正在恢复。我会继续观察，直到它回稳。',
      settled:'客厅空气已经回稳。我会继续安静地照看。'
    };
    const p=document.createElement('p');p.textContent=replies[story[index].key];detailContent.append(p);
    voiceTimer=setTimeout(()=>{voice.classList.remove('responding');voiceText.textContent='请随时吩咐小元';if(old)openPanel(old);else closePanel();if(!wasPaused)pause(false);},7200);
  },1700);
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'||e.key==='Backspace'){
    if(panel){const was=panel;closePanel();if(was==='logs')logToggle.focus();e.preventDefault();}
    return;
  }
  if(panel==='logs'){
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      e.preventDefault();
      changeLogPage(e.key==='ArrowRight'?1:-1);
      if(document.activeElement.disabled)(e.key==='ArrowRight'?logPrev:logNext).focus();
    } else if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();
      const controls=[logClose,logPrev,logNext].filter(button=>!button.disabled);
      const current=controls.indexOf(document.activeElement);
      controls[(current+(e.key==='ArrowDown'?1:controls.length-1)+controls.length)%controls.length].focus();
    }
    return;
  }
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    const current=nav.indexOf(document.activeElement);
    if(current>=0){e.preventDefault();nav[(current+(e.key==='ArrowDown'?1:nav.length-1))%nav.length].focus();}
  }
  if(e.key==='ArrowRight'&&(nav.includes(document.activeElement)||document.activeElement===voice)){e.preventDefault();logToggle.focus();return;}
  if(e.key==='ArrowLeft'&&document.activeElement===logToggle){e.preventDefault();nav.find(button=>button.classList.contains('active')).focus();return;}
  if(e.key===' '&&document.activeElement===document.body){e.preventDefault();pause(!paused);}
  if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&document.activeElement===document.body){e.preventDefault();render(index+(e.key==='ArrowRight'?1:-1));}
  if((e.key==='r'||e.key==='R')&&document.activeElement===document.body){logHistory=[...previousLogs];loggedThisCycle.clear();logPage=0;pause(false);render(0);}
  if((e.key==='i'||e.key==='I')&&document.activeElement===document.body){panel==='world'?closePanel():openPanel('world');}
});
