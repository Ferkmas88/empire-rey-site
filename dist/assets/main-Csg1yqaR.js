import{l as E,e as n,_ as S,a as j,b as I,c as L,d as w,f as A,g as P}from"./sanitize-44yXa7MW.js";import{b as $,_ as C,a as O}from"./forms-rW6sjMgN.js";const k="/assets/WhatsApp%20Video%202026-02-27%20at%209.35.07%20PM-DesnFLLZ.mp4",B=Object.assign({"./Logo/2026-01-14.webp":O,"./Logo/2026-01-31.webp":C}),F=Object.assign({"./Portada/588721866_839012729108269_4655180508387803109_n.jpg":j,"./Portada/WhatsApp Image 2026-02-27 at 9.34.29 PM.jpeg":S}),d=Object.assign({"./Portada/WhatsApp Video 2026-02-27 at 9.35.07 PM.mp4":k}),M=Object.assign({"./Casos de autos vendidos/595074674_846841291658746_1476586188343971499_n.jpg":P,"./Casos de autos vendidos/605127263_868224342853774_1597893891073389201_n.jpg":A,"./Casos de autos vendidos/610624059_871157672560441_546700141234205049_n.jpg":w,"./Casos de autos vendidos/612427142_874332448909630_889268608058161214_n.jpg":L,"./Casos de autos vendidos/618219692_881587674850774_581404140251442906_n.jpg":I}),V=new Set(["588721866_839012729108269_4655180508387803109_n.jpg"]),q=new Set(["595074674_846841291658746_1476586188343971499_n.jpg","605127263_868224342853774_1597893891073389201_n.jpg"]),b=e=>Object.values(e).sort()[0],T=(e,o)=>Object.entries(e).find(([t])=>t.split("/").pop()===o)?.[1],l=b(B),_=Object.entries(F).filter(([e])=>!V.has(e.split("/").pop())).map(([,e])=>e).sort()[0],g=T(d,"WhatsApp Video 2026-02-27 at 9.35.07 PM.mp4")||b(d),x=Object.entries(M).filter(([e])=>!q.has(e.split("/").pop())).map(([,e])=>e).sort(),m=document.getElementById("logoImage"),v=document.querySelector(".hero"),p=document.getElementById("heroSideVideo");l&&m&&(m.src=l);_&&v&&(v.style.backgroundImage=`url(${_})`);g&&p&&(p.src=g);const h=document.getElementById("soldGallery");h&&x.forEach((e,o)=>{const t=document.createElement("article");t.className="sold-card";const s=document.createElement("img");s.src=e,s.alt=`Auto vendido ${o+1}`,t.appendChild(s),h.appendChild(t)});const a=document.getElementById("homeArrivalsTrack");if(a){const e=document.querySelector("#home-updates form");$(e,"home"),(await E()).filter(t=>t.status!=="hidden"&&t.status!=="sold").slice(0,3).forEach(t=>{const s=document.createElement("article");s.className="inventory-card",s.innerHTML=`
      <div class="inventory-card__media">
        <img src="${n(t.image)}" alt="${n(t.title)}" loading="lazy" />
        <span class="inventory-card__badge">${n(t.badge)}</span>
      </div>
      <div class="inventory-card__body">
        <div class="inventory-card__header">
          <div>
            <p class="inventory-card__eyebrow">${n(t.stock)}</p>
            <h3>${n(t.title)}</h3>
          </div>
          <p class="inventory-card__price">${n(t.price)}</p>
        </div>
        <p class="inventory-card__summary">${n(t.summary)}</p>
        <div class="inventory-card__meta">
          <span>${n(t.year)}</span>
          <span>${n(t.mileage)}</span>
          <span>${n(t.transmission)}</span>
        </div>
        <div class="inventory-card__actions">
          <a class="btn-gold" href="/autos/">Tienda</a>
          <a class="inventory-card__ghost" href="/autos/detalle/?car=${encodeURIComponent(t.slug)}#cita">Agendar Cita</a>
        </div>
      </div>
    `,a.appendChild(s)})}const H=document.getElementById("homeArrivalsPrev"),N=document.getElementById("homeArrivalsNext"),f=e=>{a&&a.scrollBy({left:e*Math.min(a.clientWidth*.88,360),behavior:"smooth"})};H?.addEventListener("click",()=>f(-1));N?.addEventListener("click",()=>f(1));const W=document.querySelectorAll(".reveal"),z=new IntersectionObserver(e=>{e.forEach(o=>{o.isIntersecting&&o.target.classList.add("visible")})},{threshold:.18});W.forEach(e=>z.observe(e));const u=document.querySelectorAll("video[data-src]");if(u.length){const e=new IntersectionObserver(o=>{o.forEach(t=>{if(!t.isIntersecting)return;const s=t.target,c=s.dataset.src;c&&!s.src&&(s.src=c,s.load(),s.play().catch(()=>{})),e.unobserve(s)})},{rootMargin:"200px"});u.forEach(o=>e.observe(o))}const y=document.getElementById("menuToggle"),r=document.getElementById("navLinks");y&&r&&(y.addEventListener("click",()=>r.classList.toggle("open")),r.querySelectorAll("a").forEach(e=>e.addEventListener("click",()=>r.classList.remove("open"))));const i=document.querySelector(".rey-story");if(i){const e=()=>{const o=i.getBoundingClientRect(),t=window.innerHeight||1,s=Math.min(Math.max((t-o.top)/(t+o.height),0),1);i.style.setProperty("--story-scroll-progress",s.toFixed(3))};e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e)}
