// -------- Supabase --------
const SUPABASE_URL  = 'https://lzicgdzwudgtltatzovg.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aWNnZHp3dWRndGx0YXR6b3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzM1MzYsImV4cCI6MjEwMDIwOTUzNn0.c0jXAZQscROOyIpwbtXcGvb47on5XqpeH6-B_PUmpEw';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// -------- estado en memoria --------
let events    = { genero: [], infancia: [] };
let novedades = { genero: [], infancia: [] };
let bitacoras = { genero: [], infancia: [] };
let editingId = { genero: null, infancia: null };
let currentStaffRole = { genero: 'coordinador', infancia: 'coordinador' };

const roleOrder    = ['coordinador','director-coord','director-general'];
const platformColor = {
  genero:   { bg:'#6C2C82', tint:'#F3E9F7', dark:'#4E1F60' },
  infancia: { bg:'#1F8A4C', tint:'#E7F5EC', dark:'#146034' }
};
const staffNames = {
  genero:   ['Sin asignar','Lic. Ana Fernández','Lic. Bruno Gómez','Trab. Social Celeste Ruiz'],
  infancia: ['Sin asignar','Lic. Dana Ibáñez','Prof. Emilio Souza','Trab. Social Fiorella Cabral']
};
const slideIcons = {
  genero:   ['💜','⚖️','🤝','📋','🌸','✊'],
  infancia: ['💚','🌱','👶','📚','🏥','🎨']
};
const bitacoraTipos = {
  genero:   ['Violencia de género','Violencia familiar','Acoso callejero','Otro'],
  infancia: ['Maltrato infantil','Acoso o abuso','Negligencia / desprotección','Otro']
};
const themes = {
  genero:   { accent:'#6C2C82', dark:'#4E1F60', tint:'#F3E9F7' },
  infancia: { accent:'#1F8A4C', dark:'#146034', tint:'#E7F5EC' }
};

// -------- helpers --------
function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
function roleLabel(r) {
  return { coordinador:'Coordinador/a', 'director-coord':'Director/a Coordinador/a', 'director-general':'Dirección General' }[r] || r;
}
function areaLabel(p) { return p === 'genero' ? 'Género' : 'Infancia'; }

function setLoading(on) {
  let el = document.getElementById('app-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-loader';
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;height:3px;background:var(--accent);z-index:9999;transition:opacity .3s;';
    document.body.appendChild(el);
  }
  el.style.opacity = on ? '1' : '0';
}

// -------- mapeo DB → memoria --------
function mapEvento(e) {
  return { id:e.id, day:e.day, month:e.month, title:e.title, detail:e.detail, cupo:e.cupo, anotados:e.anotados };
}
function mapBitacora(b) {
  return {
    id: b.id, platform: b.platform, tipo: b.tipo, detalle: b.detalle,
    status: b.status, responsible: b.responsible, assignedTo: b.assigned_to,
    pendingAck: b.pending_ack, derivedFrom: b.derived_from,
    date: new Date(b.created_at),
    log: (b.bitacora_logs || [])
      .sort((a, z) => new Date(a.created_at) - new Date(z.created_at))
      .map(l => ({ text:l.text, level:l.level, date:new Date(l.created_at) }))
  };
}

// -------- carga desde Supabase --------
async function loadAll() {
  setLoading(true);
  const [evRes, novRes, bitRes] = await Promise.all([
    sb.from('eventos').select('*').order('created_at'),
    sb.from('novedades').select('*').order('created_at'),
    sb.from('bitacoras').select('*, bitacora_logs(*)').order('created_at')
  ]);

  if (evRes.data) {
    events.genero   = evRes.data.filter(e => e.platform === 'genero').map(mapEvento);
    events.infancia = evRes.data.filter(e => e.platform === 'infancia').map(mapEvento);
  }
  if (novRes.data) {
    novedades.genero   = novRes.data.filter(n => n.platform === 'genero');
    novedades.infancia = novRes.data.filter(n => n.platform === 'infancia');
  }
  if (bitRes.data) {
    bitacoras.genero   = bitRes.data.filter(b => b.platform === 'genero').map(mapBitacora);
    bitacoras.infancia = bitRes.data.filter(b => b.platform === 'infancia').map(mapBitacora);
  }

  renderAll();
  setLoading(false);
}

