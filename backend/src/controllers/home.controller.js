import homeService from "../services/home.services.js";

export const getHomeFeed = async (req, res, next) => {
  try {
    const feed = await homeService.getHomepageFeed({ actualityLimit: 10 });

    return res.status(200).json({
      success: true,
      data: {
        actualities: feed.actualities,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getHomeFeed,
};
