"use client";

import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FAQDialog from "./FaqDialog";

export default function Footer() {
  return (
    <footer className="bg-white text-black px-6 py-8 mt-20 border-t border-orange-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={150} height={40} />
          </Link>
         
          <p className="text-sm mt-4">
            89 ถ.พิทักษ์ประชา
          </p>
          <p className="text-sm">
            ต.เขาสวนกวาง อ.เขาสวนกวาง
          </p>
          <p className="text-sm mb-2">
            จ.ขอนแก่น 40280
          </p>
          

          <div className="flex space-x-2 text-blue-500">
            <Link href="tel:+66933536177" className="text-sm hover:underline">
              โทร.0933536177
            </Link>

            <Link href="tel:+66803257699" className="text-sm hover:underline">
              โทร.0803257699
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-semibold text-black mb-4">เมนูลัด</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:underline">
                ร้านค้า
              </Link>
            </li>
            <li>
              <Link href="https://www.facebook.com/suppexr.yin.s.2025/?rdid=sYW0NPF2cgoS3Mqv" className="hover:underline">
                ติดต่อเรา
              </Link>
            </li>
            <li>
              <FAQDialog />
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-semibold text-black mb-4">ช่องทางติดตาม</h4>
          <div className="flex space-x-4">
            <Link href="https://www.facebook.com/suppexr.yin.s.2025/?rdid=sYW0NPF2cgoS3Mqv" className={buttonVariants({ variant: "outline", size: "icon" })}>
              <Facebook size={24} className="hover:text-black" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-between text-sm border-t border-gray-800 pt-6">
        <p>&copy; {new Date().getFullYear()} Super Jeans Furniture. All rights reserved.</p>
        <div className="flex space-x-1">
          <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
          <p>|</p>
          <Link href="/terms">เงื่อนไขการให้บริการ</Link>
          <p>|</p>
          <Link href="/cookie">นโยบายคุกกี้</Link>
        </div>
      </div>
    </footer>
  );
}
