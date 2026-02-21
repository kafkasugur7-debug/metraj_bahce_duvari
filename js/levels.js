(function () {
  const WORKING_ALLOWANCE = 0.5;
  const BLOCKAJ_OVERHANG = 0.1;

  function randStep(min, max, step) {
    const count = Math.round((max - min) / step);
    const n = Math.floor(Math.random() * (count + 1));
    return Number((min + n * step).toFixed(2));
  }

  function volume(length, width, height) {
    return Number((length * width * height).toFixed(4));
  }

  function formatM(v) {
    return `${v.toFixed(2).replace('.', ',')} m`;
  }

  function formatCm(v) {
    const cm = Number((v * 100).toFixed(1));
    const text = Number.isInteger(cm) ? `${cm}` : cm.toFixed(1).replace('.', ',');
    return `${text} cm`;
  }

  function withMistakes(item, mistakes) {
    return Object.assign({}, item, { commonMistakes: mistakes });
  }

  function breakdownRow(name, adet, boy, en, yuk) {
    return {
      name,
      adet,
      boy: Number(boy.toFixed(3)),
      en: Number(en.toFixed(3)),
      yuk: Number(yuk.toFixed(3)),
      total: Number((adet * boy * en * yuk).toFixed(4))
    };
  }

  function level1() {
    const wallLength = randStep(8, 20, 0.5);
    const wallThickness = randStep(0.4, 0.6, 0.1);
    const hatilExtra = randStep(0.05, 0.1, 0.05);
    const hatilH = randStep(0.08, 0.15, 0.01);
    const somelExtra = randStep(0.1, 0.15, 0.05);
    const somelH = randStep(0.2, 0.3, 0.05);
    const stoneWallH = randStep(0.8, 1.2, 0.1);
    const stoneWallBelow = randStep(0.15, 0.25, 0.05);

    const hasAllowance = Math.random() < 0.5;
    const allowance = hasAllowance ? WORKING_ALLOWANCE : 0;
    const somelW = Number((wallThickness + 2 * somelExtra).toFixed(2));
    const hatilW = Number((wallThickness + 2 * hatilExtra).toFixed(2));
    const excavationW = Number((somelW + 2 * allowance).toFixed(2));
    const excavationDepth = Number((0.05 + somelH + stoneWallBelow).toFixed(2));

    const excavationCorrect = volume(wallLength, excavationW, excavationDepth);
    const tesviyeCorrect = volume(wallLength, excavationW, 0.05);
    const somelCorrect = volume(wallLength, somelW, somelH);
    const stoneCorrect = volume(wallLength, wallThickness, stoneWallH);
    const hatilCorrect = volume(wallLength, hatilW, hatilH);

    const wrongAllowanceW = hasAllowance
      ? somelW
      : Number((somelW + 2 * WORKING_ALLOWANCE).toFixed(2));

    const excavationSteps = hasAllowance
      ? [
          'Kalıp yapılacağı için çalışma payı (50 cm) eklenir.',
          'Kazı genişliği = sömel genişliği + 2 x 0.50.',
          'Kazı derinliği = 0.05 + sömel yüksekliği + taş duvar yeraltı kısmı.',
          'Hacim = L x genişlik x derinlik.'
        ]
      : [
          'Kalıp yapılmayacağı için çalışma payı yoktur.',
          'Kazı genişliği = sömel genişliği.',
          'Kazı derinliği = 0.05 + sömel yüksekliği + taş duvar yeraltı kısmı.',
          'Hacim = L x genişlik x derinlik.'
        ];

    const excavationMistakeLabel = hasAllowance
      ? 'Çalışma payı eklenmemiş olabilir.'
      : 'Kazıya çalışma payı eklemiş olabilirsin.';

    const tesviyeSteps = hasAllowance
      ? [
          'Tesviye genişliği kazı genişliği ile aynıdır (çalışma payı dahil).',
          'Kalınlık sabit 0.05 m alınır.',
          'Hacim = L x genişlik x 0.05.'
        ]
      : [
          'Tesviye genişliği kazı genişliği ile aynıdır.',
          'Kalınlık sabit 0.05 m alınır.',
          'Hacim = L x genişlik x 0.05.'
        ];

    const items = [
      withMistakes(
        {
          key: 'excavation',
          label: 'Kazı Hacmi',
          unit: 'm3',
          formula: hasAllowance
            ? 'L x (sömel_gen + 2×0.50) x kazı_derinliği'
            : 'L x sömel_genişliği x kazı_derinliği',
          steps: excavationSteps,
          stepInputs: [
            { id: 'kazi_gen', label: 'Kazı genişliği', unit: 'm', value: excavationW },
            { id: 'kazi_der', label: 'Kazı derinliği', unit: 'm', value: excavationDepth }
          ],
          breakdown: [breakdownRow(hasAllowance ? 'Kazı (50 cm çalışma payı)' : 'Kazı', 1, wallLength, excavationW, excavationDepth)],
          correct: excavationCorrect
        },
        [
          { label: excavationMistakeLabel, value: volume(wallLength, wrongAllowanceW, excavationDepth) },
          { label: 'Kazı derinliğinde taş duvar yeraltı kısmı atlanmış olabilir.', value: volume(wallLength, excavationW, Number((0.05 + somelH).toFixed(2))) }
        ]
      ),
      withMistakes(
        {
          key: 'tesviye',
          label: 'Tesviye Betonu Hacmi',
          unit: 'm3',
          formula: hasAllowance
            ? 'L x (sömel_gen + 2×0.50) x 0.05'
            : 'L x sömel_genişliği x 0.05',
          steps: tesviyeSteps,
          stepInputs: [{ id: 'tes_gen', label: 'Tesviye genişliği', unit: 'm', value: excavationW }],
          breakdown: [breakdownRow(hasAllowance ? 'Tesviye 150 doz (50 cm çalışma payı)' : 'Tesviye 150 doz', 1, wallLength, excavationW, 0.05)],
          correct: tesviyeCorrect
        },
        [{ label: 'Tesviye genişliği için sömel yerine farklı bir en kullanılmış olabilir.', value: volume(wallLength, wallThickness, 0.05) }]
      ),
      withMistakes(
        {
          key: 'somel',
          label: 'Sömel Hacmi',
          unit: 'm3',
          formula: 'L x sömel_genişliği x sömel_yüksekliği',
          steps: [
            'Sömelde çalışma payı yoktur.',
            'Sömel genişliği duvar + iki yandaki fazlalıklardır.',
            'Hacim = L x sömel_genişliği x sömel_yüksekliği.'
          ],
          stepInputs: [
            { id: 'somel_gen', label: 'Sömel genişliği', unit: 'm', value: somelW },
            { id: 'somel_yuk', label: 'Sömel yüksekliği', unit: 'm', value: somelH }
          ],
          breakdown: [breakdownRow('Sömel', 1, wallLength, somelW, somelH)],
          correct: somelCorrect
        },
        [{ label: 'Sömelde kazı genişliği kullanılmış olabilir.', value: volume(wallLength, excavationW, somelH) }]
      ),
      withMistakes(
        {
          key: 'stoneWall',
          label: 'Taş Duvar Hacmi',
          unit: 'm3',
          formula: 'L x duvar_kalınlığı x taş_duvar_yüksekliği',
          steps: [
            'Taş duvarda duvar kalınlığı kullanılır.',
            'Yükseklik toplam taş duvar yüksekliğidir.',
            'Hacim = L x duvar_kalınlığı x taş_duvar_yüksekliği.'
          ],
          stepInputs: [
            { id: 'duvar_kal', label: 'Duvar kalınlığı', unit: 'm', value: wallThickness },
            { id: 'tas_yuk', label: 'Taş duvar yüksekliği', unit: 'm', value: stoneWallH }
          ],
          breakdown: [breakdownRow('Taş duvar', 1, wallLength, wallThickness, stoneWallH)],
          correct: stoneCorrect
        },
        [{ label: 'Duvar kalınlığı yerine sömel genişliği kullanılmış olabilir.', value: volume(wallLength, somelW, stoneWallH) }]
      ),
      withMistakes(
        {
          key: 'hatil',
          label: 'Hatıl Hacmi',
          unit: 'm3',
          formula: 'L x hatıl_genişliği x hatıl_yüksekliği',
          steps: [
            'Hatıl genişliği duvar + iki yandaki hatıl fazlalığıdır.',
            'Hatılda çalışma payı yoktur.',
            'Hacim = L x hatıl_genişliği x hatıl_yüksekliği.'
          ],
          stepInputs: [
            { id: 'hatil_gen', label: 'Hatıl genişliği', unit: 'm', value: hatilW },
            { id: 'hatil_yuk', label: 'Hatıl yüksekliği', unit: 'm', value: hatilH }
          ],
          breakdown: [breakdownRow('Hatıl', 1, wallLength, hatilW, hatilH)],
          correct: hatilCorrect
        },
        [{ label: 'Hatılda duvar kalınlığı kullanılmış olabilir.', value: volume(wallLength, wallThickness, hatilH) }]
      )
    ];

    return {
      level: 1,
      title: 'Seviye 1 - Bahçe Duvarı',
      text: hasAllowance ? 'Kalıp yapılacaktır.' : 'Kalıp yapılmayacaktır.',
      meta: [
        `Duvar boyu: ${formatM(wallLength)}`,
        `Duvar kalınlığı: ${formatCm(wallThickness)}`,
        `Sömel genişliği: ${formatCm(somelW)}`,
        `Sömel yüksekliği: ${formatCm(somelH)}`,
        `Taş duvar toplam yüksekliği: ${formatCm(stoneWallH)}`,
        `Taş duvar yeraltı kısmı: ${formatCm(stoneWallBelow)}`,
        `Hatıl genişliği: ${formatCm(hatilW)}`,
        `Hatıl yüksekliği: ${formatCm(hatilH)}`,
        'Temel altı grobeton kalınlığı: 5 cm'
      ],
      items,
      drawingData: {
        kind: 'section',
        wallThickness,
        wallLength,
        somelW,
        somelH,
        stoneWallH,
        stoneWallBelow,
        hatilW,
        hatilH,
        excavationW,
        excavationDepth,
        allowance
      }
    };
  }

  function level2() {
    const roomA = randStep(3, 6, 0.5);
    const roomB = randStep(1.5, 3, 0.5);
    const roomDepth = randStep(4, 7, 0.5);
    const wallThickness = randStep(0.4, 0.6, 0.1);
    const foundationH = randStep(0.2, 0.3, 0.05);
    const stoneWallH = randStep(1, 1.5, 0.25);
    const hatilH = randStep(0.2, 0.3, 0.05);
    const slabBlockageH = randStep(0.1, 0.2, 0.05);
    const stoneWallBelow = randStep(0.15, 0.25, 0.05);

    const blokajW = Number((wallThickness + 2 * BLOCKAJ_OVERHANG).toFixed(2));
    const planWidth = Number((wallThickness + roomA + wallThickness + roomB + wallThickness).toFixed(2));
    const planDepth = Number((wallThickness + roomDepth + wallThickness).toFixed(2));
    const outerBlokajW = Number((planWidth + 2 * BLOCKAJ_OVERHANG).toFixed(2));
    const outerBlokajD = Number((planDepth + 2 * BLOCKAJ_OVERHANG).toFixed(2));

    const horizLenBlokaj = outerBlokajW;
    const vertLenBlokaj = Number((outerBlokajD - 2 * blokajW).toFixed(2));

    const excavationDepth = Number((0.05 + foundationH + stoneWallBelow).toFixed(2));
    const excW = Number((blokajW + 2 * WORKING_ALLOWANCE).toFixed(2));
    const excLenH = Number((outerBlokajW + 2 * WORKING_ALLOWANCE).toFixed(2));
    const excOuterD = Number((outerBlokajD + 2 * WORKING_ALLOWANCE).toFixed(2));
    const excLenV = Number((excOuterD - 2 * excW).toFixed(2));

    const excavationRow1 = breakdownRow('Sürekli temel 1-5 (50 cm çalışma payı)', 2, excLenH, excW, excavationDepth);
    const excavationRow2 = breakdownRow('Sürekli temel 2-3-4 (50 cm çalışma payı)', 3, excLenV, excW, excavationDepth);
    const excavationCorrect = Number((excavationRow1.total + excavationRow2.total).toFixed(4));

    const g150Row1 = breakdownRow('Sürekli temel 1-5', 2, horizLenBlokaj, blokajW, 0.05);
    const g150Row2 = breakdownRow('Sürekli temel 2-3-4', 3, vertLenBlokaj, blokajW, 0.05);
    const tesviyeCorrect = Number((g150Row1.total + g150Row2.total).toFixed(4));

    const g200RowA = breakdownRow('A Döşemesi', 1, roomDepth, roomA, 0.10);
    const g200RowB = breakdownRow('B Döşemesi', 1, roomDepth, roomB, 0.10);
    const dosemeCorrect = Number((g200RowA.total + g200RowB.total).toFixed(4));

    const c25TemelRow1 = breakdownRow('Sürekli temel 1-5', 2, horizLenBlokaj, blokajW, foundationH);
    const c25TemelRow2 = breakdownRow('Sürekli temel 2-3-4', 3, vertLenBlokaj, blokajW, foundationH);
    const foundationCorrect = Number((c25TemelRow1.total + c25TemelRow2.total).toFixed(4));

    const c25HatilRow1 = breakdownRow('Sürekli temel 1-5', 2, planWidth, wallThickness, hatilH);
    const c25HatilRow2 = breakdownRow('Sürekli temel 2-3-4', 3, roomDepth, wallThickness, hatilH);
    const hatilCorrect = Number((c25HatilRow1.total + c25HatilRow2.total).toFixed(4));

    const stoneRow1 = breakdownRow('Sürekli temel 1-5', 2, planWidth, wallThickness, stoneWallH);
    const stoneRow2 = breakdownRow('Sürekli temel 2-3-4', 3, roomDepth, wallThickness, stoneWallH);
    const stoneCorrect = Number((stoneRow1.total + stoneRow2.total).toFixed(4));

    const blokajRowA = breakdownRow('A Döşemesi', 1, roomDepth, roomA, slabBlockageH);
    const blokajRowB = breakdownRow('B Döşemesi', 1, roomDepth, roomB, slabBlockageH);
    const slabBlockageCorrect = Number((blokajRowA.total + blokajRowB.total).toFixed(4));

    const items = [
      withMistakes(
        {
          key: 'excavation',
          label: 'Kazı Hacmi',
          unit: 'm3',
          formula: '2 x (Sürekli temel 1-5) + 3 x (Sürekli temel 2-3-4)',
          steps: [
            'Sürekli temel 1-5 satırı için boy, en ve yükseklik alınır.',
            'Sürekli temel 2-3-4 satırı için boy, en ve yükseklik alınır.',
            'İki satır toplamı kazı hacmidir.'
          ],
          stepInputs: [
            { id: 'kazi_len15', label: '1-5 boyu', unit: 'm', value: excLenH },
            { id: 'kazi_len234', label: '2-3-4 boyu', unit: 'm', value: excLenV },
            { id: 'kazi_der', label: 'Kazı derinliği', unit: 'm', value: excavationDepth }
          ],
          breakdown: [excavationRow1, excavationRow2],
          correct: excavationCorrect
        },
        [
          { label: '2-3-4 boyunu yanlış almış olabilirsin.', value: Number((2 * volume(excLenH, excW, excavationDepth) + 3 * volume(vertLenBlokaj, excW, excavationDepth)).toFixed(4)) },
          { label: 'Kazı derinliğinde yeraltı taş duvar kısmı eksik olabilir.', value: Number((2 * volume(excLenH, excW, (0.05 + foundationH)) + 3 * volume(excLenV, excW, (0.05 + foundationH))).toFixed(4)) }
        ]
      ),
      withMistakes(
        {
          key: 'tesviye150',
          label: 'Grobeton 150 Doz (Tesviye)',
          unit: 'm3',
          formula: 'Sürekli temel 1-5 + Sürekli temel 2-3-4',
          steps: ['İki sürekli temel satırı ayrı hesaplanır.', 'Satır toplamları toplanır.'],
          stepInputs: [
            { id: 'dusey_boy', label: '2-3-4 boyu', unit: 'm', value: vertLenBlokaj },
            { id: 'blokaj_gen', label: 'Blokaj genişliği', unit: 'm', value: blokajW }
          ],
          breakdown: [g150Row1, g150Row2],
          correct: tesviyeCorrect
        },
        []
      ),
      withMistakes(
        {
          key: 'doseme200',
          label: 'Grobeton 200 Doz (Döşeme)',
          unit: 'm3',
          formula: 'A Döşemesi + B Döşemesi',
          steps: ['A ve B döşeme satırları ayrı hesaplanır.', 'Satırlar toplanır.'],
          stepInputs: [
            { id: 'a_alan', label: 'A döşeme alanı', unit: 'm2', value: Number((roomDepth * roomA).toFixed(4)) },
            { id: 'b_alan', label: 'B döşeme alanı', unit: 'm2', value: Number((roomDepth * roomB).toFixed(4)) }
          ],
          breakdown: [g200RowA, g200RowB],
          correct: dosemeCorrect
        },
        []
      ),
      withMistakes(
        {
          key: 'foundationC25',
          label: 'Beton C25 (Temel Altı)',
          unit: 'm3',
          formula: 'Sürekli temel 1-5 + Sürekli temel 2-3-4',
          steps: ['İki sürekli temel satırı ayrı hesaplanır.', 'Satır toplamları toplanır.'],
          stepInputs: [{ id: 'temel_yuk', label: 'Temel altı C25 yüksekliği', unit: 'm', value: foundationH }],
          breakdown: [c25TemelRow1, c25TemelRow2],
          correct: foundationCorrect
        },
        []
      ),
      withMistakes(
        {
          key: 'hatilC25',
          label: 'Beton C25 (Hatıl)',
          unit: 'm3',
          formula: 'Sürekli temel 1-5 + Sürekli temel 2-3-4',
          steps: ['İki sürekli temel satırı ayrı hesaplanır.', 'Satır toplamları toplanır.'],
          stepInputs: [
            { id: 'hatil_yuk', label: 'Hatıl yüksekliği', unit: 'm', value: hatilH },
            { id: 'duvar_kal', label: 'Duvar kalınlığı', unit: 'm', value: wallThickness }
          ],
          breakdown: [c25HatilRow1, c25HatilRow2],
          correct: hatilCorrect
        },
        []
      ),
      withMistakes(
        {
          key: 'stoneWall',
          label: 'Taş Duvar Hacmi',
          unit: 'm3',
          formula: 'Sürekli temel 1-5 + Sürekli temel 2-3-4',
          steps: ['İki sürekli temel satırı ayrı hesaplanır.', 'Satır toplamları toplanır.'],
          stepInputs: [
            { id: 'tas_yuk', label: 'Taş duvar yüksekliği', unit: 'm', value: stoneWallH },
            { id: 'duvar_kal', label: 'Duvar kalınlığı', unit: 'm', value: wallThickness }
          ],
          breakdown: [stoneRow1, stoneRow2],
          correct: stoneCorrect
        },
        []
      ),
      withMistakes(
        {
          key: 'slabBlockage',
          label: 'Blokaj (Döşeme Altı Kırma Taş)',
          unit: 'm3',
          formula: 'A Döşemesi + B Döşemesi',
          steps: ['A ve B döşeme satırları ayrı hesaplanır.', 'Satırlar toplanır.'],
          stepInputs: [{ id: 'blokaj_kal', label: 'Döşeme blokaj kalınlığı', unit: 'm', value: slabBlockageH }],
          breakdown: [blokajRowA, blokajRowB],
          correct: slabBlockageCorrect
        },
        []
      )
    ];

    return {
      level: 2,
      title: 'Seviye 2 - Taş Temel Planı',
      text: 'Taş temel planı metrajlarını hesapla.',
      meta: [
        `Oda A genişliği: ${formatCm(roomA)}`,
        `Oda B genişliği: ${formatCm(roomB)}`,
        `Oda derinliği: ${formatCm(roomDepth)}`,
        `Duvar kalınlığı: ${formatCm(wallThickness)}`,
        `Blokaj genişliği: ${formatCm(blokajW)}`,
        `Temel altı C25 yüksekliği: ${formatCm(foundationH)}`,
        `Taş duvar yüksekliği: ${formatCm(stoneWallH)}`,
        `Taş duvar yeraltı kısmı: ${formatCm(stoneWallBelow)}`,
        `Hatıl yüksekliği: ${formatCm(hatilH)}`,
        'Döşeme grobeton kalınlığı: 10 cm',
        'Temel altı grobeton kalınlığı: 5 cm',
        `Döşeme blokaj kalınlığı: ${formatCm(slabBlockageH)}`
      ],
      items,
      drawingData: {
        kind: 'plan',
        roomA,
        roomB,
        roomDepth,
        wallThickness,
        planWidth,
        planDepth,
        blokajW,
        outerBlokajW,
        outerBlokajD
      }
    };
  }

  window.MetrajLevels = {
    generate(level) {
      return level === '2' ? level2() : level1();
    }
  };
})();
