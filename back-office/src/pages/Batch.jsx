import React, { useEffect, useState, useMemo } from 'react';
import axios from '../lib/axios';
import { Table, Button, Popconfirm, message, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const ProductBatch = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/product-batches');
      setBatches(res.data);
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBatch = async (id) => {
    try {
      await axios.patch(`/api/product-batches/${id}/delete`);
      messageApi.open({
        type: 'success',
        content: 'ลบข้อมูลสำเร็จ',
      });
      fetchBatches();
    } catch {
      messageApi.open({
        type: 'error',
        content: 'ลบข้อมูลล้มเหลว',
      });
    }
  };

  const columns = [
    {
      title: 'รหัสล็อต',
      dataIndex: 'batchCode',
    },
    {
      title: 'ชื่อล็อต',
      dataIndex: 'batchName',
    },
    {
      title: 'จำนวนรายการทั้งหมด',
      dataIndex: 'totalProducts',
      render: (text) => <span>{parseFloat(text).toLocaleString()}</span>
    },
    {
      title: 'จำนวนสินค้าทั้งหมด',
      dataIndex: 'totalQuantity',
      render: (text) => <span>{parseFloat(text).toLocaleString()}</span>
    },
    {
      title: 'ดำเนินการ',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type='primary' onClick={() => window.open(`/batch/${record._id}/print`, '_blank')}>รายละเอียด</Button>
          <Button onClick={() => navigate(`/batch/${record._id}`)}>แก้ไข</Button>
          <Popconfirm
            title="Delete this batch?"
            onConfirm={() => deleteBatch(record._id)}
          >
            <Button danger>ลบ</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const filteredBatches = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return batches.filter(batch =>
      batch.batchCode?.toLowerCase().includes(term) ||
      batch.batchName?.toLowerCase().includes(term)
    );
  }, [batches, searchTerm]);

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div className="p-6">
      {contextHolder}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">จัดการล็อตสินค้า</h1>
        <div className="flex gap-2">
          <Search
            placeholder="ค้นหาด้วยรหัสล็อตหรือชื่อล็อต"
            onSearch={(value) => setSearchTerm(value)}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={() => navigate('/batch/create')}>
            สร้างล็อตสินค้า
          </Button>
        </div>
      </div>
      <Table
        dataSource={filteredBatches}
        columns={columns}
        rowKey="_id"
        loading={loading}
        bordered
      />
    </div>
  );
};

export default ProductBatch;
