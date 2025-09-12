"use strict";
import { Team, League, PlayerDetail } from "../../db/models/index.js";
import { AppError } from "../utils/app-error.js";

export const teamController = {
  // Create a new team
  create: async (req, res, next) => {
    try {
      const teamData = req.body;

      // Check if the league exists
      const league = await League.findByPk(teamData.league_id);
      if (!league) {
        return next(new AppError("No league found with that ID", 404));
      }

      const team = await Team.create(teamData);

      return res.status(201).json({
        status: "success",
        data: {
          team,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all teams
  getAll: async (req, res, next) => {
    try {
      const { league_id } = req.query;

      let whereClause = {};
      if (league_id) {
        whereClause.league_id = league_id;
      }

      const teams = await Team.findAll({
        where: whereClause,
        include: [
          {
            model: League,
            as: "league",
            attributes: ["league_id", "league_name", "league_full_name"],
          },
        ],
      });

      return res.status(200).json({
        status: "success",
        results: teams.length,
        data: teams,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get a specific team by ID
  getOne: async (req, res, next) => {
    try {
      const { id } = req.params;

      const team = await Team.findByPk(id, {
        include: [
          {
            model: League,
            as: "league",
            attributes: ["id", "league_name", "league_full_name"],
          },
          {
            model: PlayerDetail,
            as: "players",
          },
        ],
      });

      if (!team) {
        return next(new AppError("No team found with that ID", 404));
      }

      return res.status(200).json({
        status: "success",
        data: {
          team,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update a team
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const teamData = req.body;

      const team = await Team.findByPk(id);

      if (!team) {
        return next(new AppError("No team found with that ID", 404));
      }

      // If league_id is being updated, check if the new league exists
      if (teamData.league_id && teamData.league_id !== team.league_id) {
        const league = await League.findByPk(teamData.league_id);
        if (!league) {
          return next(new AppError("No league found with that ID", 404));
        }
      }

      // Update team
      await team.update(teamData);

      return res.status(200).json({
        status: "success",
        data: {
          team,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a team
  remove: async (req, res, next) => {
    try {
      const { id } = req.params;

      const team = await Team.findByPk(id);

      if (!team) {
        return next(new AppError("No team found with that ID", 404));
      }

      // Delete team (using paranoid deletion)
      await team.destroy();

      return res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get team statistics
  getStats: async (req, res, next) => {
    try {
      const { id } = req.params;

      const team = await Team.findByPk(id);

      if (!team) {
        return next(new AppError("No team found with that ID", 404));
      }

      // Get count of players in this team
      const playersCount = await PlayerDetail.count({
        where: { sold_to: id },
      });

      // Get total amount spent on players
      const players = await PlayerDetail.findAll({
        where: { sold_to: id },
        attributes: ["sold_amount"],
      });

      let totalSpent = 0;
      players.forEach((player) => {
        if (player.sold_amount) {
          totalSpent += parseInt(player.sold_amount, 10) || 0;
        }
      });

      // Calculate remaining balance
      const maxBidAmount = parseInt(team.max_amount_for_bid, 10) || 0;
      const remainingBalance = maxBidAmount - totalSpent;

      return res.status(200).json({
        status: "success",
        data: {
          playersCount,
          totalSpent,
          maxBidAmount,
          remainingBalance,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Toggle auction start status
  toggleAuctionStatus: async (req, res, next) => {
    try {
      const { id } = req.params;

      const team = await Team.findByPk(id);

      if (!team) {
        return next(new AppError("No team found with that ID", 404));
      }

      // Toggle auction status
      const newStatus = team.is_auction_started === "yes" ? "no" : "yes";
      await team.update({ is_auction_started: newStatus });

      return res.status(200).json({
        status: "success",
        data: {
          team,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
