// script.js — simple client-side microsite logic with lazy JSON loading
(() => {
  const content = document.getElementById('content');
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const searchInput = document.getElementById('global-search');

  // Keep caches of loaded JSON
  const CACHE = {
    core: null,
    parks: { loadedFiles: [], entries: [] },
    dogruns: null,
    clinics: null,
    resources: null
  };

  // Config: list of park data files (adjust if adding/removing files)
  const PARK_FILES = ['dog_parks_1.json','dog_parks_2.json','dog_parks_3.json'];

  // Utilities
  function el(html){ const div = document.createElement('div'); div.innerHTML = html.trim(); return div.firstChild; }
  function formatArray(a){ return (a||[]).join(', ') || '—'; }
  function showLoading(msg='Loading…'){ content.innerHTML = `<div class="meta">${msg}</div>`; }
  function tplCard(title, bodyHtml){ return `<div class="card"><strong>${title}</strong><div class="small">${bodyHtml}</div></div>`; }

  // Event: tab click -> handle lazy load as needed
  tabs.forEach(tab => tab.addEventListener('click', async (e) => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const load = tab.dataset.load;
    if(load === 'core') await loadCore();
    if(load === 'parks') await loadParks();
    if(load === 'dogruns') await loadDogRuns();
    if(load === 'clinics') await loadClinics();
    if(load === 'resources') await loadResources();
  }));

  // Global search across loaded sections (if not loaded, will load minimal required)
  searchInput.addEventListener('input', debounce(async (e) => {
    const q = (e.target.value||'').trim().toLowerCase();
    if(!q) {
      // if current active tab is parks/dogruns/clinics/resources/core, re-render it
      const active = document.querySelector('.tab.active').dataset.load;
      if(active==='parks') loadParks();
      if(active==='core') loadCore();
      if(active==='dogruns') loadDogRuns();
      if(active==='clinics') loadClinics();
      if(active==='resources') loadResources();
      return;
    }
    // perform search across all datasets (load if missing)
    showLoading('Searching...');
    await Promise.all([ensureCore(), ensureParks(), ensureDogRuns(), ensureClinics(), ensureResources()]);
    let results = [];
    // search core: general, fines, seasonal
    const core = CACHE.core;
    if(core){
      const g = core.general_rules.filter(r => r.toLowerCase().includes(q)).map(r => ({type:'Core Rule', title: r}));
      results = results.concat(g);
      const fines = Object.values(core.fines).filter(f => f.violation.toLowerCase().includes(q) || (f.note||'').toLowerCase().includes(q)).map(f=>({type:'Fines', title:`${f.violation} — ${f.penalty}`}));
      results = results.concat(fines);
    }
    // search parks
    results = results.concat(CACHE.parks.entries.filter(p => (
      p.name.toLowerCase().includes(q) ||
      (p.notes||'').toLowerCase().includes(q) ||
      (p.designated_areas||[]).join(' ').toLowerCase().includes(q)
    )).map(p => ({type:'Park', title: p.name, meta: p.borough})));
    // dog runs
    if(CACHE.dogruns) {
      results = results.concat(CACHE.dogruns.filter(r=> r.name.toLowerCase().includes(q) || (r.facilities||[]).join(' ').toLowerCase().includes(q))
        .map(r => ({type:'Dog Run', title: r.name, meta: r.borough})));
    }
    // clinics
    if(CACHE.clinics) {
      results = results.concat(CACHE.clinics.filter(c=> c.name.toLowerCase().includes(q) || (c.services||[]).join(' ').toLowerCase().includes(q))
        .map(c=>({type:'Clinic', title:c.name, meta:c.borough || formatArray(c.boroughs)})));
    }
    // resources
    if(CACHE.resources){
      results = results.concat(CACHE.resources.events.filter(ev => ev.name.toLowerCase().includes(q) || (ev.desc||'').toLowerCase().includes(q)).map(ev=>({type:'Event', title:ev.name, meta:ev.month || ev.date})));
      results = results.concat(CACHE.resources.contacts.filter(ct => ct.service.toLowerCase().includes(q) || (ct.notes||'').toLowerCase().includes(q)).map(ct=>({type:'Contact', title:ct.service, meta:ct.phone || ct.url})));
    }

    // Render results
    if(results.length === 0){
      content.innerHTML = `<div class="section-title"><h2>Search results</h2></div><div class="card">No results for "<strong>${escapeHtml(q)}</strong>"</div>`;
      return;
    }
    const html = results.slice(0,200).map(r => `<div class="card"><strong>${escapeHtml(r.title)}</strong> <span class="badge">${escapeHtml(r.type)}</span><div class="meta">${r.meta||''}</div></div>`).join('');
    content.innerHTML = `<div class="section-title"><h2>Search results (${results.length})</h2></div>${html}`;
  }, 300));

  // --- LOADERS & RENDERERS ---

  async function ensureCore(){ if(CACHE.core) return; await loadCore(true); }
  async function ensureParks(){ if(CACHE.parks.entries.length) return; await loadParks(true); }
  async function ensureDogRuns(){ if(CACHE.dogruns) return; await loadDogRuns(true); }
  async function ensureClinics(){ if(CACHE.clinics) return; await loadClinics(true); }
  async function ensureResources(){ if(CACHE.resources) return; await loadResources(true); }

  async function loadCore(silent){
    if(!silent) showLoading('Loading overview...');
    if(CACHE.core) {
      if(!silent) renderCore(CACHE.core);
      return;
    }
    try {
      const res = await fetch('dog_core.json'); CACHE.core = await res.json();
      if(!silent) renderCore(CACHE.core);
    } catch(err){
      content.innerHTML = `<div class="card">Failed to load core data: ${err}</div>`;
    }
  }

  function renderCore(core){
    const rulesHtml = core.general_rules.map(r => `<li>${escapeHtml(r)}</li>`).join('');
    const finesHtml = Object.values(core.fines || {}).map(f=> `<li><span class="field">${escapeHtml(f.violation)}</span> — ${escapeHtml(f.penalty)} ${f.note?`<div class="small">${escapeHtml(f.note)}</div>`:''}</li>`).join('');
    const licenseHtml = `
      <div class="card">
        <strong>Licensing & Vaccination</strong>
        <div class="small">
          <div><span class="field">Requirement:</span>${escapeHtml(core.licenses.requirement)}</div>
          <div><span class="field">Fees:</span> Spayed/Neutered ${escapeHtml(core.licenses.fees.spayed_neutered.cost)} • Not spayed ${escapeHtml(core.licenses.fees.non_spayed_neutered.cost)}</div>
          <div><span class="field">Apply:</span>${escapeHtml(core.licenses.application.methods.join(', '))}</div>
        </div>
      </div>`;
    const seasonalHtml = Object.entries(core.seasonal_rules || {}).map(([k,v]) => `<div class="card"><strong>${escapeHtml(capitalize(k))} guidance</strong><div class="small">${Object.entries(v).map(([kk,vv])=>`<div><span class="field">${escapeHtml(capitalize(kk))}:</span>${escapeHtml(vv)}</div>`).join('')}</div></div>`).join('');
    content.innerHTML = `
      <div class="section-title"><h2>Overview</h2><div class="controls"><button class="btn" id="btn-faq">FAQ</button></div></div>
      <div class="two-col">
        <div>
          <h3>General Rules</h3>
          <ul class="list">${rulesHtml}</ul>
          <h3>Fines & Enforcement</h3>
          <ul class="list">${finesHtml}</ul>
        </div>
        <aside>
          ${licenseHtml}
          <div class="card"><strong>Transport rules</strong><div class="small">${Object.entries(core.transport_rules || {}).map(([k,v])=>`<div><span class="field">${escapeHtml(capitalize(k))}:</span>${escapeHtml(v)}</div>`).join('')}</div></div>
          ${seasonalHtml}
        </aside>
      </div>
    `;
    const faqBtn = document.getElementById('btn-faq');
    faqBtn.addEventListener('click', () => {
      const faqs = core.faq || [];
      content.innerHTML = `<div class="section-title"><h2>FAQ</h2></div><div>${faqs.map(q=>`<div class="card"><strong>${escapeHtml(q.q)}</strong><div class="small">${escapeHtml(q.a)}</div></div>`).join('')}</div>`;
    });
  }

  async function loadParks(silent){
    if(!silent) showLoading('Loading parks (this may take a moment)...');
    // load each parks file in sequence if not already loaded
    try {
      for(const fn of PARK_FILES){
        if(CACHE.parks.loadedFiles.includes(fn)) continue;
        const res = await fetch(fn);
        if(!res.ok) continue;
        const json = await res.json();
        CACHE.parks.loadedFiles.push(fn);
        CACHE.parks.entries = CACHE.parks.entries.concat(json.entries || []);
      }
      renderParks();
    } catch(err){
      content.innerHTML = `<div class="card">Failed to load parks data: ${err}</div>`;
    }
  }

  function renderParks(){
    const parks = CACHE.parks.entries;
    const boroughs = Array.from(new Set(parks.map(p=>p.borough))).sort();
    const controlsHtml = `<div class="filter-row"><select id="filter-borough" class="input"><option value="">All boroughs</option>${boroughs.map(b=>`<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('')}</select>
      <select id="filter-type" class="input"><option value="">All types</option><option value="off-leash">Off-leash allowed</option><option value="leash-only">Leash-only</option></select>
      <button id="btn-clear" class="btn secondary">Clear</button></div>`;
    const listHtml = parks.map(p => `<div class="card">
      <strong>${escapeHtml(p.name)}</strong> <span class="badge">${escapeHtml(p.borough)}</span>
      <div class="meta">${escapeHtml(p.summary || '')}</div>
      <div class="small"><span class="field">Off-leash hours:</span>${escapeHtml(formatArray(p.off_leash_hours || []))}</div>
      <div class="small"><span class="field">Designated areas:</span>${escapeHtml(formatArray(p.designated_areas || []))}</div>
      <div class="small">${p.notes?escapeHtml(p.notes):''}</div>
    </div>`).join('');
    content.innerHTML = `<div class="section-title"><h2>Parks</h2><div class="controls"><div class="meta">${parks.length} parks loaded</div></div></div>${controlsHtml}<div id="parks-list">${listHtml}</div>`;
    document.getElementById('filter-borough').addEventListener('change', applyParkFilters);
    document.getElementById('filter-type').addEventListener('change', applyParkFilters);
    document.getElementById('btn-clear').addEventListener('click', () => {
      document.getElementById('filter-borough').value = '';
      document.getElementById('filter-type').value = '';
      applyParkFilters();
    });
  }

  function applyParkFilters(){
    const borough = document.getElementById('filter-borough').value;
    const type = document.getElementById('filter-type').value;
    let filtered = CACHE.parks.entries.slice();
    if(borough) filtered = filtered.filter(p => p.borough === borough);
    if(type === 'off-leash') filtered = filtered.filter(p => (p.off_leash_hours||[]).length>0 || (p.designated_areas||[]).length>0);
    if(type === 'leash-only') filtered = filtered.filter(p => !(p.off_leash_hours||[]).length);
    const listHtml = filtered.map(p => `<div class="card">
      <strong>${escapeHtml(p.name)}</strong> <span class="badge">${escapeHtml(p.borough)}</span>
      <div class="meta">${escapeHtml(p.summary || '')}</div>
      <div class="small"><span class="field">Off-leash hours:</span>${escapeHtml(formatArray(p.off_leash_hours || []))}</div>
      <div class="small"><span class="field">Designated areas:</span>${escapeHtml(formatArray(p.designated_areas || []))}</div>
      <div class="small">${p.notes?escapeHtml(p.notes):''}</div>
    </div>`).join('');
    document.getElementById('parks-list').innerHTML = listHtml || `<div class="card">No parks match filters.</div>`;
  }

  async function loadDogRuns(silent){
    if(!silent) showLoading('Loading dog runs...');
    if(CACHE.dogruns) {
      return renderDogRuns();
    }
    try{
      const res = await fetch('dog_runs.json'); CACHE.dogruns = await res.json();
      renderDogRuns();
    }catch(err){ content.innerHTML = `<div class="card">Failed to load dog runs: ${err}</div>`; }
  }
  function renderDogRuns(){
    const runs = CACHE.dogruns || [];
    const html = runs.map(r => `<div class="card"><strong>${escapeHtml(r.name)}</strong> <span class="badge">${escapeHtml(r.borough)}</span>
      <div class="small"><span class="field">Surface:</span>${escapeHtml(r.surface)} <span class="field">Hours:</span>${escapeHtml(r.hours)}</div>
      <div class="small"><span class="field">Facilities:</span>${escapeHtml(formatArray(r.facilities || []))}</div>
      <div class="small">${r.notes?escapeHtml(r.notes):''}</div>
    </div>`).join('');
    content.innerHTML = `<div class="section-title"><h2>Dog Runs</h2><div class="controls"><div class="meta">${runs.length} runs</div></div></div>${html}`;
  }

  async function loadClinics(silent){
    if(!silent) showLoading('Loading clinics & services...');
    if(CACHE.clinics) return renderClinics();
    try{
      const res = await fetch('clinics_and_services.json'); CACHE.clinics = await res.json();
      renderClinics();
    }catch(err){ content.innerHTML = `<div class="card">Failed to load clinics: ${err}</div>`; }
  }
  function renderClinics(){
    const list = CACHE.clinics || [];
    const html = list.map(c => `<div class="card"><strong>${escapeHtml(c.name)}</strong> <span class="badge">${escapeHtml(c.type || c.boroughs)}</span>
      <div class="small">${escapeHtml(c.address || formatArray(c.boroughs || []))} ${c.phone?`<div><span class="field">Phone:</span>${escapeHtml(c.phone)}</div>`:''}</div>
      <div class="small"><span class="field">Services:</span>${escapeHtml(formatArray(c.services || []))}</div>
      <div class="small">${c.notes?escapeHtml(c.notes):''}</div>
    </div>`).join('');
    content.innerHTML = `<div class="section-title"><h2>Clinics & Services</h2><div class="controls"><div class="meta">${list.length} entries</div></div></div>${html}`;
  }

  async function loadResources(silent){
    if(!silent) showLoading('Loading resources & contacts...');
    if(CACHE.resources) return renderResources();
    try{
      const res = await fetch('resources_events_contacts.json'); CACHE.resources = await res.json();
      renderResources();
    }catch(err){ content.innerHTML = `<div class="card">Failed to load resources: ${err}</div>`; }
  }
  function renderResources(){
    const r = CACHE.resources;
    const html = `
      <div class="section-title"><h2>Resources & Emergency Contacts</h2></div>
      <div class="card"><strong>Official links</strong><div class="small">${r.official.map(o=>`<div><a href="${escapeHtml(o.url)}" target="_blank" rel="noopener">${escapeHtml(o.title)}</a></div>`).join('')}</div></div>
      <div class="card"><strong>Emergency Contacts</strong><div class="small">${r.contacts.map(c=>`<div><span class="field">${escapeHtml(c.service)}:</span>${escapeHtml(c.phone || c.url)} ${c.notes?`<div class="small">${escapeHtml(c.notes)}</div>`:''}</div>`).join('')}</div></div>
      <div class="card"><strong>Events</strong><div class="small">${r.events.map(e=>`<div><strong>${escapeHtml(e.name)}</strong> — ${escapeHtml(e.location||e.borough)} (${escapeHtml(e.month||e.date)})<div>${escapeHtml(e.desc||'')}</div></div>`).join('')}</div></div>
    `;
    content.innerHTML = html;
  }

  // initial load: overview
  loadCore();

  // small helpers
  function debounce(fn, wait){ let t; return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); }; }
  function formatArray(a){ return (Array.isArray(a)?a:[]).join(', '); }
  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]); }
  function capitalize(s){ if(!s) return ''; return s[0].toUpperCase()+s.slice(1); }

})();
