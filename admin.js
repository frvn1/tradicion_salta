(function(){
 const $=id=>document.getElementById(id);
 const loginView=$('login-view'),dashboard=$('dashboard-view'),modalBackdrop=$('modal-backdrop'),toast=$('toast');
 let toastTimer=null,modalMode='create';
 const titles={overview:['Resumen general','Una mirada rápida al vínculo con tus huéspedes.'],customers:['Clientes registrados','Consultá y gestioná los perfiles de tus huéspedes.'],visits:['Historial de visitas','Cada visita confirmada queda registrada individualmente.'],rewards:['Noches gratis','Administrá los beneficios generados por fidelización.']};
 const initials=dni=>String(dni).slice(-2);
 const customerCell=(c)=>`<div class="client-cell"><span class="client-avatar">${initials(c.dni)}</span><span><strong class="client-dni">${HotelDemo.escapeHtml(c.dni)}</strong><small class="client-sub">Cliente registrado</small></span></div>`;
 function showToast(message,error=false){toast.textContent=message;toast.classList.toggle('toast-error',error);toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3200);}
 function showView(name){
  document.querySelectorAll('.view-panel').forEach(p=>p.hidden=true);$('view-'+name).hidden=false;
  document.querySelectorAll('.side-link').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $('page-title').textContent=titles[name][0];$('page-subtitle').textContent=titles[name][1];renderAll();
 }
 function rewardCount(data,cid){return data.rewards.filter(r=>r.customerId===cid&&r.status==='disponible').length;}
 function currentProgress(data,cid){return HotelDemo.customerVisitCount(data,cid);}
 function renderOverview(data){
  const month=new Date();$('stat-customers').textContent=data.customers.length.toLocaleString('es-AR');$('stat-visits').textContent=data.visits.filter(v=>v.status==='confirmada').length.toLocaleString('es-AR');$('stat-rewards').textContent=data.rewards.filter(r=>r.status==='disponible').length.toLocaleString('es-AR');
  $('stat-month').textContent=data.visits.filter(v=>{const d=new Date(v.createdAt);return v.status==='confirmada'&&d.getMonth()===month.getMonth()&&d.getFullYear()===month.getFullYear();}).length.toLocaleString('es-AR');
  $('side-customer-count').textContent=data.customers.length;
  const recent=[...data.visits].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  $('recent-visits-body').innerHTML=recent.length?recent.map(v=>{const c=HotelDemo.byCustomer(data,v.customerId);return `<tr><td>${c?customerCell(c):'—'}</td><td>${HotelDemo.dateLabel(v.createdAt,true)}</td><td>${HotelDemo.customerTotalVisits(data,v.customerId)}</td><td><span class="badge badge-green">Confirmada</span></td></tr>`;}).join(''):'<tr><td colspan="4">Todavía no hay visitas confirmadas.</td></tr>';
  const near=data.customers.map(c=>({c,count:currentProgress(data,c.id)})).filter(x=>x.count>0&&x.count<3).sort((a,b)=>b.count-a.count).slice(0,4);
  $('near-rewards').innerHTML=near.length?near.map(x=>`<div class="near-item"><span class="near-avatar">✧</span><div class="near-main"><strong>DNI ${HotelDemo.escapeHtml(x.c.dni)}</strong><small>${x.count} de 3 visitas confirmadas</small></div><div class="near-right"><strong>${3-x.count} ${3-x.count===1?'visita':'visitas'}</strong><small>para su premio</small></div></div>`).join(''):'<div class="empty-state">Todavía no hay clientes cerca de su premio.</div>';
 }
 function renderCustomers(data){
  const query=$('customer-search').value.trim();const customers=[...data.customers].filter(c=>c.dni.includes(query)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  $('customer-count').textContent=customers.length+' cliente'+(customers.length===1?'':'s');$('customers-caption').textContent=`${data.customers.length} clientes en total`;
  $('customers-body').innerHTML=customers.map(c=>{const count=currentProgress(data,c.id),total=HotelDemo.customerTotalVisits(data,c.id),rewards=rewardCount(data,c.id);const badge=rewards?`<span class="badge badge-gold">${rewards} disponible${rewards>1?'s':''}</span>`:'<span class="badge badge-gray">Sin premio</span>';return `<tr><td>${customerCell(c)}</td><td>${HotelDemo.dateLabel(c.createdAt)}</td><td><strong>${count}</strong> / 3 <small class="client-sub">Ciclo actual · ${total} históricas</small></td><td><div class="progress-cell"><span class="progress-track"><span class="progress-fill" style="display:block;width:${Math.min(count/3*100,100)}%"></span></span><span class="progress-label">${Math.min(count,3)}/3</span></div></td><td>${badge}</td><td><button class="action-btn" data-action="visit" data-id="${c.id}">＋ Visita</button> <button class="action-btn" data-action="history" data-id="${c.id}">Ver</button></td></tr>`;}).join('');
  $('customers-empty').hidden=customers.length>0;
 }
 function renderVisits(data){
  const q=$('visit-search').value.trim();const visits=[...data.visits].filter(v=>{const c=HotelDemo.byCustomer(data,v.customerId);return c&&c.dni.includes(q);}).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  $('visits-count').textContent=visits.length+' registro'+(visits.length===1?'':'s');
  $('visits-body').innerHTML=visits.map((v,i)=>{const c=HotelDemo.byCustomer(data,v.customerId);return `<tr><td><strong>#${String(i+1).padStart(4,'0')}</strong></td><td>${customerCell(c)}</td><td>${HotelDemo.dateLabel(v.createdAt)}</td><td>${HotelDemo.timeLabel(v.createdAt)}</td><td><span class="badge badge-green">Confirmada</span></td><td><button class="action-btn danger" data-action="delete-visit" data-id="${v.id}">Eliminar</button></td></tr>`;}).join('');
  $('visits-empty').hidden=visits.length>0;
 }
 function renderRewards(data){
  const q=$('reward-search').value.trim();const rewards=[...data.rewards].filter(r=>{const c=HotelDemo.byCustomer(data,r.customerId);return c&&c.dni.includes(q);}).sort((a,b)=>new Date(b.grantedAt)-new Date(a.grantedAt));
  $('rewards-count').textContent=rewards.length+' beneficio'+(rewards.length===1?'':'s');
  $('rewards-body').innerHTML=rewards.map(r=>{const c=HotelDemo.byCustomer(data,r.customerId);const available=r.status==='disponible';return `<tr><td>${customerCell(c)}</td><td>${HotelDemo.dateLabel(r.grantedAt,true)}</td><td><span class="badge ${available?'badge-gold':'badge-gray'}">${available?'Disponible':'Utilizado'}</span></td><td>${r.redeemedAt?HotelDemo.dateLabel(r.redeemedAt,true):'—'}</td><td>${available?`<button class="action-btn" data-action="redeem" data-id="${r.id}">Marcar canje</button>`:'<span class="client-sub">Canjeado</span>'}</td></tr>`;}).join('');
  $('rewards-empty').hidden=rewards.length>0;
 }
 function renderPending(data){
  /* Pending requests are presented in the customer list as a small alert above it. */
  let box=$('pending-box');
  if(!box){box=document.createElement('div');box.id='pending-box';box.className='panel-card';box.style.marginBottom='15px';const customersView=$('view-customers');customersView.insertBefore(box,customersView.firstChild);}
  const pending=[...data.pending].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  box.hidden=pending.length===0;
  box.innerHTML=pending.length?`<div class="section-heading"><div><h3>Solicitudes pendientes de confirmación</h3><p>Verificá la llegada del huésped antes de sumar la visita.</p></div><span class="table-count">${pending.length} pendientes</span></div><div class="table-wrap"><table><thead><tr><th>DNI</th><th>SOLICITUD</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead><tbody>${pending.map(p=>{const c=HotelDemo.byCustomer(data,p.customerId);return `<tr><td>${c?customerCell(c):'—'}</td><td>${HotelDemo.dateLabel(p.createdAt,true)}</td><td><span class="badge badge-gold">Pendiente</span></td><td><button class="action-btn" data-action="confirm" data-id="${p.id}">✓ Confirmar visita</button> <button class="action-btn danger" data-action="reject" data-id="${p.id}">Rechazar</button></td></tr>`;}).join('')}</tbody></table></div>`:'';
 }
 function renderAll(){
  const data=HotelDemo.read();renderOverview(data);renderCustomers(data);renderVisits(data);renderRewards(data);renderPending(data);
 }
 function openModal(){
  modalMode='create';$('modal-symbol').textContent='＋';$('modal-kicker').textContent='GESTIÓN DE CLIENTES';$('modal-title').textContent='Nuevo cliente';$('modal-description').textContent='Ingresá el DNI para crear el perfil del huésped.';$('modal-submit').textContent='Guardar cliente';$('modal-dni').value='';$('modal-error').textContent='';modalBackdrop.hidden=false;setTimeout(()=>$('modal-dni').focus(),20);
 }
 function closeModal(){modalBackdrop.hidden=true;}
 function exportCustomers(){
  const d=HotelDemo.read();HotelDemo.csvDownload('clientes-tradicion-de-salta.csv',[['DNI','Fecha de alta','Visitas ciclo actual','Visitas historicas','Premios disponibles'],...d.customers.map(c=>[c.dni,HotelDemo.dateLabel(c.createdAt,true),currentProgress(d,c.id),HotelDemo.customerTotalVisits(d,c.id),rewardCount(d,c.id)])]);showToast('Archivo de clientes exportado.');
 }
 function exportVisits(){
  const d=HotelDemo.read();HotelDemo.csvDownload('visitas-tradicion-de-salta.csv',[['DNI','Fecha y hora','Estado'],...d.visits.map(v=>{const c=HotelDemo.byCustomer(d,v.customerId);return [c?c.dni:'',HotelDemo.dateLabel(v.createdAt,true),v.status];})]);showToast('Historial de visitas exportado.');
 }
 function exportRewards(){
  const d=HotelDemo.read();HotelDemo.csvDownload('beneficios-tradicion-de-salta.csv',[['DNI','Fecha otorgado','Estado','Fecha utilizado'],...d.rewards.map(r=>{const c=HotelDemo.byCustomer(d,r.customerId);return [c?c.dni:'',HotelDemo.dateLabel(r.grantedAt,true),r.status,HotelDemo.dateLabel(r.redeemedAt,true)];})]);showToast('Beneficios exportados.');
 }
 $('login-form').addEventListener('submit',e=>{e.preventDefault();if($('admin-user').value.trim()==='admin'&&$('admin-pass').value==='tradicion-demo'){loginView.hidden=true;dashboard.hidden=false;$('today-label').textContent=new Intl.DateTimeFormat('es-AR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).format(new Date());renderAll();}else $('login-error').textContent='Usuario o contraseña incorrectos.';});
 $('logout-btn').addEventListener('click',()=>{dashboard.hidden=true;loginView.hidden=false;$('admin-pass').value='';$('login-error').textContent='';});
 document.querySelectorAll('.side-link').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
 document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)));
 $('new-customer').addEventListener('click',openModal);$('new-customer-top').addEventListener('click',openModal);
 $('modal-close').addEventListener('click',closeModal);$('modal-cancel').addEventListener('click',closeModal);
 modalBackdrop.addEventListener('click',e=>{if(e.target===modalBackdrop)closeModal();});
 $('modal-dni').addEventListener('input',()=>{$('modal-dni').value=$('modal-dni').value.replace(/\D/g,'').slice(0,8);});
 $('modal-form').addEventListener('submit',e=>{e.preventDefault();const res=HotelDemo.createCustomer($('modal-dni').value);if(!res.ok){$('modal-error').textContent=res.message;return;}closeModal();renderAll();showToast('Cliente registrado correctamente.');});
 ['customer-search','visit-search','reward-search'].forEach(id=>$(id).addEventListener('input',renderAll));
 $('export-customers').addEventListener('click',exportCustomers);$('export-visits').addEventListener('click',exportVisits);$('export-rewards').addEventListener('click',exportRewards);
 document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-action]');if(!btn)return;
  const action=btn.dataset.action,id=btn.dataset.id,data=HotelDemo.read();
  if(action==='confirm'){
   const result=HotelDemo.confirmVisit(id);renderAll();if(result.ok)showToast(result.granted?'Visita confirmada. ¡Se generó una noche gratis!':'Visita confirmada correctamente.');else showToast(result.message,true);
  }else if(action==='reject'){HotelDemo.cancelPending(id);renderAll();showToast('Solicitud rechazada.');}
  else if(action==='redeem'){
   if(confirm('¿Confirmás que el cliente utilizó su noche gratis?')){const result=HotelDemo.redeemReward(id);renderAll();showToast(result.ok?'Beneficio marcado como utilizado. El ciclo de visitas vuelve a cero.':result.message,!result.ok);}
  }else if(action==='delete-visit'){
   if(confirm('¿Seguro que querés eliminar esta visita del historial de demostración?')){const result=HotelDemo.deleteVisit(id);renderAll();showToast(result.ok?'Visita eliminada.':result.message,!result.ok);}
  }else if(action==='visit'){
   const c=data.customers.find(x=>x.id===id);if(!c)return;
   const pending={id:'pmanual'+Date.now(),customerId:c.id,createdAt:HotelDemo.now(),status:'pendiente'};
   data.pending.push(pending);HotelDemo.write(data);renderAll();showToast('Se agregó una solicitud para confirmar desde el panel.');
   showView('customers');
  }else if(action==='history'){
   const c=data.customers.find(x=>x.id===id);if(!c)return;
   $('visit-search').value=c.dni;showView('visits');$('visit-search').value=c.dni;renderAll();
  }
 });
 /* The app is local-demo only; there is no real authentication until Supabase Auth is integrated. */
})();