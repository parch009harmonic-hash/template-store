function readRequiredEnv(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getPublicEnv() {
  const supabaseUrl = readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = readRequiredEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return {
    supabaseUrl,
    supabaseAnonKey,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
  };
}

export function getServiceRoleEnv() {
  const serviceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);

  return { serviceRoleKey };
}

export function getWebPushEnv() {
  const vapidPrivateKey = readRequiredEnv("VAPID_PRIVATE_KEY", process.env.VAPID_PRIVATE_KEY);
  const vapidSubject = readRequiredEnv("VAPID_SUBJECT", process.env.VAPID_SUBJECT);

  return {
    vapidPrivateKey,
    vapidSubject
  };
}

export function getServerEnv() {
  return {
    ...getServiceRoleEnv(),
    ...getWebPushEnv()
  };
}
