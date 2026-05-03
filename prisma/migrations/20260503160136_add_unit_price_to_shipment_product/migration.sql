-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customer_id" TEXT,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" TEXT NOT NULL,
    "type_product" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "warehouse_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("warehouse_id")
);

-- CreateTable
CREATE TABLE "seaports" (
    "seaport_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "seaports_pkey" PRIMARY KEY ("seaport_id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "shipment_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "tracking_number" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_date" TIMESTAMP(3) NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(10,2) NOT NULL,
    "transport_mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("shipment_id")
);

-- CreateTable
CREATE TABLE "land" (
    "shipment_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "license_plate" VARCHAR(6) NOT NULL,

    CONSTRAINT "land_pkey" PRIMARY KEY ("shipment_id")
);

-- CreateTable
CREATE TABLE "maritime" (
    "shipment_id" TEXT NOT NULL,
    "seaport_id" TEXT NOT NULL,
    "fleet_number" VARCHAR(8) NOT NULL,

    CONSTRAINT "maritime_pkey" PRIMARY KEY ("shipment_id")
);

-- CreateTable
CREATE TABLE "shipments_products" (
    "shipment_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "weight" DECIMAL(10,2),
    "volume" DECIMAL(10,2),
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "shipments_products_pkey" PRIMARY KEY ("shipment_id","product_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_document_id_key" ON "customers"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_tracking_number_key" ON "shipments"("tracking_number");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land" ADD CONSTRAINT "land_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("shipment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land" ADD CONSTRAINT "land_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("warehouse_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maritime" ADD CONSTRAINT "maritime_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("shipment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maritime" ADD CONSTRAINT "maritime_seaport_id_fkey" FOREIGN KEY ("seaport_id") REFERENCES "seaports"("seaport_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments_products" ADD CONSTRAINT "shipments_products_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("shipment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments_products" ADD CONSTRAINT "shipments_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
