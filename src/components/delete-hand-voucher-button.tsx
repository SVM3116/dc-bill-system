"use client";

import React, { useState } from "react";
import { deleteHandVoucher } from "@/app/actions/hand-voucher-actions";
import { logActivity } from "@/app/actions/activity-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteHandVoucherButtonProps {
  voucherId: string;
  voucherNumber: string;
  buttonVariant?: "ghost" | "outline" | "default" | "destructive" | "secondary" | "link";
  className?: string;
  children?: React.ReactNode;
  title?: string;
}

export function DeleteHandVoucherButton({
  voucherId,
  voucherNumber,
  buttonVariant = "ghost",
  className,
  children,
  title = "Delete Voucher",
}: DeleteHandVoucherButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedNumber = voucherNumber.trim();
  
  // E.g. "2026-27/HV/JAN-01" -> last segment is "JAN-01"
  const segments = normalizedNumber.split("/");
  const lastSegment = segments[segments.length - 1] || normalizedNumber;

  const enteredInput = confirmInput.trim();
  const isMatch = enteredInput === normalizedNumber || enteredInput === lastSegment;

  const handleConfirmDelete = async () => {
    if (!isMatch) {
      toast.error("The entered Voucher Number does not match.");
      return;
    }

    setLoading(true);
    try {
      await deleteHandVoucher(voucherId);
      await logActivity("edited", normalizedNumber, "Deleted Hand Voucher");
      toast.success("Hand Voucher deleted successfully.");
      setOpen(false);
    } catch (err) {
      const errorMsg = (err as Error).message || String(err);
      if (errorMsg && (errorMsg.includes("NEXT_REDIRECT") || errorMsg.includes("redirect"))) {
        setOpen(false);
      } else {
        console.error("Failed to delete hand voucher:", err);
        toast.error("Failed to delete voucher: " + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        setConfirmInput("");
      }
      setOpen(val);
    }}>
      <DialogTrigger
        render={
          <Button
            variant={buttonVariant}
            className={className}
            title={title}
            type="button"
          />
        }
      >
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base font-bold text-slate-800">
            Confirm Voucher Deletion
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            This action cannot be undone. To confirm, please type the Voucher Number below:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs font-semibold text-amber-800 flex justify-between items-center">
            <span>Voucher Number to type:</span>
            <span className="font-mono bg-white border border-amber-300 px-2 py-0.5 rounded font-black text-amber-900 select-all">
              {lastSegment}
            </span>
          </div>

          <Input
            placeholder={`Type "${lastSegment}" to confirm`}
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            className="h-10 text-xs border-slate-200"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => setOpen(false)}
            className="h-10 text-xs border-slate-200 hover:bg-slate-50 font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={handleConfirmDelete}
            className={cn(
              "h-10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 border rounded-lg cursor-pointer",
              isMatch
                ? "bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm"
                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            )}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
