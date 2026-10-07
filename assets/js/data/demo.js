/* =========================================================
   AUTOCARE — data/demo.js
   Realistic Philippine demo data. All dates are generated
   relative to TODAY so the demo always looks current.
   AC.demo.build() returns a fresh application state.
   ========================================================= */
window.AC = window.AC || {};
AC.data = AC.data || {};

/* Booking services (customer side) */
AC.data.services = [
  { id: 'SV-PMS', name: 'PMS (Preventive Maintenance)', short: 'PMS', icon: 'wrench', price: 4500, dur: 180, desc: 'Manufacturer-schedule maintenance: oil, filters, fluids & 30-point inspection.' },
  { id: 'SV-OIL', name: 'Oil Change', short: 'Oil Change', icon: 'droplet', price: 1800, dur: 45, desc: 'Fully synthetic oil + genuine oil filter replacement.' },
  { id: 'SV-BRK', name: 'Brake Service', short: 'Brake Service', icon: 'disc', price: 2500, dur: 90, desc: 'Pad inspection/replacement, rotor check & brake fluid top-up.' },
  { id: 'SV-TIRE', name: 'Tire Change', short: 'Tire Change', icon: 'tire', price: 800, dur: 60, desc: 'Mounting of 4 tires incl. valve replacement (tires sold separately).' },
  { id: 'SV-ALIGN', name: 'Wheel Alignment', short: 'Alignment', icon: 'target', price: 1200, dur: 60, desc: '3D computerized 4-wheel alignment with printout.' },
  { id: 'SV-BAL', name: 'Wheel Balancing', short: 'Balancing', icon: 'wheel', price: 600, dur: 45, desc: 'Dynamic balancing for all 4 wheels with premium weights.' },
  { id: 'SV-BATT', name: 'Battery Replacement', short: 'Battery', icon: 'battery', price: 500, dur: 30, desc: 'Battery testing, replacement & charging system check.' },
  { id: 'SV-DIAG', name: 'Engine Diagnostics', short: 'Diagnostics', icon: 'gauge', price: 1500, dur: 60, desc: 'OBD-II scan, live data analysis & fault code report.' },
  { id: 'SV-AC', name: 'AC Service', short: 'AC Service', icon: 'wind', price: 3500, dur: 120, desc: 'AC cleaning, refrigerant recharge & leak test.' },
  { id: 'SV-SUSP', name: 'Suspension Repair', short: 'Suspension', icon: 'spring', price: 5500, dur: 240, desc: 'Shock absorbers, links, bushings & steering components.' },
  { id: 'SV-DET', name: 'Detailing', short: 'Detailing', icon: 'sparkles', price: 4800, dur: 300, desc: 'Interior deep clean, paint decontamination, polish & wax.' },
  { id: 'SV-WASH', name: 'Car Wash', short: 'Car Wash', icon: 'droplet', price: 350, dur: 40, desc: 'Exterior hand wash, vacuum & tire dressing.' },
  { id: 'SV-PAINT', name: 'Paint / Body', short: 'Paint/Body', icon: 'paint', price: 8500, dur: 480, desc: 'Minor dent repair, panel paint & color matching.' },
  { id: 'SV-TINT', name: 'Tint Installation', short: 'Tint', icon: 'tint', price: 6500, dur: 240, desc: 'Nano-ceramic window tint, full car installation.' }
];

/* Landing page service categories */
AC.data.serviceCategories = [
  { name: 'Preventive Maintenance', icon: 'wrench', desc: 'Oil change, filters, fluids, inspections and scheduled maintenance.', feature: true },
  { name: 'Mechanical Repair', icon: 'settings', desc: 'Engine, transmission, suspension, brakes and drivetrain.' },
  { name: 'Electrical Diagnostics', icon: 'zap', desc: 'Battery, alternator, starter, wiring and electrical diagnostics.' },
  { name: 'Air Conditioning', icon: 'wind', desc: 'AC diagnostics, refrigerant service, compressor and cooling system.' },
  { name: 'Tire Services', icon: 'tire', desc: 'Tire installation, balancing, rotation, repair and replacement.' },
  { name: 'Wheel / Mag Services', icon: 'wheel', desc: 'Alloy wheel installation, wheel balancing and fitment.' },
  { name: 'Detailing', icon: 'sparkles', desc: 'Interior cleaning, exterior detailing, polishing and waxing.' },
  { name: 'Paint & Body', icon: 'paint', desc: 'Minor body repair, paint correction and restoration.' },
  { name: 'Window Tint', icon: 'tint', desc: 'Automotive window tint installation.' },
  { name: 'Battery Services', icon: 'battery', desc: 'Battery testing, replacement and installation.' },
  { name: 'Accessories', icon: 'camera', desc: 'Car accessories, lighting, mats, dashcams and other products.' }
];

