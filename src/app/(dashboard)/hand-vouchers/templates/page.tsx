import React from "react";
import Link from "next/link";
import { getVoucherTemplates } from "@/app/actions/voucher-template-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Bookmark, Calendar, FileText } from "lucide-react";
import { DeleteTemplateButton } from "@/components/delete-template-button";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export const revalidate = 0;

export default async function VoucherTemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const templates = await getVoucherTemplates();

  const layoutNames: Record<string, string> = {
    teacher: "Guest Teacher",
    milling: "Milling & Cleaning",
    labor: "Labor / Coolie",
    gas: "Gas / Transport",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/hand-vouchers">
          <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
            Recurring Voucher Templates
          </h2>
          <p className="text-xs text-slate-500">Manage and reuse saved Hand Voucher layouts for quick voucher creation.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 py-4 px-4 sm:px-6">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-blue-700" />
            Saved Templates ({templates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {templates.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="font-semibold text-xs text-slate-700 w-[200px]">Template Name</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700">Layout Type</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 text-center w-[120px]">Payment Mode</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 text-center w-[100px]">Item Count</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 text-center w-[120px]">Created At</TableHead>
                      <TableHead className="w-[150px] text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((tpl) => (
                      <TableRow key={tpl.id} className="hover:bg-slate-50 text-slate-700">
                        <TableCell className="font-bold text-xs text-slate-800">{tpl.name}</TableCell>
                        <TableCell className="text-xs text-slate-600 font-medium">{layoutNames[tpl.table_layout] || tpl.table_layout}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            tpl.payment_mode === "cash"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : "bg-blue-50 text-blue-700 border-blue-300"
                          }`}>
                            {tpl.payment_mode === "cash" ? "Cash" : "Cheque"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 text-center font-bold">{(tpl.items as any[])?.length || 0}</TableCell>
                        <TableCell className="text-xs text-slate-500 text-center">
                          {new Date(tpl.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link href={`/hand-vouchers/new?templateId=${tpl.id}`}>
                              <Button className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-8 px-3 flex items-center gap-1 cursor-pointer">
                                <Play className="h-3 w-3 fill-current" />
                                Use
                              </Button>
                            </Link>
                            <DeleteTemplateButton templateId={tpl.id} templateName={tpl.name} type="voucher" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-slate-100">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-850 block">{tpl.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Created: {new Date(tpl.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tpl.payment_mode === "cash"
                          ? "bg-amber-50 text-amber-700 border-amber-300"
                          : "bg-blue-50 text-blue-700 border-blue-300"
                      }`}>
                        {tpl.payment_mode === "cash" ? "Cash" : "Cheque"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <p><strong className="text-slate-400">Layout:</strong> {layoutNames[tpl.table_layout] || tpl.table_layout}</p>
                      <p className="mt-0.5"><strong className="text-slate-400">Items:</strong> {(tpl.items as any[])?.length || 0} items</p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Link href={`/hand-vouchers/new?templateId=${tpl.id}`} className="flex-1">
                        <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-9 flex items-center justify-center gap-1 cursor-pointer">
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Use Template
                        </Button>
                      </Link>
                      <DeleteTemplateButton templateId={tpl.id} templateName={tpl.name} type="voucher" className="border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 h-9 w-9 rounded-md flex items-center justify-center" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 px-4">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-slate-700">No recurring templates</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                Open any generated Hand Voucher details page and click "Save as Template" to add templates here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
