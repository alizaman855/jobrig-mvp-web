import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "./db";
import { forTenant } from "./tenant";

const runId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

let businessA: { id: string };
let businessB: { id: string };
let customerInB: { id: string; name: string };

beforeAll(async () => {
  businessA = await prisma.business.create({
    data: { name: `Tenant Test Business A (${runId})` },
  });
  businessB = await prisma.business.create({
    data: { name: `Tenant Test Business B (${runId})` },
  });
  customerInB = await prisma.customer.create({
    data: {
      businessId: businessB.id,
      name: `Customer belonging to Business B (${runId})`,
      phone: "555-000-0000",
      address: "1 Business B St",
    },
  });
});

afterAll(async () => {
  // Cascade deletes handle each business's children.
  await prisma.business.deleteMany({
    where: { id: { in: [businessA.id, businessB.id] } },
  });
  await prisma.$disconnect();
});

describe("forTenant() cross-tenant isolation", () => {
  it("cannot fetch another business's record by id", async () => {
    const asBusinessA = forTenant({ businessId: businessA.id });

    const result = await asBusinessA.customer.findById(customerInB.id);

    expect(result).toBeNull();
  });

  it("does not include another business's records in findMany", async () => {
    const asBusinessA = forTenant({ businessId: businessA.id });

    const results = await asBusinessA.customer.findMany();

    expect(results.find((c) => c.id === customerInB.id)).toBeUndefined();
  });

  it("can fetch the record when scoped to the correct business", async () => {
    const asBusinessB = forTenant({ businessId: businessB.id });

    const result = await asBusinessB.customer.findById(customerInB.id);

    expect(result?.id).toBe(customerInB.id);
  });

  it("cannot update another business's record", async () => {
    const asBusinessA = forTenant({ businessId: businessA.id });

    const result = await asBusinessA.customer.update(customerInB.id, {
      name: "Hijacked by Business A",
    });

    expect(result.count).toBe(0);

    const unchanged = await prisma.customer.findUniqueOrThrow({
      where: { id: customerInB.id },
    });
    expect(unchanged.name).toBe(customerInB.name);
  });

  it("cannot delete another business's record", async () => {
    const asBusinessA = forTenant({ businessId: businessA.id });

    const result = await asBusinessA.customer.delete(customerInB.id);

    expect(result.count).toBe(0);

    const stillExists = await prisma.customer.findUnique({
      where: { id: customerInB.id },
    });
    expect(stillExists).not.toBeNull();
  });
});
