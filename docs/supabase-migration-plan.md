# Supabase Migration Plan (Production-Ready)

This plan splits schema rollout into 7 readable migrations for safe production use.

## 1) Create Tables
- Create all business tables with UUID primary keys and standard timestamps.
- Keep the first step focused on table shape only for easier rollback/debug.
- Include `deleted_at` for soft-delete compatible APIs.

## 2) Foreign Keys and Constraints
- Add referential integrity after all tables exist.
- Add business checks (`price >= 0`, date ranges, positive limits).
- Separate this from table creation so constraint issues are isolated quickly.

## 3) Indexes
- Add read/query indexes and partial unique indexes for active rows.
- Optimize common filters: `restaurant_id`, `profile_id`, `status`, `created_at`.
- Keep index migration isolated because index tuning often changes independently.

## 4) Helper Functions for RLS
- Add reusable policy helpers (`is_restaurant_staff`, `is_restaurant_admin`, `can_view_restaurant`).
- Use `security definer` and controlled `search_path` for stable policy behavior.
- Include `handle_new_auth_user` to auto-create `profiles` on first auth user creation.

## 5) Enable Row Level Security
- Enable RLS table-by-table in a dedicated migration for clear verification.
- This keeps activation explicit before policy rollout.

## 6) Create Policies
- Create least-privilege policies for `customer`, `staff`, `admin`.
- Enforce multi-restaurant boundaries using helper functions.
- Make policy names explicit and feature-scoped for maintainability.

## 7) Updated At Triggers
- Install shared `set_updated_at()` trigger function.
- Attach triggers to all mutable tables with `updated_at`.
- Keep triggers isolated from policy logic for safer operational changes.

## Notes
- Files are written idempotently where practical (`if not exists`, guarded constraints/policies).
- Migrations target Supabase PostgreSQL in production pattern (App Router + Supabase Auth + RLS).
