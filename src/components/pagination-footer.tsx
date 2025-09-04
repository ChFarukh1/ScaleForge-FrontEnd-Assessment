"use client";

interface PaginationFooterProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  currentPage: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function PaginationFooter({ pageSize, onPageSizeChange, currentPage, onPrev, onNext, hasPrev, hasNext }: PaginationFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
      <div className="flex items-center space-x-2 text-sm">
        <label className="text-gray-600 dark:text-gray-400">Entries</label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
        >
          {[10, 20, 50].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage}</span>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

