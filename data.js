const API='https://script.google.com/macros/s/AKfycbxMLmE78ILOjd8fWa8S0u3toO2rzafxcWPKywqFc906XWV8BqN5ix7t2cupq0IMyPfp/exec';
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
let pending;
function loadPlayers(){if(pending)return pending;pending=new Promise((resolve,reject)=>{const cb='masaharuCallback_'+Math.random().toString(36).slice(2);const s=document.createElement('script');let timer=setTimeout(()=>{cleanup();reject(Error('通信がタイムアウトしました'));},16000);function cleanup(){clearTimeout(timer);delete window[cb];s.remove();}window[cb]=(data)=>{cleanup();if(!data||!Array.isArray(data.players))return reject(Error('選手データの形式が違います'));resolve(data.players.sort((a,b)=>Number(a.number)-Number(b.number)));};s.onerror=()=>{cleanup();reject(Error('データを取得できません'));};s.src=API+'?callback='+cb+'&t='+Date.now();document.head.appendChild(s);});return pending;}
function photoHtml(url,alt='選手写真'){return url?`<img src="${esc(url)}" alt="${esc(alt)}" loading="lazy" onerror="this.remove();this.parentElement.insertAdjacentHTML('beforeend','<span class=&quot;no-photo&quot;>NO PHOTO</span>')">`:'<span class="no-photo">NO PHOTO</span>';}
function playerRole(number){
 const roles={'0':['国王'],'1':['創設者','統括責任者'],'2':['創設者','運営責任者']};
 const lines=roles[String(number)];
 return lines?`<span class="player-role" aria-label="${esc(lines.join('・'))}">${lines.map(line=>`<span>${esc(line)}</span>`).join('')}</span>`:'';
}
function radar(stats){
 const labels=['打撃','投球','守備','体力','脚力'],cx=210,cy=210,r=145;
 const raw=Array.isArray(stats)?stats:[];
 const isLuck=v=>String(v??'').trim().normalize('NFKC')==='運';
 const numeric=v=>{const n=Number(v);return v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(n)&&n>=1&&n<=5?n:null;};
 const vals=labels.map((_,i)=>isLuck(raw[i])?3:numeric(raw[i]));
 const luck=labels.map((_,i)=>isLuck(raw[i]));
 const pt=(i,v)=>{const a=-Math.PI/2+2*Math.PI*i/5;return [cx+Math.cos(a)*r*v/5,cy+Math.sin(a)*r*v/5]};
 const poly=v=>Array.from({length:5},(_,i)=>pt(i,v).join(',')).join(' ');
 const grid=[1,2,3,4,5].map(n=>`<polygon points="${poly(n)}" fill="none" stroke="#d9e0e9" stroke-width="1"/>`).join('');
 const axes=labels.map((label,i)=>{const p=pt(i,5.65),q=pt(i,5);return `<line x1="${cx}" y1="${cy}" x2="${q[0]}" y2="${q[1]}" stroke="#c9d4e0"/><text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="middle">${label}</text>`}).join('');
 // 「運」は実際の能力値ではないため、図では中間位置に仮置きし、専用ラベルで区別します。
 const complete=vals.every(v=>v!==null);
 const shape=complete?`<polygon points="${vals.map((v,i)=>pt(i,v).join(',')).join(' ')}" fill="#c22e4350" stroke="#c22e43" stroke-width="3"/>`:'<text x="210" y="210" text-anchor="middle">未入力の項目があります</text>';
 const markers=luck.map((yes,i)=>{if(!yes)return '';const p=pt(i,3);return `<circle cx="${p[0]}" cy="${p[1]}" r="15" fill="#071a36" stroke="#fff" stroke-width="2"/><text class="luck-marker" x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="central">運</text>`}).join('');
 const values=`<div class="ability-list">${labels.map((label,i)=>`<div class="ability-item"><span>${label}</span><strong class="${luck[i]?'is-luck':''}">${luck[i]?'運':vals[i]??'—'}</strong></div>`).join('')}</div>`;
 return `<svg class="radar" viewBox="0 0 420 420" role="img" aria-label="選手能力レーダーチャート。${luck.some(Boolean)?'運の項目は数値ではなく仮の中央位置に表示':''}">${grid}${axes}${shape}${markers}</svg>${values}`;
}
function initMotion(){const els=document.querySelectorAll('.reveal');if(!('IntersectionObserver'in window)){els.forEach(e=>e.classList.add('visible'));return}const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});els.forEach(e=>io.observe(e));}
document.addEventListener('DOMContentLoaded',initMotion);

/* 初回表示・ページ遷移のローディング */
(function(){
 const started=performance.now();
 function dismiss(){const el=document.getElementById('page-loader');if(!el)return;const delay=Math.max(0,550-(performance.now()-started));setTimeout(()=>el.classList.add('is-hidden'),delay)}
 if(document.readyState==='complete')dismiss();else window.addEventListener('load',dismiss,{once:true});
 window.addEventListener('pageshow',e=>{if(e.persisted)document.getElementById('page-loader')?.classList.add('is-hidden')});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target&&a.target!=='_self'||a.hasAttribute('download'))return;let url;try{url=new URL(a.href,location.href)}catch{return}if(url.origin!==location.origin||url.pathname===location.pathname&&url.search===location.search)return;if(!/\.html$/i.test(url.pathname))return;const el=document.getElementById('page-loader');if(!el)return;e.preventDefault();el.classList.remove('is-hidden');setTimeout(()=>{location.href=url.href},230)});
})();
