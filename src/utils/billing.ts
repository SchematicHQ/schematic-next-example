/**
 * The inputs both billing pages share.
 *
 * `/billing` builds its own markup on the elements hooks; `/account/billing`
 * renders the packaged element over the same data. Both ask for the same
 * rows, so a figure on one page is the same figure on the other. The copy
 * on `/billing` is its own, written beside its markup; `INVOICE_STRINGS`
 * renames the packaged card only.
 */
export const INVOICE_LIMIT = 10;

export const INVOICE_QUERY = { includePending: true };

export const INVOICE_STRINGS = { invoicesHeader: "Billing history" };
