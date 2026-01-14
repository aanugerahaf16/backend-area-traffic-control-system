# Panduan Deployment Vercel

Gunakan nilai-nilai di bawah ini untuk mengisi **Environment Variables** di Dashboard Vercel.

## 1. Backend (Project Laravel)
**Settings > Environment Variables**

| Key | Value |
| :--- | :--- |
| `APP_KEY` | `base64:ic8dZzbVMNiKjeqnLMBtgQNz3sbS+Bfq5lhtiB9tfsI=` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | *(URL Vercel Anda, contoh: https://api-atcs.vercel.app)* |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `mysql-3d8a8b79-anugerahahmadf16-d6a2.b.aivencloud.com` |
| `DB_PORT` | `10241` |
| `DB_DATABASE` | `defaultdb` |
| `DB_USERNAME` | `avnadmin` |
| `DB_PASSWORD` | `[LIHAT_DI_AIVEN_DASHBOARD]` |
| `DB_SSL_VERIFY` | `false` |
| `SESSION_DRIVER` | `cookie` |
| `CACHE_STORE` | `array` |

---

## 2. Frontend (Project Next.js)
**Settings > Environment Variables**

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | *(URL Backend Laravel Anda di atas)* |

---

## Langkah-langkah Terminal:

1. **Migrasi Database (Jalankan Sekarang di Laptop):**
   ```bash
   php artisan migrate
   ```

2. **Kirim Perubahan ke GitHub:**
   ```bash
   git add .
   git commit -m "Finalize Vercel and Aiven configuration"
   git push origin main
   ```

3. **Gunakan Vercel Dashboard:**
   - Hubungkan ke repo GitHub ini.
   - Untuk Backend: Biarkan Root Directory di `/`.
   - Untuk Frontend: Set Root Directory ke `frontend`.
