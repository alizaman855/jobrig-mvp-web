const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export type QuoteDocumentData = {
  business: {
    name: string;
    logoUrl: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  customer: {
    name: string;
    address: string;
    phone: string;
    email: string | null;
  };
  job: {
    serviceType: string;
    address: string;
  };
  quote: {
    id: string;
    status: string;
    total: number;
    createdAt: Date;
    signatureUrl: string | null;
    signedByName: string | null;
    signedAt: Date | null;
  };
  lineItems: {
    id: string;
    description: string;
    unit: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
};

export function QuoteDocument({ data }: { data: QuoteDocumentData }) {
  const { business, customer, job, quote, lineItems } = data;

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border bg-white p-6 text-neutral-900 shadow-sm sm:p-10 print:border-0 print:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logoUrl}
              alt={business.name}
              className="size-12 rounded-md object-cover"
            />
          ) : (
            <span className="flex size-12 items-center justify-center rounded-md bg-neutral-900 text-lg font-bold text-white">
              {business.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-semibold text-neutral-900">{business.name}</p>
            {business.contactEmail ? (
              <p className="text-xs text-neutral-500">{business.contactEmail}</p>
            ) : null}
            {business.contactPhone ? (
              <p className="text-xs text-neutral-500">{business.contactPhone}</p>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tracking-tight text-neutral-900">QUOTE</p>
          <p className="text-xs text-neutral-500">{dateFormatter.format(quote.createdAt)}</p>
          <p className="text-xs text-neutral-400">#{quote.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 border-t pt-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">Prepared for</p>
          <p className="mt-1 font-medium text-neutral-900">{customer.name}</p>
          <p className="text-sm text-neutral-500">{customer.address}</p>
          <p className="text-sm text-neutral-500">{customer.phone}</p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">Service</p>
          <p className="mt-1 font-medium text-neutral-900">{job.serviceType}</p>
          <p className="text-sm text-neutral-500">{job.address}</p>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-medium tracking-wide text-neutral-400 uppercase">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id} className="border-b border-neutral-100">
              <td className="py-3 pr-2 text-neutral-900">{item.description}</td>
              <td className="py-3 text-right text-neutral-500">
                {item.quantity}
                {item.unit ? ` ${item.unit}` : ""}
              </td>
              <td className="py-3 text-right text-neutral-500">{currency.format(item.unitPrice)}</td>
              <td className="py-3 text-right font-medium text-neutral-900">
                {currency.format(item.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="flex w-48 items-center justify-between border-t-2 border-neutral-900 pt-2">
          <span className="font-semibold text-neutral-900">Total</span>
          <span className="text-lg font-bold text-neutral-900">{currency.format(quote.total)}</span>
        </div>
      </div>

      {quote.signatureUrl && quote.signedAt ? (
        <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-900">
            Signed by {quote.signedByName} on {dateFormatter.format(quote.signedAt)}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={quote.signatureUrl}
            alt={`Signature of ${quote.signedByName}`}
            className="mt-2 h-16 w-auto"
          />
        </div>
      ) : null}

      <p className="mt-8 border-t pt-4 text-xs text-neutral-400">
        This quote is valid for 30 days from the date issued. Pricing may change if the scope of
        work changes after signing.
      </p>
    </div>
  );
}
