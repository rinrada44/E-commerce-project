"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import ProductCard from "./ProductCard";
import { Flame } from "lucide-react";

function RecomendProduct() {
  const [recProd, setRecProd] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/products/top-product");
      setRecProd(response.data);
    } catch (e) {
      console.error(e);
      setError("โหลดสินค้าล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Card className="border-none mx-6 my-12">
      <CardHeader>
        <CardTitle>
          <div className="flex space-x-1 items-end">
            <Flame size={18} className="text-red-400 fill-red-400" />
            <p>สินค้ามาแรง</p>
          </div>
        </CardTitle>
        <CardDescription>
          <div className="bg-orange-300 h-1 w-12 mt-1" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">
            กำลังโหลดสินค้า...
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : recProd.length === 0 ? (
          <p className="text-center text-muted-foreground">
            ไม่มีสินค้าที่แนะนำในขณะนี้
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recProd.map((product, index) => (
              <ProductCard
                key={product.productId || index}
                product={product}
                imageMode="main-color"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecomendProduct;
