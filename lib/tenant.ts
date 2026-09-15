import { prisma } from "./db";
import type { Prisma } from "./generated/prisma/client.ts";

/**
 * Every DB access for tenant-scoped models must go through `forTenant()`.
 * It injects `businessId` into every read/write so a record belonging to
 * another business is invisible rather than merely forbidden:
 *  - reads use `findFirst({ id, businessId })`, never `findUnique({ id })`,
 *    so a cross-tenant id returns null instead of leaking the record.
 *  - writes use `updateMany`/`deleteMany` with `{ id, businessId }` in the
 *    where clause (not `update`/`delete`, which only accept a unique
 *    `{ id }` filter) so a cross-tenant id affects zero rows instead of
 *    mutating another tenant's data. Callers should check `result.count`.
 *
 * findMany's `args` param is generic (rather than a fixed `Omit<...>` type)
 * so TypeScript keeps inferring the right payload shape from `include`/
 * `select` — a fixed param type would erase that and silently widen every
 * included relation to `unknown`.
 */
export type TenantContext = {
  businessId: string;
};

export function forTenant({ businessId }: TenantContext) {
  return {
    user: {
      findMany: <T extends Omit<Prisma.UserFindManyArgs, "where"> & { where?: Prisma.UserWhereInput }>(
        args?: T
      ) =>
        prisma.user.findMany({ ...args, where: { ...args?.where, businessId } }) as Prisma.PrismaPromise<
          Array<Prisma.UserGetPayload<T>>
        >,
      findById: (id: string) => prisma.user.findFirst({ where: { id, businessId } }),
    },

    invitation: {
      findMany: <
        T extends Omit<Prisma.InvitationFindManyArgs, "where"> & { where?: Prisma.InvitationWhereInput },
      >(
        args?: T
      ) =>
        prisma.invitation.findMany({
          ...args,
          where: { ...args?.where, businessId },
        }) as Prisma.PrismaPromise<Array<Prisma.InvitationGetPayload<T>>>,
      findById: (id: string) => prisma.invitation.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.InvitationUncheckedCreateInput, "businessId">) =>
        prisma.invitation.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.InvitationUncheckedUpdateInput) =>
        prisma.invitation.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.invitation.deleteMany({ where: { id, businessId } }),
      findByEmail: (email: string) => prisma.invitation.findFirst({ where: { email, businessId } }),
      upsertByEmail: (
        email: string,
        data: {
          create: Omit<Prisma.InvitationUncheckedCreateInput, "businessId" | "email">;
          update: Prisma.InvitationUncheckedUpdateInput;
        }
      ) =>
        prisma.invitation.upsert({
          where: { businessId_email: { businessId, email } },
          create: { ...data.create, businessId, email },
          update: data.update,
        }),
    },

    customer: {
      findMany: <
        T extends Omit<Prisma.CustomerFindManyArgs, "where"> & { where?: Prisma.CustomerWhereInput },
      >(
        args?: T
      ) =>
        prisma.customer.findMany({
          ...args,
          where: { ...args?.where, businessId },
        }) as Prisma.PrismaPromise<Array<Prisma.CustomerGetPayload<T>>>,
      findById: (id: string) => prisma.customer.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.CustomerUncheckedCreateInput, "businessId">) =>
        prisma.customer.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.CustomerUncheckedUpdateInput) =>
        prisma.customer.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.customer.deleteMany({ where: { id, businessId } }),
    },

    job: {
      findMany: <T extends Omit<Prisma.JobFindManyArgs, "where"> & { where?: Prisma.JobWhereInput }>(
        args?: T
      ) =>
        prisma.job.findMany({ ...args, where: { ...args?.where, businessId } }) as Prisma.PrismaPromise<
          Array<Prisma.JobGetPayload<T>>
        >,
      findById: (id: string) => prisma.job.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.JobUncheckedCreateInput, "businessId">) =>
        prisma.job.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.JobUncheckedUpdateInput) =>
        prisma.job.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.job.deleteMany({ where: { id, businessId } }),
    },

    quote: {
      findMany: <T extends Omit<Prisma.QuoteFindManyArgs, "where"> & { where?: Prisma.QuoteWhereInput }>(
        args?: T
      ) =>
        prisma.quote.findMany({ ...args, where: { ...args?.where, businessId } }) as Prisma.PrismaPromise<
          Array<Prisma.QuoteGetPayload<T>>
        >,
      findById: (id: string) => prisma.quote.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.QuoteUncheckedCreateInput, "businessId">) =>
        prisma.quote.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.QuoteUncheckedUpdateInput) =>
        prisma.quote.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.quote.deleteMany({ where: { id, businessId } }),
    },

    quoteLineItem: {
      findMany: <
        T extends Omit<Prisma.QuoteLineItemFindManyArgs, "where"> & { where?: Prisma.QuoteLineItemWhereInput },
      >(
        args?: T
      ) =>
        prisma.quoteLineItem.findMany({
          ...args,
          where: { ...args?.where, businessId },
        }) as Prisma.PrismaPromise<Array<Prisma.QuoteLineItemGetPayload<T>>>,
      findById: (id: string) => prisma.quoteLineItem.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.QuoteLineItemUncheckedCreateInput, "businessId">) =>
        prisma.quoteLineItem.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.QuoteLineItemUncheckedUpdateInput) =>
        prisma.quoteLineItem.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.quoteLineItem.deleteMany({ where: { id, businessId } }),
    },

    invoice: {
      findMany: <
        T extends Omit<Prisma.InvoiceFindManyArgs, "where"> & { where?: Prisma.InvoiceWhereInput },
      >(
        args?: T
      ) =>
        prisma.invoice.findMany({
          ...args,
          where: { ...args?.where, businessId },
        }) as Prisma.PrismaPromise<Array<Prisma.InvoiceGetPayload<T>>>,
      findById: (id: string) => prisma.invoice.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.InvoiceUncheckedCreateInput, "businessId">) =>
        prisma.invoice.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.InvoiceUncheckedUpdateInput) =>
        prisma.invoice.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.invoice.deleteMany({ where: { id, businessId } }),
    },

    reviewRequest: {
      findMany: <
        T extends Omit<Prisma.ReviewRequestFindManyArgs, "where"> & { where?: Prisma.ReviewRequestWhereInput },
      >(
        args?: T
      ) =>
        prisma.reviewRequest.findMany({
          ...args,
          where: { ...args?.where, businessId },
        }) as Prisma.PrismaPromise<Array<Prisma.ReviewRequestGetPayload<T>>>,
      findById: (id: string) => prisma.reviewRequest.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.ReviewRequestUncheckedCreateInput, "businessId">) =>
        prisma.reviewRequest.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.ReviewRequestUncheckedUpdateInput) =>
        prisma.reviewRequest.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.reviewRequest.deleteMany({ where: { id, businessId } }),
    },
  };
}
