window.JWT = async (onlyFrame) => {
  const all = await (await fetch('https://raw.githubusercontent.com/ps-tools-store/dhxp-9pkw/main/links/check.json?'+Date.now())).json();
  const urls = all[location.host] || [];
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const scan = (h, t, finPath, p) => {
    const ins = (h.match(/schema\.org\/InStock|"availability"\s*:\s*"InStock"/g)||[]).length, oos = (h.match(/schema\.org\/(OutOfStock|SoldOut|Discontinued)|"availability"\s*:\s*"OutOfStock"/g)||[]).length;
    const gone = /page not found|product not found|we couldn.t find (that|the) page/i.test(h);
    return {t:(t||'').trim().slice(0,80), ins, oos, gone, red: finPath !== p.pathname ? finPath.slice(0,80) : '', len:h.length};
  };
  const frame = (u) => new Promise(res => {
    const f = document.createElement('iframe'); f.style.cssText='position:fixed;left:-3000px;width:1200px;height:900px';
    let done=false; const fin = async () => { if(done) return; done=true; await sleep(2500);
      try { const d=f.contentDocument; const p=new URL(u); const txt=d.body?d.body.innerText:''; 
        const r=scan(d.documentElement.outerHTML, d.title, f.contentWindow.location.pathname, p);
        r.btn = /add to (bag|cart)/i.test(txt); r.soldtxt=/sold out|out of stock|no longer available|currently unavailable/i.test(txt); res({u, frame:1, ...r}); }
      catch(e){ res({u, err:String(e).slice(0,60)}) } f.remove(); };
    f.onload = fin; setTimeout(fin, 15000); f.src = u.replace(/^https?:\/\/[^\/]+/,''); document.body.appendChild(f);
  });
  const one = async (u) => {
    try {
      const p = new URL(u);
      const m = p.pathname.match(/\/products\/([^\/?#]+)/);
      if (m && !onlyFrame) {
        const r = await fetch('/products/' + m[1] + '.js');
        if (r.status === 200) { const j = await r.json(); return {u, s:200, shop:1, t:j.title, av:j.available, v:j.variants.filter(x=>x.available).length+'/'+j.variants.length}; }
        if (r.status === 404) return {u, s:404, shop:1};
      }
      if (!onlyFrame) {
        const r = await fetch(p.pathname + p.search); const h = await r.text();
        const res = {u, s:r.status, ...scan(h, (h.match(/<title[^>]*>([^<]*)/i)||[])[1], new URL(r.url).pathname, p)};
        if (r.status===404 || res.ins>0 || res.red || (res.len>20000 && res.gone)) return res;
      }
      return await frame(u);
    } catch(e) { return {u, err:String(e).slice(0,80)}; }
  };
  const out=[]; const n = onlyFrame ? 1 : 2;
  for (let i=0;i<urls.length;i+=n) { out.push(...await Promise.all(urls.slice(i,i+n).map(one))); await sleep(500); }
  const ok = r => r.shop ? (r.s===200 && r.av) : (r.frame ? (!r.red && !r.soldtxt && r.btn) : (r.s===200 && !r.red && !r.gone && r.ins>0));
  window.JWTOUT = out;
  return {host:location.host, total:out.length, ok:out.filter(ok).length, issues:out.filter(r=>!ok(r)).map(r=>({u:r.u.slice(-70), s:r.s, red:r.red, t:r.t, ins:r.ins, oos:r.oos, gone:r.gone, btn:r.btn, sold:r.soldtxt, f:r.frame, err:r.err, len:r.len}))};
};

window.SUM = () => { const out=window.JWTOUT||[]; const ok = r => r.shop ? (r.s===200 && r.av) : (r.frame ? (!r.red && !r.soldtxt && r.btn) : (r.s===200 && !r.red && !r.gone && r.ins>0)); return {host:location.host,total:out.length, ok:out.filter(ok).length, issues:out.filter(r=>!ok(r)).map(r=>[r.u.replace(/^https?:\/\/[^\/]+/,'').slice(-55), r.s||'', r.f?'F':'', r.red?'RED:'+r.red.slice(0,40):'', (r.t||'').slice(0,35), 'in'+r.ins+'/oos'+r.oos, r.gone?'GONE':'', r.btn?'BTN':'', r.soldtxt?'SOLD':'', r.err||'', r.len?('len'+r.len):''].filter(Boolean).join(' | '))}; };
window.JWTGO = () => { window.JWTOUT=null; JWT().then(()=>{}); return 'started '+location.host; };
