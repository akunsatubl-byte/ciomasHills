# Test Credentials — Ciomas Hills Bogor

## Admin Panel (Demo Mode — tanpa Supabase)
- **URL**: `/#/admin` (hash-based routing)
- **Email**: `admin@ciomashills.id`
- **Password**: `admin123`

Catatan: Login demo ini hanya berfungsi saat `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di `/app/frontend/.env` masih kosong. Begitu Supabase di-set, login akan otomatis ke Supabase Auth.

## Supabase (Production — belum diisi)
Untuk mengaktifkan persistence, isi `/app/frontend/.env`:
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```
Lalu buat admin user di Supabase Dashboard → Authentication → Users.
