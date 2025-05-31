import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, message, Spin } from "antd";
import axios from "axios";

const BookingStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8769/api/bookings/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không thể lấy dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) return <Spin size="large" />;

  return (
    <div>
      <h2>Thống kê doanh thu</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Tổng doanh thu (All Time)"
              value={stats.allTime.total}
              suffix="₫"
            />
            <div>{stats.allTime.count} lượt đặt</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Tuần này"
              value={stats.thisWeek.total}
              suffix="₫"
            />
            <div>{stats.thisWeek.count} lượt đặt</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Tuần trước"
              value={stats.lastWeek.total}
              suffix="₫"
            />
            <div>{stats.lastWeek.count} lượt đặt</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BookingStats;
