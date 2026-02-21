# Metraj Ustasi - Proje Dokumantasyonu

> Son guncelleme: 2026-02-21

---

## 1. Proje Ozeti

**Metraj Ustasi**, universite ogrencilerinin (Z kusagi) Yapi Isletmesi dersinde kazi ve temel metraji hesaplamalarini interaktif bir web oyunuyla ogrenmesini saglayan bir egitim uygulamasidir. Rastgele boyutlarla soru uretir, ogrencinin hesaplarini kontrol eder, geri bildirim verir ve oyunlastirma ile motivasyonu arttirir.

- **Canli URL**: https://kafkasugur7-debug.github.io/metraj_bahce_duvari/
- **GitHub**: https://github.com/kafkasugur7-debug/metraj_bahce_duvari
- **Hosting**: GitHub Pages (ucretsiz)
- **Backend**: Supabase (ucretsiz plan - PostgreSQL + REST API)

---

## 2. Teknoloji Yigini

| Katman | Teknoloji | Aciklama |
|---|---|---|
| Frontend | Vanilla JS | Framework yok, hizli yuklenme |
| Stil | Modern CSS | CSS Variables, Grid, Flexbox, transitions, glassmorphism |
| Cizim | SVG | Parametrik kesit ve plan cizimleri |
| Yerel Depolama | LocalStorage | XP, rutbe, seri, heatmap kaydi |
| Backend | Supabase | Ogrenci takip, liderlik tablosu, istatistikler |
| Ses | Web Audio API | AudioContext ile ses efektleri (3 profil) |
| Hosting | GitHub Pages | Statik dosya sunumu |
| Guvenlik | SHA-256 + RLS | Ogrenci no hashleme + Supabase Row Level Security |

---

## 3. Dosya Yapisi

```
metraj-ustasi/
├── index.html              # Ana sayfa - tum ekranlar tek sayfada
├── CLAUDE.md               # Proje kurallari ve formulleri (AI asistan icin)
├── PROJE-DOKUMANTASYONU.md # Bu dosya
├── supabase-setup.sql      # Veritabani sema dosyasi
├── .gitignore              # Git haric tutulan dosyalar
├── css/
│   └── style.css           # Dark theme, glassmorphism, responsive tasarim
└── js/
    ├── config.js           # Supabase baglanti bilgileri
    ├── backend.js          # Supabase + localStorage islemleri
    ├── levels.js           # Soru ureteci + dogru cevap hesaplayici
    ├── drawing.js          # SVG kesit/plan cizim fonksiyonlari
    └── app.js              # Oyun mantigi, UI yonetimi, XP sistemi, ses
```

---

## 4. Oyun Mekanigi

### 4.1 Giris Sistemi
- Ogrenci takma ad (2-24 karakter) ve 12 haneli ogrenci numarasi ile giris yapar
- Ogrenci numarasi SHA-256 ile hashlenir, veritabaninda hash saklanir
- Maskelenmis numara gosterilir: `1234****9012` (ilk 4 + son 4 hane)
- Kufur filtresi: Turkce ve Ingilizce uygunsuz takma adlar engellenir

### 4.2 Seviye 1 - Bahce Duvari
Tek bir bahce duvari kesiti uzerinden 5 kalem metraj hesaplanir:

1. **Kazi Hacmi** (m3)
2. **Tesviye Betonu Hacmi** (m3)
3. **Somel Hacmi** (m3)
4. **Tas Duvar Hacmi** (m3)
5. **Hatil Hacmi** (m3)

**Calisma Payi Kurali:**
- %50 olasilikla "Kalip yapilacaktir" → calisma payi 50 cm (her iki tarafta)
- %50 olasilikla "Kalip yapilmayacaktir" → calisma payi yok
- Calisma payi sadece KAZI ve TESVIYE BETONU'nu etkiler

