# Makallakap — Veri İçe Aktarma Raporu (Word → Uygulama)

Kaynak dosya: **KIRGIZ ATASÖZLERİ VE TÜRKÇE ANLAMLARI.docx**
Hedef: `frontend/src/data/proverbs.json` (uygulama içinde paketli, tamamen çevrimdışı)

## Doğrulanmış Sonuçlar

- **Bulunan atasözü kaydı: 3513**
- **Başarıyla içe aktarılan: 3512**
- **Tespit edilen tekrar (duplicate): 1** → `"Irıs aldı, ıntımak."` (yinelenen kayıt atlandı, oluşturulmadı)
- **Okunamayan kayıt: 0**
- **Eksik kayıt (atasözü metni olmayan): 0**
- **Tüm içe aktarılan kayıtlar aranabilir: Evet** (proverb + Türkçe anlam + açıklama üzerinde, Türkçe karaktere duyarsız arama)
- **Uygulama başarıyla derleniyor: Evet**
- **Ana özellikler çalışıyor: Evet** (E2E test ile doğrulandı)

## Ayrıştırma (Parsing) Yöntemi

Word belgesi düz paragraflardan oluşuyor (tablo yok). Her atasözü girdisi **kalın (bold)** Kırgızca başlık satırıyla başlıyor; ardından gelen normal satırlar o girdiye ait:
- 1. satır → **Anlamı** (Türkçe karşılık/çeviri)
- Sonraki satırlar → **Açıklaması** (Türkçe açıklama, ilgili atasözleri, notlar)

Orijinal atasözü metni, anlamı ve açıklaması **değiştirilmeden** korunmuştur. Türkçe/özel karakterler (ç, ğ, ı, İ, ö, ş, ü, ñ) korunmuştur.

## Veri Yapısı

```
{ id, proverb, meaning, explanation, firstLetter, categories[] }
```
Diğer alanlar (example, story, similarProverbs, oppositeProverbs, usageSituations, translations) kaynak belgede bulunmadığından **oluşturulmadı**; mimari ileride doldurulabilecek şekilde hazır.

## Kategoriler (Otomatik Türetilmiş)

Kaynak belgede kategori bilgisi **yoktur**. Kategoriler RASTGELE atanmamış; Türkçe anlam/açıklama metnindeki anahtar kelimelerden **deterministik** olarak türetilmiştir. Eşleşmeyen 1953 kayıt kategorisizdir (yine de A-Z ve arama ile erişilebilir). Kategori mimarisi, ileride manuel/elle düzenleme için hazırdır.

Kategori dağılımı: Hayvanlar 331, Aile 251, Akıl 156, Zenginlik 125, Doğa 124, Çalışma 99, Hayat 93, Düşmanlık 88, Cesaret 85, Fakirlik 80, Zaman 77, Dostluk 73, Sağlık 70, İnsan İlişkileri 67, Eğitim 66, Adalet 59, Aşk 57, Para 49, Tecrübe 36, Arkadaşlık 27, Başarı 18, Sabır 11.

## İlk Harf Dağılımı (A-Z, Türkçe sıralı)

A 834, B 386, C 363, Ç 64, D 83, E 623, G 4, H 8, I 96, İ 56, K 414, M 83, N 10, O 56, Ö 55, P 2, S 102, Ş 9, T 108, U 87, Ü 41, V 1, Z 27.
