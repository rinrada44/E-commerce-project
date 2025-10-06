"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import toPrice from "@/lib/toPrice";
import getToken from "@/hooks/getToken";
import axios from "@/lib/axios";
import { jwtDecode } from "jwt-decode";
import { ChevronRightIcon, Info, Trash2 } from "lucide-react";
import { mainColorImg } from "@/lib/imagePath";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { loadStripe } from "@stripe/stripe-js";
import { DialogDescription } from "@radix-ui/react-dialog";
import { CouponCard } from "./CouponCard";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
const stripePromise = loadStripe(
  "pk_test_51RBwxJQhacNswncvzTsJ6EGC7QktpWuigrk7Vk2WXrQsY4tXjHlI7wljx2MrafZmBiv8zz6E9Wue5tEvU82bTmCC002AOEDYol"
);

const PaymentMethodList = [
  {
    id: "promptpay",
    name: "QR Promptpay",
    logo: "/thaiqr.jpg",
    desc: "ชำระเงินด้วย QR Payment รองรับทุกธนาคารในไทย",
    feeRate: 0.0165,
    fixedFee: 0,
  },
  {
    id: "card",
    name: "บัตรเครดิต/เดบิต",
    logo: "/credit-card.png",
    desc: "รองรับเฉพาะ VISA และ MasterCard",
    feeRate: 0.0365,
    fixedFee: 0.1,
  },
];

