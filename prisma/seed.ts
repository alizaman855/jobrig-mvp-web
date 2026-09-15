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

  console.log("Seeded:", {
    business: business.name,
    owner: owner.email,
    tech: tech.email,
    customers: customers.map((c) => c.name),
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
