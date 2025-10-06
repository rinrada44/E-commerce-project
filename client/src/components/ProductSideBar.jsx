'use client'

import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

export default function ProductSidebar({
  r,
  c,
  categories,
  rooms,
  selectedCategories,
  setSelectedCategories,
  selectedRooms,
  setSelectedRooms,
  priceRange,
  setPriceRange,
}) {
  const [mode, setMode] = useState('all')

  useEffect(() => {
    if (r) setMode('room')
    else if (c) setMode('category')
    else setMode('all')
  }, [r, c])

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleRoomChange = (room) => {
    setSelectedRooms((prev) =>
      prev.includes(room)
        ? prev.filter((id) => id !== room)
        : [...prev, room]
    )
  }

  const handlePriceChange = (value) => {
    setPriceRange(value)
  }

  return (
    <aside className="w-auto lg:w-72 my-6 lg:my-12 px-4 py-0 lg:py-4 rounded-2xl shadow-sm bg-white space-y-8">

      {mode !== 'category' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">ประเภท</h2>
          <div className="flex flex-col space-y-2">
            {categories.map((category) => (
              <div key={category._id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.name}
                  checked={selectedCategories.includes(category._id)}
                  onCheckedChange={() => handleCategoryChange(category._id)}
                />
                <Label htmlFor={category.name} className="capitalize">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode !== 'room' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">ห้อง</h2>
          <div className="flex flex-col space-y-2">
            {rooms.map((room) => (
              <div key={room?._id} className="flex items-center space-x-2">
                <Checkbox
                  id={`room-${room?.name}`}
                  checked={selectedRooms.includes(room?._id)}
                  onCheckedChange={() => handleRoomChange(room?._id)}
                />
                <Label htmlFor={`room-${room?.name}`} className="capitalize">
                  {room?.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
  <h2 className="text-lg font-semibold mb-4">ราคา</h2>
  <div className="flex flex-col space-y-4">
    {/* Min Price Slider */}
    <div>
      <Label htmlFor="min-price" className="text-sm text-gray-700 mb-1 block">ราคาต่ำสุด</Label>
      <Slider
        id="min-price"
        value={[priceRange[0]]}
        onValueChange={([newMin]) => {
          if (newMin <= priceRange[1]) {
            setPriceRange([newMin, priceRange[1]]);
          }
        }}
        min={10}
        max={7000}
        step={10}
      />
      <span className="text-sm text-gray-600 mt-1 block">{priceRange[0]} ฿</span>
    </div>

    {/* Max Price Slider */}
    <div>
      <Label htmlFor="max-price" className="text-sm text-gray-700 mb-1 block">ราคาสูงสุด</Label>
      <Slider
        id="max-price"
        value={[priceRange[1]]}
        onValueChange={([newMax]) => {
          if (newMax >= priceRange[0]) {
            setPriceRange([priceRange[0], newMax]);
          }
        }}
        min={10000}
        max={20000}
        step={10}
      />
      <span className="text-sm text-gray-600 mt-1 block">{priceRange[1]} ฿</span>
    </div>
  </div>
</div>

    </aside>
  )
}
