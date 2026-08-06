let history = [];
let briefState = {tipo_proyecto:"",alcance:"",presupuesto:"",plazo:"",nombre:"",empresa:"",contacto:"",urgencia:"",resumen:""};

const msgsEl = document.getElementById('msgs');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const ctaBtn = document.getElementById('ctaBtn');
const ctaHint = document.getElementById('ctaHint');

// Guion de demostración: no llama a ningún servidor, todo corre en el navegador.
const script = [
  { reply: "¡Genial! Cuéntame un poco más: ¿qué funcionalidades clave necesitas? (ej. carrito de compras, pagos en línea, catálogo de productos)", brief: { tipo_proyecto: "ecommerce" } },
  { reply: "Perfecto. ¿Tienes un presupuesto aproximado en mente para este proyecto?", brief: { alcance: "carrito de compras, pagos en línea, catálogo de productos" } },
  { reply: "Entendido. ¿Para cuándo te gustaría tenerlo listo?", brief: { presupuesto: "$3.000.000 - $5.000.000 COP" } },
  { reply: "¡Genial! Por último, ¿me compartes tu nombre y un correo o teléfono de contacto?", brief: { plazo: "1-2 meses" } },
  { reply: "¡Muchas gracias! Un especialista de 4D Software se pondrá en contacto contigo muy pronto. 🎉", brief: { nombre: "Cliente de prueba", contacto: "cliente@correo.com", urgencia: "media", resumen: "Tienda virtual con carrito y pagos en línea, presupuesto medio, plazo 1-2 meses" } }
];

function addBubble(role, text){
  const row = document.createElement('div');
  row.className = 'row ' + (role === 'user' ? 'user' : 'bot');
  const b = document.createElement('div');
  b.className = 'bubble';
  b.textContent = text;
  row.appendChild(b);
  msgsEl.appendChild(row);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function addTyping(){
  const row = document.createElement('div');
  row.className = 'row bot';
  row.id = 'typingRow';
  const b = document.createElement('div');
  b.className = 'bubble typing';
  b.innerHTML = '<span></span><span></span><span></span>';
  row.appendChild(b);
  msgsEl.appendChild(row);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}
function removeTyping(){
  const t = document.getElementById('typingRow');
  if(t) t.remove();
}

function setField(id, value){
  const el = document.getElementById(id);
  if(value && value.trim() !== ""){
    el.textContent = value;
    el.classList.remove('empty');
  } else {
    el.textContent = "—";
    el.classList.add('empty');
  }
}

function renderBrief(){
  setField('f_tipo', briefState.tipo_proyecto);
  setField('f_alcance', briefState.alcance);
  setField('f_presupuesto', briefState.presupuesto);
  setField('f_plazo', briefState.plazo);
  const contacto = [briefState.nombre, briefState.empresa, briefState.contacto].filter(Boolean).join(' · ');
  setField('f_contacto', contacto);

  const u = document.getElementById('f_urgencia');
  const level = briefState.urgencia || 'sin definir';
  u.textContent = level;
  u.className = 'urgency ' + (['baja','media','alta'].includes(level) ? level : 'baja');

  const keys = ['tipo_proyecto','alcance','presupuesto','plazo'];
  const filled = keys.filter(k => briefState[k] && briefState[k].trim() !== "").length + (contacto ? 1 : 0);
  const pct = Math.round((filled/5)*100);
  document.getElementById('progFill').style.width = pct + '%';
  document.getElementById('progPct').textContent = pct + '%';

  if(briefState.tipo_proyecto && contacto){
    const msg = encodeURIComponent(
      `Nuevo lead calificado por el asistente IA:\n` +
      `Tipo: ${briefState.tipo_proyecto}\n` +
      `Alcance: ${briefState.alcance || 'por definir'}\n` +
      `Presupuesto: ${briefState.presupuesto || 'por definir'}\n` +
      `Plazo: ${briefState.plazo || 'por definir'}\n` +
      `Contacto: ${contacto}\n` +
      `Resumen: ${briefState.resumen || ''}`
    );
    ctaBtn.href = `https://wa.me/573164509919?text=${msg}`;
    ctaBtn.classList.add('show');
    ctaHint.textContent = '¡Brief listo! Un especialista de 4D puede recibirlo ahora mismo.';
  }
}

function mergeBrief(newData){
  for(const k in briefState){
    if(newData[k] && String(newData[k]).trim() !== ""){
      briefState[k] = newData[k];
    }
  }
  renderBrief();
}

async function respond(){
  addTyping();
  sendBtn.disabled = true;
  await new Promise(r => setTimeout(r, 700));
  removeTyping();

  const turn = history.filter(m => m.role === 'user').length;
  const step = script[Math.min(turn - 1, script.length - 1)] || script[0];

  addBubble('bot', step.reply);
  history.push({role:'assistant', content: step.reply});
  mergeBrief(step.brief);

  sendBtn.disabled = false;
  inputEl.focus();
}

function sendMessage(){
  const val = inputEl.value.trim();
  if(!val) return;
  addBubble('user', val);
  history.push({role:'user', content: val});
  inputEl.value = '';
  respond();
}

sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', e => { if(e.key === 'Enter') sendMessage(); });

addBubble('bot', '¡Hola! 👋 Soy el asistente de 4D Software & Soluciones. Cuéntame, ¿en qué tipo de proyecto estás pensando? (web, app móvil, ecommerce, ciberseguridad u otra cosa)');
renderBrief();