window.JWT = async () => {
  const all = await (await fetch('https://raw.githubusercontent.com/ps-tools-store/dhxp-9pkw/main/links/check.json?'+Date.now())).json();
  const urls = all[location.host] || [];
  const one = async (u) => {
    try {
      const p = new URL(u);
      const m = p.pathname.match(/\/products\/([^\/?#]+)/);
      if (m) {
        const r = await fetch('/products/' + m[1] + '.js');
        if (r.status === 200) { const j = await r.json(); return {u, s:200, shop:1, t:j.title, av:j.available, v:j.variants.filter(x=>x.available).length+'/'+j.variants.length}; }
        if (r.status === 404) return {u, s:404, shop:1};
      }
      const r = await fetch(p.pathname + p.search);
      const h = await r.text();
      const t = (h.match(/<title[^>]*>([^<]*)/i)||[])[1]||'';
      const ins = (h.match(/schema\.org\/InStock/g)||[]).length, oos = (h.match(/schema\.org\/(OutOfStock|SoldOut|Discontinued)/g)||[]).length;
      const gone = /no longer available|this item is unavailable|item is no longer|page not found|product not found/i.test(h);
      const fin = new URL(r.url);
      return {u, s:r.status, red: fin.pathname !== p.pathname ? fin.pathname.slice(0,80) : '', t:t.trim().slice(0,80), ins, oos, gone};
    } catch(e) { return {u, err:String(e).slice(0,80)}; }
  };
  const out=[]; for (let i=0;i<urls.length;i+=4) out.push(...await Promise.all(urls.slice(i,i+4).map(one)));
  const ok = r => r.shop ? (r.s===200 && r.av) : (r.s===200 && !r.red && !r.gone && (r.ins>0 || r.oos===0));
  return {host:location.host, total:out.length, ok:out.filter(ok).length, issues:out.filter(r=>!ok(r))};
};
