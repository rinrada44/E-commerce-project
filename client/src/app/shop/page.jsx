"use client"; // ทำให้เป็น client component ชัดเจน

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import ShopProduct from "@/components/ShopProduct";
import { Filter, Loader } from "lucide-react";
import MainLayout from "@/components/layout/main";
import ProductSidebar from "@/components/ProductSideBar";
import Link from "next/link";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

function ShopContent() {
  const searchParams = useSearchParams();
  const r = searchParams.get("r");
  const c = searchParams.get("c");

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [room, setRoom] = useState(null);
  const [roomFilter, setRoomFilter] = useState([]);
  const [category, setCategory] = useState(null);
  const [catFilter, setCatFilter] = useState([]);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("ทั้งหมด");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [priceRange, setPriceRange] = useState([10, 20000]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = "/api/products";
      if (r) url += `?r=${r}`;
      else if (c) url += `?c=${c}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (e) {
      console.error(e);
      setError("โหลดสินค้าล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoom = async () => {
    if (r) {
      try {
        const response = await axios.get(`/api/rooms/${r}`);
        setRoom(response.data);
        setTitle(response.data.name);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const fetchRoomFilter = async () => {
    try {
      const response = await axios.get(`/api/rooms`);
      setRoomFilter(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategory = async () => {
    if (c) {
      try {
        const response = await axios.get(`/api/categories/${c}`);
        setCategory(response.data);
        setTitle(response.data.name);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const fetchCatFilter = async () => {
    try {
      const response = await axios.get(`/api/categories`);
      setCatFilter(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const inCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.categoryId._id);
      const inRoom =
        selectedRooms.length === 0 ||
        selectedRooms.includes(product.roomId._id);
      const inPriceRange =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return inCategory && inRoom && inPriceRange;
    });
  }, [products, selectedCategories, selectedRooms, priceRange]);

  useEffect(() => {
    fetchProducts();
    fetchCategory();
    fetchRoom();
    if (c) fetchRoomFilter();
    if (r) fetchCatFilter();
    if (!r && !c) {
      fetchRoomFilter();
      fetchCatFilter();
    }
  }, [r, c]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="animate-spin w-12 h-12 text-orange-500" />
      </div>
    );
  }

  if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row space-x-0 lg:space-x-4 bg-slate-100 px-4">
        <div className="flex lg:hidden justify-end">
          <Drawer direction="left">
            <DrawerTrigger>
              <Link
                href="#"
                className={buttonVariants({ size: "icon" })}
              >
                <Filter />
              </Link>
            </DrawerTrigger>
            <DrawerContent>
              <ScrollArea className="h-screen">
                <ProductSidebar
                  r={r}
                  c={c}
                  categories={catFilter}
                  rooms={roomFilter}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedRooms={selectedRooms}
                  setSelectedRooms={setSelectedRooms}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
                <DrawerFooter>
                  <DrawerClose>
                    <Button variant="default" className="w-full">
                      ตกลง
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </div>
        <ShopProduct products={filteredProducts} shopTitle={title} />
        <div className="hidden lg:block">
          <ProductSidebar
            r={r}
            c={c}
            categories={catFilter}
            rooms={roomFilter}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedRooms={selectedRooms}
            setSelectedRooms={setSelectedRooms}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
