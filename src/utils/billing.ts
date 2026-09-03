/**
 * The inputs both billing pages share.
 *
 * `/billing` builds its own markup on the v3 hooks; `/account/billing`
 * renders the packaged elements over the same data. They are meant to show
 * the same figures in the same words, which only holds if both ask for the
 * same rows and name things the same way — so they ask from here.
 */
export const INVOICE_LIMIT = 10;

export const INVOICE_QUERY = { includePending: true };

export const INVOICE_STRINGS = { invoicesHeader: "Billing history" };

export const UPCOMING_BILL_STRINGS = { upcomingBillEstimate: "Estimated" };
