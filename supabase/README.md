## Supabase CRM

Este proyecto ya queda preparado para migrar el CRM local a Supabase sin rehacer el frontend.

Archivo clave:

- `supabase/migrations/20260310_000001_crm_minimo.sql`

Tablas incluidas:

- `cars`
- `car_images`
- `leads`
- `appointments`
- `subscribers`

Variables esperadas en `.env.local`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Estado actual:

- El CRM sigue funcionando sobre `server/data/db.json`.
- El esquema SQL ya existe para crear la base real en Supabase.
- Cuando tengas el proyecto y las keys, la siguiente fase es cambiar el adaptador del backend de JSON local a Supabase.
