import { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// MOCK MODE — swap this flag to false and uncomment the fetch below
// to connect to the real backend.
// ---------------------------------------------------------------------------
const USE_MOCK = true;

const MOCK_SCHEMA = {
  generatedAt: new Date().toISOString(),
  tables: [
    // ── users ──────────────────────────────────────────────────────────────
    {
      id: "public.users",
      schema: "public",
      name: "users",
      comment: "Registered customers and admins",
      estimatedRows: 84200,
      indexes: [
        { name: "users_pkey", definition: "PRIMARY KEY (id)" },
        { name: "users_email_key", definition: "UNIQUE (email)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
        { name: "email", position: 2, dataType: "varchar", displayType: "varchar(255)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
        { name: "password_hash", position: 3, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "full_name", position: 4, dataType: "varchar", displayType: "varchar(120)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "avatar_url", position: 5, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "role", position: 6, dataType: "varchar", displayType: "varchar(20)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'customer'" },
        { name: "is_verified", position: 7, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "false" },
        { name: "created_at", position: 8, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
        { name: "updated_at", position: 9, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
      ],
    },

    // ── addresses ──────────────────────────────────────────────────────────
    {
      id: "public.addresses",
      schema: "public",
      name: "addresses",
      comment: "Shipping and billing addresses",
      estimatedRows: 120500,
      indexes: [
        { name: "addresses_pkey", definition: "PRIMARY KEY (id)" },
        { name: "addresses_user_id_idx", definition: "INDEX (user_id)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
        { name: "user_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "label", position: 3, dataType: "varchar", displayType: "varchar(40)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "line1", position: 4, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "line2", position: 5, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "city", position: 6, dataType: "varchar", displayType: "varchar(100)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "state", position: 7, dataType: "varchar", displayType: "varchar(100)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "postal_code", position: 8, dataType: "varchar", displayType: "varchar(20)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "country_code", position: 9, dataType: "char", displayType: "char(2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'IN'" },
        { name: "is_default", position: 10, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "false" },
      ],
    },

    // ── categories ─────────────────────────────────────────────────────────
    {
      id: "public.categories",
      schema: "public",
      name: "categories",
      comment: "Product taxonomy — supports nested categories via parent_id",
      estimatedRows: 340,
      indexes: [
        { name: "categories_pkey", definition: "PRIMARY KEY (id)" },
        { name: "categories_slug_key", definition: "UNIQUE (slug)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "int4", displayType: "int4", isPrimaryKey: true, isUnique: true, isNullable: false, default: "nextval('categories_id_seq')" },
        { name: "parent_id", position: 2, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "name", position: 3, dataType: "varchar", displayType: "varchar(120)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "slug", position: 4, dataType: "varchar", displayType: "varchar(120)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
        { name: "description", position: 5, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "image_url", position: 6, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "sort_order", position: 7, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
        { name: "is_active", position: 8, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "true" },
      ],
    },

    // ── products ───────────────────────────────────────────────────────────
    {
      id: "public.products",
      schema: "public",
      name: "products",
      comment: "Master product catalogue",
      estimatedRows: 18700,
      indexes: [
        { name: "products_pkey", definition: "PRIMARY KEY (id)" },
        { name: "products_sku_key", definition: "UNIQUE (sku)" },
        { name: "products_category_id_idx", definition: "INDEX (category_id)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
        { name: "category_id", position: 2, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "sku", position: 3, dataType: "varchar", displayType: "varchar(80)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
        { name: "name", position: 4, dataType: "varchar", displayType: "varchar(255)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "slug", position: 5, dataType: "varchar", displayType: "varchar(255)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
        { name: "description", position: 6, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "base_price", position: 7, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "compare_price", position: 8, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "tags", position: 9, dataType: "_text", displayType: "text[]", isPrimaryKey: false, isUnique: false, isNullable: true, default: "'{}'" },
        { name: "metadata", position: 10, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: true, default: "'{}'" },
        { name: "is_active", position: 11, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "true" },
        { name: "created_at", position: 12, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
      ],
    },

    // ── product_variants ───────────────────────────────────────────────────
    {
      id: "public.product_variants",
      schema: "public",
      name: "product_variants",
      comment: "Size / colour / material variants per product",
      estimatedRows: 62400,
      indexes: [
        { name: "product_variants_pkey", definition: "PRIMARY KEY (id)" },
        { name: "product_variants_sku_key", definition: "UNIQUE (sku)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
        { name: "product_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "sku", position: 3, dataType: "varchar", displayType: "varchar(80)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
        { name: "attributes", position: 4, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'{}'" },
        { name: "price_override", position: 5, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "stock_qty", position: 6, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
        { name: "weight_grams", position: 7, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "is_active", position: 8, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "true" },
      ],
    },

    // ── orders ─────────────────────────────────────────────────────────────
    {
      id: "public.orders",
      schema: "public",
      name: "orders",
      comment: "Customer purchase orders",
      estimatedRows: 530000,
      indexes: [
        { name: "orders_pkey", definition: "PRIMARY KEY (id)" },
        { name: "orders_user_id_idx", definition: "INDEX (user_id)" },
        { name: "orders_status_idx", definition: "INDEX (status)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
        { name: "user_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "shipping_address_id", position: 3, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "status", position: 4, dataType: "varchar", displayType: "varchar(30)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'pending'" },
        { name: "subtotal", position: 5, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "discount_total", position: 6, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
        { name: "shipping_total", position: 7, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
        { name: "tax_total", position: 8, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
        { name: "grand_total", position: 9, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "notes", position: 10, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "placed_at", position: 11, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "created_at", position: 12, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
      ],
    },

    // ── order_items ────────────────────────────────────────────────────────
    {
      id: "public.order_items",
      schema: "public",
      name: "order_items",
      comment: "Line items within an order",
      estimatedRows: 1420000,
      indexes: [
        { name: "order_items_pkey", definition: "PRIMARY KEY (id)" },
        { name: "order_items_order_id_idx", definition: "INDEX (order_id)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
        { name: "order_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "variant_id", position: 3, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "quantity", position: 4, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: "1" },
        { name: "unit_price", position: 5, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "discount_amount", position: 6, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
        { name: "line_total", position: 7, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
      ],
    },

    // ── payments ───────────────────────────────────────────────────────────
    {
      id: "public.payments",
      schema: "public",
      name: "payments",
      comment: "Payment transactions linked to orders",
      estimatedRows: 541000,
      indexes: [
        { name: "payments_pkey", definition: "PRIMARY KEY (id)" },
        { name: "payments_order_id_idx", definition: "INDEX (order_id)" },
        { name: "payments_gateway_ref_key", definition: "UNIQUE (gateway_ref)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
        { name: "order_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "gateway", position: 3, dataType: "varchar", displayType: "varchar(40)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "gateway_ref", position: 4, dataType: "varchar", displayType: "varchar(200)", isPrimaryKey: false, isUnique: true, isNullable: true, default: null },
        { name: "amount", position: 5, dataType: "numeric", displayType: "numeric(12,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "currency", position: 6, dataType: "char", displayType: "char(3)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'INR'" },
        { name: "status", position: 7, dataType: "varchar", displayType: "varchar(30)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'initiated'" },
        { name: "paid_at", position: 8, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "meta", position: 9, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "created_at", position: 10, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
      ],
    },

    // ── coupons ────────────────────────────────────────────────────────────
    {
      id: "public.coupons",
      schema: "public",
      name: "coupons",
      comment: "Discount codes and promotional rules",
      estimatedRows: 890,
      indexes: [
        { name: "coupons_pkey", definition: "PRIMARY KEY (id)" },
        { name: "coupons_code_key", definition: "UNIQUE (code)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "int4", displayType: "int4", isPrimaryKey: true, isUnique: true, isNullable: false, default: "nextval('coupons_id_seq')" },
        { name: "code", position: 2, dataType: "varchar", displayType: "varchar(50)", isPrimaryKey: false, isUnique: true, isNullable: false, default: null },
        { name: "discount_type", position: 3, dataType: "varchar", displayType: "varchar(20)", isPrimaryKey: false, isUnique: false, isNullable: false, default: "'percentage'" },
        { name: "discount_value", position: 4, dataType: "numeric", displayType: "numeric(8,2)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "min_order_value", position: 5, dataType: "numeric", displayType: "numeric(10,2)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "max_uses", position: 6, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "used_count", position: 7, dataType: "int4", displayType: "int4", isPrimaryKey: false, isUnique: false, isNullable: false, default: "0" },
        { name: "expires_at", position: 8, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "is_active", position: 9, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "true" },
      ],
    },

    // ── reviews ────────────────────────────────────────────────────────────
    {
      id: "public.reviews",
      schema: "public",
      name: "reviews",
      comment: "User product reviews and ratings",
      estimatedRows: 203000,
      indexes: [
        { name: "reviews_pkey", definition: "PRIMARY KEY (id)" },
        { name: "reviews_product_id_idx", definition: "INDEX (product_id)" },
        { name: "reviews_user_product_key", definition: "UNIQUE (user_id, product_id)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "uuid", displayType: "uuid", isPrimaryKey: true, isUnique: true, isNullable: false, default: "gen_random_uuid()" },
        { name: "user_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "product_id", position: 3, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "rating", position: 4, dataType: "int2", displayType: "int2", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "title", position: 5, dataType: "varchar", displayType: "varchar(200)", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "body", position: 6, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "is_verified_purchase", position: 7, dataType: "bool", displayType: "bool", isPrimaryKey: false, isUnique: false, isNullable: false, default: "false" },
        { name: "created_at", position: 8, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
      ],
    },

    // ── audit.activity_log ─────────────────────────────────────────────────
    {
      id: "audit.activity_log",
      schema: "audit",
      name: "activity_log",
      comment: "Append-only audit trail of all mutations",
      estimatedRows: 9800000,
      indexes: [
        { name: "activity_log_pkey", definition: "PRIMARY KEY (id)" },
        { name: "activity_log_actor_idx", definition: "INDEX (actor_id)" },
        { name: "activity_log_created_at_idx", definition: "INDEX (created_at DESC)" },
      ],
      columns: [
        { name: "id", position: 1, dataType: "int8", displayType: "int8", isPrimaryKey: true, isUnique: true, isNullable: false, default: "nextval('audit.activity_log_id_seq')" },
        { name: "actor_id", position: 2, dataType: "uuid", displayType: "uuid", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "action", position: 3, dataType: "varchar", displayType: "varchar(60)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "table_name", position: 4, dataType: "varchar", displayType: "varchar(80)", isPrimaryKey: false, isUnique: false, isNullable: false, default: null },
        { name: "record_id", position: 5, dataType: "text", displayType: "text", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "old_data", position: 6, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "new_data", position: 7, dataType: "jsonb", displayType: "jsonb", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "ip_address", position: 8, dataType: "inet", displayType: "inet", isPrimaryKey: false, isUnique: false, isNullable: true, default: null },
        { name: "created_at", position: 9, dataType: "timestamptz", displayType: "timestamptz", isPrimaryKey: false, isUnique: false, isNullable: false, default: "now()" },
      ],
    },
  ],

  relationships: [
    // addresses → users
    { sourceTable: "public.addresses", sourceColumn: "user_id", targetTable: "public.users", targetColumn: "id", constraintName: "addresses_user_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
    // categories self-ref
    { sourceTable: "public.categories", sourceColumn: "parent_id", targetTable: "public.categories", targetColumn: "id", constraintName: "categories_parent_id_fkey", updateRule: "NO ACTION", deleteRule: "SET NULL" },
    // products → categories
    { sourceTable: "public.products", sourceColumn: "category_id", targetTable: "public.categories", targetColumn: "id", constraintName: "products_category_id_fkey", updateRule: "NO ACTION", deleteRule: "RESTRICT" },
    // product_variants → products
    { sourceTable: "public.product_variants", sourceColumn: "product_id", targetTable: "public.products", targetColumn: "id", constraintName: "product_variants_product_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
    // orders → users
    { sourceTable: "public.orders", sourceColumn: "user_id", targetTable: "public.users", targetColumn: "id", constraintName: "orders_user_id_fkey", updateRule: "NO ACTION", deleteRule: "RESTRICT" },
    // orders → addresses
    { sourceTable: "public.orders", sourceColumn: "shipping_address_id", targetTable: "public.addresses", targetColumn: "id", constraintName: "orders_shipping_address_id_fkey", updateRule: "NO ACTION", deleteRule: "SET NULL" },
    // order_items → orders
    { sourceTable: "public.order_items", sourceColumn: "order_id", targetTable: "public.orders", targetColumn: "id", constraintName: "order_items_order_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
    // order_items → product_variants
    { sourceTable: "public.order_items", sourceColumn: "variant_id", targetTable: "public.product_variants", targetColumn: "id", constraintName: "order_items_variant_id_fkey", updateRule: "NO ACTION", deleteRule: "RESTRICT" },
    // payments → orders
    { sourceTable: "public.payments", sourceColumn: "order_id", targetTable: "public.orders", targetColumn: "id", constraintName: "payments_order_id_fkey", updateRule: "NO ACTION", deleteRule: "RESTRICT" },
    // reviews → users
    { sourceTable: "public.reviews", sourceColumn: "user_id", targetTable: "public.users", targetColumn: "id", constraintName: "reviews_user_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
    // reviews → products
    { sourceTable: "public.reviews", sourceColumn: "product_id", targetTable: "public.products", targetColumn: "id", constraintName: "reviews_product_id_fkey", updateRule: "NO ACTION", deleteRule: "CASCADE" },
    // audit.activity_log → users
    { sourceTable: "audit.activity_log", sourceColumn: "actor_id", targetTable: "public.users", targetColumn: "id", constraintName: "activity_log_actor_id_fkey", updateRule: "NO ACTION", deleteRule: "SET NULL" },
  ],
};

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