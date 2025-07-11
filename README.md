# KULTHX SAFEME 🔒

منصة آمنة لحماية ومشاركة نصوص Roblox مع روابط مشفرة.

## المميزات ✨

- 🛡️ **حماية النصوص**: احم نصوص Roblox الخاصة بك بروابط مشفرة فريدة
- 🔗 **إنتاج Loadstring**: إنشاء loadstrings آمنة لتنفيذ النصوص في Roblox
- 📱 **واجهة حديثة**: تصميم جميل ومتجاوب باستخدام Tailwind CSS
- 👥 **عدد المستخدمين المباشر**: تتبع المستخدمين المتصلين في الوقت الفعلي
- 📊 **إدارة النصوص**: تحرير وحذف ومراقبة النصوص المحمية
- 🔒 **الأمان**: تحديد معدل الطلبات، التحقق من المدخلات، وحماية متقدمة
- 🐳 **جاهز للـ Docker**: معبأ في حاوية للنشر السهل
- ☁️ **مُحسّن للسحابة**: محسن خصيصاً لمنصة Koyeb

## البدء السريع 🚀

### التطوير المحلي

1. **استنساخ المستودع**
```bash
git clone https://github.com/KULTHX/kulthx-safeme.git
cd kulthx-safeme
```

2. **تثبيت التبعيات**
```bash
npm install
```

3. **إنشاء ملف البيئة**
```bash
cp .env.example .env
```

4. **تشغيل التطبيق**
```bash
npm start
```

التطبيق سيعمل على `http://localhost:5000`

### النشر على Koyeb ☁️

#### الطريقة الأولى: النشر التلقائي عبر GitHub

1. **رفع الكود على GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **الذهاب إلى Koyeb Dashboard**
   - انتقل إلى [koyeb.com](https://koyeb.com)
   - قم بتسجيل الدخول أو إنشاء حساب جديد

3. **إنشاء تطبيق جديد**
   - اضغط على "Create App"
   - اختر "GitHub" كمصدر
   - اختر مستودع `kulthx-safeme`
   - اختر الفرع `main`

4. **تكوين النشر**
   - **Build type**: Docker
   - **Dockerfile path**: `Dockerfile`
   - **Instance type**: Nano (مجاني)
   - **Regions**: اختر المنطقة الأقرب لك

5. **تعيين متغيرات البيئة**
```
NODE_ENV=production
PORT=8000
HOST=0.0.0.0
MAX_SCRIPT_LENGTH=50000
MAX_SCRIPTS_PER_USER=50
```

6. **النشر**
   - اضغط على "Deploy"
   - انتظر حتى اكتمال النشر

#### الطريقة الثانية: استخدام Koyeb CLI

1. **تثبيت Koyeb CLI**
```bash
# Linux/macOS
curl -fsSL https://github.com/koyeb/koyeb-cli/releases/latest/download/koyeb_linux_amd64.tar.gz | tar -xz
sudo mv koyeb /usr/local/bin/

# أو استخدم Package Manager
brew install koyeb-cli  # macOS
```

2. **تسجيل الدخول**
```bash
koyeb login
```

3. **النشر**
```bash
koyeb service create kulthx-safeme \
  --git github.com/KULTHX/kulthx-safeme \
  --git-branch main \
  --docker-dockerfile Dockerfile \
  --instance-type nano \
  --env NODE_ENV=production \
  --env PORT=8000 \
  --env HOST=0.0.0.0 \
  --port 8000:http \
  --health-check-path /health
```

## الاستخدام 🎮

### حماية نص Roblox

1. **افتح التطبيق** في المتصفح
2. **أدخل نص Roblox** في المربع النصي
3. **اضغط "🚀 Protect Your Script"**
4. **انسخ الـ loadstring** المُنتج

### استخدام الـ Loadstring في Roblox

```lua
loadstring(game:HttpGet("https://your-app.koyeb.app/script.lua?id=script_id"))()
```

### إدارة النصوص

- انتقل إلى صفحة **"My Scripts"** لإدارة نصوصك
- يمكنك **تحرير** أو **حذف** أو **نسخ** loadstrings
- راقب عدد مرات **الوصول** لكل نص

## هيكل المشروع 📁

```
kulthx-safeme/
├── server.js              # الخادم الرئيسي
├── views/                 # قوالب Handlebars
│   ├── layouts/
│   │   └── main.hbs      # القالب الأساسي
│   ├── index.hbs         # الصفحة الرئيسية
│   ├── my-scripts.hbs    # صفحة إدارة النصوص
│   ├── loading.hbs       # صفحة التحميل
│   └── error.hbs         # صفحة الأخطاء
├── public/               # الملفات الثابتة
│   ├── css/
│   │   └── style.css     # التنسيقات المخصصة
│   └── js/
│       └── main.js       # JavaScript العام
├── data/                 # قاعدة البيانات JSON
├── .github/workflows/    # GitHub Actions للنشر التلقائي
├── Dockerfile           # تكوين Docker
├── docker-compose.yml   # تكوين Docker Compose
├── koyeb.toml          # تكوين Koyeb
├── .env.example        # مثال متغيرات البيئة
└── README.md           # هذا الملف
```

## الأمان 🔒

- **Rate Limiting**: حماية من الطلبات المفرطة
- **Input Validation**: التحقق من صحة المدخلات
- **Helmet.js**: حماية HTTP headers
- **CORS**: التحكم في الوصول عبر المصادر
- **User-Agent Check**: التحقق من طلبات Roblox فقط للنصوص

## متغيرات البيئة 🔧

```bash
# تكوين الخادم
NODE_ENV=production          # بيئة التشغيل
PORT=8000                   # منفذ الخادم
HOST=0.0.0.0               # عنوان الاستضافة

# حدود الأمان
MAX_SCRIPT_LENGTH=50000     # الحد الأقصى لطول النص
MAX_SCRIPTS_PER_USER=50     # الحد الأقصى للنصوص لكل مستخدم
RATE_LIMIT_WINDOW_MS=900000 # نافزة تحديد معدل الطلبات
RATE_LIMIT_MAX_REQUESTS=100 # عدد الطلبات الأقصى

# قاعدة البيانات
DB_FILE=data/scripts.json   # مسار ملف قاعدة البيانات
```

## التقنيات المستخدمة 💻

- **Backend**: Node.js + Express.js
- **Template Engine**: Handlebars (HBS)
- **Real-time**: Socket.IO
- **Frontend**: Tailwind CSS + Vanilla JavaScript
- **Security**: Helmet.js, CORS, Rate Limiting
- **Containerization**: Docker
- **Cloud Platform**: Koyeb
- **Database**: JSON File Storage

## الدعم والمساهمة 🤝

- **Issues**: [GitHub Issues](https://github.com/KULTHX/kulthx-safeme/issues)
- **Pull Requests**: مرحب بالمساهمات
- **الترخيص**: MIT License

## الترخيص 📄

هذا المشروع مرخص تحت رخصة MIT. راجع ملف `LICENSE` للتفاصيل.

---

**تم الإنشاء بواسطة KULTHX** ❤️ **لمجتمع Roblox**
