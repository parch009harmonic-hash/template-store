/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type PublicTables = Database["public"]["Tables"];
export type TableName = keyof PublicTables;
export type TableRow<T extends TableName> = PublicTables[T]["Row"];
export type TableInsert<T extends TableName> = PublicTables[T]["Insert"];
export type TableUpdate<T extends TableName> = PublicTables[T]["Update"];

export interface ListOptions {
  limit?: number;
  offset?: number;
}

export class BaseEntityRepository<T extends TableName> {
  constructor(protected readonly tableName: T) {}

  protected async supabase() {
    return createServerSupabaseClient();
  }

  protected throwIfError(error: { message: string } | null, context: string) {
    if (!error) return;
    throw new Error(`[${String(this.tableName)}] ${context}: ${error.message}`);
  }

  async findById(id: string) {
    const supabase = await this.supabase();
    const table = supabase.from(this.tableName as string) as any;
    const { data, error } = await table.select("*").eq("id", id).maybeSingle();
    this.throwIfError(error, "findById");
    return (data ?? null) as TableRow<T> | null;
  }

  async list({ limit = 20, offset = 0 }: ListOptions = {}) {
    const supabase = await this.supabase();
    const to = Math.max(offset + limit - 1, 0);

    const table = supabase.from(this.tableName as string) as any;
    const { data, error } = await table
      .select("*")
      .range(offset, to)
      .order("created_at", { ascending: false });
    this.throwIfError(error, "list");
    return ((data ?? []) as unknown) as TableRow<T>[];
  }

  async insert(payload: TableInsert<T>) {
    const supabase = await this.supabase();
    const table = supabase.from(this.tableName as string) as any;
    const { data, error } = await table.insert(payload).select("*").single();
    this.throwIfError(error, "insert");
    return data as TableRow<T>;
  }

  async update(id: string, payload: TableUpdate<T>) {
    const supabase = await this.supabase();
    const table = supabase.from(this.tableName as string) as any;
    const { data, error } = await table.update(payload).eq("id", id).select("*").single();
    this.throwIfError(error, "update");
    return data as TableRow<T>;
  }
}
