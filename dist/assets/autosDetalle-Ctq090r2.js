import{l as E,e as t}from"./sanitize-44yXa7MW.js";import{c as I,_ as $,a as L}from"./forms-rW6sjMgN.js";/* empty css              */const S=Object.assign({"../../Logo/2026-01-14.webp":L,"../../Logo/2026-01-31.webp":$}),T=a=>Object.values(a).sort()[0],u=T(S),v=document.getElementById("logoImage");u&&v&&(v.src=u);const d=(await E()).filter(a=>a.status!=="hidden"),A=new URLSearchParams(window.location.search),C=A.get("car")||"",B=d.find(a=>a.status!=="sold")||d[0]||null,e=d.find(a=>a.slug===C)||B,s=document.getElementById("detailBreadcrumb"),n=document.getElementById("carDetail"),r=document.querySelector("#cita form"),y=document.getElementById("cita"),f=document.getElementById("detail-vehicle"),h=document.getElementById("detail-car-id");if(!e)document.title="Inventario no disponible | EMPIRE REY AUTO SALES #2 LLC",s&&(s.textContent="Sin inventario"),n&&(n.innerHTML=`
      <article class="admin-empty">
        <h1>No hay carros disponibles</h1>
        <p>En este momento no hay unidades publicadas. Vuelve al inventario o escribenos por WhatsApp.</p>
        <p><a class="btn-gold" href="/autos/">Volver a Autos</a></p>
      </article>
    `),y&&(y.hidden=!0);else{const a=e.gallery?.length?e.gallery:[e.image||"/favicon.png"],l=e.status==="sold";document.title=`${e.title} | EMPIRE REY AUTO SALES #2 LLC`,s&&(s.textContent=e.title),f&&(f.value=e.title),h&&(h.value=e.id||""),n&&(n.innerHTML=`
      <div class="detail-gallery">
        <div class="detail-gallery__main">
          <img id="detailMainImage" src="${t(a[0])}" alt="${t(e.title)}" />
        </div>
        <div class="detail-gallery__thumbs" id="detailThumbs"></div>
      </div>
      <aside class="detail-copy">
        <div class="detail-copy__top">
          <div class="detail-copy__title">
            <p class="eyebrow">${t(l?"Vendido":e.badge)}</p>
            <h1>${t(e.title)}</h1>
            <p>${t(e.summary)}</p>
          </div>
          <p class="detail-copy__price">${t(e.price)}</p>
        </div>
        <div class="detail-copy__meta">
          <article><strong>Millaje</strong><span>${t(e.mileage)}</span></article>
          <article><strong>Pago estimado</strong><span>${t(e.payment)}</span></article>
          <article><strong>Transmision</strong><span>${t(e.transmission)}</span></article>
          <article><strong>Combustible</strong><span>${t(e.fuel)}</span></article>
          <article><strong>Color</strong><span>${t(e.color)}</span></article>
          <article><strong>Traccion</strong><span>${t(e.drivetrain)}</span></article>
        </div>
        <p class="detail-copy__description">${t(e.description)}</p>
        <div class="detail-copy__actions">
          ${l?'<a class="btn-gold" href="/autos/">Ver inventario</a>':'<a class="btn-gold" href="#cita">Agendar Cita</a>'}
          <a
            class="detail-copy__ghost"
            href="https://wa.me/15025768116?text=${encodeURIComponent(`Hola, me interesa ${e.title}. Quiero mas informacion.`)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </aside>
    `),l?r&&(r.innerHTML=`
      <p class="form-status">Esta unidad ya fue vendida. Si quieres algo parecido, te ayudamos a encontrarlo.</p>
      <div class="detail-copy__actions">
        <a class="btn-gold" href="/autos/">Ver inventario</a>
        <a
          class="detail-copy__ghost"
          href="https://wa.me/15025768116?text=${encodeURIComponent(`Hola, vi que ${e.title} ya se vendio. Quiero opciones parecidas.`)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>
    `):I(r,"detalle");const c=document.getElementById("detailThumbs"),p=document.getElementById("detailMainImage");c&&p&&a.forEach((m,g)=>{const i=document.createElement("button");i.type="button",i.className=`detail-thumb${g===0?" is-active":""}`,i.innerHTML=`<img src="${t(m)}" alt="${t(e.title)} vista ${g+1}" loading="lazy" />`,i.addEventListener("click",()=>{p.src=m,c.querySelectorAll(".detail-thumb").forEach(b=>b.classList.remove("is-active")),i.classList.add("is-active")}),c.appendChild(i)})}const _=document.getElementById("menuToggle"),o=document.getElementById("navLinks");_&&o&&(_.addEventListener("click",()=>o.classList.toggle("open")),o.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>o.classList.remove("open"))));
