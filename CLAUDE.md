# Metraj Ustasi - Proje Dokumantasyonu

## Proje Amaci
Yapi Isletmesi dersinde ogrencilerin (Z kusagi) kazi ve temel metraji hesaplamalarini interaktif bir web oyunuyla ogrenmesi. Iki zorluk seviyesinde rastgele boyutlarla tekrar tekrar pratik yapilabilir.

## Hedef Kitle
- Universite ogrencileri (Z kusagi)
- Telefon ve bilgisayardan erisim
- Turkce arayuz

---

## Oyun Kurallari (DEGISTIRILEMEZ)

### Calisma Payi
- Calisma payi **her zaman 50 cm** (0.50 m), her iki tarafta
- Seviye 2 (Tas Temel) → **HER ZAMAN** calisma payi var
- Seviye 1 (Bahce Duvari) → **RASTGELE** (%50-%50): "kalip yapilmayacaktir" veya "kalip yapilacaktir"
- "Kalip yapilmayacaktir" → calisma payi YOK (toprak dogal kalip gorevini gorur)
- "Kalip yapilacaktir" → calisma payi 50 cm (her iki tarafta)

### Kazi Turu
- Sadece **derin kazi** isleniyor (serbest kazi yok)
- Kazi genisligi = temel/somel/blokaj genisligi + (2 x calisma payi, varsa)

---

## Seviye 1: Bahce Duvari

### Kesit Yapisi (asagidan yukariya)
1. **Tesviye Betonu** (150 Doz): h=0.05 m, genislik = somel genisligi (veya kazi genisligi)
2. **Somel** (Betonarme C25): rastgele yukseklik (0.20-0.30), genislik = duvar + 2x fazlalik
3. **Tas Duvar**: rastgele yukseklik (0.80-1.20), genislik = duvar kalinligi
4. **Hatil** (Betonarme): rastgele yukseklik (0.08-0.15), genislik = duvar + 2x fazlalik

### Hesaplanacak Kalemler (sirasiyla)
1. Kazi Hacmi (m3)
2. Tesviye Betonu Hacmi (m3)
3. Somel Hacmi (m3)
4. Tas Duvar Hacmi (m3)
5. Hatil Hacmi (m3)

### Boyut Formulleri

#### Kalip YAPILMAYACAK (calisma payi YOK):
```
Kazi:     L x somel_genisligi x kazi_derinligi
Tesviye:  L x somel_genisligi x 0.05
Somel:    L x somel_genisligi x somel_yuksekligi
Tas Duvr: L x duvar_kalinligi x tas_duvar_yuksekligi
Hatil:    L x hatil_genisligi x hatil_yuksekligi
```

#### Kalip YAPILACAK (calisma payi = 0.50 m):
```
Kazi:     L x (somel_gen + 2x0.50) x kazi_derinligi
Tesviye:  L x (somel_gen + 2x0.50) x 0.05
Somel:    L x somel_genisligi x somel_yuksekligi
Tas Duvr: L x duvar_kalinligi x tas_duvar_yuksekligi
Hatil:    L x hatil_genisligi x hatil_yuksekligi
```

> NOT: Calisma payi sadece KAZI ve TESVIYE BETONU'nu etkiler. Somel, tas duvar ve hatil boyutlari degismez.

### Kazi Derinligi Hesabi
```
kazi_derinligi = tesviye (0.05) + somel_yuksekligi + tas_duvar_alti_kismi
```
- Tas duvar alt kismi: somel ust kotundan ±0.00'a kadar olan kisim
- Ornek: somel_yuk=0.25, tas_duvar_alti=0.20 ise kazi_der = 0.05+0.25+0.20 = 0.50 m

### Rastgele Parametreler
| Parametre | Min | Max | Adim |
|---|---|---|---|
| Duvar boyu (L) | 8.00 | 20.00 | 0.50 |
| Duvar kalinligi | 0.40 | 0.60 | 0.10 |
| Hatil genislik fazlasi (her tarafta) | 0.05 | 0.10 | 0.05 |
| Hatil yuksekligi | 0.08 | 0.15 | 0.01 |
| Somel genislik fazlasi (her tarafta) | 0.10 | 0.15 | 0.05 |
| Somel yuksekligi | 0.20 | 0.30 | 0.05 |
| Tesviye betonu kalinligi | 0.05 | 0.05 | sabit |
| Tas duvar toplam yuksekligi | 0.80 | 1.20 | 0.10 |
| Tas duvar alti kismi (yeralti) | 0.15 | 0.25 | 0.05 |

