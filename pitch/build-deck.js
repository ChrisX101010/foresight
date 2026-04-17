// ─────────────────────────────────────────────────────────────────────
// Foresight pitch deck — 11 slides.
//
// Visual direction: mirrors the app. Near-black background (0A0B0F),
// plasma-lime accent (C6FF3D), chalk body text (F4F1EA), fog for
// secondary text (8A8FA8). Serif headlines, sans body. Heavy use of
// monospace mono labels for data, stats, and section markers.
// ─────────────────────────────────────────────────────────────────────

const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.3" × 7.5"
pres.title = 'Foresight — Solana Frontier Hackathon';
pres.author = 'Foresight';

// Palette
const INK = '0A0B0F';
const INK_CARD = '171A26';
const INK_BORDER = '2A2F45';
const PLASMA = 'C6FF3D';
const CHALK = 'F4F1EA';
const FOG = '8A8FA8';
const EMERALD = '34D399';
const ROSE = 'FB7185';

// Typography
const DISPLAY = 'Georgia';
const BODY = 'Calibri';
const MONO = 'Consolas';

// ─── Helpers ─────────────────────────────────────────────────────────

function darkBg(slide) {
  slide.background = { color: INK };
}

function sectionMarker(slide, text, x = 0.5, y = 0.35) {
  slide.addText(text, {
    x, y, w: 6, h: 0.3,
    fontSize: 10, fontFace: MONO, color: PLASMA,
    charSpacing: 4, margin: 0,
  });
}

function pageFooter(slide, pageNum) {
  slide.addText('FORESIGHT', {
    x: 0.5, y: 7.1, w: 3, h: 0.3,
    fontSize: 9, fontFace: MONO, color: FOG, charSpacing: 4, margin: 0,
  });
  slide.addText(`${pageNum} / 11`, {
    x: 12.3, y: 7.1, w: 0.6, h: 0.3,
    fontSize: 9, fontFace: MONO, color: FOG, align: 'right', margin: 0,
  });
}

// ─── Slide 1 — Cover ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);

  // Background grid — decorative, subtle
  for (let i = 0; i < 14; i++) {
    s.addShape(pres.shapes.LINE, {
      x: i * 0.95, y: 0, w: 0, h: 7.5,
      line: { color: INK_BORDER, width: 0.5 },
    });
  }
  for (let i = 0; i < 8; i++) {
    s.addShape(pres.shapes.LINE, {
      x: 0, y: i * 0.94, w: 13.3, h: 0,
      line: { color: INK_BORDER, width: 0.5 },
    });
  }

  s.addText('BUILT WITH EITHERWAY · SOLANA FRONTIER HACKATHON · 2026', {
    x: 0.8, y: 0.6, w: 12, h: 0.35,
    fontSize: 11, fontFace: MONO, color: PLASMA, charSpacing: 6, margin: 0,
  });

  s.addText('Foresight.', {
    x: 0.7, y: 1.7, w: 12, h: 2.4,
    fontSize: 124, fontFace: DISPLAY, color: CHALK, bold: false, margin: 0,
  });

  s.addText([
    { text: 'Earn yield ', options: { color: CHALK } },
    { text: 'while you wait ', options: { color: PLASMA, italic: true } },
    { text: 'for the future.', options: { color: CHALK } },
  ], {
    x: 0.8, y: 4.3, w: 12, h: 0.9,
    fontSize: 38, fontFace: DISPLAY, margin: 0,
  });

  s.addText(
    'The first composable layer on top of tokenized prediction markets on Solana.',
    { x: 0.8, y: 5.4, w: 10, h: 0.5, fontSize: 16, fontFace: BODY, color: FOG, margin: 0 }
  );

  // Bottom sponsor row
  s.addShape(pres.shapes.LINE, {
    x: 0.8, y: 6.5, w: 11.7, h: 0,
    line: { color: INK_BORDER, width: 1 },
  });
  s.addText('POWERED BY', {
    x: 0.8, y: 6.7, w: 2, h: 0.3,
    fontSize: 9, fontFace: MONO, color: FOG, charSpacing: 4, margin: 0,
  });
  s.addText('DFlow · Kamino · Solflare · QuickNode · Eitherway', {
    x: 3, y: 6.7, w: 9.5, h: 0.3,
    fontSize: 12, fontFace: DISPLAY, italic: true, color: CHALK, margin: 0,
  });
}

