"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

function NavBar() {
  const [cat, setCat] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCategory = async () => {
    try {
      const res = await axios.get("/api/categories");
      setCat(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <div className="hidden lg:flex justify-center gap-8 py-4 text-black text-sm bg-orange-100">
      {loading ? (
        // Show skeletons during loading
        <>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-10" />
        </>
      ) : (
        <>
          <Link href="/shop">สินค้าทั้งหมด</Link>
          {cat.slice(0, 3).map((item) => (
          <Link key={item._id} href={`/shop?c=${item._id}`}>
            {item.name}
          </Link>
          ))}
          <Link href="https://www.facebook.com/suppexr.yin.s.2025/?rdid=sYW0NPF2cgoS3Mqv">ติดต่อเรา</Link>
        </>
      )}
    </div>
  );
}

export default NavBar;
