(function () {
  function sectionSVG(data) {
    const w = 880;
    const h = 340;
    const pad = 48;

    const drawW = w - pad * 2;
    const drawH = h - pad * 2;

    const maxSectionW = Math.max(data.excavationW, data.hatilW);
    const totalH = data.excavationDepth + data.stoneWallH + data.hatilH;

    const sx = drawW / maxSectionW;
    const sy = drawH / totalH;
    const s = Math.min(sx, sy);

    const baseY = h - pad;
    const centerX = w / 2;

    const excavationW = data.excavationW * s;
    const excavationH = data.excavationDepth * s;
    const tesviyeH = 0.05 * s;
    const somelW = data.somelW * s;
    const somelH = data.somelH * s;
    const wallW = data.wallThickness * s;
    const wallH = data.stoneWallH * s;
    const hatilW = data.hatilW * s;
    const hatilH = data.hatilH * s;

    const excX = centerX - excavationW / 2;
    const excY = baseY - excavationH;

    const somelX = centerX - somelW / 2;
    const somelY = baseY - tesviyeH - somelH;

    const wallX = centerX - wallW / 2;
    const wallY = somelY - wallH;

    const hatilX = centerX - hatilW / 2;
    const hatilY = wallY - hatilH;

    return `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="290" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#172554"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#g1)" rx="12"/>
        <line x1="${pad}" y1="${baseY}" x2="${w - pad}" y2="${baseY}" stroke="#94a3b8" stroke-width="2"/>

        <rect x="${excX}" y="${excY}" width="${excavationW}" height="${excavationH}" fill="#334155" stroke="#94a3b8"/>
        <rect x="${excX}" y="${baseY - tesviyeH}" width="${excavationW}" height="${tesviyeH}" fill="#f59e0b"/>
        <rect x="${somelX}" y="${somelY}" width="${somelW}" height="${somelH}" fill="#38bdf8"/>
        <rect x="${wallX}" y="${wallY}" width="${wallW}" height="${wallH}" fill="#a78bfa"/>
        <rect x="${hatilX}" y="${hatilY}" width="${hatilW}" height="${hatilH}" fill="#34d399"/>

        <text x="20" y="28" fill="#e2e8f0" font-size="14">Kesit (oranlı şematik)</text>
        <text x="20" y="48" fill="#cbd5e1" font-size="12">Duvar boyu: ${data.wallLength.toFixed(2)} m</text>
      </svg>
    `;
  }

  function planSVG(data) {
    const w = 880;
    const h = 340;
    const pad = 36;

    const sx = (w - 2 * pad) / data.outerBlokajW;
    const sy = (h - 2 * pad) / data.outerBlokajD;
    const s = Math.min(sx, sy);

    const outerW = data.outerBlokajW * s;
    const outerH = data.outerBlokajD * s;
    const x = (w - outerW) / 2;
    const y = (h - outerH) / 2;

    const wall = data.wallThickness * s;
    const blockaj = data.blokajW * s;

    const planW = data.planWidth * s;
    const planH = data.planDepth * s;
    const planX = x + (outerW - planW) / 2;
    const planY = y + (outerH - planH) / 2;

    const roomA = data.roomA * s;
    const roomB = data.roomB * s;
    const roomD = data.roomDepth * s;

    const innerX = planX + wall;
    const innerY = planY + wall;
    const splitX = innerX + roomA + wall;

    return `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="290" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0b1324"/>
            <stop offset="100%" stop-color="#13233d"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#g2)" rx="12"/>

        <rect x="${x}" y="${y}" width="${outerW}" height="${outerH}" fill="#1f2937" stroke="#94a3b8"/>
        <rect x="${planX}" y="${planY}" width="${planW}" height="${planH}" fill="none" stroke="#f59e0b" stroke-width="2"/>

        <rect x="${innerX}" y="${innerY}" width="${roomA}" height="${roomD}" fill="#0ea5e9" opacity="0.7"/>
        <rect x="${splitX}" y="${innerY}" width="${roomB}" height="${roomD}" fill="#06b6d4" opacity="0.7"/>

        <text x="20" y="28" fill="#e2e8f0" font-size="14">Plan (oranlı şematik)</text>
        <text x="20" y="48" fill="#cbd5e1" font-size="12">Blokaj gen.: ${(data.blokajW * 100).toFixed(0)} cm</text>
        <text x="${innerX + roomA / 2 - 12}" y="${innerY + roomD / 2}" fill="#e2e8f0" font-size="16">A</text>
        <text x="${splitX + roomB / 2 - 12}" y="${innerY + roomD / 2}" fill="#e2e8f0" font-size="16">B</text>
      </svg>
    `;
  }

  window.MetrajDrawing = {
    render(host, data) {
      host.innerHTML = data.kind === 'plan' ? planSVG(data) : sectionSVG(data);
    }
  };
})();
