window.CK = async (P) => { const out=[]; for (const p of P){ try{
  const m=p.match(/\/products\/([^\/?#]+)/);
  if (m && window.Shopify){ const r=await fetch('/products/'+m[1]+'.js'); if(r.status!==200){out.push([p.slice(-50),r.status].join('|')); continue;} const j=await r.json(); out.push([p.slice(-50),200,j.title.slice(0,40),'av:'+j.available, j.variants.filter(v=>v.available).length+'/'+j.variants.length].join('|')); continue; }
  const r=await fetch(p); const h=await r.text(); const fin=new URL(r.url);
  out.push([p.slice(-55), r.status, fin.pathname===p.split('?')[0]?'':'RED:'+fin.pathname.slice(0,40), 'in'+(h.match(/schema\.org\/InStock|"availability":"InStock"/g)||[]).length, 'oos'+(h.match(/schema\.org\/(OutOfStock|SoldOut|Discontinued)|"availability":"OutOfStock"/g)||[]).length, ((h.match(/<title[^>]*>([^<]*)/i)||[])[1]||'').trim().slice(0,45), 'len'+h.length].join('|'));
 }catch(e){out.push(p+' ERR '+String(e).slice(0,50))} await new Promise(r=>setTimeout(r,700)); } return out; };
