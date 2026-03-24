import React from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const Invoice = ({ order }) => {
  if (!order) return null;

  const {
    _id,
    createdAt,
    shippingAddress,
    items = [],
    totalAmount = 0,
    user,
    guestEmail
  } = order;

  const date = new Date(createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const invoiceNumber = _id ? _id.slice(-8).toUpperCase() : 'N/A';
  
  // GST Logic (Assuming 18% inclusive)
  const isTN = shippingAddress?.state?.toLowerCase().trim() === 'tamil nadu' || 
               shippingAddress?.state?.toLowerCase().trim() === 'tn';
  const total = Number(totalAmount) || 0;
  const taxableValue = total / 1.18;
  const totalGST = total - taxableValue;
  const cgst = isTN ? totalGST / 2 : 0;
  const sgst = isTN ? totalGST / 2 : 0;
  const igst = isTN ? 0 : totalGST;

  return (
    <div className="invoice-container bg-white p-8 max-w-[800px] mx-auto text-gray-800 font-sans shadow-lg print:shadow-none print:p-0 print:max-w-full print:mx-0">
      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 0; padding: 0; visibility: hidden; }
          .invoice-container {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 50px !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white;
          }
          .invoice-container * { visibility: visible; }
          .no-print { display: none !important; }
        }
        .invoice-table th, .invoice-table td {
          border: 1px solid #e5e7eb;
          padding: 12px 8px;
          text-align: left;
        }
        .invoice-table th {
          background-color: #f9fafb;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .invoice-header {
          border-bottom: 2px solid #1e293b;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-logo {
          font-family: serif;
          font-size: 28px;
          font-weight: bold;
          color: #162d3a;
          letter-spacing: 2px;
        }
      `}</style>
      
      {/* Header */}
      <div className="invoice-header flex justify-between items-start">
        <div>
          <div className="company-logo mb-2">CROMSEN</div>
          <div className="text-sm font-bold text-gray-900">CROMSEN IMPORTERS</div>
          <div className="text-xs text-gray-500 max-w-[250px] mt-1 leading-relaxed">
            No. 164, Trichy Road, Opposite Ocean Restaurant,<br />
            Selvarajapuram, Coimbatore - 641103.<br />
            Tamil Nadu, India.<br />
            Phone: +91 99444 31314, 98422 33645<br />
            Email: cscromsen@gmail.com
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">TAX INVOICE</h1>
          <div className="space-y-1">
            <div className="text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Invoice No:</span>
              <span className="ml-2 font-bold text-gray-900">#INV-{invoiceNumber}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Date:</span>
              <span className="ml-2 font-bold text-gray-900">{date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-1 border-b">Bill To</h2>
          <div className="text-sm font-bold text-gray-900 mb-1">{shippingAddress?.name}</div>
          <div className="text-xs text-gray-600 leading-relaxed">
            {shippingAddress?.address}<br />
            {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.zip}<br />
            {shippingAddress?.country}<br />
            <span className="font-bold text-gray-400 uppercase tracking-tighter mr-1 mt-2 inline-block">Phone:</span> {shippingAddress?.phone}<br />
            <span className="font-bold text-gray-400 uppercase tracking-tighter mr-1 inline-block">Email:</span> {guestEmail || user?.email}
            {user?.gstNumber && (
              <div className="mt-2 p-1.5 bg-gray-50 border border-gray-100 inline-block">
                <span className="font-bold text-primary mr-2">GSTIN:</span> {user.gstNumber}
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-1 border-b">Ship To</h2>
          <div className="text-sm font-bold text-gray-900 mb-1">{shippingAddress?.name}</div>
          <div className="text-xs text-gray-600 leading-relaxed">
            {shippingAddress?.address}<br />
            {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.zip}<br />
            {shippingAddress?.country}<br />
            <span className="font-bold text-gray-400 uppercase tracking-tighter mr-1 mt-2 inline-block">Phone:</span> {shippingAddress?.phone}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full invoice-table mb-8">
        <thead>
          <tr>
            <th className="w-12">#</th>
            <th>Item Description</th>
            <th className="text-right">Price</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="text-xs">
              <td className="text-center text-gray-400 font-medium">{idx + 1}</td>
              <td>
                <div className="font-bold text-gray-900">{item.name}</div>
                {item.variant && <div className="text-[10px] text-action font-semibold mt-0.5 uppercase tracking-wider">Variant: {item.variant}</div>}
                {item.customColor && <div className="text-[10px] text-gray-500 font-semibold mt-0.5 uppercase tracking-wider">Color: {item.customColor}</div>}
              </td>
              <td className="text-right font-medium">₹{Number(item.price).toLocaleString()}</td>
              <td className="text-center font-bold text-gray-900">{item.quantity}</td>
              <td className="text-right font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Area */}
      <div className="flex justify-between items-start">
        <div className="w-1/2">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b pb-1">Notes / Terms</h3>
            <p className="text-[9px] text-gray-500 leading-relaxed italic">
              1. Goods once sold will not be taken back or exchanged.<br />
              2. Please check items at the time of delivery.<br />
              3. Any disputes will be subject to Coimbatore Jurisdiction only.<br />
              4. This is a computer generated invoice.
            </p>
          </div>
          <div className="mt-8 text-center border-t border-dashed pt-4 w-3/4">
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-12">Authorized Signatory</div>
             <div className="text-sm font-serif italic text-gray-400">For Cromsen Importers</div>
          </div>
        </div>

        <div className="w-2/5 space-y-3">
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-500 font-bold uppercase tracking-tight">Taxable Value</span>
            <span className="font-bold text-gray-900">₹{taxableValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          {isTN ? (
            <>
              <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                <span className="text-gray-500 font-bold uppercase tracking-tight">CGST (9%)</span>
                <span className="font-bold text-gray-900">₹{cgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                <span className="text-gray-500 font-bold uppercase tracking-tight">SGST (9%)</span>
                <span className="font-bold text-gray-900">₹{sgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-xs py-1 border-b border-gray-100">
              <span className="text-gray-500 font-bold uppercase tracking-tight">IGST (18%)</span>
              <span className="font-bold text-gray-900">₹{igst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between text-xs py-1 border-b border-gray-100 text-green-600">
            <span className="font-bold uppercase tracking-tight">Shipping</span>
            <span className="font-bold uppercase tracking-widest text-[10px]">FREE</span>
          </div>

          <div className="flex justify-between p-3 bg-gray-900 text-white rounded-lg shadow-inner">
            <span className="text-xs font-bold uppercase tracking-[0.2em] self-center">Grand Total</span>
            <span className="text-xl font-bold">₹{total.toLocaleString()}</span>
          </div>
          <div className="text-[9px] text-right text-gray-400 italic">
            Inclusive of all taxes
          </div>
        </div>
      </div>
      
      {/* Footer Branding Removed */}
    </div>
  );
};

export default Invoice;
