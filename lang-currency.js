/**
 * lang-currency.js — Language & Currency Switcher
 * Aneesa Hampers · Shared across all pages
 */

(function () {
  'use strict';

  /* ── Exchange rates (base: INR) ──────────────────────────────── */
  var RATES = {
    INR: 1, USD: 0.012, GBP: 0.0095, AED: 0.044, SAR: 0.045,
    QAR: 0.044, KWD: 0.0037, BHD: 0.0045, OMR: 0.0046, CAD: 0.016,
    AUD: 0.018, SGD: 0.016, MYR: 0.056, EUR: 0.011, JPY: 1.79,
    CNY: 0.087, KRW: 16.1, PKR: 3.34, BDT: 1.31, LKR: 3.72,
    NPR: 1.60, NZD: 0.020, ZAR: 0.22, IDR: 189.5
  };

  var SYMBOLS = {
    INR: '₹', USD: '$', GBP: '£', AED: 'د.إ', SAR: '﷼',
    QAR: '﷼', KWD: 'KD', BHD: 'BD', OMR: 'R.O.', CAD: 'CA$',
    AUD: 'A$', SGD: 'S$', MYR: 'RM', EUR: '€', JPY: '¥',
    CNY: '¥', KRW: '₩', PKR: '₨', BDT: '৳', LKR: 'Rs',
    NPR: 'Rs', NZD: 'NZ$', ZAR: 'R', IDR: 'Rp'
  };

  /* ── Apply currency conversion ───────────────────────────────── */
  function applyCurrency(currency) {
    if (!currency || !RATES[currency]) currency = 'INR';
    var rate = RATES[currency];
    var symbol = SYMBOLS[currency] || currency;
    document.querySelectorAll('[data-inr]').forEach(function (el) {
      var inr = parseFloat(el.getAttribute('data-inr')) || 0;
      var converted = inr * rate;
      var formatted;
      if (currency === 'INR') {
        formatted = '₹' + Math.round(converted).toLocaleString('en-IN');
      } else if (currency === 'JPY' || currency === 'KRW' || currency === 'IDR') {
        formatted = symbol + Math.round(converted).toLocaleString();
      } else {
        formatted = symbol + converted.toFixed(2);
      }
      el.textContent = formatted;
    });
    try {
      var prefs = JSON.parse(localStorage.getItem('ah_prefs') || '{}');
      prefs.currency = currency;
      prefs.savedAt = Date.now();
      localStorage.setItem('ah_prefs', JSON.stringify(prefs));
    } catch (e) { }
  }

  function reapplyCurrency() {
    var prefs = {};
    try { prefs = JSON.parse(localStorage.getItem('ah_prefs') || '{}'); } catch (e) { }
    if (prefs.currency && prefs.currency !== 'INR') applyCurrency(prefs.currency);
  }

  /* ── FULL Translation dictionaries ──────────────────────────── */
  var TRANSLATIONS = {
    en: {},
    hi: {
      'Shop Now 🎁': 'अभी खरीदें 🎁', 'Shop Now': 'अभी खरीदें', 'View Collections': 'संग्रह देखें',
      'Add to Cart': 'कार्ट में जोड़ें', 'Buy Now': 'अभी खरीदें', 'My Account': 'मेरा खाता',
      'My Orders': 'मेरे ऑर्डर', 'My Profile': 'मेरी प्रोफ़ाइल', 'Wishlist': 'विशलिस्ट',
      'Sign Out': 'साइन आउट', 'Home': 'होम', 'Shop': 'दुकान', 'Cart': 'कार्ट', 'Orders': 'ऑर्डर',
      'Account': 'खाता', 'Search': 'खोजें', 'Contact Us': 'हमसे संपर्क करें',
      'Save Profile': 'प्रोफ़ाइल सहेजें', 'Save Address': 'पता सहेजें',
      'Personal Information': 'व्यक्तिगत जानकारी', 'Delivery Address': 'डिलीवरी पता',
      'Full Name': 'पूरा नाम', 'Email Address': 'ईमेल पता', 'Phone Number': 'फ़ोन नंबर',
      'Date of Birth': 'जन्म तिथि', 'City': 'शहर', 'State / Region': 'राज्य / क्षेत्र',
      'ZIP / PIN Code': 'ज़िप / पिन कोड', 'Country': 'देश', 'Landmark (optional)': 'लैंडमार्क (वैकल्पिक)',
      'Account Security': 'खाता सुरक्षा', 'Send Password Reset Email': 'पासवर्ड रीसेट ईमेल भेजें',
      'Language & Region': 'भाषा और क्षेत्र', 'Preferred Language': 'पसंदीदा भाषा',
      'Your Country': 'आपका देश', 'Display Currency': 'प्रदर्शन मुद्रा',
      'Save Language & Region': 'भाषा और क्षेत्र सहेजें', 'Browse Products': 'उत्पाद देखें',
      'Cancel Order': 'ऑर्डर रद्द करें', 'View': 'देखें', 'Loading': 'लोड हो रहा है',
      'Placed': 'रखा गया', 'Confirmed': 'पुष्टि हुई', 'Shipped': 'भेज दिया', 'Delivered': 'डिलीवर हो गया',
      'Pending': 'लंबित', 'No Orders Yet': 'अभी तक कोई ऑर्डर नहीं',
      'Your wishlist is empty': 'आपकी विशलिस्ट खाली है', 'Track Order': 'ऑर्डर ट्रैक करें',
      'Checkout': 'चेकआउट', 'Continue Shopping': 'खरीदारी जारी रखें', 'Total': 'कुल',
      'Subtotal': 'उप-योग', 'Apply': 'लागू करें', 'Remove': 'हटाएं', 'Quantity': 'मात्रा',
      'Featured': 'विशेष', 'New Arrivals': 'नई आवक', 'Best Sellers': 'सबसे ज़्यादा बिकने वाले',
      'Categories': 'श्रेणियां', 'All Products': 'सभी उत्पाद', 'Filter': 'फ़िल्टर', 'Sort by': 'इसके अनुसार क्रमबद्ध करें',
      'Price': 'कीमत', 'Reviews': 'समीक्षाएं', 'Description': 'विवरण', 'Specifications': 'विनिर्देश',
      'Related Products': 'संबंधित उत्पाद', 'In Stock': 'स्टॉक में', 'Out of Stock': 'स्टॉक में नहीं',
      'Help & Support': 'सहायता और समर्थन', 'FAQs': 'अक्सर पूछे जाने वाले प्रश्न',
      'Delivery FAQs': 'डिलीवरी प्रश्न', 'Return & Refund': 'वापसी और धनवापसी', 'Custom Orders': 'कस्टम ऑर्डर',
      'Settings': 'सेटिंग्स', 'Language': 'भाषा', 'Currency': 'मुद्रा', 'Delivery Location': 'डिलीवरी स्थान',
      'Logout': 'लॉगआउट', 'Order on WhatsApp': 'WhatsApp पर ऑर्डर करें'
    },
    te: {
      'Shop Now 🎁': 'ఇప్పుడే కొనండి 🎁', 'Shop Now': 'ఇప్పుడే కొనండి', 'View Collections': 'సేకరణలు చూడండి',
      'Add to Cart': 'కార్ట్‌కు జోడించండి', 'Buy Now': 'ఇప్పుడే కొనండి', 'My Account': 'నా ఖాతా',
      'My Orders': 'నా ఆర్డర్లు', 'My Profile': 'నా ప్రొఫైల్', 'Wishlist': 'విష్‌లిస్ట్',
      'Sign Out': 'సైన్ అవుట్', 'Home': 'హోమ్', 'Shop': 'షాప్', 'Cart': 'కార్ట్', 'Orders': 'ఆర్డర్లు',
      'Account': 'ఖాతా', 'Search': 'వెతకండి', 'Contact Us': 'మమ్మల్ని సంప్రదించండి',
      'Save Profile': 'ప్రొఫైల్ సేవ్ చేయండి', 'Save Address': 'చిరునామా సేవ్ చేయండి',
      'Personal Information': 'వ్యక్తిగత సమాచారం', 'Delivery Address': 'డెలివరీ చిరునామా',
      'Full Name': 'పూర్తి పేరు', 'Email Address': 'ఇమెయిల్ చిరునామా', 'Phone Number': 'ఫోన్ నంబర్',
      'Date of Birth': 'పుట్టిన తేదీ', 'City': 'నగరం', 'State / Region': 'రాష్ట్రం / ప్రాంతం',
      'ZIP / PIN Code': 'జిప్ / పిన్ కోడ్', 'Country': 'దేశం', 'Landmark (optional)': 'ల్యాండ్‌మార్క్ (ఐచ్ఛికం)',
      'Account Security': 'ఖాతా భద్రత', 'Send Password Reset Email': 'పాస్‌వర్డ్ రీసెట్ ఇమెయిల్ పంపండి',
      'Language & Region': 'భాష & ప్రాంతం', 'Preferred Language': 'ఇష్టపడే భాష',
      'Save Language & Region': 'భాష & ప్రాంతం సేవ్ చేయండి', 'Browse Products': 'ఉత్పత్తులు చూడండి',
      'Cancel Order': 'ఆర్డర్ రద్దు చేయండి', 'View': 'చూడండి', 'Total': 'మొత్తం',
      'Checkout': 'చెక్అవుట్', 'Continue Shopping': 'షాపింగ్ కొనసాగించండి',
      'Remove': 'తొలగించు', 'Categories': 'వర్గాలు', 'All Products': 'అన్ని ఉత్పత్తులు',
      'Price': 'ధర', 'Reviews': 'సమీక్షలు', 'Description': 'వివరణ',
      'Help & Support': 'సహాయం & మద్దతు', 'Settings': 'సెట్టింగ్‌లు', 'Language': 'భాష',
      'Logout': 'లాగ్అవుట్', 'Order on WhatsApp': 'WhatsApp లో ఆర్డర్ చేయండి'
    },
    ta: {
      'Shop Now 🎁': 'இப்போது வாங்கு 🎁', 'Shop Now': 'இப்போது வாங்கு', 'View Collections': 'தொகுப்புகளைக் காண்க',
      'Add to Cart': 'கார்ட்டில் சேர்', 'Buy Now': 'இப்போது வாங்கு', 'My Account': 'என் கணக்கு',
      'My Orders': 'என் ஆர்டர்கள்', 'My Profile': 'என் சுயவிவரம்', 'Wishlist': 'விருப்பப்பட்டியல்',
      'Sign Out': 'வெளியேறு', 'Home': 'முகப்பு', 'Shop': 'கடை', 'Cart': 'கார்ட்', 'Orders': 'ஆர்டர்கள்',
      'Account': 'கணக்கு', 'Contact Us': 'எங்களை தொடர்பு கொள்ளுங்கள்',
      'Save Profile': 'சுயவிவரத்தை சேமி', 'Save Address': 'முகவரியை சேமி',
      'Personal Information': 'தனிப்பட்ட தகவல்', 'Delivery Address': 'டெலிவரி முகவரி',
      'Full Name': 'முழுப்பெயர்', 'Phone Number': 'தொலைபேசி எண்', 'City': 'நகரம்',
      'Country': 'நாடு', 'Cancel Order': 'ஆர்டரை ரத்து செய்', 'Total': 'மொத்தம்',
      'Checkout': 'செக்அவுட்', 'Continue Shopping': 'தொடர்ந்து வாங்கு',
      'Remove': 'அகற்று', 'All Products': 'அனைத்து தயாரிப்புகள்', 'Price': 'விலை',
      'Reviews': 'மதிப்புரைகள்', 'Help & Support': 'உதவி & ஆதரவு', 'Language': 'மொழி',
      'Settings': 'அமைப்புகள்', 'Logout': 'வெளியேறு'
    },
    ar: {
      'Shop Now 🎁': 'تسوق الآن 🎁', 'Shop Now': 'تسوق الآن', 'View Collections': 'عرض المجموعات',
      'Add to Cart': 'أضف إلى السلة', 'Buy Now': 'اشتري الآن', 'My Account': 'حسابي',
      'My Orders': 'طلباتي', 'My Profile': 'ملفي الشخصي', 'Wishlist': 'قائمة الأمنيات',
      'Sign Out': 'تسجيل الخروج', 'Home': 'الرئيسية', 'Shop': 'المتجر', 'Cart': 'السلة', 'Orders': 'الطلبات',
      'Account': 'الحساب', 'Search': 'بحث', 'Contact Us': 'اتصل بنا',
      'Save Profile': 'حفظ الملف الشخصي', 'Save Address': 'حفظ العنوان',
      'Personal Information': 'المعلومات الشخصية', 'Delivery Address': 'عنوان التوصيل',
      'Full Name': 'الاسم الكامل', 'Email Address': 'البريد الإلكتروني', 'Phone Number': 'رقم الهاتف',
      'Date of Birth': 'تاريخ الميلاد', 'City': 'المدينة', 'State / Region': 'الولاية / المنطقة',
      'ZIP / PIN Code': 'الرمز البريدي', 'Country': 'البلد', 'Landmark (optional)': 'علامة مميزة (اختياري)',
      'Account Security': 'أمان الحساب', 'Send Password Reset Email': 'إرسال بريد إعادة تعيين كلمة المرور',
      'Language & Region': 'اللغة والمنطقة', 'Preferred Language': 'اللغة المفضلة',
      'Save Language & Region': 'حفظ اللغة والمنطقة', 'Browse Products': 'تصفح المنتجات',
      'Cancel Order': 'إلغاء الطلب', 'View': 'عرض', 'Total': 'المجموع',
      'Checkout': 'الدفع', 'Continue Shopping': 'متابعة التسوق', 'Remove': 'إزالة',
      'All Products': 'جميع المنتجات', 'Price': 'السعر', 'Reviews': 'التقييمات',
      'Help & Support': 'المساعدة والدعم', 'Settings': 'الإعدادات', 'Language': 'اللغة',
      'Logout': 'تسجيل الخروج', 'Order on WhatsApp': 'اطلب عبر واتساب'
    },
    ur: {
      'Shop Now 🎁': 'ابھی خریدیں 🎁', 'Shop Now': 'ابھی خریدیں', 'View Collections': 'مجموعے دیکھیں',
      'Add to Cart': 'کارٹ میں ڈالیں', 'Buy Now': 'ابھی خریدیں', 'My Account': 'میرا اکاؤنٹ',
      'My Orders': 'میرے آرڈرز', 'My Profile': 'میری پروفائل', 'Wishlist': 'خواہشات کی فہرست',
      'Sign Out': 'سائن آؤٹ', 'Home': 'ہوم', 'Shop': 'دکان', 'Cart': 'کارٹ', 'Orders': 'آرڈرز',
      'Account': 'اکاؤنٹ', 'Contact Us': 'ہم سے رابطہ کریں',
      'Save Profile': 'پروفائل محفوظ کریں', 'Save Address': 'پتہ محفوظ کریں',
      'Personal Information': 'ذاتی معلومات', 'Delivery Address': 'ڈیلیوری کا پتہ',
      'Full Name': 'پورا نام', 'Phone Number': 'فون نمبر', 'City': 'شہر', 'Country': 'ملک',
      'Cancel Order': 'آرڈر منسوخ کریں', 'Total': 'کل', 'Checkout': 'چیک آؤٹ',
      'Remove': 'ہٹائیں', 'All Products': 'تمام مصنوعات', 'Price': 'قیمت',
      'Help & Support': 'مدد اور معاونت', 'Language': 'زبان', 'Settings': 'ترتیبات',
      'Logout': 'لاگ آؤٹ'
    },
    fr: {
      'Shop Now 🎁': 'Acheter maintenant 🎁', 'Shop Now': 'Acheter maintenant', 'View Collections': 'Voir les collections',
      'Add to Cart': 'Ajouter au panier', 'Buy Now': 'Acheter maintenant', 'My Account': 'Mon compte',
      'My Orders': 'Mes commandes', 'My Profile': 'Mon profil', 'Wishlist': 'Liste de souhaits',
      'Sign Out': 'Déconnexion', 'Home': 'Accueil', 'Shop': 'Boutique', 'Cart': 'Panier', 'Orders': 'Commandes',
      'Account': 'Compte', 'Search': 'Rechercher', 'Contact Us': 'Contactez-nous',
      'Save Profile': 'Enregistrer le profil', 'Save Address': 'Enregistrer l\'adresse',
      'Personal Information': 'Informations personnelles', 'Delivery Address': 'Adresse de livraison',
      'Full Name': 'Nom complet', 'Phone Number': 'Numéro de téléphone', 'City': 'Ville', 'Country': 'Pays',
      'Cancel Order': 'Annuler la commande', 'Total': 'Total', 'Checkout': 'Paiement',
      'Continue Shopping': 'Continuer les achats', 'Remove': 'Supprimer',
      'All Products': 'Tous les produits', 'Price': 'Prix', 'Reviews': 'Avis',
      'Help & Support': 'Aide et support', 'Language': 'Langue', 'Settings': 'Paramètres',
      'Logout': 'Déconnexion'
    },
    de: {
      'Shop Now 🎁': 'Jetzt kaufen 🎁', 'Shop Now': 'Jetzt kaufen', 'View Collections': 'Kollektionen ansehen',
      'Add to Cart': 'In den Warenkorb', 'Buy Now': 'Jetzt kaufen', 'My Account': 'Mein Konto',
      'My Orders': 'Meine Bestellungen', 'My Profile': 'Mein Profil', 'Wishlist': 'Wunschliste',
      'Sign Out': 'Abmelden', 'Home': 'Startseite', 'Shop': 'Shop', 'Cart': 'Warenkorb', 'Orders': 'Bestellungen',
      'Account': 'Konto', 'Search': 'Suche', 'Contact Us': 'Kontakt',
      'Save Profile': 'Profil speichern', 'Save Address': 'Adresse speichern',
      'Personal Information': 'Persönliche Daten', 'Delivery Address': 'Lieferadresse',
      'Full Name': 'Vollständiger Name', 'Phone Number': 'Telefonnummer', 'City': 'Stadt', 'Country': 'Land',
      'Cancel Order': 'Bestellung stornieren', 'Total': 'Gesamt', 'Checkout': 'Zur Kasse',
      'Continue Shopping': 'Weiter einkaufen', 'Remove': 'Entfernen',
      'All Products': 'Alle Produkte', 'Price': 'Preis', 'Reviews': 'Bewertungen',
      'Help & Support': 'Hilfe & Support', 'Language': 'Sprache', 'Settings': 'Einstellungen',
      'Logout': 'Abmelden'
    },
    es: {
      'Shop Now 🎁': 'Comprar ahora 🎁', 'Shop Now': 'Comprar ahora', 'View Collections': 'Ver colecciones',
      'Add to Cart': 'Añadir al carrito', 'Buy Now': 'Comprar ahora', 'My Account': 'Mi cuenta',
      'My Orders': 'Mis pedidos', 'My Profile': 'Mi perfil', 'Wishlist': 'Lista de deseos',
      'Sign Out': 'Cerrar sesión', 'Home': 'Inicio', 'Shop': 'Tienda', 'Cart': 'Carrito', 'Orders': 'Pedidos',
      'Account': 'Cuenta', 'Search': 'Buscar', 'Contact Us': 'Contáctenos',
      'Cancel Order': 'Cancelar pedido', 'Total': 'Total', 'Checkout': 'Pagar',
      'Continue Shopping': 'Seguir comprando', 'Remove': 'Eliminar',
      'All Products': 'Todos los productos', 'Price': 'Precio', 'Reviews': 'Reseñas',
      'Help & Support': 'Ayuda y soporte', 'Language': 'Idioma', 'Settings': 'Configuración',
      'Logout': 'Cerrar sesión'
    },
    zh: {
      'Shop Now 🎁': '立即购买 🎁', 'Shop Now': '立即购买', 'View Collections': '查看系列',
      'Add to Cart': '加入购物车', 'Buy Now': '立即购买', 'My Account': '我的账户',
      'My Orders': '我的订单', 'My Profile': '我的资料', 'Wishlist': '愿望清单',
      'Sign Out': '退出', 'Home': '首页', 'Shop': '商店', 'Cart': '购物车', 'Orders': '订单',
      'Account': '账户', 'Search': '搜索', 'Contact Us': '联系我们',
      'Cancel Order': '取消订单', 'Total': '总计', 'Checkout': '结账',
      'Remove': '删除', 'All Products': '所有产品', 'Price': '价格', 'Reviews': '评价',
      'Help & Support': '帮助与支持', 'Language': '语言', 'Settings': '设置', 'Logout': '退出'
    },
    ja: {
      'Shop Now 🎁': '今すぐ購入 🎁', 'Shop Now': '今すぐ購入', 'View Collections': 'コレクションを見る',
      'Add to Cart': 'カートに追加', 'Buy Now': '今すぐ購入', 'My Account': 'マイアカウント',
      'My Orders': '注文履歴', 'My Profile': 'プロフィール', 'Wishlist': 'ウィッシュリスト',
      'Sign Out': 'ログアウト', 'Home': 'ホーム', 'Shop': 'ショップ', 'Cart': 'カート', 'Orders': '注文',
      'Account': 'アカウント', 'Search': '検索', 'Contact Us': 'お問い合わせ',
      'Cancel Order': '注文をキャンセル', 'Total': '合計', 'Checkout': 'レジに進む',
      'Remove': '削除', 'All Products': '全商品', 'Price': '価格', 'Reviews': 'レビュー',
      'Help & Support': 'ヘルプ＆サポート', 'Language': '言語', 'Settings': '設定', 'Logout': 'ログアウト'
    },
    ko: {
      'Shop Now 🎁': '지금 구매 🎁', 'Shop Now': '지금 구매', 'View Collections': '컬렉션 보기',
      'Add to Cart': '장바구니에 추가', 'Buy Now': '지금 구매', 'My Account': '내 계정',
      'My Orders': '내 주문', 'My Profile': '내 프로필', 'Wishlist': '위시리스트',
      'Sign Out': '로그아웃', 'Home': '홈', 'Shop': '쇼핑', 'Cart': '장바구니', 'Orders': '주문',
      'Account': '계정', 'Search': '검색', 'Contact Us': '문의하기',
      'Cancel Order': '주문 취소', 'Total': '합계', 'Checkout': '결제',
      'Remove': '삭제', 'All Products': '전체 상품', 'Price': '가격', 'Reviews': '리뷰',
      'Help & Support': '도움말 및 지원', 'Language': '언어', 'Settings': '설정', 'Logout': '로그아웃'
    },
    ms: {
      'Shop Now 🎁': 'Beli Sekarang 🎁', 'Shop Now': 'Beli Sekarang', 'View Collections': 'Lihat Koleksi',
      'Add to Cart': 'Tambah ke Troli', 'Buy Now': 'Beli Sekarang', 'My Account': 'Akaun Saya',
      'My Orders': 'Pesanan Saya', 'My Profile': 'Profil Saya', 'Wishlist': 'Senarai Hajat',
      'Sign Out': 'Log Keluar', 'Home': 'Utama', 'Shop': 'Kedai', 'Cart': 'Troli', 'Orders': 'Pesanan',
      'Account': 'Akaun', 'Contact Us': 'Hubungi Kami',
      'Cancel Order': 'Batal Pesanan', 'Total': 'Jumlah', 'Checkout': 'Bayar',
      'Remove': 'Buang', 'All Products': 'Semua Produk', 'Price': 'Harga',
      'Help & Support': 'Bantuan & Sokongan', 'Language': 'Bahasa', 'Settings': 'Tetapan', 'Logout': 'Log Keluar'
    },
    ml: {
      'Shop Now 🎁': 'ഇപ്പോൾ വാങ്ങുക 🎁', 'Shop Now': 'ഇപ്പോൾ വാങ്ങുക', 'View Collections': 'ശേഖരങ്ങൾ കാണുക',
      'Add to Cart': 'കാർട്ടിലേക്ക് ചേർക്കുക', 'Buy Now': 'ഇപ്പോൾ വാങ്ങുക', 'My Account': 'എന്റെ അക്കൗണ്ട്',
      'My Orders': 'എന്റെ ഓർഡറുകൾ', 'My Profile': 'എന്റെ പ്രൊഫൈൽ', 'Wishlist': 'വിഷ്‌ലിസ്റ്റ്',
      'Sign Out': 'സൈൻ ഔട്ട്', 'Home': 'ഹോം', 'Shop': 'ഷോപ്പ്', 'Cart': 'കാർട്ട്', 'Orders': 'ഓർഡറുകൾ',
      'Account': 'അക്കൗണ്ട്', 'Contact Us': 'ഞങ്ങളെ ബന്ധപ്പെടുക',
      'Cancel Order': 'ഓർഡർ റദ്ദാക്കുക', 'Total': 'ആകെ', 'Checkout': 'ചെക്കൗട്ട്',
      'Remove': 'നീക്കം ചെയ്യുക', 'All Products': 'എല്ലാ ഉൽപ്പന്നങ്ങളും', 'Price': 'വില',
      'Help & Support': 'സഹായവും പിന്തുണയും', 'Language': 'ഭാഷ', 'Settings': 'ക്രമീകരണങ്ങൾ', 'Logout': 'ലോഗൗട്ട്'
    },
    bn: {
      'Shop Now 🎁': 'এখনই কিনুন 🎁', 'Shop Now': 'এখনই কিনুন', 'View Collections': 'সংগ্রহ দেখুন',
      'Add to Cart': 'কার্টে যোগ করুন', 'Buy Now': 'এখনই কিনুন', 'My Account': 'আমার অ্যাকাউন্ট',
      'My Orders': 'আমার অর্ডার', 'My Profile': 'আমার প্রোফাইল', 'Wishlist': 'ইচ্ছা তালিকা',
      'Sign Out': 'সাইন আউট', 'Home': 'হোম', 'Shop': 'দোকান', 'Cart': 'কার্ট', 'Orders': 'অর্ডার',
      'Account': 'অ্যাকাউন্ট', 'Contact Us': 'যোগাযোগ করুন',
      'Cancel Order': 'অর্ডার বাতিল', 'Total': 'মোট', 'Checkout': 'চেকআউট',
      'Remove': 'মুছুন', 'All Products': 'সব পণ্য', 'Price': 'মূল্য',
      'Help & Support': 'সাহায্য ও সহায়তা', 'Language': 'ভাষা', 'Settings': 'সেটিংস', 'Logout': 'লগআউট'
    },
    pt: {
      'Shop Now 🎁': 'Compre Agora 🎁', 'Shop Now': 'Compre Agora', 'View Collections': 'Ver Coleções',
      'Add to Cart': 'Adicionar ao Carrinho', 'Buy Now': 'Comprar Agora', 'My Account': 'Minha Conta',
      'My Orders': 'Meus Pedidos', 'My Profile': 'Meu Perfil', 'Wishlist': 'Lista de Desejos',
      'Sign Out': 'Sair', 'Home': 'Início', 'Shop': 'Loja', 'Cart': 'Carrinho', 'Orders': 'Pedidos',
      'Account': 'Conta', 'Contact Us': 'Fale Conosco',
      'Cancel Order': 'Cancelar Pedido', 'Total': 'Total', 'Checkout': 'Finalizar',
      'Remove': 'Remover', 'All Products': 'Todos os Produtos', 'Price': 'Preço',
      'Help & Support': 'Ajuda e Suporte', 'Language': 'Idioma', 'Settings': 'Configurações', 'Logout': 'Sair'
    }
  };

  /* ── Build reverse lookup for restoring English ────────────── */
  var _reverseMap = {};
  function _buildReverse() {
    Object.keys(TRANSLATIONS).forEach(function (lang) {
      var dict = TRANSLATIONS[lang];
      Object.keys(dict).forEach(function (enKey) {
        _reverseMap[dict[enKey]] = enKey;
      });
    });
  }
  _buildReverse();

  /* ── Store original text for reliable switching ────────────── */
  var _originals = new WeakMap();

  function _getOriginal(el) {
    if (_originals.has(el)) return _originals.get(el);
    return null;
  }

  function _setOriginal(el, text) {
    if (!_originals.has(el)) _originals.set(el, text);
  }

  /* ── Apply language translation ─────────────────────────────── */
  function applyLang(code) {
    // Set text direction
    document.documentElement.dir = (code === 'ar' || code === 'ur') ? 'rtl' : 'ltr';
    // Save to localStorage
    localStorage.setItem('ah_lang', code);

    // ── Apply correct font for the script ──
    var LANG_FONTS = {
      hi: { family: 'Noto Sans Devanagari', url: 'Noto+Sans+Devanagari:wght@400;600' },
      te: { family: 'Noto Sans Telugu',     url: 'Noto+Sans+Telugu:wght@400;600' },
      ta: { family: 'Noto Sans Tamil',      url: 'Noto+Sans+Tamil:wght@400;600' },
      ar: { family: 'Noto Naskh Arabic',    url: 'Noto+Naskh+Arabic:wght@400;600' },
      ur: { family: 'Noto Naskh Arabic',    url: 'Noto+Naskh+Arabic:wght@400;600' },
      bn: { family: 'Noto Sans Bengali',    url: 'Noto+Sans+Bengali:wght@400;600' },
      ml: { family: 'Noto Sans Malayalam',  url: 'Noto+Sans+Malayalam:wght@400;600' },
      zh: { family: 'Noto Sans SC',         url: 'Noto+Sans+SC:wght@400;600' },
      ja: { family: 'Noto Sans JP',         url: 'Noto+Sans+JP:wght@400;600' },
      ko: { family: 'Noto Sans KR',         url: 'Noto+Sans+KR:wght@400;600' },
      ms: { family: 'Noto Sans',            url: 'Noto+Sans:wght@400;600' }
    };
    var fontInfo = LANG_FONTS[code];
    if (fontInfo) {
      // Load the Google Font if not already loaded
      var fontId = 'ah-font-' + code;
      if (!document.getElementById(fontId)) {
        var link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=' + fontInfo.url + '&display=swap';
        document.head.appendChild(link);
      }
      // Apply font to body and override Jost/Cormorant
      document.body.style.fontFamily = "'" + fontInfo.family + "', sans-serif";
    } else {
      // Restore default fonts for Latin scripts
      document.body.style.fontFamily = "'Jost', 'Cormorant Garamond', sans-serif";
    }
    var dict = TRANSLATIONS[code] || {};
    var isEnglish = (!code || code === 'en' || Object.keys(dict).length === 0);

    // Target: buttons, links, nav labels, and elements with data-translate
    var selectors = 'a, button, .btn-solid, .btn-outline, .acc-nav-item span, .bn-label, .field-label, .panel-title, .profile-card h3, .esb-link, .esb-section-lbl, .save-btn, .shop-btn, .cancel-btn, [data-translate]';

    document.querySelectorAll(selectors).forEach(function (el) {
      // Skip elements with complex children (images, inputs, etc) — only translate leaf text
      if (el.querySelector('img, input, select, textarea, svg')) return;
      // Skip elements that have many child elements (likely container, not text)
      if (el.children.length > 3) return;

      var rawText = '';
      // For elements with mixed content (icon + text), get just the text
      if (el.childNodes.length > 1) {
        // Find text nodes and spans with text
        for (var i = 0; i < el.childNodes.length; i++) {
          var node = el.childNodes[i];
          if (node.nodeType === 3) { // text node
            rawText += node.textContent;
          }
        }
        rawText = rawText.trim();
      } else {
        rawText = el.textContent.trim();
      }
      if (!rawText) return;

      // Store original English text on first encounter
      _setOriginal(el, rawText);
      var originalText = _getOriginal(el) || rawText;

      // Try to find the English key — either it IS the English key, or we reverse-map it
      var englishKey = originalText;
      if (_reverseMap[originalText]) {
        englishKey = _reverseMap[originalText];
      }

      if (isEnglish) {
        // Restore to English
        if (el.childNodes.length > 1) {
          for (var j = 0; j < el.childNodes.length; j++) {
            if (el.childNodes[j].nodeType === 3 && el.childNodes[j].textContent.trim()) {
              el.childNodes[j].textContent = englishKey;
              break;
            }
          }
        } else {
          // Only update if this was a translated element (has an emoji prefix like 💾, 🌍 etc)
          var emojiMatch = el.textContent.match(/^([\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]\s*)/u);
          if (emojiMatch && dict[englishKey.replace(emojiMatch[0], '').trim()]) {
            // keep emoji prefix
          }
          el.textContent = englishKey;
        }
      } else if (dict[englishKey]) {
        // Translate to target language
        if (el.childNodes.length > 1) {
          for (var k = 0; k < el.childNodes.length; k++) {
            if (el.childNodes[k].nodeType === 3 && el.childNodes[k].textContent.trim()) {
              el.childNodes[k].textContent = dict[englishKey];
              break;
            }
          }
        } else {
          el.textContent = dict[englishKey];
        }
      }
    });

    // Also translate bottom nav labels specifically
    document.querySelectorAll('.bn-label').forEach(function (el) {
      var text = el.textContent.trim();
      _setOriginal(el, text);
      var orig = _getOriginal(el) || text;
      var enKey = _reverseMap[orig] || orig;
      if (isEnglish) {
        el.textContent = enKey;
      } else if (dict[enKey]) {
        el.textContent = dict[enKey];
      }
    });
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    var prefs = {};
    try { prefs = JSON.parse(localStorage.getItem('ah_prefs') || '{}'); } catch (e) { }
    var lang = localStorage.getItem('ah_lang') || prefs.lang || 'en';
    var currency = prefs.currency || 'INR';

    if (lang && lang !== 'en') applyLang(lang);
    if (currency && currency !== 'INR') applyCurrency(currency);
  }

  /* ── Expose globally ─────────────────────────────────────────── */
  window.AH_applyLang = applyLang;
  window.AH_applyCurrency = applyCurrency;
  window.AH_reapplyCurrency = reapplyCurrency;
  window.AH_TRANSLATIONS = TRANSLATIONS;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