**Kesit Yapisi (asagidan yukariya):**
```
┌──────────────────┐ ← Hatil (betonarme)
├──────────────────┤
│    Tas Duvar     │
│                  │
├──────────────────┤
│     Somel        │ ← Betonarme C25
├──────────────────┤
│  Tesviye Betonu  │ ← 150 doz, 5 cm sabit
└──────────────────┘
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ← Kazi alani (calisma payi dahil/haric)
```

**Rastgele Parametreler:**

| Parametre | Min | Max | Adim |
|---|---|---|---|
| Duvar boyu (L) | 8.00 m | 20.00 m | 0.50 m |
| Duvar kalinligi | 0.40 m | 0.60 m | 0.10 m |
| Hatil genislik fazlasi (her tarafta) | 0.05 m | 0.10 m | 0.05 m |
| Hatil yuksekligi | 0.08 m | 0.15 m | 0.01 m |
| Somel genislik fazlasi (her tarafta) | 0.10 m | 0.15 m | 0.05 m |
| Somel yuksekligi | 0.20 m | 0.30 m | 0.05 m |
| Tesviye betonu kalinligi | 0.05 m | 0.05 m | sabit |
| Tas duvar toplam yuksekligi | 0.80 m | 1.20 m | 0.10 m |
| Tas duvar alti kismi (yeralti) | 0.15 m | 0.25 m | 0.05 m |

### 4.3 Seviye 2 - Tas Temel Plani
2 odali dikdortgen plan (A + B odasi), 5 aks uzerinden 7 kalem metraj:

1. **Kazi Hacmi** (m3) - her zaman calisma payi var
2. **Grobeton 150 Doz - Tesviye** (m3)
3. **Grobeton 200 Doz - Doseme** (m3)
4. **Beton C25 - Temel Alti** (m3)
5. **Beton C25 - Hatil** (m3)
6. **Tas Duvar Hacmi** (m3)
7. **Blokaj - Doseme Alti Kirma Tas** (m3)

**Plan Goruntulesu:**
```
┌──────────┬──────┐
│          │      │
│   Oda A  │Oda B │
│          │      │
└──────────┴──────┘
  Akslar: 1(ust), 2(sol), 3(ic), 4(sag), 5(alt)
```

**Rastgele Parametreler:**

| Parametre | Min | Max | Adim |
|---|---|---|---|
| Oda A genisligi | 3.00 m | 6.00 m | 0.50 m |
| Oda B genisligi | 1.50 m | 3.00 m | 0.50 m |
| Oda derinligi | 4.00 m | 7.00 m | 0.50 m |
| Duvar kalinligi | 0.40 m | 0.60 m | 0.10 m |
| Blokaj tasmasi (her tarafta) | 0.10 m | 0.10 m | sabit |
| Tesviye kalinligi | 0.05 m | 0.05 m | sabit |
| Betonarme temel yuksekligi | 0.20 m | 0.30 m | 0.05 m |
| Tas duvar toplam yuksekligi | 1.00 m | 1.50 m | 0.25 m |
| Hatil yuksekligi | 0.20 m | 0.30 m | 0.05 m |
| Doseme grobeton kalinligi | 0.10 m | 0.10 m | sabit |
| Doseme blokaj kalinligi | 0.10 m | 0.20 m | 0.05 m |

### 4.4 Cevap Kontrolu
- Hacim hesaplarinda **±%2 tolerans** kabul edilir
- Her kalem icin **2 hak** verilir
- 1. yanlis: Cevap gizli tutulur, tekrar deneme sansi
- 2. yanlis: Detayli cozum tablosu (Excel metraj cetveli formatinda) gosterilir
- Adim adim mod aciksa ara adimlar da kontrol edilir

### 4.5 Oyunlastirma (Gamification)

**XP Sistemi:**
| Aksiyon | XP |
|---|---|
| Dogru kalem | +10 |
| Kombo bonusu | +1 ile +8 arasi (kombo sayisina gore) |
| Tam tur bonusu | +20 |
| Seri bonusu (3+ ust uste tur) | x1.5 carpan |
| Hiz bonusu (<60 sn) | +10 |
| Kismi XP (adim adim modda bazi adimlar dogru) | +1 ile +4 arasi |

