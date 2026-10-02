const CACHE_NAME = 'atas-books-v3';
const urlsToCache = [
  'index.html',
  'dashboard.html',
  'login.html',
  'register.html',
  'customers.html',
  'vendors.html',
  'inventory.html',
  'invoices.html',
  'credit_notes.html',
  'expenses.html',
  'settings.html',
  'profit_loss.html',
  'balance_sheet.html',
  'cashflow.html',
  'sales_report.html',
  'purchases_report.html',
  'css/style.css',
  'js/api.js',
  'js/dashboard.js',
  'js/invoices.js',
  'js/customers.js',
  'js/vendors.js',
  'js/inventory.js',
  'js/expenses.js',
  'js/credit_notes.js',
  'js/settings.js',
  'js/profit_loss.js',
  'js/balance_sheet.js',
  'js/cashflow.js',
  'js/sales_report.js',
  'js/purchases_report.js',
  'images/logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active one
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all open pages immediately
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});