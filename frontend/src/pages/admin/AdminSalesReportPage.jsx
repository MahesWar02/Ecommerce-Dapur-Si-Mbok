import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminLayout from "../../components/admin/AdminLayout";
import * as orderService from "../../services/orderService";

const statusConfig = {
  paid: { label: "Dibayar", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Diproses", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "Dikirim", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Selesai", color: "bg-green-100 text-green-700" },
};

const AdminSalesReportPage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .slice(0, 10);

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatRupiah = (v) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(v);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // SD #15: Meminta data laporan penjualan → Ambil data laporan
  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getSalesReport({ startDate, endDate });
      setData(res.data);
    } catch {
      toast.error("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // SD #15: [Unduh laporan] → Generate PDF → Laporan siap diunduh
  const handleDownloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(249, 115, 22); // orange-500
    doc.rect(0, 0, pageW, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Penjualan", 14, 13);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Dapur Si Mbok", 14, 21);
    doc.text(
      `Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`,
      pageW - 14,
      21,
      { align: "right" },
    );

    // Ringkasan
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan", 14, 42);

    autoTable(doc, {
      startY: 46,
      head: [["Total Pesanan", "Total Pendapatan"]],
      body: [[data.totalOrders, formatRupiah(data.totalRevenue)]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 14, right: 14 },
    });

    // Produk Terlaris
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Produk Terlaris", 14, doc.lastAutoTable.finalY + 12);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Nama Produk", "Kategori", "Qty Terjual", "Pendapatan"]],
      body: data.topProducts.map((p) => [
        p.name,
        p.category,
        p.qty,
        formatRupiah(p.revenue),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 14, right: 14 },
    });

    // Daftar Pesanan
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Daftar Pesanan", 14, doc.lastAutoTable.finalY + 12);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["ID", "Pembeli", "Tanggal", "Status", "Total"]],
      body: data.orders.map((o) => [
        `#${o._id.slice(-8).toUpperCase()}`,
        o.user?.name || "-",
        formatDate(o.createdAt),
        statusConfig[o.status]?.label || o.status,
        formatRupiah(o.totalAmount),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Dicetak: ${new Date().toLocaleDateString("id-ID")} — Halaman ${i} dari ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" },
      );
    }

    doc.save(`laporan-penjualan-${startDate}-sd-${endDate}.pdf`);
    toast.success("Laporan berhasil diunduh!");
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              📊 Laporan Penjualan
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Data pesanan yang sudah dibayar hingga selesai
            </p>
          </div>
          {/* SD #15: [Unduh laporan] */}
          <button
            onClick={handleDownloadPDF}
            disabled={!data || loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            📥 Unduh PDF
          </button>
        </div>

        {/* Filter Tanggal — SD #15: [Filter tanggal] */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Dari</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sampai</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          {/* Shortcut filter */}
          <div className="flex gap-2 ml-auto">
            {[
              {
                label: "Hari ini",
                fn: () => {
                  setStartDate(today);
                  setEndDate(today);
                },
              },
              {
                label: "Bulan ini",
                fn: () => {
                  setStartDate(firstOfMonth);
                  setEndDate(today);
                },
              },
              {
                label: "Semua",
                fn: () => {
                  setStartDate("");
                  setEndDate("");
                },
              },
            ].map((s) => (
              <button
                key={s.label}
                onClick={s.fn}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
          </div>
        ) : !data ? null : (
          <>
            {/* Kartu Ringkasan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-400 mb-1">Total Pesanan</p>
                <p className="text-3xl font-bold text-gray-800">
                  {data.totalOrders}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-400 mb-1">Total Pendapatan</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatRupiah(data.totalRevenue)}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-400 mb-1">
                  Rata-rata per Pesanan
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {data.totalOrders > 0
                    ? formatRupiah(data.totalRevenue / data.totalOrders)
                    : "Rp0"}
                </p>
              </div>
            </div>

            {/* Produk Terlaris */}
            {data.topProducts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                <h2 className="font-semibold text-gray-800 mb-4">
                  🏆 Produk Terlaris
                </h2>
                <div className="space-y-3">
                  {data.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div
                            className="h-1.5 bg-orange-400 rounded-full"
                            style={{
                              width: `${(p.qty / data.topProducts[0].qty) * 100}%`,
                              minWidth: "8px",
                              maxWidth: "200px",
                            }}
                          />
                          <span className="text-xs text-gray-400">
                            {p.qty} terjual
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {formatRupiah(p.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabel Pesanan — SD #15: [Lihat detail pesanan] */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">
                  📋 Daftar Pesanan
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({data.orders.length} pesanan)
                  </span>
                </h2>
              </div>

              {data.orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-sm">Tidak ada pesanan di periode ini</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="px-5 py-3 text-left">ID</th>
                        <th className="px-5 py-3 text-left">Pembeli</th>
                        <th className="px-5 py-3 text-left">Produk</th>
                        <th className="px-5 py-3 text-left">Tanggal</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.orders.map((o) => (
                        <tr
                          key={o._id}
                          className="hover:bg-orange-50/30 transition-colors"
                        >
                          <td className="px-5 py-3 font-mono text-xs text-gray-400">
                            #{o._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-800">
                              {o.user?.name || "-"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {o.user?.email}
                            </p>
                          </td>
                          <td className="px-5 py-3 text-gray-600 text-xs">
                            {o.items
                              .map((i) => `${i.product?.name} x${i.quantity}`)
                              .join(", ")}
                          </td>
                          <td className="px-5 py-3 text-gray-500 text-xs">
                            {formatDate(o.createdAt)}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                statusConfig[o.status]?.color ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {statusConfig[o.status]?.label || o.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-gray-800">
                            {formatRupiah(o.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Total row */}
                    <tfoot>
                      <tr className="bg-orange-50 border-t border-orange-100">
                        <td
                          colSpan={5}
                          className="px-5 py-3 text-sm font-semibold text-gray-700"
                        >
                          Total Pendapatan
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-orange-600">
                          {formatRupiah(data.totalRevenue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSalesReportPage;
