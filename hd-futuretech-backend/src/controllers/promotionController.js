const Promotion = require("../models/Promotion");

exports.getAllPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find().sort("-startDate");

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (err) {
    next(err);
  }
};
