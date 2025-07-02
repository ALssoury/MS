// اسم الكاش الخاص بك - قم بتغييره عند تحديث الملفات المخزنة مؤقتًا
const CACHE_NAME = 'alssoury-station-cache-v1.3';

// قائمة بالمسارات التي تريد تخزينها مؤقتًا تلقائيًا عند تثبيت Service Worker
const urlsToCache = [
  '/',
  '/index.html',
  // '/cache.html', // إذا لم تعد تستخدمها بفضل Service Workers، يمكنك إزالتها
  '/btn.css', //
  '/alssoury_1ogo.jpg', //
  // '/alssoury_logo.png', // إذا كانت هذه الصورة ما زالت مستخدمة
  // '/favicon.ico', // إذا كنت تستخدم أيقونة
  // '/fonts/LiberationMono-Regular.ttf', // إذا كنت تستخدم خطوطًا خارجية
  '/payload.js', // ملف JavaScript خارجي
  './alert.mjs' // ملف JavaScript خارجي آخر
  // أضف هنا جميع الملفات الأخرى التي يجب أن تعمل دون اتصال (CSS, JS, صور، إلخ)
];

// حدث 'install': يتم تفعيله عند تثبيت Service Worker لأول مرة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache); // تخزين جميع الملفات المحددة مؤقتًا
      })
      .then(() => self.skipWaiting()) // لتنشيط Service Worker الجديد فورًا
  );
});

// حدث 'fetch': يتم تفعيله عند كل طلب شبكة من الصفحة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request) // محاولة العثور على الطلب في الكاش
      .then((response) => {
        // إذا وجد في الكاش، قم بإرجاعه
        if (response) {
          return response;
        }
        // وإلا، اذهب إلى الشبكة واطلبها
        return fetch(event.request)
          .then((response) => {
            // تحقق إذا كان الاستجابة صالحة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // قم بنسخ الاستجابة وتخزينها في الكاش للاستخدام المستقبلي
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// حدث 'activate': يتم تفعيله عند تنشيط Service Worker جديد
self.addEventListener('activate', (event) => {
  // قم بإزالة أي كاشات قديمة لم تعد مستخدمة
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // حذف الكاشات القديمة
          }
        })
      );
    })
  );
});
