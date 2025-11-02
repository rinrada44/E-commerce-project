"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  ShoppingCart,
  UserCircle,
  Menu,
  X,
  LogOut,
  Truck,
  MapPinCheck,
  DollarSign,
  Star,
  Lock,
  Store,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import axios from "@/lib/axios";
import getToken from "@/hooks/getToken";
import { jwtDecode } from "jwt-decode";
import SearchProduct from "@/components/SearchProduct";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { useCartStore } from "@/store/useCartStore";

export default function Topbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [mounted, setMounted] = useState(false); // สำหรับ client-side render
  const token = getToken();
  const cartCount = useCartStore((state) => state.count);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const setCount = useCartStore((state) => state.setCount);

  useEffect(() => {
    setMounted(true); // เปิด render ฝั่ง client
  }, []);

  useEffect(() => {
    if (token) {
      const decode = jwtDecode(token);
      const stored = localStorage.getItem("cartCount");
      if (stored) setCount(parseInt(stored, 10));
      setUserData(decode);
      setIsLoggedIn(true);
    }
  }, [token, fetchCart, setCount]);

  function getInitialsFromEmail(email) {
    if (!email) return "??";
    const namePart = email.split("@")[0];
    const parts = namePart.split(/[._\-]/); // split by ., _, -
    const initials = parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
    return initials || namePart[0]?.toUpperCase() || "??";
  }

  if (!mounted) return null; // ป้องกัน hydration mismatch

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="relative w-32 h-10">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            sizes="128px"
            className="object-contain"
            priority // <-- ใส่ตรงนี้
          />

        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 justify-center px-6">
          <SearchProduct />
        </div>

        {/* Desktop Icons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/cart" className={buttonVariants({ variant: "outline" })}>
            <div className="flex gap-2 items-center">
              <ShoppingCart className="w-5 h-5" />
              <Badge>{cartCount > 9 ? "9+" : cartCount}</Badge>
            </div>
          </Link>
          <Link
            href="/wishlist"
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <Heart className="w-5 h-5" />
          </Link>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <UserCircle className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="py-2 border-b border-gray-300">
                  <Link href="/account/addresses" className="flex space-x-2">
                    <MapPinCheck />
                    <span>ที่อยู่ของฉัน</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 border-b border-gray-300">
                  <Link href="/account/orders" className="flex space-x-2">
                    <Truck />
                    <span>ออเดอร์ของฉัน</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 border-b border-gray-300">
                  <Link href="/account/payments" className="flex space-x-2">
                    <DollarSign />
                    <span>ประวัติการชำระเงิน</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 border-b border-gray-300">
                  <Link href="/account/review" className="flex space-x-2">
                    <Star />
                    <span>รีวิวสินค้า</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 border-b border-gray-300">
                  <Link href="/account/change-password" className="flex space-x-2">
                    <Lock />
                    <span>ตั้งค่ารหัสผ่าน</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <Link href="/signout" className="flex space-x-2">
                    <LogOut />
                    <span>ออกจากระบบ</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/signin"
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <UserCircle className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Mobile Drawer Trigger */}
        <div className="lg:hidden">
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <ScrollArea className="h-screen">
                <DrawerHeader className="border-b bg-orange-500 text-white">
                  <div className="flex items-center justify-between w-full">
                    <DrawerTitle>Super Jeans furniture</DrawerTitle>
                    <DrawerClose asChild>
                      <Button variant="outline">
                        <X />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>

                <div className="p-2 space-y-4">
                  {isLoggedIn && userData ? (
                    <div className="flex items-center gap-4 m-2 border border-gray-200 rounded p-4">
                      <Avatar>
                        <AvatarFallback>
                          {getInitialsFromEmail(userData.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-gray-700 mt-2 block">
                          {userData.email}
                        </span>
                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <span>สถานะ:</span>
                          <Badge
                            variant={
                              userData.isVerified ? "default" : "destructive"
                            }
                          >
                            {userData.isVerified ? "ปกติ" : "รอการยืนยัน"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Navigation Icons */}
                  <div className="flex flex-col gap-2 mt-8">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold whitespace-nowrap">
                        เมนูทั่วไป
                      </span>
                      <div className="flex-grow h-px bg-gray-300"></div>
                    </div>

                    <Link
                      href="/shop"
                      className="flex space-x-4 items-center py-4 px-2 border-b border-gray-300"
                    >
                      <Store />
                      <span>สินค้าทั้งหมด</span>
                    </Link>

                    <Link
                      href="/cart"
                      className="flex space-x-4 items-center py-4 px-2 border-b border-gray-300"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>ตะกร้าสินค้า</span>
                      <Badge>{cartCount > 9 ? "9+" : cartCount}</Badge>
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex space-x-4 items-center py-4 px-2"
                    >
                      <Heart />
                      <span>รายการที่ถูกใจ</span>
                    </Link>
                  </div>

                  {/* Auth Links */}
                  <div className="flex flex-col space-y-2">
                    {isLoggedIn ? (
                      <>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold whitespace-nowrap">
                            เมนูผู้ใช้
                          </span>
                          <div className="flex-grow h-px bg-gray-300"></div>
                        </div>
                        <Link
                          href="/account/addresses"
                          className="flex space-x-4 items-center py-4 px-2 border-b border-gray-300"
                        >
                          <MapPinCheck />
                          <span>ที่อยู่ของฉัน</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex space-x-4 items-center py-4 px-2 border-b border-gray-300"
                        >
                          <Truck />
                          <span>ออเดอร์ของฉัน</span>
                        </Link>
                        <Link
                          href="/account/payments"
                          className="flex space-x-4 items-center py-4 px-2 border-b border-gray-300"
                        >
                          <DollarSign />
                          <span>ประวัติการชำระเงิน</span>
                        </Link>
                        <Link
                          href="/account/review"
                          className="flex space-x-4 items-center py-4 px-2 border-b border-gray-300"
                        >
                          <Star />
                          <span>รีวิวสินค้า</span>
                        </Link>
                        <Link
                          href="/account/change-password"
                          className="flex space-x-4 items-center py-4 px-2 border-b border-gray-300"
                        >
                          <Lock />
                          <span>ตั้งค่ารหัสผ่าน</span>
                        </Link>
                        <Link
                          href="/signout"
                          className={`mt-8 ${buttonVariants({
                            variant: "default",
                          })}`}
                        >
                          <LogOut /> ออกจากระบบ
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/signin"
                        className={buttonVariants({ variant: "default" })}
                      >
                        เข้าสู่ระบบ
                      </Link>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
