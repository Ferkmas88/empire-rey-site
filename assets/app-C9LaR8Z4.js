import{j as U,v as j,k as D,m as T,u as z,n as O,o as K,p as W,q as G,r as Y,s as J,t as Q,e as s,w as X,x as Z}from"./sanitize-nXRFN7Nc.js";const F=document.body.dataset.adminPage,ee=document.getElementById("adminContent"),x=document.getElementById("adminNotice"),R=document.querySelector(".admin-nav");document.querySelectorAll(".admin-nav a").forEach(e=>{e.dataset.page===F&&e.classList.add("is-active")});function y(e){x&&(x.textContent=e)}function N(e){return e?new Date(e).toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric"}):"-"}function te(e,t,u){const d=new Blob([t],{type:u}),p=URL.createObjectURL(d),a=document.createElement("a");a.href=p,a.download=e,a.click(),URL.revokeObjectURL(p)}function C(e){ee.innerHTML=e}function I(e){return`<div class="admin-empty">${s(e)}</div>`}function B(e){return`
    <section class="admin-metrics">
      ${e.map(t=>`
            <article class="admin-metric">
              <strong>${s(t.label)}</strong>
              <span>${s(t.value)}</span>
            </article>
          `).join("")}
    </section>
  `}function ae(e){const t=String(e||"").replace(/\D+/g,"");return t?t.length===10?`1${t}`:t:""}function V(e,t){const u=ae(e),d=[];return u&&d.push(`<a class="admin-btn" href="tel:+${u}">Llamar</a>`,`<a class="admin-btn" href="https://wa.me/${u}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`),t&&d.push(`<a class="admin-btn" href="mailto:${encodeURIComponent(t)}">Email</a>`),d.length?`<div class="admin-inline-actions">${d.join("")}</div>`:'<span class="admin-muted">Sin contacto</span>'}function M(e){return{available:"Disponible",hidden:"Oculto",sold:"Vendido",pending:"Pendiente",confirmed:"Confirmada",done:"Completada",cancelled:"Cancelada"}[e]||e||"-"}function ne(e){return e.length?e.map(t=>`
        <figure class="admin-upload-preview__item">
          <img src="${s(t)}" alt="Imagen del carro" />
        </figure>
      `).join(""):'<div class="admin-upload-preview__empty">No hay imagenes cargadas.</div>'}async function se(e){return new Promise((t,u)=>{const d=new FileReader;d.onload=()=>{const p=String(d.result||"");t(p.includes(",")?p.split(",")[1]:p)},d.onerror=()=>u(new Error(`No se pudo leer ${e.name}.`)),d.readAsDataURL(e)})}function q(){if(!R||document.getElementById("adminLogoutBtn"))return;const e=document.createElement("button");e.id="adminLogoutBtn",e.type="button",e.className="admin-btn admin-btn--block",e.textContent="Cerrar panel",e.addEventListener("click",()=>{D(),y("Sesion cerrada. Vuelve a entrar con tu clave de admin."),L()}),R.appendChild(e)}function L(e=""){y(""),C(`
    <section class="admin-auth-card">
      <header class="admin-page-header">
        <div>
          <h1>Admin protegido</h1>
          <p>Ingresa la clave local del panel para ver leads, citas, subscribers y carros.</p>
        </div>
      </header>
      <form id="adminLoginForm" class="admin-form admin-auth-form">
        <label for="adminPassword">Clave de admin</label>
        <input id="adminPassword" name="adminPassword" type="password" autocomplete="current-password" required />
        <button class="admin-link-btn" type="submit">Entrar</button>
        <p class="admin-muted">La clave local vive en <code>.env.local</code> como <code>ADMIN_PASSWORD</code>.</p>
        ${e?`<p class="form-status form-status--error">${s(e)}</p>`:""}
      </form>
    </section>
  `);const t=document.getElementById("adminLoginForm"),u=document.getElementById("adminPassword");u?.focus(),t?.addEventListener("submit",async d=>{d.preventDefault(),X(u?.value||"");try{await j(),y("Panel local protegido y listo. Los cambios quedan guardados en esta maquina."),q(),await H[F]?.()}catch(p){D(),L(p.message||"No se pudo validar la clave de admin.")}})}async function ie(){if(!U())return L(),!1;try{return await j(),q(),y("Panel local protegido y listo. Los cambios quedan guardados en esta maquina."),!0}catch(e){return D(),L(e.message||"No se pudo validar la clave de admin."),!1}}async function oe(){const e=await Q();C(`
    <header class="admin-page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Resumen rapido del CRM local de Empire Rey.</p>
      </div>
    </header>
    <section class="admin-stats">
      <article class="admin-stat"><strong>Leads</strong><span>${e.leads}</span></article>
      <article class="admin-stat"><strong>Citas pendientes</strong><span>${e.appointmentsPending}</span></article>
      <article class="admin-stat"><strong>Subscribers</strong><span>${e.subscribers}</span></article>
      <article class="admin-stat"><strong>Carros activos</strong><span>${e.carsActive}</span></article>
    </section>
  `)}async function re(){const e=await J(),t=e.filter(i=>i.car_interest).length,u=e.filter(i=>i.phone).length,d=e.filter(i=>i.email).length;C(`
    <header class="admin-page-header">
      <div>
        <h1>Leads</h1>
        <p>Personas interesadas que dejaron sus datos para ver o apartar un carro.</p>
      </div>
    </header>
    ${B([{label:"Total",value:String(e.length)},{label:"Con auto",value:String(t)},{label:"Con telefono",value:String(u)},{label:"Con email",value:String(d)}])}
    <section class="admin-card">
      <div class="admin-toolbar">
        <input id="leadSearch" type="search" placeholder="Buscar por nombre, email o auto" />
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Auto de interes</th>
              <th>Fuente</th>
              <th>Acciones</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody id="leadsTableBody"></tbody>
        </table>
      </div>
    </section>
  `);const p=document.getElementById("leadsTableBody"),a=document.getElementById("leadSearch"),h=i=>{p.innerHTML=i.length?i.map(c=>`
              <tr>
                <td>
                  <strong>${s(c.name||"Sin nombre")}</strong>
                  <div class="admin-row-meta">${s(c.phone||"Sin telefono")}</div>
                  <div class="admin-row-meta">${s(c.email||"Sin email")}</div>
                </td>
                <td>${s(c.car_interest||"-")}</td>
                <td>${s(c.source||"-")}</td>
                <td>${V(c.phone,c.email)}</td>
                <td><span class="admin-row-date">${s(N(c.created_at))}</span></td>
              </tr>
            `).join(""):`<tr><td colspan="5">${I("No hay leads todavia.")}</td></tr>`};h(e),a?.addEventListener("input",()=>{const i=a.value.trim().toLowerCase(),c=e.filter(m=>[m.name,m.email,m.car_interest,m.phone].some(o=>String(o||"").toLowerCase().includes(i)));h(c)})}async function le(){const e=await Y(),t=e.filter(m=>m.status==="pending").length,u=e.filter(m=>m.status==="confirmed").length,d=e.filter(m=>m.status==="done").length;C(`
    <header class="admin-page-header">
      <div>
        <h1>Citas</h1>
        <p>Solicitudes de visita creadas desde inventario, detalle y formularios del sitio.</p>
      </div>
    </header>
    ${B([{label:"Total",value:String(e.length)},{label:"Pendientes",value:String(t)},{label:"Confirmadas",value:String(u)},{label:"Completadas",value:String(d)}])}
    <section class="admin-card" style="margin-bottom:1.5rem;">
      <p style="font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--gold);margin-bottom:.75rem;font-weight:700;">Ubicacion del negocio</p>
      <p style="margin-bottom:.75rem;font-size:.875rem;color:var(--text-muted);">3510 Dixie Hwy, Louisville, KY 40216</p>
      <iframe
        title="Mapa Empire Rey"
        src="https://www.google.com/maps?q=3510%20Dixie%20Hwy,%20Louisville,%20KY%2040216&output=embed"
        width="100%"
        height="280"
        style="border:0;border-radius:8px;display:block;"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </section>
    <section class="admin-card">
      <div class="admin-toolbar">
        <input id="appointmentsSearch" type="search" placeholder="Buscar por nombre, telefono, email o carro" />
        <div class="admin-toolbar__actions">
          <select id="appointmentsStatusFilter">
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="done">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Cita</th>
              <th>Estado</th>
              <th>Acciones</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody id="appointmentsTableBody"></tbody>
        </table>
      </div>
    </section>
  `);const p=document.getElementById("appointmentsTableBody"),a=document.getElementById("appointmentsSearch"),h=document.getElementById("appointmentsStatusFilter"),i=m=>{p.innerHTML=m.length?m.map(o=>{const g=o.leads||{},b=o.cars?.title||g.car_interest||"-";return`
              <tr>
                <td>
                  <strong>${s(g.name||"Sin nombre")}</strong>
                  <div class="admin-row-meta">${s(g.phone||"Sin telefono")}</div>
                  <div class="admin-row-meta">${s(g.email||"Sin email")}</div>
                </td>
                <td>
                  <strong>${s(b)}</strong>
                  <div class="admin-row-meta">Fecha: ${s(o.preferred_date||"Sin definir")}</div>
                </td>
                <td>
                  <select class="admin-status-select" data-appointment-status="${o.id}">
                    ${["pending","confirmed","done","cancelled"].map(v=>`<option value="${v}" ${o.status===v?"selected":""}>${s(M(v))}</option>`).join("")}
                  </select>
                </td>
                <td>${V(g.phone,g.email)}</td>
                <td><span class="admin-row-date">${s(N(o.created_at))}</span></td>
              </tr>
            `}).join(""):`<tr><td colspan="5">${I("No hay citas todavia.")}</td></tr>`,document.querySelectorAll("[data-appointment-status]").forEach(o=>{o.addEventListener("change",async()=>{const g=o.dataset.currentValue||"pending";try{await Z(o.dataset.appointmentStatus,o.value),o.dataset.currentValue=o.value,y("Estado de cita actualizado.")}catch(b){o.value=g,y(b.message||"No se pudo actualizar la cita.")}}),o.dataset.currentValue=o.value})},c=()=>{const m=String(a?.value||"").trim().toLowerCase(),o=String(h?.value||"all"),g=e.filter(b=>{const v=b.leads||{},E=b.cars?.title||v.car_interest||"",S=o==="all"||b.status===o,_=!m||[v.name,v.phone,v.email,E].some(w=>String(w||"").toLowerCase().includes(m));return S&&_});i(g)};c(),a?.addEventListener("input",c),h?.addEventListener("change",c)}async function de(){const e=await W(),t=e.filter(i=>String(i.source||"").includes("home")).length,u=e.filter(i=>String(i.source||"").includes("autos")).length;C(`
    <header class="admin-page-header">
      <div>
        <h1>Subscribers</h1>
        <p>Personas que pidieron novedades, promociones o llegada de carros nuevos.</p>
      </div>
    </header>
    ${B([{label:"Total",value:String(e.length)},{label:"Desde home",value:String(t)},{label:"Desde autos",value:String(u)},{label:"Emails unicos",value:String(new Set(e.map(i=>i.email)).size)}])}
    <section class="admin-card">
      <div class="admin-toolbar">
        <input id="subscribersSearch" type="search" placeholder="Buscar por nombre, email o fuente" />
        <div class="admin-toolbar__actions">
          <button id="exportSubscribers" class="admin-link-btn" type="button">Exportar CSV</button>
        </div>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Fuente</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody id="subscribersTableBody"></tbody>
        </table>
      </div>
    </section>
  `);const d=document.getElementById("subscribersTableBody"),p=document.getElementById("subscribersSearch"),a=i=>{d.innerHTML=i.length?i.map(c=>`
              <tr>
                <td>${s(c.name||"-")}</td>
                <td>${s(c.email||"-")}</td>
                <td>${s(c.source||"-")}</td>
                <td><span class="admin-row-date">${s(N(c.created_at))}</span></td>
              </tr>
            `).join(""):`<tr><td colspan="4">${I("No hay subscribers todavia.")}</td></tr>`},h=()=>{const i=String(p?.value||"").trim().toLowerCase(),c=e.filter(m=>!i||[m.name,m.email,m.source].some(o=>String(o||"").toLowerCase().includes(i)));a(c)};h(),p?.addEventListener("input",h),document.getElementById("exportSubscribers")?.addEventListener("click",()=>{const i=G(e);te("subscribers.csv",i,"text/csv;charset=utf-8")})}function ce(e){const t=String(e||"").trim().replace(/\s+/g," ");if(!t)return{make:"",model:"",year:""};const u=t.match(/\b(19|20)\d{2}\b/),d=u?u[0]:"",a=t.replace(d,"").trim().split(" ").filter(Boolean);return{make:a[0]||"",model:a.slice(1).join(" "),year:d}}async function me(){let e=await T(),t=[];const u=e.filter(r=>r.status==="available").length,d=e.filter(r=>r.status==="sold").length,p=e.filter(r=>r.featured).length;C(`
    <header class="admin-page-header">
      <div>
        <h1>Carros</h1>
        <p>Agrega un carro en menos de 30 segundos con un formulario simple para el dealer.</p>
      </div>
    </header>
    ${B([{label:"Total",value:String(e.length)},{label:"Disponibles",value:String(u)},{label:"Vendidos",value:String(d)},{label:"Destacados",value:String(p)}])}
    <section class="admin-form-shell">
      <article class="admin-form-card">
        <h2>Nuevo carro</h2>
        <form id="carForm" class="admin-form">
          <input name="id" type="hidden" />
          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Informacion principal</h3>
              <p>Escribe el titulo y el sistema intenta completar marca, modelo y ano.</p>
            </div>
            <div class="admin-form-grid">
              <label class="admin-field admin-field--full">
                <span>Titulo</span>
                <input name="title" type="text" placeholder="Toyota Camry SE 2019" required />
              </label>
              <label class="admin-field">
                <span>Marca</span>
                <input name="make" type="text" placeholder="Toyota" />
              </label>
              <label class="admin-field">
                <span>Modelo</span>
                <input name="model" type="text" placeholder="Camry SE" />
              </label>
              <label class="admin-field">
                <span>Ano</span>
                <input name="year" type="number" placeholder="2019" />
              </label>
            </div>
          </section>

          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Precio</h3>
            </div>
            <div class="admin-form-grid">
              <label class="admin-field">
                <span>Precio</span>
                <input name="price" type="number" step="0.01" placeholder="13900" />
              </label>
              <label class="admin-field">
                <span>Pago semanal</span>
                <input name="weekly_payment" type="text" placeholder="$85/semana" />
              </label>
            </div>
          </section>

          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Detalles</h3>
            </div>
            <div class="admin-form-grid">
              <label class="admin-field">
                <span>Millaje</span>
                <input name="mileage" type="number" placeholder="62000" />
              </label>
              <label class="admin-field">
                <span>Transmision</span>
                <input name="transmission" type="text" placeholder="Automatica" />
              </label>
              <label class="admin-field admin-field--full">
                <span>VIN</span>
                <input name="vin" type="text" placeholder="1HGCM82633A123456" />
              </label>
            </div>
          </section>

          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Estado</h3>
            </div>
            <div class="admin-form-grid">
              <label class="admin-field">
                <span>Disponible</span>
                <select name="status">
                  <option value="available">Disponible</option>
                  <option value="sold">Vendido</option>
                </select>
              </label>
              <label class="admin-field admin-field--toggle">
                <span>Destacado</span>
                <span class="admin-toggle-row">
                  <input name="featured" type="checkbox" />
                  <strong>Mostrar como destacado</strong>
                </span>
              </label>
            </div>
          </section>

          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Fotos</h3>
            </div>
            <div class="admin-form-grid">
          <div class="admin-upload-field">
            <label for="carImages">Imagenes del carro</label>
            <input id="carImages" name="carImages" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple />
            <p class="admin-muted">Selecciona imagenes desde tu computadora. El sistema las guarda en el proyecto.</p>
            <div id="carImagesPreview" class="admin-upload-preview"></div>
          </div>
            </div>
          </section>
          <div class="admin-actions">
            <button class="admin-link-btn" type="submit">Guardar carro</button>
            <button id="resetCarForm" class="admin-btn" type="button">Limpiar</button>
          </div>
        </form>
      </article>
      <section class="admin-card">
        <div class="admin-toolbar admin-toolbar--stack">
          <input id="carsSearch" type="search" placeholder="Buscar por titulo, marca, modelo o VIN" />
          <div class="admin-toolbar__actions">
            <select id="carsStatusFilter">
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="hidden">Ocultos</option>
              <option value="sold">Vendidos</option>
            </select>
          </div>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Carro</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="carsTableBody"></tbody>
          </table>
        </div>
      </section>
    </section>
  `);const a=document.getElementById("carForm"),h=document.getElementById("carsTableBody"),i=document.getElementById("carsSearch"),c=document.getElementById("carsStatusFilter"),m=document.getElementById("carImages"),o=document.getElementById("carImagesPreview"),g=a?.elements?.title,b=a?.elements?.make,v=a?.elements?.model,E=a?.elements?.year,S=r=>{o&&(o.innerHTML=ne(r))};S(t),g?.addEventListener("blur",()=>{const r=ce(g.value);b&&!String(b.value||"").trim()&&(b.value=r.make),v&&!String(v.value||"").trim()&&(v.value=r.model),E&&!String(E.value||"").trim()&&(E.value=r.year)}),m?.addEventListener("change",()=>{const r=Array.from(m.files||[]);if(!r.length){S(t);return}const n=r.map(f=>URL.createObjectURL(f));S(n)});const _=r=>{h.innerHTML=r.length?r.map(n=>`
              <tr>
                <td><img src="${s(n.image||"/favicon.png")}" alt="${s(n.title)}" /></td>
                <td>
                  <strong>${s(n.title)}</strong>
                  <div class="admin-row-meta">${s([n.year,n.make,n.model].filter(Boolean).join(" "))||"-"}</div>
                  <div class="admin-row-meta">VIN: ${s(n.vin||"-")}</div>
                </td>
                <td>
                  <strong>${s(n.price||"-")}</strong>
                  <div class="admin-row-meta">${s(n.weekly_payment||n.payment||"Sin pago semanal")}</div>
                </td>
                <td><span class="admin-status-pill">${s(M(n.status||"-"))}</span></td>
                <td>
                  <div class="admin-actions">
                    <button class="admin-btn" type="button" data-edit-car="${n.id}">Editar</button>
                    <a class="admin-btn" href="/autos/detalle/?car=${encodeURIComponent(n.slug||"")}" target="_blank" rel="noopener noreferrer">Ver</a>
                    <button class="admin-btn" type="button" data-status-car="${n.id}" data-status-value="hidden">Ocultar</button>
                    <button class="admin-btn" type="button" data-status-car="${n.id}" data-status-value="available">Publicar</button>
                    <button class="admin-btn" type="button" data-status-car="${n.id}" data-status-value="sold">Vendido</button>
                  </div>
                </td>
              </tr>
            `).join(""):`<tr><td colspan="5">${I("No hay carros para este filtro.")}</td></tr>`},w=()=>{const r=String(i?.value||"").trim().toLowerCase(),n=String(c?.value||"all"),f=e.filter(l=>{const $=n==="all"||l.status===n,k=!r||[l.title,l.make,l.model,l.vin].some(P=>String(P||"").toLowerCase().includes(r));return $&&k});_(f)};w(),a?.addEventListener("submit",async r=>{r.preventDefault();const n=new FormData(a),f=String(n.get("title")||"").trim(),l=Array.from(m?.files||[]);let $=t;if(l.length){const P=await Promise.all(l.map(async A=>({name:A.name,type:A.type,data:await se(A)})));$=(await z(P)).files||[]}const k={id:n.get("id")?Number(n.get("id")):null,title:f,make:String(n.get("make")||""),model:String(n.get("model")||""),year:String(n.get("year")||""),price:String(n.get("price")||""),weekly_payment:String(n.get("weekly_payment")||""),mileage:String(n.get("mileage")||""),transmission:String(n.get("transmission")||""),vin:String(n.get("vin")||""),status:String(n.get("status")||"available"),featured:!!n.get("featured"),images:$};await O(k),a.reset(),a.elements.id.value="",t=[],S(t),e=await T(),w(),y("Carro guardado correctamente.")}),document.getElementById("resetCarForm")?.addEventListener("click",()=>{a.reset(),a.elements.id.value="",t=[],S(t)}),i?.addEventListener("input",w),c?.addEventListener("change",w),h.addEventListener("click",async r=>{const n=r.target.closest("[data-edit-car]"),f=r.target.closest("[data-status-car]");if(n){const l=e.find($=>String($.id)===String(n.dataset.editCar));if(!l)return;a.elements.id.value=l.id||"",a.elements.title.value=l.title||"",a.elements.make.value=l.make||"",a.elements.model.value=l.model||"",a.elements.year.value=l.year||"",a.elements.price.value=l.price?.replace(/[$,]/g,"")||"",a.elements.weekly_payment.value=l.weekly_payment||l.payment||"",a.elements.mileage.value=l.mileage?.replace(/[^0-9]/g,"")||"",a.elements.transmission.value=l.transmission||"",a.elements.vin.value=l.vin||"",a.elements.status.value=l.status==="sold"?"sold":"available",a.elements.featured.checked=!!l.featured,t=l.gallery||[],S(t),a.scrollIntoView({behavior:"smooth",block:"start"}),y(`Editando: ${l.title}`)}f&&(await K(Number(f.dataset.statusCar),f.dataset.statusValue),e=await T(),w(),y("Estado del carro actualizado."))})}const H={dashboard:oe,leads:re,appointments:le,subscribers:de,cars:me};await ie()&&await H[F]?.();
