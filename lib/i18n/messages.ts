export const SUPPORTED_LOCALES = ["th", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "th";
export const LOCALE_COOKIE_NAME = "locale";

export interface Messages {
  localeName: string;
  localeSwitchLabel: string;
  nav: {
    home: string;
    menu: string;
    promotions: string;
    luckyDraw: string;
    profile: string;
  };
  hero: {
    chefSelection: string;
    orderNow: string;
    joinMember: string;
    subtitle: string;
    openHours: string;
  };
  home: {
    membership: string;
    member: string;
    luckyDraw: string;
    memberLogin: string;
    featuredMenu: string;
    viewAll: string;
    todayPromotions: string;
    seeMore: string;
    startOrdering: string;
  };
  menu: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    backToMenu: string;
    addToWishlist: string;
    addToCart: string;
    caloriesUnit: string;
  };
  promotions: {
    title: string;
    subtitle: string;
    becomeMember: string;
    ends: string;
    code: string;
  };
  auth: {
    backToHome: string;
    loginTitle: string;
    registerTitle: string;
    loginDescription: string;
    registerDescription: string;
    registerSuccess: string;
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    passwordPlaceholder: string;
    processing: string;
    signIn: string;
    createAccount: string;
    newMember: string;
    alreadyHaveAccount: string;
    createAccountLink: string;
    loginHereLink: string;
  };
  profile: {
    defaultMemberName: string;
    points: string;
    status: string;
    entries: string;
    goToLuckyDraw: string;
    luckyDrawHistory: string;
    notificationPreferences: string;
    signOut: string;
  };
  push: {
    title: string;
    description: string;
    unsupported: string;
    blocked: string;
    enabling: string;
    enableNotifications: string;
    updating: string;
    disableNotifications: string;
    missingVapidKey: string;
    permissionDenied: string;
    cannotSubscribe: string;
    enabled: string;
    subscriptionFailed: string;
    disabled: string;
    unsubscribeFailed: string;
  };
  luckyCampaign: {
    heroLabel: string;
    heroTitle: string;
    heroDescription: string;
    viewHistory: string;
    membershipTier: string;
    availablePoints: string;
    activeCampaigns: string;
    myEntries: string;
    loading: string;
    noCampaignTitle: string;
    noCampaignDescription: string;
    defaultDescription: string;
    eligible: string;
    locked: string;
    costPerEntry: string;
    minTier: string;
    yourEntries: string;
    remainingRights: string;
    joining: string;
    joinLuckyDraw: string;
    unableToLoadCampaigns: string;
    unableToJoin: string;
    joinedSuccessfully: string;
    pointsUnit: string;
  };
  luckyHistory: {
    backToLuckyDraw: string;
    title: string;
    subtitle: string;
    loading: string;
    noParticipationTitle: string;
    noParticipationDescription: string;
    pointsSpent: string;
    prize: string;
    entryId: string;
    unknownCampaign: string;
    unableToLoadHistory: string;
  };
  labels: {
    guest: string;
    category: Record<string, string>;
    spicy: Record<string, string>;
    membershipTier: Record<string, string>;
    membershipStatus: Record<string, string>;
    luckyStatus: Record<string, string>;
    pointsShort: string;
  };
}

