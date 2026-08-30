const $=s=>document.querySelector(s);
let notes=localStorage.getItem('elite_notes')||'';
$('#notes').value=notes;
$('#theme').onclick=()=>document.body.classList.toggle('light');
$('#save').onclick=()=>{localStorage.setItem('elite_notes',$('#notes').value);$('#saved').textContent='Saved locally in this browser.'};

function detect(v){
 v=v.trim();
 if(/^https?:\/\//i.test(v)) return 'url';
 if(/^\+?[0-9][0-9 ()-]{6,}$/.test(v)) return 'phone';
 if(/^@?[A-Za-z0-9_.-]{3,}$/.test(v) && !v.includes('.')) return 'username';
 if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email';
 if(/^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/.test(v)) return 'ip';
 if(/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v)) return 'domain';
 return 'keyword';
}
function q(u){return encodeURIComponent(u)}
function links(v,t){
 const common=[
  ['Google',`https://www.google.com/search?q=${q(v)}`],
  ['Bing',`https://www.bing.com/search?q=${q(v)}`],
  ['DuckDuckGo',`https://duckduckgo.com/?q=${q(v)}`],
  ['Google exact',`https://www.google.com/search?q=${q('"'+v+'"')}`]
 ];
 if(t==='domain'||t==='url') common.push(['Google site:',`https://www.google.com/search?q=${q('site:'+v)}`],['crt.sh',`https://crt.sh/?q=${q(v)}`]);
 if(t==='username') common.push(['GitHub users',`https://github.com/search?q=${q(v)}&type=users`],['Reddit',`https://www.google.com/search?q=${q('site:reddit.com '+v)}`]);
 if(t==='email') common.push(['Email exact',`https://www.google.com/search?q=${q('"'+v+'"')}`]);
 if(t==='phone') common.push(['Phone exact',`https://www.google.com/search?q=${q('"'+v+'"')}`]);
 if(t==='ip') common.push(['IP exact',`https://www.google.com/search?q=${q('"'+v+'"')}`]);
 if(t==='plate') common.push(['Plate exact',`https://www.google.com/search?q=${q('"'+v+'"')}`]);
 return common;
}
$('#analyze').onclick=()=>{
 const v=$('#target').value.trim(); if(!v)return;
 let t=$('#type').value; if(t==='auto')t=detect(v);
 const ls=links(v,t);
 $('#summary').innerHTML=[['TYPE',t.toUpperCase()],['TARGET',v],['SOURCES',ls.length]].map(x=>`<div class="card stat"><b>${escapeHtml(String(x[1]))}</b><span>${x[0]}</span></div>`).join('');
 $('#results').innerHTML=ls.map(([n,u])=>`<div class="result"><a href="${u}" target="_blank" rel="noopener noreferrer">${escapeHtml(n)}</a><small>${escapeHtml(u)}</small></div>`).join('');
};
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
