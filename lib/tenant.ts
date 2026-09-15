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
 */
export type TenantContext = {
  businessId: string;
};

export function forTenant({ businessId }: TenantContext) {
  return {
    user: {
      findMany: (args: Omit<Prisma.UserFindManyArgs, "where"> & { where?: Prisma.UserWhereInput } = {}) =>
        prisma.user.findMany({ ...args, where: { ...args.where, businessId } }),
      findById: (id: string) => prisma.user.findFirst({ where: { id, businessId } }),
    },

    customer: {
      findMany: (
        args: Omit<Prisma.CustomerFindManyArgs, "where"> & { where?: Prisma.CustomerWhereInput } = {}
      ) => prisma.customer.findMany({ ...args, where: { ...args.where, businessId } }),
      findById: (id: string) => prisma.customer.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.CustomerUncheckedCreateInput, "businessId">) =>
        prisma.customer.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.CustomerUpdateInput) =>
        prisma.customer.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.customer.deleteMany({ where: { id, businessId } }),
    },

    job: {
      findMany: (args: Omit<Prisma.JobFindManyArgs, "where"> & { where?: Prisma.JobWhereInput } = {}) =>
        prisma.job.findMany({ ...args, where: { ...args.where, businessId } }),
      findById: (id: string) => prisma.job.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.JobUncheckedCreateInput, "businessId">) =>
        prisma.job.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.JobUpdateInput) =>
        prisma.job.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.job.deleteMany({ where: { id, businessId } }),
    },

    quote: {
      findMany: (args: Omit<Prisma.QuoteFindManyArgs, "where"> & { where?: Prisma.QuoteWhereInput } = {}) =>
        prisma.quote.findMany({ ...args, where: { ...args.where, businessId } }),
      findById: (id: string) => prisma.quote.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.QuoteUncheckedCreateInput, "businessId">) =>
        prisma.quote.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.QuoteUpdateInput) =>
        prisma.quote.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.quote.deleteMany({ where: { id, businessId } }),
    },

    quoteLineItem: {
      findMany: (
        args: Omit<Prisma.QuoteLineItemFindManyArgs, "where"> & { where?: Prisma.QuoteLineItemWhereInput } = {}
      ) => prisma.quoteLineItem.findMany({ ...args, where: { ...args.where, businessId } }),
      findById: (id: string) => prisma.quoteLineItem.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.QuoteLineItemUncheckedCreateInput, "businessId">) =>
        prisma.quoteLineItem.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.QuoteLineItemUpdateInput) =>
        prisma.quoteLineItem.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.quoteLineItem.deleteMany({ where: { id, businessId } }),
    },

    invoice: {
      findMany: (
        args: Omit<Prisma.InvoiceFindManyArgs, "where"> & { where?: Prisma.InvoiceWhereInput } = {}
      ) => prisma.invoice.findMany({ ...args, where: { ...args.where, businessId } }),
      findById: (id: string) => prisma.invoice.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.InvoiceUncheckedCreateInput, "businessId">) =>
        prisma.invoice.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.InvoiceUpdateInput) =>
        prisma.invoice.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.invoice.deleteMany({ where: { id, businessId } }),
    },

    reviewRequest: {
      findMany: (
        args: Omit<Prisma.ReviewRequestFindManyArgs, "where"> & { where?: Prisma.ReviewRequestWhereInput } = {}
      ) => prisma.reviewRequest.findMany({ ...args, where: { ...args.where, businessId } }),
      findById: (id: string) => prisma.reviewRequest.findFirst({ where: { id, businessId } }),
      create: (data: Omit<Prisma.ReviewRequestUncheckedCreateInput, "businessId">) =>
        prisma.reviewRequest.create({ data: { ...data, businessId } }),
      update: (id: string, data: Prisma.ReviewRequestUpdateInput) =>
        prisma.reviewRequest.updateMany({ where: { id, businessId }, data }),
      delete: (id: string) => prisma.reviewRequest.deleteMany({ where: { id, businessId } }),
    },
  };
}
