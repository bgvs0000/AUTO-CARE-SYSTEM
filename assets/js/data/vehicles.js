/* =========================================================
   AUTOCARE — data/vehicles.js
   Commonly used vehicles in the Philippines + OEM fitment
   (stock tire, PCD, center bore, offset range, body type)
   + fitment calculator for tires and wheels
   ========================================================= */
window.AC = window.AC || {};
AC.data = AC.data || {};

(function () {
  // [model, body, stockTire, pcd, centerBore, etMin, etMax, fuel?]
  const RAW = {
    Toyota: [
      ['Vios', 'sedan', '185/60 R15', '4x100', 54.1, 35, 45],
      ['Wigo', 'hatch', '175/65 R14', '4x100', 54.1, 35, 45],
      ['Yaris', 'hatch', '185/60 R15', '4x100', 54.1, 35, 45],
      ['Corolla Altis', 'sedan', '205/55 R16', '5x114.3', 60.1, 35, 45],
      ['Corolla Cross', 'suv', '215/60 R17', '5x114.3', 60.1, 35, 45],
      ['Camry', 'sedan', '235/45 R18', '5x114.3', 60.1, 35, 45],
      ['Innova', 'suv', '205/65 R16', '5x114.3', 60.1, 35, 45, 'Diesel'],
      ['Fortuner', 'suv', '265/60 R18', '6x139.7', 106.1, 15, 30, 'Diesel'],
      ['Hilux', 'pickup', '265/65 R17', '6x139.7', 106.1, 10, 30, 'Diesel'],
      ['Avanza', 'suv', '195/60 R16', '5x114.3', 60.1, 35, 45],
      ['Rush', 'suv', '215/60 R17', '5x114.3', 60.1, 30, 45],
      ['Raize', 'suv', '205/60 R17', '5x100', 54.1, 35, 45],
      ['Hiace', 'van', '215/70 R15', '6x139.7', 106.1, 20, 35, 'Diesel'],
      ['RAV4', 'suv', '225/60 R18', '5x114.3', 60.1, 35, 45]
    ],
    Honda: [
      ['City', 'sedan', '185/55 R16', '4x100', 56.1, 40, 50],
      ['Civic', 'sedan', '215/50 R17', '5x114.3', 64.1, 40, 50],
      ['Accord', 'sedan', '235/45 R18', '5x114.3', 64.1, 40, 50],
      ['Brio', 'hatch', '175/65 R14', '4x100', 56.1, 40, 50],
      ['BR-V', 'suv', '215/55 R17', '5x114.3', 64.1, 40, 50],
      ['HR-V', 'suv', '215/55 R17', '5x114.3', 64.1, 40, 50],
      ['CR-V', 'suv', '235/60 R18', '5x114.3', 64.1, 40, 50],
      ['Mobilio', 'suv', '185/65 R15', '4x100', 56.1, 40, 50]
    ],
    Mitsubishi: [
      ['Mirage', 'hatch', '175/55 R15', '4x100', 56.1, 40, 46],
      ['Mirage G4', 'sedan', '185/55 R15', '4x100', 56.1, 40, 46],
      ['Lancer', 'sedan', '205/60 R16', '5x114.3', 67.1, 38, 46],
      ['Xpander', 'suv', '205/55 R17', '4x114.3', 56.1, 40, 46],
      ['Montero Sport', 'suv', '265/60 R18', '6x139.7', 67.1, 30, 46, 'Diesel'],
      ['Strada', 'pickup', '265/60 R18', '6x139.7', 67.1, 30, 46, 'Diesel'],
      ['Outlander', 'suv', '225/55 R18', '5x114.3', 67.1, 38, 46]
    ],
    Nissan: [
      ['Almera', 'sedan', '195/55 R16', '4x100', 60.1, 40, 45],
      ['Navara', 'pickup', '255/60 R18', '6x114.3', 66.1, 25, 40, 'Diesel'],
      ['Terra', 'suv', '255/60 R18', '6x114.3', 66.1, 25, 40, 'Diesel'],
      ['Kicks', 'suv', '205/55 R17', '4x100', 60.1, 40, 45],
      ['X-Trail', 'suv', '225/60 R18', '5x114.3', 66.1, 40, 45],
      ['Urvan', 'van', '195/80 R15', '6x139.7', 100.1, 20, 35, 'Diesel']
    ],
    Ford: [
      ['Ranger', 'pickup', '255/65 R18', '6x139.7', 93.1, 10, 30, 'Diesel'],
      ['Everest', 'suv', '255/55 R20', '6x139.7', 93.1, 10, 30, 'Diesel'],
      ['Territory', 'suv', '235/50 R19', '5x108', 63.4, 40, 50],
      ['EcoSport', 'suv', '205/50 R17', '4x108', 63.4, 35, 45],
      ['Mustang', 'sedan', '255/40 R19', '5x114.3', 70.5, 30, 45]
    ],
    Hyundai: [
      ['Accent', 'sedan', '185/65 R15', '4x100', 54.1, 40, 46],
      ['Elantra', 'sedan', '225/45 R17', '5x114.3', 67.1, 40, 50],
      ['Stargazer', 'suv', '205/55 R16', '4x100', 54.1, 40, 46],
      ['Tucson', 'suv', '235/60 R18', '5x114.3', 67.1, 40, 50],
      ['Santa Fe', 'suv', '235/55 R19', '5x114.3', 67.1, 40, 50, 'Diesel'],
      ['Creta', 'suv', '215/60 R17', '5x114.3', 67.1, 40, 50],
      ['Staria', 'van', '235/55 R18', '5x114.3', 67.1, 40, 50, 'Diesel']
    ],
    Kia: [
      ['Soluto', 'sedan', '175/70 R14', '4x100', 54.1, 40, 46],
      ['Seltos', 'suv', '215/55 R18', '5x114.3', 67.1, 40, 50],
      ['Sportage', 'suv', '235/55 R19', '5x114.3', 67.1, 40, 50],
      ['Sorento', 'suv', '235/55 R19', '5x114.3', 67.1, 40, 50, 'Diesel'],
      ['Carnival', 'van', '235/60 R18', '5x114.3', 67.1, 40, 50, 'Diesel']
    ],
    Isuzu: [
      ['D-Max', 'pickup', '255/60 R18', '6x139.7', 107.1, 10, 30, 'Diesel'],
      ['mu-X', 'suv', '255/60 R18', '6x139.7', 107.1, 10, 30, 'Diesel'],
      ['Crosswind', 'suv', '205/70 R15', '6x139.7', 107.1, 15, 30, 'Diesel']
    ],
    Suzuki: [
      ['Swift', 'hatch', '185/55 R16', '4x100', 54.1, 40, 48],
      ['Dzire', 'sedan', '185/65 R15', '4x100', 54.1, 40, 48],
      ['Ertiga', 'suv', '185/65 R15', '4x100', 54.1, 40, 48],
      ['XL7', 'suv', '195/60 R16', '4x100', 54.1, 40, 48],
      ['Jimny', 'suv', '195/80 R15', '5x139.7', 108.1, 0, 22],
      ['Ciaz', 'sedan', '185/65 R15', '4x100', 54.1, 40, 48]
    ],
    Mazda: [
      ['Mazda 2', 'hatch', '185/60 R16', '4x100', 54.1, 40, 50],
      ['Mazda 3', 'sedan', '215/45 R18', '5x114.3', 67.1, 40, 50],
      ['CX-3', 'suv', '215/50 R18', '5x114.3', 67.1, 40, 50],
      ['CX-5', 'suv', '225/55 R19', '5x114.3', 67.1, 40, 50],
      ['CX-8', 'suv', '225/55 R19', '5x114.3', 67.1, 40, 50, 'Diesel'],
      ['CX-9', 'suv', '255/50 R20', '5x114.3', 67.1, 40, 50]
    ],
    MG: [
      ['MG 3', 'hatch', '195/55 R16', '4x100', 56.1, 40, 46],
      ['MG 5', 'sedan', '205/55 R16', '4x100', 56.1, 40, 46],
      ['ZS', 'suv', '215/50 R17', '5x114.3', 67.1, 40, 46],
      ['HS', 'suv', '235/50 R18', '5x114.3', 67.1, 40, 46]
    ],
    Geely: [
      ['Emgrand', 'sedan', '205/55 R16', '5x114.3', 64.1, 40, 48],
      ['Coolray', 'suv', '225/45 R18', '5x114.3', 57.1, 40, 48],
      ['Okavango', 'suv', '225/55 R18', '5x114.3', 57.1, 40, 48],
      ['Azkarra', 'suv', '225/60 R18', '5x108', 60.1, 40, 48]
    ],
    BYD: [
      ['Dolphin', 'hatch', '205/55 R16', '5x114.3', 64.1, 40, 50, 'Electric'],
      ['Atto 3', 'suv', '215/55 R18', '5x114.3', 64.1, 40, 50, 'Electric'],
      ['Seal', 'sedan', '235/45 R19', '5x114.3', 64.1, 40, 50, 'Electric']
    ]
  };

  const catalog = [];
  Object.keys(RAW).forEach((brand) => RAW[brand].forEach((r) => {
    catalog.push({
      brand, model: r[0], body: r[1], tire: r[2], pcd: r[3], cb: r[4], etMin: r[5], etMax: r[6],
      fuel: r[7] || 'Gasoline', years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
    });
  }));

  const COLORS = [
    { name: 'Pearl White', hex: '#eef0f2' }, { name: 'Super White', hex: '#f6f7f8' }, { name: 'Silver Metallic', hex: '#c0c6cd' },
    { name: 'Gray Metallic', hex: '#7b828b' }, { name: 'Attitude Black', hex: '#1f2329' }, { name: 'Red Mica', hex: '#a3242a' },
    { name: 'Dark Blue Mica', hex: '#1e3a6e' }, { name: 'Modern Steel', hex: '#5a616b' }, { name: 'Bronze Mica', hex: '#6b5546' }
  ];

  function parseTire(s) {
    const m = String(s).match(/(\d{3})\/(\d{2})\s*R(\d{2})/i);
    if (!m) return null;
    return { width: +m[1], aspect: +m[2], rim: +m[3], label: m[1] + '/' + m[2] + ' R' + m[3] };
  }
  function diameter(t) { return t.rim * 25.4 + 2 * t.width * t.aspect / 100; }

  function find(brand, model) { return catalog.find((v) => v.brand === brand && v.model === model); }
  function brands() { return Object.keys(RAW); }
  function models(brand) { return (RAW[brand] || []).map((r) => r[0]); }

  /* Recommended tire sizes for a target rim diameter (±3% of OEM overall diameter) */
  function tireSizesFor(v, rim) {
    const stock = parseTire(v.tire);
    rim = rim || stock.rim;
    const target = diameter(stock);
    const widthBump = Math.max(0, rim - stock.rim) * 10;
    const widths = [stock.width + widthBump - 10, stock.width + widthBump, stock.width + widthBump + 10].filter((w) => w >= 155);
    const out = [];
    widths.forEach((w) => {
      let best = null;
      for (let ar = 80; ar >= 30; ar -= 5) {
        const t = { width: w, aspect: ar, rim };
        const dev = (diameter(t) - target) / target;
        if (Math.abs(dev) <= .03) { best = { label: w + '/' + ar + ' R' + rim, dev: dev * 100, width: w, aspect: ar, rim }; break; }
      }
      if (best) out.push(best);
    });
    return { stock, primary: out[1] || out[0] || null, options: out };
  }

  /* Wheel fitment for a vehicle & target diameter */
  function wheelFitment(v, dia) {
    const stock = parseTire(v.tire);
    dia = dia || stock.rim;
    const ts = tireSizesFor(v, dia);
    const tw = ts.primary ? ts.primary.width : stock.width;
    const jw = Math.round((tw * .86) / 25.4 * 2) / 2;
    const et = Math.round((v.etMin + v.etMax) / 2);
    return {
      vehicle: v, diameter: dia, width: jw, widthRange: [jw - .5, jw + .5], pcd: v.pcd, cb: v.cb,
      offset: et, offsetRange: [v.etMin, v.etMax], tire: ts.primary ? ts.primary.label : v.tire, tireOptions: ts.options
    };
  }

  AC.data.vehicles = { catalog, brands, models, find, COLORS, parseTire, diameter, tireSizesFor, wheelFitment };
})();