export const MESSAGES: Record<Locale, Messages> = {
  th: {
    localeName: "ไทย",
    localeSwitchLabel: "TH",
    nav: {
      home: "หน้าแรก",
      menu: "เมนู",
      promotions: "โปรโมชัน",
      luckyDraw: "ลุ้นรางวัล",
      profile: "โปรไฟล์"
    },
    hero: {
      chefSelection: "เชฟแนะนำ",
      orderNow: "สั่งเลย",
      joinMember: "สมัครสมาชิก",
      subtitle: "อาหารไทยร่วมสมัย พร้อมสิทธิพิเศษสมาชิก",
      openHours: "เปิดทุกวัน 10:00 - 22:00"
    },
    home: {
      membership: "สมาชิก",
      member: "สมาชิก",
      luckyDraw: "ลุ้นรางวัล",
      memberLogin: "เข้าสู่ระบบสมาชิก",
      featuredMenu: "เมนูแนะนำ",
      viewAll: "ดูทั้งหมด",
      todayPromotions: "โปรโมชันวันนี้",
      seeMore: "ดูเพิ่ม",
      startOrdering: "เริ่มสั่งอาหาร"
    },
    menu: {
      title: "เมนูอาหาร",
      subtitle: "เมนูคุณภาพสำหรับการสั่งผ่านมือถือ",
      searchPlaceholder: "ค้นหาเมนู...",
      backToMenu: "กลับไปหน้าเมนู",
      addToWishlist: "เพิ่มในรายการโปรด",
      addToCart: "เพิ่มลงตะกร้า",
      caloriesUnit: "กิโลแคลอรี"
    },
    promotions: {
      title: "โปรโมชัน",
      subtitle: "แคมเปญล่าสุดและสิทธิพิเศษสำหรับสมาชิก",
      becomeMember: "สมัครสมาชิกเพื่อรับสิทธิ์เพิ่ม",
      ends: "สิ้นสุด",
      code: "โค้ด"
    },
    auth: {
      backToHome: "กลับหน้าแรก",
      loginTitle: "เข้าสู่ระบบสมาชิก",
      registerTitle: "สมัครสมาชิก",
      loginDescription: "เข้าถึงคะแนน คูปองลุ้นรางวัล และโปรโมชันของคุณ",
      registerDescription: "สร้างบัญชีสมาชิกเพื่อรับสิทธิพิเศษและรางวัล",
      registerSuccess: "สมัครสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
      fullNamePlaceholder: "ชื่อ-นามสกุล",
      emailPlaceholder: "อีเมล",
      phonePlaceholder: "เบอร์โทรศัพท์",
      passwordPlaceholder: "รหัสผ่าน",
      processing: "กำลังดำเนินการ...",
      signIn: "เข้าสู่ระบบ",
      createAccount: "สร้างบัญชี",
      newMember: "ยังไม่เป็นสมาชิก?",
      alreadyHaveAccount: "มีบัญชีอยู่แล้ว?",
      createAccountLink: "สมัครสมาชิก",
      loginHereLink: "เข้าสู่ระบบ"
    },
    profile: {
      defaultMemberName: "สมาชิก",
      points: "คะแนน",
      status: "สถานะ",
      entries: "จำนวนสิทธิ์",
      goToLuckyDraw: "ไปหน้าลุ้นรางวัล",
      luckyDrawHistory: "ประวัติลุ้นรางวัล",
      notificationPreferences: "การแจ้งเตือน",
      signOut: "ออกจากระบบ"
    },
    push: {
      title: "การแจ้งเตือน",
      description: "รับแจ้งเตือนโปรโมชันแบบเรียลไทม์ผ่าน Chrome PWA เราจะส่งเฉพาะข้อมูลสำคัญ",
      unsupported: "เบราว์เซอร์นี้ไม่รองรับ Web Push Notification",
      blocked: "เบราว์เซอร์บล็อกการแจ้งเตือนอยู่ กรุณาเปิดสิทธิ์แล้วรีเฟรช",
      enabling: "กำลังเปิดใช้งาน...",
      enableNotifications: "เปิดการแจ้งเตือน",
      updating: "กำลังอัปเดต...",
      disableNotifications: "ปิดการแจ้งเตือน",
      missingVapidKey: "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_VAPID_PUBLIC_KEY",
      permissionDenied: "ไม่ได้รับสิทธิ์แจ้งเตือน กรุณาเปิดสิทธิ์ในเบราว์เซอร์",
      cannotSubscribe: "ไม่สามารถสมัครรับการแจ้งเตือน",
      enabled: "เปิดรับการแจ้งเตือนเรียบร้อยแล้ว",
      subscriptionFailed: "สมัครรับการแจ้งเตือนไม่สำเร็จ",
      disabled: "ปิดรับการแจ้งเตือนเรียบร้อยแล้ว",
      unsubscribeFailed: "ยกเลิกการแจ้งเตือนไม่สำเร็จ"
    },
    luckyCampaign: {
      heroLabel: "กิจกรรมลุ้นรางวัล",
      heroTitle: "หมุนรับของรางวัล",
      heroDescription: "เข้าร่วมแคมเปญที่เปิดอยู่ และติดตามประวัติการร่วมกิจกรรม",
      viewHistory: "ดูประวัติการเข้าร่วม",
      membershipTier: "ระดับสมาชิก",
      availablePoints: "คะแนนคงเหลือ",
      activeCampaigns: "แคมเปญที่เปิดอยู่",
      myEntries: "สิทธิ์ที่ใช้ไป",
      loading: "กำลังโหลดแคมเปญ...",
      noCampaignTitle: "ยังไม่มีแคมเปญลุ้นรางวัล",
      noCampaignDescription: "ขณะนี้ยังไม่มีแคมเปญใหม่ โปรดกลับมาตรวจสอบภายหลัง",
      defaultDescription: "แคมเปญลุ้นรางวัลสำหรับสมาชิก",
      eligible: "เข้าร่วมได้",
      locked: "ยังไม่พร้อม",
      costPerEntry: "ใช้ต่อ 1 สิทธิ์",
      minTier: "ระดับขั้นต่ำ",
      yourEntries: "สิทธิ์ของคุณ",
      remainingRights: "สิทธิ์คงเหลือ",
      joining: "กำลังเข้าร่วม...",
      joinLuckyDraw: "เข้าร่วมลุ้นรางวัล",
      unableToLoadCampaigns: "ไม่สามารถโหลดแคมเปญลุ้นรางวัลได้",
      unableToJoin: "ไม่สามารถเข้าร่วมลุ้นรางวัลได้",
      joinedSuccessfully: "เข้าร่วมแคมเปญเรียบร้อยแล้ว",
      pointsUnit: "คะแนน"
    },
    luckyHistory: {
      backToLuckyDraw: "กลับไปหน้าลุ้นรางวัล",
      title: "ประวัติลุ้นรางวัล",
      subtitle: "ตรวจสอบประวัติการเข้าร่วมและผลลัพธ์ในแต่ละแคมเปญ",
      loading: "กำลังโหลดประวัติ...",
      noParticipationTitle: "ยังไม่มีประวัติการเข้าร่วม",
      noParticipationDescription: "คุณยังไม่เคยเข้าร่วมแคมเปญลุ้นรางวัล",
      pointsSpent: "คะแนนที่ใช้",
      prize: "รางวัล",
      entryId: "รหัสรายการ",
      unknownCampaign: "แคมเปญลุ้นรางวัล",
      unableToLoadHistory: "ไม่สามารถโหลดประวัติการลุ้นรางวัลได้"
    },
    labels: {
      guest: "บุคคลทั่วไป",
      category: {
        All: "ทั้งหมด",
        Main: "จานหลัก",
        Noodles: "เส้น",
        Dessert: "ของหวาน",
        Beverage: "เครื่องดื่ม"
      },
      spicy: {
        Mild: "เผ็ดน้อย",
        Medium: "เผ็ดกลาง",
        Hot: "เผ็ดมาก"
      },
      membershipTier: {
        guest: "บุคคลทั่วไป",
        bronze: "บรอนซ์",
        silver: "ซิลเวอร์",
        gold: "โกลด์",
        platinum: "แพลทินัม"
      },
      membershipStatus: {
        inactive: "ไม่ใช้งาน",
        active: "ใช้งาน",
        suspended: "ระงับ"
      },
      luckyStatus: {
        pending: "รอตรวจสอบ",
        won: "ถูกรางวัล",
        lost: "ไม่ได้รางวัล",
        claimed: "รับรางวัลแล้ว"
      },
      pointsShort: "คะแนน"
    }
  },
  en: {
    localeName: "English",
    localeSwitchLabel: "EN",
    nav: {
      home: "Home",
      menu: "Menu",
      promotions: "Promos",
      luckyDraw: "Lucky",
      profile: "Profile"
    },
    hero: {
      chefSelection: "Chef Selection",
      orderNow: "Order Now",
      joinMember: "Join Member",
      subtitle: "Modern Thai dining with member rewards",
      openHours: "Open daily 10:00 - 22:00"
    },
    home: {
      membership: "Membership",
      member: "Member",
      luckyDraw: "Lucky Draw",
      memberLogin: "Member Login",
      featuredMenu: "Featured Menu",
      viewAll: "View all",
      todayPromotions: "Today Promotions",
      seeMore: "See more",
      startOrdering: "Start Ordering"
    },
    menu: {
      title: "Menu",
      subtitle: "Premium dishes curated for mobile ordering.",
      searchPlaceholder: "Search menu...",
      backToMenu: "Back to Menu",
      addToWishlist: "Add to Wishlist",
      addToCart: "Add to Cart",
      caloriesUnit: "kcal"
    },
    promotions: {
      title: "Promotions",
      subtitle: "Updated campaigns and member-exclusive privileges.",
      becomeMember: "Become Member to Unlock More",
      ends: "Ends",
      code: "Code"
    },
    auth: {
      backToHome: "Back to Home",
      loginTitle: "Member Login",
      registerTitle: "Member Register",
      loginDescription: "Access your points, lucky draw tickets, and promotions.",
      registerDescription: "Create your member account to receive rewards and special offers.",
      registerSuccess: "Register success. Please verify email before login.",
      fullNamePlaceholder: "Full name",
      emailPlaceholder: "Email address",
      phonePlaceholder: "Phone number",
      passwordPlaceholder: "Password",
      processing: "Processing...",
      signIn: "Sign In",
      createAccount: "Create Account",
      newMember: "New member?",
      alreadyHaveAccount: "Already have an account?",
      createAccountLink: "Create account",
      loginHereLink: "Login here"
    },
    profile: {
      defaultMemberName: "Member",
      points: "Points",
      status: "Status",
      entries: "Entries",
      goToLuckyDraw: "Go to Lucky Draw",
      luckyDrawHistory: "Lucky Draw History",
      notificationPreferences: "Notification Preferences",
      signOut: "Sign Out"
    },
    push: {
      title: "Push Notifications",
      description:
        "Get real-time promo alerts in Chrome PWA. We only send important restaurant updates.",
      unsupported: "This browser does not support web push notifications.",
      blocked: "Notifications blocked. Please enable in browser settings and refresh.",
      enabling: "Enabling...",
      enableNotifications: "Enable Notifications",
      updating: "Updating...",
      disableNotifications: "Disable Notifications",
      missingVapidKey: "Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY.",
      permissionDenied: "Permission denied. Enable notifications from browser settings.",
      cannotSubscribe: "Cannot subscribe.",
      enabled: "Notification subscription enabled.",
      subscriptionFailed: "Subscription failed.",
      disabled: "Notification subscription disabled.",
      unsubscribeFailed: "Unsubscribe failed."
    },
    luckyCampaign: {
      heroLabel: "Lucky Draw Event",
      heroTitle: "Spin & Win Rewards",
      heroDescription: "Join active campaigns and track your lucky draw participation history.",
      viewHistory: "View participation history",
      membershipTier: "Membership Tier",
      availablePoints: "Available Points",
      activeCampaigns: "Active Campaigns",
      myEntries: "My Entries",
      loading: "Loading campaigns...",
      noCampaignTitle: "No active lucky draw campaigns",
      noCampaignDescription: "No campaign is currently available. Please check back later.",
      defaultDescription: "Lucky draw campaign for members.",
      eligible: "Eligible",
      locked: "Locked",
      costPerEntry: "Cost / Entry",
      minTier: "Min Tier",
      yourEntries: "Your Entries",
      remainingRights: "Remaining Rights",
      joining: "Joining...",
      joinLuckyDraw: "Join Lucky Draw",
      unableToLoadCampaigns: "Unable to load lucky draw campaigns.",
      unableToJoin: "Unable to join lucky draw.",
      joinedSuccessfully: "Joined campaign successfully.",
      pointsUnit: "pts"
    },
    luckyHistory: {
      backToLuckyDraw: "Back to lucky draw",
      title: "Lucky Draw History",
      subtitle: "Review your participation timeline and campaign outcomes.",
      loading: "Loading history...",
      noParticipationTitle: "No participation yet",
      noParticipationDescription: "You have not joined any lucky draw campaign yet.",
      pointsSpent: "Points Spent",
      prize: "Prize",
      entryId: "Entry ID",
      unknownCampaign: "Lucky Draw Campaign",
      unableToLoadHistory: "Unable to load lucky draw history."
    },
    labels: {
      guest: "Guest",
      category: {
        All: "All",
        Main: "Main",
        Noodles: "Noodles",
        Dessert: "Dessert",
        Beverage: "Beverage"
      },
      spicy: {
        Mild: "Mild",
        Medium: "Medium",
        Hot: "Hot"
      },
      membershipTier: {
        guest: "Guest",
        bronze: "Bronze",
        silver: "Silver",
        gold: "Gold",
        platinum: "Platinum"
      },
      membershipStatus: {
        inactive: "Inactive",
        active: "Active",
        suspended: "Suspended"
      },
      luckyStatus: {
        pending: "Pending",
        won: "Won",
        lost: "Lost",
        claimed: "Claimed"
      },
      pointsShort: "pts"
    }
  }
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value) && SUPPORTED_LOCALES.includes(value as Locale);
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDateLocale(locale: Locale): string {
  return locale === "th" ? "th-TH" : "en-US";
}

export function translateMappedLabel(
  mapping: Record<string, string>,
  value: string | null | undefined,
  fallback: string
) {
  if (!value) return fallback;
  const direct = mapping[value];
  if (direct) return direct;
  const lower = mapping[value.toLowerCase()];
  if (lower) return lower;
  return value;
}
