"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Calendar, Archive, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { getBulkDownloadDocumentIds } from "@/app/actions/bulk-download-actions";
import { toast } from "sonner";

export function BulkDownloadDialog() {
  const [open, setOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [accountType, setAccountType] = useState<"all" | "maintenance" | "salary">("all");
  const [downloadType, setDownloadType] = useState<"dc_bills" | "hand_vouchers" | "combined">("combined");

  // Download states
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const handleStartDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    setProgressText("Querying database for documents...");
    setProgressPercent(5);

    try {
      const response = await getBulkDownloadDocumentIds(fromDate, toDate, accountType, downloadType);
      if (!response.success) {
        toast.error(response.error || "Failed to query documents.");
        setIsDownloading(false);
        return;
      }

      const docs = response.documents;
      if (docs.length === 0) {
        toast.warning("No generated documents found for the selected filters.");
        setIsDownloading(false);
        return;
      }

      setProgressText(`Found ${docs.length} document(s). Initializing background thread...`);
      setProgressPercent(10);

      const worker = new Worker("/workers/pdf-zip.worker.js");
      const baseUrl = window.location.origin;

      worker.postMessage({ documents: docs, baseUrl });

      worker.onmessage = (event) => {
        const data = event.data;
        if (data.type === "progress") {
          if (data.statusText) {
            setProgressText(data.statusText);
          } else {
            setProgressText(`Downloading document ${data.current} of ${data.total}: ${data.number}`);
          }
          setProgressPercent(data.percent);
        } else if (data.type === "warning") {
          toast.error(data.message);
        } else if (data.type === "error") {
          toast.error(data.error);
          setIsDownloading(false);
          worker.terminate();
        } else if (data.type === "success") {
          setProgressPercent(100);
          setProgressText("ZIP download started successfully!");
          
          const downloadUrl = URL.createObjectURL(data.blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          const typeLabel = downloadType === "combined" 
            ? "Documents" 
            : downloadType === "dc_bills" 
            ? "DC_Bills" 
            : "Hand_Vouchers";
          a.download = `Bulk_${typeLabel}_${new Date().toISOString().slice(0, 10)}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);

          toast.success(`Bundled and downloaded ${docs.length} documents!`);

          setTimeout(() => {
            setIsDownloading(false);
            setOpen(false);
            setProgressPercent(0);
            setProgressText("");
          }, 1000);
          worker.terminate();
        }
      };

      worker.onerror = (err) => {
        console.error("Worker error:", err);
        toast.error("Background compiler error.");
        setIsDownloading(false);
        worker.terminate();
      };

    } catch (err: any) {
      console.error("Bulk download failed:", err);
      toast.error(err.message || "An unexpected error occurred during zip bundling.");
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!isDownloading) setOpen(val); }}>
      <DialogTrigger
        render={
          <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-10 sm:h-9">
            <Download className="h-4 w-4" />
            Download Documents
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md bg-white border border-slate-200 p-6 rounded-lg max-w-[95%]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Archive className="h-5 w-5 text-blue-700" />
            Bulk Download Documents
          </DialogTitle>
          <p className="text-xs text-slate-500">
            Generate and package DC Bills & Hand Voucher PDFs into a single ZIP archive.
          </p>
        </DialogHeader>

        {isDownloading ? (
          /* Progress State */
          <div className="py-6 space-y-4 text-center">
            <div className="flex justify-center">
              <Loader2 className="h-10 w-10 text-blue-700 animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">{progressText}</p>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-blue-700 h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400">{progressPercent}% Completed</span>
            </div>
          </div>
        ) : (
          /* Filter Form State */
          <form onSubmit={handleStartDownload} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              {/* From Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  From Date
                </label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
                />
              </div>

              {/* To Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  To Date
                </label>
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
                />
              </div>
            </div>

            {/* Account Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
              >
                <option value="all">All Accounts (Maintenance & Salary)</option>
                <option value="maintenance">Maintenance Account</option>
                <option value="salary">Salary Account</option>
              </select>
            </div>

            {/* Download Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Download Category
              </label>
              <select
                value={downloadType}
                onChange={(e) => setDownloadType(e.target.value as any)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
              >
                <option value="combined">Combined ZIP (DC Bills & Hand Vouchers)</option>
                <option value="dc_bills">DC Bills ZIP Only</option>
                <option value="hand_vouchers">Hand Vouchers ZIP Only</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-700 font-semibold text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-9"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Generate & ZIP
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
