# دليل النشر على Vercel

## خطوات النشر السريع

### الطريقة الأولى: النشر عبر Vercel Dashboard

1. **انتقل إلى Vercel**
   - اذهب إلى [vercel.com](https://vercel.com)
   - قم بتسجيل الدخول أو إنشاء حساب جديد

2. **إنشاء مشروع جديد**
   - اضغط على "New Project"
   - اختر "Import Git Repository"
   - اختر مستودع `KULTHX/kulthx-safeme`
   - اختر الفرع `main`

3. **إعدادات البناء**
   - **Framework Preset**: اختر "Other" أو "Node.js"
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: اتركه فارغاً (سيستخدم الجذر)
   - **Install Command**: `npm install`

4. **متغيرات البيئة**
   أضف المتغيرات التالية في قسم Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   HOST=0.0.0.0
   MAX_SCRIPT_LENGTH=50000
   MAX_SCRIPTS_PER_USER=50
   ```

5. **النشر**
   - اضغط "Deploy"
   - انتظر حتى اكتمال البناء والنشر

### الطريقة الثانية: Vercel CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر من مجلد المشروع
cd kulthx-safeme
vercel

# للنشر في الإنتاج
vercel --prod
```

## الاختلافات عن Koyeb

### الملفات المضافة/المعدلة:
- ✅ `vercel.json` - ملف تكوين Vercel
- ✅ `VERCEL_DEPLOYMENT.md` - دليل النشر الجديد
- ✅ تعديل `package.json` - إضافة scripts للـ Vercel
- ✅ تعديل `server.js` - تغيير المنفذ الافتراضي إلى 3000

### الملفات المحذوفة/غير المستخدمة:
- ❌ `koyeb.toml` - لم يعد مطلوباً
- ❌ `koyeb.yml` - لم يعد مطلوباً
- ❌ `.buildpacks` - لم يعد مطلوباً
- ❌ `Dockerfile` - لم يعد مطلوباً (اختياري)
- ❌ `DEPLOYMENT.md` - استبدل بـ VERCEL_DEPLOYMENT.md

## استكشاف الأخطاء

### مشكلة: فشل البناء
**الحل**: تحقق من:
- `package.json` يحتوي على scripts صحيحة
- جميع التبعيات مدرجة في `dependencies`
- `vercel.json` مكتوب بشكل صحيح

### مشكلة: خطأ في بدء التطبيق
**الحل**: تأكد من:
- `server.js` يستمع على المنفذ الصحيح
- متغيرات البيئة مضبوطة بشكل صحيح
- الملفات الثابتة في المكان الصحيح

### مشكلة: مشاكل في Socket.IO
**الحل**: 
- تأكد من أن Vercel يدعم WebSockets
- قد تحتاج لاستخدام polling بدلاً من WebSockets

## ملاحظات مهمة

- Vercel يدعم Node.js بشكل أصلي
- لا حاجة لـ Docker أو buildpacks
- النشر أسرع من Koyeb
- دعم أفضل للـ serverless functions
- SSL مجاني ومدمج
- CDN عالمي مدمج

## بعد النشر

- ستحصل على رابط مثل: `https://kulthx-safeme.vercel.app`
- يمكنك ربط نطاق مخصص من إعدادات Vercel
- راقب الأداء والسجلات من Dashboard
- النشر التلقائي عند رفع على `main`

## مقارنة الأداء

| الميزة | Koyeb | Vercel |
|--------|-------|--------|
| سرعة النشر | متوسط | سريع جداً |
| دعم Node.js | جيد | ممتاز |
| SSL | مدفوع | مجاني |
| CDN | محدود | عالمي |
| Serverless | لا | نعم |
| التكلفة | متوسط | مجاني للمشاريع الصغيرة |

