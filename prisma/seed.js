import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create SuperAdmin
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    
    const superAdmin = await prisma.superAdmin.upsert({
      where: { email: 'superadmin@hospital.com' },
      update: {},
      create: {
        name: 'Super Admin',
        email: 'superadmin@hospital.com',
        password: hashedPassword,
      },
    });

    console.log('✅ SuperAdmin created:', superAdmin.email);

    // Create sample subscription plans
    const basicPlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'Basic Plan' },
      update: {},
      create: {
        name: 'Basic Plan',
        description: 'Perfect for small clinics',
        price: 29.99,
        currency: 'USD',
        billingCycle: 'monthly',
        maxUsers: 5,
        maxPatients: 500,
        features: {
          modules: ['OPD', 'LAB'],
          maxDoctors: 3,
          maxNurses: 5,
          storage: '5GB',
          support: 'Email'
        }
      }
    });

    const standardPlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'Standard Plan' },
      update: {},
      create: {
        name: 'Standard Plan',
        description: 'Ideal for medium hospitals',
        price: 59.99,
        currency: 'USD',
        billingCycle: 'monthly',
        maxUsers: 15,
        maxPatients: 2000,
        features: {
          modules: ['OPD', 'IPD', 'LAB', 'PHARMACY'],
          maxDoctors: 10,
          maxNurses: 15,
          storage: '20GB',
          support: 'Phone & Email'
        }
      }
    });

    const premiumPlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'Premium Plan' },
      update: {},
      create: {
        name: 'Premium Plan',
        description: 'Complete solution for large hospitals',
        price: 99.99,
        currency: 'USD',
        billingCycle: 'monthly',
        maxUsers: 50,
        maxPatients: 10000,
        features: {
          modules: ['OPD', 'IPD', 'LAB', 'PHARMACY', 'RADIOLOGY', 'SURGERY'],
          maxDoctors: 30,
          maxNurses: 50,
          storage: 'Unlimited',
          support: '24/7 Phone & Email',
          analytics: true,
          customReports: true
        }
      }
    });

    console.log('✅ Subscription plans created');
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 SuperAdmin Credentials:');
    console.log('Email: superadmin@hospital.com');
    console.log('Password: superadmin123');
    console.log('\n⚠️  Remember to change the default password in production!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
