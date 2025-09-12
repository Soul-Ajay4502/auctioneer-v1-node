import { col, Op } from "sequelize";
import User from "../../db/models/user.js";
import { AppError } from "../utils/app-error.js";
import { catchAsync } from "../utils/catch-async.js";
import { ROLES } from "../constants/roles.js";
import League from "../../db/models/leagues.js";
import sequelize from "../../config/db.config.js";
import PlayerDetail from "../../db/models/player-details.js";

const getAlUsers = catchAsync(async (req, res, next) => {
  const result = await User.findAndCountAll({
    raw: true,
  });
  return res.json({
    status: "success",
    data: result,
  });
});

const getUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const result = await User.findOne({
    where: { [Op.and]: { id: userId } },
  });
  if (!result) {
    return next(new AppError("Invalid project id", 400));
  }
  return res.json({
    status: "success",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  console.log("Updating user with ID:", userId);
  console.log("Request body:", req.body);

  // Extract only the fields that are provided in the request
  const updateFields = {};
  const { userType, firstName, lastName, email, password, confirmPassword } =
    req.body;

  if (userType !== undefined) updateFields.user_type = userType;
  if (firstName !== undefined) updateFields.first_name = firstName;
  if (lastName !== undefined) updateFields.last_name = lastName;
  if (email !== undefined) updateFields.email = email;

  // Handle password update separately to ensure proper validation
  if (password !== undefined) {
    // Only update password if confirmPassword is also provided and matches
    if (confirmPassword === undefined) {
      return next(
        new AppError(
          "Confirm password is required when updating password",
          400,
        ),
      );
    }

    if (password !== confirmPassword) {
      return next(
        new AppError("Password and confirm password must match", 400),
      );
    }

    if (password.length < 7) {
      return next(
        new AppError("Password must be at least 7 characters long", 400),
      );
    }

    // Password will be hashed by the model hooks
    updateFields.password = password;
  }

  console.log("Fields to update:", updateFields);

  try {
    // First check if the user exists
    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return next(new AppError("User not found", 404));
    }

    // Check if email is being updated and if it's already in use
    if (updateFields.email && updateFields.email !== existingUser.email) {
      // Check if email is already in use (including soft-deleted records)
      const emailExists = await User.findOne({
        where: { email: updateFields.email },
        paranoid: false, // Include soft-deleted records in the search
      });

      if (emailExists) {
        // If the email exists but is soft-deleted, we can force-delete it to free up the email
        if (emailExists.deleted_at) {
          console.log(
            "Email exists in a soft-deleted record. Force deleting to free up the email...",
          );
          await User.destroy({
            where: { id: emailExists.id },
            force: true, // Permanently delete the record
          });
          console.log("Successfully force-deleted the soft-deleted user");
        } else if (emailExists.id !== parseInt(userId)) {
          // If the email is in use by another active user, return an error
          return next(
            new AppError("Email is already in use by another user", 400),
          );
        }
      }
    }

    // Update the user
    const result = await User.update(updateFields, {
      where: { id: userId },
      returning: true,
      individualHooks: true,
    });

    if (!result[0]) {
      return next(new AppError("No changes were made", 400));
    }

    // Fetch the updated user to return in the response
    const updatedUser = await User.findByPk(userId);

    return res.json({
      status: "success",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return next(new AppError(`Failed to update user: ${err.message}`, 500));
  }
});

const deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const isAdmin = req.user.user_type === ROLES.SUPER_ADMIN;

  if (isAdmin || req.user.id === parseInt(userId)) {
    try {
      const result = await User.destroy({
        where: { id: userId },
        paranoid: false,
      });

      if (result === 0)
        return res
          .status(400)
          .json({ status: "error", message: "Invalid user id" });

      res.status(200).json({
        status: "success",
        message: "User has been deleted.",
      });
    } catch (err) {
      console.error(err);
      return next(new AppError("Failed to delete user", 500));
    }
  } else {
    return res.status(403).json({
      status: "error",
      message: "You are not allowed to delete this user!",
    });
  }
});

const getOwnDetails = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const result = await User.findOne({
    where: { id: userId },
    attributes: {
      exclude: [
        "verification_code_expires_at",
        "createdAt",
        "updatedAt",
        "deletedAt",
      ],
    }, // include all relevant user attributes
  });

  if (!result) {
    return next(new AppError("User not found", 404));
  }

  return res.json({
    status: "success",
    user: result,
  });
});

const userStatistics = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Count of leagues created by user
    const leaguesCount = await League.count({
      where: { created_by: userId },
    });

    // 2. Total revenue from registration fees (based on registered players per league)
    const leaguesWithFees = await League.findAll({
      where: { created_by: userId },
      attributes: [
        "league_id",
        "registration_fee",
        [
          sequelize.literal('COUNT(DISTINCT "players"."player_id")'),
          "registered_players_count",
        ],
      ],
      include: [
        {
          model: PlayerDetail,
          as: "players",
          attributes: [],
        },
      ],
      group: ["leagues.league_id", "leagues.registration_fee"],
      raw: true,
    });

    let totalRevenue = 0;
    leaguesWithFees.forEach((league) => {
      const registeredPlayers =
        parseInt(league.registered_players_count, 10) || 0;
      const fee = parseFloat(league.registration_fee) || 0;
      totalRevenue += registeredPlayers * fee;
    });

    // Optional: Format totalRevenue as currency (uncomment if needed)
    // const formattedRevenue = totalRevenue.toLocaleString('en-IN', {
    //     style: 'currency',
    //     currency: 'INR'
    // });

    // 3. Unique players (based on whatsapp_no) across all user's leagues
    const uniquePlayersCount = await PlayerDetail.count({
      distinct: true,
      col: "whatsapp_no",
      include: [
        {
          model: League,
          as: "league",
          where: { created_by: userId },
          attributes: [],
        },
      ],
    });

    // 4. League creation chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const leagueCreationData = await League.findAll({
      where: {
        created_by: userId,
        created_at: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      attributes: [
        [sequelize.fn("date_trunc", "month", col("created_at")), "month"],
        [sequelize.fn("COUNT", col("league_id")), "count"],
      ],
      group: [sequelize.fn("date_trunc", "month", col("created_at"))],
      order: [[sequelize.fn("date_trunc", "month", col("created_at")), "ASC"]],
      raw: true,
    });

    // Format chart data
    const chartData = {
      labels: [],
      values: [],
    };

    leagueCreationData.forEach((item) => {
      const date = new Date(item.month);
      chartData.labels.push(
        date.toLocaleString("default", { month: "short", year: "numeric" }),
      );
      chartData.values.push(parseInt(item.count, 10));
    });

    return res.status(200).json({
      status: "success",
      data: {
        leaguesCount,
        totalRevenue,
        // totalRevenue: formattedRevenue,
        uniquePlayersCount,
        chartData,
      },
    });
  } catch (error) {
    next(error);
  }
});

export {
  getAlUsers,
  getUserById,
  updateUser,
  deleteUser,
  getOwnDetails,
  userStatistics,
};
