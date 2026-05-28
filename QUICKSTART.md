# ⚡ QUICK START GUIDE

Panduan cepat untuk memulai Ciomas Hills Marketing Website.

## 5 Menit Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Buka browser: `http://localhost:3000`

### 3. Access Admin Panel
- URL: `http://localhost:3000/admin`
- Email: `admin@ciomashills.id`
- Password: `admin123`

### 4. Edit Content
Di admin panel:
- **House Types**: Kelola tipe unit & harga
- **Gallery**: Upload foto properti
- **Testimonials**: Tambah review pelanggan
- **FAQ**: Tambah pertanyaan umum
- **Settings**: Update info kontak

### 5. Deploy
```bash
npm run build
vercel
```

---

## File Structure Overview

```
src/
  └── App.jsx        ← Semua komponen dalam satu file
  └── main.jsx       ← React entry point

public/
  └── (static assets)

dist/                ← Generated saat build
index.html           ← HTML template
package.json         ← Dependencies
vite.config.js       ← Vite configuration
vercel.json          ← Vercel configuration
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

---

## Environment Setup

### Development (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

### Production (Vercel Dashboard)
Set same variables di Vercel Project Settings.

---

## Features at a Glance

### Public Pages
- ✅ Hero dengan animasi
- ✅ Gallery dengan slideshow
- ✅ Tipe unit dengan harga
- ✅ KPR calculator
- ✅ Lokasi & maps
- ✅ FAQ accordion
- ✅ Testimonials carousel
- ✅ Contact integration

### Admin Features
- ✅ CRUD House Types
- ✅ CRUD Gallery
- ✅ CRUD Testimonials  
- ✅ CRUD FAQ
- ✅ Update Settings
- ✅ Real-time sync

### Technical
- ✅ React 18
- ✅ Vite (super fast)
- ✅ Supabase ready
- ✅ Mobile responsive
- ✅ Production optimized

---

## Troubleshooting

### "Command not found: npm"
Install Node.js dari https://nodejs.org

### Port 3000 sudah terpakai
```bash
npm run dev -- --port 3001
```

### Build error
```bash
rm -rf node_modules
npm install
npm run build
```

### Supabase error
Check `.env.local` credentials dan network connection.

---

## Next: Full Documentation

Untuk detailed setup, baca:
- `README.md` - Complete documentation
- `DEPLOYMENT.md` - Deployment guide

---

## Support

- Email: marketing@ciomashills.id
- WhatsApp: +62 812-3456-7890

**Let's go! 🚀**
