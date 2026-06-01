# PRD — Ciomas Hills Bogor Marketing Website

## Original Problem Statement
"tolong lanjutkan dari project sebelum nya, apakah bisa terdeteksi?"
User confirms goals: aktifkan Admin Dashboard penuh, setup & jalankan project, siap deploy ke Vercel. Goal: admin panel + UI berfungsi, admin user bisa mengedit landing page / upload foto.

## Architecture
- **Stack**: React 18 + Vite 5 (single-file architecture in `src/App.jsx`)
- **Routing**: Hash-based (`#/admin` for admin panel, `/` untuk public)
- **Backend**: Supabase (opsional, fallback dummy data)
- **Lokasi**: `/app/frontend/` (di-serve oleh supervisor via `yarn start` -> `vite --host 0.0.0.0 --port 3000`)
- **Production**: `yarn build` → `dist/` → Vercel (config sudah ada di `vercel.json`)

## User Personas
- **Pengunjung publik**: cari info perumahan, simulasi KPR, kontak via WA
- **Admin marketing**: kelola tipe rumah, gallery, testimoni, FAQ, settings

## Core Requirements (Static)
- Public landing page lengkap (Hero, About, Gallery, Features, Tipe Rumah, Simulasi KPR, Lokasi, CTA, Testimoni, FAQ, Footer)
- Admin dashboard CRUD untuk semua konten
- Demo login mode (tanpa Supabase) untuk preview
- Responsive mobile-first
- WhatsApp & Instagram integration
- KPR calculator interaktif

## Implemented (Jun 1, 2026)
- ✅ Restrukturisasi project dari `/app/` root → `/app/frontend/` (sesuai supervisor)
- ✅ Aktivasi full Admin Dashboard (sebelumnya hanya stub) — pindahkan `/app/app.jsx` → `/app/frontend/src/App.jsx`
- ✅ Update `package.json` dengan `start` script + `vite.config.js` dengan `host:0.0.0.0`, `allowedHosts:true`, HMR WSS untuk preview env
- ✅ Install dependencies (yarn)
- ✅ Supervisor frontend running (Vite dev server)
- ✅ Production build verified (61.6 KB gzipped)
- ✅ Fix duplicate `key` attribute warning di AHome quick actions
- ✅ Public page & Admin login & Admin dashboard verified via screenshot

## Admin Panel Features (Confirmed Working)
- Login dengan demo credentials (admin@ciomashills.id / admin123) — works tanpa Supabase
- Dashboard Home dengan stats counter (Tipe Rumah, Gallery, Testimoni, FAQ)
- CRUD Tipe Rumah (nama, badge, LB/LT, harga, image URL, urutan, aktif/nonaktif)
- CRUD Gallery (label + image URL, aktif/nonaktif)
- CRUD Testimoni (nama, lokasi, rating, ulasan)
- CRUD FAQ (pertanyaan, jawaban, urutan)
- Settings (kontak, hero section)
- Sidebar dengan logout

## Deployment Ready
- `vercel.json` sudah ada (framework: vite, SPA rewrite ke index.html)
- Untuk deploy: push ke Git → import di Vercel → set ENV (optional Supabase) → done
- Atau via Vercel CLI: `cd /app/frontend && vercel`

## Mocked / Notes
- Image upload: saat ini hanya via URL (paste link). Untuk upload file real perlu Supabase Storage integration
- Database: fallback dummy data (in-memory). Untuk persistence perlu set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` di `/app/frontend/.env` dan jalankan SQL setup di Supabase (lihat README.md)

## Backlog / Next Tasks
- **P1**: Real file upload via Supabase Storage (untuk gallery & house images)
- **P1**: Setup database Supabase (tabel: house_types, gallery, testimonials, faqs, settings) — SQL ada di README
- **P2**: Lead capture form (nama, no HP, tipe yang diminati) yang masuk ke Supabase
- **P2**: Analytics / tracking (GA4 atau Plausible)
- **P2**: SEO improvements (sitemap.xml, robots.txt, structured data Schema.org Residence)
- **P3**: Multi-language (ID/EN toggle)
- **P3**: Dark/Light mode toggle untuk public page

## URLs
- Preview Public: `https://355e6b3a-8155-446e-9efd-ee37384e1bb4.preview.emergentagent.com/`
- Preview Admin: `https://355e6b3a-8155-446e-9efd-ee37384e1bb4.preview.emergentagent.com/#/admin`
