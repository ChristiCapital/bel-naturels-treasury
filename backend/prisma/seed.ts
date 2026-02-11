import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Bel Naturels Spa Treasury...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@belnaturels.com' },
    update: {},
    create: {
      email: 'admin@belnaturels.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.upsert({
    where: { email: 'operations@belnaturels.com' },
    update: {},
    create: {
      email: 'operations@belnaturels.com',
      password: staffPassword,
      name: 'Operations Staff',
      role: 'staff',
    },
  });
  console.log('✅ Created staff user:', staff.email);

  const balances = [
    { provider: 'Global66', currency: 'USD', amount: 15000.00 },
    { provider: 'Global66', currency: 'CLP', amount: 8500000.00 },
    { provider: 'Global66', currency: 'MXN', amount: 125000.00 },
    { provider: 'Bitso', currency: 'USD', amount: 8500.00 },
    { provider: 'Bitso', currency: 'MXN', amount: 250000.00 },
    { provider: 'Bitso', currency: 'BRL', amount: 45000.00 },
    { provider: 'Wise', currency: 'USD', amount: 22000.00 },
    { provider: 'Wise', currency: 'CLP', amount: 4200000.00 },
    { provider: 'Wise', currency: 'COP', amount: 18500000.00 },
    { provider: 'Wise', currency: 'BRL', amount: 32000.00 },
    { provider: 'Bank-CL', currency: 'CLP', amount: 45000000.00 },
    { provider: 'Bank-CL', currency: 'USD', amount: 5000.00 },
  ];

  for (const balance of balances) {
    await prisma.balance.upsert({
      where: { provider_currency: { provider: balance.provider, currency: balance.currency } },
      update: { amount: balance.amount },
      create: balance,
    });
  }
  console.log('✅ Created', balances.length, 'balance records');

  const quotes = [
    { sourceCurrency: 'USD', targetCurrency: 'CLP', midRate: 980.50 },
    { sourceCurrency: 'USD', targetCurrency: 'MXN', midRate: 17.25 },
    { sourceCurrency: 'USD', targetCurrency: 'COP', midRate: 4150.00 },
    { sourceCurrency: 'USD', targetCurrency: 'BRL', midRate: 4.92 },
  ];

  for (const quote of quotes) {
    await prisma.fxQuote.upsert({
      where: { sourceCurrency_targetCurrency: { sourceCurrency: quote.sourceCurrency, targetCurrency: quote.targetCurrency } },
      update: { midRate: quote.midRate, fetchedAt: new Date() },
      create: quote,
    });
  }
  console.log('✅ Created', quotes.length, 'FX quote records');

  const payouts = [
    {
      beneficiaryName: 'Proveedor Aromas SA',
      beneficiaryBank: 'Banco de Chile',
      beneficiaryAcct: '1234567890',
      corridor: 'USD->CLP',
      sourceCurrency: 'USD',
      targetCurrency: 'CLP',
      sourceAmount: 2500.00,
      targetAmount: 2451250.00,
      exchangeRate: 980.50,
      provider: 'Global66',
      status: 'Approved',
      notes: 'Monthly essential oils shipment',
      createdById: admin.id,
    },
    {
      beneficiaryName: 'Equipos Spa Mexico',
      beneficiaryBank: 'BBVA Mexico',
      beneficiaryAcct: '9876543210',
      corridor: 'USD->MXN',
      sourceCurrency: 'USD',
      targetCurrency: 'MXN',
      sourceAmount: 5000.00,
      targetAmount: 86250.00,
      exchangeRate: 17.25,
      provider: 'Bitso',
      status: 'Sent',
      notes: 'Massage tables order',
      createdById: staff.id,
    },
    {
      beneficiaryName: 'Cosmeticos Colombia',
      beneficiaryBank: 'Bancolombia',
      beneficiaryAcct: '5555666677778888',
      corridor: 'USD->COP',
      sourceCurrency: 'USD',
      targetCurrency: 'COP',
      sourceAmount: 1200.00,
      provider: 'Wise',
      status: 'Draft',
      notes: 'Skincare products Q1',
      createdById: admin.id,
    },
    {
      beneficiaryName: 'Fornecedor Brasil LTDA',
      beneficiaryBank: 'Itau',
      beneficiaryAcct: '1111222233334444',
      corridor: 'USD->BRL',
      sourceCurrency: 'USD',
      targetCurrency: 'BRL',
      sourceAmount: 3500.00,
      targetAmount: 17220.00,
      exchangeRate: 4.92,
      provider: 'Wise',
      status: 'Completed',
      notes: 'Organic ingredients batch',
      createdById: staff.id,
    },
  ];

  for (const payout of payouts) {
    await prisma.payout.create({ data: payout });
  }
  console.log('✅ Created', payouts.length, 'payout records');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
