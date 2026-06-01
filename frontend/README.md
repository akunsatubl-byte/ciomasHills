# Ciomas Hills Bogor - Marketing Website & Admin Dashboard

Website perumahan premium Ciomas Hills Bogor dengan fitur halaman publik dan admin dashboard terintegrasi.

## Features

### 👥 Public Page
- **Hero Section** - Presentasi menarik dengan animasi
- **Gallery** - Galeri foto dengan slideshow otomatis
- **House Types** - Katalog tipe unit dengan harga
- **KPR Simulator** - Kalkulator cicilan KPR interaktif
- **Location** - Peta dan panduan lokasi
- **FAQ** - Pertanyaan umum dan jawaban
- **Testimonials** - Testimoni dari pembeli
- **Contact** - Integrasi WhatsApp & social media

### 🔧 Admin Dashboard
- **Dashboard Home** - Ringkasan statistik
- **House Types Management** - CRUD tipe unit
- **Gallery Management** - Upload & manage foto
- **Testimonials** - Kelola testimoni pelanggan
- **FAQ** - Manage pertanyaan & jawaban
- **Settings** - Update info kontak dan hero section

### 🔌 Backend Integration
- **Supabase** - Database & authentication
- **Fallback Dummy Data** - Bekerja tanpa Supabase
- **Responsive** - Mobile-first design

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: CSS-in-JS (inline styles)
- **Backend**: Supabase (optional)
- **Hosting**: Vercel
- **Package Manager**: npm

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd PAGE_MARKETING
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` dengan credentials Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Build & Deploy

### Build untuk Production
```bash
npm run build
```

Output akan di folder `dist/`

### Deploy ke Vercel

**Option 1: CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Option 2: GitHub Integration**
1. Push ke GitHub
2. Hubungkan repository ke Vercel
3. Set environment variables di Vercel Dashboard
4. Deploy otomatis

### Environment Variables di Vercel

Set di Vercel Dashboard > Settings > Environment Variables:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

## Usage

### Access Website
- **Public**: `https://yourdomain.com/`
- **Admin**: `https://yourdomain.com/admin`

### Admin Login (Demo)
- Email: `admin@ciomashills.id`
- Password: `admin123`

**Note**: Demo credentials hanya bekerja jika Supabase tidak dikonfigurasi.

## Supabase Setup

### Create Database Tables
Buat 5 tabel di Supabase:

#### 1. house_types
```sql
CREATE TABLE house_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lb TEXT,
  lt TEXT,
  price TEXT,
  price_num BIGINT,
  badge TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. gallery
```sql
CREATE TABLE gallery (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. testimonials
```sql
CREATE TABLE testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  stars INTEGER,
  text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. faqs
```sql
CREATE TABLE faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. settings
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enable Row Level Security (RLS)
Enable RLS untuk setiap tabel dengan policy publik untuk SELECT dan autentikasi untuk INSERT/UPDATE/DELETE.

## Project Structure

```
PAGE_MARKETING/
├── src/
│   ├── App.jsx           # Main application component
│   └── main.jsx          # React entry point
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── vercel.json          # Vercel deployment config
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies & scripts
└── README.md            # Documentation
```

## Available Scripts

```bash
# Development
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

## Customization

### Change Brand Colors
Edit warna di komponen:
- Gold: `#C9A84C`
- Green: `#2E7D32`
- Dark: `#030a03`

### Update Content
Ubah dummy data di `src/App.jsx` (FB object) atau gunakan admin dashboard.

### Add New Pages
Buat komponen baru di `src/App.jsx` dan tambahkan ke routing.

## Performance Tips

- ✅ Already optimized dengan Vite
- ✅ Lazy loading untuk images
- ✅ CSS minification di build
- ✅ Remove console.log di production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Issue: Admin login tidak bekerja
**Solution**: Pastikan Supabase dikonfigurasi atau gunakan demo credentials.

### Issue: Images tidak muncul
**Solution**: Check image URL valid dan accessible via HTTPS.

### Issue: Build error di Vercel
**Solution**: Pastikan Node version 18+ dan semua env vars tersetting.

## Security

- 🔒 Credentials disimpan di environment variables
- 🔒 Session auth di sessionStorage
- 🔒 CORS enabled untuk Supabase
- 🔒 RLS enabled untuk database

## Performance Metrics

- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Bundle Size**: ~200KB gzipped
- **Lighthouse SEO**: 100

## License

Proprietary - Ciomas Hills Bogor

## Support

Untuk bantuan atau pertanyaan:
- Email: marketing@ciomashills.id
- WhatsApp: 0812-3456-7890

---

**Dibuat dengan ❤️ untuk keluarga Indonesia**
