type CustomerValues = { name: string; email: string | null; phone: string | null; address: string | null };
type CatalogValues = { name: string; description: string | null; unit: string; unit_price_cents: number; active: boolean };

export function CustomerFields({ values }: { values?: CustomerValues }) {
  return <>
    <label className="block"><span className="field-label">Name</span><input className="field-input" name="name" defaultValue={values?.name} required maxLength={120} /></label>
    <label className="block"><span className="field-label">Email</span><input className="field-input" name="email" type="email" defaultValue={values?.email ?? ""} maxLength={254} /></label>
    <label className="block"><span className="field-label">Phone</span><input className="field-input" name="phone" type="tel" defaultValue={values?.phone ?? ""} maxLength={240} /></label>
    <label className="block"><span className="field-label">Service address</span><textarea className="field-input min-h-20 py-3" name="address" defaultValue={values?.address ?? ""} maxLength={240} /></label>
  </>;
}

export function CatalogFields({ values }: { values?: CatalogValues }) {
  return <>
    <label className="block"><span className="field-label">Service name</span><input className="field-input" name="name" defaultValue={values?.name} required maxLength={120} /></label>
    <label className="block"><span className="field-label">Description</span><textarea className="field-input min-h-20 py-3" name="description" defaultValue={values?.description ?? ""} maxLength={240} /></label>
    <div className="grid grid-cols-2 gap-4">
      <label className="block min-w-0"><span className="field-label">Price</span><div className="relative"><span className="absolute left-3 top-3 text-muted">$</span><input className="field-input field-input-prefix" name="price" type="number" min="0" max="1000000" step="0.01" defaultValue={values ? (values.unit_price_cents / 100).toFixed(2) : ""} required /></div></label>
      <label className="block min-w-0"><span className="field-label">Per</span><input className="field-input" name="unit" defaultValue={values?.unit ?? "job"} required maxLength={40} /></label>
    </div>
    {values ? <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={values.active} className="size-4 accent-accent" />Active service</label> : null}
  </>;
}
