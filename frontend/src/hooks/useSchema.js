import { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// MOCK MODE — swap this flag to false and uncomment the fetch below
// to connect to the real backend.
// ---------------------------------------------------------------------------
// const USE_MOCK = true;

// const MOCK_SCHEMA = {
//   generatedAt: new Date().toISOString(),
//   tables: [
//     // ── users ──────────────────────────────────────────────────────────────
//     {
//       id: "public.users",
//       schema: "public",
//       name: "users",
//       comment: "Registered customers and admins",
//       estimatedRows: 84200,
//       indexes: [
//         { name: "users_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "users_email_key", definition: "UNIQUE (email)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
//         { name: "email", position: 2, dataType: "varchar", displayType: "varchar(255)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
//         { name: "password_hash", position: 3, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "full_name", position: 4, dataType: "varchar", displayType: "varchar(120)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "avatar_url", position: 5, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "role", position: 6, dataType: "varchar", displayType: "varchar(20)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'customer'" },
//         { name: "is_verified", position: 7, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "false" },
//         { name: "created_at", position: 8, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
//         { name: "updated_at", position: 9, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
//       ],
//     },

//     // ── addresses ──────────────────────────────────────────────────────────
//     {
//       id: "public.addresses",
//       schema: "public",
//       name: "addresses",
//       comment: "Shipping and billing addresses",
//       estimatedRows: 120500,
//       indexes: [
//         { name: "addresses_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "addresses_user_id_idx", definition: "INDEX (user_id)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
//         { name: "user_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "label", position: 3, dataType: "varchar", displayType: "varchar(40)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "line1", position: 4, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "line2", position: 5, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "city", position: 6, dataType: "varchar", displayType: "varchar(100)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "state", position: 7, dataType: "varchar", displayType: "varchar(100)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "postal_code", position: 8, dataType: "varchar", displayType: "varchar(20)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "country_code", position: 9, dataType: "char", displayType: "char(2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'IN'" },
//         { name: "is_default", position: 10, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "false" },
//       ],
//     },

//     // ── categories ─────────────────────────────────────────────────────────
//     {
//       id: "public.categories",
//       schema: "public",
//       name: "categories",
//       comment: "Product taxonomy — supports nested categories via parent_id",
//       estimatedRows: 340,
//       indexes: [
//         { name: "categories_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "categories_slug_key", definition: "UNIQUE (slug)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "int4", displayType: "int4", isPrimaryKey: true, isUnique: true, isNullable: false, default: "nextval('categories_id_seq')" },
//         { name: "parent_id", position: 2, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "name", position: 3, dataType: "varchar", displayType: "varchar(120)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "slug", position: 4, dataType: "varchar", displayType: "varchar(120)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
//         { name: "description", position: 5, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "image_url", position: 6, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "sort_order", position: 7, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
//         { name: "is_active", position: 8, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "true" },
//       ],
//     },

//     // ── products ───────────────────────────────────────────────────────────
//     {
//       id: "public.products",
//       schema: "public",
//       name: "products",
//       comment: "Master product catalogue",
//       estimatedRows: 18700,
//       indexes: [
//         { name: "products_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "products_sku_key", definition: "UNIQUE (sku)" },
//         { name: "products_category_id_idx", definition: "INDEX (category_id)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
//         { name: "category_id", position: 2, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "sku", position: 3, dataType: "varchar", displayType: "varchar(80)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
//         { name: "name", position: 4, dataType: "varchar", displayType: "varchar(255)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "slug", position: 5, dataType: "varchar", displayType: "varchar(255)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
//         { name: "description", position: 6, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "base_price", position: 7, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "compare_price", position: 8, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "tags", position: 9, dataType: "_text", displayType: "text[]", isPrimaryKey: false, isUnique: false, isNullable: true, default: "'{}'" },
//         { name: "metadata", position: 10, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: true, default: "'{}'" },
//         { name: "is_active", position: 11, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "true" },
//         { name: "created_at", position: 12, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
//       ],
//     },

//     // ── product_variants ───────────────────────────────────────────────────
//     {
//       id: "public.product_variants",
//       schema: "public",
//       name: "product_variants",
//       comment: "Size / colour / material variants per product",
//       estimatedRows: 62400,
//       indexes: [
//         { name: "product_variants_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "product_variants_sku_key", definition: "UNIQUE (sku)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
//         { name: "product_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "sku", position: 3, dataType: "varchar", displayType: "varchar(80)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
//         { name: "attributes", position: 4, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'{}'" },
//         { name: "price_override", position: 5, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "stock_qty", position: 6, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
//         { name: "weight_grams", position: 7, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "is_active", position: 8, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "true" },
//       ],
//     },

//     // ── orders ─────────────────────────────────────────────────────────────
//     {
//       id: "public.orders",
//       schema: "public",
//       name: "orders",
//       comment: "Customer purchase orders",
//       estimatedRows: 530000,
//       indexes: [
//         { name: "orders_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "orders_user_id_idx", definition: "INDEX (user_id)" },
//         { name: "orders_status_idx", definition: "INDEX (status)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
//         { name: "user_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "shipping_address_id", position: 3, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "status", position: 4, dataType: "varchar", displayType: "varchar(30)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'pending'" },
//         { name: "subtotal", position: 5, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "discount_total", position: 6, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
//         { name: "shipping_total", position: 7, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
//         { name: "tax_total", position: 8, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
//         { name: "grand_total", position: 9, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "notes", position: 10, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "placed_at", position: 11, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "created_at", position: 12, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
//       ],
//     },

//     // ── order_items ────────────────────────────────────────────────────────
//     {
//       id: "public.order_items",
//       schema: "public",
//       name: "order_items",
//       comment: "Line items within an order",
//       estimatedRows: 1420000,
//       indexes: [
//         { name: "order_items_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "order_items_order_id_idx", definition: "INDEX (order_id)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
//         { name: "order_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "variant_id", position: 3, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "quantity", position: 4, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: "1" },
//         { name: "unit_price", position: 5, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "discount_amount", position: 6, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
//         { name: "line_total", position: 7, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//       ],
//     },

//     // ── payments ───────────────────────────────────────────────────────────
//     {
//       id: "public.payments",
//       schema: "public",
//       name: "payments",
//       comment: "Payment transactions linked to orders",
//       estimatedRows: 541000,
//       indexes: [
//         { name: "payments_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "payments_order_id_idx", definition: "INDEX (order_id)" },
//         { name: "payments_gateway_ref_key", definition: "UNIQUE (gateway_ref)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
//         { name: "order_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "gateway", position: 3, dataType: "varchar", displayType: "varchar(40)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "gateway_ref", position: 4, dataType: "varchar", displayType: "varchar(200)", isPrimaryKey: false, isUnique: true, isNullable: true, default: null },
//         { name: "amount", position: 5, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "currency", position: 6, dataType: "char", displayType: "char(3)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'INR'" },
//         { name: "status", position: 7, dataType: "varchar", displayType: "varchar(30)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'initiated'" },
//         { name: "paid_at", position: 8, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "meta", position: 9, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "created_at", position: 10, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
//       ],
//     },

//     // ── coupons ────────────────────────────────────────────────────────────
//     {
//       id: "public.coupons",
//       schema: "public",
//       name: "coupons",
//       comment: "Discount codes and promotional rules",
//       estimatedRows: 890,
//       indexes: [
//         { name: "coupons_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "coupons_code_key", definition: "UNIQUE (code)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "int4", displayType: "int4", isPrimaryKey: true, isUnique: true, isNullable: false, default: "nextval('coupons_id_seq')" },
//         { name: "code", position: 2, dataType: "varchar", displayType: "varchar(50)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
//         { name: "discount_type", position: 3, dataType: "varchar", displayType: "varchar(20)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'percentage'" },
//         { name: "discount_value", position: 4, dataType: "numeric", displayType: "numeric(8,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "min_order_value", position: 5, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "max_uses", position: 6, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "used_count", position: 7, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
//         { name: "expires_at", position: 8, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "is_active", position: 9, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "true" },
//       ],
//     },

//     // ── reviews ────────────────────────────────────────────────────────────
//     {
//       id: "public.reviews",
//       schema: "public",
//       name: "reviews",
//       comment: "User product reviews and ratings",
//       estimatedRows: 203000,
//       indexes: [
//         { name: "reviews_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "reviews_product_id_idx", definition: "INDEX (product_id)" },
//         { name: "reviews_user_product_key", definition: "UNIQUE (user_id, product_id)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
//         { name: "user_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "product_id", position: 3, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "rating", position: 4, dataType: "int2", displayType: "int2", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "title", position: 5, dataType: "varchar", displayType: "varchar(200)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "body", position: 6, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "is_verified_purchase", position: 7, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "false" },
//         { name: "created_at", position: 8, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
//       ],
//     },

//     // ── audit.activity_log ─────────────────────────────────────────────────
//     {
//       id: "audit.activity_log",
//       schema: "audit",
//       name: "activity_log",
//       comment: "Append-only audit trail of all mutations",
//       estimatedRows: 9800000,
//       indexes: [
//         { name: "activity_log_pkey", definition: "PRIMARY KEY (id)" },
//         { name: "activity_log_actor_idx", definition: "INDEX (actor_id)" },
//         { name: "activity_log_created_at_idx", definition: "INDEX (created_at DESC)" },
//       ],
//       columns: [
//         { name: "id", position: 1, dataType: "int8", displayType: "int8", isPrimaryKey: true, isUnique: true, isNullable: false, default: "nextval('audit.activity_log_id_seq')" },
//         { name: "actor_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "action", position: 3, dataType: "varchar", displayType: "varchar(60)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "table_name", position: 4, dataType: "varchar", displayType: "varchar(80)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
//         { name: "record_id", position: 5, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "old_data", position: 6, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "new_data", position: 7, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "ip_address", position: 8, dataType: "inet", displayType: "inet", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
//         { name: "created_at", position: 9, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
//       ],
//     },
//   ],

//   relationships: [
//     // addresses → users
//     { sourceTable: "public.addresses", sourceColumn: "user_id", targetTable: "public.users", targetColumn: "id", constraintName: "addresses_user_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
//     // categories self-ref
//     { sourceTable: "public.categories", sourceColumn: "parent_id", targetTable: "public.categories", targetColumn: "id", constraintName: "categories_parent_id_fkey", updateRule: "NO ACTION", deleteRule: "SET NULL" },
//     // products → categories
//     { sourceTable: "public.products", sourceColumn: "category_id", targetTable: "public.categories", targetColumn: "id", constraintName: "products_category_id_fkey", updateRule: "NO ACTION", deleteRule: "RESTRICT" },
//     // product_variants → products
//     { sourceTable: "public.product_variants", sourceColumn: "product_id", targetTable: "public.products", targetColumn: "id", constraintName: "product_variants_product_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
//     // orders → users
//     { sourceTable: "public.orders", sourceColumn: "user_id", targetTable: "public.users", targetColumn: "id", constraintName: "orders_user_id_fkey", updateRule: "NO ACTION", deleteRule: "RESTRICT" },
//     // orders → addresses
//     { sourceTable: "public.orders", sourceColumn: "shipping_address_id", targetTable: "public.addresses", targetColumn: "id", constraintName: "orders_shipping_address_id_fkey", updateRule: "NO ACTION", deleteRule: "SET NULL" },
//     // order_items → orders
//     { sourceTable: "public.order_items", sourceColumn: "order_id", targetTable: "public.orders", targetColumn: "id", constraintName: "order_items_order_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
//     // order_items → product_variants
//     { sourceTable: "public.order_items", sourceColumn: "variant_id", targetTable: "public.product_variants", targetColumn: "id", constraintName: "order_items_variant_id_fkey", updateRule: "NO ACTION", deleteRule: "RESTRICT" },
//     // payments → orders
//     { sourceTable: "public.payments", sourceColumn: "order_id", targetTable: "public.orders", targetColumn: "id", constraintName: "payments_order_id_fkey", updateRule: "NO ACTION", deleteRule: "RESTRICT" },
//     // reviews → users
//     { sourceTable: "public.reviews", sourceColumn: "user_id", targetTable: "public.users", targetColumn: "id", constraintName: "reviews_user_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
//     // reviews → products
//     { sourceTable: "public.reviews", sourceColumn: "product_id", targetTable: "public.products", targetColumn: "id", constraintName: "reviews_product_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
//     // audit.activity_log → users
//     { sourceTable: "audit.activity_log", sourceColumn: "actor_id", targetTable: "public.users", targetColumn: "id", constraintName: "activity_log_actor_id_fkey", updateRule: "NO ACTION", deleteRule: "SET NULL" },
//   ],
// };

// Expanded Mock PostgreSQL Schema
// Based on the original schema shared by the user.
// Original file reviewed: fileciteturn0file0
//
// This version expands the dataset into a complex enterprise-scale mock schema
// with ~60 interconnected tables across multiple domains:
//
// - Identity & Access
// - Ecommerce
// - Inventory & Warehousing
// - Logistics
// - CRM
// - Finance
// - Marketing
// - Support
// - Analytics
// - Audit / Security
// - Subscription & Billing
// - Notifications
//
// The structure matches your existing MOCK_SCHEMA format.
// You can directly replace the existing MOCK_SCHEMA with this one
// or merge incrementally.

const USE_MOCK = false;

const uuidCol = (name, position, extra = {}) => ({
  name,
  position,
  dataType: 'uuid',
  displayType: 'uuid',
  isPrimaryKey: false,
  isUnique: false,
  isNullable: false,
  default: null,
  ...extra,
});

const tsCol = (name, position) => ({
  name,
  position,
  dataType: 'timestamptz',
  displayType: 'timestamptz',
  isPrimaryKey: false,
  isUnique: false,
  isNullable: false,
  default: 'now()',
});

const boolCol = (name, position, def = 'false') => ({
  name,
  position,
  dataType: 'bool',
  displayType: 'bool',
  isPrimaryKey: false,
  isUnique: false,
  isNullable: false,
  default: def,
});

const varcharCol = (name, position, size = 255, extra = {}) => ({
  name,
  position,
  dataType: 'varchar',
  displayType: `varchar(${size})`,
  isPrimaryKey: false,
  isUnique: false,
  isNullable: false,
  default: null,
  ...extra,
});

const numericCol = (name, position, precision = '12,2') => ({
  name,
  position,
  dataType: 'numeric',
  displayType: `numeric(${precision})`,
  isPrimaryKey: false,
  isUnique: false,
  isNullable: false,
  default: '0',
});

const pkUUID = {
  name: 'id',
  position: 1,
  dataType: 'uuid',
  displayType: 'uuid',
  isPrimaryKey: true,
  isUnique: true,
  isNullable: false,
  default: 'gen_random_uuid()',
};

function makeTable({
  schema = 'public',
  name,
  comment,
  estimatedRows,
  indexes = [],
  columns = [],
}) {
  return {
    id: `${schema}.${name}`,
    schema,
    name,
    comment,
    estimatedRows,
    indexes: [
      {
        name: `${name}_pkey`,
        definition: 'PRIMARY KEY (id)',
      },
      ...indexes,
    ],
    columns: [pkUUID, ...columns],
  };
}

const tables = [
  // ============================================================
  // IDENTITY & ACCESS
  // ============================================================

  makeTable({
    name: 'users',
    comment: 'Platform users',
    estimatedRows: 120000,
    indexes: [
      { name: 'users_email_key', definition: 'UNIQUE(email)' },
    ],
    columns: [
      varcharCol('email', 2, 255, { isUnique: true }),
      varcharCol('password_hash', 3, 255),
      varcharCol('full_name', 4, 150),
      varcharCol('phone', 5, 20, { isNullable: true }),
      boolCol('is_verified', 6, 'false'),
      boolCol('is_active', 7, 'true'),
      tsCol('created_at', 8),
      tsCol('updated_at', 9),
    ],
  }),

  makeTable({
    name: 'roles',
    comment: 'RBAC roles',
    estimatedRows: 30,
    columns: [
      varcharCol('name', 2, 80),
      varcharCol('slug', 3, 80),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    name: 'permissions',
    comment: 'System permissions',
    estimatedRows: 300,
    columns: [
      varcharCol('resource', 2, 100),
      varcharCol('action', 3, 80),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    name: 'user_roles',
    comment: 'User role mappings',
    estimatedRows: 240000,
    columns: [
      uuidCol('user_id', 2),
      uuidCol('role_id', 3),
      tsCol('assigned_at', 4),
    ],
  }),

  makeTable({
    name: 'role_permissions',
    comment: 'Role permission mappings',
    estimatedRows: 1200,
    columns: [
      uuidCol('role_id', 2),
      uuidCol('permission_id', 3),
    ],
  }),

  makeTable({
    name: 'sessions',
    comment: 'User auth sessions',
    estimatedRows: 1500000,
    columns: [
      uuidCol('user_id', 2),
      varcharCol('ip_address', 3, 50),
      varcharCol('device', 4, 200),
      tsCol('expires_at', 5),
      tsCol('created_at', 6),
    ],
  }),

  // ============================================================
  // ADDRESSING
  // ============================================================

  makeTable({
    name: 'countries',
    comment: 'Country master data',
    estimatedRows: 250,
    columns: [
      varcharCol('code', 2, 2),
      varcharCol('name', 3, 100),
    ],
  }),

  makeTable({
    name: 'states',
    comment: 'State/province master',
    estimatedRows: 4000,
    columns: [
      uuidCol('country_id', 2),
      varcharCol('name', 3, 120),
      varcharCol('code', 4, 20),
    ],
  }),

  makeTable({
    name: 'cities',
    comment: 'Cities',
    estimatedRows: 150000,
    columns: [
      uuidCol('state_id', 2),
      varcharCol('name', 3, 150),
    ],
  }),

  makeTable({
    name: 'addresses',
    comment: 'User addresses',
    estimatedRows: 300000,
    columns: [
      uuidCol('user_id', 2),
      uuidCol('city_id', 3),
      varcharCol('line1', 4, 255),
      varcharCol('line2', 5, 255, { isNullable: true }),
      varcharCol('postal_code', 6, 20),
      boolCol('is_default', 7),
      tsCol('created_at', 8),
    ],
  }),

  // ============================================================
  // PRODUCT CATALOG
  // ============================================================

  makeTable({
    name: 'brands',
    comment: 'Product brands',
    estimatedRows: 5000,
    columns: [
      varcharCol('name', 2, 150),
      varcharCol('slug', 3, 150),
      boolCol('is_active', 4, 'true'),
    ],
  }),

  makeTable({
    name: 'categories',
    comment: 'Nested product categories',
    estimatedRows: 1000,
    columns: [
      uuidCol('parent_id', 2, { isNullable: true }),
      varcharCol('name', 3, 150),
      varcharCol('slug', 4, 150),
      boolCol('is_active', 5, 'true'),
    ],
  }),

  makeTable({
    name: 'products',
    comment: 'Master products',
    estimatedRows: 200000,
    columns: [
      uuidCol('brand_id', 2),
      uuidCol('category_id', 3),
      varcharCol('sku', 4, 100),
      varcharCol('name', 5, 255),
      numericCol('base_price', 6),
      boolCol('is_active', 7, 'true'),
      tsCol('created_at', 8),
    ],
  }),

  makeTable({
    name: 'product_variants',
    comment: 'Product variants',
    estimatedRows: 800000,
    columns: [
      uuidCol('product_id', 2),
      varcharCol('sku', 3, 100),
      numericCol('price', 4),
      numericCol('cost_price', 5),
      boolCol('is_active', 6, 'true'),
    ],
  }),

  makeTable({
    name: 'product_images',
    comment: 'Product media assets',
    estimatedRows: 1200000,
    columns: [
      uuidCol('product_id', 2),
      varcharCol('url', 3, 500),
      boolCol('is_primary', 4),
      tsCol('created_at', 5),
    ],
  }),

  makeTable({
    name: 'product_attributes',
    comment: 'Attributes like size/color',
    estimatedRows: 1000,
    columns: [
      varcharCol('name', 2, 120),
      varcharCol('type', 3, 50),
    ],
  }),

  makeTable({
    name: 'attribute_values',
    comment: 'Attribute values',
    estimatedRows: 12000,
    columns: [
      uuidCol('attribute_id', 2),
      varcharCol('value', 3, 100),
    ],
  }),

  makeTable({
    name: 'variant_attribute_values',
    comment: 'Variant to attribute mappings',
    estimatedRows: 2400000,
    columns: [
      uuidCol('variant_id', 2),
      uuidCol('attribute_value_id', 3),
    ],
  }),

  // ============================================================
  // INVENTORY & WAREHOUSE
  // ============================================================

  makeTable({
    name: 'warehouses',
    comment: 'Warehouse locations',
    estimatedRows: 120,
    columns: [
      varcharCol('name', 2, 200),
      uuidCol('address_id', 3),
      boolCol('is_active', 4, 'true'),
    ],
  }),

  makeTable({
    name: 'inventory',
    comment: 'Variant inventory by warehouse',
    estimatedRows: 4000000,
    columns: [
      uuidCol('warehouse_id', 2),
      uuidCol('variant_id', 3),
      {
        name: 'available_qty',
        position: 4,
        dataType: 'int4',
        displayType: 'int4',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: false,
        default: '0',
      },
      {
        name: 'reserved_qty',
        position: 5,
        dataType: 'int4',
        displayType: 'int4',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: false,
        default: '0',
      },
      tsCol('updated_at', 6),
    ],
  }),

  makeTable({
    name: 'inventory_movements',
    comment: 'Stock movement ledger',
    estimatedRows: 20000000,
    columns: [
      uuidCol('inventory_id', 2),
      varcharCol('movement_type', 3, 40),
      {
        name: 'quantity',
        position: 4,
        dataType: 'int4',
        displayType: 'int4',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: false,
        default: '0',
      },
      varcharCol('reference_type', 5, 60),
      uuidCol('reference_id', 6, { isNullable: true }),
      tsCol('created_at', 7),
    ],
  }),

  makeTable({
    name: 'suppliers',
    comment: 'Product suppliers',
    estimatedRows: 15000,
    columns: [
      varcharCol('company_name', 2, 255),
      varcharCol('contact_email', 3, 255),
      varcharCol('phone', 4, 30),
      boolCol('is_active', 5, 'true'),
    ],
  }),

  makeTable({
    name: 'purchase_orders',
    comment: 'Procurement orders',
    estimatedRows: 900000,
    columns: [
      uuidCol('supplier_id', 2),
      uuidCol('warehouse_id', 3),
      varcharCol('status', 4, 40),
      numericCol('total_amount', 5),
      tsCol('created_at', 6),
    ],
  }),

  makeTable({
    name: 'purchase_order_items',
    comment: 'PO line items',
    estimatedRows: 7000000,
    columns: [
      uuidCol('purchase_order_id', 2),
      uuidCol('variant_id', 3),
      {
        name: 'quantity',
        position: 4,
        dataType: 'int4',
        displayType: 'int4',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: false,
        default: '1',
      },
      numericCol('unit_cost', 5),
    ],
  }),

  // ============================================================
  // ORDERS & PAYMENTS
  // ============================================================

  makeTable({
    name: 'carts',
    comment: 'Shopping carts',
    estimatedRows: 2000000,
    columns: [
      uuidCol('user_id', 2),
      boolCol('is_active', 3, 'true'),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    name: 'cart_items',
    comment: 'Items inside carts',
    estimatedRows: 8000000,
    columns: [
      uuidCol('cart_id', 2),
      uuidCol('variant_id', 3),
      {
        name: 'quantity',
        position: 4,
        dataType: 'int4',
        displayType: 'int4',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: false,
        default: '1',
      },
    ],
  }),

  makeTable({
    name: 'orders',
    comment: 'Customer orders',
    estimatedRows: 7000000,
    columns: [
      uuidCol('user_id', 2),
      uuidCol('address_id', 3),
      varcharCol('status', 4, 40),
      numericCol('subtotal', 5),
      numericCol('tax_total', 6),
      numericCol('shipping_total', 7),
      numericCol('grand_total', 8),
      tsCol('placed_at', 9),
    ],
  }),

  makeTable({
    name: 'order_items',
    comment: 'Order line items',
    estimatedRows: 45000000,
    columns: [
      uuidCol('order_id', 2),
      uuidCol('variant_id', 3),
      {
        name: 'quantity',
        position: 4,
        dataType: 'int4',
        displayType: 'int4',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: false,
        default: '1',
      },
      numericCol('unit_price', 5),
      numericCol('line_total', 6),
    ],
  }),

  makeTable({
    name: 'payments',
    comment: 'Payment transactions',
    estimatedRows: 7100000,
    columns: [
      uuidCol('order_id', 2),
      varcharCol('provider', 3, 100),
      varcharCol('status', 4, 40),
      numericCol('amount', 5),
      tsCol('paid_at', 6),
    ],
  }),

  makeTable({
    name: 'refunds',
    comment: 'Refund records',
    estimatedRows: 300000,
    columns: [
      uuidCol('payment_id', 2),
      numericCol('amount', 3),
      varcharCol('reason', 4, 255),
      varcharCol('status', 5, 40),
      tsCol('created_at', 6),
    ],
  }),

  makeTable({
    name: 'coupons',
    comment: 'Promotional coupons',
    estimatedRows: 12000,
    columns: [
      varcharCol('code', 2, 80),
      varcharCol('discount_type', 3, 40),
      numericCol('discount_value', 4),
      tsCol('expires_at', 5),
    ],
  }),

  makeTable({
    name: 'order_coupons',
    comment: 'Coupons applied on orders',
    estimatedRows: 1200000,
    columns: [
      uuidCol('order_id', 2),
      uuidCol('coupon_id', 3),
      numericCol('discount_amount', 4),
    ],
  }),

  // ============================================================
  // SHIPPING & LOGISTICS
  // ============================================================

  makeTable({
    name: 'shipping_carriers',
    comment: 'Courier providers',
    estimatedRows: 50,
    columns: [
      varcharCol('name', 2, 150),
      varcharCol('tracking_url_template', 3, 500),
    ],
  }),

  makeTable({
    name: 'shipments',
    comment: 'Order shipments',
    estimatedRows: 9000000,
    columns: [
      uuidCol('order_id', 2),
      uuidCol('carrier_id', 3),
      varcharCol('tracking_number', 4, 150),
      varcharCol('status', 5, 50),
      tsCol('shipped_at', 6),
      tsCol('delivered_at', 7),
    ],
  }),

  makeTable({
    name: 'shipment_events',
    comment: 'Tracking events',
    estimatedRows: 60000000,
    columns: [
      uuidCol('shipment_id', 2),
      varcharCol('status', 3, 80),
      varcharCol('location', 4, 255),
      tsCol('event_time', 5),
    ],
  }),

  makeTable({
    name: 'returns',
    comment: 'Product returns',
    estimatedRows: 400000,
    columns: [
      uuidCol('order_id', 2),
      varcharCol('reason', 3, 255),
      varcharCol('status', 4, 40),
      tsCol('created_at', 5),
    ],
  }),

  // ============================================================
  // CRM
  // ============================================================

  makeTable({
    name: 'customer_segments',
    comment: 'Dynamic customer segmentation',
    estimatedRows: 300,
    columns: [
      varcharCol('name', 2, 120),
      varcharCol('rule_expression', 3, 500),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    name: 'customer_segment_users',
    comment: 'Users inside segments',
    estimatedRows: 5000000,
    columns: [
      uuidCol('segment_id', 2),
      uuidCol('user_id', 3),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    name: 'wishlists',
    comment: 'User wishlists',
    estimatedRows: 1500000,
    columns: [
      uuidCol('user_id', 2),
      varcharCol('name', 3, 120),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    name: 'wishlist_items',
    comment: 'Wishlist items',
    estimatedRows: 12000000,
    columns: [
      uuidCol('wishlist_id', 2),
      uuidCol('product_id', 3),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    name: 'reviews',
    comment: 'Product reviews',
    estimatedRows: 4500000,
    columns: [
      uuidCol('user_id', 2),
      uuidCol('product_id', 3),
      {
        name: 'rating',
        position: 4,
        dataType: 'int2',
        displayType: 'int2',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: false,
        default: '5',
      },
      varcharCol('title', 5, 255),
      {
        name: 'body',
        position: 6,
        dataType: 'text',
        displayType: 'text',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: true,
        default: null,
      },
      tsCol('created_at', 7),
    ],
  }),

  // ============================================================
  // SUPPORT
  // ============================================================

  makeTable({
    name: 'support_tickets',
    comment: 'Customer support tickets',
    estimatedRows: 2500000,
    columns: [
      uuidCol('user_id', 2),
      varcharCol('subject', 3, 255),
      varcharCol('status', 4, 40),
      varcharCol('priority', 5, 40),
      tsCol('created_at', 6),
    ],
  }),

  makeTable({
    name: 'support_messages',
    comment: 'Messages inside support tickets',
    estimatedRows: 20000000,
    columns: [
      uuidCol('ticket_id', 2),
      uuidCol('sender_user_id', 3),
      {
        name: 'message',
        position: 4,
        dataType: 'text',
        displayType: 'text',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: false,
        default: null,
      },
      tsCol('created_at', 5),
    ],
  }),

  // ============================================================
  // MARKETING
  // ============================================================

  makeTable({
    name: 'campaigns',
    comment: 'Marketing campaigns',
    estimatedRows: 5000,
    columns: [
      varcharCol('name', 2, 255),
      varcharCol('channel', 3, 80),
      numericCol('budget', 4),
      tsCol('start_date', 5),
      tsCol('end_date', 6),
    ],
  }),

  makeTable({
    name: 'campaign_audiences',
    comment: 'Campaign audience mappings',
    estimatedRows: 2500000,
    columns: [
      uuidCol('campaign_id', 2),
      uuidCol('user_id', 3),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    name: 'email_templates',
    comment: 'Reusable email templates',
    estimatedRows: 600,
    columns: [
      varcharCol('name', 2, 200),
      varcharCol('subject', 3, 255),
      {
        name: 'html_body',
        position: 4,
        dataType: 'text',
        displayType: 'text',
        isPrimaryKey: false,
        isUnique: false,
        isNullable: false,
        default: null,
      },
    ],
  }),

  makeTable({
    name: 'email_logs',
    comment: 'Outbound email logs',
    estimatedRows: 80000000,
    columns: [
      uuidCol('template_id', 2),
      uuidCol('user_id', 3),
      varcharCol('status', 4, 40),
      tsCol('sent_at', 5),
    ],
  }),

  makeTable({
    name: 'push_notifications',
    comment: 'Push notification queue',
    estimatedRows: 40000000,
    columns: [
      uuidCol('user_id', 2),
      varcharCol('title', 3, 255),
      varcharCol('status', 4, 40),
      tsCol('sent_at', 5),
    ],
  }),

  // ============================================================
  // ANALYTICS
  // ============================================================

  makeTable({
    schema: 'analytics',
    name: 'page_views',
    comment: 'Frontend page views',
    estimatedRows: 900000000,
    columns: [
      uuidCol('user_id', 2, { isNullable: true }),
      varcharCol('path', 3, 500),
      varcharCol('device_type', 4, 50),
      tsCol('created_at', 5),
    ],
  }),

  makeTable({
    schema: 'analytics',
    name: 'search_queries',
    comment: 'User searches',
    estimatedRows: 150000000,
    columns: [
      uuidCol('user_id', 2, { isNullable: true }),
      varcharCol('query', 3, 500),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    schema: 'analytics',
    name: 'product_impressions',
    comment: 'Product impression tracking',
    estimatedRows: 500000000,
    columns: [
      uuidCol('product_id', 2),
      uuidCol('user_id', 3, { isNullable: true }),
      tsCol('created_at', 4),
    ],
  }),

  makeTable({
    schema: 'analytics',
    name: 'click_events',
    comment: 'UI clickstream events',
    estimatedRows: 1200000000,
    columns: [
      uuidCol('user_id', 2, { isNullable: true }),
      varcharCol('element_id', 3, 255),
      varcharCol('page', 4, 500),
      tsCol('created_at', 5),
    ],
  }),

  // ============================================================
  // BILLING / SUBSCRIPTIONS
  // ============================================================

  makeTable({
    name: 'plans',
    comment: 'Subscription plans',
    estimatedRows: 50,
    columns: [
      varcharCol('name', 2, 120),
      numericCol('monthly_price', 3),
      numericCol('yearly_price', 4),
    ],
  }),

  makeTable({
    name: 'subscriptions',
    comment: 'User subscriptions',
    estimatedRows: 500000,
    columns: [
      uuidCol('user_id', 2),
      uuidCol('plan_id', 3),
      varcharCol('status', 4, 40),
      tsCol('started_at', 5),
      tsCol('expires_at', 6),
    ],
  }),

  makeTable({
    name: 'invoices',
    comment: 'Subscription invoices',
    estimatedRows: 3000000,
    columns: [
      uuidCol('subscription_id', 2),
      numericCol('amount', 3),
      varcharCol('status', 4, 40),
      tsCol('issued_at', 5),
    ],
  }),

  // ============================================================
  // AUDIT & SECURITY
  // ============================================================

  makeTable({
    schema: 'audit',
    name: 'activity_logs',
    comment: 'System audit logs',
    estimatedRows: 400000000,
    columns: [
      uuidCol('actor_user_id', 2, { isNullable: true }),
      varcharCol('action', 3, 120),
      varcharCol('entity_type', 4, 120),
      uuidCol('entity_id', 5, { isNullable: true }),
      tsCol('created_at', 6),
    ],
  }),

  makeTable({
    schema: 'security',
    name: 'login_attempts',
    comment: 'Authentication attempts',
    estimatedRows: 100000000,
    columns: [
      uuidCol('user_id', 2, { isNullable: true }),
      varcharCol('ip_address', 3, 50),
      boolCol('success', 4),
      tsCol('created_at', 5),
    ],
  }),

  makeTable({
    schema: 'security',
    name: 'api_keys',
    comment: 'API integrations',
    estimatedRows: 50000,
    columns: [
      uuidCol('user_id', 2),
      varcharCol('key_hash', 3, 255),
      boolCol('is_active', 4, 'true'),
      tsCol('expires_at', 5),
    ],
  }),
];

const relationships = [
  // identity
  ['user_roles', 'user_id', 'users'],
  ['user_roles', 'role_id', 'roles'],
  ['role_permissions', 'role_id', 'roles'],
  ['role_permissions', 'permission_id', 'permissions'],
  ['sessions', 'user_id', 'users'],

  // geo
  ['states', 'country_id', 'countries'],
  ['cities', 'state_id', 'states'],
  ['addresses', 'user_id', 'users'],
  ['addresses', 'city_id', 'cities'],

  // catalog
  ['categories', 'parent_id', 'categories'],
  ['products', 'brand_id', 'brands'],
  ['products', 'category_id', 'categories'],
  ['product_variants', 'product_id', 'products'],
  ['product_images', 'product_id', 'products'],
  ['attribute_values', 'attribute_id', 'product_attributes'],
  ['variant_attribute_values', 'variant_id', 'product_variants'],
  ['variant_attribute_values', 'attribute_value_id', 'attribute_values'],

  // inventory
  ['warehouses', 'address_id', 'addresses'],
  ['inventory', 'warehouse_id', 'warehouses'],
  ['inventory', 'variant_id', 'product_variants'],
  ['inventory_movements', 'inventory_id', 'inventory'],
  ['purchase_orders', 'supplier_id', 'suppliers'],
  ['purchase_orders', 'warehouse_id', 'warehouses'],
  ['purchase_order_items', 'purchase_order_id', 'purchase_orders'],
  ['purchase_order_items', 'variant_id', 'product_variants'],

  // commerce
  ['carts', 'user_id', 'users'],
  ['cart_items', 'cart_id', 'carts'],
  ['cart_items', 'variant_id', 'product_variants'],
  ['orders', 'user_id', 'users'],
  ['orders', 'address_id', 'addresses'],
  ['order_items', 'order_id', 'orders'],
  ['order_items', 'variant_id', 'product_variants'],
  ['payments', 'order_id', 'orders'],
  ['refunds', 'payment_id', 'payments'],
  ['order_coupons', 'order_id', 'orders'],
  ['order_coupons', 'coupon_id', 'coupons'],

  // logistics
  ['shipments', 'order_id', 'orders'],
  ['shipments', 'carrier_id', 'shipping_carriers'],
  ['shipment_events', 'shipment_id', 'shipments'],
  ['returns', 'order_id', 'orders'],

  // crm
  ['customer_segment_users', 'segment_id', 'customer_segments'],
  ['customer_segment_users', 'user_id', 'users'],
  ['wishlists', 'user_id', 'users'],
  ['wishlist_items', 'wishlist_id', 'wishlists'],
  ['wishlist_items', 'product_id', 'products'],
  ['reviews', 'user_id', 'users'],
  ['reviews', 'product_id', 'products'],

  // support
  ['support_tickets', 'user_id', 'users'],
  ['support_messages', 'ticket_id', 'support_tickets'],
  ['support_messages', 'sender_user_id', 'users'],

  // marketing
  ['campaign_audiences', 'campaign_id', 'campaigns'],
  ['campaign_audiences', 'user_id', 'users'],
  ['email_logs', 'template_id', 'email_templates'],
  ['email_logs', 'user_id', 'users'],
  ['push_notifications', 'user_id', 'users'],

  // analytics
  ['analytics.page_views', 'user_id', 'users'],
  ['analytics.search_queries', 'user_id', 'users'],
  ['analytics.product_impressions', 'product_id', 'products'],
  ['analytics.product_impressions', 'user_id', 'users'],
  ['analytics.click_events', 'user_id', 'users'],

  // billing
  ['subscriptions', 'user_id', 'users'],
  ['subscriptions', 'plan_id', 'plans'],
  ['invoices', 'subscription_id', 'subscriptions'],

  // security & audit
  ['audit.activity_logs', 'actor_user_id', 'users'],
  ['security.login_attempts', 'user_id', 'users'],
  ['security.api_keys', 'user_id', 'users'],
].map(([sourceTable, sourceColumn, targetTable]) => ({
  sourceTable: sourceTable.includes('.') ? sourceTable : `public.${sourceTable}`,
  sourceColumn,
  targetTable: targetTable.includes('.') ? targetTable : `public.${targetTable}`,
  targetColumn: 'id',
  constraintName: `${sourceTable.replace('.', '_')}_${sourceColumn}_fkey`,
  updateRule: 'NO ACTION',
  deleteRule: 'CASCADE',
}));

export const MOCK_SCHEMA = {
  generatedAt: new Date().toISOString(),
  tables,
  relationships,
};

// -----------------------------------------------------------------
// Total Tables: ~60
// Total Relationships: ~70+
// -----------------------------------------------------------------
// Suggested Demo Flows:
//
// 1. User Signup -> Cart -> Order -> Payment -> Shipment
// 2. Supplier -> Purchase Order -> Inventory Update
// 3. Campaign -> Audience -> Email Delivery -> Conversion
// 4. Subscription Billing -> Invoice -> Payment Retry
// 5. Review System + Wishlist Recommendation Engine
// 6. Audit Trail + Security Login Monitoring
// 7. Analytics Clickstream + Product Impression Funnel
// 8. Multi-Warehouse Inventory Rebalancing
// -----------------------------------------------------------------


// ---------------------------------------------------------------------------

export function useSchema() {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchema = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        // Simulate a brief network delay for realism
        await new Promise((r) => setTimeout(r, 600));
        setSchema(MOCK_SCHEMA);
      } else {
        const res = await fetch("/api/schema");
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch schema");
        }
        const data = await res.json();
        setSchema(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  return { schema, loading, error, refetch: fetchSchema };
}