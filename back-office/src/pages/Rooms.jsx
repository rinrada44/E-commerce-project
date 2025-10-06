import React, { useEffect, useState } from 'react';
import {
  Button,
  message,
  Modal,
  Form,
  Input,
  Table,
  Upload,
  Image,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { FaPlus } from 'react-icons/fa';
import axios from '../lib/axios';
import { roomImg } from '../lib/imagePath';
import dateFormat from '../lib/dateFormat';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/rooms');
      setRooms(data);
    } catch (error) {
      messageApi.error('มีบางอย่างผิดพลาด');
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setIsImageRemoved(false);
    setCurrentRoom(null);
    setIsEditing(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setIsImageRemoved(false);
    setCurrentRoom(null);
    setModalVisible(false);
  };

  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      messageApi.error('โปรดอัปโหลดไฟล์รูปภาพเท่านั้น!');
      return;
    }
    if (file.size / 1024 / 1024 >= 5) {
      messageApi.error('รูปภาพต้องมีขนาดไม่เกิน 5MB!');
      return;
    }
    setImageFile(file);
    setIsImageRemoved(false);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEdit = (room) => {
    if (!room?._id) {
      messageApi.error('ไม่พบข้อมูลห้องที่จะทำการแก้ไข');
      return;
    }
    form.setFieldsValue({ name: room.name });
    setCurrentRoom(room);
    setIsEditing(true);
    setImageFile(null);
    setIsImageRemoved(false);
    setImagePreview(room.fileName ? roomImg(room.fileName) : null);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    if (!values.name) {
      messageApi.error('กรุณากรอกชื่อห้อง');
      return;
    }

    const formData = new FormData();
    formData.append('name', values.name);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    if (isImageRemoved) {
      formData.append('removeImage', 'true');
    }

    setUploadLoading(true);

    try {
      if (isEditing) {
        await axios.put(`/api/rooms/${currentRoom._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        messageApi.success('อัปเดตห้องสำเร็จ');
      } else {
        await axios.post('/api/rooms', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        messageApi.success('สร้างห้องสำเร็จ');
      }

      loadRooms();
      closeModal();
    } catch (error) {
      console.error('Submit room error:', error);
      messageApi.error(error.response?.data?.message || 'มีบางอย่างผิดพลาด');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await axios.delete(`/api/rooms/${deleteTargetId}`);
      messageApi.success('ลบห้องสำเร็จ');
      loadRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      messageApi.error(error.response?.data?.message || 'ลบห้องล้มเหลว');
    } finally {
      setDeleteConfirmVisible(false);
      setDeleteTargetId(null);
    }
  };

  const columns = [
    { title: 'ชื่อห้อง', dataIndex: 'name', key: 'name' },
    {
      title: 'รูปภาพ',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (fileName) =>
        fileName ? (
          <Image
            src={roomImg(fileName)}
            alt="Room image"
            width={50}
            height={50}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          'ไม่มีรูปภาพ'
        ),
    },
    { title: 'สร้างเมื่อ', dataIndex: 'createdAt', key: 'createdAt', render: (text) => dateFormat(text) },
    { title: 'อัปเดตล่าสุด', dataIndex: 'updatedAt', key: 'updatedAt', render: (text) => dateFormat(text) },
    {
      title: 'การจัดการ',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            แก้ไข
          </Button>
          <Button
            danger
            onClick={() => {
              setDeleteTargetId(record._id);
              setDeleteConfirmVisible(true);
            }}
          >
            ลบ
          </Button>
        </>
      ),
    },
  ];

  const filteredRooms = rooms.filter((room) =>
    room.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      {contextHolder}

      <h2 className="text-2xl font-semibold mb-4">จัดการประเภทห้อง</h2>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="ค้นหาชื่อห้อง"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<FaPlus />} onClick={openCreateModal}>
          เพิ่มห้อง
        </Button>
      </div>

      <Table columns={columns} dataSource={filteredRooms} rowKey="_id" loading={loading} />

      {/* Create / Edit Modal */}
      <Modal
        title={isEditing ? 'แก้ไขห้อง' : 'เพิ่มห้อง'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="ชื่อห้อง"
            rules={[{ required: true, message: 'กรุณากรอกชื่อห้อง' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="รูปภาพห้อง">
            {imagePreview && (
              <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxHeight: 200 }}>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
                />
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setIsImageRemoved(true);
                  }}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '50%',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            )}

            <Upload
              name="image"
              showUploadList={false}
              beforeUpload={(file) => {
                handleImageChange(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>อัปโหลดรูปภาพ</Button>
            </Upload>

            <div style={{ marginTop: 8, color: '#888' }}>
              รองรับไฟล์ภาพขนาดไม่เกิน 5MB
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={uploadLoading}>
              {isEditing ? 'อัปเดต' : 'สร้าง'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="ยืนยันการลบ"
        open={deleteConfirmVisible}
        onCancel={() => setDeleteConfirmVisible(false)}
        onOk={handleDelete}
        okText="ลบ"
        okButtonProps={{ danger: true }}
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?</p>
      </Modal>
    </div>
  );
};

export default Rooms;
