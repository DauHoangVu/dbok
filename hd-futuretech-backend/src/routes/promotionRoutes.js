const express = require("express")
const router = express.Router()
const { getAllPromotions } = require("../controllers/promotionController")

// Public route - lấy danh sách khuyến mãi
router.get("/", getAllPromotions)

module.exports = router
