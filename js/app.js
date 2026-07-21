// ---------- datos (simula backend en memoria) ----------
let events = {
  genero: [
    {id:1, day:'18', month:'JUL', title:'Taller de Nuevas Masculinidades', detail:'18:00 hs · Centro de Integración Social', cupo:20, anotados:14},
    {id:2, day:'22', month:'JUL', title:'Turno: asesoramiento legal gratuito', detail:'10:00 hs · Secretaría, Gral. Pacheco', cupo:8, anotados:8},
    {id:3, day:'25', month:'JUL', title:'Ronda de Promotoras territoriales', detail:'16:00 hs · Barrio Ricardo Rojas', cupo:30, anotados:6},
    {id:4, day:'28', month:'JUL', title:'Grupo de apoyo entre pares', detail:'17:30 hs · Talar de Pacheco', cupo:12, anotados:9},
    {id:5, day:'02', month:'AGO', title:'Capacitación en perspectiva de género', detail:'9:00 hs · Equipos municipales, Tigre Centro', cupo:25, anotados:11}
  ],
  infancia: [
    {id:6, day:'17', month:'JUL', title:'Vacunatorio itinerante', detail:'9:00 hs · Barrio Ricardo Rojas', cupo:50, anotados:22},
    {id:7, day:'21', month:'JUL', title:'Inscripción Colonia de verano', detail:'Todo el día · Centros de Infancia', cupo:40, anotados:40},
    {id:8, day:'26', month:'JUL', title:'Taller de crianza respetuosa', detail:'17:00 hs · Talar de Pacheco', cupo:15, anotados:5},
    {id:9, day:'29', month:'JUL', title:'Feria de servicios en Rincón de Milberg', detail:'10:00 hs · Salud, educación y juego', cupo:60, anotados:18},
    {id:10, day:'04', month:'AGO', title:'Jornada de prevención del acoso escolar', detail:'14:00 hs · Escuelas de Tigre Centro', cupo:35, anotados:9}
  ]
};
let nextEventId = 11;
let editingId = { genero: null, infancia: null };
const platformColor = { genero:{bg:'#6C2C82', tint:'#F3E9F7', dark:'#4E1F60'}, infancia:{bg:'#1F8A4C', tint:'#E7F5EC', dark:'#146034'} };
const staffNames = {
  genero: ['Sin asignar', 'Lic. Ana Fernández', 'Lic. Bruno Gómez', 'Trab. Social Celeste Ruiz'],
  infancia: ['Sin asignar', 'Lic. Dana Ibáñez', 'Prof. Emilio Souza', 'Trab. Social Fiorella Cabral']
};

// Íconos por plataforma para el carrusel
const slideIcons = {
  genero: ['💜', '⚖️', '🤝', '📋', '🌸', '✊'],
  infancia: ['💚', '🌱', '👶', '📚', '🏥', '🎨']
};

// ---------- novedades ----------
let novedades = {
  genero: [
    {id:1, title:'Taller de Nuevas Masculinidades', detail:'Inscripciones abiertas · Centro de Integración Social',
     body:'El taller propone un espacio de reflexión y deconstrucción sobre los mandatos de la masculinidad tradicional. Coordinado por el equipo de Género de la Secretaría, se realizará el 18 de julio a las 18:00 hs en el Centro de Integración Social de Tigre. Cupo limitado. Para anotarte, usá el botón "Anotarme" en la sección de eventos.'},
    {id:2, title:'Turnos de asesoramiento legal gratuito', detail:'Consultas por violencia de género',
     body:'La Secretaría de Mujeres, Géneros e Infancias ofrece turnos de asesoramiento legal gratuito para personas en situación de violencia de género. Atendido por abogadas/os especializadas/os, con total confidencialidad. Podés solicitar tu turno a través de esta app o llamando al (011) 4506-5559 de lunes a viernes de 8 a 18 hs.'},
    {id:3, title:'Ronda de Promotoras territoriales', detail:'Recorrida semanal en Barrio Ricardo Rojas',
     body:'Las Promotoras territoriales de Género realizan recorridas semanales por los barrios del Municipio, brindando información sobre derechos, programas y recursos disponibles. Esta semana estarán en el Barrio Ricardo Rojas el 25 de julio a partir de las 16 hs. Si querés ser Promotora territorial, contactate con la Secretaría.'}
  ],
  infancia: [
    {id:4, title:'Vacunatorio itinerante para infancias', detail:'Esta semana en distintos barrios de Tigre',
     body:'El vacunatorio itinerante del Municipio de Tigre recorre los barrios para facilitar el acceso al calendario de vacunación. Esta semana estará en el Barrio Ricardo Rojas el 17 de julio desde las 9:00 hs. No es necesario turno previo. Traé el carnet de vacunación de tu hijo/a.'},
    {id:5, title:'Colonia de verano — inscripción abierta', detail:'Centros de Infancia, cupos limitados',
     body:'Ya están abiertas las inscripciones para la Colonia de Verano en los Centros de Infancia del Municipio de Tigre. Actividades recreativas, deportivas y culturales para niñas y niños de 4 a 12 años. Los cupos son limitados. La inscripción se realiza en los Centros de Infancia o a través de esta app.'},
    {id:6, title:'Feria de servicios en Rincón de Milberg', detail:'Salud, educación y juego para las familias',
     body:'El 29 de julio de 10 a 17 hs, la Secretaría de Mujeres, Géneros e Infancias organiza una Feria de Servicios en Rincón de Milberg con stands de salud, educación, recreación y más. Habrá vacunación, asesoramiento legal, juegos para los chicos, actividades culturales y atención de todos los programas municipales. Entrada libre y gratuita.'}
  ]
};
let nextNovedadId = 7;

