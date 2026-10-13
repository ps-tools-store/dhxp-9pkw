window.VER=async(P)=>{const out=[];for(const p of P){try{
const m=p.match(/\/products\/([^\/?#]+)/);
if(m&&window.Shopify){const r=await fetch('/products/'+m[1]+'.js');if(r.status!==200){out.push(p.slice(-45)+' | '+r.status);continue}const j=await r.json();out.push(p.slice(-45)+' | '+j.title.slice(0,40)+' | $'+(j.price/100)+' | avail '+j.variants.filter(v=>v.available).length+'/'+j.variants.length);continue}
const r=await fetch(p);const h=await r.text();const fin=new URL(r.url).pathname;
const t=((h.match(/<title[^>]*>([^<]*)/i)||[])[1]||'').trim().slice(0,55);
const ins=(h.match(/schema\.org\/InStock|"availability":"InStock"/g)||[]).length,oos=(h.match(/schema\.org\/(OutOfStock|SoldOut)|"availability":"OutOfStock"/g)||[]).length;
const cols={};for(const mm of h.matchAll(/"color"\s*:\s*"([^"]{2,40})"[^{}]{0,600}?"availability"\s*:\s*"(?:https?:\/\/schema\.org\/)?(\w+)"/g)){cols[mm[1]]=cols[mm[1]]==='InStock'?'InStock':mm[2]}
out.push(p.slice(-45)+' | '+r.status+(fin!==p.split('?')[0]?' RED '+fin.slice(0,40):'')+' | '+t+' | in'+ins+'/oos'+oos+' | '+Object.entries(cols).slice(0,12).map(([c,a])=>c+(a==='InStock'?'':'(x)')).join(', '))
}catch(e){out.push(p+' ERR '+e)}await new Promise(r=>setTimeout(r,600))}return out};
window.SUG=async(qs)=>{const out={};for(const q of qs){try{const s=await (await fetch('/search/suggest.json?q='+encodeURIComponent(q)+'&resources[type]=product&resources[limit]=10')).json();out[q]=s.resources.results.products.filter(p=>p.available).map(p=>p.title.slice(0,50)+' | '+p.url.split('?')[0]+' | $'+p.price)}catch(e){out[q]='ERR '+e}}return out};
