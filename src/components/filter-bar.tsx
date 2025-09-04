"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DateTimePicker } from "./date-time-picker";
import { useMemberFilterOptions } from "@/hooks/use-member-filter-options";
import { format } from "date-fns";

export type FilterBarState = {
  name?: string;
  email?: string;
  mobile?: string;
  domain?: string | "all";
  status?: "all" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  verificationStatus?: "all" | "VERIFIED" | "PENDING" | "UNVERIFIED";
  dateRegistered?: { startDate: Date | null; endDate: Date | null };
  lastActive?: { startDate: Date | null; endDate: Date | null };
};

interface FilterBarProps {
  value?: FilterBarState;
  onChange?: (next: FilterBarState) => void;
  onClear?: () => void;
}

export function FilterBar({ value, onChange, onClear }: FilterBarProps) {
  const [state, setState] = useState<FilterBarState>({
    status: "all",
    verificationStatus: "all",
    domain: "all",
    ...value,
  });

  useEffect(() => {
    onChange?.(state);
  }, [state, onChange]);

  const update = (patch: Partial<FilterBarState>) =>
    setState((s) => ({ ...s, ...patch }));

  const reset = () => {
    setState({
      name: "",
      email: "",
      mobile: "",
      domain: "all",
      status: "all",
      verificationStatus: "all",
      dateRegistered: { startDate: null, endDate: null },
      lastActive: { startDate: null, endDate: null },
    });
    // Let parent clear server-side filters and refetch
    onClear?.();
  };

  const { options } = useMemberFilterOptions(200);

  return (
    <div className="w-full overflow-visible">
      <div className="relative z-40 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 overflow-visible">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">Filter</span>
        <DropdownChip label="Name" selectedLabel={state.name && state.name.length > 0 ? state.name : undefined}>
          <SearchableListFilter
            options={options.names}
            value={state.name || ""}
            placeholder="Search names"
            onChange={(v) => update({ name: v, email: "", mobile: "" })}
          />
        </DropdownChip>
        <DropdownChip label="Verification Status" selectedLabel={mapVerification(state.verificationStatus)}>
          <ListFilter
            options={options.verificationStatuses.length ? options.verificationStatuses : ["VERIFIED", "PENDING", "UNVERIFIED"]}
            value={state.verificationStatus === "all" ? undefined : state.verificationStatus}
            onChange={(v) => update({ verificationStatus: (v as any) || "all" })}
          />
        </DropdownChip>
        <DropdownChip label="Email Address" selectedLabel={state.email && state.email.length > 0 ? state.email : undefined}>
          <SearchableListFilter
            options={options.emails}
            value={state.email || ""}
            placeholder="Search emails"
            onChange={(v) => update({ email: v, name: "", mobile: "" })}
          />
        </DropdownChip>
        <DropdownChip label="Mobile Number" selectedLabel={state.mobile && state.mobile.length > 0 ? state.mobile : undefined}>
          <SearchableListFilter
            options={options.mobiles}
            value={state.mobile || ""}
            placeholder="Search mobiles"
            onChange={(v) => update({ mobile: v, name: "", email: "" })}
          />
        </DropdownChip>
        <DropdownChip label="Domain" selectedLabel={state.domain && state.domain !== "all" ? String(state.domain) : undefined}>
          <SearchableListFilter
            options={options.domains}
            value={state.domain === "all" ? "" : (state.domain as string) || ""}
            placeholder="Search domains"
            onChange={(v) => update({ domain: v || "all" })}
          />
        </DropdownChip>
        <DropdownChip label="Date Registered" selectedLabel={formatRangeLabel(state.dateRegistered)}>
          <div className="p-2 w-[340px]">
            <DateTimePicker
              mode="date"
              onDateRangeChange={(startDate, endDate) => update({ dateRegistered: { startDate, endDate } })}
            />
          </div>
        </DropdownChip>
        <DropdownChip label="Status" selectedLabel={mapStatus(state.status)}>
          <ListFilter
            options={options.statuses.length ? options.statuses : ["ACTIVE", "INACTIVE", "SUSPENDED"]}
            value={state.status === "all" ? undefined : state.status}
            onChange={(v) => update({ status: (v as any) || "all" })}
          />
        </DropdownChip>
        <DropdownChip label="Date and Time Last Active" selectedLabel={formatRangeLabel(state.lastActive, true)}>
          <div className="p-2 w-[340px]">
            <DateTimePicker
              mode="datetime"
              onDateRangeChange={(startDate, endDate) => update({ lastActive: { startDate, endDate } })}
            />
          </div>
        </DropdownChip>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

function mapStatus(s?: FilterBarState["status"]) {
  if (!s || s === "all") return undefined;
  return s.charAt(0) + s.slice(1).toLowerCase();
}
function mapVerification(v?: FilterBarState["verificationStatus"]) {
  if (!v || v === "all") return undefined;
  return v.charAt(0) + v.slice(1).toLowerCase();
}

function DropdownChip({ label, selectedLabel, children }: { label: string; selectedLabel?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (ev: Event) => {
      if (!ref.current) return;
      const target = ev.target as Node | null;
      if (!target) return;

      // Inside chip? keep open
      if (ref.current.contains(target)) return;

      // Inside react-datepicker portal or popper? keep open
      const el = target instanceof Element ? target : null;
      const inDatePicker = !!el?.closest('#root-portal') || !!el?.closest('#datepickers-portal') ||
        !!el?.closest('.react-datepicker') || !!el?.closest('.react-datepicker__portal');
      if (inDatePicker) return;

      setOpen(false);
    };
    const closeListener = () => setOpen(false);
    document.addEventListener('mousedown', handler, true);
    document.addEventListener('touchstart', handler, true);
    document.addEventListener('pointerdown', handler, true);
    document.addEventListener('filter-dropdown-close', closeListener as any);
    return () => {
      document.removeEventListener('mousedown', handler, true);
      document.removeEventListener('touchstart', handler, true);
      document.removeEventListener('pointerdown', handler, true);
      document.removeEventListener('filter-dropdown-close', closeListener as any);
    };
  }, []);
  return (
    <div className="relative z-50" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
      >
        <span className="truncate max-w-[160px]">{selectedLabel ? `${label}: ${selectedLabel}` : label}</span>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-50 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 min-w-[240px]"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function TextFilter({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="p-3 w-64">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-7 pr-2 py-1.5 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function SearchableListFilter({ options, value, onChange, placeholder }: { options: string[]; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(o => o.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="p-3 w-72">
      <div className="relative mb-2">
        <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-7 pr-2 py-1.5 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <ul className="max-h-56 overflow-auto divide-y divide-gray-100 dark:divide-gray-700">
        {filtered.length === 0 ? (
          <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No options</li>
        ) : (
          filtered.map((opt) => (
            <li key={opt}>
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                onClick={() => onChange(opt)}
              >
                <span className="truncate">{opt}</span>
                {value === opt && <CheckIcon className="w-4 h-4" />}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ListFilter({ options, value, onChange }: { options: string[]; value?: string; onChange: (v?: string) => void }) {
  return (
    <div className="p-2 w-48">
      <button
        className={`w-full text-left px-3 py-1.5 text-sm rounded-md mb-2 border ${!value ? "border-blue-500 text-blue-600" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"}`}
        onClick={() => onChange(undefined)}
      >
        All
      </button>
      <ul className="max-h-56 overflow-auto divide-y divide-gray-100 dark:divide-gray-700">
        {options.map((opt) => (
          <li key={opt}>
            <button
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                value === opt ? "text-blue-600" : "text-gray-800 dark:text-gray-100"
              }`}
              onClick={() => onChange(opt)}
            >
              <span>{opt.charAt(0) + opt.slice(1).toLowerCase()}</span>
              {value === opt && <CheckIcon className="w-4 h-4" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatRangeLabel(range?: { startDate: Date | null; endDate: Date | null }, includeTime?: boolean) {
  const fmt = includeTime ? "MMM d, yyyy HH:mm" : "MMM d, yyyy";
  if (!range || (!range.startDate && !range.endDate)) return undefined;
  if (range.startDate && range.endDate) return `${format(range.startDate, fmt)} – ${format(range.endDate, fmt)}`;
  if (range.startDate) return `${format(range.startDate, fmt)}`;
  if (range.endDate) return `${format(range.endDate, fmt)}`;
  return undefined;
}

