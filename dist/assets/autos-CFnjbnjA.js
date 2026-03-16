import{l as $,e as o}from"./sanitize-DC8M2SXa.js";import{b as B,c as k,_ as C,a as F}from"./forms-C7JywTBC.js";/* empty css              */const T=Object.assign({"../Logo/2026-01-14.webp":F,"../Logo/2026-01-31.webp":C}),A=t=>Object.values(t).sort()[0],p=A(T);if(p){const t=document.getElementById("logoImage");t&&(t.src=p)}const i=document.getElementById("autosGrid"),f=document.getElementById("inventory-search"),I=document.getElementById("inventory-body-filter"),E=document.getElementById("inventory-sort"),g=document.getElementById("appointment-vehicle"),v=document.getElementById("appointment-car-id"),N=document.getElementById("appointment-name"),q=document.getElementById("cita"),H=document.querySelector("#updates form"),M=document.querySelector("#cita form");B(H,"autos");k(M,"autos");function V(t,e){return t.find(n=>String(n.slug)===String(e)||String(n.id)===String(e))}function s(t){return Number(String(t||"").replace(/[^0-9.-]/g,""))||0}function y(t){return Number(String(t||"").replace(/[^0-9.-]/g,""))||0}function j(t,e,n){switch(t){case"price-asc":return s(e.price)-s(n.price);case"price-desc":return s(n.price)-s(e.price);case"mileage-asc":return y(e.mileage)-y(n.mileage);default:return Number(n.year||0)-Number(e.year||0)}}function m(t){if(i){if(i.innerHTML="",!t.length){i.innerHTML=`
      <article class="inventory-card inventory-card--empty">
        <div class="inventory-card__body">
          <h3>No hay carros para este filtro</h3>
          <p>Ajusta la busqueda o vuelve pronto para ver unidades nuevas.</p>
        </div>
      </article>
    `;return}t.forEach(e=>{const n=document.createElement("article");n.className="inventory-card",n.innerHTML=`
      <div class="inventory-card__media">
        <img src="${o(e.image)}" alt="${o(e.title)}" loading="lazy" />
        <span class="inventory-card__badge">${o(e.badge)}</span>
      </div>
      <div class="inventory-card__body">
        <div class="inventory-card__header">
          <div>
            <p class="inventory-card__eyebrow">${o(e.stock)}</p>
            <h3>${o(e.title)}</h3>
          </div>
          <div class="inventory-card__pricing">
            <p class="inventory-card__price">${o(e.price)}</p>
            <p class="inventory-card__payment">Desde ${o(e.payment)}</p>
          </div>
        </div>
        <p class="inventory-card__summary">${o(e.summary)}</p>
        <div class="inventory-card__meta">
          <span>${o(e.year)}</span>
          <span>${o(e.mileage)}</span>
          <span>${o(e.body)}</span>
        </div>
        <div class="inventory-card__actions">
          <a class="btn-gold" href="/autos/detalle/?car=${encodeURIComponent(e.slug)}">Ver Detalles</a>
          <a class="inventory-card__ghost auto-card__book" href="#cita" data-vehicle="${o(e.slug)}">Agendar Cita</a>
        </div>
      </div>
    `,i.appendChild(n)}),document.querySelectorAll(".auto-card__book").forEach(e=>{e.addEventListener("click",n=>{n.preventDefault(),S(t,e.dataset.vehicle||"")})})}}function u(t){const e=String(f?.value||"").trim().toLowerCase(),n=String(I?.value||"all").toLowerCase(),r=String(E?.value||"newest");return[...t].filter(a=>{const d=!e||[a.title,a.make,a.model,a.year,a.body].some(w=>String(w||"").toLowerCase().includes(e)),L=n==="all"||String(a.body||"").toLowerCase()===n;return d&&L}).sort((a,d)=>j(r,a,d))}function S(t,e){const n=V(t,e),r=n?.title||e;g&&r&&(g.value=r),v&&(v.value=n?.id||""),q?.scrollIntoView({behavior:"smooth",block:"start"}),window.setTimeout(()=>{N?.focus()},220)}const l=(await $()).filter(t=>t.status!=="hidden"&&t.status!=="sold");m(u(l));[f,I,E].forEach(t=>{t?.addEventListener("input",()=>{m(u(l))}),t?.addEventListener("change",()=>{m(u(l))})});const _=new URLSearchParams(window.location.search),h=_.get("vehicle")||_.get("car");h&&S(l,h);const b=document.getElementById("menuToggle"),c=document.getElementById("navLinks");b&&c&&(b.addEventListener("click",()=>c.classList.toggle("open")),c.querySelectorAll("a").forEach(t=>t.addEventListener("click",()=>c.classList.remove("open"))));
