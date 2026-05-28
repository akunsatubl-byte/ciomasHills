import { useState, useEffect, useCallback } from "react";

/* ════════════════════════════════════════════════════════════════
   ① SUPABASE CLIENT
   Ganti VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env.local
   Di sini pakai fallback dummy agar preview tetap jalan
════════════════════════════════════════════════════════════════ */
const SUPABASE_URL  = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || "";
const SUPABASE_KEY  = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) || "";
const HAS_SUPABASE  = Boolean(SUPABASE_URL && SUPABASE_KEY);

/* ── lightweight supabase fetch helper ── */
async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...opts.headers,
    },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const db = {
  select: (table, query = "")        => sbFetch(`/${table}?${query}&order=sort_order.asc`),
  insert: (table, body)              => sbFetch(`/${table}`, { method: "POST", body: JSON.stringify(body) }),
  update: (table, id, body)          => sbFetch(`/${table}?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (table, id)                => sbFetch(`/${table}?id=eq.${id}`, { method: "DELETE" }),
  settings: ()                       => sbFetch("/settings?select=key,value"),
  updateSetting: (key, value)        => sbFetch(`/settings?key=eq.${key}`, { method: "PATCH", body: JSON.stringify({ value, updated_at: new Date().toISOString() }) }),
};

/* ── supabase auth ── */
async function sbSignIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "Login gagal");
  return data;
}

async function sbSignOut(token) {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
}

/* ════════════════════════════════════════════════════════════════
   ② FALLBACK DUMMY DATA  (dipakai jika Supabase belum tersambung)
════════════════════════════════════════════════════════════════ */
const FB = {
  settings: {
    site_name:      "Ciomas Hills Bogor",
    tagline:        "Hunian Premium di Jantung Alam Bogor",
    wa_number:      "6281234567890",
    instagram:      "ciomashills",
    address:        "Jl. Ciomas Raya No. 88, Bogor, Jawa Barat 16610",
    email:          "marketing@ciomashills.id",
    hero_title:     "Rumah Impian di Ciomas Hills",
    hero_subtitle:  "Hunian premium bernuansa hijau di perbukitan Ciomas dengan pemandangan memukau, udara sejuk, dan fasilitas lengkap untuk keluarga modern.",
    hero_image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=80",
  },
  houses: [
    { id:"h1", name:"Tipe 36/72",  lb:"36 m²", lt:"72 m²",  price:"Rp 350 Juta", price_num:350000000, badge:"Terlaris",   image_url:"https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80", is_active:true, sort_order:1 },
    { id:"h2", name:"Tipe 45/90",  lb:"45 m²", lt:"90 m²",  price:"Rp 490 Juta", price_num:490000000, badge:"Best Value", image_url:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", is_active:true, sort_order:2 },
    { id:"h3", name:"Tipe 60/120", lb:"60 m²", lt:"120 m²", price:"Rp 680 Juta", price_num:680000000, badge:"Premium",    image_url:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", is_active:true, sort_order:3 },
  ],
  gallery: [
    { id:"g1", label:"Eksterior Mewah", image_url:"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80", is_active:true, sort_order:1 },
    { id:"g2", label:"Desain Modern",   image_url:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", is_active:true, sort_order:2 },
    { id:"g3", label:"Ruang Tamu",      image_url:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", is_active:true, sort_order:3 },
    { id:"g4", label:"Kamar Utama",     image_url:"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80", is_active:true, sort_order:4 },
    { id:"g5", label:"Taman & Pool",    image_url:"https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80", is_active:true, sort_order:5 },
    { id:"g6", label:"Interior Elegan", image_url:"https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&q=80", is_active:true, sort_order:6 },
  ],
  testimonials: [
    { id:"t1", name:"Budi Santoso",  location:"Jakarta Selatan", stars:5, text:"Prosesnya mudah sekali, KPR dibantu sampai ACC. Unit bagus dan lingkungan nyaman untuk keluarga.", is_active:true },
    { id:"t2", name:"Sari Dewi",     location:"Depok",           stars:5, text:"Booking cukup 1 juta, langsung dapat unit pilihan terbaik. Tim marketing sangat responsif!", is_active:true },
    { id:"t3", name:"Ahmad Fauzi",   location:"Bogor",           stars:5, text:"Lokasi strategis, view bukit hijau, udara segar. Harga kompetitif dibanding perumahan sekitarnya.", is_active:true },
    { id:"t4", name:"Ratna Wijaya",  location:"Bekasi",          stars:5, text:"Pembangunan tepat waktu, kualitas material premium, dan after-sales service yang memuaskan!", is_active:true },
  ],
  faqs: [
    { id:"f1", question:"Berapa biaya booking?",               answer:"Booking fee hanya Rp 1.000.000 dan sudah termasuk dalam harga pembelian unit.", sort_order:1, is_active:true },
    { id:"f2", question:"Apakah tersedia fasilitas KPR?",      answer:"Ya, kami bekerja sama dengan 10+ bank terkemuka. Tim kami siap membantu pengajuan KPR Anda.", sort_order:2, is_active:true },
    { id:"f3", question:"Kapan estimasi serah terima kunci?",  answer:"Estimasi serah terima 12 bulan setelah akad kredit, sesuai progress pembangunan.", sort_order:3, is_active:true },
    { id:"f4", question:"Bisa kunjungi lokasi dulu?",          answer:"Tentu! Hubungi marketing via WhatsApp untuk jadwal kunjungan gratis ke lokasi.", sort_order:4, is_active:true },
    { id:"f5", question:"Fasilitas apa saja di perumahan?",    answer:"Taman bermain, jogging track, keamanan 24 jam, CCTV, dan area komersial.", sort_order:5, is_active:true },
    { id:"f6", question:"Bagaimana cara cicil uang muka?",     answer:"DP bisa dicicil hingga 12 bulan sebelum akad, memudahkan perencanaan keuangan Anda.", sort_order:6, is_active:true },
  ],
};

/* ════════════════════════════════════════════════════════════════
   ③ DATA HOOKS
════════════════════════════════════════════════════════════════ */
function useData(fetchFn, fallback) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  
  const load = useCallback(async () => {
    if (!HAS_SUPABASE) { setData(fallback); setLoading(false); return; }
    try { setData(await fetchFn()); }
    catch { setData(fallback); }
    finally { setLoading(false); }
  }, [fetchFn, fallback]);

  useEffect(() => { 
    load();
  }, [load]);

  return { data: data ?? fallback, loading, refetch: load };
}

function useSettings() {
  const { data: rows, loading, refetch } = useData(db.settings, []);
  const settings = rows.length
    ? Object.fromEntries(rows.map(r => [r.key, r.value]))
    : FB.settings;
  return { settings, loading, refetch };
}

/* ════════════════════════════════════════════════════════════════
   ④ UTILS
════════════════════════════════════════════════════════════════ */
const fmtRp    = n    => "Rp " + Number(n).toLocaleString("id-ID");
const waLink   = (wa, msg) => `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
const initials = name => (name || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const uid      = ()   => Math.random().toString(36).slice(2);

/* ════════════════════════════════════════════════════════════════
   ⑤ GLOBAL STYLES
════════════════════════════════════════════════════════════════ */
const GStyle = () => (
  <style>{`
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;overflow-x:hidden}
    input,select,textarea,button{font-family:inherit}
    a{text-decoration:none}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-track{background:#040d04}
    ::-webkit-scrollbar-thumb{background:#1a4a1a;border-radius:3px}
    input:focus,select:focus,textarea:focus{outline:none;border-color:#C9A84C!important}

    @keyframes spin     {from{transform:rotate(0)}  to{transform:rotate(360deg)}}
    @keyframes fadeUp   {from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer  {0%{background-position:0%} 100%{background-position:200%}}
    @keyframes blink    {0%,100%{opacity:1} 50%{opacity:.3}}
    @keyframes loadBar  {from{width:0} to{width:100%}}
    @keyframes waPulse  {0%,100%{box-shadow:0 4px 24px rgba(37,211,102,.5),0 0 0 0 rgba(37,211,102,.4)} 60%{box-shadow:0 4px 24px rgba(37,211,102,.5),0 0 0 14px rgba(37,211,102,0)}}

    .nav-d{display:flex!important}.nav-m{display:none!important}
    @media(max-width:820px){.nav-d{display:none!important}.nav-m{display:block!important}}
    @media(max-width:768px){
      .g2,.g3,.g4{grid-template-columns:1fr!important}
      .g2-1{grid-template-columns:1fr!important}
      .thumb-g{grid-template-columns:repeat(3,1fr)!important}
      .admin-sb .sb-lbl{display:none!important}
      .admin-sb{width:64px!important;padding:16px 8px!important}
      .admin-main{padding:20px 16px!important}
      .stat-g{grid-template-columns:repeat(2,1fr)!important}
    }
  `}</style>
);

/* ════════════════════════════════════════════════════════════════
   ⑥ SHARED UI ATOMS
════════════════════════════════════════════════════════════════ */
function SLabel({ children, color = "#2E7D32" }) {
  return <div style={{ fontWeight:700, fontSize:12, letterSpacing:2, color, textTransform:"uppercase", marginBottom:8 }}>{children}</div>;
}
function Divider({ center, gold }) {
  return (
    <div style={{ display:"flex", justifyContent:center?"center":"flex-start", marginBottom:24 }}>
      <div style={{ width:56, height:4, borderRadius:2, background: gold ? "linear-gradient(90deg,#C9A84C,#e8c96a)" : "linear-gradient(90deg,#2E7D32,#66bb6a)" }} />
    </div>
  );
}
function Btn({ href, onClick, children, bg, color="#fff", border, shadow, full, sm, style:ex={} }) {
  const [hov, setHov] = useState(false);
  const s = {
    background:bg, color, display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer",
    padding: sm ? "8px 16px" : "13px 26px",
    borderRadius:32, fontWeight:800, fontSize: sm ? 13 : 15,
    border: border ? `1.5px solid ${border}` : "none",
    boxShadow: hov && shadow ? `0 8px 32px ${shadow}` : "none",
    transform: hov ? "scale(1.04)" : "scale(1)",
    transition:"all .22s", width: full ? "100%" : "auto",
    justifyContent: full ? "center" : "flex-start",
    ...ex,
  };
  return href
    ? <a href={href} target="_blank" rel="noreferrer" style={s} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{children}</a>
    : <button onClick={onClick} style={s} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{children}</button>;
}

/* ════════════════════════════════════════════════════════════════
   ⑦ LOADER
════════════════════════════════════════════════════════════════ */
function Loader() {
  return (
    <div style={{ position:"fixed", inset:0, background:"linear-gradient(135deg,#030a03,#0a1a0a)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:9999, gap:24 }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#e8c96a)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#111", fontSize:26, animation:"spin 2s linear infinite" }}>CH</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ color:"#C9A84C", fontWeight:800, fontSize:20, letterSpacing:2 }}>CIOMAS HILLS</div>
        <div style={{ color:"#3a6a3a", fontSize:13, marginTop:4 }}>BOGOR · HUNIAN PREMIUM</div>
      </div>
      <div style={{ width:220, height:3, background:"rgba(255,255,255,.08)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", background:"linear-gradient(90deg,#C9A84C,#e8c96a)", animation:"loadBar 1.6s ease forwards" }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑧ PUBLIC — NAVBAR
════════════════════════════════════════════════════════════════ */
function Navbar({ wa }) {
  const [open, setOpen] = useState(false);
  const [sc,   setSc]   = useState(false);
  useEffect(() => {
    const fn = () => setSc(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const go = id => { document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); setOpen(false); };
  const links = [["tentang","Tentang"],["galeri","Galeri"],["tipe-rumah","Tipe Rumah"],["simulasi","Simulasi"],["lokasi","Lokasi"],["faq","FAQ"]];
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:1000, transition:"background .35s",
      background: sc ? "rgba(5,18,5,.97)" : "linear-gradient(to bottom,rgba(0,0,0,.52),transparent)",
      backdropFilter: sc ? "blur(18px)" : "none", boxShadow: sc ? "0 1px 0 rgba(255,255,255,.05)" : "none" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 28px", height:70, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#e8c96a)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#111", fontSize:15 }}>CH</div>
          <div>
            <div style={{ fontWeight:800, color:"#fff", fontSize:16, lineHeight:1.1 }}>Ciomas Hills</div>
            <div style={{ color:"#C9A84C", fontSize:10, letterSpacing:1.5, fontWeight:600 }}>BOGOR</div>
          </div>
        </div>
        <div className="nav-d" style={{ display:"flex", gap:28, alignItems:"center" }}>
          {links.map(([id,lb]) => (
            <button key={id} onClick={() => go(id)}
              style={{ background:"none", border:"none", color:"#ddd", fontSize:14, fontWeight:500, cursor:"pointer", transition:"color .2s" }}
              onMouseEnter={e=>e.currentTarget.style.color="#C9A84C"} onMouseLeave={e=>e.currentTarget.style.color="#ddd"}>{lb}</button>
          ))}
          <a href={waLink(wa,"Halo, saya ingin info Ciomas Hills Bogor")} target="_blank" rel="noreferrer"
            style={{ background:"linear-gradient(135deg,#C9A84C,#e8c96a)", color:"#111", padding:"9px 22px", borderRadius:24, fontWeight:700, fontSize:13 }}>
            Hubungi Kami
          </a>
        </div>
        <button className="nav-m" onClick={() => setOpen(!open)} style={{ background:"none", border:"none", color:"#fff", fontSize:24, cursor:"pointer" }}>{open?"✕":"☰"}</button>
      </div>
      {open && (
        <div style={{ background:"rgba(5,18,5,.98)", padding:"8px 28px 28px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
          {links.map(([id,lb]) => (
            <button key={id} onClick={() => go(id)}
              style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", color:"#ddd", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,.06)", fontSize:15, cursor:"pointer" }}>{lb}</button>
          ))}
          <a href={waLink(wa,"Halo Ciomas Hills")} target="_blank" rel="noreferrer"
            style={{ display:"block", textAlign:"center", marginTop:16, background:"linear-gradient(135deg,#C9A84C,#e8c96a)", color:"#111", padding:"13px", borderRadius:24, fontWeight:800 }}>
            Hubungi Kami
          </a>
        </div>
      )}
    </nav>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑨ PUBLIC — HERO
════════════════════════════════════════════════════════════════ */
function Hero({ s }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 200); return () => clearTimeout(t); }, []);
  const fa = (d) => ({ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(30px)", transition:`all .7s ease ${d}s` });
  return (
    <section id="hero" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
      <img src={s.hero_image_url} alt="hero" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(120deg,rgba(3,12,3,.88),rgba(5,20,5,.72) 55%,rgba(0,0,0,.5))" }} />
      <div style={{ position:"absolute", inset:0, backgroundImage:"gradient(rgba(201,168,76,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.04) 1px,transparent 1px)", backgroundSize:"80px 80px" }} />
      <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"120px 28px 80px", width:"100%" }}>
        <div style={{ maxWidth:700 }}>
          <div style={{ ...fa(0), display:"inline-flex", alignItems:"center", gap:8, background:"rgba(201,168,76,.15)", border:"1px solid rgba(201,168,76,.35)", borderRadius:24, padding:"6px 16px", marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#C9A84C", display:"inline-block", animation:"blink 1.4s infinite" }} />
            <span style={{ color:"#C9A84C", fontWeight:700, fontSize:12, letterSpacing:1.5 }}>PERUMAHAN PREMIUM · CIOMAS BOGOR</span>
          </div>
          <h1 style={{ ...fa(0.1), fontSize:"clamp(36px,5.5vw,68px)", fontWeight:900, color:"#fff", lineHeight:1.1, marginBottom:20, letterSpacing:-.5 }}>
            {(s.hero_title || "").replace("Ciomas Hills","")}{" "}
            <span style={{ background:"linear-gradient(135deg,#C9A84C,#f5d98a,#C9A84C)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundSize:"200%", animation:"shimmer 3s linear infinite" }}>
              Ciomas Hills
            </span>
          </h1>
          <p style={{ ...fa(0.2), color:"rgba(255,255,255,.75)", fontSize:"clamp(15px,2vw,18px)", lineHeight:1.75, marginBottom:32, maxWidth:560 }}>{s.hero_subtitle}</p>
          <div style={{ ...fa(0.25), display:"inline-flex", alignItems:"center", gap:14, background:"rgba(201,168,76,.18)", border:"1.5px solid rgba(201,168,76,.45)", borderRadius:16, padding:"14px 22px", marginBottom:36 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#C9A84C,#e8c96a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🔑</div>
            <div>
              <div style={{ color:"#C9A84C", fontWeight:900, fontSize:"clamp(16px,2.5vw,22px)", lineHeight:1 }}>Booking Mulai 1 Juta!</div>
              <div style={{ color:"rgba(255,255,255,.5)", fontSize:13, marginTop:3 }}>Amankan unit terbaik pilihan Anda sekarang</div>
            </div>
          </div>
          <div style={{ ...fa(0.35), display:"flex", gap:14, flexWrap:"wrap" }}>
            <Btn href={waLink(s.wa_number,"Halo, saya ingin BOOKING unit di Ciomas Hills Bogor")} bg="linear-gradient(135deg,#C9A84C,#e8c96a)" color="#111" shadow="rgba(201,168,76,.5)">🔖 Booking Sekarang</Btn>
            <Btn onClick={() => document.getElementById("galeri")?.scrollIntoView({ behavior:"smooth" })} bg="rgba(255,255,255,.12)" border="rgba(255,255,255,.3)">🖼️ Lihat Galeri</Btn>
            <Btn href={waLink(s.wa_number,"Halo Marketing Ciomas Hills")} bg="#25D366" shadow="rgba(37,211,102,.4)">💬 WhatsApp</Btn>
          </div>
          <div style={{ ...fa(0.5), display:"flex", gap:40, marginTop:52, paddingTop:36, borderTop:"1px solid rgba(255,255,255,.1)", flexWrap:"wrap" }}>
            {[["200+","Unit Tersedia"],["98%","Kepuasan"],["10+","Bank Partner"],["12","Thn Pengalaman"]].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontWeight:900, fontSize:"clamp(20px,3vw,30px)", color:"#C9A84C", lineHeight:1 }}>{v}</div>
                <div style={{ color:"rgba(255,255,255,.4)", fontSize:12, marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:6, opacity:.4 }}>
        <div style={{ width:1, height:48, background:"linear-gradient(to bottom,transparent,#C9A84C)" }} />
        <div style={{ color:"#C9A84C", fontSize:10, letterSpacing:2 }}>SCROLL</div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑩ PUBLIC — ABOUT
════════════════════════════════════════════════════════════════ */
function About() {
  return (
    <section id="tentang" style={{ background:"#f0f7f0", padding:"100px 28px" }}>
      <div style={{ maxWidth:1140, margin:"0 auto" }}>
        <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <div style={{ borderRadius:24, overflow:"hidden", aspectRatio:"4/3", boxShadow:"0 24px 64px rgba(0,0,0,.18)" }}>
              <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80" alt="About" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
            <div style={{ position:"absolute", bottom:-20, right:-20, background:"linear-gradient(135deg,#C9A84C,#e8c96a)", borderRadius:20, padding:"20px 24px", boxShadow:"0 12px 40px rgba(201,168,76,.4)", textAlign:"center" }}>
              <div style={{ fontWeight:900, fontSize:32, color:"#111", lineHeight:1 }}>200+</div>
              <div style={{ fontSize:12, color:"#3a2010", fontWeight:600, marginTop:4 }}>Unit Tersedia</div>
            </div>
          </div>
          <div>
            <SLabel>Tentang Kami</SLabel>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:900, color:"#111", lineHeight:1.2, marginBottom:16 }}>Hunian Premium di<br />Perbukitan Ciomas Bogor</h2>
            <Divider />
            <p style={{ color:"#555", fontSize:16, lineHeight:1.85, marginBottom:24 }}>Ciomas Hills adalah kawasan perumahan premium yang dirancang untuk keluarga modern. Berlokasi di perbukitan Ciomas yang sejuk, hanya 10 menit dari pusat Kota Bogor dengan segala fasilitas lengkap.</p>
            {[["🌿","Lingkungan Asri","Dikelilingi pepohonan hijau dan udara segar khas Bogor"],["🏗️","Material Premium","Konstruksi berstandar SNI dengan material berkualitas terbaik"],["🔐","Keamanan 24 Jam","CCTV & security profesional menjaga ketenangan Anda"]].map(([ic,t,d]) => (
              <div key={t} style={{ display:"flex", gap:14, marginBottom:16 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"#e8f5e9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{ic}</div>
                <div><div style={{ fontWeight:700, color:"#111", fontSize:15 }}>{t}</div><div style={{ color:"#777", fontSize:14, marginTop:2 }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑪ PUBLIC — GALLERY
════════════════════════════════════════════════════════════════ */
function Gallery({ items }) {
  const [idx, setIdx] = useState(0);
  const list = items.filter(i => i.is_active);
  useEffect(() => {
    if (!list.length) return;
    const t = setInterval(() => setIdx(a => (a+1) % list.length), 4000);
    return () => clearInterval(t);
  }, [list.length]);
  if (!list.length) return null;
  return (
    <section id="galeri" style={{ background:"#0a180a", padding:"100px 28px" }}>
      <div style={{ maxWidth:1140, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <SLabel color="#C9A84C">Galeri Foto</SLabel>
          <h2 style={{ fontSize:"clamp(26px,3.5vw,42px)", fontWeight:900, color:"#fff", marginBottom:8 }}>Lihat Keindahan Kawasan</h2>
          <Divider center gold />
        </div>
        <div style={{ borderRadius:24, overflow:"hidden", aspectRatio:"16/7", position:"relative", marginBottom:16, boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>
          {list.map((g,i) => (
            <div key={g.id} style={{ position:"absolute", inset:0, transition:"opacity .7s", opacity:i===idx?1:0, pointerEvents:i===idx?"auto":"none" }}>
              <img src={g.image_url} alt={g.label} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.55),transparent 60%)" }} />
              <div style={{ position:"absolute", bottom:28, left:32, color:"#fff", fontWeight:700, fontSize:18 }}>{g.label}</div>
            </div>
          ))}
          {[["←",() => setIdx(a=>(a-1+list.length)%list.length),"left:16px"],["→",() => setIdx(a=>(a+1)%list.length),"right:16px"]].map(([lb,fn,pos]) => (
            <button key={lb} onClick={fn} style={{ position:"absolute", [pos.split(":")[0]]:16, top:"50%", transform:"translateY(-50%)", width:44, height:44, borderRadius:"50%", background:"rgba(0,0,0,.5)", border:"1px solid rgba(255,255,255,.2)", color:"#fff", fontSize:18, cursor:"pointer" }}>{lb}</button>
          ))}
        </div>
        <div className="thumb-g" style={{ display:"grid", gridTemplateColumns:`repeat(${list.length},1fr)`, gap:10 }}>
          {list.map((g,i) => (
            <div key={g.id} onClick={() => setIdx(i)} style={{ borderRadius:12, overflow:"hidden", aspectRatio:"4/3", cursor:"pointer", border:i===idx?"2.5px solid #C9A84C":"2.5px solid transparent", transition:"border-color .3s" }}>
              <img src={g.image_url} alt={g.label} style={{ width:"100%", height:"100%", objectFit:"cover", filter:i===idx?"none":"brightness(.55)", transition:"filter .3s" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑫ PUBLIC — FEATURES
════════════════════════════════════════════════════════════════ */
const FEATS = [
  { icon:"🏙️", t:"10 Menit ke Kota Bogor", d:"Dekat pusat kota, mal, rumah sakit, dan sekolah unggulan." },
  { icon:"🛣️", t:"Akses Tol Langsung",      d:"Keluar Tol Jagorawi, tiba di perumahan tanpa macet." },
  { icon:"💰", t:"Cicilan Mulai 2,5 Juta",  d:"KPR dengan 10+ bank partner, tenor fleksibel hingga 30 tahun." },
  { icon:"🔑", t:"Booking Hanya 1 Juta",    d:"Amankan unit pilihan Anda dengan deposit sangat terjangkau." },
  { icon:"🌿", t:"Lingkungan Hijau & Asri", d:"Didesain dengan ruang terbuka hijau, udara segar khas Bogor." },
  { icon:"📈", t:"Investasi Menjanjikan",    d:"Nilai properti terus naik, potensi capital gain tinggi." },
];
function FCard({ icon, t, d }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background:h?"#f0f7f0":"#f8fbf8", borderRadius:20, padding:"28px 24px", border:h?"1px solid #a5d6a7":"1px solid #e8f5e9", transform:h?"translateY(-8px)":"translateY(0)", transition:"all .3s" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:h?"linear-gradient(135deg,#2E7D32,#43a047)":"linear-gradient(135deg,#e8f5e9,#c8e6c8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:16, transition:"all .3s" }}>{icon}</div>
      <div style={{ fontWeight:800, fontSize:17, color:"#111", marginBottom:8 }}>{t}</div>
      <div style={{ color:"#666", fontSize:14, lineHeight:1.7 }}>{d}</div>
    </div>
  );
}
function Features() {
  return (
    <section id="keunggulan" style={{ background:"#fff", padding:"100px 28px" }}>
      <div style={{ maxWidth:1140, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <SLabel>Keunggulan</SLabel>
          <h2 style={{ fontSize:"clamp(26px,3.5vw,42px)", fontWeight:900, color:"#111", marginBottom:8 }}>Mengapa Pilih Ciomas Hills?</h2>
          <Divider center />
        </div>
        <div className="g3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
          {FEATS.map(f => <FCard key={f.t} {...f} />)}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑬ PUBLIC — HOUSE TYPES
════════════════════════════════════════════════════════════════ */
function HCard({ h, wa }) {
  const [hov, setHov] = useState(false);
  const bc = { Terlaris:"#C9A84C", "Best Value":"#2E7D32", Premium:"#1565C0" };
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:"rgba(255,255,255,.04)", borderRadius:24, overflow:"hidden", border:hov?"1px solid rgba(201,168,76,.5)":"1px solid rgba(255,255,255,.08)", transform:hov?"translateY(-14px)":"translateY(0)", boxShadow:hov?"0 32px 80px rgba(0,0,0,.5)":"0 4px 20px rgba(0,0,0,.2)", transition:"all .35s" }}>
      <div style={{ position:"relative", aspectRatio:"4/3", overflow:"hidden" }}>
        <img src={h.image_url} alt={h.name} style={{ width:"100%", height:"100%", objectFit:"cover", transform:hov?"scale(1.07)":"scale(1)", transition:"transform .5s" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.65),transparent 60%)" }} />
        {h.badge && <div style={{ position:"absolute", top:14, right:14, background:bc[h.badge]||"#C9A84C", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>{h.badge}</div>}
        <div style={{ position:"absolute", bottom:16, left:16, color:"#fff", fontWeight:900, fontSize:20 }}>{h.name}</div>
      </div>
      <div style={{ padding:"22px 22px 24px" }}>
        {[["📐","Luas Bangunan",h.lb],["🌍","Luas Tanah",h.lt],["💎","Harga Mulai",h.price]].map(([ic,l,v]) => (
          <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <div style={{ color:"#7aaa7a", fontSize:14, display:"flex", gap:8 }}><span>{ic}</span>{l}</div>
            <div style={{ fontWeight:700, color:"#fff", fontSize:14 }}>{v}</div>
          </div>
        ))}
        <a href={waLink(wa, `Halo, saya tertarik ${h.name} di Ciomas Hills Bogor. Mohon info lebih lanjut.`)} target="_blank" rel="noreferrer"
          style={{ display:"block", marginTop:20, background:"linear-gradient(135deg,#C9A84C,#e8c96a)", color:"#111", textAlign:"center", padding:"12px", borderRadius:14, fontWeight:800, fontSize:15 }}>
          🔖 Booking Tipe Ini
        </a>
      </div>
    </div>
  );
}
function HouseTypes({ houses, wa }) {
  const list = houses.filter(h => h.is_active);
  if (!list.length) return null;
  return (
    <section id="tipe-rumah" style={{ background:"linear-gradient(160deg,#050f05,#0f2a0f)", padding:"100px 28px" }}>
      <div style={{ maxWidth:1140, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <SLabel color="#C9A84C">Pilihan Unit</SLabel>
          <h2 style={{ fontSize:"clamp(26px,3.5vw,42px)", fontWeight:900, color:"#fff", marginBottom:8 }}>Tipe Rumah Tersedia</h2>
          <Divider center gold />
        </div>
        <div className="g3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28 }}>
          {list.map(h => <HCard key={h.id} h={h} wa={wa} />)}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑭ PUBLIC — SIMULATION
════════════════════════════════════════════════════════════════ */
function Simulation({ houses }) {
  const opts = houses.filter(h => h.is_active && h.price_num > 0);
  const [pidx, setPidx] = useState(0);
  const [dp,   setDp]   = useState(0);
  const [tnr,  setTnr]  = useState(15);

  useEffect(() => {
    if (opts.length) setDp(Math.round(opts[0].price_num * .2));
  }, [opts.length]);

  const house   = opts[pidx] || opts[0] || { price_num:350000000, name:"Tipe 36/72" };
  const price   = Number(house.price_num);
  const loan    = price - dp;
  const rate    = 0.09;
  const monthly = loan > 0 ? Math.round(loan * (rate/12) / (1 - Math.pow(1+rate/12, -tnr*12))) : 0;

  return (
    <section id="simulasi" style={{ background:"#f0f7f0", padding:"100px 28px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <SLabel>Kalkulator</SLabel>
          <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:900, color:"#111", marginBottom:8 }}>Simulasi Cicilan KPR</h2>
          <Divider center />
          <p style={{ color:"#999", fontSize:14, marginTop:8 }}>*Ilustrasi estimasi. Hubungi marketing untuk perhitungan resmi.</p>
        </div>
        <div style={{ background:"#fff", borderRadius:28, padding:"44px 40px", boxShadow:"0 12px 48px rgba(0,0,0,.08)" }}>
          <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
              <div>
                <label style={{ fontWeight:700, color:"#111", fontSize:14, display:"block", marginBottom:8 }}>Harga Rumah</label>
                <select value={pidx} onChange={e => { const i=Number(e.target.value); setPidx(i); setDp(Math.round(opts[i].price_num*.2)); }}
                  style={{ width:"100%", padding:"12px 16px", borderRadius:14, border:"1.5px solid #d0e8d0", fontSize:15, fontWeight:600, outline:"none", background:"#f8faf8", cursor:"pointer" }}>
                  {opts.map((h,i) => <option key={h.id} value={i}>{h.name} — {fmtRp(h.price_num)}</option>)}
                </select>
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <label style={{ fontWeight:700, color:"#111", fontSize:14 }}>Uang Muka (DP)</label>
                  <span style={{ fontWeight:700, color:"#2E7D32", fontSize:14 }}>{fmtRp(dp)} ({price ? Math.round(dp/price*100) : 0}%)</span>
                </div>
                <input type="range" min={Math.round(price*.1) || 0} max={Math.round(price*.5) || 100000} step={5000000} value={dp}
                  onChange={e => setDp(Number(e.target.value))}
                  style={{ width:"100%", accentColor:"#2E7D32", height:6, cursor:"pointer" }} />
                <div style={{ display:"flex", justifyContent:"space-between", color:"#bbb", fontSize:11, marginTop:4 }}><span>10%</span><span>50%</span></div>
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <label style={{ fontWeight:700, color:"#111", fontSize:14 }}>Tenor</label>
                  <span style={{ fontWeight:700, color:"#C9A84C", fontSize:14 }}>{tnr} Tahun</span>
                </div>
                <input type="range" min={5} max={30} step={5} value={tnr}
                  onChange={e => setTnr(Number(e.target.value))}
                  style={{ width:"100%", accentColor:"#C9A84C", height:6, cursor:"pointer" }} />
                <div style={{ display:"flex", justifyContent:"space-between", color:"#bbb", fontSize:11, marginTop:4 }}><span>5 thn</span><span>30 thn</span></div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ background:"linear-gradient(135deg,#0a1a0a,#1a3a1a)", borderRadius:20, padding:"32px 28px", textAlign:"center" }}>
                <div style={{ color:"rgba(255,255,255,.5)", fontSize:13, marginBottom:8 }}>ESTIMASI CICILAN / BULAN</div>
                <div style={{ fontWeight:900, fontSize:"clamp(24px,4vw,36px)", color:"#C9A84C", lineHeight:1 }}>{fmtRp(monthly)}</div>
                <div style={{ color:"rgba(255,255,255,.35)", fontSize:12, marginTop:8 }}>Bunga KPR ~9% per tahun</div>
              </div>
              {[["Harga",fmtRp(price)],["DP",fmtRp(dp)],["Dana Pinjaman",fmtRp(loan)],["Tenor",`${tnr} Tahun`]].map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#f8faf8", borderRadius:12, padding:"11px 16px" }}>
                  <span style={{ color:"#888", fontSize:13 }}>{l}</span>
                  <span style={{ fontWeight:700, color:"#111", fontSize:14 }}>{v}</span>
                </div>
              ))}
              <a href={waLink(FB.settings.wa_number, `Halo, saya ingin konsultasi KPR untuk unit Ciomas Hills`)} target="_blank" rel="noreferrer"
                style={{ display:"block", background:"linear-gradient(135deg,#2E7D32,#43a047)", color:"#fff", padding:"13px", borderRadius:14, fontWeight:800, textAlign:"center", fontSize:15 }}>
                💬 Konsultasi KPR Gratis
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑮ PUBLIC — LOCATION
════════════════════════════════════════════════════════════════ */
function Location({ s }) {
  return (
    <section id="lokasi" style={{ background:"#fff", padding:"100px 28px" }}>
      <div style={{ maxWidth:1140, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <SLabel>Lokasi</SLabel>
          <h2 style={{ fontSize:"clamp(26px,3.5vw,42px)", fontWeight:900, color:"#111", marginBottom:8 }}>Strategis & Mudah Dijangkau</h2>
          <Divider center />
        </div>
        <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:36, alignItems:"start" }}>
          <div style={{ borderRadius:24, overflow:"hidden", aspectRatio:"1/1", background:"linear-gradient(135deg,#e8f5e9,#c8e6c8)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, boxShadow:"0 12px 40px rgba(0,0,0,.1)" }}>
            <div style={{ fontSize:72 }}>🗺️</div>
            <div style={{ fontWeight:700, color:"#2E7D32", fontSize:18 }}>Ciomas, Bogor</div>
            <div style={{ color:"#4a7a4a", fontSize:14, textAlign:"center", padding:"0 24px" }}>{s.address}</div>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer"
              style={{ marginTop:8, background:"#2E7D32", color:"#fff", padding:"10px 28px", borderRadius:24, fontWeight:700, fontSize:14 }}>
              📍 Buka Google Maps
            </a>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[["🚗","Dari Jakarta via Tol","Jakarta → Tol Jagorawi → Exit Bogor Barat → Ciomas Hills ≈ 45 menit"],
              ["🚌","Transportasi Umum","Stasiun Bogor → Angkot Ciomas → Ciomas Hills ≈ 20 menit"],
              ["📍","Landmark Terdekat","500m dari Swalayan Ciomas | 1km dari RS Ciawi"],
              ["🛵","Ojek Online","Pickup point tersedia di pintu masuk utama perumahan"]
            ].map(([ic,t,d]) => (
              <div key={t} style={{ display:"flex", gap:14, background:"#f8faf8", borderRadius:16, padding:"18px 20px", border:"1px solid #e8f5e9" }}>
                <div style={{ fontSize:28, flexShrink:0 }}>{ic}</div>
                <div><div style={{ fontWeight:700, color:"#111", fontSize:15, marginBottom:4 }}>{t}</div><div style={{ color:"#666", fontSize:14, lineHeight:1.6 }}>{d}</div></div>
              </div>
            ))}
            <a href={waLink(s.wa_number,"Halo, saya ingin jadwal kunjungan ke Ciomas Hills Bogor")} target="_blank" rel="noreferrer"
              style={{ display:"block", background:"linear-gradient(135deg,#2E7D32,#43a047)", color:"#fff", padding:"14px", borderRadius:14, fontWeight:800, textAlign:"center", fontSize:15, boxShadow:"0 8px 24px rgba(46,125,50,.3)" }}>
              🚗 Jadwalkan Kunjungan Gratis
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑯ PUBLIC — CTA BANNER
════════════════════════════════════════════════════════════════ */
function CTABanner({ wa }) {
  return (
    <section style={{ position:"relative", padding:"80px 28px", overflow:"hidden", background:"linear-gradient(135deg,#C9A84C,#a07830)" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 70% 50%,rgba(255,255,255,.12),transparent 50%)" }} />
      <div style={{ position:"relative", maxWidth:700, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:14 }}>🔑</div>
        <h2 style={{ fontWeight:900, fontSize:"clamp(24px,4vw,40px)", color:"#111", marginBottom:12, lineHeight:1.2 }}>Booking Rumah Impian Anda<br />Cukup 1 Juta Rupiah!</h2>
        <p style={{ color:"rgba(40,20,0,.65)", fontSize:16, marginBottom:32, lineHeight:1.75 }}>Unit terbatas! Jangan lewatkan kesempatan memiliki hunian premium di lokasi strategis.</p>
        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          <Btn href={waLink(wa,"Halo, saya ingin BOOKING Ciomas Hills sekarang!")} bg="#111" color="#C9A84C" shadow="rgba(0,0,0,.4)">🚀 Booking Sekarang</Btn>
          <Btn href={waLink(wa,"Halo, saya ingin jadwal kunjungan ke Ciomas Hills")} bg="rgba(255,255,255,.3)" color="#111" border="rgba(255,255,255,.6)">📅 Jadwal Kunjungan</Btn>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑰ PUBLIC — TESTIMONIALS
════════════════════════════════════════════════════════════════ */
function Testimonials({ items }) {
  const [cur, setCur] = useState(0);
  const list = items.filter(i => i.is_active);
  if (!list.length) return null;
  const t = list[cur % list.length];
  return (
    <section id="testimoni" style={{ background:"#0a180a", padding:"100px 28px" }}>
      <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
        <SLabel color="#C9A84C">Testimoni</SLabel>
        <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:900, color:"#fff", marginBottom:8 }}>Apa Kata Mereka?</h2>
        <Divider center gold />
        <div style={{ marginTop:48, background:"rgba(255,255,255,.04)", borderRadius:28, padding:"48px 44px", border:"1px solid rgba(201,168,76,.15)", minHeight:260 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#e8c96a)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#111", fontSize:22, margin:"0 auto 24px" }}>
            {initials(t.name)}
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:20, fontSize:20 }}>{"⭐".repeat(t.stars)}</div>
          <p style={{ color:"rgba(255,255,255,.8)", fontSize:"clamp(15px,2vw,18px)", lineHeight:1.8, fontStyle:"italic", marginBottom:28 }}>"{t.text}"</p>
          <div style={{ fontWeight:800, color:"#fff", fontSize:16 }}>{t.name}</div>
          <div style={{ color:"#5a8a5a", fontSize:14, marginTop:4 }}>📍 {t.location}</div>
        </div>
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:20, marginTop:32 }}>
          <button onClick={() => setCur(c=>(c-1+list.length)%list.length)} style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.15)", color:"#fff", fontSize:18, cursor:"pointer" }}>←</button>
          {list.map((_,i) => <div key={i} onClick={() => setCur(i)} style={{ width:i===cur%list.length?32:8, height:8, borderRadius:4, background:i===cur%list.length?"#C9A84C":"#1a4a1a", cursor:"pointer", transition:"all .3s" }} />)}
          <button onClick={() => setCur(c=>(c+1)%list.length)} style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.15)", color:"#fff", fontSize:18, cursor:"pointer" }}>→</button>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑱ PUBLIC — FAQ
════════════════════════════════════════════════════════════════ */
function FAQ({ items }) {
  const [open, setOpen] = useState(null);
  const list = items.filter(i => i.is_active);
  if (!list.length) return null;
  return (
    <section id="faq" style={{ background:"#f8faf8", padding:"100px 28px" }}>
      <div style={{ maxWidth:780, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <SLabel>FAQ</SLabel>
          <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:900, color:"#111", marginBottom:8 }}>Pertanyaan Umum</h2>
          <Divider center />
        </div>
        {list.map((f,i) => (
          <div key={f.id} style={{ marginBottom:12, background:"#fff", borderRadius:18, overflow:"hidden", border:"1px solid #e8f5e9", boxShadow:open===i?"0 8px 32px rgba(46,125,50,.1)":"none", transition:"box-shadow .3s" }}>
            <button onClick={() => setOpen(open===i?null:i)}
              style={{ width:"100%", background:"none", border:"none", padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", textAlign:"left" }}>
              <span style={{ fontWeight:700, color:"#111", fontSize:15, paddingRight:16, lineHeight:1.4 }}>{f.question}</span>
              <div style={{ width:28, height:28, borderRadius:"50%", background:open===i?"#2E7D32":"#e8f5e9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .3s" }}>
                <span style={{ color:open===i?"#fff":"#2E7D32", fontWeight:700, fontSize:18, lineHeight:1, display:"block", transform:open===i?"rotate(45deg)":"rotate(0)", transition:"transform .3s" }}>+</span>
              </div>
            </button>
            {open===i && <div style={{ padding:"0 24px 20px", paddingTop:16, color:"#555", fontSize:15, lineHeight:1.75, borderTop:"1px solid #e8f5e9" }}>{f.answer}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑲ PUBLIC — FOOTER
════════════════════════════════════════════════════════════════ */
function Footer({ s }) {
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
  return (
    <footer style={{ background:"#030a03", padding:"72px 28px 28px" }}>
      <div style={{ maxWidth:1140, margin:"0 auto" }}>
        <div className="g3" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:48, marginBottom:56 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
              <div style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#e8c96a)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#111", fontSize:18 }}>CH</div>
              <div>
                <div style={{ fontWeight:900, color:"#fff", fontSize:18 }}>{s.site_name}</div>
                <div style={{ color:"#C9A84C", fontSize:11, letterSpacing:1.5 }}>HUNIAN PREMIUM</div>
              </div>
            </div>
            <p style={{ color:"#3a6a3a", fontSize:14, lineHeight:1.85, maxWidth:300 }}>{s.tagline}. Wujudkan rumah impian keluarga Anda dengan proses mudah dan terpercaya.</p>
            <div style={{ display:"flex", gap:10, marginTop:22 }}>
              {[[`https://wa.me/${s.wa_number}`,"💬 WhatsApp"],[`https://instagram.com/${s.instagram}`,"📷 Instagram"]].map(([h,l]) => (
                <a key={l} href={h} target="_blank" rel="noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", color:"#c8e6c8", padding:"8px 16px", borderRadius:24, fontSize:13, fontWeight:600 }}>
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight:700, color:"#C9A84C", fontSize:14, marginBottom:18 }}>NAVIGASI</div>
            {[["tentang","Tentang"],["galeri","Galeri"],["tipe-rumah","Tipe Rumah"],["simulasi","Simulasi KPR"],["lokasi","Lokasi"],["faq","FAQ"]].map(([id,l]) => (
              <div key={id} style={{ marginBottom:12 }}>
                <button onClick={() => go(id)} style={{ background:"none", border:"none", color:"#3a6a3a", fontSize:14, cursor:"pointer", padding:0 }}
                  onMouseEnter={e=>e.currentTarget.style.color="#C9A84C"} onMouseLeave={e=>e.currentTarget.style.color="#3a6a3a"}>{l}</button>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:700, color:"#C9A84C", fontSize:14, marginBottom:18 }}>KONTAK</div>
            {[["📍",s.address],["📞","0812-3456-7890"],["✉️",s.email],["🕐","Senin–Sabtu: 08.00–17.00"]].map(([ic,tx]) => (
              <div key={tx} style={{ display:"flex", gap:8, marginBottom:14, color:"#3a6a3a", fontSize:13, lineHeight:1.6 }}>
                <span style={{ flexShrink:0 }}>{ic}</span>{tx}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop:"1px solid #0f2a0f", paddingTop:24, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <span style={{ color:"#1a4a1a", fontSize:13 }}>© 2025 {s.site_name}. All rights reserved.</span>
          <span style={{ color:"#1a4a1a", fontSize:13 }}>Dibuat dengan ❤️ untuk keluarga Indonesia</span>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════════════
   ⑳ FLOATING BUTTONS
════════════════════════════════════════════════════════════════ */
function FloatingWA({ wa }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 1800); return () => clearTimeout(t); }, []);
  if (!vis) return null;
  return (
    <a href={waLink(wa,"Halo, saya ingin informasi tentang Ciomas Hills Bogor 🏡")} target="_blank" rel="noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position:"fixed", bottom:32, right:32, zIndex:9999, background:"#25D366", color:"#fff", width:60, height:60, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, transform:hov?"scale(1.12)":"scale(1)", transition:"transform .2s", animation:"waPulse 2.5s ease infinite" }}>
      💬
    </a>
  );
}
function ScrollTopBtn() {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const h = () => setVis(window.scrollY > 500);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  if (!vis) return null;
  return (
    <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
      style={{ position:"fixed", bottom:104, right:32, zIndex:9998, width:44, height:44, borderRadius:"50%", background:"rgba(5,18,5,.85)", border:"1px solid rgba(201,168,76,.4)", color:"#C9A84C", fontSize:18, cursor:"pointer", backdropFilter:"blur(8px)" }}>
      ↑
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉑ PUBLIC PAGE
════════════════════════════════════════════════════════════════ */
function PublicPage() {
  const [loading, setLoading] = useState(true);
  const { settings }                          = useSettings();
  const { data: houses }                      = useData(() => db.select("house_types","is_active=eq.true"), FB.houses);
  const { data: gallery }                     = useData(() => db.select("gallery","is_active=eq.true"), FB.gallery);
  const { data: testimonials }                = useData(() => db.select("testimonials","is_active=eq.true"), FB.testimonials);
  const { data: faqs }                        = useData(() => db.select("faqs","is_active=eq.true"), FB.faqs);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1800); return () => clearTimeout(t); }, []);
  const wa = settings.wa_number;
  return (
    <>
      {loading && <Loader />}
      <Navbar wa={wa} />
      <Hero s={settings} />
      <About />
      <Gallery items={gallery} />
      <Features />
      <HouseTypes houses={houses} wa={wa} />
      <Simulation houses={houses} />
      <Location s={settings} />
      <CTABanner wa={wa} />
      <Testimonials items={testimonials} />
      <FAQ items={faqs} />
      <Footer s={settings} />
      <FloatingWA wa={wa} />
      <ScrollTopBtn />
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉒ ADMIN — DESIGN TOKENS & HELPERS
════════════════════════════════════════════════════════════════ */
const AC = {
  bg:"#040d04", sb:"#070f07", card:"#0d1f0d",
  brd:"rgba(255,255,255,.06)", gold:"#C9A84C",
  green:"#2E7D32", text:"#e0e0e0", muted:"#5a8a5a", lbl:"#7aaa7a",
};
const ainput   = { width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid rgba(255,255,255,.1)", background:"rgba(255,255,255,.04)", color:"#fff", fontSize:14 };
const ata      = { ...ainput, resize:"vertical", minHeight:80, lineHeight:1.6 };
const asel     = { ...ainput, cursor:"pointer" };
const acard    = { background:AC.card, borderRadius:20, padding:24, border:`1px solid ${AC.brd}`, marginBottom:16 };
const abtnG    = { background:"linear-gradient(135deg,#C9A84C,#e8c96a)", color:"#111", padding:"10px 22px", borderRadius:10, fontWeight:700, fontSize:14, border:"none", cursor:"pointer" };
const abtnR    = { background:"rgba(220,38,38,.12)", border:"1px solid rgba(220,38,38,.25)", color:"#fca5a5", padding:"8px 14px", borderRadius:10, fontWeight:600, fontSize:13, cursor:"pointer" };
const abtnGr   = { background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", color:"#aaa", padding:"8px 14px", borderRadius:10, fontWeight:600, fontSize:13, cursor:"pointer" };
const abtnTeal = { background:"rgba(46,125,50,.15)", border:"1px solid rgba(46,125,50,.3)", color:"#81c784", padding:"8px 14px", borderRadius:10, fontWeight:600, fontSize:13, cursor:"pointer" };
const aok      = { background:"rgba(46,125,50,.15)", border:"1px solid rgba(46,125,50,.3)", borderRadius:10, padding:"12px 16px", color:"#81c784", fontSize:14, marginBottom:16 };
const aerr     = { background:"rgba(220,38,38,.1)",  border:"1px solid rgba(220,38,38,.25)", borderRadius:10, padding:"12px 16px", color:"#fca5a5", fontSize:14, marginBottom:16 };

function ABadge({ on }) {
  return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:on?"rgba(46,125,50,.2)":"rgba(100,100,100,.2)", color:on?"#4caf50":"#888" }}>{on?"Aktif":"Nonaktif"}</span>;
}
function AFlash({ msg }) { return msg ? <div style={msg.startsWith("✅")?aok:aerr}>{msg}</div> : null; }
function AHdr({ title, sub }) {
  return (
    <div style={{ marginBottom:28 }}>
      <h1 style={{ fontWeight:800, fontSize:24, color:"#fff", marginBottom:4 }}>{title}</h1>
      <p style={{ color:AC.muted, fontSize:14 }}>{sub}</p>
    </div>
  );
}
function AField({ label, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ color:AC.lbl, fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}
function useFlash() {
  const [msg, setMsg] = useState("");
  const flash = useCallback(t => { setMsg(t); setTimeout(() => setMsg(""), 3000); }, []);
  return [msg, flash];
}

/* ════════════════════════════════════════════════════════════════
   ㉓ ADMIN — LOGIN
════════════════════════════════════════════════════════════════ */
function AdminLogin({ onLogin }) {
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [busy,  setBusy]    = useState(false);
  const [err,   setErr]     = useState("");
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      if (HAS_SUPABASE) {
        const data = await sbSignIn(email, pass);
        onLogin({ email, token: data.access_token });
      } else {
        if (email === "admin@ciomashills.id" && pass === "admin123") {
          await new Promise(r => setTimeout(r, 700));
          onLogin({ email, token: "demo" });
        } else throw new Error("Email atau password salah. Demo: admin@ciomashills.id / admin123");
      }
    } catch(e) { setErr(e.message); setBusy(false); }
  };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#030a03,#0a1a0a)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(201,168,76,.2)", borderRadius:24, padding:"48px 40px", width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#e8c96a)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#111", fontSize:24, margin:"0 auto 16px", animation:"spin 8s linear infinite" }}>CH</div>
          <div style={{ fontWeight:800, color:"#fff", fontSize:22 }}>Admin Panel</div>
          <div style={{ color:AC.muted, fontSize:14, marginTop:4 }}>Ciomas Hills Bogor</div>
        </div>
        {err && <div style={aerr}>⚠️ {err}</div>}
        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <AField label="Email Admin">
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="admin@ciomashills.id" style={ainput} />
          </AField>
          <AField label="Password">
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required placeholder="••••••••" style={ainput} />
          </AField>
          <button type="submit" disabled={busy} style={{ ...abtnG, padding:"14px", fontSize:15, marginTop:8, opacity:busy?.7:1, width:"100%" }}>
            {busy ? "⏳ Masuk..." : "🔐 Masuk ke Dashboard"}
          </button>
        </form>
        {!HAS_SUPABASE && <div style={{ textAlign:"center", marginTop:16, color:"#2a5a2a", fontSize:12 }}>Demo: admin@ciomashills.id / admin123</div>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉔ ADMIN — SIDEBAR
════════════════════════════════════════════════════════════════ */
const ANAV = [
  { id:"home",     icon:"📊", label:"Dashboard"  },
  { id:"houses",   icon:"🏠", label:"Tipe Rumah" },
  { id:"gallery",  icon:"🖼️", label:"Galeri"     },
  { id:"testi",    icon:"💬", label:"Testimoni"  },
  { id:"faq",      icon:"❓", label:"FAQ"         },
  { id:"settings", icon:"⚙️", label:"Pengaturan" },
];
function AdminSidebar({ page, onNav, user, onLogout }) {
  return (
    <aside className="admin-sb" style={{ width:240, background:AC.sb, borderRight:`1px solid ${AC.brd}`, display:"flex", flexDirection:"column", padding:"24px 14px", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32, paddingLeft:6 }}>
        <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#e8c96a)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#111", fontSize:15, flexShrink:0 }}>CH</div>
        <div>
          <div className="sb-lbl" style={{ fontWeight:800, color:"#fff", fontSize:14 }}>Ciomas Hills</div>
          <div className="sb-lbl" style={{ color:AC.muted, fontSize:11, letterSpacing:1 }}>ADMIN</div>
        </div>
      </div>
      <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
        {ANAV.map(n => {
          const on = page===n.id;
          return (
            <button key={n.id} onClick={() => onNav(n.id)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:12, border:on?"1px solid rgba(201,168,76,.3)":"1px solid transparent", background:on?"rgba(201,168,76,.15)":"transparent", color:on?AC.gold:AC.muted, fontWeight:600, fontSize:14, cursor:"pointer", width:"100%", textAlign:"left" }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{n.icon}</span>
              <span className="sb-lbl">{n.label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ borderTop:`1px solid ${AC.brd}`, paddingTop:16, marginTop:16 }}>
        <div className="sb-lbl" style={{ color:"#2a5a2a", fontSize:12, marginBottom:10, paddingLeft:6, wordBreak:"break-all" }}>👤 {user?.email}</div>
        <button onClick={onLogout} style={{ ...abtnR, width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          🚪 <span className="sb-lbl">Keluar</span>
        </button>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉕ ADMIN — DASHBOARD HOME
════════════════════════════════════════════════════════════════ */
function AHome({ onNav }) {
  const { data: houses }  = useData(() => db.select("house_types",""), FB.houses);
  const { data: gallery } = useData(() => db.select("gallery",""),     FB.gallery);
  const { data: testi }   = useData(() => db.select("testimonials",""),FB.testimonials);
  const { data: faqs }    = useData(() => db.select("faqs",""),        FB.faqs);
  const stats = [
    { icon:"🏠", label:"Tipe Rumah",  val:houses.length,  color:AC.gold,    pg:"houses"  },
    { icon:"🖼️", label:"Foto Galeri", val:gallery.length, color:AC.green,   pg:"gallery" },
    { icon:"💬", label:"Testimoni",   val:testi.length,   color:"#1565C0",  pg:"testi"   },
    { icon:"❓", label:"FAQ",          val:faqs.length,    color:"#7B1FA2",  pg:"faq"     },
  ];
  return (
    <div>
      <AHdr title="👋 Selamat Datang, Admin!" sub="Kelola seluruh konten website Ciomas Hills dari sini." />
      <div className="stat-g" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {stats.map(s => (
          <div key={s.label} onClick={() => onNav(s.pg)}
            style={{ ...acard, marginBottom:0, textAlign:"center", cursor:"pointer", transition:"transform .2s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{ fontSize:34, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontWeight:900, fontSize:30, color:s.color, lineHeight:1 }}>{s.val}</div>
            <div style={{ color:AC.muted, fontSize:13, marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={acard}>
        <div style={{ fontWeight:700, color:"#fff", fontSize:16, marginBottom:14 }}>⚡ Aksi Cepat</div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {[["🏠","Tambah Unit","houses"],["🖼️","Upload Foto","gallery"],["⚙️","Pengaturan","settings"]].map(([ic,lb,pg]) => (
            <button key={lb} onClick={() => onNav(pg)} style={abtnG} key={lb}>{ic} {lb}</button>
          ))}
        </div>
      </div>
      <div style={acard}>
        <div style={{ fontWeight:700, color:AC.gold, fontSize:14, marginBottom:12 }}>📋 Panduan</div>
        {["Semua perubahan langsung tampil di website publik.",
          "Upload gambar: maks 5MB, format JPG/PNG/WebP.",
          "Nonaktifkan item agar tidak tampil tanpa harus dihapus.",
          "Untuk ubah nomor WA/Instagram, masuk ke menu Pengaturan."].map(t => (
          <div key={t} style={{ color:AC.muted, fontSize:14, marginBottom:8, paddingLeft:14, borderLeft:"2px solid #1a4a1a", lineHeight:1.5 }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉖ ADMIN — HOUSE TYPES
════════════════════════════════════════════════════════════════ */
const EH = { name:"", lb:"", lt:"", price:"", price_num:"", badge:"", image_url:"", is_active:true, sort_order:0 };
function AHouses({ token }) {
  const [items, setItems] = useState(FB.houses);
  const [form,  setForm]  = useState(EH);
  const [edit,  setEdit]  = useState(null);
  const [busy,  setBusy]  = useState(false);
  const [msg,   flash]    = useFlash();
  const sf = (k,v) => setForm(f => ({...f,[k]:v}));
  useEffect(() => {
    if (!HAS_SUPABASE) return;
    db.select("house_types","").then(setItems).catch(() => {});
  }, []);
  const save = async () => {
    if (!form.name||!form.price) return flash("❌ Nama dan harga wajib diisi.");
    setBusy(true);
    try {
      if (HAS_SUPABASE) {
        if (edit) { 
          await db.update("house_types",edit,form);
        } else { 
          const r = await db.insert("house_types",form);
          setItems(p => [...p, r[0]]); 
        }
        const fresh = await db.select("house_types",""); setItems(fresh);
      } else {
        if (edit) setItems(p => p.map(i => i.id===edit ? {...i,...form} : i));
        else      setItems(p => [...p, {...form, id:uid()}]);
      }
      flash("✅ Tersimpan!"); setForm(EH);
      setEdit(null);
    } catch(e) { flash("❌ "+e.message); }
    finally { setBusy(false); }
  };
  const del = async id => {
    if (!confirm("Hapus tipe rumah ini?")) return;
    if (HAS_SUPABASE) await db.delete("house_types",id);
    setItems(p => p.filter(i => i.id!==id)); flash("✅ Dihapus.");
  };
  const toggle = async (id, val) => {
    if (HAS_SUPABASE) await db.update("house_types",id,{is_active:val});
    setItems(p => p.map(i => i.id===id ? {...i,is_active:val} : i));
  };
  return (
    <div>
      <AHdr title="🏠 Tipe Rumah" sub={`${items.length} tipe tersimpan`} />
      <AFlash msg={msg} />
      <div style={acard}>
        <div style={{ fontWeight:700, color:"#fff", marginBottom:16 }}>{edit?"✏️ Edit":"➕ Tambah"} Tipe Rumah</div>
        <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
          <AField label="Nama Tipe *"><input value={form.name} onChange={e=>sf("name",e.target.value)} placeholder="Tipe 45/90" style={ainput} /></AField>
          <AField label="Badge">
            <select value={form.badge} onChange={e=>sf("badge",e.target.value)} style={asel}>
              <option value="">— Pilih —</option>
              {["Terlaris","Best Value","Premium","Baru"].map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </AField>
          <AField label="Luas Bangunan *"><input value={form.lb} onChange={e=>sf("lb",e.target.value)} placeholder="45 m²" style={ainput} /></AField>
          <AField label="Luas Tanah *"><input value={form.lt} onChange={e=>sf("lt",e.target.value)} placeholder="90 m²" style={ainput} /></AField>
          <AField label="Harga (teks) *"><input value={form.price} onChange={e=>sf("price",e.target.value)} placeholder="Rp 490 Juta" style={ainput} /></AField>
          <AField label="Harga (angka)"><input type="number" value={form.price_num} onChange={e=>sf("price_num",e.target.value)} placeholder="490000000" style={ainput} /></AField>
          <AField label="URL Foto"><input value={form.image_url} onChange={e=>sf("image_url",e.target.value)} placeholder="https://..." style={ainput} /></AField>
          <AField label="Urutan"><input type="number" value={form.sort_order} onChange={e=>sf("sort_order",Number(e.target.value))} style={{...ainput,width:80}} /></AField>
        </div>
        {form.image_url && <img src={form.image_url} alt="" style={{ width:120, height:90, objectFit:"cover", borderRadius:10, marginBottom:14 }} />}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={save} disabled={busy} style={{...abtnG,opacity:busy?.7:1}}>{busy?"⏳...":"💾 Simpan"}</button>
          {edit && <button onClick={()=>{setForm(EH);setEdit(null);}} style={abtnGr}>Batal</button>}
        </div>
      </div>
      {items.map(h => (
        <div key={h.id} style={{...acard, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap"}}>
          {h.image_url && <img src={h.image_url} alt={h.name} style={{ width:88, height:64, objectFit:"cover", borderRadius:10, flexShrink:0 }} />}
          <div style={{ flex:1, minWidth:160 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
              <span style={{ fontWeight:700, color:"#fff", fontSize:16 }}>{h.name}</span>
              {h.badge && <span style={{ background:"#C9A84C22", color:AC.gold, fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:20 }}>{h.badge}</span>}
              <ABadge on={h.is_active} />
            </div>
            <div style={{ color:AC.muted, fontSize:13 }}>LB: {h.lb} · LT: {h.lt} · {h.price}</div>
          </div>
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            <button onClick={()=>toggle(h.id,!h.is_active)} style={abtnTeal}>{h.is_active?"🔕":"👁️"}</button>
            <button onClick={()=>{setForm({...h});setEdit(h.id);window.scrollTo({top:0,behavior:"smooth"});}} style={abtnGr}>✏️</button>
            <button onClick={()=>del(h.id)} style={abtnR}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉗ ADMIN — GALLERY
════════════════════════════════════════════════════════════════ */
function AGallery({ token }) {
  const [items, setItems] = useState(FB.gallery);
  const [label, setLabel] = useState("");
  const [url,   setUrl]   = useState("");
  const [busy,  setBusy]  = useState(false);
  const [msg,   flash]    = useFlash();
  useEffect(() => {
    if (!HAS_SUPABASE) return;
    db.select("gallery","").then(setItems).catch(()=>{});
  }, []);
  const add = async () => {
    if (!label||!url) return flash("❌ Label dan URL wajib diisi.");
    setBusy(true);
    try {
      const payload = { label, image_url:url, is_active:true, sort_order:items.length+1 };
      if (HAS_SUPABASE) { await db.insert("gallery",payload); const f=await db.select("gallery",""); setItems(f); }
      else setItems(p => [...p, {...payload, id:uid()}]);
      flash("✅ Foto ditambahkan!"); setLabel(""); setUrl("");
    } catch(e) { flash("❌ "+e.message); }
    finally { setBusy(false); }
  };
  const del = async id => {
    if (!confirm("Hapus foto?")) return;
    if (HAS_SUPABASE) await db.delete("gallery",id);
    setItems(p => p.filter(i => i.id!==id)); flash("✅ Dihapus.");
  };
  const toggle = async (id, val) => {
    if (HAS_SUPABASE) await db.update("gallery",id,{is_active:val});
    setItems(p => p.map(i => i.id===id ? {...i,is_active:val} : i));
  };
  return (
    <div>
      <AHdr title="🖼️ Galeri Foto" sub={`${items.length} foto tersimpan`} />
      <AFlash msg={msg} />
      <div style={acard}>
        <div style={{ fontWeight:700, color:"#fff", marginBottom:14 }}>➕ Tambah Foto</div>
        <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
          <AField label="Label *"><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Eksterior Mewah" style={ainput} /></AField>
          <AField label="URL Foto *"><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." style={ainput} /></AField>
        </div>
        {url && <img src={url} alt="" style={{ width:160, height:110, objectFit:"cover", borderRadius:10, marginBottom:14 }} />}
        <button onClick={add} disabled={busy} style={{...abtnG,opacity:busy?.7:1}}>{busy?"⏳...":"💾 Tambah"}</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
        {items.map(it => (
          <div key={it.id} style={{...acard, padding:0, overflow:"hidden", marginBottom:0}}>
            <div style={{ position:"relative" }}>
              <img src={it.image_url} alt={it.label} style={{ width:"100%", aspectRatio:"4/3", objectFit:"cover" }} />
              <div style={{ position:"absolute", top:8, left:8 }}><ABadge on={it.is_active} /></div>
            </div>
            <div style={{ padding:"12px 14px" }}>
              <div style={{ fontWeight:600, color:"#fff", fontSize:14, marginBottom:10 }}>{it.label}</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>toggle(it.id,!it.is_active)} style={abtnTeal}>{it.is_active?"🔕":"👁️"}</button>
                <button onClick={()=>del(it.id)} style={abtnR}>🗑️ Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉘ ADMIN — TESTIMONIALS
════════════════════════════════════════════════════════════════ */
const ET = { name:"", location:"", stars:5, text:"", is_active:true };
function ATesti() {
  const [items, setItems] = useState(FB.testimonials);
  const [form,  setForm]  = useState(ET);
  const [edit,  setEdit]  = useState(null);
  const [busy,  setBusy]  = useState(false);
  const [msg,   flash]    = useFlash();
  const sf = (k,v) => setForm(f=>({...f,[k]:v}));
  useEffect(() => {
    if (!HAS_SUPABASE) return;
    db.select("testimonials","").then(setItems).catch(()=>{});
  }, []);
  const save = async () => {
    if (!form.name||!form.text) return flash("❌ Nama dan ulasan wajib diisi.");
    setBusy(true);
    try {
      if (HAS_SUPABASE) {
        if (edit) await db.update("testimonials",edit,form);
        else await db.insert("testimonials",form);
        const f = await db.select("testimonials",""); setItems(f);
      } else {
        if (edit) setItems(p=>p.map(i=>i.id===edit?{...i,...form}:i));
        else setItems(p=>[...p,{...form,id:uid()}]);
      }
      flash("✅ Tersimpan!"); setForm(ET); setEdit(null);
    } catch(e) { flash("❌ "+e.message); }
    finally { setBusy(false); }
  };
  const del = async id => {
    if (!confirm("Hapus?")) return;
    if (HAS_SUPABASE) await db.delete("testimonials",id);
    setItems(p=>p.filter(i=>i.id!==id)); flash("✅ Dihapus.");
  };
  const toggle = async (id,val) => {
    if (HAS_SUPABASE) await db.update("testimonials",id,{is_active:val});
    setItems(p=>p.map(i=>i.id===id?{...i,is_active:val}:i));
  };
  return (
    <div>
      <AHdr title="💬 Testimoni" sub={`${items.length} ulasan`} />
      <AFlash msg={msg} />
      <div style={acard}>
        <div style={{ fontWeight:700, color:"#fff", marginBottom:14 }}>{edit?"✏️ Edit":"➕ Tambah"} Testimoni</div>
        <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
          <AField label="Nama *"><input value={form.name} onChange={e=>sf("name",e.target.value)} placeholder="Nama pembeli" style={ainput} /></AField>
          <AField label="Kota"><input value={form.location} onChange={e=>sf("location",e.target.value)} placeholder="Jakarta" style={ainput} /></AField>
        </div>
        <AField label="Bintang">
          <div style={{ display:"flex", gap:6 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={()=>sf("stars",n)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", opacity:n<=form.stars?1:.3, transition:"opacity .2s" }}>⭐</button>
            ))}
            <span style={{ color:AC.muted, fontSize:14, alignSelf:"center", marginLeft:6 }}>{form.stars} bintang</span>
          </div>
        </AField>
        <AField label="Ulasan *"><textarea value={form.text} onChange={e=>sf("text",e.target.value)} placeholder="Isi ulasan..." style={ata} /></AField>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={save} disabled={busy} style={{...abtnG,opacity:busy?.7:1}}>{busy?"⏳...":"💾 Simpan"}</button>
          {edit && <button onClick={()=>{setForm(ET);setEdit(null);}} style={abtnGr}>Batal</button>}
        </div>
      </div>
      {items.map(t => (
        <div key={t.id} style={{...acard, display:"flex", gap:14, alignItems:"flex-start"}}>
          <div style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#e8c96a)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#111", fontSize:16, flexShrink:0 }}>
            {initials(t.name)}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
              <span style={{ fontWeight:700, color:"#fff" }}>{t.name}</span>
              <span style={{ color:AC.gold, fontSize:13 }}>{"⭐".repeat(t.stars)}</span>
              <ABadge on={t.is_active} />
            </div>
            <div style={{ color:AC.muted, fontSize:12, marginBottom:4 }}>📍 {t.location}</div>
            <div style={{ color:"#9aba9a", fontSize:14, lineHeight:1.6 }}>{t.text}</div>
          </div>
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            <button onClick={()=>toggle(t.id,!t.is_active)} style={abtnTeal}>{t.is_active?"🔕":"👁️"}</button>
            <button onClick={()=>{setForm({...t});setEdit(t.id);}} style={abtnGr}>✏️</button>
            <button onClick={()=>del(t.id)} style={abtnR}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉙ ADMIN — FAQ
════════════════════════════════════════════════════════════════ */
const EF = { question:"", answer:"", sort_order:0, is_active:true };
function AFAQ() {
  const [items, setItems] = useState(FB.faqs);
  const [form,  setForm]  = useState(EF);
  const [edit,  setEdit]  = useState(null);
  const [busy,  setBusy]  = useState(false);
  const [msg,   flash]    = useFlash();
  const sf = (k,v) => setForm(f=>({...f,[k]:v}));
  useEffect(() => {
    if (!HAS_SUPABASE) return;
    db.select("faqs","").then(setItems).catch(()=>{});
  }, []);
  const save = async () => {
    if (!form.question||!form.answer) return flash("❌ Pertanyaan dan jawaban wajib diisi.");
    setBusy(true);
    try {
      if (HAS_SUPABASE) {
        if (edit) await db.update("faqs",edit,form);
        else await db.insert("faqs",form);
        const f = await db.select("faqs",""); setItems(f);
      } else {
        if (edit) setItems(p=>p.map(i=>i.id===edit?{...i,...form}:i));
        else setItems(p=>[...p,{...form,id:uid()}]);
      }
      flash("✅ Tersimpan!"); setForm(EF); setEdit(null);
    } catch(e) { flash("❌ "+e.message); }
    finally { setBusy(false); }
  };
  const del = async id => {
    if (!confirm("Hapus FAQ?")) return;
    if (HAS_SUPABASE) await db.delete("faqs",id);
    setItems(p=>p.filter(i => i.id!==id));
    flash("✅ Dihapus.");
  };
  const toggle = async (id,val) => {
    if (HAS_SUPABASE) await db.update("faqs",id,{is_active:val});
    setItems(p=>p.map(i=>i.id===id?{...i,is_active:val}:i));
  };
  return (
    <div>
      <AHdr title="❓ FAQ" sub={`${items.length} pertanyaan`} />
      <AFlash msg={msg} />
      <div style={acard}>
        <div style={{ fontWeight:700, color:"#fff", marginBottom:14 }}>{edit?"✏️ Edit":"➕ Tambah"} FAQ</div>
        <AField label="Pertanyaan *"><input value={form.question} onChange={e=>sf("question",e.target.value)} placeholder="Pertanyaan umum..." style={ainput} /></AField>
        <AField label="Jawaban *"><textarea value={form.answer} onChange={e=>sf("answer",e.target.value)} placeholder="Jawaban lengkap..." style={ata} /></AField>
        <AField label="Urutan"><input type="number" value={form.sort_order} onChange={e=>sf("sort_order",Number(e.target.value))} style={{...ainput,width:80}} /></AField>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={save} disabled={busy} style={{...abtnG,opacity:busy?.7:1}}>{busy?"⏳...":"💾 Simpan"}</button>
          {edit && <button onClick={()=>{setForm(EF);setEdit(null);}} style={abtnGr}>Batal</button>}
        </div>
      </div>
      {items.map((f,i) => (
        <div key={f.id} style={{...acard, display:"flex", gap:12, alignItems:"flex-start"}}>
          <div style={{ width:30, height:30, borderRadius:8, background:"rgba(201,168,76,.15)", display:"flex", alignItems:"center", justifyContent:"center", color:AC.gold, fontWeight:700, fontSize:13, flexShrink:0 }}>{i+1}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
              <span style={{ fontWeight:700, color:"#fff" }}>{f.question}</span>
              <ABadge on={f.is_active} />
            </div>
            <div style={{ color:"#7aaa7a", fontSize:14, lineHeight:1.6 }}>{f.answer}</div>
          </div>
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            <button onClick={()=>toggle(f.id,!f.is_active)} style={abtnTeal}>{f.is_active?"🔕":"👁️"}</button>
            <button onClick={()=>{setForm({...f});setEdit(f.id);}} style={abtnGr}>✏️</button>
            <button onClick={()=>del(f.id)} style={abtnR}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉚ ADMIN — SETTINGS
════════════════════════════════════════════════════════════════ */
function ASettings() {
  const [form,  setForm]  = useState({...FB.settings});
  const [busy,  setBusy]  = useState(false);
  const [msg,   flash]    = useFlash();
  const sf = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    if (!HAS_SUPABASE) return;
    db.settings().then(rows => {
      if (rows.length) setForm(Object.fromEntries(rows.map(r=>[r.key,r.value])));
    }).catch(()=>{});
  }, []);
  const save = async () => {
    setBusy(true);
    try {
      if (HAS_SUPABASE) {
        await Promise.all(Object.entries(form).map(([k,v]) => db.updateSetting(k,v)));
      }
      flash("✅ Pengaturan berhasil disimpan!");
    } catch(e) { flash("❌ "+e.message); }
    finally { setBusy(false); }
  };
  const F = (k,lbl,type="text",ph="") => (
    <AField key={k} label={lbl}>
      <input type={type} value={form[k]||""} onChange={e=>sf(k,e.target.value)} placeholder={ph} style={ainput} />
    </AField>
  );
  return (
    <div>
      <AHdr title="⚙️ Pengaturan Website" sub="Ubah info kontak, teks hero, dan konfigurasi global." />
      <AFlash msg={msg} />
      <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div style={acard}>
          <div style={{ fontWeight:700, color:AC.gold, marginBottom:18, fontSize:15 }}>📞 Informasi Kontak</div>
          {F("site_name",  "Nama Website",       "text",  "Ciomas Hills Bogor")}
          {F("tagline",    "Tagline",             "text",  "Hunian Premium...")}
          {F("wa_number",  "Nomor WhatsApp",      "tel",   "628...")}
          {F("instagram",  "Username Instagram",  "text",  "ciomashills")}
          {F("email",      "Email Marketing",     "email", "marketing@...")}
          {F("address",    "Alamat",              "text",  "Jl. Ciomas...")}
        </div>
        <div style={acard}>
          <div style={{ fontWeight:700, color:AC.gold, marginBottom:18, fontSize:15 }}>🖼️ Hero Section</div>
          {F("hero_title",    "Judul Hero",           "text", "Rumah Impian di...")}
          <AField label="Subjudul Hero">
            <textarea value={form.hero_subtitle||""} onChange={e=>sf("hero_subtitle",e.target.value)} style={ata} placeholder="Deskripsi singkat..." />
          </AField>
          {F("hero_image_url","URL Foto Hero",         "text", "https://...")}
          {form.hero_image_url && (
            <img src={form.hero_image_url} alt="" style={{ width:"100%", borderRadius:12, aspectRatio:"16/6", objectFit:"cover", marginTop:8 }} />
          )}
        </div>
      </div>
      <button onClick={save} disabled={busy} style={{...abtnG, padding:"14px 40px", fontSize:15, opacity:busy?.7:1}}>
        {busy ? "⏳ Menyimpan..." : "💾 Simpan Semua Pengaturan"}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉛ ADMIN SHELL
════════════════════════════════════════════════════════════════ */
function AdminShell({ user, onLogout }) {
  const [page, setPage] = useState("home");
  const pages = {
    home:     <AHome onNav={setPage} />,
    houses:   <AHouses token={user.token} />,
    gallery:  <AGallery token={user.token} />,
    testi:    <ATesti />,
    faq:      <AFAQ />,
    settings: <ASettings />,
  };
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:AC.bg }}>
      <AdminSidebar page={page} onNav={setPage} user={user} onLogout={onLogout} />
      <main className="admin-main" style={{ flex:1, overflowY:"auto", padding:"32px 36px", maxHeight:"100vh" }}>
        <div style={{ maxWidth:1100 }} key={page}>{pages[page] || pages.home}</div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ㉜ ROUTER — simple hash-based router for safe deployment
════════════════════════════════════════════════════════════════ */
function useRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const fn = () => setHash(window.location.hash);
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return hash;
}

/* ════════════════════════════════════════════════════════════════
   ㉝ APP ROOT
════════════════════════════════════════════════════════════════ */
export default function App() {
  const hash = useRoute();
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("ch_admin") || "null"); } catch { return null; }
  });

  const handleLogin = user => {
    sessionStorage.setItem("ch_admin", JSON.stringify(user));
    setAdminUser(user);
  };

  const handleLogout = async () => {
    if (HAS_SUPABASE && adminUser?.token && adminUser.token !== "demo") {
      await sbSignOut(adminUser.token).catch(()=>{});
    }
    sessionStorage.removeItem("ch_admin");
    setAdminUser(null);
  };

  const isAdmin = hash.startsWith("#/admin");

  return (
    <>
      <GStyle />
      {isAdmin
        ? adminUser
          ? <AdminShell user={adminUser} onLogout={handleLogout} />
          : <AdminLogin onLogin={handleLogin} />
        : <PublicPage />
      }
    </>
  );
}