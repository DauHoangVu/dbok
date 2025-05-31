// src/layouts/AdminLayout.jsx
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  VideoCameraOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
       
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: "/admin",
              icon: <DashboardOutlined />,
              label: <Link to="/admin">Dashboard</Link>,
            },
            {
              key: "/admin/movies",
              icon: <VideoCameraOutlined />,
              label: <Link to="/admin/movies">Quản lý phim</Link>,
            },
            {
              key: "/admin/cinema",
              icon: <UserOutlined />,
              label: <Link to="/admin/cinema">Quản lý cinema</Link>,
            },
            {
              key: "/admin/analytic",
              icon: <UserOutlined />,
              label: <Link to="/admin/analytic">Quản lý thống kê</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 0 }} />
        <Content style={{ margin: "24px 16px", padding: 24, background: "#fff" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
