# Dilbilim Pusulası

Dilbilim Pusulası tarayıcıda 20 önermeyi puanlar; cevaplar sunucuya gönderilmez.

## Dosyalar

- `lib/pusula/questions-tr.json`: Türkçe sorular ve A/B ekseni/ters puanlama alanları.
- `lib/pusula/questions-en.json`: Aynı kimliklerle İngilizce çeviriler.
- `lib/pusula/results.json`: Ana ve Türkçe dilbilimci setleri ile TR/EN sonuç metinleri.
- `lib/pusula/score.ts`: Puanlama ve kare/katman eşleştirme fonksiyonları.
- `components/pusula-tool-spec.tsx`: Tanıtım, test, klavye erişimi, sonuç ve paylaşım ekranı.
- `scripts/pusula-simulate.mjs`: 10.000 rastgele cevap simülasyonu.

## Çalıştırma

```
pnpm dev
```

Sayfa: `/pusula`

## Test ve simülasyon

```
node --experimental-strip-types --test lib/pusula/score.test.ts
node scripts/pusula-simulate.mjs
```

## Yeni önerme ekleme

Soruları `questions-tr.json` ve `questions-en.json` dosyalarında aynı `id`, `axis` ve `reverse` değerleriyle ekleyin veya değiştirin. Varsayılan puanlama her eksende 10 soru varsayar. Soruları değiştirmek puanlama aralığını etkiliyorsa `score.ts` içindeki `30` merkez noktası ve kabul aralıkları yeniden gözden geçirilmelidir.

## Yeni sonuç seti ekleme

`results.json` dosyasına ana/alternatif set yapısına uygun dört kare ve uç/A/B/dengeli anahtarlarını ekleyin. Sonra `PusulaToolSpec` içindeki set seçimini ve `mergeSet` kurallarını güncelleyin.

## Varsayım

Ana set için B baskınların Kaşif ve Gözlemci karelerinde dengeli merge uygulanır. Türkçe set için B baskınların Düşünür ve Gözlemci karelerinde dengeli merge uygulanır.
