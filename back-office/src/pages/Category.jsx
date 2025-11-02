import { Button, message, Modal, Form, Input, Table } from 'antd';
import axios from '../lib/axios';  // Ensure this path is correct
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import dateFormat from '../lib/dateFormat';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteCategoryId, setDeleteCategoryId] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: 'มีบางอย่างผิดพลาด',
            });
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.patch(`/api/categories/${id}`);
            messageApi.open({
                type: 'success',
                content: 'ลบข้อมูลสำเร็จ',
            });

            fetchCategories();
            setIsDeleteModalVisible(false);
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: 'ลบข้อมูลล้มเหลว',
            });
        }
    };

    const createCategory = async (values) => {
        try {
            await axios.post('/api/categories', values);
            messageApi.open({
                type: 'success',
                content: 'สร้างข้อมูลสำเร็จ',
            });

            fetchCategories();
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: 'สร้างข้อมูลล้มเหลว',
            });
        }
    };

    const updateCategory = async (values) => {
        if (editingCategory) {
            try {
                await axios.put(`/api/categories/${editingCategory._id}`, values);
                messageApi.open({
                    type: 'success',
                    content: 'แก้ไขข้อมูลสำเร็จ',
                });

                fetchCategories();
                setIsModalVisible(false);
                setEditingCategory(null);
                form.resetFields();
            } catch (error) {
                messageApi.open({
                    type: 'error',
                    content: 'แก้ไขข้อมูลล้มเหลว',
                });
            }
        }
    };

    const handleCreateOrEdit = async (values) => {
        if (isEditMode && editingCategory) {
            await updateCategory(values);
        } else {
            await createCategory(values);
        }
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setIsEditMode(true);
        form.setFieldsValue({ name: category.name, description: category.description });
        setIsModalVisible(true);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredCategories = categories.filter(
        (category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            title: 'ชื่อ',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'คำอธิบาย',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'สร้าง',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => dateFormat(text),
        },
        {
            title: 'อัพเดทล่าสุด',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (text) => dateFormat(text),
        },
        {
            title: 'ดำเนินการ',
            key: 'action',
            render: (text, record) => (
                <>
                    <Button onClick={() => openEditModal(record)} style={{ marginRight: 8 }}>
                        แก้ไข
                    </Button>
                    <Button danger onClick={() => { setDeleteCategoryId(record._id); setIsDeleteModalVisible(true); }}>
                        ลบ
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4">
            {contextHolder}
            <h2 className="text-2xl font-semibold mb-4">จัดการประเภทสินค้า</h2>
            <div className="flex justify-between items-center">
                <Input
                    placeholder="ค้นหาประเภท..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="mb-4"
                    style={{ width: 300 }}
                />

                <Button
                    type="primary"
                    icon={<FaPlus />}
                    onClick={() => {
                        setIsModalVisible(true);
                        setIsEditMode(false);
                        form.resetFields();
                    }}
                    className="mb-4"
                >
                    เพิ่ม
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredCategories}
                rowKey="_id"
                loading={loading}
            />

            {/* Modal for Creating or Editing Category */}
            <Modal
                title={isEditMode ? 'แก้ไขประเภท' : 'สร้างประเภท'}
                open={isModalVisible}  // <-- เปลี่ยนจาก visible เป็น open
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleCreateOrEdit}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="ชื่อประเภท"
                        rules={[{ required: true, message: 'กรุณากรอกชื่อประเภท!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="คำอธิบาย"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {isEditMode ? 'บันทึก' : 'สร้าง'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="ต้องการลบข้อมูลใช่หรือไม่?"
                open={isDeleteModalVisible}  // <-- เปลี่ยนจาก visible เป็น open
                onCancel={() => setIsDeleteModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
                        ยกเลิก
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        onClick={() => {
                            if (deleteCategoryId) {
                                deleteCategory(deleteCategoryId);
                            }
                        }}
                    >
                        ลบ
                    </Button>,
                ]}
            >
                <p>การลบจะไม่สามารถย้อนกลับได้</p>
            </Modal>
        </div>
    );
};

export default Category;
