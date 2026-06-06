"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { saveAsBillTemplate } from "@/app/actions/bill-template-actions";
import { saveAsVoucherTemplate } from "@/app/actions/voucher-template-actions";
import { toast } from "sonner";
import { Bookmark, Loader2 } from "lucide-react";

interface SaveTemplateButtonProps {
  id: string;
  type: "bill" | "voucher";
  className?: string;
}

export function SaveTemplateButton({ id, type, className }: SaveTemplateButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Template name is required.");
      return;
    }

    setLoading(true);
    try {
      if (type === "bill") {
        await saveAsBillTemplate(id, name.trim());
      } else {
        await saveAsVoucherTemplate(id, name.trim());
      }
      toast.success("Template saved successfully!");
      setOpen(false);
      setName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to save template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className={
              className ||
              "border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 h-11 md:h-10 cursor-pointer"
            }
          />
        }
      >
        <Bookmark className="h-4 w-4" />
        Save as Template
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-extrabold text-sm sm:text-base">Save as Template</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs mt-1">
            Create a reusable template from this {type === "bill" ? "DC Bill" : "Hand Voucher"}. Payee details, items, and deductions will be pre-filled next time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="template-name" className="text-slate-700 text-xs font-bold">
              Template Name
            </Label>
            <Input
              id="template-name"
              placeholder="e.g. Monthly Electricity Bill, Guest Teacher June..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-slate-200 text-slate-900 text-xs h-10"
              disabled={loading}
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-600 hover:text-slate-800 text-xs h-10"
                  disabled={loading}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-10 flex items-center gap-1.5 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
