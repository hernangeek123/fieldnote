"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Plus, Save, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { saveFieldNoteReview } from "@/app/app/actions";
import { isInvoiceLocked } from "@/lib/paypal/invoice-state";

type CatalogItem = {
  id: string;
  name: string;
  unit: string;
  unit_price_cents: number;
};

type LineItem = {
  key: string;
  id: string;
  catalog_item_id: string;
  description: string;
  quantity: string;
  unit_price: string;
};

type ReviewEditorProps = {
  noteId: string;
  status: string;
  paypalInvoiceCreated?: boolean;
  catalog: CatalogItem[];
  initialItems: Array<{
    id: string;
    catalog_item_id: string | null;
    description: string;
    quantity: number;
    unit_price_cents: number;
  }>;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function emptyItem(sequence: number): LineItem {
  return {
    key: `new-${sequence}`,
    id: "",
    catalog_item_id: "",
    description: "",
    quantity: "1",
    unit_price: "0.00",
  };
}

function ReviewActions({ reviewed }: { reviewed: boolean }) {
  const { pending, data } = useFormStatus();
  const intent = data?.get("intent");

  return (
    <div className="flex flex-wrap justify-end gap-3">
      <button
        type="submit"
        name="intent"
        value="save"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#aeb8b0] bg-white px-4 text-sm font-semibold text-[#28332b] hover:bg-[#f4f6f4] disabled:cursor-wait disabled:opacity-60"
      >
        <Save size={17} aria-hidden="true" />
        {pending && intent === "save" ? "Saving..." : "Save changes"}
      </button>
      {!reviewed ? (
        <button
          type="submit"
          name="intent"
          value="review"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#176b3a] px-5 text-sm font-semibold text-white hover:bg-[#11562e] disabled:cursor-wait disabled:bg-[#8fa197]"
        >
          <Check size={17} aria-hidden="true" />
          {pending && intent === "review" ? "Approving..." : "Approve note"}
        </button>
      ) : null}
    </div>
  );
}

export function ReviewEditor({
  noteId,
  status,
  paypalInvoiceCreated = false,
  catalog,
  initialItems,
}: ReviewEditorProps) {
  const [sequence, setSequence] = useState(initialItems.length + 1);
  const [items, setItems] = useState<LineItem[]>(() =>
    initialItems.length
      ? initialItems.map((item) => ({
          key: item.id,
          id: item.id,
          catalog_item_id: item.catalog_item_id ?? "",
          description: item.description,
          quantity: String(item.quantity),
          unit_price: (item.unit_price_cents / 100).toFixed(2),
        }))
      : [emptyItem(0)],
  );
  const locked = isInvoiceLocked(status, paypalInvoiceCreated);
  const reviewed = status === "reviewed" || locked;
  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Number(item.quantity);
        const price = Number(item.unit_price);
        return sum + (Number.isFinite(quantity) && Number.isFinite(price) ? quantity * price : 0);
      }, 0),
    [items],
  );

  function updateItem(key: string, patch: Partial<LineItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function chooseCatalogItem(key: string, catalogId: string) {
    const selected = catalog.find((item) => item.id === catalogId);
    updateItem(
      key,
      selected
        ? {
            catalog_item_id: selected.id,
            description: selected.name,
            unit_price: (selected.unit_price_cents / 100).toFixed(2),
          }
        : { catalog_item_id: "" },
    );
  }

  function addItem() {
    setItems((current) => [...current, emptyItem(sequence)]);
    setSequence((current) => current + 1);
  }

  const action = saveFieldNoteReview.bind(null, noteId);

  return (
    <form action={action} className="overflow-hidden rounded-md border border-[#d7ddd7] bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-[#e1e5e0] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold">Line items</h2>
          <p className="mt-1 text-sm text-[#657068]">Match the work to your price book and confirm the total.</p>
        </div>
        {!locked ? (
          <button
            type="button"
            onClick={addItem}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-[#aeb8b0] bg-white px-3 text-sm font-semibold hover:bg-[#f4f6f4]"
          >
            <Plus size={16} aria-hidden="true" />
            Add item
          </button>
        ) : null}
      </div>

      <div className="divide-y divide-[#e1e5e0]">
        {items.map((item, index) => {
          const lineTotal = Number(item.quantity) * Number(item.unit_price);
          const needsAttention = !item.catalog_item_id || Number(item.unit_price) === 0;
          return (
            <div key={item.key} className="p-5 sm:p-6">
              <input type="hidden" name="line_item_id" value={item.id} />
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-[#566159]">Item {index + 1}</p>
                  {needsAttention ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#fff3d6] px-2 py-1 text-xs font-semibold text-[#765513]">
                      <AlertTriangle size={13} aria-hidden="true" />
                      Check item
                    </span>
                  ) : null}
                </div>
                {!locked && items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setItems((current) => current.filter((row) => row.key !== item.key))}
                    className="inline-flex size-9 items-center justify-center rounded-md text-[#6b756d] hover:bg-[#fff0ee] hover:text-[#8a2e25]"
                    aria-label={`Remove item ${index + 1}`}
                    title="Remove item"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-6 sm:items-end">
                <label className="block sm:col-span-3">
                  <span className="field-label">Price book</span>
                  <select
                    className="field-input"
                    name="catalog_item_id"
                    value={item.catalog_item_id}
                    disabled={locked}
                    onChange={(event) => chooseCatalogItem(item.key, event.target.value)}
                  >
                    <option value="">Custom item</option>
                    {catalog.map((catalogItem) => (
                      <option key={catalogItem.id} value={catalogItem.id}>
                        {catalogItem.name} / {catalogItem.unit}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-3">
                  <span className="field-label">Description</span>
                  <input
                    className="field-input"
                    name="description"
                    value={item.description}
                    disabled={locked}
                    required
                    maxLength={240}
                    onChange={(event) => updateItem(item.key, { description: event.target.value })}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="field-label">Quantity</span>
                  <input
                    className="field-input"
                    name="quantity"
                    type="number"
                    min="0.01"
                    max="1000000"
                    step="0.01"
                    value={item.quantity}
                    disabled={locked}
                    required
                    onChange={(event) => updateItem(item.key, { quantity: event.target.value })}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="field-label">Unit price</span>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-[#657068]">$</span>
                    <input
                      className="field-input field-input-prefix"
                      name="unit_price"
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      value={item.unit_price}
                      disabled={locked}
                      required
                      onChange={(event) => updateItem(item.key, { unit_price: event.target.value })}
                    />
                  </div>
                </label>
                <div className="sm:col-span-2">
                  <span className="field-label">Total</span>
                  <div className="flex h-11 items-center font-semibold text-[#176b3a]">
                    {money.format(Number.isFinite(lineTotal) ? lineTotal : 0)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-5 border-t border-[#d7ddd7] bg-[#f8faf8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm text-[#657068]">Note total</p>
          <p className="mt-1 text-2xl font-semibold">{money.format(total)}</p>
        </div>
        {locked ? (
          <p className="text-sm font-medium text-[#657068]">
            {status === "invoiced" ? "Invoiced notes are locked." : "Invoice creation started. Line items are locked."}
          </p>
        ) : (
          <ReviewActions reviewed={reviewed} />
        )}
      </div>
    </form>
  );
}