**Rutbe Tablosu:**
| Rutbe | Gereken XP |
|---|---|
| Cirak | 0 |
| Kalfa | 500 |
| Usta | 1500 |
| Basmuhendis | 3000 |

**Diger Oyun Ogeleri:**
- Kombo sayaci (ust uste dogru cevaplarda artar)
- Alev animasyonu (kombo seviyesine gore 3 kademe)
- Kombo toast bildirimi
- Alev backdrop efekti (arka plan parlaklik)
- Hata isi haritasi (en cok zorlanilan kalemler)
- Seri takibi (ust uste tamamlanan turlar)

---

## 5. Kullanici Arayuzu

### 5.1 Tasarim
- **Tema**: Koyu (dark mode)
- **Arka plan**: Gradient (#0f172a → #1e293b)
- **Kartlar**: Glassmorphism (yari saydam, backdrop-blur)
- **Vurgu rengi**: Turuncu (#f97316)
- **Dogru**: Yesil (#22c55e)
- **Yanlis**: Kirmizi (#ef4444)
- **Uyari**: Sari (#eab308)
- **Responsive**: Mobile-first, 780px breakpoint

### 5.2 Ekranlar (Tek Sayfa)
1. **Giris Overlay**: Takma ad + ogrenci numarasi formu
2. **Kontrol Cubugu**: Seviye secimi, adim modu, ses ayarlari, yeni soru butonu
3. **Oturum Bilgisi**: Tur sayaci, zamanlayici, basari yuzdesi, ilerleme cubugu
4. **Soru Karti**: Baslik, aciklama metni, parametreler listesi
5. **Kesit/Plan Cizimi**: SVG sematik gorseli
6. **Cevap Alani**: Input + "Kontrol Et" butonu + tolerans bilgisi
7. **Degerlendirme**: Kalem bazli geri bildirim, formula, detayli cozum tablosu
8. **Hata Isi Haritasi**: En cok zorlanilan kalemler (yuzdesel renk cubugu)
9. **Liderlik Tablosu**: Gunluk / Haftalik / Aylik filtreli
10. **Ogrenci Takip**: Kisisel istatistikler

### 5.3 SVG Cizimleri
- **Seviye 1**: Kesit goruntusu - kazi, tesviye, somel, tas duvar, hatil katmanlari
- **Seviye 2**: Plan goruntusu - dis blokaj siniri, duvar kenarlari, A/B oda alanlari
- Tum cizimler parametrik: boyutlara gore otomatik olceklenir

---

## 6. Backend Mimarisi

### 6.1 Supabase Yapisi

**Tablolar:**

```sql
-- Oyuncu kayitlari
players (
  student_no_hash text PRIMARY KEY,  -- SHA-256 hash
  student_no_masked text,            -- "1234****9012" formati
  nickname text NOT NULL,
  play_count integer DEFAULT 0,
  total_xp integer DEFAULT 0,
  correct_count integer DEFAULT 0,
  attempt_count integer DEFAULT 0,
  created_at timestamptz,
  updated_at timestamptz
)

-- Her cevap denemesi
attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_no_hash text REFERENCES players,
  nickname text,
  level integer,
  item_key text,          -- 'excavation', 'somel', 'stoneWall' vb.
  correct boolean,
  gained_xp integer,
  combo integer,
  finished_round boolean,
  created_at timestamptz
)
```

**Gorunumler (Views):**
- `player_stats` — Oyuncu istatistikleri (basari yuzdesi hesapli)
- `leaderboard_daily` — Gunluk liderlik tablosu (son 24 saat)
- `leaderboard_weekly` — Haftalik liderlik tablosu
- `leaderboard_monthly` — Aylik liderlik tablosu

**Indexler:**
- `idx_attempts_hash` — student_no_hash uzerinde (hiz icin)
- `idx_attempts_created` — created_at uzerinde (liderlik tablosu icin)

**RLS Politikalari:**
- Herkes okuyabilir (liderlik tablosu icin)
- Herkes kendi kaydini ekleyebilir/guncelleyebilir

### 6.2 Supabase Baglanti
```javascript
// js/config.js
window.METRAJ_CONFIG = {
  supabaseUrl: 'https://plccnwkrgzqbhfykrlex.supabase.co',
  supabaseAnonKey: '...'  // Anon public key
};
```

### 6.3 LocalStorage Fallback
Supabase erisilemediyse tum veriler localStorage'da tutulur:
- `metraj_ustasi_state_v3` — Oyun durumu (XP, seri, kombo, heatmap, profil)
- `metraj_backend_local_v1` — Oyuncu ve deneme kayitlari

### 6.4 API Akisi
1. Giris → `prepareProfile()` → SHA-256 hash + maskeleme
2. Giris → `upsertPlayer()` → Supabase'e oyuncu kaydi (veya guncelleme)
3. Her cevap → `recordAttempt()` → Deneme kaydi + oyuncu istatistik guncelleme
4. Liderlik → `fetchLeaderboards('daily'|'weekly'|'monthly')` → View sorgusu
5. Istatistik → `fetchStudentStats(profile)` → Kisisel istatistik sorgusu

---

## 7. Ses Sistemi

### 7.1 Ses Profilleri
| Profil | Dogru Ses | Yanlis Ses |
|---|---|---|
| Klasik | 2 triangle ton (artan frekans) | 1 sawtooth ton (dusuk frekans) |
| Arcade | 3 square/triangle ton (hizli arpej) | 2 square ton (dusuk frekans) |
| Minimal | 1 sine ton (kisa) | 1 sine ton (kisa, dusuk) |

### 7.2 Kombo Etkisi
Dogru ses frekanslari kombo sayisiyla artar:
- Klasik: 420 + kombo*12 Hz ve 560 + kombo*14 Hz
- Arcade: 640 + kombo*10, 860 + kombo*12, 1020 + kombo*8 Hz

### 7.3 Mobil Uyumluluk
Safari ve mobil tarayicilar icin ozel islem:
- `touchstart`, `touchend`, `click` olaylarinda AudioContext kilidi acilir
- Sessiz buffer oynatilarak Safari'nin ses politikasi atlanir
- `ctx.resume()` promise olarak beklenir, sonra ses zamanlanir

---

## 8. Guvenlik

### 8.1 Ogrenci Numarasi Korumasi
- Frontend'de SHA-256 ile hashlenir → veritabaninda ham numara saklanmaz
- `crypto.subtle` yoksa (HTTP baglanti) basit fallback hash kullanilir
- Maskelenmis gosterim: `1234****9012`

### 8.2 XSS Korumasi
- Takma ad ve diger kullanici girisli veriler `escapeHtml()` ile temizlenir
- `<`, `>`, `&`, `"`, `'` karakterleri HTML entity'lere donusturulur
- Liderlik tablosu ve ogrenci istatistiklerinde uygulanir

### 8.3 Kufur Filtresi
Turkce ve Ingilizce uygunsuz kelimeler engellidir:
```
amk, aq, oc, sik, sikerim, sikeyim, siktir, yarrak, pic, orospu, oruspu,
fuck, shit, bitch, asshole, motherfucker, dick, cock, pussy, nigger, faggot
```

### 8.4 Supabase RLS
- Row Level Security aktif
- Herkes okuyabilir (liderlik icin gerekli)
- Herkes kayit ekleyebilir (anonim giris ile)

---

## 9. Yapilan Islemler (Kronolojik)

### 9.1 Kapsamli Test (~216 test)
Uygulama asagidaki kategorilerde test edildi:
- `randStep()` fonksiyonu ve edge case'ler
- Seviye 1 ve Seviye 2 hesaplama dogrulugu
- Tolerans fonksiyonu
- Spesifikasyon uyumlulugu
- XP sistemi ve oyunlastirma
- Backend mantigi
- HTML yapisi
- CSS varligi
- SVG cizim
- Guvenlik
- Excel capraz dogrulama (YM22.xlsx referans dosyasi ile)

### 9.2 Bulunan ve Duzeltilen Hatalar

#### Hata #1: Seviye 1 Calisma Payi Rastgelestirmesi
- **Sorun**: Level 1 her zaman `allowance=0` uretiyordu (hardcoded). "Kalip yapilacaktir" secenegi hic gelmiyordu.
- **Cozum**: `Math.random() < 0.5` ile %50-%50 rastgele secim eklendi.
- **Dosya**: `js/levels.js`

#### Hata #2: Seviye 2 Meta'da Eksik Bilgi
- **Sorun**: Level 2 soru meta listesinde `stoneWallBelow` (tas duvar yeralti kismi) parametresi gosterilmiyordu.
- **Cozum**: Meta dizisine `Tas duvar yeralti kismi: X cm` eklendi.
- **Dosya**: `js/levels.js`

#### Hata #3: XSS Guvenlik Acigi
- **Sorun**: Liderlik tablosu ve ogrenci istatistiklerinde takma ad `innerHTML` ile dogrudan yaziliyordu.
- **Cozum**: `escapeHtml()` fonksiyonu eklendi, tum kullanici girisi temizlendi.
- **Dosya**: `js/app.js`

### 9.3 Calisma Payi Bilgisi Sadeleştirme
- **Talep**: "Kalip yapilacaktir" bilgisi yeterli, ogrenci calisma payini kendisi bilmeli.
- **Islem**: Her iki seviyeden "Calisma payi: 50 cm (her iki tarafta)" ve "Calisma payi: Yok" meta bilgileri kaldirildi.
- **Dosya**: `js/levels.js`

### 9.4 Basla Butonu Sorunu (crypto.subtle)
- **Sorun**: HTTPS olmayan ortamda `crypto.subtle` tanimsiz, `sha256()` fonksiyonu hata veriyordu. Hata yakalanmadigi icin "Basla" butonu sessizce calismayi durduruyordu.
- **Cozum**:
  1. `sha256()` fonksiyonu `try-catch` ile sarmalandi, fallback basit hash eklendi
  2. `startWithProfile()` fonksiyonu `try-catch` ile sarmalandi, hata mesaji kullaniciya gosteriliyor
- **Dosya**: `js/backend.js`, `js/app.js`

### 9.5 Supabase Backend Kurulumu
- **Islem**:
  1. Supabase hesabi olusturuldu
  2. `config.js` dosyasina Supabase URL ve anon key eklendi
  3. `supabase-setup.sql` dosyasi olusturuldu (tablolar, gorunumler, indexler, RLS)
  4. SQL Supabase Dashboard'da calistirildi
  5. 6 endpoint dogrulandi (players, attempts, player_stats, leaderboard_daily/weekly/monthly)
- **Dosyalar**: `js/config.js`, `supabase-setup.sql`

### 9.6 GitHub Pages Yayinlama
- **Islem**:
  1. Git reposu olusturuldu
  2. `.gitignore` dosyasi eklendi
  3. GitHub'a push yapildi
  4. GitHub Pages aktif edildi (main branch, / root)
- **Canli URL**: https://kafkasugur7-debug.github.io/metraj_bahce_duvari/

### 9.7 Mobil UX: Kontrol Et Butonu
- **Sorun**: "Kontrol Et" butonu kontrol panelinde (ustte) duruyordu, mobilde cevap yazildiktan sonra butona ulasmak icin yukari kaydirilmasi gerekiyordu.
- **Cozum**: Buton, cevap alaninin hemen altina tasindi.
- **Dosya**: `index.html`

### 9.8 Mobil Ses Sorunu (Ilk Duzeltme)
- **Sorun**: Mobil tarayicilarda ses calmiyordu.
- **Neden**: `AudioContext.resume()` beklenmeden (await/then olmadan) cagriliyor, ardindan oscillator zamanlama yapiliyordu. Mobil tarayicilar kullanici jesti olmadan AudioContext'i askiya aliyor.
- **Cozum**:
  1. `touchstart`, `touchend`, `click` olaylarinda `resumeAudioCtx()` cagrisi eklendi
  2. `playTone()` icinde `resume()` promise olarak bekleniyor, sonra `scheduleTone()` cagiriliyor
- **Dosya**: `js/app.js`

### 9.9 Safari Ses Sorunu (Ikinci Duzeltme)
- **Sorun**: Safari'de ses hala calmiyordu (ilk duzeltme yeterli olmadi).
- **Neden**: Safari sadece `resume()` ile yetinmiyor, gercek bir ses kaynagi oynatilmali.
- **Cozum**:
  1. `unlockAudio()` fonksiyonu eklendi: sessiz bir `AudioBufferSource` olusturup calatarak Safari'nin ses politikasini astirir
  2. Listener'lar `{ once: true }` yerine `capture: true` ile surekli dinleniyor (auth ekranindaki ilk dokunusta da tetikleniyor)
  3. `audioUnlocked` flag'i ile gereksiz tekrar onleniyor
- **Dosya**: `js/app.js`

### 9.10 Ogrenci Numarasi Maskeleme Guncelleme
- **Sorun**: Maskeleme sadece ilk 2 ve son 2 haneyi gosteriyordu: `12***12`
- **Talep**: Ilk 4 ve son 4 hane gorunmeli.
- **Cozum**: `maskStudentNo()` fonksiyonu guncellendi: `1234****9012` formati
- **Dosya**: `js/backend.js`

---

## 10. Formul Referansi

### 10.1 Seviye 1 Formulleri

#### Kalip YAPILMAYACAK (calisma payi YOK):
```
Kazi:      L x somel_genisligi x kazi_derinligi
Tesviye:   L x somel_genisligi x 0.05
Somel:     L x somel_genisligi x somel_yuksekligi
Tas Duvar: L x duvar_kalinligi x tas_duvar_yuksekligi
Hatil:     L x hatil_genisligi x hatil_yuksekligi
```

#### Kalip YAPILACAK (calisma payi = 0.50 m):
```
Kazi:      L x (somel_gen + 2 x 0.50) x kazi_derinligi
Tesviye:   L x (somel_gen + 2 x 0.50) x 0.05
Somel:     L x somel_genisligi x somel_yuksekligi
Tas Duvar: L x duvar_kalinligi x tas_duvar_yuksekligi
Hatil:     L x hatil_genisligi x hatil_yuksekligi
```

**Kazi Derinligi:**
```
kazi_derinligi = 0.05 (tesviye) + somel_yuksekligi + tas_duvar_yeralti_kismi
```

### 10.2 Seviye 2 Formulleri

**Blokaj ve Plan Boyutlari:**
```
blokaj_genisligi = duvar_kalinligi + 2 x 0.10
plan_genislik = 3 x duvar_kal + oda_A_gen + oda_B_gen
plan_derinlik = 2 x duvar_kal + oda_derinligi
dis_blokaj_gen = plan_genislik + 2 x 0.10
dis_blokaj_der = plan_derinlik + 2 x 0.10
```

**Duvar Boylari:**
```
Akslar 1-5 (yatay): boy = dis_blokaj_genislik
Akslar 2-3-4 (dikey): boy = dis_blokaj_derinlik - 2 x blokaj_genisligi
```

**Kazi (her zaman calisma payi var):**
```
Akslar 1-5: adet=2, boy = dis_blokaj_gen + 2x0.50, en = blokaj_gen + 2x0.50, yuk = kazi_derinligi
Akslar 2-3-4: adet=3, boy = (dis_blokaj_der + 2x0.50) - 2x(blokaj_gen + 2x0.50), en = blokaj_gen + 2x0.50, yuk = kazi_derinligi
```

**Grobeton 150 Doz (Tesviye):**
```
Akslar 1-5: adet=2, boy = dis_blokaj_gen, en = blokaj_gen, yuk = 0.05
Akslar 2-3-4: adet=3, boy = dis_blokaj_der - 2x blokaj_gen, en = blokaj_gen, yuk = 0.05
```

**Grobeton 200 Doz (Doseme):**
```
A Dosemesi: adet=1, boy = oda_derinligi, en = oda_A_gen, yuk = 0.10
B Dosemesi: adet=1, boy = oda_derinligi, en = oda_B_gen, yuk = 0.10
```

**Beton C25 (Temel Alti):**
```
Akslar 1-5: adet=2, boy = dis_blokaj_gen, en = blokaj_gen, yuk = betonarme_temel_yuk
Akslar 2-3-4: adet=3, boy = dis_blokaj_der - 2x blokaj_gen, en = blokaj_gen, yuk = betonarme_temel_yuk
```

**Beton C25 (Hatil):**
```
Akslar 1-5: adet=2, boy = plan_genislik, en = duvar_kal, yuk = hatil_yuk
Akslar 2-3-4: adet=3, boy = oda_derinligi, en = duvar_kal, yuk = hatil_yuk
```

**Tas Duvar:**
```
Akslar 1-5: adet=2, boy = plan_genislik, en = duvar_kal, yuk = tas_duvar_yuk
Akslar 2-3-4: adet=3, boy = oda_derinligi, en = duvar_kal, yuk = tas_duvar_yuk
```

**Blokaj (Doseme Alti):**
```
A Dosemesi: adet=1, boy = oda_derinligi, en = oda_A_gen, yuk = blokaj_doseme_kalinligi
B Dosemesi: adet=1, boy = oda_derinligi, en = oda_B_gen, yuk = blokaj_doseme_kalinligi
```

---

## 11. Git Commit Gecmisi

| Commit | Aciklama |
|---|---|
| `2bf9ebc` | Metraj Ustasi - ilk surum |
| `a70e123` | Mobil UX: Kontrol Et butonunu cevap alanina tasi, mobil ses sorununu duzelt |
| `9848ff1` | Safari mobil ses duzeltmesi: sessiz buffer ile AudioContext kilidi acma |
| `337344f` | Ogrenci no maskeleme: ilk 4 ve son 4 hane gorunur (1234****9012) |

---

## 12. Bilinen Sinirlamalar ve Notlar

1. **Sadece derin kazi** isleniyor, serbest kazi yok
2. **Calisma payi her zaman 50 cm** — bu kural degistirilemez
3. **Seviye 2'de calisma payi her zaman var** — istisna yok
4. **Supabase ucretsiz plan** — 500 MB veritabani, 50K aylik aktif kullanici limiti
5. **GitHub Pages** — sadece statik dosyalar sunulur, sunucu tarafi islem yok
6. **LocalStorage fallback** — Supabase erisilemediyse veriler yerel kalir, senkronizasyon yok
7. **crypto.subtle** — HTTPS gerektirir, HTTP'de basit fallback hash kullanilir (gercek SHA-256 degil)
8. **Tur atlama** — Sayfa yenilenince tur sayaci devam eder (sifirlanmaz), bu bilerek birakildi

---

## 13. Gelistirme Ortami

- **Platform**: Windows + WSL2 (Linux 6.6.87.2)
- **Git**: WSL icerisinde
- **Push**: Windows terminalinden (WSL'den GitHub auth sorunu nedeniyle)
- **Test**: Tarayici uzerinden (localhost veya GitHub Pages)
- **Supabase**: Dashboard uzerinden SQL calistirilir