AC.data.timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
AC.data.trackerStages = ['Vehicle Received', 'Inspection', 'Diagnosis', 'Service In Progress', 'Quality Check', 'Ready for Release'];
AC.data.woStatuses = ['Pending', 'Inspection', 'Diagnosis', 'In Progress', 'Quality Check', 'Completed'];
AC.data.orderStatuses = ['Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'];
AC.data.apptStatuses = ['Pending', 'Approved', 'In Progress', 'Completed', 'Rescheduled', 'Cancelled'];

AC.demo = (function () {
  const u = AC.u;
  const VERSION = 4;

  function build() {
    const T = u.today();
    const rnd = u.rng(7341);
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const D = (n) => u.addDays(T, n);
    const at = (n, hhmm) => u.dateTime(D(n), hhmm);

    /* Technicians */
    const technicians = [
      ['Ramon Villanueva', 'Mechanical', 4.9, 'On Job'], ['Jerome Bautista', 'Electrical', 4.8, 'Available'],
      ['Mark Anthony Ramos', 'Tires', 4.7, 'On Job'], ['Paolo Mendoza', 'Wheels', 4.8, 'Available'],
      ['Arnel Castillo', 'Aircon', 4.6, 'On Job'], ['Rico Navarro', 'Detailing', 4.9, 'Available'],
      ['Dennis Aquino', 'Body Repair', 4.5, 'Off Duty'], ['Joel Pascual', 'Mechanical', 4.7, 'Available']
    ].map((t, i) => ({ id: 'TEC-' + String(i + 1).padStart(2, '0'), empId: 'EMP-' + (2101 + i * 7), name: t[0], spec: t[1], rating: t[2], status: t[3], phone: '+63 9' + (17 + i) + ' ' + (300 + i * 41) + ' ' + (1200 + i * 317), joined: u.addMonths(T, -(8 + i * 5)), completed: 120 + Math.round(rnd() * 380), current: 0 }));

    /* Customers */
    const CITIES = [
      ['Makati City', 'Unit 12B, Avida Towers, Sen. Gil Puyat Ave'], ['Quezon City', '41 Scout Tobias St., Brgy. Laging Handa'], ['Pasig City', '18 Emerald Ave., Ortigas Center'],
      ['Taguig City', '5th Ave. cor. 26th St., BGC'], ['Mandaluyong City', '723 Shaw Blvd., Brgy. Wack-Wack'], ['Manila', '1250 España Blvd., Sampaloc'],
      ['Parañaque City', '22 Aguirre Ave., BF Homes'], ['Las Piñas City', '9 Alabang–Zapote Rd., Pamplona'], ['Muntinlupa City', '14 Acacia Ave., Ayala Alabang'],
      ['Antipolo City', '88 Sumulong Hwy., Brgy. Mambugan'], ['Cainta, Rizal', '3 Felix Ave., Brgy. San Isidro'], ['Marikina City', '56 Gil Fernando Ave., San Roque'],
      ['Caloocan City', '201 Rizal Ave. Ext., Grace Park'], ['San Juan City', '17 Wilson St., Greenhills'], ['Bacoor, Cavite', '45 Aguinaldo Hwy., Molino'],
      ['Dasmariñas, Cavite', '12 Congressional Ave., Brgy. Salitran'], ['Santa Rosa, Laguna', '8 Balibago Rd., Nuvali'], ['Calamba, Laguna', '31 Real St., Brgy. Parian'],
      ['Cebu City', '77 Gorordo Ave., Lahug'], ['Davao City', '102 J.P. Laurel Ave., Bajada'], ['Iloilo City', '15 Diversion Rd., Mandurriao'],
      ['Baguio City', '6 Leonard Wood Rd.'], ['Angeles, Pampanga', '29 Friendship Hwy., Cutcut'], ['Malolos, Bulacan', '64 MacArthur Hwy., Sumapang Matanda']
    ];
    const NAMES = ['Miguel Dela Cruz', 'Andrea Mae Villanueva', 'Paolo Garcia', 'Kristine Joy Mendoza', 'Mark Joseph Torres', 'Jasmine Ramos', 'Carlo Miguel Bautista',
      'Angelica Flores', 'Joshua Gonzales', 'Patricia Ann Cruz', 'Rafael Aquino', 'Bea Marie Castillo', 'John Paul Navarro', 'Camille Fernandez', 'Kevin Lim', 'Nicole Tan',
      'Gabriel Ocampo', 'Sofia Mercado', 'Emmanuel Pascual', 'Ella Marie Domingo', 'Vincent Uy', 'Trisha Mae Soriano', 'Adrian Salazar', 'Rhea Lopez'];
    const customers = NAMES.map((n, i) => {
      const parts = n.toLowerCase().split(' ');
      const email = (parts[0] + '.' + parts[parts.length - 1]).replace(/[^a-z.]/g, '') + (i ? i : '') + '@' + pick(['gmail.com', 'yahoo.com', 'outlook.com', 'gmail.com']);
      return {
        id: 'CUS-' + (1001 + i), name: n, email: i === 0 ? 'miguel.delacruz@gmail.com' : email,
        phone: '+63 9' + (15 + (i % 14)) + ' ' + (100 + Math.floor(rnd() * 899)) + ' ' + (1000 + Math.floor(rnd() * 8999)),
        city: CITIES[i][0], address: CITIES[i][1] + ', ' + CITIES[i][0], joined: i === 0 ? '2023-03-14' : u.addDays(T, -(20 + Math.floor(rnd() * 900))),
        status: i === 17 ? 'Suspended' : i === 22 ? 'Inactive' : 'Active', tier: i % 5 === 0 ? 'VIP' : 'Regular'
      };
    });

    /* Vehicles */
    const V = [
      [0, 'Toyota', 'Vios', 2022, '1.3 XLE CVT', '1.3L Dual VVT-i', 'CVT', 'Pearl White', 48230, 'ABC 1234', 'Good Condition'],
      [0, 'Toyota', 'Fortuner', 2023, '2.8 LTD 4x4 AT', '2.8L 1GD-FTV Diesel', 'Automatic', 'Attitude Black', 21540, 'NBC 4521', 'In Service'],
      [0, 'Honda', 'City', 2019, '1.5 VX Navi CVT', '1.5L i-VTEC', 'CVT', 'Modern Steel', 72110, 'DAF 7782', 'Service Due'],
      [1, 'Mitsubishi', 'Xpander', 2023, '1.5 GLS AT', '1.5L MIVEC', 'Automatic', 'Silver Metallic', 18420, 'NEB 3318', 'Good Condition'],
      [2, 'Ford', 'Ranger', 2024, '2.0 Wildtrak 4x4 AT', '2.0L Bi-Turbo Diesel', 'Automatic', 'Gray Metallic', 12850, 'NHA 2045', 'Good Condition'],
      [3, 'Honda', 'Civic', 2022, '1.5 RS Turbo CVT', '1.5L VTEC Turbo', 'CVT', 'Red Mica', 30210, 'NAK 8851', 'Good Condition'],
      [4, 'Toyota', 'Hilux', 2021, '2.4 G 4x2 MT', '2.4L 2GD-FTV Diesel', 'Manual', 'Super White', 88400, 'CAX 6120', 'Service Due'],
      [5, 'Suzuki', 'Ertiga', 2022, '1.5 GLX AT', '1.5L K15B', 'Automatic', 'Dark Blue Mica', 35770, 'NCD 4410', 'Good Condition'],
      [6, 'Nissan', 'Navara', 2022, '2.5 VL 4x4 AT', '2.5L YD25 Diesel', 'Automatic', 'Gray Metallic', 52300, 'NDE 9087', 'Good Condition'],
      [6, 'Toyota', 'Wigo', 2020, '1.0 G AT', '1.0L 1KR-FE', 'Automatic', 'Red Mica', 61200, 'DBQ 2219', 'Service Due'],
      [7, 'Hyundai', 'Stargazer', 2023, '1.5 GLS IVT', '1.5L Smartstream', 'IVT', 'Pearl White', 15400, 'NFG 7761', 'Good Condition'],
      [8, 'Mitsubishi', 'Montero Sport', 2020, '2.4 GT 4x4 AT', '2.4L 4N15 Diesel', 'Automatic', 'Attitude Black', 97850, 'NAB 1176', 'Needs Attention'],
      [9, 'Toyota', 'Innova', 2021, '2.8 E AT', '2.8L 1GD-FTV Diesel', 'Automatic', 'Silver Metallic', 70110, 'NCQ 5302', 'Good Condition'],
      [10, 'Kia', 'Seltos', 2022, '1.6 EX IVT', '1.6L Gamma', 'IVT', 'Pearl White', 28400, 'NFA 6654', 'Good Condition'],
      [11, 'Isuzu', 'mu-X', 2023, '3.0 LS-E 4x4 AT', '3.0L 4JJ3 Diesel', 'Automatic', 'Bronze Mica', 22100, 'NGT 3390', 'Good Condition'],
      [12, 'Toyota', 'Corolla Cross', 2023, '1.8 V Hybrid', '1.8L Hybrid', 'e-CVT', 'Pearl White', 19800, 'NHB 2271', 'Good Condition'],
      [13, 'Mazda', 'CX-5', 2022, '2.5 Turbo AWD', '2.5L SkyActiv-G Turbo', 'Automatic', 'Red Mica', 33600, 'NBM 7745', 'Good Condition'],
      [14, 'Honda', 'BR-V', 2023, '1.5 VX CVT', '1.5L i-VTEC', 'CVT', 'Modern Steel', 16800, 'NIC 4012', 'Good Condition'],
      [15, 'BYD', 'Atto 3', 2024, 'Extended Range', 'Electric (150 kW)', 'Single-speed', 'Gray Metallic', 9100, 'NJZ 8820', 'Good Condition'],
      [16, 'Nissan', 'Almera', 2022, '1.0 VL Turbo CVT', '1.0L HRA0 Turbo', 'CVT', 'Silver Metallic', 27500, 'NDF 1503', 'Good Condition'],
      [17, 'Toyota', 'Raize', 2023, '1.0 Turbo CVT', '1.0L 1KR-VET Turbo', 'CVT', 'Dark Blue Mica', 14200, 'NEX 5532', 'Good Condition'],
      [18, 'Hyundai', 'Tucson', 2022, '2.0 GLS AT', '2.0L Smartstream', 'Automatic', 'Super White', 41200, 'NCR 3301', 'Good Condition'],
      [19, 'Suzuki', 'Jimny', 2021, '1.5 GLX 4x4 AT', '1.5L K15B', 'Automatic', 'Gray Metallic', 38800, 'DAQ 7718', 'Good Condition'],
      [20, 'Geely', 'Coolray', 2022, '1.5 Sport', '1.5L Turbo', 'DCT', 'Red Mica', 31800, 'NFE 2266', 'Good Condition'],
      [21, 'Toyota', 'Hiace', 2020, 'Commuter Deluxe MT', '2.8L 1GD-FTV Diesel', 'Manual', 'Super White', 132400, 'NBQ 8840', 'Needs Attention'],
      [22, 'MG', 'ZS', 2023, '1.5 Alpha AT', '1.5L VTi-Tech', 'Automatic', 'Pearl White', 17300, 'NIB 6614', 'Good Condition'],
      [23, 'Mitsubishi', 'Mirage G4', 2021, '1.2 GLS CVT', '1.2L MIVEC', 'CVT', 'Silver Metallic', 54700, 'DBC 3317', 'Good Condition'],
      [3, 'Toyota', 'Camry', 2021, '2.5 V AT', '2.5L Dynamic Force', 'Automatic', 'Attitude Black', 46100, 'NAQ 2002', 'Good Condition'],
      [8, 'Kia', 'Carnival', 2023, '2.2 EX', '2.2L CRDi Diesel', 'Automatic', 'Silver Metallic', 23900, 'NHM 4498', 'Good Condition'],
      [12, 'BYD', 'Seal', 2024, 'Premium RWD', 'Electric (230 kW)', 'Single-speed', 'Dark Blue Mica', 6200, 'NKA 1029', 'Good Condition']
    ];
    const vehicles = V.map((r, i) => {
      const cat = AC.data.vehicles.find(r[1], r[2]) || {};
      const col = AC.data.vehicles.COLORS.find((c) => c.name === r[7]) || AC.data.vehicles.COLORS[0];
      const last = D(-(8 + Math.floor(rnd() * 120)));
      const vin = ('MR0' + r[1].slice(0, 2).toUpperCase() + 'X' + (100000000 + Math.floor(rnd() * 899999999)) + 'P').slice(0, 17);
      return {
        id: 'VEH-' + (2001 + i), customerId: customers[r[0]].id, brand: r[1], model: r[2], year: r[3], variant: r[4], engine: r[5], transmission: r[6],
        fuel: cat.fuel || 'Gasoline', color: r[7], colorHex: col.hex, mileage: r[8], plate: r[9], vin, body: cat.body || 'sedan',
        regDate: (r[3]) + '-' + u.pad(1 + (i % 12)) + '-' + u.pad(5 + (i % 20)), lastService: i === 0 ? D(-46) : last,
        nextService: i === 0 ? D(3) : i === 2 ? D(-5) : u.addMonths(last, 6), condition: r[10]
      };
    });

    /* Service records (history) */
    const S = AC.data.services;
    const svc = (id) => S.find((s) => s.id === id);
    const records = [];
    let inv = 4120;
    const addRec = (vi, days, sid, techIdx, cost, notes) => {
      const v = vehicles[vi];
      records.push({
        id: 'SR-' + (7000 + records.length), date: D(days), vehicleId: v.id, customerId: v.customerId, serviceId: sid, service: svc(sid).name,
        techId: technicians[techIdx].id, mileage: Math.max(1000, v.mileage - Math.round(Math.abs(days) * 38)), cost, status: 'Completed',
        invoice: 'INV-' + new Date().getFullYear() + '-' + (inv++), notes: notes || '', paid: true
      });
    };
    addRec(0, -46, 'SV-PMS', 0, 5850, '40,000 km PMS. Replaced oil, oil filter, air filter. Rotated tires.');
    addRec(0, -182, 'SV-ALIGN', 3, 1200, 'Front toe adjusted. Steering wheel centered.');
    addRec(0, -260, 'SV-OIL', 7, 2150, 'Shell Helix Ultra 5W-40 + Denso filter.');
    addRec(1, -120, 'SV-PMS', 0, 7450, '20,000 km PMS (diesel). Fuel filter replaced.');
    addRec(1, -210, 'SV-TINT', 6, 18500, 'Nano-ceramic tint, 70% front / 50% sides.');
    addRec(2, -95, 'SV-BATT', 1, 6100, 'Replaced with Motolite Gold NS60. Alternator OK.');
    addRec(2, -150, 'SV-AC', 4, 3500, 'AC cleaning + R134a recharge. Cabin filter replaced.');
    addRec(2, -330, 'SV-BRK', 0, 4250, 'Front pads replaced (Akebono). Rotors within spec.');
    addRec(0, -360, 'SV-DET', 5, 4800, 'Full detail + carnauba wax.');
    for (let i = 3; i < vehicles.length; i++) {
      const n = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const s = pick(S);
        addRec(i, -(4 + Math.floor(rnd() * 300)), s.id, Math.floor(rnd() * 8), Math.round(s.price * (1 + rnd() * .6) / 50) * 50);
      }
    }
    records.sort((a, b) => b.date.localeCompare(a.date));

    /* Appointments */
    const appointments = [];
    let aptN = 5101;
    const addApt = (vi, dayOff, time, sid, status, techIdx, notes) => {
      const v = vehicles[vi];
      appointments.push({
        id: 'APT-' + (aptN++), customerId: v.customerId, vehicleId: v.id, serviceId: sid, service: svc(sid).name, date: D(dayOff), time,
        status, techId: techIdx == null ? null : technicians[techIdx].id, notes: notes || '', estimate: svc(sid).price,
        createdAt: at(dayOff - 3, '10:15')
      });
    };
    addApt(1, 0, '08:30', 'SV-PMS', 'In Progress', 0, 'Customer reports slight brake squeal.');
    addApt(0, 3, '09:00', 'SV-PMS', 'Approved', 7, '50,000 km PMS');
    addApt(2, 9, '13:30', 'SV-AC', 'Pending', null, 'AC not cold enough during afternoons.');
    addApt(3, 0, '09:00', 'SV-OIL', 'In Progress', 7);
    addApt(4, 0, '10:00', 'SV-ALIGN', 'Approved', 3);
    addApt(5, 0, '11:00', 'SV-DET', 'Pending', null);
    addApt(6, 0, '13:00', 'SV-SUSP', 'Approved', 0, 'Rear leaf spring noise.');
    addApt(7, 0, '14:30', 'SV-BATT', 'Pending', null);
    addApt(11, 0, '15:00', 'SV-DIAG', 'In Progress', 1, 'Check engine light on.');
    addApt(8, 1, '08:00', 'SV-TIRE', 'Approved', 2);
    addApt(9, 1, '10:30', 'SV-WASH', 'Pending', null);
    addApt(10, 1, '14:00', 'SV-AC', 'Approved', 4);
    addApt(12, 2, '09:30', 'SV-PMS', 'Pending', null);
    addApt(13, 2, '13:00', 'SV-TINT', 'Approved', 6);
    addApt(14, 4, '08:30', 'SV-BRK', 'Pending', null);
    addApt(15, 5, '10:00', 'SV-PAINT', 'Rescheduled', 6, 'Moved from earlier date per customer request.');
    addApt(16, 6, '11:00', 'SV-BAL', 'Pending', null);
    addApt(17, 7, '15:30', 'SV-DET', 'Approved', 5);
    addApt(18, 8, '09:00', 'SV-DIAG', 'Pending', null);
    addApt(19, 12, '13:30', 'SV-OIL', 'Pending', null);
    addApt(20, -1, '09:00', 'SV-PMS', 'Completed', 0);
    addApt(21, -1, '13:00', 'SV-AC', 'Completed', 4);
    addApt(22, -2, '10:00', 'SV-TIRE', 'Completed', 2);
    addApt(23, -2, '14:00', 'SV-WASH', 'Cancelled', null, 'Customer no-show.');
    addApt(24, -3, '08:30', 'SV-SUSP', 'Completed', 0);
    addApt(25, -4, '11:00', 'SV-DET', 'Completed', 5);
    addApt(26, -5, '09:30', 'SV-BRK', 'Completed', 7);
    addApt(27, -6, '15:00', 'SV-ALIGN', 'Completed', 3);
    addApt(0, -46, '09:00', 'SV-PMS', 'Completed', 0);
    addApt(2, -95, '10:30', 'SV-BATT', 'Completed', 1);

    /* Work orders */
    const P = AC.data.productSeed;
    const pByCat = (cat, i) => P.filter((p) => p.cat === cat)[i];
    const workOrders = [];
    let woN = 1036;
    const addWO = (apt, status, diag, parts, labor, extra) => {
      const v = vehicles.find((x) => x.id === apt.vehicleId);
      const partsCost = u.sum(parts, (p) => p.qty * p.price);
      const est = partsCost + labor;
      workOrders.push(Object.assign({
        id: 'WO-' + (woN++), apptId: apt.id, customerId: apt.customerId, vehicleId: v.id, plate: v.plate, techId: apt.techId || technicians[7].id,
        service: apt.service, diagnosis: diag, parts, labor, estimate: est, final: status === 'Completed' ? est : null, status,
        started: u.dateTime(apt.date, apt.time), completed: status === 'Completed' ? u.dateTime(apt.date, '16:30') : null,
        stageTimes: {}
      }, extra || {}));
    };
    const A = (id) => appointments.find((a) => a.id === id);
    addWO(A('APT-5121'), 'Completed', 'Routine PMS. All fluids topped up.', [{ name: 'Engine Oil 5W-30 (4L)', qty: 1, price: 3250 }, { name: 'Oil Filter', qty: 1, price: 380 }], 1800);
    addWO(A('APT-5122'), 'Completed', 'Compressor clutch OK; low refrigerant.', [{ name: 'R134a Refrigerant', qty: 1, price: 1200 }, { name: 'Cabin Filter', qty: 1, price: 890 }], 2300);
    addWO(A('APT-5123'), 'Completed', 'Tire replacement x4 + balancing.', [{ name: 'Tire Valve (Set)', qty: 1, price: 400 }], 800);
    addWO(A('APT-5125'), 'Completed', 'Rear shocks leaking — replaced.', [{ name: 'KYB Excel-G Rear Shock', qty: 2, price: 3600 }], 2500);
    addWO(A('APT-5126'), 'Completed', 'Full interior + exterior detail.', [], 4800);
    addWO(A('APT-5127'), 'Completed', 'Front pads at 2mm — replaced.', [{ name: 'Akebono Ceramic Pads (Front)', qty: 1, price: 2950 }], 1200);
    addWO(A('APT-5101'), 'In Progress', 'Front brake pads at 3mm; minor rotor glazing. PMS 20,000 km diesel schedule.', [{ name: 'Shell Rimula R4 X 15W-40 (7L)', qty: 1, price: 3100 }, { name: 'Denso Oil Filter (Diesel)', qty: 1, price: 450 }, { name: 'Akebono Ceramic Pads — Fortuner', qty: 1, price: 4200 }], 3200,
      { stageTimes: { 0: at(0, '08:30'), 1: at(0, '08:52'), 2: at(0, '09:35'), 3: at(0, '10:10') } });
    addWO(A('APT-5104'), 'Quality Check', 'Oil change — no leaks found.', [{ name: 'Petron Blaze 5W-40 (4L)', qty: 1, price: 1950 }, { name: 'Oil Filter', qty: 1, price: 380 }], 600);
    addWO(A('APT-5109'), 'Diagnosis', 'P0300 random misfire detected. Checking coils & plugs.', [], 1500);
    addWO(A('APT-5105'), 'Inspection', 'Pulling to the right; uneven tire wear.', [], 1200);
    addWO(A('APT-5107'), 'Pending', 'Awaiting vehicle drop-off.', [], 5500);
    addWO(A('APT-5110'), 'Pending', 'Tire change x4 — customer-supplied tires.', [], 800);
    technicians.forEach((t) => { t.current = workOrders.filter((w) => w.techId === t.id && w.status !== 'Completed').length; });

    /* Orders */
    const orders = [];
    let ordN = 10471;
    const item = (p, vi, qty) => ({ pid: p.id, vkey: p.variants[vi || 0].key, name: p.title, variant: p.variants[vi || 0].label, price: p.variants[vi || 0].price, qty: qty || 1 });
    const addOrd = (ci, days, items, status, payment, delivery, paid) => {
      const sub = u.sum(items, (i) => i.price * i.qty);
      const ship = delivery === 'delivery' ? (sub >= 10000 ? 0 : 250) : 0;
      const c = customers[ci];
      const idx = AC.data.orderStatuses.indexOf(status);
      const flow = delivery === 'delivery' ? ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Completed'] : ['Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Completed'];
      const timeline = [];
      if (status === 'Cancelled') { timeline.push({ status: 'Pending', at: at(days, '10:12') }, { status: 'Cancelled', at: at(days, '15:40') }); }
      else flow.forEach((s, k) => { if (flow.indexOf(status) >= k) timeline.push({ status: s, at: at(days + Math.floor(k / 2), u.pad(9 + k * 2) + ':' + u.pad((k * 17) % 60)) }); });
      orders.push({
        id: 'ORD-' + (ordN++), customerId: c.id, customer: c.name, date: at(days, '10:12'), items, subtotal: sub, shipping: ship, discount: 0, total: sub + ship,
        delivery, payment, paymentStatus: paid ? 'Paid' : 'Unpaid', status, address: c.address, phone: c.phone, email: c.email, timeline, idx
      });
    };
    addOrd(4, -20, [item(pByCat('tires', 9), 0, 4)], 'Completed', 'GCash', 'pickup', true);
    addOrd(7, -16, [item(pByCat('oils', 0), 1, 1), item(pByCat('filters', 0), 0, 1)], 'Completed', 'Cash on Delivery', 'delivery', true);
    addOrd(9, -14, [item(pByCat('accessories', 0), 1, 1)], 'Completed', 'Card', 'delivery', true);
    addOrd(11, -12, [item(pByCat('wheels', 0), 0, 1)], 'Completed', 'Bank Transfer', 'pickup', true);
    addOrd(0, -10, [item(pByCat('tires', 3), 0, 4)], 'Completed', 'GCash', 'pickup', true);
    addOrd(13, -9, [item(pByCat('detailing', 0), 0, 1), item(pByCat('carcare', 0), 0, 1)], 'Completed', 'Maya', 'delivery', true);
    addOrd(15, -8, [item(pByCat('lighting', 0), 0, 1)], 'Cancelled', 'GCash', 'delivery', false);
    addOrd(16, -6, [item(pByCat('batteries', 0), 1, 1)], 'Completed', 'Cash on Delivery', 'delivery', true);
    addOrd(18, -5, [item(pByCat('tires', 5), 0, 4)], 'Completed', 'Card', 'pickup', true);
    addOrd(0, -3, [item(pByCat('batteries', 0), 1, 1), item(pByCat('oils', 0), 1, 1)], 'Out for Delivery', 'Cash on Delivery', 'delivery', false);
    addOrd(2, -2, [item(pByCat('wheels', 14), 0, 1), item(pByCat('tires', 8), 0, 4)], 'Processing', 'Bank Transfer', 'pickup', true);
    addOrd(5, -1, [item(pByCat('performance', 1), 0, 1)], 'Ready for Pickup', 'GCash', 'pickup', true);
    addOrd(20, 0, [item(pByCat('tires', 0), 0, 4)], 'Pending', 'GCash', 'delivery', false);
    addOrd(0, 0, [item(pByCat('accessories', 2), 0, 1)], 'Processing', 'Maya', 'delivery', true);
    addOrd(21, 0, [item(pByCat('suspension', 0), 0, 2)], 'Confirmed', 'Card', 'pickup', true);
    addOrd(14, 0, [item(pByCat('carcare', 1), 0, 2), item(pByCat('detailing', 3), 1, 1)], 'Pending', 'Cash on Delivery', 'delivery', false);
    orders.sort((a, b) => b.date.localeCompare(a.date));

    /* Payments */
    const payments = [];
    let payN = 88001;
    orders.forEach((o) => payments.push({ id: 'PAY-' + (payN++), ref: o.id, type: 'Shop Order', customerId: o.customerId, amount: o.total, method: o.payment, status: o.status === 'Cancelled' ? 'Refunded' : o.paymentStatus === 'Paid' ? 'Paid' : 'Pending', date: o.date }));
    workOrders.forEach((w) => payments.push({ id: 'PAY-' + (payN++), ref: w.id, type: 'Service', customerId: w.customerId, amount: w.final || w.estimate, method: w.status === 'Completed' ? pick(['Cash', 'GCash', 'Card', 'Maya']) : '—', status: w.status === 'Completed' ? 'Paid' : 'Pending', date: w.started }));
    payments.sort((a, b) => b.date.localeCompare(a.date));

    /* Notifications */
    const notifications = {
      admin: [
        { id: 'N1', type: 'booking', title: 'New Service Booking', msg: 'Jasmine Ramos booked Detailing for Honda Civic.', at: at(0, '07:42'), read: false, link: '#/appointments' },
        { id: 'N2', type: 'stock', title: 'Low Stock Alert', msg: 'Michelin Primacy 4+ (215/55 R17) has only 2 units remaining.', at: at(0, '07:30'), read: false, link: '#/inventory' },
        { id: 'N3', type: 'order', title: 'New Order', msg: 'Order #ORD-10483 has been placed.', at: at(0, '10:12'), read: false, link: '#/orders' },
        { id: 'N4', type: 'done', title: 'Service Completed', msg: 'Toyota Hiace (NBQ 8840) is ready for release.', at: at(-1, '16:35'), read: true, link: '#/workorders' },
        { id: 'N5', type: 'booking', title: 'Booking Rescheduled', msg: 'Nicole Tan moved Paint / Body to ' + u.fmtDate(D(5)) + '.', at: at(-1, '14:10'), read: true, link: '#/appointments' },
        { id: 'N6', type: 'payment', title: 'Payment Received', msg: 'Bank transfer confirmed for ORD-10481.', at: at(-2, '11:20'), read: true, link: '#/payments' },
        { id: 'N7', type: 'stock', title: 'Out of Stock', msg: 'A wheel SKU just sold out — review inventory.', at: at(-2, '09:05'), read: true, link: '#/inventory' }
      ],
      customer: [
        { id: 'C1', type: 'service', title: 'Service In Progress', msg: 'Your Toyota Fortuner (NBC 4521) is now being serviced by Ramon V.', at: at(0, '10:10'), read: false, link: '#/tracking' },
        { id: 'C2', type: 'order', title: 'Order Out for Delivery', msg: 'ORD-10480 is on the way. Rider ETA: today, 3:00–5:00 PM.', at: at(0, '09:05'), read: false, link: '#/orders' },
        { id: 'C3', type: 'booking', title: 'Appointment Approved', msg: 'PMS for Toyota Vios on ' + u.fmtDate(D(3)) + ' at 9:00 AM is confirmed.', at: at(-1, '16:20'), read: false, link: '#/dashboard' },
        { id: 'C4', type: 'reminder', title: 'Service Due', msg: 'Honda City (DAF 7782) is due for PMS. Book now to stay on schedule.', at: at(-2, '08:00'), read: true, link: '#/book' },
        { id: 'C5', type: 'promo', title: 'Tire Month Promo', msg: 'Buy 3 get 1 on selected Bridgestone & Yokohama tires.', at: at(-4, '12:00'), read: true, link: 'shop.html#/category/tires' }
      ]
    };

    /* Activity log */
    const activity = [
      { actor: 'Admin', name: 'Leah Santos', action: 'Added new tire product', target: 'Nitto Ridge Grappler', at: at(0, '10:42') },
      { actor: 'Staff', name: 'Ivan Cruz', action: 'Updated work order', target: 'WO-1042', at: at(0, '10:35') },
      { actor: 'Technician', name: 'Ramon Villanueva', action: 'Completed brake inspection', target: 'Toyota Fortuner · NBC 4521', at: at(0, '10:21') },
      { actor: 'Staff', name: 'Ivan Cruz', action: 'Approved appointment', target: 'APT-5105', at: at(0, '09:48') },
      { actor: 'Technician', name: 'Jerome Bautista', action: 'Started diagnosis', target: 'WO-1044', at: at(0, '09:30') },
      { actor: 'Admin', name: 'Leah Santos', action: 'Adjusted stock (+12)', target: 'Petron Blaze Racing 5W-40', at: at(0, '08:55') },
      { actor: 'System', name: 'AutoCare', action: 'Sent low stock alert', target: 'Michelin Primacy 4+', at: at(0, '07:30') },
      { actor: 'Staff', name: 'Mae Reyes', action: 'Marked order as ready for pickup', target: 'ORD-10482', at: at(-1, '17:05') },
      { actor: 'Admin', name: 'Leah Santos', action: 'Created promotion', target: 'Tire Month — Buy 3 Get 1', at: at(-1, '15:22') },
      { actor: 'Technician', name: 'Rico Navarro', action: 'Completed detailing', target: 'MG ZS · NIB 6614', at: at(-1, '14:48') }
    ];

    /* Analytics (historical, last 12 months) */
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push(u.MONTHS[d.getMonth()]); }
    const serviceRev = [612000, 598000, 655000, 701000, 688000, 742000, 765000, 731000, 802000, 846000, 879000, 0].map((v) => Math.round(v * (0.96 + rnd() * .08) / 100) * 100);
    const productRev = [418000, 402000, 455000, 498000, 471000, 532000, 588000, 545000, 611000, 652000, 701000, 0].map((v) => Math.round(v * (0.96 + rnd() * .08) / 100) * 100);
    serviceRev[11] = 312400; productRev[11] = 248900; // month-to-date
    const newCustomers = [38, 41, 47, 52, 49, 58, 63, 61, 70, 76, 82, 24];
    const daily = []; for (let i = 13; i >= 0; i--) daily.push({ date: D(-i), appts: 9 + Math.round(rnd() * 12), sales: Math.round((38000 + rnd() * 52000) / 100) * 100 });

    const promotions = [
      { id: 'PRM-01', name: 'Tire Month — Buy 3 Get 1', scope: 'Bridgestone, Yokohama tires', type: 'Bundle', value: '1 free tire', start: D(-6), end: D(24), status: 'Active' },
      { id: 'PRM-02', name: 'PMS Package 15% Off', scope: 'PMS service', type: 'Percent', value: '15%', start: D(-20), end: D(10), status: 'Active' },
      { id: 'PRM-03', name: 'Free Alignment with 4 Tires', scope: 'All tires', type: 'Freebie', value: 'Wheel Alignment', start: D(-60), end: D(-2), status: 'Expired' },
      { id: 'PRM-04', name: 'Holiday Detailing Deal', scope: 'Detailing products & service', type: 'Fixed', value: '₱1,000 off', start: D(30), end: D(75), status: 'Scheduled Promo' }
    ];

    const products = JSON.parse(JSON.stringify(AC.data.productSeed));

    return {
      version: VERSION, seededOn: T,
      customers, vehicles, technicians, appointments, workOrders, records, orders, payments, notifications, activity,
      products, promotions, cart: [], wishlist: [],
      analytics: { months, serviceRev, productRev, newCustomers, daily },
      settings: { shopName: 'AutoCare Service Center — Quezon Ave.', email: 'hello@autocare.ph', phone: '(02) 8123 4567', mobile: '+63 917 555 0199', address: '1180 Quezon Ave., Brgy. Paligsahan, Quezon City, Metro Manila', hours: 'Mon–Sat · 8:00 AM – 6:00 PM', vat: 12, deliveryFee: 250, freeDeliveryMin: 10000 },
      staff: { name: 'Leah Santos', role: 'Service Manager', email: 'admin@autocare.ph' }
    };
  }

  return { build, VERSION };
})();
