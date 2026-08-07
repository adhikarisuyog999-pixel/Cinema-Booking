import { useEffect, useState } from "react";

const ExtraItemsModal = ({
  open,
  items = [],
  selectedExtras,
  onChange,
  onClose,
  onConfirm,
}) => {
  const [localSelection, setLocalSelection] = useState([]);

  useEffect(() => {
    setLocalSelection(selectedExtras || []);
  }, [selectedExtras, open]);

  const toggleItem = (item) => {
    const exists = localSelection.find(
      (i) => i.name === item.name && i.size === item.size,
    );
    const updated = exists
      ? localSelection.filter(
          (i) => i.name !== item.name || i.size !== item.size,
        )
      : [...localSelection, item];
    setLocalSelection(updated);
    onChange?.(updated);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Add Extra Items
            </h2>
            <p className="text-sm text-slate-500">
              Choose snacks and drinks before you confirm your purchase.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => {
              const selected = localSelection.some(
                (extra) => extra.name === item.name && extra.size === item.size,
              );
              return (
                <button
                  key={`${item.name}-${item.size}`}
                  type="button"
                  onClick={() => toggleItem(item)}
                  className={`group flex items-center gap-4 rounded-3xl border p-4 text-left transition-all duration-200 ${
                    selected
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <img
                      src={item.image || "/assets/snack.png"}
                      alt={item.name}
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </h3>
                      <span className="text-xs font-bold text-slate-500">
                        {item.size}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Rs. {item.price}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Tap to {selected ? "remove" : "add"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Total: Rs.{" "}
            <span className="font-semibold text-slate-900">
              {localSelection.reduce((sum, item) => sum + item.price, 0)}
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(localSelection)}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add Items & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtraItemsModal;
