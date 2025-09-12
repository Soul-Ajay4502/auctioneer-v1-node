import { League } from "../../db/models/index.js";
import { AppError } from "../utils/app-error.js";

export const metaController = {
  getLeagueByUuid: async (req, res, next) => {
    try {
      const { uuid } = req.params;

      const league = await League.findOne({
        where: { join_link: uuid },
      });

      if (!league) {
        return next(new AppError("No league found with that UUID", 404));
      }

      return res.status(200).json({
        status: "success",
        data: league,
      });
    } catch (error) {
      next(error);
    }
  },
};
