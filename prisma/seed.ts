import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // user admin
  const adminEmail = 'admin@gmail.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const password = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { name: 'admin', email: adminEmail, password, role: 'admin' },
    });
    console.log('Usuario admin creado  (admin@gmail.com / admin123)');
  } else {
    console.log('Usuario admin ya existe, se omite.');
  }

  //Customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { documentId: '900123456-1' },
      update: {},
      create: {
        companyName: 'Empresa Logística SA',
        documentId: '900123456-1',
        phone: '+573001234567',
        email: 'empresa1@gmail.com',
      },
    }),
    prisma.customer.upsert({
      where: { documentId: '800987654-2' },
      update: {},
      create: {
        companyName: 'Transportes Andinos SAS',
        documentId: '800987654-2',
        phone: '+573007654321',
        email: 'empresa2@gmail.com',
      },
    }),
  ]);
  console.log('Customers creados:', customers.length);

  //Products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'ELEC-001' },
      update: {},
      create: {
        typeProduct: 'Electrónico',
        name: 'Laptop',
        description: 'Computador portátil',
        sku: 'ELEC-001',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TEXT-002' },
      update: {},
      create: {
        typeProduct: 'Textil',
        name: 'Camisas',
        description: 'Prendas de vestir',
        sku: 'TEXT-002',
      },
    }),
  ]);
  console.log('Products creados:', products.length);

  //Warehouses
  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: {
        name: 'Bodega Norte',
        address: 'Calle 100 #15-30',
        country: 'Colombia',
        city: 'Bogotá',
      },
    }),
    prisma.warehouse.create({
      data: {
        name: 'Bodega Sur',
        address: 'Carrera 50 #20-45',
        country: 'Colombia',
        city: 'Medellín',
      },
    }),
  ]);
  console.log('Warehouses creados:', warehouses.length);

  //SeaPorts
  const seaports = await Promise.all([
    prisma.seaPort.create({
      data: {
        name: 'Puerto de Buenaventura',
        address: 'Av. Simón Bolívar S/N',
        country: 'Colombia',
        city: 'Buenaventura',
      },
    }),
    prisma.seaPort.create({
      data: {
        name: 'Puerto de Cartagena',
        address: 'Manga Terminal Marítimo',
        country: 'Colombia',
        city: 'Cartagena',
      },
    }),
  ]);
  console.log('SeaPorts creados:', seaports.length);

  //Shipments
  const deliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 días
  const feb1 = new Date('2026-02-01T00:00:00.000Z');

  const shipmentLand1 = await prisma.shipment.create({
    data: {
      customerId: customers[0].id,
      trackingNumber: 'TRK0000001',
      deliveryDate,
      basePrice: 500000,
      totalCost: 500000,
      transportMode: 'LAND',
      status: 'PENDING',
    },
  });

  const shipmentLand2 = await prisma.shipment.create({
    data: {
      customerId: customers[1].id,
      trackingNumber: 'TRK0000002',
      deliveryDate,
      basePrice: 750000,
      totalCost: 750000,
      transportMode: 'LAND',
      status: 'REJECTED',
    },
  });

  const shipmentSea1 = await prisma.shipment.create({
    data: {
      customerId: customers[0].id,
      trackingNumber: 'TRK0000003',
      deliveryDate,
      basePrice: 2000000,
      totalCost: 2000000,
      transportMode: 'MARITIME',
      status: 'PENDING',
    },
  });

  const shipmentSea2 = await prisma.shipment.create({
    data: {
      customerId: customers[1].id,
      trackingNumber: 'TRK0000004',
      deliveryDate: feb1,
      basePrice: 3500000,
      totalCost: 3500000,
      transportMode: 'MARITIME',
      status: 'DELIVERED',
    },
  });

  console.log('Shipments creados: 4');

  //Land
  await prisma.land.createMany({
    data: [
      {
        shipmentId: shipmentLand1.id,
        warehouseId: warehouses[0].id,
        licensePlate: 'ABC123',
      },
      {
        shipmentId: shipmentLand2.id,
        warehouseId: warehouses[1].id,
        licensePlate: 'XYZ789',
      },
    ],
  });
  console.log('Land records creados: 2');

  //Maritime
  await prisma.maritime.createMany({
    data: [
      {
        shipmentId: shipmentSea1.id,
        seaPortId: seaports[0].id,
        fleetNumber: 'FLEET001',
      },
      {
        shipmentId: shipmentSea2.id,
        seaPortId: seaports[1].id,
        fleetNumber: 'FLEET002',
      },
    ],
  });
  console.log('Maritime records creados: 2');

  //ShipmentProducts
  await prisma.shipmentProduct.createMany({
    data: [
      {
        shipmentId: shipmentLand1.id,
        productId: products[0].id,
        quantity: 5,
        unitPrice: 1500000,
      },
      {
        shipmentId: shipmentSea1.id,
        productId: products[1].id,
        quantity: 100,
        unitPrice: 25000,
      },
    ],
  });
  console.log('ShipmentProducts creados: 2');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
