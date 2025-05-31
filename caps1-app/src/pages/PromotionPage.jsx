import React, { useEffect, useState } from "react";
import "../styles/Promotion.css"
import { getPromotions } from "../services/api";

const PromotionPage = () => {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await getPromotions();
        setPromotions(data.data || data); // fallback nếu data có hoặc không bọc trong { data }
      } catch (err) {
        console.error("Lỗi khi load khuyến mãi:", err);
      }
    };

    fetchPromotions();
  }, []);

  return (
    <div className="promotions-page">
      <h2>🎁 Các chương trình khuyến mãi</h2>
      <div className="promotion-list">
        {promotions.map((promo) => (
          <div key={promo._id} className="promotion-card">
            <h3>{promo.title}</h3>
            <p>{promo.description}</p>
            <p><strong>Hết hạn:</strong> {new Date(promo.endDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionPage;
