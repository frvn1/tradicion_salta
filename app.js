/* Tradición de Salta demo data layer. Replace this adapter with Supabase calls for production. */
(function(){
  const KEY='aurea_hotel_demo_v1';
  const pad=n=>String(n).padStart(2,'0');
  const isoDaysAgo=(days,hour=14,minute=0)=>{const d=new Date();d.setDate(d.getDate()-days);d.setHours(hour,minute,0,0);return d.toISOString();};
  const seed=()=>({
    customers:[
      {id:'c1',dni:'30123456',createdAt:isoDaysAgo(60,10,12),visitCount:2},
      {id:'c2',dni:'28456789',createdAt:isoDaysAgo(40,12,35),visitCount:1},
      {id:'c3',dni:'32111222',createdAt:isoDaysAgo(90,9,15),visitCount:3},
      {id:'c4',dni:'27555444',createdAt:isoDaysAgo(12,16,5),visitCount:0},
      {id:'c5',dni:'33987654',createdAt:isoDaysAgo(75,11,20),visitCount:2},
      {id:'c6',dni:'25666777',createdAt:isoDaysAgo(23,13,0),visitCount:1}
    ],
    visits:[
      {id:'v1',customerId:'c1',createdAt:isoDaysAgo(22,14,30),status:'confirmada'},
      {id:'v2',customerId:'c1',createdAt:isoDaysAgo(8,16,45),status:'confirmada'},
      {id:'v3',customerId:'c2',createdAt:isoDaysAgo(18,12,20),status:'confirmada'},
      {id:'v4',customerId:'c3',createdAt:isoDaysAgo(45,10,10),status:'confirmada'},
      {id:'v5',customerId:'c3',createdAt:isoDaysAgo(20,15,5),status:'confirmada'},
      {id:'v6',customerId:'c3',createdAt:isoDaysAgo(2,12,15),status:'confirmada'},
      {id:'v7',customerId:'c5',createdAt:isoDaysAgo(29,11,45),status:'confirmada'},
      {id:'v8',customerId:'c5',createdAt:isoDaysAgo(4,17,10),status:'confirmada'},
      {id:'v9',customerId:'c6',createdAt:isoDaysAgo(7,13,20),status:'confirmada'}
    ],
    rewards:[
      {id:'r1',customerId:'c3',grantedAt:isoDaysAgo(2,12,15),redeemedAt:null,status:'disponible'}
    ],
    pending:[]
  });
  function normalize(data){
    if(!data||!Array.isArray(data.customers)||!Array.isArray(data.visits)||!Array.isArray(data.rewards)) return seed();
    data.pending=Array.isArray(data.pending)?data.pending:[];
    return data;
  }
  function read(){
    try{const raw=localStorage.getItem(KEY);if(!raw){const d=seed();write(d);return d;}return normalize(JSON.parse(raw));}
    catch(e){return seed();}
  }
  function write(data){localStorage.setItem(KEY,JSON.stringify(data));}
  function now(){return new Date().toISOString();}
  function digits(dni){return String(dni||'').replace(/\D/g,'');}
  function validDni(dni){return /^\d{7,8}$/.test(digits(dni));}
  function byCustomer(data,id){return data.customers.find(c=>c.id===id);}
  function getVisitCount(data,customerId){return data.visits.filter(v=>v.customerId===customerId&&v.status==='confirmada').length;}
  function activeRewards(data,customerId){return data.rewards.filter(r=>r.customerId===customerId&&r.status==='disponible').length;}
  function allActiveRewards(data,customerId){return data.rewards.filter(r=>r.customerId===customerId&&r.status==='disponible');}
  function createCustomer(dni){
    dni=digits(dni);if(!validDni(dni))return {ok:false,message:'Ingresá un DNI válido de 7 u 8 números.'};
    const d=read();if(d.customers.some(c=>c.dni===dni))return {ok:false,message:'Ya existe un cliente con ese DNI.'};
    const customer={id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),dni,createdAt:now(),visitCount:0};
    d.customers.push(customer);write(d);return {ok:true,customer};
  }
  function requestVisit(dni){
    dni=digits(dni);if(!validDni(dni))return {ok:false,message:'Ingresá un DNI válido de 7 u 8 números.'};
    const d=read();let customer=d.customers.find(c=>c.dni===dni);
    if(!customer){customer={id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),dni,createdAt:now(),visitCount:0};d.customers.push(customer);}
    const duplicate=d.pending.find(p=>p.customerId===customer.id&&new Date(p.createdAt).toDateString()===new Date().toDateString());
    if(duplicate){return {ok:true,alreadyPending:true,message:'Tu solicitud ya fue enviada hoy. Acercate a recepción para confirmar la visita.'};}
    const pending={id:'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),customerId:customer.id,createdAt:now(),status:'pendiente'};
    d.pending.push(pending);write(d);
    return {ok:true,customer,isNew:!d.visits.some(v=>v.customerId===customer.id),message:'Solicitud recibida. El personal del hotel debe confirmar tu visita en recepción.'};
  }
  function confirmVisit(pendingId){
    const d=read();const pending=d.pending.find(p=>p.id===pendingId);
    if(!pending)return {ok:false,message:'No se encontró la solicitud.'};
    const customer=byCustomer(d,pending.customerId);
    if(!customer)return {ok:false,message:'No se encontró el cliente.'};
    const today=new Date().toDateString();
    const already=d.visits.some(v=>v.customerId===customer.id&&v.status==='confirmada'&&new Date(v.createdAt).toDateString()===today);
    if(already){d.pending=d.pending.filter(p=>p.id!==pendingId);write(d);return {ok:false,message:'Este cliente ya tiene una visita confirmada hoy.'};}
    const visit={id:'v'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),customerId:customer.id,createdAt:now(),status:'confirmada'};
    d.visits.push(visit);d.pending=d.pending.filter(p=>p.id!==pendingId);
    const count=getVisitCount(d,customer.id);
    let granted=false;
    if(count>0&&count%3===0&&!allActiveRewards(d,customer.id).length){
      d.rewards.push({id:'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),customerId:customer.id,grantedAt:now(),redeemedAt:null,status:'disponible'});
      granted=true;
    }
    write(d);return {ok:true,visit,customer,count,granted};
  }
  function cancelPending(id){const d=read();d.pending=d.pending.filter(p=>p.id!==id);write(d);return {ok:true};}
  function redeemReward(id){
    const d=read();const reward=d.rewards.find(r=>r.id===id&&r.status==='disponible');
    if(!reward)return {ok:false,message:'El beneficio no está disponible.'};
    reward.status='utilizado';reward.redeemedAt=now();
    const customer=byCustomer(d,reward.customerId);
    if(customer){
      const current=getVisitCount(d,customer.id);
      customer.visitCount=current%3;
      /* Keep all visit history; next reward is based on confirmed visits since latest redemption. */
      customer.lastRewardVisitCount=current;
    }
    write(d);return {ok:true};
  }
  function deleteVisit(id){
    const d=read();const v=d.visits.find(x=>x.id===id);if(!v)return {ok:false,message:'Visita no encontrada.'};
    if(d.rewards.some(r=>r.customerId===v.customerId&&r.status==='disponible'))return {ok:false,message:'No se puede eliminar: el cliente tiene un beneficio disponible. Gestioná primero el beneficio.'};
    d.visits=d.visits.filter(x=>x.id!==id);write(d);return {ok:true};
  }
  function visitCountSinceReward(data,customerId){
    const customer=byCustomer(data,customerId);if(!customer)return 0;
    const used=data.rewards.filter(r=>r.customerId===customerId&&r.status==='utilizado').sort((a,b)=>new Date(b.redeemedAt)-new Date(a.redeemedAt))[0];
    const boundary=used?new Date(used.redeemedAt):null;
    return data.visits.filter(v=>v.customerId===customerId&&v.status==='confirmada'&&(!boundary||new Date(v.createdAt)>boundary)).length;
  }
  function customerVisitCount(data,customerId){return visitCountSinceReward(data,customerId);}
  function customerTotalVisits(data,customerId){return data.visits.filter(v=>v.customerId===customerId&&v.status==='confirmada').length;}
  function dateLabel(value,withTime=false){
    if(!value)return '—';const d=new Date(value);if(Number.isNaN(d.getTime()))return '—';
    const opts=withTime?{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}:{day:'2-digit',month:'short',year:'numeric'};
    return new Intl.DateTimeFormat('es-AR',opts).format(d);
  }
  function timeLabel(value){if(!value)return '—';return new Intl.DateTimeFormat('es-AR',{hour:'2-digit',minute:'2-digit'}).format(new Date(value));}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function csvDownload(filename,rows){
    const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  window.HotelDemo={read,write,now,digits,validDni,createCustomer,requestVisit,confirmVisit,cancelPending,redeemReward,deleteVisit,getVisitCount,activeRewards,customerVisitCount,customerTotalVisits,dateLabel,timeLabel,escapeHtml,csvDownload,byCustomer};
})();