// ─── Slide 2 — The opening ───────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  sectionMarker(s, '/01  THE OPENING');
  pageFooter(s, 2);

  s.addText('On December 1, 2025,', {
    x: 0.8, y: 1.1, w: 12, h: 0.7,
    fontSize: 28, fontFace: DISPLAY, color: CHALK, margin: 0,
  });

  s.addText('DFlow tokenized every Kalshi market as a real SPL token on Solana.', {
    x: 0.8, y: 1.95, w: 12, h: 2.0,
    fontSize: 44, fontFace: DISPLAY, color: PLASMA, italic: true, margin: 0,
  });

  s.addText([
    {
      text: 'That means every "Will Bitcoin close above $100K by year-end?" is now just ',
      options: { color: CHALK },
    },
    {
      text: 'a token',
      options: { color: PLASMA, italic: true },
    },
    {
      text: '. It can be transferred. It can be lent against. It can be LP\'d. It can sit in a vault.',
      options: { color: CHALK },
    },
  ], { x: 0.8, y: 4.15, w: 12, h: 1.3, fontSize: 18, fontFace: BODY, margin: 0 });

  // Stat row
  const statCardY = 5.7;
  const stats = [
    ['$33B+', 'DFlow volume since Apr 2025'],
    ['$34M', 'Paid out to app developers'],
    ['$2M', 'Kalshi grants program'],
    ['100+', 'Integrations lined up'],
  ];
  stats.forEach(([big, small], i) => {
    const x = 0.8 + i * 3.1;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: statCardY, w: 2.85, h: 1.2,
      fill: { color: INK_CARD },
      line: { color: INK_BORDER, width: 1 },
    });
    s.addText(big, {
      x: x + 0.15, y: statCardY + 0.1, w: 2.6, h: 0.6,
      fontSize: 36, fontFace: DISPLAY, color: PLASMA, margin: 0,
    });
    s.addText(small, {
      x: x + 0.15, y: statCardY + 0.75, w: 2.6, h: 0.4,
      fontSize: 10, fontFace: MONO, color: FOG, charSpacing: 2, margin: 0,
    });
  });
}

// ─── Slide 3 — The gap ───────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  sectionMarker(s, '/02  THE GAP');
  pageFooter(s, 3);

  s.addText('Nobody has built', {
    x: 0.8, y: 1.1, w: 12, h: 0.9, fontSize: 46, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText('composability on top of it yet.', {
    x: 0.8, y: 2.15, w: 12, h: 1.1, fontSize: 54, fontFace: DISPLAY, italic: true, color: PLASMA, margin: 0,
  });

  s.addText(
    'Every app currently using the DFlow Prediction Markets API is a frontend for buying and selling outcome tokens. That\'s useful — but it\'s not composition. It\'s just a nicer Kalshi.',
    {
      x: 0.8, y: 3.7, w: 11.5, h: 1.1,
      fontSize: 18, fontFace: BODY, color: FOG, margin: 0,
    }
  );

  // The "missing layer" illustration
  const boxY = 5.1;
  const boxes = [
    ['Kalshi', 'regulated off-chain', FOG],
    ['DFlow', 'tokenization layer', FOG],
    ['??????', 'the composable layer', PLASMA],
    ['User apps', 'bet with real SPL', FOG],
  ];
  boxes.forEach(([label, sub, color], i) => {
    const x = 0.8 + i * 3.1;
    const isMissing = i === 2;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: boxY, w: 2.85, h: 1.5,
      fill: { color: INK_CARD },
      line: {
        color: isMissing ? PLASMA : INK_BORDER,
        width: isMissing ? 2 : 1,
        dashType: isMissing ? 'dash' : 'solid',
      },
    });
    s.addText(label, {
      x: x + 0.2, y: boxY + 0.3, w: 2.5, h: 0.55,
      fontSize: 24, fontFace: DISPLAY, color, margin: 0,
    });
    s.addText(sub, {
      x: x + 0.2, y: boxY + 0.95, w: 2.5, h: 0.35,
      fontSize: 10, fontFace: MONO, color: FOG, charSpacing: 2, margin: 0,
    });
  });

  // Arrows between
  for (let i = 0; i < 3; i++) {
    const x = 3.65 + i * 3.1;
    s.addText('→', {
      x, y: boxY + 0.45, w: 0.5, h: 0.6,
      fontSize: 28, fontFace: BODY, color: FOG, margin: 0,
    });
  }
}

