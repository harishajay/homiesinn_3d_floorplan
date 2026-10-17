import React, { useState } from 'react';
import { LivingLedger } from '../types/coliving';
import { CreditCard, CheckCircle2, Download, FileText, X } from 'lucide-react';

interface LivingLedgerCardProps {
  ledger: LivingLedger;
}

export const LivingLedgerCard: React.FC<LivingLedgerCardProps> = ({ ledger }) => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">My Living Ledger</h3>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Auto-Pay Active
            </span>
          </div>

          {/* Monthly License Fee Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              ALL-INCLUSIVE LICENSE FEE
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                ₹{ledger.monthlyRent.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>All 3 meals, daily cleaning & electricity included</span>
            </div>
          </div>

          {/* Security Deposit Held */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white mb-4">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Security Deposit Held</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                ₹{ledger.securityDeposit.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              100% Refundable
            </span>
          </div>
        </div>

        {/* Download Invoice CTA */}
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Download Invoice History</span>
        </button>
      </div>

      {/* Invoice History Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Living Ledger & Tax Invoices</h3>
                <p className="text-xs text-slate-500">Room 529 • Vadapalani • Harish Aravind</p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {ledger.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{inv.month}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded-full">
                        PAID
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {inv.paymentMode} • Paid on {inv.paidOn}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={handleDownload}
                      className="block text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold mt-0.5 cursor-pointer"
                    >
                      PDF Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {downloadSuccess && (
              <div className="mt-3 p-2 bg-emerald-50 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Invoice PDF downloaded successfully!</span>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Next Auto-Debit: {ledger.nextDueDate}</span>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg text-xs hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
