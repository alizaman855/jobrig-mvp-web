import { prisma } from "../lib/db.ts";
import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "password123";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const business = await prisma.business.upsert({
    where: { id: "demo-business" },
    update: {},
    create: {
      id: "demo-business",
      name: "Acme HVAC & Plumbing",
      googleReviewUrl: "https://g.page/r/CQjjwjw-demo123/review",
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@acmehvac.test" },
    update: {},
    create: {
      businessId: business.id,
      name: "Olivia Owner",
      email: "owner@acmehvac.test",
      passwordHash,
      role: "OWNER",
    },
  });

  const tech = await prisma.user.upsert({
    where: { email: "tech@acmehvac.test" },
    update: {},
    create: {
      businessId: business.id,
      name: "Tom Tech",
      email: "tech@acmehvac.test",
      passwordHash,
      role: "TECH",
    },
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: "dispatcher@acmehvac.test" },
    update: {},
    create: {
      businessId: business.id,
      name: "Dana Dispatcher",
      email: "dispatcher@acmehvac.test",
      passwordHash,
      role: "DISPATCHER",
    },
  });

  const customers = await Promise.all(
    [
      {
        id: "demo-customer-1",
        name: "Grace Homeowner",
        phone: "555-010-1111",
        email: "grace@example.com",
        address: "12 Maple St, Springfield",
      },
      {
        id: "demo-customer-2",
        name: "Hank Property Mgmt",
        phone: "555-010-2222",
        email: "hank@example.com",
        address: "48 Oak Ave, Springfield",
      },
      {
        id: "demo-customer-3",
        name: "Ivy Retail Plaza",
        phone: "555-010-3333",
        email: null,
        address: "900 Commerce Blvd, Springfield",
      },
    ].map((customer) =>
      prisma.customer.upsert({
        where: { id: customer.id },
        update: {},
        create: {
          ...customer,
          businessId: business.id,
        },
      })
    )
  );

  const pricingTemplates = await Promise.all(
    [
      { id: "demo-pt-1", name: "AC unit install", unit: "ton", unitPrice: "1200.00", sortOrder: 1 },
      { id: "demo-pt-2", name: "Fence installation", unit: "linear ft", unitPrice: "28.00", sortOrder: 2 },
      { id: "demo-pt-3", name: "Diagnostic visit", unit: "flat", unitPrice: "89.00", sortOrder: 3 },
      { id: "demo-pt-4", name: "Labor", unit: "hour", unitPrice: "95.00", sortOrder: 4 },
    ].map((template) =>
      prisma.pricingTemplate.upsert({
        where: { id: template.id },
        update: {},
        create: { ...template, businessId: business.id },
      })
    )
  );

  const now = new Date();
  const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(10, 0, 0, 0);

  const jobs = await Promise.all(
    [
      {
        id: "demo-job-1",
        customerId: "demo-customer-1",
        serviceType: "AC unit tune-up",
        address: "12 Maple St, Springfield",
        status: "SCHEDULED" as const,
        assignedTechId: tech.id,
        scheduledAt: inTwoHours,
      },
      {
        id: "demo-job-2",
        customerId: "demo-customer-2",
        serviceType: "Water heater install",
        address: "48 Oak Ave, Springfield",
        status: "SCHEDULED" as const,
        assignedTechId: tech.id,
        scheduledAt: tomorrow,
      },
      {
        id: "demo-job-3",
        customerId: "demo-customer-3",
        serviceType: "Fence repair estimate",
        address: "900 Commerce Blvd, Springfield",
        status: "NEW" as const,
        assignedTechId: null,
        scheduledAt: null,
      },
    ].map((job) =>
      prisma.job.upsert({
        where: { id: job.id },
        update: {},
        create: { ...job, businessId: business.id },
      })
    )
  );

  console.log("Seeded:", {
    business: business.name,
    owner: owner.email,
    dispatcher: dispatcher.email,
    tech: tech.email,
    customers: customers.map((c) => c.name),
    jobs: jobs.map((j) => j.serviceType),
    pricingTemplates: pricingTemplates.map((p) => p.name),
    demoPassword: DEMO_PASSWORD,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
