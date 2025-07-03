# Update Configuration - Port & Environment Variables

## ✅ **PERUBAHAN YANG DILAKUKAN:**

### **1. Port Frontend: 7892 → 3000**
```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbopack -p 3000",  // ← Changed from 7892
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### **2. Environment Variables (.env.local & .env.example)**
```bash
# Backend API URL (untuk axios calls via proxy)
NEXT_PUBLIC_API_URL=/api/proxy

# Backend Base URL (untuk Next.js proxy internal)
BACKEND_URL=http://localhost:8080

# Backend URL untuk static files (diakses langsung dari browser)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# Frontend Port (untuk development)
PORT=3000
```

### **3. Hardcoded URLs → Environment Variables**

#### **Before (❌ Hardcoded):**
```javascript
src={`http://localhost:8080/${athlete.foto_3x4}`}
href={`http://localhost:8080/${doc.dokumentasi}`}
```

#### **After (✅ Environment-based):**
```javascript
// app/utils/config.js
export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export const getImageURL = (imagePath) => {
  if (!imagePath) return null;
  return `${BACKEND_BASE_URL}/${imagePath}`;
};

export const getDocumentURL = (documentPath) => {
  if (!documentPath) return null;
  return `${BACKEND_BASE_URL}/${documentPath}`;
};

// Usage in components:
src={getImageURL(athlete.foto_3x4)}
href={getDocumentURL(doc.dokumentasi)}
```

### **4. Files Updated:**
- ✅ `package.json` - Port change
- ✅ `.env.local` - Environment variables
- ✅ `.env.example` - Environment template
- ✅ `app/utils/config.js` - Helper functions
- ✅ `app/daftar-atlet/page.js` - Use getImageURL()
- ✅ `app/hasil-pertandingan/[id]/page.js` - Use getImageURL()
- ✅ `app/hasil-pertandingan/edit/[id]/page.js` - Use getDocumentURL()
- ✅ `app/api/proxy/[...path]/route.js` - Default backend URL

---

## 🚀 **CARA MENJALANKAN:**

### **Development:**
```bash
# Frontend (Port 3000)
cd frontend_next
npm run dev

# Backend (Port 8080)
cd backend_golang
go run main.go
```

### **URLs:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Static Files**: http://localhost:8080/public/uploads/

---

## 🔧 **KONFIGURASI PRODUCTION:**

### **Frontend (.env.production):**
```bash
NEXT_PUBLIC_API_URL=/api/proxy
BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
PORT=3000
```

### **Backend:**
```bash
PORT=8080
ENV=production
```

---

## 📋 **BENEFITS:**

1. **✅ Flexible Configuration**: Gampang ganti URL tanpa edit code
2. **✅ Environment-specific**: Bisa beda config untuk dev/staging/prod
3. **✅ Standard Port**: Port 3000 lebih umum untuk Next.js
4. **✅ Maintainable**: Tidak ada hardcoded values
5. **✅ Secure**: Sensitive URLs bisa disimpan di environment variables

---

## 🎯 **TESTING:**

1. **Test Frontend**: http://localhost:3000
2. **Test Image Display**: Check foto atlet & dokumentasi
3. **Test File Download**: Click link dokumentasi
4. **Test Environment**: Ganti `NEXT_PUBLIC_BACKEND_URL` di .env.local

Sekarang project sudah lebih clean dan configurable! 🎉
