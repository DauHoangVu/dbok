import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Switch,
} from "antd";
import axios from "axios";

const CinemaManagement = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8769/api/cinemas");
      setCinemas(res.data);
    } catch {
      message.error("Không tải được danh sách rạp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const onFinish = async (values) => {
    const submitData = {
      ...values,
      location: {
        address: values.address,
        city: values.city,
        district: values.district,
      },
    };

    try {
      if (editingCinema) {
        await axios.put(`http://localhost:8769/api/cinemas/${editingCinema._id}`, submitData);
        message.success("Cập nhật rạp thành công");
      } else {
        await axios.post("http://localhost:8769/api/cinemas", submitData);
        message.success("Thêm rạp mới thành công");
      }
      setOpen(false);
      form.resetFields();
      fetchCinemas();
    } catch {
      message.error("Lỗi khi lưu rạp");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8769/api/cinemas/${id}`);
      message.success("Xoá rạp thành công");
      fetchCinemas();
    } catch {
      message.error("Không thể xoá rạp");
    }
  };

  const showEditModal = (cinema) => {
    setEditingCinema(cinema);
    form.setFieldsValue({
      ...cinema,
      address: cinema.location.address,
      city: cinema.location.city,
      district: cinema.location.district,
    });
    setOpen(true);
  };

  const showCreateModal = () => {
    setEditingCinema(null);
    form.resetFields();
    setOpen(true);
  };

  const columns = [
    { title: "Tên rạp", dataIndex: "name" },
    { title: "Địa chỉ", dataIndex: ["location", "address"] },
    { title: "Thành phố", dataIndex: ["location", "city"] },
    { title: "Quận/Huyện", dataIndex: ["location", "district"] },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      render: (v) => (v ? "✅" : "❌"),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button onClick={() => showEditModal(record)} size="small">Sửa</Button>
          <Popconfirm title="Xoá rạp này?" onConfirm={() => handleDelete(record._id)}>
            <Button danger size="small">Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý rạp chiếu phim</h2>
      <Button type="primary" onClick={showCreateModal} style={{ marginBottom: 16 }}>
        Thêm rạp
      </Button>
      <Table columns={columns} dataSource={cinemas} rowKey="_id" loading={loading} />

      <Modal
        open={open}
        title={editingCinema ? "Sửa rạp" : "Thêm rạp"}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Tên rạp" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="city" label="Thành phố" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CinemaManagement;