---

## Seviye 2: Tas Temel Plani

### Plan Yapisi
- 2 odali dikdortgen plan (A odasi + B odasi)
- 5 aks: 1 (ust), 2 (sol), 3 (ic duvar), 4 (sag), 5 (alt)
- Tum duvarlar ayni kalinlikta
- Calisma payi HER ZAMAN 50 cm

### Kesit Yapisi (asagidan yukariya)
1. **Grobeton Tesviye** (150 Doz): h=0.05 m, genislik = blokaj genisligi
2. **Betonarme Temel Alti** (C25): rastgele yukseklik, genislik = blokaj genisligi
3. **Tas Duvar**: rastgele yukseklik, genislik = duvar kalinligi
4. **Hatil** (Betonarme C25): rastgele yukseklik, genislik = duvar kalinligi

### Blokaj Genisligi
```
blokaj_genisligi = duvar_kalinligi + 2 x 0.10
```
(Her iki tarafta 0.10 m tasma)

### Dis Boyutlar Hesabi
```
plan_genislik = duvar_kal + oda_A_gen + duvar_kal + oda_B_gen + duvar_kal
plan_derinlik = duvar_kal + oda_derinligi + duvar_kal
dis_blokaj_gen = plan_genislik + 2 x 0.10
dis_blokaj_der = plan_derinlik + 2 x 0.10
```

### Duvar Boylarinin Hesaplanmasi
- **Akslar 1-5** (yatay, ust+alt): boy = dis_blokaj_genislik (blokaj dis kenar)
- **Akslar 2-3-4** (dikey, sol+ic+sag): boy = dis_blokaj_derinlik - blokaj_gen_aks1 - blokaj_gen_aks5
  - Yani: dis_blokaj_der - 2 x blokaj_genisligi

### Hesaplanacak Kalemler

#### 1. Kazi (m3) — HER ZAMAN calisma payi 50 cm
```
Akslar 1-5: adet=2, boy = dis_blokaj_gen + 2x0.50, en = blokaj_gen + 2x0.50, yuk = kazi_derinligi
Akslar 2-3-4: adet=3, boy = oda_derinligi - 2x(blokaj_gen_yonundeki_cakisma), en = blokaj_gen + 2x0.50, yuk = kazi_derinligi
```
Kazi derinligi = tesviye (0.05) + betonarme_temel_yuk + tas_duvar_yeralti_kismi

#### 2. Grobeton 150 Doz - Tesviye (m3)
```
Akslar 1-5: adet=2, boy = dis_blokaj_gen, en = blokaj_gen, yuk = 0.05
Akslar 2-3-4: adet=3, boy = dis_blokaj_der - 2x blokaj_gen, en = blokaj_gen, yuk = 0.05
```

#### 3. Grobeton 200 Doz - Doseme (m3)
```
A Dosemesi: adet=1, boy = oda_derinligi, en = oda_A_gen, yuk = 0.10
B Dosemesi: adet=1, boy = oda_derinligi, en = oda_B_gen, yuk = 0.10
```

#### 4. Beton C25 - Temel Alti (m3)
```
Akslar 1-5: adet=2, boy = dis_blokaj_gen, en = blokaj_gen, yuk = betonarme_temel_yuk
Akslar 2-3-4: adet=3, boy = dis_blokaj_der - 2x blokaj_gen, en = blokaj_gen, yuk = betonarme_temel_yuk
```

#### 5. Beton C25 - Hatil / Tas Duvar Uzeri (m3)
```
Akslar 1-5: adet=2, boy = plan_genislik, en = duvar_kal, yuk = hatil_yuk
Akslar 2-3-4: adet=3, boy = oda_derinligi, en = duvar_kal, yuk = hatil_yuk
```

#### 6. Tas Duvar (m3)
```
Akslar 1-5: adet=2, boy = plan_genislik, en = duvar_kal, yuk = tas_duvar_yuk
Akslar 2-3-4: adet=3, boy = oda_derinligi, en = duvar_kal, yuk = tas_duvar_yuk
```

#### 7. Blokaj - Doseme Alti Kirma Tas (m3)
```
A Dosemesi: adet=1, boy = oda_derinligi, en = oda_A_gen, yuk = blokaj_doseme_kalinligi
B Dosemesi: adet=1, boy = oda_derinligi, en = oda_B_gen, yuk = blokaj_doseme_kalinligi
```

