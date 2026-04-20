import{j as U,v as j,k as D,m as I,u as z,n as O,o as K,p as W,q as G,r as Y,s as J,t as Q,w as X,e as s,x as Z,y as ee}from"./sanitize-44yXa7MW.js";const F=document.body.dataset.adminPage,te=document.getElementById("adminContent"),x=document.getElementById("adminNotice"),R=document.querySelector(".admin-nav");document.querySelectorAll(".admin-nav a").forEach(e=>{e.dataset.page===F&&e.classList.add("is-active")});function y(e){x&&(x.textContent=e)}function N(e){return e?new Date(e).toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric"}):"-"}function ae(e,t,u){const d=new Blob([t],{type:u}),p=URL.createObjectURL(d),n=document.createElement("a");n.href=p,n.download=e,n.click(),URL.revokeObjectURL(p)}function E(e){te.innerHTML=e}function _(e){return`<div class="admin-empty">${s(e)}</div>`}function k(e){return`
    <section class="admin-metrics">
      ${e.map(t=>`
            <article class="admin-metric">
              <strong>${s(t.label)}</strong>
              <span>${s(t.value)}</span>
            </article>
          `).join("")}
    </section>
  `}function ne(e){const t=String(e||"").replace(/\D+/g,"");return t?t.length===10?`1${t}`:t:""}function V(e,t){const u=ne(e),d=[];return u&&d.push(`<a class="admin-btn" href="tel:+${u}">Llamar</a>`,`<a class="admin-btn" href="https://wa.me/${u}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`),t&&d.push(`<a class="admin-btn" href="mailto:${encodeURIComponent(t)}">Email</a>`),d.length?`<div class="admin-inline-actions">${d.join("")}</div>`:'<span class="admin-muted">Sin contacto</span>'}function M(e){return{available:"Disponible",hidden:"Oculto",sold:"Vendido",pending:"Pendiente",confirmed:"Confirmada",done:"Completada",cancelled:"Cancelada"}[e]||e||"-"}function se(e){return e.length?e.map(t=>`
        <figure class="admin-upload-preview__item">
          <img src="${s(t)}" alt="Imagen del carro" />
        </figure>
      `).join(""):'<div class="admin-upload-preview__empty">No hay imagenes cargadas.</div>'}async function ie(e){return new Promise((t,u)=>{const d=new FileReader;d.onload=()=>{const p=String(d.result||"");t(p.includes(",")?p.split(",")[1]:p)},d.onerror=()=>u(new Error(`No se pudo leer ${e.name}.`)),d.readAsDataURL(e)})}function q(){if(!R||document.getElementById("adminLogoutBtn"))return;const e=document.createElement("button");e.id="adminLogoutBtn",e.type="button",e.className="admin-btn admin-btn--block",e.textContent="Cerrar panel",e.addEventListener("click",()=>{D(),y("Sesion cerrada. Vuelve a entrar con tu clave de admin."),B()}),R.appendChild(e)}function B(e=""){y(""),E(`
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
  `);const t=document.getElementById("adminLoginForm"),u=document.getElementById("adminPassword");u?.focus(),t?.addEventListener("submit",async d=>{d.preventDefault(),Z(u?.value||"");try{await j(),y("Panel local protegido y listo. Los cambios quedan guardados en esta maquina."),q(),await H[F]?.()}catch(p){D(),B(p.message||"No se pudo validar la clave de admin.")}})}async function oe(){if(!U())return B(),!1;try{return await j(),q(),y("Panel local protegido y listo. Los cambios quedan guardados en esta maquina."),!0}catch(e){return D(),B(e.message||"No se pudo validar la clave de admin."),!1}}async function re(){const e=await X();E(`
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
  `)}async function le(){const e=await Q(),t=e.filter(i=>i.car_interest).length,u=e.filter(i=>i.phone).length,d=e.filter(i=>i.email).length;E(`
    <header class="admin-page-header">
      <div>
        <h1>Leads</h1>
        <p>Personas interesadas que dejaron sus datos para ver o apartar un carro.</p>
      </div>
    </header>
    ${k([{label:"Total",value:String(e.length)},{label:"Con auto",value:String(t)},{label:"Con telefono",value:String(u)},{label:"Con email",value:String(d)}])}
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
  `);const p=document.getElementById("leadsTableBody"),n=document.getElementById("leadSearch"),b=i=>{p.innerHTML=i.length?i.map(c=>`
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
            `).join(""):`<tr><td colspan="5">${_("No hay leads todavia.")}</td></tr>`};b(e),n?.addEventListener("input",()=>{const i=n.value.trim().toLowerCase(),c=e.filter(m=>[m.name,m.email,m.car_interest,m.phone].some(o=>String(o||"").toLowerCase().includes(i)));b(c)})}async function de(){const e=await J(),t=e.filter(m=>m.status==="pending").length,u=e.filter(m=>m.status==="confirmed").length,d=e.filter(m=>m.status==="done").length;E(`
    <header class="admin-page-header">
      <div>
        <h1>Citas</h1>
        <p>Solicitudes de visita creadas desde inventario, detalle y formularios del sitio.</p>
      </div>
    </header>
    ${k([{label:"Total",value:String(e.length)},{label:"Pendientes",value:String(t)},{label:"Confirmadas",value:String(u)},{label:"Completadas",value:String(d)}])}
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
  `);const p=document.getElementById("appointmentsTableBody"),n=document.getElementById("appointmentsSearch"),b=document.getElementById("appointmentsStatusFilter"),i=m=>{p.innerHTML=m.length?m.map(o=>{const g=o.leads||{},h=o.cars?.title||g.car_interest||"-";return`
              <tr>
                <td>
                  <strong>${s(g.name||"Sin nombre")}</strong>
                  <div class="admin-row-meta">${s(g.phone||"Sin telefono")}</div>
                  <div class="admin-row-meta">${s(g.email||"Sin email")}</div>
                </td>
                <td>
                  <strong>${s(h)}</strong>
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
            `}).join(""):`<tr><td colspan="5">${_("No hay citas todavia.")}</td></tr>`,document.querySelectorAll("[data-appointment-status]").forEach(o=>{o.addEventListener("change",async()=>{const g=o.dataset.currentValue||"pending";try{await ee(o.dataset.appointmentStatus,o.value),o.dataset.currentValue=o.value,y("Estado de cita actualizado.")}catch(h){o.value=g,y(h.message||"No se pudo actualizar la cita.")}}),o.dataset.currentValue=o.value})},c=()=>{const m=String(n?.value||"").trim().toLowerCase(),o=String(b?.value||"all"),g=e.filter(h=>{const v=h.leads||{},L=h.cars?.title||v.car_interest||"",C=o==="all"||h.status===o,P=!m||[v.name,v.phone,v.email,L].some($=>String($||"").toLowerCase().includes(m));return C&&P});i(g)};c(),n?.addEventListener("input",c),b?.addEventListener("change",c)}async function ce(){const e=await G(),t=e.filter(i=>String(i.source||"").includes("home")).length,u=e.filter(i=>String(i.source||"").includes("autos")).length;E(`
    <header class="admin-page-header">
      <div>
        <h1>Subscribers</h1>
        <p>Personas que pidieron novedades, promociones o llegada de carros nuevos.</p>
      </div>
    </header>
    ${k([{label:"Total",value:String(e.length)},{label:"Desde home",value:String(t)},{label:"Desde autos",value:String(u)},{label:"Emails unicos",value:String(new Set(e.map(i=>i.email)).size)}])}
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
  `);const d=document.getElementById("subscribersTableBody"),p=document.getElementById("subscribersSearch"),n=i=>{d.innerHTML=i.length?i.map(c=>`
              <tr>
                <td>${s(c.name||"-")}</td>
                <td>${s(c.email||"-")}</td>
                <td>${s(c.source||"-")}</td>
                <td><span class="admin-row-date">${s(N(c.created_at))}</span></td>
              </tr>
            `).join(""):`<tr><td colspan="4">${_("No hay subscribers todavia.")}</td></tr>`},b=()=>{const i=String(p?.value||"").trim().toLowerCase(),c=e.filter(m=>!i||[m.name,m.email,m.source].some(o=>String(o||"").toLowerCase().includes(i)));n(c)};b(),p?.addEventListener("input",b),document.getElementById("exportSubscribers")?.addEventListener("click",()=>{const i=Y(e);ae("subscribers.csv",i,"text/csv;charset=utf-8")})}function me(e){const t=String(e||"").trim().replace(/\s+/g," ");if(!t)return{make:"",model:"",year:""};const u=t.match(/\b(19|20)\d{2}\b/),d=u?u[0]:"",n=t.replace(d,"").trim().split(" ").filter(Boolean);return{make:n[0]||"",model:n.slice(1).join(" "),year:d}}async function ue(){let e=await I(),t=[];const u=e.filter(r=>r.status==="available").length,d=e.filter(r=>r.status==="sold").length,p=e.filter(r=>r.featured).length;E(`
    <header class="admin-page-header">
      <div>
        <h1>Carros</h1>
        <p>Agrega un carro en menos de 30 segundos con un formulario simple para el dealer.</p>
      </div>
    </header>
    ${k([{label:"Total",value:String(e.length)},{label:"Disponibles",value:String(u)},{label:"Vendidos",value:String(d)},{label:"Destacados",value:String(p)}])}
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
  `);const n=document.getElementById("carForm"),b=document.getElementById("carsTableBody"),i=document.getElementById("carsSearch"),c=document.getElementById("carsStatusFilter"),m=document.getElementById("carImages"),o=document.getElementById("carImagesPreview"),g=n?.elements?.title,h=n?.elements?.make,v=n?.elements?.model,L=n?.elements?.year,C=r=>{o&&(o.innerHTML=se(r))};C(t),g?.addEventListener("blur",()=>{const r=me(g.value);h&&!String(h.value||"").trim()&&(h.value=r.make),v&&!String(v.value||"").trim()&&(v.value=r.model),L&&!String(L.value||"").trim()&&(L.value=r.year)}),m?.addEventListener("change",()=>{const r=Array.from(m.files||[]);if(!r.length){C(t);return}const a=r.map(S=>URL.createObjectURL(S));C(a)});const P=r=>{b.innerHTML=r.length?r.map(a=>`
              <tr>
                <td><img src="${s(a.image||"/favicon.png")}" alt="${s(a.title)}" /></td>
                <td>
                  <strong>${s(a.title)}</strong>
                  <div class="admin-row-meta">${s([a.year,a.make,a.model].filter(Boolean).join(" "))||"-"}</div>
                  <div class="admin-row-meta">VIN: ${s(a.vin||"-")}</div>
                </td>
                <td>
                  <strong>${s(a.price||"-")}</strong>
                  <div class="admin-row-meta">${s(a.weekly_payment||a.payment||"Sin pago semanal")}</div>
                </td>
                <td><span class="admin-status-pill">${s(M(a.status||"-"))}</span></td>
                <td>
                  <div class="admin-actions">
                    <button class="admin-btn" type="button" data-edit-car="${a.id}">Editar</button>
                    <a class="admin-btn" href="/autos/detalle/?car=${encodeURIComponent(a.slug||"")}" target="_blank" rel="noopener noreferrer">Ver</a>
                    <button class="admin-btn" type="button" data-status-car="${a.id}" data-status-value="hidden">Ocultar</button>
                    <button class="admin-btn" type="button" data-status-car="${a.id}" data-status-value="available">Publicar</button>
                    <button class="admin-btn" type="button" data-status-car="${a.id}" data-status-value="sold">Vendido</button>
                    <button class="admin-btn admin-btn--danger" type="button" data-delete-car="${a.id}">Eliminar</button>
                  </div>
                </td>
              </tr>
            `).join(""):`<tr><td colspan="5">${_("No hay carros para este filtro.")}</td></tr>`},$=()=>{const r=String(i?.value||"").trim().toLowerCase(),a=String(c?.value||"all"),S=e.filter(f=>{const l=a==="all"||f.status===a,w=!r||[f.title,f.make,f.model,f.vin].some(A=>String(A||"").toLowerCase().includes(r));return l&&w});P(S)};$(),n?.addEventListener("submit",async r=>{r.preventDefault();const a=new FormData(n),S=String(a.get("title")||"").trim(),f=Array.from(m?.files||[]);let l=t;if(f.length){const A=await Promise.all(f.map(async T=>({name:T.name,type:T.type,data:await ie(T)})));l=(await z(A)).files||[]}const w={id:a.get("id")?Number(a.get("id")):null,title:S,make:String(a.get("make")||""),model:String(a.get("model")||""),year:String(a.get("year")||""),price:String(a.get("price")||""),weekly_payment:String(a.get("weekly_payment")||""),mileage:String(a.get("mileage")||""),transmission:String(a.get("transmission")||""),vin:String(a.get("vin")||""),status:String(a.get("status")||"available"),featured:!!a.get("featured"),images:l};await O(w),n.reset(),n.elements.id.value="",t=[],C(t),e=await I(),$(),y("Carro guardado correctamente.")}),document.getElementById("resetCarForm")?.addEventListener("click",()=>{n.reset(),n.elements.id.value="",t=[],C(t)}),i?.addEventListener("input",$),c?.addEventListener("change",$),b.addEventListener("click",async r=>{const a=r.target.closest("[data-edit-car]"),S=r.target.closest("[data-status-car]"),f=r.target.closest("[data-delete-car]");if(f){const l=e.find(w=>String(w.id)===String(f.dataset.deleteCar));if(!l||!confirm(`¿Eliminar "${l.title}"? Esta accion no se puede deshacer.`))return;try{await K(l.id),e=await I(),$(),y("Carro eliminado.")}catch(w){y(w.message||"No se pudo eliminar el carro.")}}if(a){const l=e.find(w=>String(w.id)===String(a.dataset.editCar));if(!l)return;n.elements.id.value=l.id||"",n.elements.title.value=l.title||"",n.elements.make.value=l.make||"",n.elements.model.value=l.model||"",n.elements.year.value=l.year||"",n.elements.price.value=l.price?.replace(/[$,]/g,"")||"",n.elements.weekly_payment.value=l.weekly_payment||l.payment||"",n.elements.mileage.value=l.mileage?.replace(/[^0-9]/g,"")||"",n.elements.transmission.value=l.transmission||"",n.elements.vin.value=l.vin||"",n.elements.status.value=l.status==="sold"?"sold":"available",n.elements.featured.checked=!!l.featured,t=l.gallery||[],C(t),n.scrollIntoView({behavior:"smooth",block:"start"}),y(`Editando: ${l.title}`)}S&&(await W(Number(S.dataset.statusCar),S.dataset.statusValue),e=await I(),$(),y("Estado del carro actualizado."))})}const H={dashboard:re,leads:le,appointments:de,subscribers:ce,cars:ue};await oe()&&await H[F]?.();