function renderAll() {
  renderAllEvents();
  updateBitacoraTipos();
  renderBitacoraPanels();
  renderNovedadesManage('genero');
  renderNovedadesManage('infancia');
  renderCarousel();
}

// -------- MODAL --------
function openArticleModal(title, detail, body, platform) {
  const tag = document.getElementById('modal-tag');
  tag.textContent  = platform === 'genero' ? 'GÉNERO' : 'INFANCIA';
  tag.className    = 'modal-tag tag-' + platform;
  document.getElementById('modal-title').textContent    = title;
  document.getElementById('modal-subtitle').textContent = detail;
  const txt = body || 'El equipo de la Secretaría está preparando el contenido completo. Contactanos al (011) 4506-5559.';
  document.getElementById('modal-body').innerHTML = txt.split('\n').map(p => p.trim() ? `<p>${escapeHtml(p)}</p>` : '').join('');
  document.getElementById('article-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeArticleModal(event) {
  if (event && event.target !== document.getElementById('article-modal')) return;
  document.getElementById('article-modal').classList.remove('open');
  document.body.style.overflow = '';
}

// -------- BITÁCORA --------
async function submitBitacora() {
  const ambito  = document.getElementById('home-bit-ambito').value;
  const tipo    = document.getElementById('home-bit-tipo').value;
  const detalle = document.getElementById('home-bit-detalle').value.trim();
  if (!detalle) return;
  setLoading(true);
  const { data } = await sb.from('bitacoras')
    .insert({ platform:ambito, tipo, detalle, status:'pendiente', responsible:'coordinador', assigned_to:'Sin asignar', pending_ack:false })
    .select().single();
  if (data) {
    await sb.from('bitacora_logs').insert({ bitacora_id:data.id, text:'Aviso recibido por bitácora anónima.', level:'sistema' });
  }
  document.getElementById('home-bit-detalle').value = '';
  showToast('home');
  await loadAll();
}

async function setBitacoraStatus(platform, id, status) {
  const labels = { pendiente:'Pendiente', seguimiento:'En seguimiento', resuelto:'Resuelto', falso:'Falso aviso' };
  setLoading(true);
  await Promise.all([
    sb.from('bitacoras').update({ status }).eq('id', id),
    sb.from('bitacora_logs').insert({ bitacora_id:id, text:`Estado cambiado a "${labels[status]}".`, level:currentStaffRole[platform] })
  ]);
  await loadAll();
}

async function setBitacoraAssign(platform, id, value) {
  setLoading(true);
  await Promise.all([
    sb.from('bitacoras').update({ assigned_to:value }).eq('id', id),
    sb.from('bitacora_logs').insert({ bitacora_id:id, text:`Asignado a ${value}.`, level:currentStaffRole[platform] })
  ]);
  await loadAll();
}

async function escalateBitacora(platform, id) {
  const b = bitacoras[platform].find(x => x.id === id);
  if (!b) return;
  const idx = roleOrder.indexOf(b.responsible);
  if (idx >= roleOrder.length - 1) return;
  const from    = roleLabel(b.responsible);
  const newRole = roleOrder[idx + 1];
  setLoading(true);
  await Promise.all([
    sb.from('bitacoras').update({ responsible:newRole }).eq('id', id),
    sb.from('bitacora_logs').insert({ bitacora_id:id, text:`No fue atendido a tiempo por ${from} — se escala a ${roleLabel(newRole)}.`, level:currentStaffRole[platform] })
  ]);
  await loadAll();
}

async function deriveBitacora(platform, id) {
  const target  = platform === 'genero' ? 'infancia' : 'genero';
  const logText = `Derivado de ${areaLabel(platform)} a ${areaLabel(target)} por ${roleLabel(currentStaffRole[platform])}.`;
  setLoading(true);
  await Promise.all([
    sb.from('bitacoras').update({ platform:target, pending_ack:true, derived_from:platform, responsible:'coordinador', status:'pendiente', assigned_to:'Sin asignar' }).eq('id', id),
    sb.from('bitacora_logs').insert({ bitacora_id:id, text:logText, level:currentStaffRole[platform] })
  ]);
  await loadAll();
}

async function acknowledgeBitacora(platform, id) {
  const logText = `Recibido y aceptado por ${areaLabel(platform)}.`;
  setLoading(true);
  await Promise.all([
    sb.from('bitacoras').update({ pending_ack:false }).eq('id', id),
    sb.from('bitacora_logs').insert({ bitacora_id:id, text:logText, level:currentStaffRole[platform] })
  ]);
  await loadAll();
}

async function addBitacoraLog(platform, id) {
  const input = document.getElementById('bitlog-' + platform + '-' + id);
  const text  = input.value.trim();
  if (!text) return;
  setLoading(true);
  await sb.from('bitacora_logs').insert({ bitacora_id:id, text, level:currentStaffRole[platform] });
  input.value = '';
  await loadAll();
}

// -------- render bitácora --------
function renderBitacoraPanels() {
  ['genero','infancia'].forEach(platform => {
    const wrap      = document.getElementById(platform + '-bitacora-panel');
    const badge     = document.getElementById('ha-badge-' + platform);
    const list      = bitacoras[platform];
    const pendientes = list.filter(b => b.status === 'pendiente' || b.status === 'seguimiento');

    if (badge) {
      badge.style.display  = pendientes.length > 0 ? 'inline-block' : 'none';
      badge.textContent    = pendientes.length;
    }
    renderBitacoraPie(platform);
    if (!wrap) return;
    if (list.length === 0) { wrap.innerHTML = ''; return; }

    const alertHtml = pendientes.length > 0
      ? `<div class="bitacora-alert">⚠ Hay ${pendientes.length} ${pendientes.length===1?'aviso sin resolver':'avisos sin resolver'} en la bitácora</div>`
      : '';
    const names    = staffNames[platform];
    const itemsHtml = list.slice().reverse().map(b => {
      const canEscalate = b.status !== 'resuelto' && b.status !== 'falso' && roleOrder.indexOf(b.responsible) < roleOrder.length - 1;
      const logHtml     = b.log.map(l => `
        <div class="bit-log-item">
          <span class="bit-log-level">${l.level==='sistema'?'Sistema':roleLabel(l.level)}</span>
          <span class="bit-log-date">${l.date.toLocaleDateString('es-AR')} ${l.date.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</span>
          <p>${escapeHtml(l.text)}</p>
        </div>`).join('');
      return `
      <div class="bitacora-item ${b.status}">
        ${b.pendingAck ? `<div class="bit-derived-banner">📥 Caso derivado desde ${areaLabel(b.derivedFrom)} — pendiente de acuse<button class="bit-ack-btn" onclick="acknowledgeBitacora('${platform}',${b.id})">✓ Acusar recibo</button></div>` : ''}
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
          <input type="text" id="bitlog-${platform}-${b.id}" placeholder="Agregar nota...">
          <button onclick="addBitacoraLog('${platform}',${b.id})">Agregar</button>
        </div>
      </div>`;
    }).join('');
    wrap.innerHTML = `<div class="section-label">Bitácora recibida</div>${alertHtml}${itemsHtml}`;
  });
}

function renderBitacoraPie(platform) {
  const el       = document.getElementById(platform + '-bitacora-pie');
  const legendEl = document.getElementById(platform + '-bitacora-pie-legend');
  if (!el) return;
  const list  = bitacoras[platform];
  const total = list.length;
  if (total === 0) {
    el.style.background = '#eee';
    if (legendEl) legendEl.innerHTML = '<p class="source-note">Todavía no se recibieron avisos.</p>';
    return;
  }
  const resueltos  = list.filter(b => b.status === 'resuelto').length;
  const falsos     = list.filter(b => b.status === 'falso').length;
  const sinResolver = total - resueltos - falsos;
  const stop1 = resueltos / total * 100;
  const stop2 = stop1 + sinResolver / total * 100;
  const c1    = platform === 'genero' ? '#6C2C82' : '#1F8A4C';
  el.style.background = `conic-gradient(${c1} 0% ${stop1}%,#e0a020 ${stop1}% ${stop2}%,#bbb ${stop2}% 100%)`;
  if (legendEl) {
    legendEl.innerHTML = `
      <div class="pie-legend-item"><span class="pie-dot" style="background:${c1};"></span>Resueltos <b>${resueltos}</b></div>
      <div class="pie-legend-item"><span class="pie-dot" style="background:#e0a020;"></span>Sin resolver <b>${sinResolver}</b></div>
      <div class="pie-legend-item"><span class="pie-dot" style="background:#bbb;"></span>Falsos avisos <b>${falsos}</b></div>`;
  }
}

// -------- EVENTOS --------
function renderManageList(platform) {
  const wrap = document.getElementById(platform + '-manage-list');
  if (!wrap) return;
  wrap.innerHTML = events[platform].map(e => {
    const pct = e.cupo ? Math.min(100, Math.round(e.anotados / e.cupo * 100)) : 0;
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

function editEvent(platform, id) {
  const ev = events[platform].find(e => e.id === id);
  if (!ev) return;
  document.getElementById(platform + '-ev-title').value  = ev.title;
  document.getElementById(platform + '-ev-day').value    = ev.day;
  document.getElementById(platform + '-ev-month').value  = ev.month;
  document.getElementById(platform + '-ev-detail').value = ev.detail;
  document.getElementById(platform + '-ev-cupo').value   = ev.cupo;
  editingId[platform] = id;
  document.getElementById(platform + '-ev-submit').textContent = '✓ Guardar cambios';
  document.getElementById(platform + '-ev-cancel').style.display = 'block';
  document.getElementById(platform + '-ev-title').scrollIntoView({ behavior:'smooth', block:'center' });
}

function cancelEdit(platform) {
  editingId[platform] = null;
  ['title','day','month','detail','cupo'].forEach(f => document.getElementById(platform + '-ev-' + f).value = '');
  document.getElementById(platform + '-ev-submit').textContent = '+ Agregar al calendario';
  document.getElementById(platform + '-ev-cancel').style.display = 'none';
}

async function addEvent(platform) {
  const title  = document.getElementById(platform + '-ev-title').value.trim();
  const day    = document.getElementById(platform + '-ev-day').value.trim();
  const month  = document.getElementById(platform + '-ev-month').value.trim().toUpperCase();
  const detail = document.getElementById(platform + '-ev-detail').value.trim();
  const cupo   = parseInt(document.getElementById(platform + '-ev-cupo').value.trim(), 10) || 20;
  if (!title || !day || !month) return;
  setLoading(true);
  if (editingId[platform]) {
    await sb.from('eventos').update({ title, day, month, detail:detail||'Detalle a confirmar', cupo }).eq('id', editingId[platform]);
    cancelEdit(platform);
  } else {
    await sb.from('eventos').insert({ platform, day, month, title, detail:detail||'Detalle a confirmar', cupo, anotados:0 });
    ['title','day','month','detail','cupo'].forEach(f => document.getElementById(platform + '-ev-' + f).value = '');
  }
  await loadAll();
}

async function removeEvent(platform, id) {
  setLoading(true);
  await sb.from('eventos').delete().eq('id', id);
  await loadAll();
}

function renderHomeEvents() {
  const wrap = document.getElementById('home-events-list');
  if (!wrap) return;
  const all = [
    ...events.genero.map(e => ({...e, platform:'genero'})),
    ...events.infancia.map(e => ({...e, platform:'infancia'}))
  ];
  wrap.innerHTML = all.map(e => {
    const c     = platformColor[e.platform];
    const pct   = e.cupo ? Math.min(100, Math.round(e.anotados / e.cupo * 100)) : 0;
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
  }).join('') || '<p class="source-note">Sin eventos por el momento.</p>';
}

async function anotarseEvento(platform, id) {
  const ev = events[platform].find(e => e.id === id);
  if (!ev || ev.anotados >= ev.cupo) return;
  setLoading(true);
  await sb.from('eventos').update({ anotados: ev.anotados + 1 }).eq('id', id);
  showToast('home');
  await loadAll();
}

function renderAllEvents() {
  renderManageList('genero');
  renderManageList('infancia');
  renderHomeEvents();
}

// -------- NOVEDADES / CARRUSEL --------
function renderNovedadesManage(platform) {
  const wrap = document.getElementById(platform + '-novedad-list');
  if (!wrap) return;
  wrap.innerHTML = novedades[platform].map(n => `
    <div class="novedad-item">
      <div><b>${escapeHtml(n.title)}</b><br><span class="source-note">${escapeHtml(n.detail)}</span></div>
      <button onclick="removeNovedad('${platform}',${n.id})" title="Quitar" style="border:none;background:#f4f0f1;color:#a33;width:26px;height:26px;border-radius:50%;cursor:pointer;flex-shrink:0;">✕</button>
    </div>`).join('') || '<p class="source-note">Sin novedades cargadas.</p>';
}

async function addNovedad(platform) {
  const title  = document.getElementById(platform + '-nov-title').value.trim();
  const detail = document.getElementById(platform + '-nov-detail').value.trim();
  const body   = document.getElementById(platform + '-nov-body').value.trim();
  if (!title) return;
  setLoading(true);
  await sb.from('novedades').insert({ platform, title, detail:detail||'', body:body||'' });
  document.getElementById(platform + '-nov-title').value  = '';
  document.getElementById(platform + '-nov-detail').value = '';
  document.getElementById(platform + '-nov-body').value   = '';
  await loadAll();
}

async function removeNovedad(platform, id) {
  setLoading(true);
  await sb.from('novedades').delete().eq('id', id);
  await loadAll();
}

let carouselAutoIdx   = 0;
let carouselAutoTimer = null;
function renderCarousel() {
  const carousel = document.getElementById('carousel');
  const dotsWrap = document.getElementById('dots');
  if (!carousel) return;
  const all = [
    ...novedades.genero.map(n => ({...n, platform:'genero'})),
    ...novedades.infancia.map(n => ({...n, platform:'infancia'}))
  ];
  carousel.innerHTML = all.map((n, i) => {
    const icon = slideIcons[n.platform][i % slideIcons[n.platform].length];
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
  all.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    dotsWrap.appendChild(d);
  });
  carouselAutoIdx = 0;
  if (carouselAutoTimer) clearInterval(carouselAutoTimer);
  if (all.length > 1) {
    carouselAutoTimer = setInterval(() => {
      carouselAutoIdx = (carouselAutoIdx + 1) % all.length;
      const slideW = carousel.children[0] ? carousel.children[0].offsetWidth + 14 : 284;
      carousel.scrollTo({ left: carouselAutoIdx * slideW, behavior:'smooth' });
    }, 4500);
  }
}

// -------- EXPORTAR --------
function exportStats(platform) {
  const label         = platform === 'genero' ? 'Genero' : 'Infancia';
  const totalTalleres = events[platform].length;
  const totalAnotados = events[platform].reduce((s, e) => s + e.anotados, 0);
  const pendientes    = bitacoras[platform].filter(b => b.status === 'pendiente').length;
  const seguimiento   = bitacoras[platform].filter(b => b.status === 'seguimiento').length;
  const resueltos     = bitacoras[platform].filter(b => b.status === 'resuelto').length;
  let csv = `Reporte de estadisticas - ${label} - Municipio de Tigre\nGenerado: ${new Date().toLocaleString('es-AR')}\n\nTalleres y turnos,Cupo,Anotados\n`;
  events[platform].forEach(e => { csv += `"${e.title.replace(/"/g,'""')}",${e.cupo},${e.anotados}\n`; });
  csv += `\nTotal talleres/turnos,${totalTalleres}\nTotal personas anotadas,${totalAnotados}\n\nBitacora,Cantidad\nPendientes,${pendientes}\nEn seguimiento,${seguimiento}\nResueltos,${resueltos}\n`;
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `estadisticas-${platform}-tigre.csv`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// -------- NAVEGACIÓN --------
function setTopnavActive(btn) {
  document.querySelectorAll('.topnav-link').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function finishOnboarding() { goTo('home'); }

// onboarding dots
const onbSlides   = document.getElementById('onb-slides');
const onbDotsWrap = document.getElementById('onb-dots');
[...Array(onbSlides.children.length)].forEach((_, i) => {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  onbDotsWrap.appendChild(d);
});
onbSlides.addEventListener('scroll', () => {
  const idx = Math.round(onbSlides.scrollLeft / onbSlides.children[0].offsetWidth);
  [...onbDotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === idx));
});

function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  if (themes[id]) {
    const t   = themes[id];
    const scr = document.getElementById('screen-' + id);
    scr.style.setProperty('--accent',      t.accent);
    scr.style.setProperty('--accent-dark', t.dark);
    scr.style.setProperty('--tint',        t.tint);
  }
  window.scrollTo(0, 0);
}

function setStaffRole(platform, role, btn) {
  currentStaffRole[platform] = role;
  document.querySelectorAll('#screen-' + platform + ' #' + platform + '-staff .role-seg .seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const superPanel = document.getElementById(platform + '-super-panel');
  const editNote   = document.getElementById(platform + '-edit-note');
  const label      = document.getElementById(platform + '-role-label');
  const names      = { coordinador:'Coordinador/a', 'director-coord':'Director/a Coordinador/a', 'director-general': platform==='genero'?'Directora General':'Director General' };
  if (role === 'coordinador') {
    superPanel.style.display = 'none';
    label.innerHTML = 'Viendo la plataforma como <b>Coordinador/a</b> — carga talleres, novedades y responde la bitácora.';
  } else if (role === 'director-coord') {
    superPanel.style.display = 'block';
    editNote.style.display   = 'none';
    label.innerHTML = `Viendo la plataforma como <b>${names[role]}</b> — supervisa al equipo y accede a estadísticas.`;
  } else {
    superPanel.style.display = 'block';
    editNote.style.display   = 'block';
    label.innerHTML = `Viendo la plataforma como <b>${names[role]}</b> — acceso total a la plataforma.`;
  }
}

function setSuperTab(platform, tab, btn) {
  document.querySelectorAll('#' + platform + '-super-panel .supertab-seg .seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(platform + '-stats-pane').style.display    = tab === 'stats'    ? 'block' : 'none';
  document.getElementById(platform + '-graficos-pane').style.display = tab === 'graficos' ? 'block' : 'none';
}

function showToast(platform) {
  const t = document.getElementById('toast-' + platform);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function updateBitacoraTipos() {
  const ambito = document.getElementById('home-bit-ambito').value;
  document.getElementById('home-bit-tipo').innerHTML = bitacoraTipos[ambito].map(t => `<option>${t}</option>`).join('');
}

// scroll dots carrusel
document.getElementById('carousel').addEventListener('scroll', function () {
  if (!this.children.length) return;
  const slideW = this.children[0].offsetWidth + 14;
  const idx    = Math.round(this.scrollLeft / slideW);
  [...document.getElementById('dots').children].forEach((d, i) => d.classList.toggle('active', i === idx));
  carouselAutoIdx = idx;
});

// cerrar modal con Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeArticleModal(); });

// -------- INIT --------
loadAll();
