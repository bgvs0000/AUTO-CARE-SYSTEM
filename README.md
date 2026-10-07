# AUTOCARE — Automotive Management · Car Service · Auto Shop (UI/UX Prototype)

Frontend-only, multi-page web system. Plain HTML + CSS + vanilla JavaScript.
No frameworks, no build step, no backend. Data is saved in the browser with `localStorage`.

## How to run
1. Extract the folder.
2. Open `index.html` in Chrome / Edge / Firefox (double-click works).
   *Optional:* run a local server for the cleanest experience: `npx serve .` or VS Code “Live Server”.

## Demo accounts
| Portal   | Page               | Login                                            |
|----------|--------------------|--------------------------------------------------|
| Customer | `login.html`       | `miguel.delacruz@gmail.com` / `autocare123`      |
| Admin    | `admin-login.html` | `admin@autocare.ph` / `admin123` → enter the 6-digit OTP shown in the simulated SMS (or click Auto-fill) |

Reset all demo data: **Admin → Settings → Data & demo → Reset**, or **Customer → Profile → Settings → Reset demo**.

## File structure
```
autocare/
├── index.html                 Public landing page (hero, services, vehicles, shop, fitment, about, contact)
├── login.html                 Customer login
├── register.html              Customer registration
├── admin-login.html           Separate secure admin login (with 2-step code)
├── shop.html                  Automotive shop (catalog, tire finder, wheel fitment, product, cart, checkout)
├── customer.html              Customer portal (SPA shell)
├── admin.html                 Admin / staff console (SPA shell)
├── README.md
└── assets/
    ├── css/
    │   ├── base.css           Design tokens, reset, typography, utilities, keyframes
    │   ├── components.css     Buttons, cards, badges, forms, tables, tabs, modals, toasts, dropdowns, tracker…
    │   ├── layout.css         Sidebar + topbar app shell, public header/footer, mobile nav
    │   ├── landing.css        Landing page sections
    │   ├── shop.css           Shop grid, filters, product page, finder, cart, checkout
    │   ├── portal.css         Customer & admin views (vehicles, wizard, kanban, calendar, invoice…)
    │   └── auth.css           Login / register / admin login
    └── js/
        ├── core/
        │   ├── icons.js       Inline SVG icon set — AC.icon()
        │   ├── ui.js          Utilities (AC.u) + toast, modal, confirm, tabs, dropdown, pager (AC.ui)
        │   ├── art.js         Generated SVG art: cars (5 body types), tires, wheels, batteries, bottles, parts
        │   ├── charts.js      Dependency-free SVG charts: line, bar, donut, h-bars, sparkline
        │   ├── store.js       localStorage state + domain actions (cart, orders, bookings, work orders) + session
        │   ├── shell.js       App shell (sidebar/topbar), public header/footer, hash router
        │   ├── documents.js   Printable invoice / work-order / receipt
        │   └── notifications.js  Notification center page (shared)
        ├── data/
        │   ├── vehicles.js    PH vehicle catalog (13 brands, 78 models) + tire/wheel fitment calculator
        │   ├── products.js    Shop catalog: 27 tire lines, 17 wheels, batteries, oils, parts, accessories…
        │   └── demo.js        Filipino customers, vehicles, appointments, work orders, orders, payments, logs
        ├── pages/
        │   ├── landing.js     Landing interactions (quick book, vehicle directory, fitment form, contact)
        │   └── auth.js        Login, register (password meter), admin login + OTP
        ├── shop/
        │   ├── shop-common.js Product card + quick add-to-cart
        │   ├── catalog.js     Listing with filters, search, sort, load more
        │   ├── finder.js      Tire Finder (vehicle/size/brand/budget) + Wheel Fitment
        │   ├── product.js     Product page, variants, fitment check modal
        │   ├── cart.js        Cart, checkout (delivery + payment UI), order success
        │   └── shop-app.js    Shop routes
        ├── customer/
        │   ├── dashboard.js   Welcome, KPIs, live service status, appointments, purchases, spending chart
        │   ├── vehicles.js    My Vehicles (add/edit/delete, searchable catalog) + vehicle details
        │   ├── booking.js     6-step booking wizard + confirmation
        │   ├── tracking.js    Animated service tracker + service history & invoices
        │   ├── orders.js      My Orders + order tracking timeline
        │   ├── profile.js     Profile, edit, change password, settings
        │   └── customer-app.js  Portal nav + routes
        └── admin/
            ├── admin-kit.js   Data table (sort/paginate/responsive), CSV export helpers
            ├── dashboard.js   8 KPIs, revenue/appointments/service-mix/product charts, feeds
            ├── appointments.js List + Day/Week/Month calendar, approve/reschedule/cancel/assign
            ├── customers.js   Customer table + profile (view/edit/suspend/delete/export)
            ├── vehicles.js    All vehicles with filters + full service history
            ├── services.js    Service catalog, pricing, bay utilization
            ├── workorders.js  Kanban (drag & drop) + table + work-order editor (parts, labor, costs)
            ├── technicians.js Technician profiles, workload, assign jobs
            ├── inventory.js   SKU inventory, stock adjustment, low/out of stock
            ├── products.js    Product catalog + product editor (tire sizes / wheel specs / variants)
            ├── shop-admin.js  Categories, brands, bulk prices, promotions, compatibility, tire & wheel specs
            ├── orders.js      Orders (status flow, details) + Payments (mark paid, refunds)
            ├── reports.js     10 reports with charts, tables, CSV export, print
            ├── system.js      Activity log, settings, UI components gallery
            └── admin-app.js   Console nav + routes
```

## Load order (each HTML page)
`core/icons → core/ui → core/art → (core/charts) → data/vehicles → data/products → data/demo → core/store → core/shell → page modules → *-app.js`

## Next steps toward production
- Replace `core/store.js` actions with API calls (Laravel / Node / Django + MySQL/PostgreSQL); keep the same function names.
- Real auth (hashed passwords, JWT/session), role-based permissions from Settings → Users & roles.
- Payment gateway (PayMongo / Xendit for GCash, Maya, cards), SMS (Semaphore), email.
- Upload real product photos (replace generated SVG art in `core/art.js`).