// ---------- bitácora ----------
let bitacoras = { genero: [], infancia: [] };
let nextBitId = 1;

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

let currentStaffRole = { genero: 'coordinador', infancia: 'coordinador' };
const roleOrder = ['coordinador', 'director-coord', 'director-general'];
function roleLabel(role){
  return { coordinador:'Coordinador/a', 'director-coord':'Director/a Coordinador/a', 'director-general':'Dirección General' }[role] || role;
}
function areaLabel(platform){ return platform === 'genero' ? 'Género' : 'Infancia'; }

// ---------- MODAL DE ARTÍCULO ----------
function openArticleModal(title, detail, body, platform){
  const modal = document.getElementById('article-modal');
  const tag = document.getElementById('modal-tag');
  tag.textContent = platform === 'genero' ? 'GÉNERO' : 'INFANCIA';
  tag.className = 'modal-tag tag-' + platform;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-subtitle').textContent = detail;
  const bodyText = body || 'El equipo de la Secretaría está preparando el contenido completo de esta novedad. Consultá a través del teléfono (011) 4506-5559 o visitanos en Hipólito Yrigoyen 1264, Gral. Pacheco.';
  document.getElementById('modal-body').innerHTML = bodyText.split('\n').map(p => p.trim() ? `<p>${escapeHtml(p)}</p>` : '').join('');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeArticleModal(event){
  if(event && event.target !== document.getElementById('article-modal')) return;
  document.getElementById('article-modal').classList.remove('open');
  document.body.style.overflow = '';
}

// ---------- bitácora ----------
function deriveBitacora(platform, id){
  const idx = bitacoras[platform].findIndex(x => x.id === id);
  if(idx === -1) return;
  const b = bitacoras[platform][idx];
  const target = platform === 'genero' ? 'infancia' : 'genero';
  bitacoras[platform].splice(idx, 1);
  b.log.push({ text:`Derivado de ${areaLabel(platform)} a ${areaLabel(target)} por ${roleLabel(currentStaffRole[platform])}.`, level:currentStaffRole[platform], date:new Date() });
  b.pendingAck = true;
  b.derivedFrom = platform;
  b.responsible = 'coordinador';
  b.status = 'pendiente';
  b.assignedTo = 'Sin asignar';
  bitacoras[target].push(b);
  renderBitacoraPanels();
}

function acknowledgeBitacora(platform, id){
  const b = bitacoras[platform].find(x => x.id === id);
  if(!b) return;
  b.pendingAck = false;
  b.log.push({ text:`Recibido y aceptado por ${areaLabel(platform)}.`, level:currentStaffRole[platform], date:new Date() });
  renderBitacoraPanels();
}

function submitBitacora(){
  const ambito = document.getElementById('home-bit-ambito').value;
  const tipo = document.getElementById('home-bit-tipo').value;
  const detalle = document.getElementById('home-bit-detalle').value.trim();
  if(!detalle) return;
  bitacoras[ambito].push({
    id:nextBitId++, tipo, detalle, date:new Date(), status:'pendiente',
    assignedTo:'Sin asignar', responsible:'coordinador', pendingAck:false, derivedFrom:null,
    log:[{ text:'Aviso recibido por bitácora anónima.', level:'sistema', date:new Date() }]
  });
  document.getElementById('home-bit-detalle').value = '';
  showToast('home');
  renderBitacoraPanels();
}

function setBitacoraStatus(platform, id, status){
  const b = bitacoras[platform].find(x => x.id === id);
  if(!b) return;
  b.status = status;
  const labels = { pendiente:'Pendiente', seguimiento:'En seguimiento', resuelto:'Resuelto', falso:'Falso aviso' };
  b.log.push({ text:`Estado cambiado a "${labels[status]}".`, level:currentStaffRole[platform], date:new Date() });
  renderBitacoraPanels();
}

function setBitacoraAssign(platform, id, value){
  const b = bitacoras[platform].find(x => x.id === id);
  if(!b) return;
  b.assignedTo = value;
  b.log.push({ text:`Asignado a ${value}.`, level:currentStaffRole[platform], date:new Date() });
  renderBitacoraPanels();
}

function escalateBitacora(platform, id){
  const b = bitacoras[platform].find(x => x.id === id);
  if(!b) return;
  const idx = roleOrder.indexOf(b.responsible);
  if(idx >= roleOrder.length - 1) return;
  const from = roleLabel(b.responsible);
  b.responsible = roleOrder[idx+1];
  b.log.push({ text:`No fue atendido a tiempo por ${from} — se escala a ${roleLabel(b.responsible)}.`, level:currentStaffRole[platform], date:new Date() });
  renderBitacoraPanels();
}

function addBitacoraLog(platform, id){
  const input = document.getElementById('bitlog-'+platform+'-'+id);
  const text = input.value.trim();
  if(!text) return;
  const b = bitacoras[platform].find(x => x.id === id);
  if(!b) return;
  b.log.push({ text, level:currentStaffRole[platform], date:new Date() });
  input.value = '';
  renderBitacoraPanels();
}

function renderBitacoraPanels(){
  ['genero','infancia'].forEach(platform => {
    const wrap = document.getElementById(platform+'-bitacora-panel');
    const badge = document.getElementById('ha-badge-'+platform);
    const list = bitacoras[platform];
    const pendientes = list.filter(b => b.status === 'pendiente' || b.status === 'seguimiento');

    if(badge){
      if(pendientes.length > 0){ badge.style.display='inline-block'; badge.textContent=pendientes.length; }
      else { badge.style.display='none'; }
    }
    renderBitacoraPie(platform);
    if(!wrap) return;
    if(list.length === 0){ wrap.innerHTML=''; return; }

    const alertHtml = pendientes.length > 0
      ? `<div class="bitacora-alert">⚠ Hay ${pendientes.length} ${pendientes.length===1?'aviso sin resolver':'avisos sin resolver'} en la bitácora</div>`
      : '';
    const names = staffNames[platform];
    const itemsHtml = list.slice().reverse().map(b => {
      const canEscalate = b.status !== 'resuelto' && b.status !== 'falso' && roleOrder.indexOf(b.responsible) < roleOrder.length - 1;
      const logHtml = b.log.map(l => `
        <div class="bit-log-item">
          <span class="bit-log-level">${l.level==='sistema'?'Sistema':roleLabel(l.level)}</span>
          <span class="bit-log-date">${l.date.toLocaleDateString('es-AR')} ${l.date.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</span>
          <p>${escapeHtml(l.text)}</p>
        </div>`).join('');
      return `
      <div class="bitacora-item ${b.status}">
        ${b.pendingAck ? `<div class="bit-derived-banner">📥 Caso derivado desde ${areaLabel(b.derivedFrom)} — pendiente de acuse de recibo<button class="bit-ack-btn" onclick="acknowledgeBitacora('${platform}',${b.id})">✓ Acusar recibo</button></div>` : ''}
        <div class="bit-top">
          <span class="bit-tipo">${escapeHtml(b.tipo)}</span>
          <span class="bit-date">${b.date.toLocaleDateString('es-AR')} · ${b.date.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</span>
        </div>
        <p>${escapeHtml(b.detalle)}</p>
        <div class="bit-resp-row">
          <span class="bit-resp-badge resp-${b.responsible}">Responsable: ${roleLabel(b.responsible)}</span>
          ${canEscalate ? `<button class="bit-escalate" onclick="escalateBitacora('${platform}',${b.id})">⬆ Escalar</button>` : ''}
        </div>
        <button class="bit-derive-btn" onclick="deriveBitacora('${platform}',${b.id})">↔ Enviar a ${platform==='genero'?'Infancia':'Género'}</button>
        <div class="bit-status-row">
          <button class="bit-status-btn ${b.status==='pendiente'?'active-pendiente':''}" onclick="setBitacoraStatus('${platform}',${b.id},'pendiente')">Pendiente</button>
          <button class="bit-status-btn ${b.status==='seguimiento'?'active-seguimiento':''}" onclick="setBitacoraStatus('${platform}',${b.id},'seguimiento')">En seguimiento</button>
          <button class="bit-status-btn ${b.status==='resuelto'?'active-resuelto':''}" onclick="setBitacoraStatus('${platform}',${b.id},'resuelto')">Resuelto</button>
          <button class="bit-status-btn ${b.status==='falso'?'active-falso':''}" onclick="setBitacoraStatus('${platform}',${b.id},'falso')">Falso aviso</button>
        </div>
        <select class="bit-assign" onchange="setBitacoraAssign('${platform}',${b.id},this.value)">
          ${names.map(n => `<option ${n===b.assignedTo?'selected':''}>${n}</option>`).join('')}
        </select>
        <div class="bit-notes-label">Seguimiento (queda registrado)</div>
        <div class="bit-log-list">${logHtml}</div>
        <div class="bit-log-add">
          <input type="text" id="bitlog-${platform}-${b.id}" placeholder="Agregar nota de seguimiento...">
          <button onclick="addBitacoraLog('${platform}',${b.id})">Agregar</button>
        </div>
      </div>`;
    }).join('');
    wrap.innerHTML = `<div class="section-label">Bitácora recibida</div>${alertHtml}${itemsHtml}`;
  });
}

function renderBitacoraPie(platform){
  const el = document.getElementById(platform+'-bitacora-pie');
  const legendEl = document.getElementById(platform+'-bitacora-pie-legend');
  if(!el) return;
  const list = bitacoras[platform];
  const total = list.length;
  if(total === 0){
    el.style.background = '#eee';
    if(legendEl) legendEl.innerHTML = '<p class="source-note">Todavía no se recibieron avisos.</p>';
    return;
  }
  const resueltos = list.filter(b=>b.status==='resuelto').length;
  const falsos = list.filter(b=>b.status==='falso').length;
  const sinResolver = total - resueltos - falsos;
  const stop1 = resueltos/total*100;
  const stop2 = stop1 + sinResolver/total*100;
  const c1 = platform==='genero' ? '#6C2C82' : '#1F8A4C';
  el.style.background = `conic-gradient(${c1} 0% ${stop1}%,#e0a020 ${stop1}% ${stop2}%,#bbb ${stop2}% 100%)`;
  if(legendEl){
    legendEl.innerHTML = `
      <div class="pie-legend-item"><span class="pie-dot" style="background:${c1};"></span>Resueltos <b>${resueltos}</b></div>
      <div class="pie-legend-item"><span class="pie-dot" style="background:#e0a020;"></span>Sin resolver <b>${sinResolver}</b></div>
      <div class="pie-legend-item"><span class="pie-dot" style="background:#bbb;"></span>Falsos avisos <b>${falsos}</b></div>`;
  }
}

// ---------- eventos ----------
function renderManageList(platform){
  const wrap = document.getElementById(platform+'-manage-list');
  if(!wrap) return;
  wrap.innerHTML = events[platform].map(e => {
    const pct = e.cupo ? Math.min(100, Math.round((e.anotados/e.cupo)*100)) : 0;
    return `
    <div class="event-item manage-event">
      <div class="event-date">${e.day}<br>${e.month}</div>
      <div style="flex:1;">
        <h5>${escapeHtml(e.title)}</h5><p>${escapeHtml(e.detail)}</p>
        <span class="cupo-txt">${e.anotados}/${e.cupo} anotados</span>
        <div class="cupo-bar-track"><div class="cupo-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="manage-actions">
        <button class="edit-btn" onclick="editEvent('${platform}',${e.id})" title="Editar">✎</button>
        <button onclick="removeEvent('${platform}',${e.id})" title="Quitar">✕</button>
      </div>
    </div>`;
  }).join('') || '<p class="source-note">Todavía no hay talleres o turnos cargados.</p>';
}

function editEvent(platform, id){
  const ev = events[platform].find(e => e.id === id);
  if(!ev) return;
  document.getElementById(platform+'-ev-title').value = ev.title;
  document.getElementById(platform+'-ev-day').value = ev.day;
  document.getElementById(platform+'-ev-month').value = ev.month;
  document.getElementById(platform+'-ev-detail').value = ev.detail;
  document.getElementById(platform+'-ev-cupo').value = ev.cupo;
  editingId[platform] = id;
  document.getElementById(platform+'-ev-submit').textContent = '✓ Guardar cambios';
  document.getElementById(platform+'-ev-cancel').style.display = 'block';
  document.getElementById(platform+'-ev-title').scrollIntoView({behavior:'smooth', block:'center'});
}

function cancelEdit(platform){
  editingId[platform] = null;
  ['title','day','month','detail','cupo'].forEach(f => document.getElementById(platform+'-ev-'+f).value = '');
  document.getElementById(platform+'-ev-submit').textContent = '+ Agregar al calendario';
  document.getElementById(platform+'-ev-cancel').style.display = 'none';
}

function renderHomeEvents(){
  const wrap = document.getElementById('home-events-list');
  if(!wrap) return;
  const all = [
    ...events.genero.map(e=>({...e, platform:'genero'})),
    ...events.infancia.map(e=>({...e, platform:'infancia'}))
  ];
  wrap.innerHTML = all.map(e => {
    const c = platformColor[e.platform];
    const pct = e.cupo ? Math.min(100, Math.round((e.anotados/e.cupo)*100)) : 0;
    const lleno = e.anotados >= e.cupo;
    return `
    <div class="event-item">
      <div class="event-date" style="background:${c.tint};color:${c.dark};">${e.day}<br>${e.month}</div>
      <div>
        <span class="home-ev-tag" style="background:${c.bg};">${e.platform.toUpperCase()}</span>
        <h5>${escapeHtml(e.title)}</h5><p>${escapeHtml(e.detail)}</p>
        <span class="cupo-txt">${e.anotados}/${e.cupo} anotados${lleno?' · Cupo lleno':''}</span>
        <div class="cupo-bar-track"><div class="cupo-bar-fill" style="width:${pct}%;background:${c.bg};"></div></div>
        <button class="anotarme-btn" style="background:${c.bg};" onclick="anotarseEvento('${e.platform}',${e.id})" ${lleno?'disabled':''}>${lleno?'Cupo lleno':'Anotarme'}</button>
      </div>
    </div>`;
  }).join('') || '<p class="source-note">Sin novedades por el momento.</p>';
}

function anotarseEvento(platform, id){
  const ev = events[platform].find(e => e.id === id);
  if(!ev || ev.anotados >= ev.cupo) return;
  ev.anotados++;
  renderAllEvents();
  showToast('home');
}

function addEvent(platform){
  const title = document.getElementById(platform+'-ev-title').value.trim();
  const day = document.getElementById(platform+'-ev-day').value.trim();
  const month = document.getElementById(platform+'-ev-month').value.trim().toUpperCase();
  const detail = document.getElementById(platform+'-ev-detail').value.trim();
  const cupo = parseInt(document.getElementById(platform+'-ev-cupo').value.trim(), 10) || 0;
  if(!title || !day || !month) return;
  if(editingId[platform]){
    const ev = events[platform].find(e => e.id === editingId[platform]);
    if(ev){ ev.title=title; ev.day=day; ev.month=month; ev.detail=detail||'Detalle a confirmar'; if(cupo) ev.cupo=cupo; }
    cancelEdit(platform);
  } else {
    events[platform].push({id:nextEventId++, day, month, title, detail:detail||'Detalle a confirmar', cupo:cupo||20, anotados:0});
    ['title','day','month','detail','cupo'].forEach(f => document.getElementById(platform+'-ev-'+f).value = '');
  }
  renderAllEvents();
}

function removeEvent(platform, id){
  events[platform] = events[platform].filter(e => e.id !== id);
  renderAllEvents();
}

// ---------- novedades / carrusel ----------
function renderNovedadesManage(platform){
  const wrap = document.getElementById(platform+'-novedad-list');
  if(!wrap) return;
  wrap.innerHTML = novedades[platform].map(n => `
    <div class="novedad-item">
      <div><b>${escapeHtml(n.title)}</b><br><span class="source-note">${escapeHtml(n.detail)}</span></div>
      <button onclick="removeNovedad('${platform}',${n.id})" title="Quitar" style="border:none;background:#f4f0f1;color:#a33;width:26px;height:26px;border-radius:50%;cursor:pointer;flex-shrink:0;">✕</button>
    </div>`).join('') || '<p class="source-note">Sin novedades cargadas.</p>';
}

function addNovedad(platform){
  const title = document.getElementById(platform+'-nov-title').value.trim();
  const detail = document.getElementById(platform+'-nov-detail').value.trim();
  const body = document.getElementById(platform+'-nov-body').value.trim();
  if(!title) return;
  novedades[platform].push({id:nextNovedadId++, title, detail:detail||'', body:body||''});
  document.getElementById(platform+'-nov-title').value = '';
  document.getElementById(platform+'-nov-detail').value = '';
  document.getElementById(platform+'-nov-body').value = '';
  renderNovedadesManage(platform);
  renderCarousel();
}

function removeNovedad(platform, id){
  novedades[platform] = novedades[platform].filter(n => n.id !== id);
  renderNovedadesManage(platform);
  renderCarousel();
}

let carouselAutoIdx = 0;
let carouselAutoTimer = null;
function renderCarousel(){
  const carousel = document.getElementById('carousel');
  const dotsWrap = document.getElementById('dots');
  if(!carousel) return;
  const all = [
    ...novedades.genero.map(n=>({...n, platform:'genero'})),
    ...novedades.infancia.map(n=>({...n, platform:'infancia'}))
  ];
  carousel.innerHTML = all.map((n, i) => {
    const icons = slideIcons[n.platform];
    const icon = icons[i % icons.length];
    return `
    <div class="slide slide-${n.platform}" onclick="openArticleModal(${JSON.stringify(escapeHtml(n.title))},${JSON.stringify(escapeHtml(n.detail))},${JSON.stringify(n.body||'')},${JSON.stringify(n.platform)})">
      <div class="slide-bg"></div>
      <span class="slide-icon">${icon}</span>
      <span class="slide-tag">${n.platform === 'genero' ? 'GÉNERO' : 'INFANCIA'}</span>
      <h3>${escapeHtml(n.title)}</h3>
      <p>${escapeHtml(n.detail)}</p>
      <span class="slide-read">Leer más →</span>
    </div>`;
  }).join('') || '<div class="slide slide-genero"><div class="slide-bg"></div><p style="color:#fff;position:relative;z-index:2;">Sin novedades por el momento.</p></div>';

  dotsWrap.innerHTML = '';
  for(let i=0;i<all.length;i++){
    const d = document.createElement('div');
    d.className = 'dot' + (i===0?' active':'');
    dotsWrap.appendChild(d);
  }
  carouselAutoIdx = 0;
  if(carouselAutoTimer) clearInterval(carouselAutoTimer);
  if(all.length > 1){
    carouselAutoTimer = setInterval(()=>{
      carouselAutoIdx = (carouselAutoIdx+1) % all.length;
      const slideW = carousel.children[0] ? carousel.children[0].offsetWidth + 14 : 284;
      carousel.scrollTo({left: carouselAutoIdx * slideW, behavior:'smooth'});
    }, 4500);
  }
}

// ---------- exportar ----------
function exportStats(platform){
  const label = platform === 'genero' ? 'Genero' : 'Infancia';
  const totalTalleres = events[platform].length;
  const totalAnotados = events[platform].reduce((s,e)=>s+e.anotados, 0);
  const pendientes = bitacoras[platform].filter(b=>b.status==='pendiente').length;
  const seguimiento = bitacoras[platform].filter(b=>b.status==='seguimiento').length;
  const resueltos = bitacoras[platform].filter(b=>b.status==='resuelto').length;
  let csv = `Reporte de estadisticas - ${label} - Municipio de Tigre\nGenerado: ${new Date().toLocaleString('es-AR')}\n\nTalleres y turnos,Cupo,Anotados\n`;
  events[platform].forEach(e => { csv += `"${e.title.replace(/"/g,'""')}",${e.cupo},${e.anotados}\n`; });
  csv += `\nTotal talleres/turnos,${totalTalleres}\nTotal personas anotadas,${totalAnotados}\n\nBitacora,Cantidad\nPendientes,${pendientes}\nEn seguimiento,${seguimiento}\nResueltos,${resueltos}\n`;
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `estadisticas-${platform}-tigre.csv`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function renderAllEvents(){
  renderManageList('genero'); renderManageList('infancia');
  renderHomeEvents();
}

// ---------- navegación ----------
const themes = {
  genero:  {accent:'#6C2C82', dark:'#4E1F60', tint:'#F3E9F7'},
  infancia:{accent:'#1F8A4C', dark:'#146034', tint:'#E7F5EC'}
};

function setTopnavActive(btn){
  document.querySelectorAll('.topnav-link').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function finishOnboarding(){ goTo('home'); }

// onboarding dots
const onbSlides = document.getElementById('onb-slides');
const onbDotsWrap = document.getElementById('onb-dots');
const onbCount = onbSlides.children.length;
for(let i=0;i<onbCount;i++){
  const d = document.createElement('div');
  d.className = 'dot' + (i===0?' active':'');
  onbDotsWrap.appendChild(d);
}
onbSlides.addEventListener('scroll', ()=>{
  const idx = Math.round(onbSlides.scrollLeft / onbSlides.children[0].offsetWidth);
  [...onbDotsWrap.children].forEach((d,i) => d.classList.toggle('active', i===idx));
});

function goTo(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
  if(themes[id]){
    const t = themes[id];
    const scr = document.getElementById('screen-'+id);
    scr.style.setProperty('--accent', t.accent);
    scr.style.setProperty('--accent-dark', t.dark);
    scr.style.setProperty('--tint', t.tint);
  }
  window.scrollTo(0, 0);
}

function setStaffRole(platform, role, btn){
  currentStaffRole[platform] = role;
  document.querySelectorAll('#screen-'+platform+' #'+platform+'-staff .role-seg .seg-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const superPanel = document.getElementById(platform+'-super-panel');
  const editNote = document.getElementById(platform+'-edit-note');
  const label = document.getElementById(platform+'-role-label');
  const names = { coordinador:'Coordinador/a', 'director-coord':'Director/a Coordinador/a', 'director-general': platform==='genero'?'Directora General':'Director General' };
  if(role === 'coordinador'){
    superPanel.style.display = 'none';
    label.innerHTML = 'Viendo la plataforma como <b>Coordinador/a</b> — carga talleres, novedades y responde la bitácora.';
  } else if(role === 'director-coord'){
    superPanel.style.display = 'block';
    editNote.style.display = 'none';
    label.innerHTML = `Viendo la plataforma como <b>${names[role]}</b> — supervisa al equipo y accede a estadísticas.`;
  } else {
    superPanel.style.display = 'block';
    editNote.style.display = 'block';
    label.innerHTML = `Viendo la plataforma como <b>${names[role]}</b> — acceso total a la plataforma.`;
  }
}

function setSuperTab(platform, tab, btn){
  document.querySelectorAll('#'+platform+'-super-panel .supertab-seg .seg-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(platform+'-stats-pane').style.display = (tab==='stats') ? 'block' : 'none';
  document.getElementById(platform+'-graficos-pane').style.display = (tab==='graficos') ? 'block' : 'none';
}

function showToast(platform){
  const t = document.getElementById('toast-'+platform);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

const bitacoraTipos = {
  genero: ['Violencia de género', 'Violencia familiar', 'Acoso callejero', 'Otro'],
  infancia: ['Maltrato infantil', 'Acoso o abuso', 'Negligencia / desprotección', 'Otro']
};
function updateBitacoraTipos(){
  const ambito = document.getElementById('home-bit-ambito').value;
  document.getElementById('home-bit-tipo').innerHTML = bitacoraTipos[ambito].map(t => `<option>${t}</option>`).join('');
}

// scroll dots del carrusel
document.getElementById('carousel').addEventListener('scroll', function(){
  if(!this.children.length) return;
  const slideW = this.children[0].offsetWidth + 14;
  const idx = Math.round(this.scrollLeft / slideW);
  [...document.getElementById('dots').children].forEach((d,i) => d.classList.toggle('active', i===idx));
  carouselAutoIdx = idx;
});

// cerrar modal con Escape
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeArticleModal(); });

// init
renderAllEvents();
updateBitacoraTipos();
renderBitacoraPanels();
renderNovedadesManage('genero');
renderNovedadesManage('infancia');
renderCarousel();