// ─── Slide 4 — The product ───────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  sectionMarker(s, '/03  THE PRODUCT');
  pageFooter(s, 4);

  s.addText('Foresight is a', {
    x: 0.8, y: 1.1, w: 12, h: 0.7, fontSize: 28, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText('prediction-market yield vault.', {
    x: 0.8, y: 1.9, w: 12, h: 1.3, fontSize: 58, fontFace: DISPLAY, italic: true, color: PLASMA, margin: 0,
  });
  s.addText(
    'One deposit. Two engines. The simplest possible composition.',
    { x: 0.8, y: 3.4, w: 12, h: 0.6, fontSize: 22, fontFace: BODY, color: FOG, margin: 0 }
  );

  // Two side-by-side legs
  const legY = 4.3;
  const legs = [
    {
      x: 0.8, w: 6.0,
      label: 'LEG 1 · PREDICTION',
      title: 'Outcome tokens',
      body: 'Part of your USDC buys Yes or No outcome tokens via DFlow. If you\'re right, redeem $1 per token at resolution.',
      sdk: 'DFlow Trade API',
      color: EMERALD,
    },
    {
      x: 7.3, w: 5.2,
      label: 'LEG 2 · YIELD',
      title: 'Idle capital, working',
      body: 'The remainder sweeps into Kamino\'s USDC Main Market, earning supply APY and reward emissions for the entire duration of the market.',
      sdk: 'Kamino klend-sdk',
      color: PLASMA,
    },
  ];

  legs.forEach((leg) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: leg.x, y: legY, w: leg.w, h: 2.6,
      fill: { color: INK_CARD },
      line: { color: INK_BORDER, width: 1 },
    });
    s.addText(leg.label, {
      x: leg.x + 0.3, y: legY + 0.2, w: leg.w - 0.6, h: 0.3,
      fontSize: 10, fontFace: MONO, color: leg.color, charSpacing: 4, margin: 0,
    });
    s.addText(leg.title, {
      x: leg.x + 0.3, y: legY + 0.55, w: leg.w - 0.6, h: 0.6,
      fontSize: 28, fontFace: DISPLAY, color: CHALK, margin: 0,
    });
    s.addText(leg.body, {
      x: leg.x + 0.3, y: legY + 1.2, w: leg.w - 0.6, h: 1.1,
      fontSize: 13, fontFace: BODY, color: FOG, margin: 0,
    });
    s.addText(leg.sdk, {
      x: leg.x + 0.3, y: legY + 2.25, w: leg.w - 0.6, h: 0.3,
      fontSize: 10, fontFace: MONO, color: PLASMA, charSpacing: 2, margin: 0,
    });
  });
}

// ─── Slide 5 — How it works ──────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  sectionMarker(s, '/04  HOW IT WORKS');
  pageFooter(s, 5);

  s.addText('One flow.', {
    x: 0.8, y: 1.0, w: 12, h: 0.9, fontSize: 48, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText('Three steps.', {
    x: 0.8, y: 1.95, w: 12, h: 1.0, fontSize: 48, fontFace: DISPLAY, italic: true, color: PLASMA, margin: 0,
  });

  const stepY = 3.3;
  const stepW = 4.0;
  const stepGap = 0.15;
  const steps = [
    {
      num: '01',
      title: 'Pick a market',
      body: 'Browse thousands of Kalshi markets — sports, politics, crypto, weather. Every Yes/No is a real SPL token.',
    },
    {
      num: '02',
      title: 'Split your deposit',
      body: 'One slider: how much into the prediction, how much into Kamino yield. See projected tokens + projected APY live.',
    },
    {
      num: '03',
      title: 'Sign, then wait',
      body: 'Two signatures, two transactions — one DFlow mint, one Kamino deposit. Your idle half compounds until resolution.',
    },
  ];

  steps.forEach((step, i) => {
    const x = 0.8 + i * (stepW + stepGap);
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: stepY, w: stepW, h: 3.3,
      fill: { color: INK_CARD },
      line: { color: INK_BORDER, width: 1 },
    });
    s.addText(step.num, {
      x: x + 0.3, y: stepY + 0.25, w: 2, h: 0.5,
      fontSize: 14, fontFace: MONO, color: PLASMA, charSpacing: 4, margin: 0,
    });
    s.addText(step.title, {
      x: x + 0.3, y: stepY + 0.8, w: stepW - 0.6, h: 0.8,
      fontSize: 28, fontFace: DISPLAY, color: CHALK, margin: 0,
    });
    s.addText(step.body, {
      x: x + 0.3, y: stepY + 1.8, w: stepW - 0.6, h: 1.3,
      fontSize: 13, fontFace: BODY, color: FOG, margin: 0,
    });
  });
}

