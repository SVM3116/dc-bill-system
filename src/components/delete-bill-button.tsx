"use client";

import React, { useState } from "react";
import { deleteBill } from "@/app/actions/bill-actions";
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

interface DeleteBillButtonProps {
  billId: string;
  billNumber: string;
  buttonVariant?: "ghost" | "outline" | "default" | "destructive" | "secondary" | "link";
  className?: string;
  children?: React.ReactNode;
  title?: string;
}

export function DeleteBillButton({
  billId,
  billNumber,
  buttonVariant = "ghost",
  className,
  children,
  title = "Delete Bill",
}: DeleteBillButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedBillNumber = billNumber.trim();
  const sequenceNumber = billNumber.split("/")[0].trim();
  const parsedSequence = parseInt(sequenceNumber, 10);

  const enteredInput = confirmInput.trim();
  const isMatch =
    enteredInput === sequenceNumber ||
    (!isNaN(parsedSequence) && !isNaN(parseInt(enteredInput, 10)) && parseInt(enteredInput, 10) === parsedSequence) ||
    enteredInput === normalizedBillNumber;

  const handleConfirmDelete = async () => {
    if (!isMatch) {
      toast.error("The entered D.C. Bill Number does not match.");
      return;
    }

    setLoading(true);
    try {
      await deleteBill(billId);
      toast.success("Bill deleted successfully.");
      setOpen(false);
    } catch (err) {
      // Server Actions redirect triggers an internal NEXT_REDIRECT error which is caught here,
      // but in Next.js this redirect means success.
      const errorMsg = (err as Error).message || String(err);
      if (errorMsg && (errorMsg.includes("NEXT_REDIRECT") || errorMsg.includes("redirect"))) {
        // Redirecting, this is expected success
        setOpen(false);
      } else {
        console.error("Failed to delete bill:", err);
        toast.error("Failed to delete bill: " + errorMsg);
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
            Confirm Bill Deletion
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            This action cannot be undone. To confirm, please type the D.C. Bill Number below:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs font-semibold text-amber-800 flex justify-between items-center">
            <span>Bill Number to type:</span>
            <span className="font-mono bg-white border border-amber-300 px-2 py-0.5 rounded font-black text-amber-900 select-all">
              {sequenceNumber}
            </span>
          </div>

          <Input
            placeholder={`Type "${sequenceNumber}" to confirm`}
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
