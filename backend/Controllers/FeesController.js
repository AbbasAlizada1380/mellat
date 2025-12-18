import { Fees } from "../Models/Fees.js";
import { Athletes } from "../Models/Athletes.js";
import { Op } from "sequelize";

export const getFeesInRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // get from query params

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const fees = await Fees.findAll({
      where: {
        endDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      include: [
        {
          model: Athletes,
          as: "athlete",
          attributes: ["id", "full_name", "nic_number"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching fees in range",
      error: error.message,
    });
  }
};

/**
 * @desc   Create new fee
 * @route  POST /api/fees
 */
export const createFee = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            total,
            received,
            athleteId,
        } = req.body;

        if (!startDate || !endDate || !total || !athleteId) {
            return res.status(400).json({
                message: "startDate, endDate, total and athleteId are required",
            });
        }

        // check athlete exists
        const athlete = await Athletes.findByPk(athleteId);
        if (!athlete) {
            return res.status(404).json({
                message: "Athlete not found",
            });
        }

        const fee = await Fees.create({
            startDate,
            endDate,
            total,
            received: received || 0,
            athleteId,
        });

        res.status(201).json({
            message: "Fee created successfully",
            fee,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating fee",
            error: error.message,
        });
    }
};

/**
 * @desc   Get all fees
 * @route  GET /api/fees
 */
export const getAllFees = async (req, res) => {
    try {
        const fees = await Fees.findAll({
            include: [
                {
                    model: Athletes,
                    as: "athlete",
                    attributes: ["id", "full_name", "nic_number"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching fees",
            error: error.message,
        });
    }
};

/**
 * @desc   Get fee by ID
 * @route  GET /api/fees/:id
 */
export const getFeeById = async (req, res) => {
    try {
        const fee = await Fees.findByPk(req.params.id, {
            include: [
                {
                    model: Athlete,
                    as: "athlete",
                    attributes: ["id", "full_name", "nic_number"],
                },
            ],
        });

        if (!fee) {
            return res.status(404).json({
                message: "Fee not found",
            });
        }

        res.status(200).json(fee);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching fee",
            error: error.message,
        });
    }
};

/**
 * @desc   Update fee
 * @route  PUT /api/fees/:id
 */
export const updateFee = async (req, res) => {
    try {
        const fee = await Fees.findByPk(req.params.id);

        if (!fee) {
            return res.status(404).json({
                message: "Fee not found",
            });
        }

        await fee.update(req.body);

        res.status(200).json({
            message: "Fee updated successfully",
            fee,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating fee",
            error: error.message,
        });
    }
};

/**
 * @desc   Delete fee
 * @route  DELETE /api/fees/:id
 */
export const deleteFee = async (req, res) => {
    try {
        const fee = await Fees.findByPk(req.params.id);

        if (!fee) {
            return res.status(404).json({
                message: "Fee not found",
            });
        }

        await fee.destroy();

        res.status(200).json({
            message: "Fee deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting fee",
            error: error.message,
        });
    }
};

Athletes.hasMany(Fees, {
  foreignKey: "athleteId",
  as: "fees",
});

Fees.belongsTo(Athletes, {
  foreignKey: "athleteId",
  as: "athlete",
});
