import { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, message, Space,
  Popconfirm, Switch, InputNumber, DatePicker, Select
} from "antd";
import axios from "axios";
import dayjs from "dayjs";

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8769/api/movies");
      setMovies(res.data);
    } catch {
      message.error("Lỗi khi tải danh sách phim");
    } finally {
      setLoading(false);
    }
  };

  const fetchCinemas = async () => {
    try {
      const res = await axios.get("http://localhost:8769/api/cinemas");
      setCinemas(res.data);
    } catch {
      message.error("Không thể lấy danh sách rạp");
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchCinemas();
  }, []);

  // Effect để fill dữ liệu khi edit
  useEffect(() => {
    if (editingMovie && open) {
      const formData = {
        ...editingMovie,
        genre: Array.isArray(editingMovie.genre) ? editingMovie.genre.join(", ") : (editingMovie.genre || ""),
        cast: Array.isArray(editingMovie.cast) ? editingMovie.cast.join(", ") : (editingMovie.cast || ""),
        releaseDate: editingMovie.releaseDate ? dayjs(editingMovie.releaseDate) : null,
        showtimes: editingMovie.showtimes ? editingMovie.showtimes.map(st => ({
          cinema: st.cinema?._id || st.cinema,
          date: st.date ? dayjs(st.date) : null,
          times: Array.isArray(st.times) ? st.times.join(", ") : (st.times || ""),
        })) : []
      };
      
      console.log("Setting form data via useEffect:", formData);
      form.setFieldsValue(formData);
    }
  }, [editingMovie, open, form]);

  const onFinish = async (values) => {
    console.log("Form values:", values); // Debug log
    
    try {
      const payload = {
        ...values,
        genre: typeof values.genre === "string" 
          ? values.genre.split(",").map(x => x.trim()).filter(x => x) 
          : (Array.isArray(values.genre) ? values.genre : []),
        cast: typeof values.cast === "string" 
          ? values.cast.split(",").map(x => x.trim()).filter(x => x) 
          : (Array.isArray(values.cast) ? values.cast : []),
        releaseDate: values.releaseDate ? dayjs(values.releaseDate).toISOString() : null,
        showtimes: values.showtimes ? values.showtimes.map((s) => ({
          cinema: s.cinema,
          date: s.date ? dayjs(s.date).toISOString() : null,
          times: typeof s.times === "string" 
            ? s.times.split(",").map(x => x.trim()).filter(x => x)
            : (Array.isArray(s.times) ? s.times : []),
        })) : [],
      };

      console.log("Payload to send:", payload); // Debug log

      if (editingMovie) {
        await axios.put(`http://localhost:8769/api/movies/${editingMovie._id}`, payload);
        message.success("Cập nhật phim thành công");
      } else {
        await axios.post("http://localhost:8769/api/movies", payload);
        message.success("Thêm phim mới thành công");
      }
      
      setOpen(false);
      setEditingMovie(null);
      form.resetFields();
      fetchMovies();
    } catch (error) {
      console.error("Error saving movie:", error);
      message.error("Lỗi khi lưu phim");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8769/api/movies/${id}`);
      message.success("Xoá phim thành công");
      fetchMovies();
    } catch {
      message.error("Không xoá được phim");
    }
  };

  const showEditModal = (movie) => {
    setEditingMovie(movie);
    setOpen(true);
  };

  const showCreateModal = () => {
    setEditingMovie(null);
    form.resetFields();
    setOpen(true);
  };

  const handleModalCancel = () => {
    setOpen(false);
    setTimeout(() => {
      setEditingMovie(null);
      form.resetFields();
    }, 200);
  };

  const columns = [
    { title: "Tên phim", dataIndex: "title" },
    { title: "Đạo diễn", dataIndex: "director" },
    { 
      title: "Thể loại", 
      dataIndex: "genre", 
      render: g => Array.isArray(g) ? g.join(", ") : g || ""
    },
    { 
      title: "Đang chiếu", 
      dataIndex: "isShowing", 
      render: v => (v ? "✅" : "❌") 
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button onClick={() => showEditModal(record)} size="small">Sửa</Button>
          <Popconfirm 
            title="Xoá phim này?" 
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger size="small">Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý phim</h2>
      <Button type="primary" onClick={showCreateModal} style={{ marginBottom: 16 }}>
        Thêm phim
      </Button>
      <Table 
        columns={columns} 
        dataSource={movies} 
        rowKey="_id" 
        loading={loading} 
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={editingMovie ? "Sửa phim" : "Thêm phim"}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Huỷ"
        width={800}
        destroyOnClose={false}
        forceRender={true}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          preserve={true}
          initialValues={{
            isShowing: false,
            rating: 0,
            showtimes: []
          }}
        >
          <Form.Item
            name="title"
            label="Tên phim"
            rules={[{ required: true, message: 'Không được để trống tên phim' }]}
          >
            <Input placeholder="Nhập tên phim" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả phim" />
          </Form.Item>

          <Form.Item name="duration" label="Thời lượng (phút)">
            <InputNumber 
              min={1} 
              max={500}
              style={{ width: "100%" }} 
              placeholder="Nhập thời lượng"
            />
          </Form.Item>

          <Form.Item name="releaseDate" label="Ngày phát hành">
            <DatePicker 
              format="DD/MM/YYYY" 
              style={{ width: "100%" }}
              placeholder="Chọn ngày phát hành"
            />
          </Form.Item>

          <Form.Item name="posterUrl" label="Poster URL">
            <Input placeholder="Nhập URL poster" />
          </Form.Item>

          <Form.Item name="trailerUrl" label="Trailer URL">
            <Input placeholder="Nhập URL trailer" />
          </Form.Item>

          <Form.Item 
            name="genre" 
            label="Thể loại (cách nhau bởi dấu phẩy)"
          >
            <Input placeholder="Ví dụ: Hành động, Phiêu lưu, Khoa học viễn tưởng" />
          </Form.Item>

          <Form.Item name="director" label="Đạo diễn">
            <Input placeholder="Nhập tên đạo diễn" />
          </Form.Item>

          <Form.Item 
            name="cast" 
            label="Diễn viên (cách nhau bởi dấu phẩy)"
          >
            <Input placeholder="Ví dụ: Tom Cruise, Robert Downey Jr." />
          </Form.Item>

          <Form.Item name="rating" label="Đánh giá (0-5)">
            <InputNumber 
              min={0} 
              max={5} 
              step={0.1} 
              style={{ width: "100%" }}
              placeholder="Nhập điểm đánh giá"
            />
          </Form.Item>

          <Form.Item name="isShowing" label="Đang chiếu" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.List name="showtimes">
            {(fields, { add, remove }) => (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>Suất chiếu</h3>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 6, 
                    padding: 16, 
                    marginBottom: 16,
                    backgroundColor: '#fafafa'
                  }}>
                    <Space style={{ width: '100%' }} direction="vertical">
                      <Space style={{ width: '100%' }} wrap>
                        <Form.Item
                          {...restField}
                          name={[name, "cinema"]}
                          label="Rạp chiếu"
                          rules={[{ required: true, message: 'Vui lòng chọn rạp' }]}
                          style={{ marginBottom: 0, minWidth: 200 }}
                        >
                          <Select
                            placeholder="Chọn rạp"
                            style={{ width: 200 }}
                            showSearch
                            optionFilterProp="children"
                          >
                            {cinemas.map((c) => (
                              <Select.Option key={c._id} value={c._id}>
                                {c.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "date"]}
                          label="Ngày chiếu"
                          rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                          style={{ marginBottom: 0, minWidth: 150 }}
                        >
                          <DatePicker 
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày"
                          />
                        </Form.Item>

                        <Button 
                          danger 
                          type="link" 
                          onClick={() => remove(name)}
                          style={{ alignSelf: 'flex-end' }}
                        >
                          Xoá suất chiếu
                        </Button>
                      </Space>

                      <Form.Item
                        {...restField}
                        name={[name, "times"]}
                        label="Giờ chiếu (cách nhau bởi dấu phẩy)"
                        rules={[{ required: true, message: 'Vui lòng nhập giờ chiếu' }]}
                        style={{ marginBottom: 0, width: '100%' }}
                      >
                        <Input 
                          placeholder="Ví dụ: 14:00, 16:30, 19:00, 21:30"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Space>
                  </div>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block
                    style={{ marginTop: 16 }}
                  >
                    + Thêm suất chiếu
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default MovieManagement;