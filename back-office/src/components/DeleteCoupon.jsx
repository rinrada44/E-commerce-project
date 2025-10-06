// src/components/DeleteCoupon.js
import React from "react";
import { Modal } from "antd";

const DeleteCoupon = ({ open, onConfirm, onCancel }) => {
  return (
    <Modal
      title="ลบคูปอง"
      open={open}           // เปลี่ยนจาก visible เป็น open
      onOk={onConfirm}
      onCancel={onCancel}
      okText="ลบ"
      cancelText="ยกเลิก"
      centered
    >
      <p>คุณแน่ใจว่าต้องการลบคูปองนี้หรือไม่?</p>
    </Modal>
  );
};

export default DeleteCoupon;
