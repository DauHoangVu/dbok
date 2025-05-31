import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="admin-sidebar">
      <ul>
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/movies">Quản lý phim</Link></li>
        {/* Thêm menu khác */}
      </ul>
    </aside>
  );
};

export default Sidebar;
