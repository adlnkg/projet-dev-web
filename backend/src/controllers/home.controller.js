import homeService from "../services/home.services.js";

export const getHomeFeed = async (req, res, next) => {
  try {
    const feed = await homeService.getHomepageFeed(10, 10);

    return res.status(200).json({
      success: true,
      data: {
        actualities: feed.actualities,
        events: feed.events,
        actuCount: feed.actuCount,
        eventCount: feed.eventCount,
        deviceCount: feed.deviceCount,
        userCount: feed.userCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getHomeFeed,
};
