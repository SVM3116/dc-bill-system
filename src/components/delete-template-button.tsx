"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { deleteBillTemplate } from "@/app/actions/bill-template-actions";
import { deleteVoucherTemplate } from "@/app/actions/voucher-template-actions";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteTemplateButtonProps {
  templateId: string;
  templateName: string;
  type: "bill" | "voucher";
  className?: string;
}

export function DeleteTemplateButton({
  templateId,
  templateName,
  type,
  className,
}: DeleteTemplateButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (type === "bill") {
        await deleteBillTemplate(templateId);
      } else {
        await deleteVoucherTemplate(templateId);
      }
      toast.success("Template deleted successfully.");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={className || "h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"}
            title="Delete Template"
          />
        }
      >
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-extrabold text-sm sm:text-base">Delete Template</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs mt-1">
            Are you sure you want to delete the template <strong>"{templateName}"</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                className="h-10 text-xs border-slate-200 hover:bg-slate-50 font-bold"
                disabled={loading}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            className="h-10 text-xs font-bold bg-red-600 hover:bg-red-700 text-white border-transparent cursor-pointer flex items-center justify-center gap-1.5"
            disabled={loading}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
