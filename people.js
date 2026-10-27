// Fictional TV profiles. Photos, synthesized voice samples and sensing records are local demo assets.
// These records do not perform biometric recognition, change account permissions or sync to the miniapp.
const peopleUI = (() => {
  const trigger = document.getElementById('people-toggle');
  const center = document.getElementById('people-center');
  const tabs = document.getElementById('people-members');
  const content = document.getElementById('people-content');
  const scroller = document.getElementById('people-scroll');
  const back = document.getElementById('people-back');
  const add = document.getElementById('add-person');
  const edit = document.getElementById('edit-person');
  const feedback = document.getElementById('people-feedback');
  const miniappGuide = document.getElementById('miniapp-guide');
  let miniappReturnFocus = null, miniappBackground = [];
  function openMiniappGuide(kind, origin, personLabel = '当前人物') {
    if (miniappGuide.classList.contains('open')) return;
    miniappReturnFocus = origin;
    document.getElementById('miniapp-title').textContent = kind === 'person-edit' ? '编辑人物资料' : '添加人物';
    document.getElementById('miniapp-description').textContent = kind === 'person-edit'
      ? `使用微信扫一扫，在引元小程序中编辑${personLabel}的照片、声音和身份资料。`
      : '使用微信扫一扫，在引元小程序中添加家人的照片、声音和身份资料。';
    miniappBackground = [center,...nav,voice,trigger].map(element => ({element,inert:element.inert}));
    miniappBackground.forEach(({element}) => element.inert = true);
    miniappGuide.classList.add('open'); miniappGuide.inert = false; miniappGuide.setAttribute('aria-hidden','false');
    document.getElementById('miniapp-done').focus();
  }
  function closeMiniappGuide(restore = true) {
    if (!miniappGuide.classList.contains('open')) return;
    miniappGuide.classList.remove('open'); miniappGuide.inert = true; miniappGuide.setAttribute('aria-hidden','true');
    miniappBackground.forEach(({element,inert}) => element.inert = inert); miniappBackground = [];
    if (restore && miniappReturnFocus) miniappReturnFocus.focus();
  }
  document.getElementById('miniapp-close').addEventListener('click',() => closeMiniappGuide());
  document.getElementById('miniapp-done').addEventListener('click',() => closeMiniappGuide());
  const hint = '想了解家人的识别资料，可以问小元';
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5a.7.7 0 0 1 1.1-.6l10 6.5a.7.7 0 0 1 0 1.2l-10 6.5a.7.7 0 0 1-1.1-.6z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  // These fixed records illustrate the activity history independently of the homepage story clock.
  const profiles = [
    {id:'dad',label:'爸爸',age:'46 岁',gender:'男',activity:'看电视',location:'客厅',homePresence:true,quote:'小元，帮我看看客厅的空气怎么样。',sources:['camera','mic','radar','entrance'],activities:[
      {label:'出现在客厅',at:'2026-10-27T09:28:00+08:00',source:'客厅摄像头',capture:'person-activity-dad.png'},
      {label:'说话声识别',at:'2026-10-27T09:15:00+08:00',source:'引元盒子麦克风'},
      {label:'离开玄关',at:'2026-10-27T08:42:00+08:00',source:'玄关摄像头'}
    ]},
    {id:'mom',label:'妈妈',age:'44 岁',gender:'女',activity:'整理物品',location:'厨房',quote:'小元，晚上把灯光调得柔和一点。',sources:['camera','mic'],activities:[
      {label:'从厨房回到客厅',at:'2026-10-27T09:20:00+08:00',source:'客厅摄像头',capture:'person-activity-mom.png'},
      {label:'说话声识别',at:'2026-10-27T08:56:00+08:00',source:'引元盒子麦克风'}
    ]},
    {id:'grandma',label:'奶奶',age:'72 岁',gender:'女',activity:'休息',location:'主卧',quote:'小元，我想在客厅坐一会儿。',sources:['camera','mic','radar'],activities:[
      {label:'在客厅停留',at:'2026-10-27T08:50:00+08:00',source:'客厅摄像头、雷达'},
      {label:'说话声识别',at:'2026-10-27T08:43:00+08:00',source:'引元盒子麦克风'}
    ]},
    {id:'chen',label:'小陈',age:'20 岁',gender:'男',activity:null,location:null,quote:'小元，我回来了，家里有什么需要留意的吗。',sources:['camera','mic','radar','entrance'],activities:[
      {label:'回到家中',at:'2026-10-27T09:36:00+08:00',source:'玄关摄像头',capture:'person-activity-chen.png'},
      {label:'离开客厅',at:'2026-10-27T08:20:00+08:00',source:'客厅摄像头'}
    ]}
  ];
  const sources = {
    camera:{device:'视频摄像头',name:'客厅摄像头',image:'./assets/device-img17.png',role:'提供人脸识别依据',room:'客厅 · 视频感知'},
    mic:{name:'引元盒子麦克风',image:'./assets/mic.svg',role:'提供说话人识别依据',room:'客厅 · 声音感知'},
    radar:{device:'射频设备',name:'客厅雷达',image:'./assets/device-img8.png',role:'辅助在场与位置感知',room:'客厅 · 雷达感知'},
    entrance:{name:'玄关摄像头',image:'./assets/device-img17.png',role:'提供进出与人脸识别依据',room:'玄关 · 视频感知'}
  };
  function currentParts(person) {
    const unknown = person.homePresence && story[index].key === 'idle';
    return {activity:unknown?'活动待确认':person.activity||'活动待确认',location:unknown?'位置待确认':person.location||'位置待确认'};
  }
  function currentSituation(person) {
    const state = currentParts(person);
    if (state.activity === '活动待确认' && state.location === '位置待确认') return '当前活动与位置待确认';
    return `${state.activity} · ${state.location}`;
  }
  let selected = 'dad', returnPanel = '', responseTimer = null, playRequest = 0;
  let waveData = {}, playButton = null, elapsed = null, waveform = null, total = null;
  const audio = new Audio();
  audio.preload = 'metadata';
  const current = () => profiles.find(person => person.id === selected);
  function el(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function formatTime(seconds) {
    const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2,'0')}`;
  }
  function resetVoice() {
    clearTimeout(voiceTimer); clearTimeout(responseTimer);
    voice.classList.remove('listening','responding');
    voiceText.textContent = panel === 'people' ? hint : '请随时吩咐小元';
  }
  function updatePlayer() {
    if (!playButton) return;
    playButton.innerHTML = audio.paused ? playIcon : pauseIcon;
    playButton.setAttribute('aria-label',`${audio.paused ? '播放' : '暂停'}${current().label}的声音样本`);
    playButton.setAttribute('aria-pressed',String(!audio.paused));
    elapsed.textContent = formatTime(audio.currentTime);
    const duration = Number.isFinite(audio.duration) ? audio.duration : waveData[selected]?.duration || 0;
    total.textContent = formatTime(duration);
    const progress = duration > 0 ? audio.currentTime / duration : 0;
    waveform.querySelectorAll('span').forEach((bar, i, bars) => bar.classList.toggle('played',i / bars.length < progress));
  }
  function stopAudio() {
    playRequest++;
    audio.pause();
    if (Number.isFinite(audio.duration)) audio.currentTime = 0;
    if (playButton) playButton.disabled = false;
    updatePlayer();
  }
  async function toggleAudio() {
    if (!audio.paused) { audio.pause(); updatePlayer(); return; }
    const request = ++playRequest;
    playButton.disabled = true;
    feedback.textContent = '';
    try { await audio.play(); }
    catch (error) {
      if (request === playRequest && panel === 'people') feedback.textContent = '声音暂时未能播放，请再试一次。';
    } finally {
      if (request === playRequest) { playButton.disabled = false; updatePlayer(); }
    }
  }
  ['timeupdate','loadedmetadata','pause','play'].forEach(event => audio.addEventListener(event,updatePlayer));
  audio.addEventListener('ended',() => { audio.currentTime = 0; updatePlayer(); });
  function renderProfile(animate = true) {
    const person = current();
    content.setAttribute('aria-labelledby',`person-tab-${person.id}`);
    content.replaceChildren();
    const overview = el('div','people-overview');
    const identity = el('section','');
    identity.append(el('h2','people-block-title','人脸与身份'));
    const body = el('div','person-identity');
    const photoGroup = el('div','');
    const photoWrap = el('div','person-photo-wrap');
    const placeholder = el('span','person-photo-placeholder','等待照片更新');
    const photo = el('img','person-photo');
    photo.alt = `${person.label}录入的人脸照片`;
    photo.src = `./assets/person-${person.id}.png`;
    photo.addEventListener('load',() => { placeholder.hidden = true; });
    photo.addEventListener('error',() => { photo.hidden = true; placeholder.textContent = '照片暂不可用'; });
    photoWrap.append(placeholder,photo);
    photoGroup.append(photoWrap,el('p','person-photo-caption','人脸照片 · 已录入'));
    const details = el('div','person-identity-details');
    details.append(el('h3','person-identity-name',`家庭身份 · ${person.label}`));
    const demographics = el('dl','person-demographics');
    [['年龄',person.age],['性别',person.gender]].forEach(([label,value]) => {
      const group = el('div',''); group.append(el('dt','',label),el('dd','',value)); demographics.append(group);
    });
    details.append(demographics,el('p','person-current',currentSituation(person))); body.append(photoGroup,details);
    identity.append(body);
    const voiceInfo = el('section','person-voice-info');
    const heading = el('div','person-voice-heading');
    heading.append(el('h2','people-block-title','声音资料'),el('span','person-voice-status','已录入'));
    voiceInfo.append(heading,el('p','person-voice-quote',`“${person.quote}”`));
    const player = el('div','person-voice-player');
    playButton = el('button','person-play focusable'); playButton.type = 'button'; playButton.addEventListener('click',toggleAudio);
    waveform = el('div','person-wave'); waveform.setAttribute('aria-hidden','true');
    const values = waveData[person.id]?.waveform || Array.from({length:48},(_,i) => .15 + .7 * Math.abs(Math.sin(i * 1.4) * Math.cos(i * .3)));
    values.forEach(value => { const bar = el('span',''); bar.style.height = `${Math.max(4,value * 44)}px`; waveform.append(bar); });
    player.append(playButton,waveform);
    const timing = el('div','person-voice-time'); elapsed = el('span','','0:00'); total = el('span','',''); timing.append(elapsed,total);
    voiceInfo.append(player,timing,el('p','person-voice-note','录入的声音样本 · 点击播放'));
    overview.append(identity,voiceInfo);
    const related = el('section','people-sources');
    const sourceHeading = el('div','people-sources-heading'); sourceHeading.append(el('h2','','关联感知设备'),el('p','',`${person.sources.length} 个感知来源`));
    const carousel = el('div',`person-source-carousel${person.sources.length<=3?' no-arrows':''}`);
    const previousSource = el('button','person-source-arrow focusable','‹'); previousSource.type='button'; previousSource.setAttribute('aria-label','上一组关联设备');
    const nextSource = el('button','person-source-arrow focusable','›'); nextSource.type='button'; nextSource.setAttribute('aria-label','下一组关联设备');
    const grid = el('div','person-source-rail'); grid.setAttribute('aria-label',`${person.label}的关联感知设备`);
    person.sources.forEach(key => {
      const source = sources[key];
      // The published baseline has no device center. These read-only sources are local fixtures.
      const online = true;
      const card = el('article','person-source focusable'); card.tabIndex = 0; card.dataset.source = key;
      card.setAttribute('aria-label',`${source.name}，${source.room}，${online?'在线':'离线'}，${source.role}`);
      const image = el('img',`person-source-image${key==='mic'?' person-source-mic':''}`); image.src = source.image; image.alt = '';
      const copy = el('div','person-source-copy'); const head = el('div','person-source-head');
      head.append(el('h3','person-source-name',source.name),el('span',`person-source-state${online?'':' offline'}`,online?'在线':'离线'));
      copy.append(head,el('p','person-source-room',source.room),el('p','person-source-role',source.role)); card.append(image,copy); grid.append(card);
    });
    const refreshArrows = () => {
      const overflow = grid.scrollWidth > grid.clientWidth + 2;
      previousSource.style.visibility = nextSource.style.visibility = overflow ? 'visible' : 'hidden';
      previousSource.disabled = !overflow || grid.scrollLeft <= 2;
      nextSource.disabled = !overflow || grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
      if (document.activeElement === previousSource && previousSource.disabled && !nextSource.disabled) nextSource.focus({preventScroll:true});
      else if (document.activeElement === nextSource && nextSource.disabled && !previousSource.disabled) previousSource.focus({preventScroll:true});
    };
    const shiftSources = direction => grid.scrollBy({left:direction*(grid.clientWidth+14),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    previousSource.addEventListener('click',() => shiftSources(-1)); nextSource.addEventListener('click',() => shiftSources(1));
    grid.addEventListener('scroll',refreshArrows,{passive:true});
    carousel.append(previousSource,grid,nextSource);
    related.append(sourceHeading,carousel);
    const history = el('section','person-activities');
    const historyHeading = el('div','people-sources-heading');
    const ordered = [...person.activities].sort((a,b) => new Date(b.at)-new Date(a.at));
    const historyDate = ordered.length ? new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',timeZone:'Asia/Shanghai'}).format(new Date(ordered[0].at)) : '';
    historyHeading.append(el('h2','','最近活动'),el('p','',ordered.length ? `${historyDate} · ${ordered.length} 条` : ''));
    const list = el('ol','person-activity-list');
    ordered.forEach(entry => {
      const row = el('li','person-activity-row focusable'); row.tabIndex=0;
      const description = el('div','person-activity-description'); description.append(el('p','person-activity-title',entry.label),el('p','person-activity-source',entry.source));
      const date = new Date(entry.at); const time = el('time','person-activity-time',new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Asia/Shanghai'}).format(date)); time.dateTime=entry.at;
      const capture = el('div','person-activity-capture'); const noCapture = el('span','person-activity-empty','暂无活动截取'); capture.append(noCapture);
      if (entry.capture) {
        const image = el('img','person-activity-image'); image.alt=`${person.label}${entry.label}的摄像头截屏`;
        image.addEventListener('load',() => { noCapture.hidden=true; });
        image.addEventListener('error',() => { image.hidden=true; noCapture.hidden=false; });
        image.src=`./assets/${entry.capture}`; capture.append(image);
      }
      row.append(description,time,capture); list.append(row);
    });
    if (!ordered.length) list.append(el('li','person-history-empty','暂未感知到新的活动'));
    history.append(historyHeading,list);
    content.append(overview,related,history);
    requestAnimationFrame(refreshArrows);
    scroller.scrollTop = 0;
    audio.src = `./assets/person-${person.id}-voice.wav`;
    audio.load(); updatePlayer();
    if (animate) { content.classList.remove('is-entering'); void content.offsetWidth; content.classList.add('is-entering'); }
  }
  function selectPerson(id) {
    if (selected === id) return;
    stopAudio(); selected = id; resetVoice(); feedback.textContent = '';
    tabs.querySelectorAll('[role=tab]').forEach(tab => {
      const active = tab.dataset.person === selected; tab.setAttribute('aria-selected',String(active)); tab.tabIndex = active ? 0 : -1;
    });
    renderProfile();
  }
  profiles.forEach(person => {
    const card = el('button','people-member-card focusable'); card.type='button'; card.id=`person-tab-${person.id}`; card.dataset.person=person.id;
    card.setAttribute('role','tab'); card.setAttribute('aria-label',person.label); card.setAttribute('aria-controls','people-content');
    card.setAttribute('aria-selected',String(person.id===selected)); card.tabIndex=person.id===selected?0:-1;
    const avatar = el('span','person-card-avatar'); const placeholder=el('span','person-card-placeholder',person.label.slice(0,1));
    const image=el('img',''); image.alt=''; image.src=`./assets/person-${person.id}.png`;
    image.addEventListener('load',()=>{placeholder.hidden=true;}); image.addEventListener('error',()=>{image.hidden=true;});
    avatar.append(placeholder,image);
    const copy=el('span','person-card-copy'); const state=currentParts(person);
    const activity=el('span','person-card-activity',state.activity); activity.id=`member-activity-${person.id}`;
    const location=el('span','person-card-location',state.location); location.id=`member-location-${person.id}`;
    copy.append(el('span','person-card-identity',person.label),activity,location);
    card.setAttribute('aria-describedby',`${activity.id} ${location.id}`);
    card.append(avatar,copy); card.addEventListener('click',()=>selectPerson(person.id)); tabs.append(card);
  });
  function refreshMemberStates() {
    profiles.forEach(person=>{
      const card=tabs.querySelector(`[data-person="${person.id}"]`),state=currentParts(person);
      card.querySelector('.person-card-activity').textContent=state.activity;
      card.querySelector('.person-card-location').textContent=state.location;
    });
  }
  function open() {
    if (panel === 'people') { tabs.querySelector('[aria-selected=true]').focus(); return; }
    returnPanel = panel;
    if (!panel) resumeAfterPanel = !paused;
    pause(true); clearTimeout(receiptTriggerTimer); hideDeviceReceipt();
    panel = 'people'; resetVoice(); feedback.textContent = '';
    detail.classList.add('hidden'); detail.inert = true; logPanel.classList.add('hidden'); logPanel.inert = true;
    logPanel.setAttribute('aria-hidden','true'); logToggle.setAttribute('aria-expanded','false');
    worldCard.setAttribute('aria-expanded','false'); document.getElementById('world-trigger').setAttribute('aria-expanded','false');
    stage.classList.add('people-mode'); center.inert = false; center.setAttribute('aria-hidden','false');
    trigger.setAttribute('aria-expanded','true');
    voice.setAttribute('aria-label','与小元交流，了解家人的识别资料');
    nav.forEach(button => button.classList.remove('active'));
    refreshMemberStates(); renderProfile(); tabs.querySelector('[aria-selected=true]').focus();
  }
  function hide() {
    stopAudio(); closeMiniappGuide(false); trigger.setAttribute('aria-expanded','false');
    stage.classList.remove('people-mode'); center.inert=true; center.setAttribute('aria-hidden','true'); detail.inert=false;
    clearTimeout(voiceTimer); clearTimeout(responseTimer); voice.classList.remove('listening','responding'); voiceText.textContent='请随时吩咐小元'; voice.setAttribute('aria-label','与小元交流');
  }
  function close() {
    const previous = returnPanel; closePanel();
    if (previous && previous !== 'people') openPanel(previous);
    trigger.focus();
  }
  function respond() {
    stopAudio(); resetVoice(); voice.classList.add('listening'); voiceText.textContent='正在聆听';
    responseTimer = setTimeout(() => {
      if (panel !== 'people') return;
      voice.classList.remove('listening'); voice.classList.add('responding'); voiceText.textContent='小元正在回应';
      feedback.textContent = `${current().label}的人脸和声音资料已录入。${currentSituation(current()) === '当前活动与位置待确认' ? '当前活动和位置还需要新的感知依据。' : `当前：${currentSituation(current())}。`}可以在下方查看最近活动。`;
      responseTimer=setTimeout(() => { if(panel==='people'){resetVoice();feedback.textContent='';} },4500);
    },1300);
  }
  function visibleControls() {
    return [...center.querySelectorAll('button,[tabindex="0"]'),...nav,voice,trigger].filter(element => !element.disabled && !element.closest('[inert]') && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden' && element.tabIndex >= 0);
  }
  function focus(element) {
    if (!element) return;
    element.focus({preventScroll:true});
    if ((scroller.contains(element) && element !== scroller) || tabs.contains(element)) element.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  }
  function spatialMove(key) {
    const active = document.activeElement;
    if (active.dataset.person && (key==='ArrowUp'||key==='ArrowDown')) {
      const all=[...tabs.children], next=all.indexOf(active)+(key==='ArrowDown'?1:-1);
      if(next<0)focus(back);
      else if(next>=all.length)focus(add);
      else {selectPerson(all[next].dataset.person);focus(all[next]);}
      return;
    }
    if (active.dataset.person && key==='ArrowRight') {focus(playButton);return;}
    const rect=active.getBoundingClientRect(), origin={x:rect.x+rect.width/2,y:rect.y+rect.height/2};
    const horizontal=key==='ArrowLeft'||key==='ArrowRight', sign=key==='ArrowLeft'||key==='ArrowUp'?-1:1;
    const candidates=visibleControls().filter(item=>item!==active && item!==scroller).map(item=>{
      const r=item.getBoundingClientRect(), dx=r.x+r.width/2-origin.x, dy=r.y+r.height/2-origin.y;
      const primary=(horizontal?dx:dy)*sign, secondary=Math.abs(horizontal?dy:dx);
      return {item,primary,score:primary+secondary*2.4};
    }).filter(candidate=>candidate.primary>5).sort((a,b)=>a.score-b.score);
    if(candidates[0])focus(candidates[0].item);
    else if(!horizontal)scroller.scrollBy({top:sign*180,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function onKeyDown(event) {
    if (panel !== 'people') return false;
    if (miniappGuide.classList.contains('open')) {
      if (['Escape','Backspace'].includes(event.key)) { event.preventDefault(); closeMiniappGuide(); }
      else if (['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) {
        event.preventDefault(); const controls=[document.getElementById('miniapp-close'),document.getElementById('miniapp-done')]; focus(controls[(controls.indexOf(document.activeElement)+1)%2]);
      }
      return true;
    }
    if (['Escape','Backspace'].includes(event.key)) { event.preventDefault(); close(); return true; }
    if (event.key==='Tab') { event.preventDefault(); const controls=visibleControls(); focus(controls[(controls.indexOf(document.activeElement)+(event.shiftKey?-1:1)+controls.length)%controls.length]); return true; }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); spatialMove(event.key); return true; }
    if (event.key===' ' && document.activeElement===scroller) {event.preventDefault(); scroller.scrollBy({top:260,behavior:'smooth'});}
    return true;
  }
  trigger.addEventListener('click',open);
  back.addEventListener('click',close);
  add.addEventListener('click',event => { stopAudio(); openMiniappGuide('person',event.currentTarget); });
  edit.addEventListener('click',event => { stopAudio(); openMiniappGuide('person-edit',event.currentTarget,current().label); });
  document.addEventListener('visibilitychange',() => { if(document.hidden)stopAudio(); });
  fetch('./assets/person-voice-data.json').then(response => {if(!response.ok)throw new Error('voice metadata');return response.json();}).then(data => {waveData=data;if(panel==='people'&&audio.paused)renderProfile(false);}).catch(() => {});
  return {open,hide,respond,onKeyDown};
})();
