import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const translations = {
  en: {
    // Header
    tagline: "Supporting Students Together",
    dashboard: "Dashboard",
    wantToHelp: "I Want to Help",
    needHelp: "I Need Help",
    login: "Login",
    register: "Register",
    logout: "Logout",

    // Dashboard
    welcomeBack: "Welcome, {name}!",
    choosePlatform: "Choose how you want to use the platform today",
    volunteerMode: "Volunteer Mode",
    helpStudents: "Help students with special needs around campus",
    volunteerDescription: "View assistance requests from students and offer your help with note-taking, mobility assistance, study support, and more.",
    enterVolunteerMode: "Enter Volunteer Mode",
    requestAssistance: "Request Assistance",
    getHelp: "Get help from volunteers around campus",
    requestDescription: "Submit requests for assistance with mobility, note-taking, or other needs. Connect with student volunteers ready to help you whenever you need.",
    logOut: "Log Out",

    // Login
    welcomeBackLogin: "Welcome Back",
    loginAccess: "Log in to access campus assistance services",
    phoneNumber: "Phone Number",
    password: "Password",
    phoneHint: "Enter a valid Jordanian phone number (e.g., +962 7XXXXXXXX)",
    rememberMe: "Remember me",
    loginButton: "Log In",
    noAccount: "Don't have an account?",
    registerNow: "Register now",

    // Registration
    userRegistration: "User Registration",
    createAccount: "Create an account to access all campus support services",
    accountInfo: "Account Information",
    firstName: "First Name",
    lastName: "Last Name",
    confirmPassword: "Confirm Password",
    agreeTerms: "I agree to the terms and conditions",
    registrationNote: "After registration, you'll be able to use both volunteer and assistance services.",
    goBack: "Go Back",
    createAccountButton: "Create Account",
    adminAccess: "For Testing & Demo Purposes:",
    accessAdmin: "🔧 Access Admin Panel (Demo)",
    skipRegistration: "Skip registration and go directly to admin dashboard",

    // Patient Mode
    requestAssistanceTitle: "Request Assistance",
    submitRequest: "Submit a request for volunteer support on campus",
    backToDashboard: "← Back to Dashboard",
    requestSubmitted: "Your assistance request has been submitted successfully!",
    yourRequests: "Your Open Requests",
    active: "Active",
    date: "Date",
    time: "Time",
    location: "Location",
    contact: "Contact",
    deleteRequest: "Delete Request",
    deleteNote: "Only delete this request after a volunteer has contacted you and you no longer need assistance.",
    typeOfAssistance: "Type of Assistance Needed",
    selectCategory: "Select a category",
    phoneContact: "Phone Number for Contact",
    descriptionNeeded: "Description of Assistance Needed",
    descriptionPlaceholder: "Please provide details about what kind of help you need",
    requestNote: "Volunteers will contact you through the phone number you provide. Delete your request once you've been contacted and no longer need help.",
    submitRequestButton: "Submit Request",
    whatToExpect: "What to Expect",
    step1: "Submit your assistance request with all required details",
    step2: "Your request will be visible to all registered volunteers",
    step3: "A volunteer will contact you directly through your provided phone number",
    step4: "Once you've received help, delete your request to complete the process",

    // Volunteer Mode
    volunteerDashboard: "Volunteer Dashboard",
    viewRequests: "View and respond to assistance requests from students",
    openRequests: "Open Assistance Requests",
    noRequests: "There are currently no open assistance requests.",
    yourRequest: "Your Request",
    ownRequestNotice: "This is your own request. Wait for a volunteer to contact you.",
    volunteerGuidelines: "Volunteer Guidelines",
    guideline1: "Review assistance requests that match your skills and availability",
    guideline2: "Call the student directly using the phone number provided",
    guideline3: "Coordinate with the student to provide the assistance they need",
    guideline4: "Students will delete their requests once they've received help",

    // Categories
    mobilityImpairment: "Mobility Impairment",
    noteTaking: "Note Taking",
    readingMaterials: "Reading Materials",
    signLanguage: "Sign Language Interpretation",
    techAssistance: "Technology Assistance",
    otherAssistance: "Other Assistance",

    // Footer
    aboutCampusHelp: "Connecting students with special needs to volunteer helpers on campus. Together, we build a more inclusive educational environment.",
    quickLinks: "Quick Links",
    home: "Home",
    resources: "Resources",
    contactUs: "Contact Us",

    // Common
    loading: "Loading...",
    required: "required",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",

    // Validation messages
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    phoneRequired: "Phone number is required",
    passwordRequired: "Password is required",
    passwordLength: "Password must be at least 8 characters",
    passwordMatch: "Passwords do not match",
    agreeTermsRequired: "You must agree to the terms and conditions",
    validPhone: "Please enter a valid Jordanian phone number",
    categoryRequired: "Please select a category",
    dateRequired: "Date is required",
    timeRequired: "Time is required",
    locationRequired: "Location is required",
    descriptionRequired: "Description is required",
    futureDateRequired: "Date must be today or in the future",

    // Admin Dashboard
    adminPanel: "Admin Panel",
    platformOverview: "Platform Overview",
    totalUsers: "Total Users",
    totalRequests: "Total Requests",
    activeRequests: "Active Requests",
    completedRequests: "Completed Requests",
    requestsByCategory: "Requests by Category",
    userManagement: "User Management",
    allUsers: "All Users",
    noUsersFound: "No users found",
    name: "Name",
    email: "Email",
    role: "Role",
    actions: "Actions",
    admin: "Admin",
    user: "User",
    addNewAdmin: "Add New Admin",
    allFieldsRequired: "All fields are required",
    adminCreatedSuccess: "Admin user created successfully",
    addAdminUser: "Add Admin User",
    assistanceRequests: "Assistance Requests",
    noRequestsFound: "No requests found",
    id: "ID",
    category: "Category",
    dateTime: "Date & Time",
    status: "Status",
    at: "at",
    open: "Open",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    view: "View",
    requestDescription: "Request Description",
    systemSettings: "System Settings",
    platformSettings: "Platform Settings",
    platformName: "Platform Name",
    supportEmail: "Support Email",
    enableUserRegistration: "Enable User Registration",
    requireAdminApproval: "Require Admin Approval for New Users",
    enableEmailNotifications: "Enable Email Notifications",
    saveSettings: "Save Settings",
    settingsSaved: "Settings saved successfully",
    systemMaintenance: "System Maintenance",
    clearCompletedRequests: "Clear Completed Requests",
    resetSystemData: "Reset System Data",
    confirmClearCompleted: "Are you sure you want to clear all completed requests?",
    confirmResetSystem: "Are you sure you want to reset all system data? This action cannot be undone.",
    completedRequestsCleared: "Completed requests have been cleared",
    systemDataCleared: "System data has been cleared",
    selectSection: "Please select a section from the menu",
    returnToUserDashboard: "Return to User Dashboard",
    administrator: "Administrator",
    users: "Users",
    requests: "Requests",
    settings: "Settings",
    confirmDeleteUser: "Are you sure you want to delete this user?",
    confirmDeleteRequest: "Are you sure you want to delete this request?"
  },
  ar: {
    // Header
    tagline: "دعم الطلاب معاً",
    dashboard: "لوحة التحكم",
    wantToHelp: "أريد المساعدة",
    needHelp: "أحتاج المساعدة",
    login: "تسجيل الدخول",
    register: "التسجيل",
    logout: "تسجيل الخروج",

    // Dashboard
    welcomeBack: "مرحباً، {name}!",
    choosePlatform: "اختر كيف تريد استخدام المنصة اليوم",
    volunteerMode: "وضع المتطوع",
    helpStudents: "ساعد الطلاب ذوي الاحتياجات الخاصة في الحرم الجامعي",
    volunteerDescription: "اعرض طلبات المساعدة من الطلاب وقدم مساعدتك في تدوين الملاحظات ومساعدة الحركة والدعم الدراسي والمزيد.",
    enterVolunteerMode: "دخول وضع المتطوع",
    requestAssistance: "طلب المساعدة",
    getHelp: "احصل على المساعدة من المتطوعين في الحرم الجامعي",
    requestDescription: "قدم طلبات للحصول على المساعدة في الحركة وتدوين الملاحظات أو الحاجات الأخرى. تواصل مع المتطوعين الطلاب المستعدين لمساعدتك عند الحاجة.",
    logOut: "تسجيل الخروج",

    // Login
    welcomeBackLogin: "مرحباً بعودتك",
    loginAccess: "سجل الدخول للوصول إلى خدمات المساعدة الجامعية",
    phoneNumber: "رقم الهاتف",
    password: "كلمة المرور",
    phoneHint: "أدخل رقم هاتف أردني صالح (مثل: +962 7XXXXXXXX)",
    rememberMe: "تذكرني",
    loginButton: "تسجيل الدخول",
    noAccount: "ليس لديك حساب؟",
    registerNow: "سجل الآن",

    // Registration
    userRegistration: "تسجيل المستخدم",
    createAccount: "أنشئ حساباً للوصول إلى جميع خدمات الدعم الجامعي",
    accountInfo: "معلومات الحساب",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    confirmPassword: "تأكيد كلمة المرور",
    agreeTerms: "أوافق على الشروط والأحكام",
    registrationNote: "بعد التسجيل، ستتمكن من استخدام خدمات التطوع والمساعدة.",
    goBack: "العودة",
    createAccountButton: "إنشاء حساب",
    adminAccess: "لأغراض الاختبار والعرض التوضيحي:",
    accessAdmin: "🔧 الوصول إلى لوحة الإدارة (تجريبي)",
    skipRegistration: "تخطي التسجيل والذهاب مباشرة إلى لوحة الإدارة",

    // Patient Mode
    requestAssistanceTitle: "طلب المساعدة",
    submitRequest: "قدم طلباً للحصول على دعم المتطوعين في الحرم الجامعي",
    backToDashboard: "← العودة إلى لوحة التحكم",
    requestSubmitted: "تم تقديم طلب المساعدة بنجاح!",
    yourRequests: "طلباتك المفتوحة",
    active: "نشط",
    date: "التاريخ",
    time: "الوقت",
    location: "الموقع",
    contact: "التواصل",
    deleteRequest: "حذف الطلب",
    deleteNote: "احذف هذا الطلب فقط بعد أن يتواصل معك متطوع ولم تعد بحاجة للمساعدة.",
    typeOfAssistance: "نوع المساعدة المطلوبة",
    selectCategory: "اختر فئة",
    phoneContact: "رقم الهاتف للتواصل",
    descriptionNeeded: "وصف المساعدة المطلوبة",
    descriptionPlaceholder: "يرجى تقديم تفاصيل حول نوع المساعدة التي تحتاجها",
    requestNote: "سيتواصل معك المتطوعون من خلال رقم الهاتف الذي تقدمه. احذف طلبك بمجرد التواصل معك وعدم حاجتك للمساعدة.",
    submitRequestButton: "تقديم الطلب",
    whatToExpect: "ماذا تتوقع",
    step1: "قدم طلب المساعدة مع جميع التفاصيل المطلوبة",
    step2: "سيكون طلبك مرئياً لجميع المتطوعين المسجلين",
    step3: "سيتواصل معك متطوع مباشرة من خلال رقم الهاتف المقدم",
    step4: "بمجرد حصولك على المساعدة، احذف طلبك لإكمال العملية",

    // Volunteer Mode
    volunteerDashboard: "لوحة تحكم المتطوع",
    viewRequests: "عرض والرد على طلبات المساعدة من الطلاب",
    openRequests: "طلبات المساعدة المفتوحة",
    noRequests: "لا توجد حالياً طلبات مساعدة مفتوحة.",
    yourRequest: "طلبك",
    ownRequestNotice: "هذا طلبك الخاص. انتظر متطوعاً للتواصل معك.",
    volunteerGuidelines: "إرشادات المتطوع",
    guideline1: "راجع طلبات المساعدة التي تتناسب مع مهاراتك وتوفرك",
    guideline2: "اتصل بالطالب مباشرة باستخدام رقم الهاتف المقدم",
    guideline3: "تنسق مع الطالب لتقديم المساعدة التي يحتاجها",
    guideline4: "سيحذف الطلاب طلباتهم بمجرد حصولهم على المساعدة",

    // Categories
    mobilityImpairment: "إعاقة حركية",
    noteTaking: "تدوين الملاحظات",
    readingMaterials: "مواد القراءة",
    signLanguage: "ترجمة لغة الإشارة",
    techAssistance: "مساعدة تقنية",
    otherAssistance: "مساعدة أخرى",

    // Footer
    aboutCampusHelp: "ربط الطلاب ذوي الاحتياجات الخاصة بالمساعدين المتطوعين في الحرم الجامعي. معاً، نبني بيئة تعليمية أكثر شمولية.",
    quickLinks: "روابط سريعة",
    home: "الرئيسية",
    resources: "الموارد",
    contactUs: "اتصل بنا",

    // Common
    loading: "جاري التحميل...",
    required: "مطلوب",
    cancel: "إلغاء",
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",
    confirm: "تأكيد",

    // Validation messages
    firstNameRequired: "الاسم الأول مطلوب",
    lastNameRequired: "اسم العائلة مطلوب",
    phoneRequired: "رقم الهاتف مطلوب",
    passwordRequired: "كلمة المرور مطلوبة",
    passwordLength: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
    passwordMatch: "كلمات المرور غير متطابقة",
    agreeTermsRequired: "يجب الموافقة على الشروط والأحكام",
    validPhone: "يرجى إدخال رقم هاتف أردني صالح",
    categoryRequired: "يرجى اختيار فئة",
    dateRequired: "التاريخ مطلوب",
    timeRequired: "الوقت مطلوب",
    locationRequired: "الموقع مطلوب",
    descriptionRequired: "الوصف مطلوب",
    futureDateRequired: "يجب أن يكون التاريخ اليوم أو في المستقبل",

    // Admin Dashboard
    adminPanel: "لوحة الإدارة",
    platformOverview: "نظرة عامة على المنصة",
    totalUsers: "إجمالي المستخدمين",
    totalRequests: "إجمالي الطلبات",
    activeRequests: "الطلبات النشطة",
    completedRequests: "الطلبات المكتملة",
    requestsByCategory: "الطلبات حسب الفئة",
    userManagement: "إدارة المستخدمين",
    allUsers: "جميع المستخدمين",
    noUsersFound: "لم يتم العثور على مستخدمين",
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    actions: "الإجراءات",
    admin: "مدير",
    user: "مستخدم",
    addNewAdmin: "إضافة مدير جديد",
    allFieldsRequired: "جميع الحقول مطلوبة",
    adminCreatedSuccess: "تم إنشاء المستخدم المدير بنجاح",
    addAdminUser: "إضافة مستخدم مدير",
    assistanceRequests: "طلبات المساعدة",
    noRequestsFound: "لم يتم العثور على طلبات",
    id: "المعرف",
    category: "الفئة",
    dateTime: "التاريخ والوقت",
    status: "الحالة",
    at: "في",
    open: "مفتوح",
    inProgress: "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغي",
    view: "عرض",
    requestDescription: "وصف الطلب",
    systemSettings: "إعدادات النظام",
    platformSettings: "إعدادات المنصة",
    platformName: "اسم المنصة",
    supportEmail: "بريد الدعم الإلكتروني",
    enableUserRegistration: "تفعيل تسجيل المستخدمين",
    requireAdminApproval: "طلب موافقة المدير للمستخدمين الجدد",
    enableEmailNotifications: "تفعيل إشعارات البريد الإلكتروني",
    saveSettings: "حفظ الإعدادات",
    settingsSaved: "تم حفظ الإعدادات بنجاح",
    systemMaintenance: "صيانة النظام",
    clearCompletedRequests: "مسح الطلبات المكتملة",
    resetSystemData: "إعادة تعيين بيانات النظام",
    confirmClearCompleted: "هل أنت متأكد من أنك تريد مسح جميع الطلبات المكتملة؟",
    confirmResetSystem: "هل أنت متأكد من أنك تريد إعادة تعيين جميع بيانات النظام؟ لا يمكن التراجع عن هذا الإجراء.",
    completedRequestsCleared: "تم مسح الطلبات المكتملة",
    systemDataCleared: "تم مسح بيانات النظام",
    selectSection: "يرجى اختيار قسم من القائمة",
    returnToUserDashboard: "العودة إلى لوحة تحكم المستخدم",
    administrator: "مدير",
    users: "المستخدمون",
    requests: "الطلبات",
    settings: "الإعدادات",
    confirmDeleteUser: "هل أنت متأكد من أنك تريد حذف هذا المستخدم؟",
    confirmDeleteRequest: "هل أنت متأكد من أنك تريد حذف هذا الطلب؟"
  }
};

// Hook for translations
export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key, params = {}) => {
    let translation = translations[language][key] || translations['en'][key] || key;
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  };
  
  return { t, language };
};

// Language Switcher Component
export const LanguageSwitcher = () => {
  const { language, switchLanguage } = useLanguage();
  
  return (
    <div className="language-switcher">
      <button
        onClick={() => switchLanguage(language === 'en' ? 'ar' : 'en')}
        className="language-toggle"
        aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      >
        {language === 'en' ? 'العربية' : 'English'}
      </button>
    </div>
  );
};