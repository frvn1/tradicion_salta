(function(){
 const form=document.getElementById('guest-form'),input=document.getElementById('dni'),result=document.getElementById('guest-result');
 form.addEventListener('submit',e=>{
  e.preventDefault();const dni=HotelDemo.digits(input.value);
  result.hidden=false;result.className='result-box';
  if(!HotelDemo.validDni(dni)){result.classList.add('error');result.innerHTML='<strong>Revisá tu DNI</strong>Ingresá un DNI válido de 7 u 8 números.';input.focus();return;}
  const response=HotelDemo.requestVisit(dni);
  if(!response.ok){result.classList.add('error');result.innerHTML='<strong>No pudimos continuar</strong>'+HotelDemo.escapeHtml(response.message);return;}
  result.innerHTML='<strong>✓ '+(response.alreadyPending?'Solicitud ya enviada':'¡Listo!')+'</strong>'+HotelDemo.escapeHtml(response.message);
  form.querySelector('button[type="submit"]').textContent='Consultar nuevamente →';
 });
 input.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(0,8);});
})();