### Rastgele Parametreler
| Parametre | Min | Max | Adim |
|---|---|---|---|
| Oda A genisligi | 3.00 | 6.00 | 0.50 |
| Oda B genisligi | 1.50 | 3.00 | 0.50 |
| Oda derinligi | 4.00 | 7.00 | 0.50 |
| Duvar kalinligi | 0.40 | 0.60 | 0.10 |
| Blokaj tasmasi (her tarafta) | 0.10 | 0.10 | sabit |
| Tesviye kalinligi | 0.05 | 0.05 | sabit |
| Betonarme temel yuksekligi | 0.20 | 0.30 | 0.05 |
| Tas duvar toplam yuksekligi | 1.00 | 1.50 | 0.25 |
| Hatil yuksekligi | 0.20 | 0.30 | 0.05 |
| Doseme grobeton kalinligi | 0.10 | 0.10 | sabit |
| Doseme blokaj kalinligi | 0.10 | 0.20 | 0.05 |

---

## Teknik Mimari

### Dosya Yapisi
```
metraj-ustasi/
├── index.html          # Ana sayfa, tum ekranlar
├── css/
│   └── style.css       # Modern UI (dark theme, glassmorphism)
├── js/
│   ├── app.js          # Oyun mantigi, ekran yonetimi, XP sistemi
│   ├── levels.js       # Soru ureteci + dogru cevap hesaplayici
│   └── drawing.js      # SVG kesit/plan cizim fonksiyonlari
├── .claude/
│   └── launch.json     # Preview server config
└── CLAUDE.md           # Bu dosya
```

### Teknoloji
- **Vanilla JS** — framework yok, hizli yuklenme
- **Modern CSS** — CSS Variables, Grid, Flexbox, transitions
- **SVG** — Parametrik kesit ve plan cizimleri
- **LocalStorage** — XP, rutbe, seri kaydi
- **Responsive** — Mobile-first tasarim

### UI Tasarim
- **Arka plan**: Koyu gradient (#0f172a → #1e293b)
- **Vurgu rengi**: Turuncu (#f97316)
- **Dogru cevap**: Yesil (#22c55e)
- **Yanlis cevap**: Kirmizi (#ef4444)
- **Uyari banner**: Sari (#eab308)
- **Kartlar**: Glassmorphism (yari saydam, backdrop-blur)
- **Font**: System font stack
- **Animasyonlar**: CSS transitions (300ms ease)

### Oyunlastirma
| Rutbe | XP Esigi | Rozet |
|---|---|---|
| Cirak | 0 | Cekic |
| Kalfa | 500 | Celik Cekic |
| Usta | 1500 | Vince |
| Basmuhendis | 3000 | Baret |

- Her dogru kalem: +10 XP
- Tam tur bonusu: +20 XP
- Seri bonusu (3+): x1.5 carpan
- Hiz bonusu (<60sn): +10 XP

### Cevap Toleransi
- Hacim hesaplarinda **±%2** tolerans kabul edilir
- Yuvarlamadan kaynakli kucuk farklar dogru sayilir

---

## Yayinlama
1. Git repo olustur: `git init`
2. GitHub'da "metraj-ustasi" reposu olustur
3. Push et
4. GitHub Pages aktif et (Settings → Pages → main branch → / root)
5. Link paylasimi: `https://[kullanici].github.io/metraj-ustasi/`

---

## Onemli Notlar

### YAPILMAMASI GEREKENLER
- Calisma payini 50 cm'den farkli bir deger yapma
- Seviye 2'de calisma payisiz soru uretme
- Serbest kazi ile ilgili icerik ekleme (sadece derin kazi)
- Ingilizce icerik ekleme (sadece Turkce)

### KODLAMA KURALLARI
- Tum degisken ve fonksiyon isimleri Ingilizce (kod icin)
- Tum kullanici arayuzu metinleri Turkce
- SVG cizimleri parametrik olmali (boyutlara gore otomatik olceklenmeli)
- Mobile-first: once telefon goruntusunu tasarla, sonra desktop uyarla
- Hesaplama fonksiyonlari levels.js icinde, UI mantigi app.js icinde
- Cizim fonksiyonlari drawing.js icinde — diger dosyalar SVG uretmemeli
