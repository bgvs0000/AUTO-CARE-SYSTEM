/* =========================================================
   AUTOCARE — data/products.js
   Shop catalog: categories, tires (multi-size), wheels
   (multi-size / PCD), batteries, oils, lubricants, brakes,
   filters, suspension, accessories, lighting, care,
   detailing, performance parts.
   Every product has variants[] (SKU-level price & stock).
   ========================================================= */
window.AC = window.AC || {};
AC.data = AC.data || {};

(function () {
  const u = AC.u;
  const rnd = u.rng(20261007);
  const r50 = (n) => Math.round(n / 50) * 50;

  const CATEGORIES = [
    { id: 'tires', name: 'Tires', icon: 'tire', desc: 'Passenger, SUV & all-terrain' },
    { id: 'wheels', name: 'Mags / Alloy Wheels', icon: 'wheel', desc: 'Cast, flow-formed & forged' },
    { id: 'batteries', name: 'Batteries', icon: 'battery', desc: 'Maintenance-free & EFB' },
    { id: 'oils', name: 'Engine Oils', icon: 'droplet', desc: 'Synthetic & semi-synthetic' },
    { id: 'lubricants', name: 'Lubricants', icon: 'oil', desc: 'ATF, coolant, brake fluid' },
    { id: 'brakes', name: 'Brake Parts', icon: 'disc', desc: 'Pads, rotors & fluids' },
    { id: 'filters', name: 'Filters', icon: 'filter', desc: 'Oil, air, cabin & fuel' },
    { id: 'suspension', name: 'Suspension Parts', icon: 'spring', desc: 'Shocks, coilovers, links' },
    { id: 'accessories', name: 'Car Accessories', icon: 'camera', desc: 'Dashcams, mats & more' },
    { id: 'lighting', name: 'Lighting', icon: 'bulb', desc: 'LED & halogen upgrades' },
    { id: 'carcare', name: 'Car Care', icon: 'droplet', desc: 'Wash, wax & protectants' },
    { id: 'detailing', name: 'Detailing Products', icon: 'sparkles', desc: 'Pro-grade detailing' },
    { id: 'performance', name: 'Performance Parts', icon: 'gauge', desc: 'Intakes, plugs & more' }
  ];

  const products = [];
  let seq = 0;
  const pid = (pre) => pre + '-' + String(++seq).padStart(3, '0');
  const stockFn = () => { const r = rnd(); return r < .03 ? 0 : r < .08 ? Math.ceil(rnd() * 3) : Math.ceil(rnd() * 28) + 6; };
  const SUPPLIERS = ['Goodyear PH Distribution', 'Tire Depot Manila', 'Wheelhouse Imports Inc.', 'Motolite Philippines', 'Petron Lubes Center', 'Pilipinas Shell Trade', 'AutoParts Central QC', 'Concept Moto Supply', 'Detail Pro Trading', 'Ignition Performance PH'];

  /* ---------------- Tires ---------------- */
  const POOLS = {
    pc: ['185/60 R15', '185/65 R15', '205/60 R16', '195/55 R16', '195/60 R16', '205/55 R16', '205/45 R17', '205/50 R17', '215/50 R17', '215/55 R17', '215/60 R17', '225/45 R18', '225/60 R18', '235/60 R18'],
    eco: ['175/65 R14', '175/70 R14', '175/55 R15', '185/55 R15', '185/60 R15', '185/65 R15', '195/65 R15', '185/55 R16', '195/60 R16', '205/55 R16'],
    perf: ['205/45 R17', '215/45 R17', '225/45 R17', '215/45 R18', '225/45 R18', '235/45 R18', '235/40 R19', '235/45 R19', '255/40 R19'],
    suv: ['205/65 R16', '205/60 R17', '205/55 R17', '215/60 R17', '215/55 R18', '225/55 R18', '225/60 R18', '235/50 R18', '235/55 R18', '235/60 R18', '235/50 R19', '235/55 R19', '225/55 R19', '255/50 R20', '255/55 R20', '265/60 R18'],
    at: ['195/80 R15', '205/70 R15', '215/70 R15', '255/70 R16', '265/70 R16', '265/65 R17', '255/60 R18', '255/65 R18', '265/60 R18', '255/55 R20']
  };
  const TIRES = [
    ['Michelin', 'Primacy 4+', 'Touring', 'All-Season', '215/55 R17', 8500, 4.9, 312, 'pc'],
    ['Michelin', 'Pilot Sport 5', 'Performance', 'Summer', '225/45 R18', 11800, 4.9, 188, 'perf'],
    ['Michelin', 'Primacy SUV+', 'SUV / Highway', 'All-Season', '265/60 R18', 12900, 4.8, 141, 'suv'],
    ['Bridgestone', 'Turanza T005A', 'Touring', 'All-Season', '205/55 R16', 7200, 4.7, 276, 'pc'],
    ['Bridgestone', 'Ecopia EP150', 'Eco / Fuel Saver', 'All-Season', '185/65 R15', 4300, 4.5, 402, 'eco'],
    ['Bridgestone', 'Dueler A/T 002', 'All-Terrain', 'All-Season', '265/65 R17', 10900, 4.7, 167, 'at'],
    ['Yokohama', 'BluEarth-GT AE51', 'Touring', 'All-Season', '195/55 R16', 6800, 4.7, 233, 'pc'],
    ['Yokohama', 'ADVAN Fleva V701', 'Performance', 'Summer', '215/45 R17', 7900, 4.6, 121, 'perf'],
    ['Yokohama', 'Geolandar A/T G015', 'All-Terrain', 'All-Season', '265/60 R18', 10400, 4.8, 298, 'at'],
    ['Goodyear', 'Assurance TripleMax 2', 'Touring', 'All-Season', '205/55 R16', 6500, 4.6, 357, 'pc'],
    ['Goodyear', 'Wrangler AT SilentTrac', 'All-Terrain', 'All-Season', '265/65 R17', 9800, 4.6, 142, 'at'],
    ['Dunlop', 'SP Sport LM705', 'Comfort', 'All-Season', '195/55 R16', 5600, 4.5, 188, 'pc'],
    ['Dunlop', 'Grandtrek AT5', 'All-Terrain', 'All-Season', '265/60 R18', 9600, 4.6, 97, 'at'],
    ['Continental', 'UltraContact UC7', 'Touring', 'All-Season', '215/60 R17', 8900, 4.8, 174, 'pc'],
    ['Continental', 'MaxContact MC7', 'Performance', 'Summer', '225/45 R18', 10200, 4.7, 86, 'perf'],
    ['Hankook', 'Ventus Prime 4', 'Touring', 'All-Season', '205/55 R16', 5900, 4.6, 203, 'pc'],
    ['Hankook', 'Dynapro AT2', 'All-Terrain', 'All-Season', '265/65 R17', 8900, 4.6, 118, 'at'],
    ['Toyo', 'Proxes Sport 2', 'Performance', 'Summer', '225/45 R18', 9400, 4.7, 92, 'perf'],
    ['Toyo', 'Open Country A/T III', 'All-Terrain', 'All-Season', '265/60 R18', 10100, 4.8, 211, 'at'],
    ['Falken', 'Ziex ZE310 Ecorun', 'Comfort', 'All-Season', '205/55 R16', 5200, 4.5, 164, 'pc'],
    ['Falken', 'Wildpeak A/T3W', 'All-Terrain', 'All-Season', '265/65 R17', 9200, 4.7, 133, 'at'],
    ['Kumho', 'Ecsta PS71', 'Performance', 'Summer', '225/45 R18', 7400, 4.5, 77, 'perf'],
    ['Maxxis', 'Premitra HP5', 'Touring', 'All-Season', '195/55 R16', 4600, 4.4, 145, 'pc'],
    ['Maxxis', 'Razr AT811', 'All-Terrain', 'All-Season', '265/65 R17', 7600, 4.5, 88, 'at'],
    ['Giti', 'GitiComfort F50', 'Eco / Fuel Saver', 'All-Season', '185/65 R15', 3400, 4.3, 219, 'eco'],
    ['Nitto', 'NT555 G2', 'Performance', 'Summer', '235/45 R18', 9900, 4.6, 64, 'perf'],
    ['Nitto', 'Ridge Grappler', 'Hybrid Terrain', 'All-Season', '265/60 R18', 13500, 4.8, 102, 'at']
  ];
  const sizeFactor = (s) => { const t = AC.data.vehicles.parseTire(s); return 1 + (t.rim - 14) * .14 + (t.width - 175) * .006; };
  const SPEED = { pc: ['V', 'H', 'W'], eco: ['T', 'H'], perf: ['W', 'Y'], suv: ['H', 'V'], at: ['T', 'S', 'R'] };
  TIRES.forEach((t) => {
    const [brand, model, type, season, anchor, price, rating, reviews, pool] = t;
    const sizes = POOLS[pool].slice();
    if (sizes.indexOf(anchor) < 0) sizes.push(anchor);
    const af = sizeFactor(anchor);
    const id = pid('TR');
    const variants = sizes.map((s) => {
      const tt = AC.data.vehicles.parseTire(s);
      const load = u.clamp(Math.round(72 + (tt.width - 175) * .2 + (tt.rim - 14) * 2.2 + (tt.aspect - 45) * .18 + (pool === 'at' ? 6 : 0)), 75, 121);
      const sp = SPEED[pool][Math.floor(rnd() * SPEED[pool].length)];
      return {
        key: s, label: s, sku: brand.slice(0, 3).toUpperCase() + '-' + model.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() + '-' + s.replace(/[^0-9]/g, ''),
        price: s === anchor ? price : r50(price * sizeFactor(s) / af),
        stock: (brand === 'Michelin' && model === 'Primacy 4+' && s === anchor) ? 2 : stockFn(),
        attrs: { width: tt.width, aspect: tt.aspect, rim: tt.rim, load: String(load), speed: sp }
      };
    });
    variants.sort((a, b) => a.attrs.rim - b.attrs.rim || a.attrs.width - b.attrs.width);
    const ai = variants.findIndex((v) => v.key === anchor);
    if (ai > 0) variants.unshift(variants.splice(ai, 1)[0]);
    products.push({
      id, cat: 'tires', brand, name: model, title: brand + ' ' + model, rating, reviews, unit: 'per tire',
      desc: brand + ' ' + model + ' is a ' + type.toLowerCase() + ' tire engineered for Philippine road conditions — confident wet grip during the rainy season, stable highway handling, and low road noise for daily driving.',
      specs: { 'Tire Type': type, Season: season, Construction: 'Radial, tubeless', 'Warranty': '5 years (manufacturer)', 'Country of Origin': ['Michelin', 'Continental'].indexOf(brand) > -1 ? 'Thailand' : brand === 'Giti' ? 'Indonesia' : 'Japan' },
      variants, art: { kind: 'tire' }, minStock: 4, supplier: SUPPLIERS[brand === 'Goodyear' ? 0 : 1],
      tags: rating >= 4.8 ? ['Best Seller'] : type === 'All-Terrain' ? ['4x4 Ready'] : []
    });
  });

  /* ---------------- Wheels ---------------- */
  const PASS_PCD = ['4x100', '5x114.3', '5x100', '5x108', '4x114.3'];
  const OFF_PCD = ['6x139.7', '6x114.3', '5x139.7'];
  const WHEELS = [
    ['Enkei', 'RPF1', 'Silver', 'Aluminum Alloy', 'MAT Flow Forming', 'twin5', [[15, 7, 41], [16, 7, 43], [17, 8, 45], [18, 8.5, 45]], ['4x100', '5x114.3', '5x100'], 17, 45000, 4.9],
    ['RAYS', 'Volk Racing TE37 SAGA', 'Diamond Dark Gunmetal', 'Forged Aluminum', 'Forged (One-piece)', 'six', [[17, 8, 35], [18, 9.5, 38], [18, 8.5, 45]], ['5x114.3', '5x100'], 18, 120000, 5.0],
    ['BBS', 'LM', 'Diamond Silver', 'Forged Aluminum', 'Forged (Two-piece)', 'mesh', [[17, 8, 40], [18, 8.5, 42], [19, 9, 42]], ['5x114.3', '5x108'], 18, 150000, 4.9],
    ['Rota', 'Grid', 'Hyper Silver', 'Aluminum Alloy', 'Low-pressure Cast', 'ten', [[15, 8, 20], [16, 8, 20], [17, 8.5, 30], [18, 9.5, 38]], ['4x100', '5x114.3'], 18, 48000, 4.5],
    ['WORK', 'Emotion CR Kiwami', 'Matte Black', 'Aluminum Alloy', 'Cast (One-piece)', 'split5', [[17, 7, 47], [18, 8.5, 45], [18, 9.5, 38]], ['4x100', '5x114.3', '5x100'], 18, 68000, 4.8],
    ['Advan', 'Racing GT', 'Racing Hyper Black', 'Forged Aluminum', 'Forged (One-piece)', 'twin5', [[18, 9.5, 45], [19, 9.5, 45]], ['5x114.3'], 18, 135000, 4.9],
    ['SSR', 'GTX01', 'Flat Black', 'Aluminum Alloy', 'Low-pressure Cast', 'split5', [[16, 7, 42], [17, 7.5, 48], [18, 8.5, 45]], ['4x100', '5x114.3'], 17, 52000, 4.7],
    ['OZ Racing', 'Ultraleggera', 'Matte Black', 'Aluminum Alloy', 'Gravity Cast', 'mesh', [[15, 7, 37], [17, 7, 45], [18, 8, 45]], ['4x100', '5x114.3', '5x108'], 17, 58000, 4.8],
    ['Rotiform', 'BLQ', 'Liquid Silver', 'Aluminum Alloy', 'Cast (One-piece)', 'mesh', [[18, 8.5, 35], [19, 8.5, 40]], ['5x114.3', '5x108'], 18, 72000, 4.6],
    ['HRE', 'FlowForm FF04', 'Liquid Silver', 'Aluminum Alloy', 'Flow Formed', 'six', [[18, 8.5, 35], [19, 9, 35], [20, 9, 35]], ['5x114.3', '5x108'], 19, 98000, 4.8],
    ['Konig', 'Hypergram', 'Matte Black', 'Aluminum Alloy', 'Flow Formed', 'ten', [[15, 8, 35], [17, 8, 40], [18, 8.5, 43]], ['4x100', '5x114.3', '5x108'], 17, 38000, 4.6],
    ['Konig', 'Dial-In', 'Hyper Silver', 'Aluminum Alloy', 'Flow Formed', 'five', [[15, 7, 40], [16, 7, 40], [17, 7.5, 45]], ['4x100', '4x114.3'], 15, 26000, 4.4],
    ['Rota', 'Slipstream', 'White', 'Aluminum Alloy', 'Low-pressure Cast', 'ten', [[15, 6.5, 40], [16, 7, 40], [17, 7, 42]], ['4x100', '4x114.3', '5x100'], 15, 24000, 4.3],
    ['Enkei', 'PF01', 'Gunmetal', 'Aluminum Alloy', 'MAT Flow Forming', 'split5', [[17, 8, 45], [18, 8, 40], [18, 9.5, 45]], ['5x114.3', '5x100', '5x108'], 17, 42000, 4.7],
    ['Method Race Wheels', 'MR305 NV', 'Matte Black', 'Aluminum Alloy', 'Cast (One-piece)', 'six', [[17, 8.5, 0], [18, 9, 18], [20, 9, 18]], ['6x139.7', '6x114.3'], 17, 62000, 4.8],
    ['Fuel Off-Road', 'Rebel D679', 'Matte Black Machined', 'Aluminum Alloy', 'Cast (One-piece)', 'six', [[17, 9, 1], [18, 9, 1], [20, 9, 1]], ['6x139.7', '6x114.3'], 18, 68000, 4.7],
    ['Black Rhino', 'Arsenal', 'Textured Matte Gunmetal', 'Aluminum Alloy', 'Cast (One-piece)', 'eight', [[17, 9.5, 12], [18, 9.5, 12], [20, 9.5, 12]], ['6x139.7', '6x114.3', '5x139.7'], 18, 72000, 4.6]
  ];
  WHEELS.forEach((w) => {
    const [brand, model, finish, material, construction, style, sizes, pcds, adia, aprice, rating] = w;
    const offroad = pcds[0].startsWith('6x') || pcds[0] === '5x139.7';
    const variants = [];
    sizes.forEach(([d, wd, et]) => pcds.forEach((pcd) => {
      variants.push({
        key: d + 'x' + wd + ' ' + pcd + ' ET' + (et >= 0 ? '+' : '') + et, label: d + '×' + wd + ' · ' + pcd + ' · ET' + (et >= 0 ? '+' : '') + et,
        sku: brand.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() + '-' + model.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() + '-' + d + String(wd).replace('.', '') + '-' + pcd.replace(/[^0-9]/g, '').slice(0, 4),
        price: d === adia && sizes.find((s) => s[0] === d)[1] === wd ? aprice : r50(aprice * (1 + (d - adia) * .12 + (wd - sizes.find((s) => s[0] === adia)[1]) * .04)),
        stock: (() => { const r = rnd(); return r < .04 ? 0 : r < .1 ? 1 + Math.floor(rnd() * 2) : 3 + Math.floor(rnd() * 8); })(),
        attrs: { diameter: d, width: wd, pcd, offset: et, cb: offroad ? 106.1 : 73.1 }
      });
    }));
    const anchorIdx = variants.findIndex((v) => v.attrs.diameter === adia);
    if (anchorIdx > 0) variants.unshift(variants.splice(anchorIdx, 1)[0]);
    products.push({
      id: pid('WH'), cat: 'wheels', brand, name: model, title: brand + ' ' + model, rating, reviews: Math.round(30 + rnd() * 180), unit: 'per set of 4',
      desc: 'The ' + brand + ' ' + model + ' combines ' + construction.toLowerCase() + ' strength with a ' + finish.toLowerCase() + ' finish. Sold as a set of 4 with hub-centric rings for a vibration-free fit. Includes professional mounting & balancing at any AutoCare branch.',
      specs: { Finish: finish, Material: material, Construction: construction, 'Spoke Design': { twin5: 'Twin 5-spoke', six: '6-spoke', mesh: 'Mesh / Cross-spoke', ten: '10-spoke', split5: 'Split 5-spoke', five: '5-spoke', eight: '8-spoke' }[style], 'Center Bore': (offroad ? 106.1 : 73.1) + ' mm (hub rings incl.)', 'Sold As': 'Set of 4' },
      variants, art: { kind: 'wheel', finish, style, lugs: +variants[0].attrs.pcd.split('x')[0] }, minStock: 2, supplier: SUPPLIERS[2],
      tags: aprice >= 100000 ? ['Premium'] : offroad ? ['4x4 / Off-Road'] : rating >= 4.8 ? ['Best Seller'] : []
    });
  });

  /* ---------------- General products ---------------- */
  // [cat, brand, name, rating, art, variants[[label, price]], specs, tags]
  const G = [
    ['batteries', 'Motolite', 'Gold Maintenance-Free', 4.8, { kind: 'battery', color: '#b91c1c', model: 'GOLD MF' }, [['NS40 (1SM)', 4200], ['NS60 (2SM)', 5600], ['2SM Plus', 6800], ['3SM', 8200], ['DIN66', 9500]], { Type: 'Maintenance-Free', Voltage: '12V', Warranty: '18 months' }, ['Best Seller']],
    ['batteries', 'Motolite', 'Excel', 4.6, { kind: 'battery', color: '#1e3a8a', model: 'EXCEL' }, [['NS40 (1SM)', 3500], ['NS60 (2SM)', 4600], ['3SM', 6900]], { Type: 'Low Maintenance', Voltage: '12V', Warranty: '12 months' }],
    ['batteries', 'Amaron', 'Pro Rider', 4.7, { kind: 'battery', color: '#15803d', model: 'PRO' }, [['NS40ZL', 4600], ['NS60L', 5900], ['DIN55', 8400], ['DIN66', 9800]], { Type: 'Maintenance-Free (SMF)', Voltage: '12V', Warranty: '24 months' }],
    ['batteries', 'Outlast', 'Maintenance-Free', 4.4, { kind: 'battery', color: '#111111', model: 'MF' }, [['NS40', 3800], ['NS60', 4900], ['3SM', 7200]], { Type: 'Maintenance-Free', Voltage: '12V', Warranty: '15 months' }],
    ['batteries', 'GS', 'Gold MF', 4.5, { kind: 'battery', color: '#374151', model: 'GOLD MF' }, [['NS40ZL', 4100], ['55D23L', 6600], ['80D26L', 7900]], { Type: 'Maintenance-Free', Voltage: '12V', Warranty: '18 months' }],
    ['batteries', 'Varta', 'Blue Dynamic EFB', 4.7, { kind: 'battery', color: '#1d4ed8', model: 'EFB' }, [['DIN60 EFB', 10500], ['DIN70 EFB', 11900]], { Type: 'EFB (Start-Stop)', Voltage: '12V', Warranty: '24 months' }],
    ['batteries', 'Bosch', 'S4 Silver', 4.6, { kind: 'battery', color: '#4b5563', model: 'S4' }, [['NS40', 4300], ['DIN55', 8600], ['DIN66', 9900]], { Type: 'Maintenance-Free', Voltage: '12V', Warranty: '18 months' }],

    ['oils', 'Shell', 'Helix Ultra 5W-40 Fully Synthetic', 4.8, { kind: 'bottle', color: '#c81e1e', label: '5W-40' }, [['1 Liter', 850], ['4 Liters', 3100]], { Grade: '5W-40', Type: 'Fully Synthetic', Spec: 'API SP, ACEA A3/B4' }, ['Best Seller']],
    ['oils', 'Mobil 1', 'Advanced Full Synthetic 0W-40', 4.9, { kind: 'bottle', color: '#1f2937', label: '0W-40' }, [['1 Liter', 950], ['4 Liters', 3450]], { Grade: '0W-40', Type: 'Fully Synthetic', Spec: 'API SN Plus' }],
    ['oils', 'Castrol', 'EDGE 5W-30 Titanium', 4.8, { kind: 'bottle', color: '#111827', label: '5W-30' }, [['1 Liter', 880], ['4 Liters', 3250]], { Grade: '5W-30', Type: 'Fully Synthetic', Spec: 'API SP' }],
    ['oils', 'Petron', 'Blaze Racing 5W-40', 4.6, { kind: 'bottle', color: '#1d4ed8', label: '5W-40' }, [['1 Liter', 520], ['4 Liters', 1950]], { Grade: '5W-40', Type: 'Fully Synthetic', Spec: 'API SN' }],
    ['oils', 'Caltex', 'Havoline ProDS 5W-30', 4.5, { kind: 'bottle', color: '#b91c1c', label: '5W-30' }, [['1 Liter', 640], ['4 Liters', 2350]], { Grade: '5W-30', Type: 'Fully Synthetic', Spec: 'API SP' }],
    ['oils', 'Liqui Moly', 'Top Tec 4200 5W-30', 4.8, { kind: 'bottle', color: '#2563eb', label: '5W-30' }, [['1 Liter', 1150], ['5 Liters', 5200]], { Grade: '5W-30', Type: 'Fully Synthetic (HC)', Spec: 'ACEA C3' }],
    ['oils', 'Toyota', 'Genuine Motor Oil 0W-20', 4.7, { kind: 'bottle', color: '#dc2626', label: '0W-20' }, [['1 Liter', 690], ['4 Liters', 2600]], { Grade: '0W-20', Type: 'Fully Synthetic', Spec: 'API SP, ILSAC GF-6' }],
    ['oils', 'Shell', 'Rimula R4 X 15W-40 Diesel', 4.6, { kind: 'bottle', color: '#ca1f1f', label: '15W-40' }, [['1 Liter', 520], ['4 Liters', 1850], ['7 Liters', 3100]], { Grade: '15W-40', Type: 'Mineral (Diesel)', Spec: 'API CK-4' }],
    ['oils', 'Petron', 'Rev-X HD 15W-40', 4.5, { kind: 'bottle', color: '#1e40af', label: '15W-40' }, [['1 Liter', 420], ['4 Liters', 1550]], { Grade: '15W-40', Type: 'Mineral (Diesel)', Spec: 'API CI-4' }],

    ['lubricants', 'Castrol', 'Transmax ATF Multivehicle', 4.6, { kind: 'bottle', color: '#b91c1c', label: 'ATF' }, [['1 Liter', 720], ['4 Liters', 2650]], { Type: 'Automatic Transmission Fluid', Compatibility: 'Dexron III / Mercon' }],
    ['lubricants', 'Prestone', 'DOT 4 Brake Fluid', 4.7, { kind: 'bottle', color: '#2563eb', label: 'DOT 4' }, [['355 ml', 380], ['1 Liter', 890]], { Type: 'Brake Fluid', Standard: 'DOT 4 / FMVSS 116' }],
    ['lubricants', 'Toyota', 'Super Long Life Coolant', 4.8, { kind: 'bottle', color: '#db2777', label: 'COOLANT' }, [['1 Liter', 520], ['4 Liters', 1750]], { Type: 'Pre-mixed Coolant', Color: 'Pink' }],
    ['lubricants', 'WD-40', 'Multi-Use Product', 4.8, { kind: 'bottle', color: '#1e3a8a', label: 'MULTI-USE' }, [['191 ml', 290], ['412 ml', 520]], { Type: 'Penetrating Lubricant' }],
    ['lubricants', 'Liqui Moly', 'Hypoid Gear Oil 75W-90', 4.6, { kind: 'bottle', color: '#2563eb', label: '75W-90' }, [['1 Liter', 1050]], { Type: 'Gear Oil', Spec: 'API GL-5' }],
    ['lubricants', 'Prestone', 'Power Steering Fluid', 4.4, { kind: 'bottle', color: '#374151', label: 'PSF' }, [['355 ml', 340]], { Type: 'Power Steering Fluid' }],

    ['brakes', 'Akebono', 'ProACT Ultra-Premium Ceramic Pads (Front)', 4.8, { kind: 'brake', part: 'pads' }, [['Toyota Vios / Yaris', 2950], ['Honda City / Jazz', 3050], ['Toyota Fortuner / Hilux', 4200], ['Mitsubishi Montero Sport', 4350]], { Material: 'Ceramic', Position: 'Front', Noise: 'Ultra-low' }, ['Best Seller']],
    ['brakes', 'Brembo', 'Front Brake Pads P83 Series', 4.8, { kind: 'brake', part: 'pads' }, [['Toyota Corolla Altis', 3900], ['Honda Civic', 4100], ['Ford Ranger', 4800]], { Material: 'Low-metallic', Position: 'Front' }],
    ['brakes', 'Brembo', 'Max Slotted Brake Rotor', 4.7, { kind: 'brake', color: '#dc2626' }, [['280mm (Civic / Altis)', 6900], ['320mm (Fortuner / Ranger)', 8900]], { Type: 'Slotted', Material: 'High-carbon cast iron', 'Sold As': 'Per piece' }],
    ['brakes', 'Bendix', 'General CT Brake Pads', 4.4, { kind: 'brake', part: 'pads' }, [['Toyota Vios', 1850], ['Mitsubishi Mirage', 1750], ['Nissan Navara', 2650]], { Material: 'Semi-metallic', Position: 'Front' }],
    ['brakes', 'EBC', 'Greenstuff 2000 Sport Pads', 4.6, { kind: 'brake', part: 'pads' }, [['Honda Civic', 4600], ['Subaru / Mazda 3', 4800]], { Material: 'Aramid fiber', Position: 'Front' }],

    ['filters', 'Denso', 'Oil Filter', 4.7, { kind: 'filter', color: '#dc2626' }, [['Toyota (90915-YZZE1)', 380], ['Honda (15400-RAF)', 420], ['Diesel Toyota (90915-30002)', 450]], { Type: 'Spin-on Oil Filter' }],
    ['filters', 'Bosch', 'Premium Oil Filter', 4.5, { kind: 'filter', color: '#1d4ed8' }, [['Universal 4x100 apps', 360], ['Nissan / Mitsubishi', 390]], { Type: 'Spin-on Oil Filter' }],
    ['filters', 'K&N', 'High-Flow Air Filter', 4.8, { kind: 'filter', color: '#b91c1c' }, [['Toyota Vios 2013-2023', 3650], ['Honda Civic FC/FE', 3950], ['Toyota Fortuner 2016+', 4300]], { Type: 'Washable Panel Filter', Warranty: '10 years / 1,000,000 km' }, ['Performance']],
    ['filters', 'Denso', 'Cabin Air Filter (Activated Carbon)', 4.6, { kind: 'filter', color: '#374151' }, [['Toyota / Lexus', 890], ['Honda', 920]], { Type: 'Cabin Filter', Layer: 'Activated carbon' }],
    ['filters', 'Sakura', 'Fuel Filter', 4.4, { kind: 'filter', color: '#2563eb' }, [['Isuzu D-Max / mu-X', 1150], ['Toyota Hilux / Innova', 1250]], { Type: 'Diesel Fuel Filter' }],

    ['suspension', 'KYB', 'Excel-G Shock Absorber', 4.7, { kind: 'shock', color: '#111111' }, [['Toyota Vios (Front, each)', 3200], ['Honda City (Front, each)', 3300], ['Toyota Hilux (Rear, each)', 3600]], { Type: 'Twin-tube gas', 'Sold As': 'Per piece' }],
    ['suspension', 'TEIN', 'Flex Z Coilovers', 4.9, { kind: 'shock', color: '#3b82f6' }, [['Honda Civic FC', 68000], ['Toyota GR86 / BRZ', 72000], ['Mazda 3 BP', 70000]], { Type: 'Full-tap coilover', Adjustability: '16-level damping', 'Sold As': 'Set of 4' }, ['Performance']],
    ['suspension', 'Bilstein', 'B6 4600 Shock Absorber', 4.8, { kind: 'shock', color: '#2563eb' }, [['Toyota Fortuner (Front)', 9800], ['Ford Ranger (Front)', 10200]], { Type: 'Monotube gas', 'Sold As': 'Per piece' }],
    ['suspension', 'Old Man Emu', 'Nitrocharger Sport Kit', 4.8, { kind: 'shock', color: '#1d4ed8' }, [['Toyota Hilux 2016+ (2" lift)', 58000], ['Ford Ranger 2023+ (2" lift)', 62000]], { Type: 'Lift kit (shocks + springs)', Lift: '2 inches' }, ['4x4 Ready']],
    ['suspension', '555', 'Stabilizer Link', 4.4, { kind: 'shock', color: '#6b7280' }, [['Toyota Vios', 950], ['Honda City', 980], ['Mitsubishi Montero', 1250]], { Type: 'Stabilizer / Sway bar link', 'Sold As': 'Per piece' }],

    ['accessories', '70mai', 'Dash Cam A500S Pro Plus+', 4.7, { kind: 'generic', icon: 'camera', color: '#111111' }, [['Front only', 6990], ['Front + Rear Cam', 8490]], { Resolution: '2.7K 1944p', GPS: 'Built-in', Storage: 'Up to 128GB' }, ['Best Seller']],
    ['accessories', 'DDPAI', 'Mola N3 Pro Dash Cam', 4.5, { kind: 'generic', icon: 'camera', color: '#1f2937' }, [['Standard', 5290]], { Resolution: '1600p', 'Night Vision': 'Yes' }],
    ['accessories', '3D MAXpider', 'Kagu Floor Mats', 4.6, { kind: 'generic', icon: 'grid', color: '#111111' }, [['Sedan (Vios / City)', 6500], ['SUV 3-row (Fortuner / Montero)', 8900]], { Material: 'TPE rubber', Fit: 'Vehicle-specific' }],
    ['accessories', 'Baseus', 'Magnetic Phone Holder (Air Vent)', 4.4, { kind: 'generic', icon: 'phone', color: '#374151' }, [['Black', 690], ['Silver', 690]], { Mount: 'Air vent', Charging: 'No' }],
    ['accessories', 'AutoCare', 'Premium Leather Seat Covers', 4.5, { kind: 'generic', icon: 'user', color: '#2b2b2b' }, [['5-Seater', 7800], ['7-Seater', 9800]], { Material: 'PU Leather', Install: 'Free at branch' }],
    ['accessories', '70mai', 'Air Compressor Lite', 4.6, { kind: 'generic', icon: 'wind', color: '#1e3a8a' }, [['Standard', 2290]], { Power: '12V', 'Max Pressure': '150 PSI' }],
    ['accessories', 'AutoCare', 'Windshield Sunshade', 4.3, { kind: 'generic', icon: 'tint', color: '#4b5563' }, [['Medium (Sedan)', 590], ['Large (SUV)', 690]], { Material: 'Reflective nylon' }],

    ['lighting', 'Philips', 'Ultinon Pro6000 LED Headlight', 4.8, { kind: 'bulb' }, [['H4', 5490], ['H11', 5290], ['HB3 / HB4', 5290]], { Color: '5800K Cool White', 'Sold As': 'Pair' }, ['Best Seller']],
    ['lighting', 'Osram', 'Night Breaker Laser Halogen', 4.6, { kind: 'bulb' }, [['H4', 1590], ['H7', 1490], ['H11', 1590]], { Color: '3700K', 'Sold As': 'Pair', Gain: '+150% brightness' }],
    ['lighting', 'Philips', 'X-tremeVision Pro150', 4.5, { kind: 'bulb' }, [['H4', 1690], ['H11', 1690]], { Color: '3500K', 'Sold As': 'Pair' }],
    ['lighting', 'Osram', 'LEDriving Fog Lamp Kit', 4.4, { kind: 'bulb' }, [['Universal', 6900]], { Color: '6000K', Housing: 'Aluminum' }],

    ['carcare', "Meguiar's", 'Gold Class Car Wash Shampoo', 4.8, { kind: 'bottle', color: '#111827', label: 'WASH' }, [['473 ml', 690], ['1.89 L', 1590]], { Type: 'Car Shampoo', pH: 'Neutral' }],
    ['carcare', 'Turtle Wax', 'ICE Seal N Shine', 4.6, { kind: 'bottle', color: '#2563eb', label: 'SEALANT' }, [['680 ml', 990]], { Type: 'Spray Sealant', Protection: 'Up to 6 months' }],
    ['carcare', 'Armor All', 'Original Protectant', 4.5, { kind: 'bottle', color: '#1f2937', label: 'PROTECT' }, [['300 ml', 520], ['500 ml', 790]], { Type: 'Interior Protectant', UV: 'Yes' }],
    ['carcare', 'Chemical Guys', 'Mr. Pink Super Suds Shampoo', 4.7, { kind: 'bottle', color: '#db2777', label: 'MR. PINK' }, [['473 ml', 850]], { Type: 'Car Shampoo', pH: 'Neutral' }],
    ['carcare', 'Formula 1', 'Carnauba Paste Wax', 4.4, { kind: 'generic', icon: 'sparkles', color: '#1f2937' }, [['230 g', 590]], { Type: 'Paste Wax', Base: 'Carnauba' }],

    ['detailing', 'Gtechniq', 'Crystal Serum Light Ceramic Coating', 4.9, { kind: 'bottle', color: '#111111', label: 'CSL' }, [['30 ml', 6500], ['50 ml', 9500]], { Type: 'Ceramic Coating', Durability: 'Up to 5 years' }, ['Pro Grade']],
    ['detailing', 'Koch-Chemie', 'Green Star Universal Cleaner', 4.7, { kind: 'bottle', color: '#15803d', label: 'GSF' }, [['1 Liter', 1250], ['11 kg', 7900]], { Type: 'All-Purpose Cleaner', Dilution: 'Up to 1:100' }],
    ['detailing', 'Sonax', 'Profiline Perfect Finish Polish', 4.7, { kind: 'bottle', color: '#1e3a8a', label: 'POLISH' }, [['250 ml', 1150], ['1 Liter', 2950]], { Type: 'One-step Polish', Cut: 'Medium' }],
    ['detailing', 'AutoCare', 'Microfiber Towel Pack (380 GSM)', 4.6, { kind: 'generic', icon: 'layers', color: '#2563eb' }, [['6-pack', 690], ['12-pack', 1190]], { Material: '80/20 microfiber', GSM: '380' }],
    ['detailing', "Mothers", 'California Gold Clay Bar Kit', 4.5, { kind: 'generic', icon: 'sparkles', color: '#374151' }, [['Standard Kit', 1490]], { Includes: '2 clay bars, lubricant, towel' }],
    ['detailing', 'Chemical Guys', 'TORQ 10FX Random Orbital Polisher', 4.7, { kind: 'generic', icon: 'refresh', color: '#111111' }, [['Polisher only', 12900], ['Polisher + Pad Kit', 15900]], { Power: '750W', Throw: '8 mm' }],

    ['performance', 'K&N', '63-Series AirCharger Cold Air Intake', 4.7, { kind: 'generic', icon: 'wind', color: '#b91c1c' }, [['Toyota Fortuner 2.8 2016+', 28900], ['Ford Ranger 2.0 BiTurbo', 31500]], { Gain: '+8–12 hp (est.)', Warranty: '1 year' }, ['Performance']],
    ['performance', 'NGK', 'Iridium IX Spark Plugs', 4.8, { kind: 'generic', icon: 'zap', color: '#1f2937' }, [['Set of 4', 2800], ['Set of 6', 4200]], { Electrode: 'Iridium', 'Sold As': 'Set' }, ['Best Seller']],
    ['performance', 'Mishimoto', 'Aluminum Performance Radiator', 4.7, { kind: 'generic', icon: 'flame', color: '#374151' }, [['Honda Civic FC/FK', 21500], ['Toyota Hilux / Fortuner', 26800]], { Core: '2-row aluminum', Warranty: 'Lifetime' }],
    ['performance', 'HKS', 'Hi-Power Spec-L Exhaust', 4.8, { kind: 'generic', icon: 'activity', color: '#111111' }, [['Honda Civic Type R FK8', 89000], ['Toyota GR86', 82000]], { Material: 'Stainless steel', Type: 'Cat-back' }, ['Premium']],
    ['performance', 'Cusco', 'Front Strut Tower Bar', 4.6, { kind: 'generic', icon: 'ruler', color: '#1e3a8a' }, [['Honda Civic FC', 11500], ['Toyota Vios / Yaris', 9800]], { Material: 'Aluminum', Type: 'OS (one-piece)' }]
  ];
  const PRE = { batteries: 'BT', oils: 'OL', lubricants: 'LB', brakes: 'BR', filters: 'FL', suspension: 'SU', accessories: 'AC', lighting: 'LT', carcare: 'CC', detailing: 'DT', performance: 'PF' };
  const SUP = { batteries: 3, oils: 4, lubricants: 5, brakes: 6, filters: 6, suspension: 7, accessories: 6, lighting: 6, carcare: 8, detailing: 8, performance: 9 };
  G.forEach((g) => {
    const [cat, brand, name, rating, art, vs, specs, tags] = g;
    const id = pid(PRE[cat]);
    products.push({
      id, cat, brand, name, title: brand + ' ' + name, rating, reviews: Math.round(20 + rnd() * 340), unit: '',
      desc: brand + ' ' + name + ' — genuine product sourced from authorized Philippine distributors. Free installation for eligible items when purchased with a service booking at any AutoCare branch.',
      specs: Object.assign({ Brand: brand }, specs || {}),
      variants: vs.map(([label, price], i) => ({ key: label, label, price, stock: stockFn(), sku: PRE[cat] + '-' + brand.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() + '-' + String(seq).padStart(3, '0') + '-' + (i + 1) })),
      art, minStock: cat === 'oils' || cat === 'filters' ? 10 : 4, supplier: SUPPLIERS[SUP[cat]], tags: tags || []
    });
  });

  /* Helpers */
  function minPrice(p) { return Math.min.apply(null, p.variants.map((v) => v.price)); }
  function totalStock(p) { return u.sum(p.variants, (v) => v.stock); }
  function stockStatus(stock, min) { return stock <= 0 ? 'Out of Stock' : stock <= (min || 4) ? 'Low Stock' : 'In Stock'; }
  function catName(id) { const c = CATEGORIES.find((x) => x.id === id); return c ? c.name : id; }
  function variantSpec(p, v) {
    if (!v) return '';
    if (p.cat === 'tires') return v.label + ' · ' + v.attrs.load + v.attrs.speed;
    if (p.cat === 'wheels') return v.attrs.diameter + '×' + v.attrs.width + ' · ' + v.attrs.pcd + ' · ET' + (v.attrs.offset >= 0 ? '+' : '') + v.attrs.offset;
    return v.label;
  }

  AC.data.categories = CATEGORIES;
  AC.data.productSeed = products;
  AC.data.productHelpers = { minPrice, totalStock, stockStatus, catName, variantSpec };
})();