const CartPage = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const cartCount = useCartStore((state) => state.count);
  const fetchCartCount = useCartStore((state) => state.fetchCart);
  const setCount = useCartStore((state) => state.setCount);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    PaymentMethodList[0]
  );
  const [userId, setUserId] = useState(null);
  const [validCoupon, setValidCoupon] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState({});
  const itemsPerPage = 4;

  const token = getToken();

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      fetchCart(decoded.id);
      fetchAddress(decoded.id);
      setUserId(decoded.id);
    }
  }, [token]);

  useEffect(() => {
    if (cartData?.items?.length) {
      fetchCoupons(getSubtotal());
    }
  }, [cartData?.items]);

  const fetchCart = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/cart/${userId}`);
      setCartData(res.data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchAddress = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/address?userId=${userId}`);
      setAddresses(res.data);
      setSelectedAddress(res.data[0]);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productColorId, newQty) => {
    try {
      await axios.put(`/api/cart/update`, {
        productColorId,
        quantity: newQty,
        userId: jwtDecode(token).id,
      });
      fetchCart(jwtDecode(token).id);
      fetchCoupons()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productColorId) => {
    try {
      const res = await axios.delete(`/api/cart/remove`, {
        data: { productColorId, userId: jwtDecode(token).id },
      });
      const stored = localStorage.getItem("cartCount");
      if (stored) {
        const count = parseInt(stored, 10) - 1;
        localStorage.setItem("cartCount", count);
        useCartStore.getState().setCount(count);
      }
      fetchCart(jwtDecode(token).id);
      fetchCoupons()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove item");
    }
  };

  const beforeDiscount = () => {
    return cartData?.items?.reduce((sum, item) => sum + item.total, 0) || 0;
  }

  const getSubtotal = () => {
    const full_price = beforeDiscount();
    const discount = getDiscount();
    return full_price - discount;
  };

  const getDiscount = () => {
    const subTotal = beforeDiscount();
    const couponType = selectedCoupon.discount_type;
    let discount = 0;

    switch (couponType) {
      case "percentage":
        discount = subTotal * (selectedCoupon.discount_amount / 100);
        break; // <== Missing in your original code
      case "fixed":
        discount = selectedCoupon.discount_amount;
        break;
      default:
        discount = 0;
        break;
    }

    return discount; // <== Also missing in your original code
  };



  const paymentFee = () => {
    const subtotal = getSubtotal();
    const method = selectedPaymentMethod;
    if (!method) return 0;

    const rate = method.feeRate || 0;
    const fixed = method.fixedFee || 0;
    return Math.ceil(subtotal * rate + fixed);
  };
  const grandTotal = getSubtotal() + paymentFee();

  const paginatedItems = cartData?.items?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil((cartData?.items?.length || 0) / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleCheckout = async () => {
    if (!selectedAddress || !selectedPaymentMethod) {
      toast.error("กรุณาเลือกที่อยู่และช่องทางการชำระเงิน");
      return;
    }
    const payload = {
      cartId: cartData.cart._id,
      cart: cartData?.items?.map((item) => ({
        productId: item.productId._id,
        productColorId: item.productColorId._id,
        productName: item.productId.name + " " + item.productColorId.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      addressId: selectedAddress._id,
      paymentMethod: selectedPaymentMethod.id,
      subtotal: getSubtotal(),
      paymentFee: paymentFee(),
      isDiscount: selectedCoupon ? true : false,
      discount_amount: getDiscount(),
      couponId: selectedCoupon._id,
      userId,
    };

    try {
      // Create a Checkout Session on the server
      const res = await axios.post("/api/orders/checkout", payload);

      if (res.data?.id) {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: res.data.id });
      } else {
        toast.error("Failed to create Stripe Checkout session");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during checkout");
    }
  };

  const fetchCoupons = async (subtotal) => {
    try {

      // Skip fetch if subtotal is 0 or cart is not ready
      if (subtotal === 0 || !cartData?.items?.length) {
        setValidCoupon([]);
        setSelectedCoupon({});
        return;
      }

      const response = await axios.get(`/api/coupon/user?total=${subtotal}`);
      const coupons = response.data;

      setValidCoupon(coupons);
      setSelectedCoupon(coupons[0] || {});
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      setValidCoupon([]);
      setSelectedCoupon({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12">
      <h1 className="text-4xl font-bold mb-10">ตะกร้า</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ScrollArea className="h-auto pr-4">
            <div className="space-y-6">
              {loading ? (
                // Skeleton Loading
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center p-4 gap-4 border border-gray-200 shadow-sm"
                  >
                    <Skeleton className="w-24 h-24 rounded-md" />
                    <div className="flex flex-col justify-between w-full gap-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                      <div className="flex justify-between mt-4">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                ))
              ) : paginatedItems?.length > 0 ? (
                paginatedItems.map((item) => {
                  const { productId, productColorId, quantity } = item;
                  return (
                    <div
                      key={item._id}
                      className="flex items-center p-4 gap-4 border border-gray-200 shadow-sm"
                    >
                      <img
                        src={mainColorImg(
                          productId._id,
                          productColorId.main_img
                        )}
                        alt={productId.name}
                        className="w-16 h-16 lg:w-24 lg:h-24 object-cover rounded-md"
                      />
                      <div className="flex flex-col justify-between w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="font-semibold text-sm lg:textbase">
                              {productId.name}
                            </h2>
                            <p className="text-xs lg:text-sm text-gray-500 mt-1">
                              Color: {productColorId.name}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              SKU: {productId.sku}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleRemoveItem(productColorId._id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>

                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleQuantityChange(
                                  productColorId._id,
                                  Math.max(1, quantity - 1)
                                )
                              }
                            >
                              -
                            </Button>
                            <span className="w-6 text-center">{quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleQuantityChange(
                                  productColorId._id,
                                  quantity + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                          <p className="font-semibold text-base">
                            {toPrice(item.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>ไม่พบสินค้าในตะกร้า</AlertTitle>
                  <AlertDescription>
                    <span>
                      ไปเพิ่มสินค้าเข้าตะกร้า <Link className="text-blue-500 hover:underline" href="/shop">ร้านค้า</Link>
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </ScrollArea>

          {!loading && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white h-fit border border-gray-300 p-6 shadow-md rounded space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold whitespace-nowrap">
                    ที่อยู่จัดส่ง
                  </span>
                  <div className="flex-grow h-px bg-gray-300"></div>
                </div>
                <Dialog
                  open={addressModalOpen}
                  onOpenChange={setAddressModalOpen}
                >
                  <DialogTrigger asChild>
                    <div className="border border-gray-200 rounded p-2 cursor-pointer">
                      {selectedAddress ? (
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <p className="font-medium">
                              {selectedAddress.fullname}
                            </p>
                            <p className="text-xs text-gray-600">
                              {selectedAddress.address} {selectedAddress.tambon}{" "}
                              {selectedAddress.amphure}
                            </p>
                          </div>
                          <ChevronRightIcon />
                        </div>
                      ) : (
                        "เลือกที่อยู่จัดส่ง"
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>เลือกที่อยู่จัดส่ง</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {addresses.length > 0 ? (
                        addresses.map((addr) => (
                          <Card
                            key={addr._id}
                            className={`p-4 cursor-pointer border ${selectedAddress?._id === addr._id ? "border-blue-500" : ""
                              }`}
                            onClick={() => {
                              setSelectedAddress(addr);
                              setAddressModalOpen(false);
                            }}
                          >
                            <div className="flex flex-col gap-2">
                              <p className="font-medium">
                                {addr.fullname} ({addr.phone})
                              </p>
                              <p className="text-sm text-gray-600">
                                {addr.address} {addr.tambon} {addr.amphure}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addr.province} {addr.zip_code}
                              </p>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>ไม่พบที่อยู่จัดส่ง</AlertTitle>
                          <AlertDescription>
                            <span>
                              เพิ่มที่อยู่จัดส่งเพื่อสั่งซื้อ&nbsp;
                              <Link href="/account/addresses" className="text-blue-500 hover:underline">
                                จัดการที่อยู่
                              </Link>
                            </span>
                          </AlertDescription>
                        </Alert>
                      )}

                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* สรุปออเดอร์ */}

              <div className="flex items-center gap-4">
                <span className="text-xl font-bold whitespace-nowrap">
                  สรุปออเดอร์
                </span>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>ราคารวม</span>
                <span>{toPrice(beforeDiscount()) || 0 + " ฿"}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>ส่วนลด</span>
                <span>- {toPrice(getDiscount()) || 0 + " ฿"}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>ค่าธรรมเนียมการชำระเงิน</span>
                <span>{toPrice(paymentFee()) || 0 + " ฿"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>รวมทั้งสิ้น</span>
                <span>{toPrice(grandTotal) || 0 + " ฿"}</span>
              </div>

              {/* ส่วนลด */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold whitespace-nowrap">
                    ส่วนลดที่ใช้ได้
                  </span>
                  <div className="flex-grow h-px bg-gray-300"></div>
                </div>
                <CouponCard
                  setSelectedCoupon={setSelectedCoupon}
                  selectedCoupon={selectedCoupon}
                  coupon={validCoupon}
                />
              </div>

              {/* ชำระเงิน */}

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold whitespace-nowrap">
                    ช่องทางชำระเงิน
                  </span>
                  <div className="flex-grow h-px bg-gray-300"></div>
                </div>
                <Dialog
                  open={paymentModalOpen}
                  onOpenChange={setPaymentModalOpen}
                >
                  <DialogTrigger asChild>
                    <div className="border border-gray-200 rounded p-2 cursor-pointer">
                      {selectedPaymentMethod ? (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <img
                              src={
                                selectedPaymentMethod.logo ||
                                "/default-logo.png"
                              }
                              alt={selectedPaymentMethod.name}
                              className="w-auto h-8 mr-4"
                            />
                            <span className="capitalize">
                              {selectedPaymentMethod.name}
                            </span>
                          </div>
                          <ChevronRightIcon />
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          เลือกช่องทางชำระเงิน
                        </span>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>เลือกช่องทางชำระเงิน</DialogTitle>
                      <DialogDescription className="text-sm text-gray-700">
                        ช่องทางชำระเงินมีผลต่อค่าธรรมเนียม
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {PaymentMethodList.map((method) => (
                        <Card
                          key={method.id}
                          className={`p-4 cursor-pointer border ${selectedPaymentMethod?.id === method.id
                            ? "border-blue-500"
                            : ""
                            }`}
                          onClick={() => {
                            setSelectedPaymentMethod(method);
                            setPaymentModalOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <img
                              src={method.logo || "/default-logo.png"}
                              alt={method.name}
                              className="w-8 mr-4"
                            />
                            <div>
                              <p className="font-medium capitalize">
                                {method.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {method.desc}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Button className="w-full text-lg py-6" onClick={handleCheckout}>
                ชำระเงิน
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
