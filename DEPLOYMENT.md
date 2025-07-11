# دليل النشر على Koyeb

## خطوات النشر السريع

### الطريقة الأولى: النشر عبر Koyeb Dashboard

1. **انتقل إلى Koyeb**
   - اذهب إلى [koyeb.com](https://koyeb.com)
   - قم بتسجيل الدخول أو إنشاء حساب جديد

2. **إنشاء تطبيق جديد**
   - اضغط على "Create App"
   - اختر "GitHub" كمصدر النشر
   - اختر مستودع `nizartitwaniii/kulthx-safeme`
   - اختر الفرع `main`

3. **إعدادات البناء**
   - **Build method**: اختر "Buildpack" (ستقوم بالكشف عن Node.js تلقائياً)
   - أو اختر "Docker" واستخدم `Dockerfile`
   - **Instance**: اختر "nano" (مجاني)
   - **Region**: اختر المنطقة الأقرب لك

4. **متغيرات البيئة**
   أضف المتغيرات التالية:
   ```
   NODE_ENV=production
   PORT=8000
   HOST=0.0.0.0
   MAX_SCRIPT_LENGTH=50000
   MAX_SCRIPTS_PER_USER=50
   ```

5. **النشر**
   - اضغط "Deploy"
   - انتظر حتى اكتمال البناء والنشر

### الطريقة الثانية: Koyeb CLI

```bash
# تثبيت Koyeb CLI
curl -fsSL https://github.com/koyeb/koyeb-cli/releases/latest/download/koyeb_linux_amd64.tar.gz | tar -xz
sudo mv koyeb /usr/local/bin/

# تسجيل الدخول
koyeb login

# النشر
koyeb service create kulthx-safeme \
  --git github.com/nizartitwaniii/kulthx-safeme \
  --git-branch main \
  --instance-type nano \
  --env NODE_ENV=production \
  --env PORT=8000 \
  --env HOST=0.0.0.0 \
  --port 8000:http \
  --health-check-path /health
```

## استكشاف الأخطاء

### مشكلة: فشل في اكتشاف نوع التطبيق
**الحل**: تأكد من أن:
- `.buildpacks` يحتوي على `heroku/nodejs`
- `package.json` موجود في الجذر
- لا توجد ملفات Python في المستودع

### مشكلة: فشل البناء
**الحل**: تحقق من:
- `package.json` يحتوي على scripts صحيحة
- جميع التبعيات مدرجة في `dependencies`
- `.nvmrc` يحدد Node.js 18

### مشكلة: خطأ في بدء التطبيق
**الحل**: تأكد من:
- `Procfile` يحتوي على `web: node server.js`
- المنفذ 8000 مستخدم في التطبيق
- متغيرات البيئة مضبوطة بشكل صحيح

## ملاحظات مهمة

- يستخدم التطبيق منفذ 8000 (يجب أن يتطابق مع إعدادات Koyeb)
- يحتاج التطبيق إلى إنشاء مجلد `data` تلقائياً
- الـ health check متاح على `/health`
- GitHub Actions مضبوط للنشر التلقائي عند رفع على `main`

## بعد النشر

- ستحصل على رابط مثل: `https://kulthx-safeme-[id].koyeb.app`
- يمكنك ربط نطاق مخصص من إعدادات Koyeb
- راقب الأداء والسجلات من Dashboard