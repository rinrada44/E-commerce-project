// src/components/CouponForm.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Switch, Button, Select, ConfigProvider } from "antd";
import th_TH from "antd/es/locale/th_TH"; // ภาษาไทย
import axios from "../lib/axios";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

const CouponForm = ({ open, onCancel, isEditMode, coupon, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && coupon) {
      form.setFieldsValue({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_amount: coupon.discount_amount,
        minimum_price: coupon.minimum_price,
        valid_from: dayjs(coupon.valid_from),
        valid_to: dayjs(coupon.valid_to),
        isActive: coupon.isActive,
      });
    }
  }, [isEditMode, coupon, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await axios.put(`/api/coupon/${coupon._id}`, values);
      } else {
        await axios.post("/api/coupon/", values);
      }
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider locale={th_TH}>
      <Modal
        title={isEditMode ? "แก้ไขคูปองส่วนลด" : "เพิ่มคูปองส่วนลด"}
        open={open}           // ใช้ open แทน visible
        onCancel={onCancel}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
          layout="vertical"
        >
          <Form.Item label="โค้ดคูปอง" name="code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="ประเภทส่วนลด"
            name="discount_type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="percentage">เปอร์เซ็นต์</Select.Option>
              <Select.Option value="fixed">ลดราคา(บาท)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="จำนวนส่วนลด"
            name="discount_amount"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="ราคาขั้นต่ำ"
            name="minimum_price"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>

          <div className="flex justify-between">
            <Form.Item
              label="ตั้งแต่"
              name="valid_from"
              rules={[{ required: true }]}
            >
              <DatePicker showTime format="DD/MM/YYYY HH:mm:ss" />
            </Form.Item>

            <Form.Item
              label="สิ้นสุด"
              name="valid_to"
              rules={[{ required: true }]}
            >
              <DatePicker showTime format="DD/MM/YYYY HH:mm:ss" />
            </Form.Item>
          </div>

          <Form.Item
            label="สถานะใช้งาน"
            name="isActive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? "แก้ไข" : "สร้าง"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default CouponForm;