// ─── Slide 6 — Why now ───────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  sectionMarker(s, '/05  WHY NOW');
  pageFooter(s, 6);

  s.addText('The window is', {
    x: 0.8, y: 1.1, w: 12, h: 0.9, fontSize: 42, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText('open for about six months.', {
    x: 0.8, y: 2.1, w: 12, h: 1.2, fontSize: 54, fontFace: DISPLAY, italic: true, color: PLASMA, margin: 0,
  });

  s.addText(
    'DFlow\'s Prediction Markets API shipped three months ago. Most of the 100+ integrations they announced are still in development. The first few products that nail composability will define the category — exactly like pump.fun and Jupiter did in their moments.',
    { x: 0.8, y: 3.8, w: 11.5, h: 1.5, fontSize: 18, fontFace: BODY, color: FOG, margin: 0 }
  );

  // Timeline — inset from both sides so endpoint labels don't clip
  const tlY = 5.6;
  const tlStart = 1.4;
  const tlEnd = 11.9;
  s.addShape(pres.shapes.LINE, {
    x: tlStart, y: tlY + 0.35, w: tlEnd - tlStart, h: 0,
    line: { color: INK_BORDER, width: 2 },
  });

  const tlPoints = [
    ['Dec 2025', 'DFlow API ships', PLASMA],
    ['Q1 2026', 'First wave', FOG],
    ['NOW', 'Foresight ships', PLASMA],
    ['Q3 2026', 'Category defined', FOG],
    ['2027+', 'Incumbents lock in', FOG],
  ];
  tlPoints.forEach(([date, label, color], i) => {
    const x = tlStart + (i * (tlEnd - tlStart)) / (tlPoints.length - 1);
    const isNow = i === 2;
    s.addShape(pres.shapes.OVAL, {
      x: x - 0.1, y: tlY + 0.25, w: 0.2, h: 0.2,
      fill: { color: isNow ? PLASMA : FOG },
      line: { color: INK, width: 0 },
    });
    s.addText(date, {
      x: x - 0.9, y: tlY - 0.2, w: 1.8, h: 0.3,
      fontSize: 10, fontFace: MONO, color, align: 'center', charSpacing: 2, margin: 0,
    });
    s.addText(label, {
      x: x - 1.1, y: tlY + 0.6, w: 2.2, h: 0.4,
      fontSize: 12, fontFace: DISPLAY, color: CHALK, italic: isNow, align: 'center', margin: 0,
    });
  });
}

// ─── Slide 7 — Competitive ───────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  sectionMarker(s, '/06  COMPETITIVE POSITION');
  pageFooter(s, 7);

  s.addText('We\'re not', {
    x: 0.8, y: 1.1, w: 12, h: 0.9, fontSize: 46, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText('competing with DFlow or Kamino.', {
    x: 0.8, y: 2.05, w: 12, h: 1.2, fontSize: 48, fontFace: DISPLAY, italic: true, color: PLASMA, margin: 0,
  });

  s.addText(
    'We drive volume into both. Every Foresight deposit is a DFlow trade and a Kamino deposit. The more people we bring in, the more TVL flows through their protocols.',
    { x: 0.8, y: 3.6, w: 11.5, h: 1.2, fontSize: 18, fontFace: BODY, color: FOG, margin: 0 }
  );

  // Positioning table
  const tblY = 5.1;
  s.addTable(
    [
      [
        { text: '', options: { fill: { color: INK }, border: { type: 'none' } } },
        { text: 'DFlow direct', options: { fill: { color: INK_CARD }, color: FOG, fontFace: MONO, fontSize: 10, bold: true, align: 'center' } },
        { text: 'Kalshi.com', options: { fill: { color: INK_CARD }, color: FOG, fontFace: MONO, fontSize: 10, bold: true, align: 'center' } },
        { text: 'Foresight', options: { fill: { color: INK_CARD }, color: PLASMA, fontFace: MONO, fontSize: 10, bold: true, align: 'center' } },
      ],
      [
        { text: 'Kalshi liquidity', options: { fill: { color: INK }, color: CHALK, fontFace: BODY, fontSize: 13 } },
        { text: 'Yes', options: { fill: { color: INK }, color: PLASMA, align: 'center', fontFace: BODY, fontSize: 13 } },
        { text: 'Yes', options: { fill: { color: INK }, color: PLASMA, align: 'center', fontFace: BODY, fontSize: 13 } },
        { text: 'Yes', options: { fill: { color: INK }, color: PLASMA, align: 'center', fontFace: BODY, fontSize: 13 } },
      ],
      [
        { text: 'On-chain SPL tokens', options: { fill: { color: INK }, color: CHALK, fontFace: BODY, fontSize: 13 } },
        { text: 'Yes', options: { fill: { color: INK }, color: PLASMA, align: 'center', fontFace: BODY, fontSize: 13 } },
        { text: 'No', options: { fill: { color: INK }, color: FOG, align: 'center', fontFace: BODY, fontSize: 13 } },
        { text: 'Yes', options: { fill: { color: INK }, color: PLASMA, align: 'center', fontFace: BODY, fontSize: 13 } },
      ],
      [
        { text: 'Yield on idle capital', options: { fill: { color: INK }, color: CHALK, fontFace: BODY, fontSize: 13 } },
        { text: 'No', options: { fill: { color: INK }, color: FOG, align: 'center', fontFace: BODY, fontSize: 13 } },
        { text: 'No', options: { fill: { color: INK }, color: FOG, align: 'center', fontFace: BODY, fontSize: 13 } },
        { text: 'Yes', options: { fill: { color: INK }, color: PLASMA, align: 'center', fontFace: BODY, fontSize: 13, bold: true } },
      ],
      [
        { text: 'Composable with DeFi', options: { fill: { color: INK }, color: CHALK, fontFace: BODY, fontSize: 13 } },
        { text: 'Partial', options: { fill: { color: INK }, color: FOG, align: 'center', fontFace: BODY, fontSize: 13 } },
        { text: 'No', options: { fill: { color: INK }, color: FOG, align: 'center', fontFace: BODY, fontSize: 13 } },
        { text: 'Yes', options: { fill: { color: INK }, color: PLASMA, align: 'center', fontFace: BODY, fontSize: 13, bold: true } },
      ],
    ],
    {
      x: 0.8, y: tblY, w: 11.7, colW: [4.5, 2.4, 2.4, 2.4],
      border: { type: 'solid', pt: 0.5, color: INK_BORDER },
      fontSize: 13,
      rowH: 0.35,
    }
  );
}

// ─── Slide 8 — Projected yield ──────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  sectionMarker(s, '/07  WHAT IT\'S WORTH TO A USER');
  pageFooter(s, 8);

  s.addText('The math,', {
    x: 0.8, y: 1.0, w: 12, h: 0.8, fontSize: 42, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText('for a realistic position.', {
    x: 0.8, y: 1.9, w: 12, h: 1.1, fontSize: 48, fontFace: DISPLAY, italic: true, color: PLASMA, margin: 0,
  });

  // Scenario chart — six-month Kalshi market, $1000 deposit
  // X axis: months, Y axis: cumulative return (%)
  s.addChart(
    pres.charts.LINE,
    [
      {
        name: 'Pure prediction',
        labels: ['0', '1', '2', '3', '4', '5', '6'],
        values: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        name: 'Yield leg (Kamino)',
        labels: ['0', '1', '2', '3', '4', '5', '6'],
        values: [0, 0.27, 0.54, 0.81, 1.08, 1.35, 1.62],
      },
      {
        name: 'Foresight combined',
        labels: ['0', '1', '2', '3', '4', '5', '6'],
        values: [0, 0.27, 0.54, 0.81, 1.08, 1.35, 1.62],
      },
    ],
    {
      x: 0.8, y: 3.2, w: 7.5, h: 3.5,
      chartColors: [FOG, PLASMA, CHALK],
      chartArea: { fill: { color: INK_CARD }, border: { color: INK_BORDER, pt: 1 } },
      plotArea: { fill: { color: INK_CARD } },
      catAxisLabelColor: FOG,
      valAxisLabelColor: FOG,
      catAxisLabelFontFace: MONO,
      valAxisLabelFontFace: MONO,
      catAxisLabelFontSize: 9,
      valAxisLabelFontSize: 9,
      valAxisTitle: 'Accrued yield (%)',
      valAxisTitleColor: FOG,
      valAxisTitleFontFace: MONO,
      valAxisTitleFontSize: 9,
      showValAxisTitle: true,
      catAxisTitle: 'Months until market resolves',
      catAxisTitleColor: FOG,
      catAxisTitleFontFace: MONO,
      catAxisTitleFontSize: 9,
      showCatAxisTitle: true,
      valGridLine: { color: INK_BORDER, size: 0.5 },
      catGridLine: { style: 'none' },
      lineSize: 3,
      lineSmooth: true,
      showLegend: true,
      legendPos: 'b',
      legendColor: FOG,
      legendFontFace: MONO,
      legendFontSize: 10,
    }
  );

  // Right side callout
  s.addShape(pres.shapes.RECTANGLE, {
    x: 8.8, y: 3.2, w: 3.7, h: 3.5,
    fill: { color: INK_CARD }, line: { color: PLASMA, width: 1 },
  });
  s.addText('On a $1,000 deposit.', {
    x: 9.0, y: 3.45, w: 3.4, h: 0.35,
    fontSize: 10, fontFace: MONO, color: FOG, charSpacing: 2, margin: 0,
  });
  s.addText('50/50 split', {
    x: 9.0, y: 3.9, w: 3.4, h: 0.5,
    fontSize: 22, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText([
    { text: '$500', options: { color: PLASMA } },
    { text: ' in Kamino at 6.4% APY for six months', options: { color: CHALK } },
  ], { x: 9.0, y: 4.4, w: 3.4, h: 0.8, fontSize: 13, fontFace: BODY, margin: 0 });

  s.addText('+$16.20', {
    x: 9.0, y: 5.35, w: 3.4, h: 0.8,
    fontSize: 44, fontFace: DISPLAY, color: PLASMA, margin: 0,
  });
  s.addText('in yield, entirely independent of whether the prediction wins.', {
    x: 9.0, y: 6.0, w: 3.4, h: 0.6,
    fontSize: 11, fontFace: BODY, italic: true, color: FOG, margin: 0,
  });
}

// ─── Slide 9 — Why this wins the bounty ─────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  sectionMarker(s, '/08  WHY THIS WINS');
  pageFooter(s, 9);

  s.addText('Four of four', {
    x: 0.8, y: 1.1, w: 12, h: 0.9, fontSize: 48, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText('sponsors integrated. One product.', {
    x: 0.8, y: 2.1, w: 12, h: 1.1, fontSize: 46, fontFace: DISPLAY, italic: true, color: PLASMA, margin: 0,
  });

  const sponsors = [
    { name: 'DFlow', role: 'Prediction markets API + Trade API + CLP polling', file: 'src/lib/dflow.ts' },
    { name: 'Kamino', role: 'klend-sdk for deposit / withdraw / APY', file: 'src/lib/kamino.ts' },
    { name: 'Solflare', role: 'Wallet adapter (first-class)', file: 'src/components/SolanaProvider.tsx' },
    { name: 'QuickNode', role: 'Recommended RPC (Kamino needs it)', file: '.env.example' },
    { name: 'Eitherway', role: 'Scaffolded from a single prompt', file: 'pitch/eitherway-prompt.md' },
  ];

  sponsors.forEach((sp, i) => {
    const y = 3.5 + i * 0.68;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y, w: 0.1, h: 0.55,
      fill: { color: PLASMA }, line: { color: PLASMA, width: 0 },
    });
    s.addText(sp.name, {
      x: 1.1, y, w: 2.5, h: 0.55,
      fontSize: 20, fontFace: DISPLAY, color: CHALK, valign: 'middle', margin: 0,
    });
    s.addText(sp.role, {
      x: 3.6, y, w: 5.8, h: 0.55,
      fontSize: 13, fontFace: BODY, color: FOG, valign: 'middle', margin: 0,
    });
    s.addText(sp.file, {
      x: 9.4, y, w: 3.1, h: 0.55,
      fontSize: 10, fontFace: MONO, color: PLASMA, valign: 'middle', align: 'right', margin: 0,
    });
  });
}

// ─── Slide 10 — Roadmap ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  sectionMarker(s, '/09  ROADMAP');
  pageFooter(s, 10);

  s.addText('v1 is the primitive.', {
    x: 0.8, y: 1.0, w: 12, h: 0.9, fontSize: 42, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText('Everything else is built on top.', {
    x: 0.8, y: 1.95, w: 12, h: 1.1, fontSize: 46, fontFace: DISPLAY, italic: true, color: PLASMA, margin: 0,
  });

  const versions = [
    { tag: 'v1.0', label: 'Now', body: 'Two-leg vault. DFlow mint + Kamino deposit. Full UI, live on mainnet.', status: 'shipped' },
    { tag: 'v1.1', label: '+3 weeks', body: 'Jito bundle — both legs land in the same slot. Atomic position opens and closes.', status: 'next' },
    { tag: 'v1.2', label: '+6 weeks', body: 'Outcome tokens as Kamino collateral. Borrow against open positions, scale into convictions.', status: 'next' },
    { tag: 'v2', label: 'Q3', body: 'Basket vaults. "Long all 2026 FOMC cut markets + earn idle yield" as a single deposit.', status: 'planned' },
    { tag: 'v3', label: 'Q4+', body: 'Automated hedged strategies. Delta-neutral prediction LPing, correlated-market pairs.', status: 'planned' },
  ];

  versions.forEach((v, i) => {
    const y = 3.3 + i * 0.68;
    const isShipped = v.status === 'shipped';
    s.addText(v.tag, {
      x: 0.8, y, w: 1.2, h: 0.55,
      fontSize: 22, fontFace: DISPLAY, color: isShipped ? PLASMA : CHALK,
      italic: !isShipped, valign: 'middle', margin: 0,
    });
    s.addText(v.label, {
      x: 2.1, y, w: 1.8, h: 0.55,
      fontSize: 10, fontFace: MONO, color: FOG, charSpacing: 2, valign: 'middle', margin: 0,
    });
    s.addText(v.body, {
      x: 4.0, y, w: 8.5, h: 0.55,
      fontSize: 13, fontFace: BODY, color: isShipped ? CHALK : FOG, valign: 'middle', margin: 0,
    });
  });
}

// ─── Slide 11 — Close ────────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);

  // Subtle grid
  for (let i = 0; i < 14; i++) {
    s.addShape(pres.shapes.LINE, {
      x: i * 0.95, y: 0, w: 0, h: 7.5,
      line: { color: INK_BORDER, width: 0.3 },
    });
  }

  s.addText('FORESIGHT', {
    x: 0.8, y: 0.6, w: 12, h: 0.4,
    fontSize: 12, fontFace: MONO, color: PLASMA, charSpacing: 8, margin: 0,
  });

  s.addText('Earn yield', {
    x: 0.8, y: 1.6, w: 12, h: 1.5,
    fontSize: 96, fontFace: DISPLAY, color: CHALK, margin: 0,
  });
  s.addText('while you wait', {
    x: 0.8, y: 3.2, w: 12, h: 1.5,
    fontSize: 96, fontFace: DISPLAY, italic: true, color: PLASMA, margin: 0,
  });
  s.addText('for the future.', {
    x: 0.8, y: 4.8, w: 12, h: 1.5,
    fontSize: 96, fontFace: DISPLAY, color: CHALK, margin: 0,
  });

  // Links
  s.addShape(pres.shapes.LINE, {
    x: 0.8, y: 6.2, w: 11.7, h: 0,
    line: { color: INK_BORDER, width: 1 },
  });
  s.addText('foresight.app', {
    x: 0.8, y: 6.4, w: 4, h: 0.4,
    fontSize: 16, fontFace: DISPLAY, italic: true, color: CHALK, margin: 0,
  });
  s.addText('github.com/foresight-fi · @foresight_fi · built with eitherway', {
    x: 4.8, y: 6.5, w: 8, h: 0.3,
    fontSize: 10, fontFace: MONO, color: FOG, charSpacing: 3, align: 'right', margin: 0,
  });
}

// ─── Write ───────────────────────────────────────────────────────────
pres.writeFile({ fileName: '/home/claude/foresight/pitch/foresight-deck.pptx' })
  .then((f) => console.log('Deck written:', f))
  .catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
  });
