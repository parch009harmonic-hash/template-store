import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type PublicSchema = Database["public"];

export type PublicTableName = keyof PublicSchema["Tables"];

export type TableRow<T extends PublicTableName> = PublicSchema["Tables"][T]["Row"];
export type TableInsert<T extends PublicTableName> = PublicSchema["Tables"][T]["Insert"];
export type TableUpdate<T extends PublicTableName> = PublicSchema["Tables"][T]["Update"];

export type AppSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;
