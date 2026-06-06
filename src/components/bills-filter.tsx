"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface BillsFilterProps {
  initialSearch: string;
  initialStatus: string;
  initialStartDate: string;
  initialEndDate: string;
  initialFromAmount?: string;
  initialToAmount?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function BillsFilter({
  initialSearch,
  initialStatus,
  initialStartDate,
  initialEndDate,
  initialFromAmount = "",
  initialToAmount = "",
  currentPage,
  totalPages,
  totalItems,
}: BillsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State management for filter controls
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [fromAmount, setFromAmount] = useState(initialFromAmount);
  const [toAmount, setToAmount] = useState(initialToAmount);
  const [amountError, setAmountError] = useState<string | null>(null);

  // Sync state with url changes
  useEffect(() => {
    setSearch(initialSearch);
    setStatus(initialStatus);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setFromAmount(initialFromAmount);
    setToAmount(initialToAmount);
  }, [initialSearch, initialStatus, initialStartDate, initialEndDate, initialFromAmount, initialToAmount]);

  // Debounce search query input to trigger live filtering dynamically
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search !== initialSearch) {
        updateFilters({ q: search });
      }
    }, 350); // 350ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [search, initialSearch]);

  // Debounce amount range inputs to trigger live filtering dynamically
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const minVal = fromAmount.trim();
      const maxVal = toAmount.trim();

      const minNum = Number(minVal);
      const maxNum = Number(maxVal);

      const isMinValid = minVal === "" || (!isNaN(minNum) && minNum >= 0);
      const isMaxValid = maxVal === "" || (!isNaN(maxNum) && maxNum >= 0);
      const hasError = minVal !== "" && maxVal !== "" && !isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum;

      if (hasError) {
        setAmountError("Min amount cannot be greater than max");
      } else {
        setAmountError(null);
        if (isMinValid && isMaxValid) {
          if (fromAmount !== initialFromAmount || toAmount !== initialToAmount) {
            updateFilters({ fromAmount, toAmount });
          }
        }
      }
    }, 400); // 400ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [fromAmount, toAmount, initialFromAmount, initialToAmount]);

  const updateFilters = (newFilters: {
    q?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    fromAmount?: string;
    toAmount?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Manage filters helper
    const applyParam = (key: string, value: string | undefined | null | number) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      } else if (value === "") {
        params.delete(key);
      }
    };

    if (newFilters.q !== undefined) applyParam("q", newFilters.q);
    if (newFilters.status !== undefined) {
      applyParam("status", newFilters.status === "all" ? "" : newFilters.status);
    }
    if (newFilters.startDate !== undefined) applyParam("startDate", newFilters.startDate);
    if (newFilters.endDate !== undefined) applyParam("endDate", newFilters.endDate);
    if (newFilters.fromAmount !== undefined) applyParam("fromAmount", newFilters.fromAmount);
    if (newFilters.toAmount !== undefined) applyParam("toAmount", newFilters.toAmount);
    
    // Update page
    if (newFilters.page !== undefined) {
      applyParam("page", newFilters.page);
    } else {
      // If changing filters, reset back to page 1
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: search });
  };

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setFromAmount("");
    setToAmount("");
    setAmountError(null);
    const accountType = searchParams.get("account_type");
    if (accountType) {
      router.push(`${pathname}?account_type=${accountType}`);
    } else {
      router.push(pathname);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm space-y-4">
      {/* Search and status controls */}
      <form onSubmit={handleSearchSubmit} className="grid gap-4 grid-cols-1 sm:grid-cols-12 items-end">
        <div className="sm:col-span-8 space-y-1.5">
          <Label htmlFor="search" className="text-xs font-bold text-slate-700">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="search"
              placeholder="Search by DC Bill #, Cheque #, Payee, Amount..."
              className="pl-9 border-slate-200 text-xs h-12 sm:h-9 bg-slate-50 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sm:col-span-3 space-y-1.5">
          <Label htmlFor="status" className="text-xs font-bold text-slate-700">Status</Label>
          <select
            id="status"
            className="w-full h-12 sm:h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              updateFilters({ status: e.target.value });
            }}
          >
            <option value="all">All Bills</option>
            <option value="draft">Drafts</option>
            <option value="generated">Generated</option>
          </select>
        </div>

        <div className="sm:col-span-1 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="w-full border-slate-200 hover:bg-slate-50 text-slate-600 h-12 sm:h-9 px-3 flex items-center justify-center gap-1.5"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span className="sm:hidden font-semibold text-xs">Reset</span>
          </Button>
        </div>
      </form>

      {/* Date Filters and Pagination summary */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-3 border-t border-slate-100">
        {/* Date & Amount Ranges */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-1 sm:flex-initial">
            <span className="text-xs text-slate-500 font-semibold">From Date:</span>
            <input
              type="date"
              className="h-12 sm:h-8 rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 w-[140px]"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                updateFilters({ startDate: e.target.value });
              }}
            />
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-1 sm:flex-initial">
            <span className="text-xs text-slate-500 font-semibold">To Date:</span>
            <input
              type="date"
              className="h-12 sm:h-8 rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 w-[140px]"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                updateFilters({ endDate: e.target.value });
              }}
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 flex-1 sm:flex-initial">
            <span className="text-xs text-slate-500 font-semibold">Min (₹):</span>
            <Input
              type="number"
              min="0"
              placeholder="Min"
              className="h-12 sm:h-8 rounded border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[100px]"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-1 sm:flex-initial">
            <span className="text-xs text-slate-500 font-semibold">Max (₹):</span>
            <Input
              type="number"
              min="0"
              placeholder="Max"
              className="h-12 sm:h-8 rounded border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[100px]"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          <span className="text-xs text-slate-500 font-semibold text-center sm:text-left">
            Total count: <strong className="text-slate-700 font-bold">{totalItems}</strong> bills
          </span>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: currentPage - 1 })}
              className="h-10 w-10 sm:h-8 sm:w-8 p-0 border-slate-200"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>
            <span className="text-xs text-slate-500 select-none">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilters({ page: currentPage + 1 })}
              className="h-10 w-10 sm:h-8 sm:w-8 p-0 border-slate-200"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>

      {amountError && (
        <div className="text-[10px] text-red-500 font-bold tracking-tight bg-red-50 border border-red-200 rounded px-2.5 py-1 mt-1 max-w-max">
          ⚠️ {amountError}
        </div>
      )}
    </div>
  );
}
