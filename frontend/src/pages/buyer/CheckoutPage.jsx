import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as orderService from "../../services/orderService";
import Navbar from "../../components/shared/Navbar";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = review
  const [formData, setFormData] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
  }, [items]);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * (item.product?.price || 0),
    0,
  );

  const handleFormSubmit = (data) => {
    setFormData(data);
    setStep(2);
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          recipientName: formData.recipientName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        notes: formData.notes,
      };

      const res = await orderService.createOrder(orderData);
      toast.success("Pesanan berhasil dibuat!");
      navigate(`/payment/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"} font-semibold text-sm`}
            >
              1
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              Alamat
            </span>
          </div>
          <div
            className={`w-16 h-0.5 mx-2 ${step >= 2 ? "bg-orange-500" : "bg-gray-200"}`}
          />
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"} font-semibold text-sm`}
            >
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              Review
            </span>
          </div>
        </div>

        {/* Step 1: Form Alamat */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Alamat Pengiriman
            </h1>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Penerima
                        </label>
                        <input
                          {...register("recipientName", {
                            required: "Wajib diisi",
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder="Nama penerima"
                        />
                        {errors.recipientName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.recipientName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No. Telepon
                        </label>
                        <input
                          {...register("phone", { required: "Wajib diisi" })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder="08xxx"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Lengkap
                      </label>
                      <textarea
                        {...register("address", { required: "Wajib diisi" })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                        placeholder="Jl. ..."
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kota
                        </label>
                        <input
                          {...register("city", { required: "Wajib diisi" })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder="Kota"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kode Pos
                        </label>
                        <input
                          {...register("postalCode", {
                            required: "Wajib diisi",
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder="12345"
                        />
                        {errors.postalCode && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.postalCode.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan (opsional)
                      </label>
                      <input
                        {...register("notes")}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Catatan untuk penjual..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors"
                    >
                      Lanjut ke Review →
                    </button>
                  </form>
                </div>
              </div>

              {/* Summary */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Ringkasan
                  </h3>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600 truncate mr-2">
                          {item.product?.name} x{item.quantity}
                        </span>
                        <span className="font-medium flex-shrink-0">
                          {formatRupiah(item.product?.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-orange-600">
                        {formatRupiah(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Review Order */}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Review Pesanan
            </h1>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {/* Alamat Pengiriman */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">
                      📍 Alamat Pengiriman
                    </h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-orange-500 text-sm hover:underline"
                    >
                      Ubah
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-800">
                      {formData?.recipientName}
                    </p>
                    <p>{formData?.phone}</p>
                    <p>{formData?.address}</p>
                    <p>
                      {formData?.city}, {formData?.postalCode}
                    </p>
                    {formData?.notes && (
                      <p className="italic text-gray-500 mt-2">
                        Catatan: {formData.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Daftar Produk */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    🛒 Produk yang Dipesan
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item._id} className="flex items-center gap-4">
                        <img
                          src={
                            item.product?.image
                              ? `http://localhost:5000${item.product.image}`
                              : "/placeholder.png"
                          }
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {item.product?.name}
                          </p>
                          <p className="text-orange-600 font-semibold text-sm">
                            {formatRupiah(item.product?.price)} x{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800 text-sm">
                            {formatRupiah(item.product?.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary & Konfirmasi */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Total Pembayaran
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 pb-4 border-b border-gray-100">
                    <div className="flex justify-between">
                      <span>Subtotal ({items.length} produk)</span>
                      <span>{formatRupiah(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkos kirim</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 mt-4 mb-5">
                    <span>Total</span>
                    <span className="text-orange-600">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                  <button
                    onClick={handleConfirmOrder}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Konfirmasi Pesanan"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
