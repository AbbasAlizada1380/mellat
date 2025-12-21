import { Fees } from "../Models/Fees.js";
import { Athletes } from "../Models/Athletes.js";
import { Op } from "sequelize";
export const searchFeesByAthlete = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build search conditions for Athlete model
    const athleteSearchConditions = {
      [Op.or]: [
        {
          full_name: {
            [Op.like]: `%${query}%`
          }
        },
        {
          father_name: {
            [Op.like]: `%${query}%`
          }
        },
        {
          nic_number: {
            [Op.like]: `%${query}%`
          }
        }
      ]
    };

    // First, find athletes that match the search criteria
    const matchingAthletes = await Athletes.findAll({
      where: athleteSearchConditions,
      attributes: ['id'],
      raw: true
    });

    // Extract athlete IDs
    const athleteIds = matchingAthletes.map(athlete => athlete.id);

    // If no athletes found, return empty result
    if (athleteIds.length === 0) {
      return res.status(200).json({
        message: "No fees found for athletes matching your search criteria",
        data: [],
        meta: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          searchQuery: query,
        }
      });
    }

    // Now find fees for these athletes
    const { rows: fees, count: totalItems } = await Fees.findAndCountAll({
      where: {
        athleteId: {
          [Op.in]: athleteIds
        }
      },
      include: [
        {
          model: Athletes,
          as: "athlete",
          attributes: ["id", "full_name", "father_name", "nic_number", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      message: "Search completed successfully",
      data: fees,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        searchQuery: query,
        matchingAthletesCount: athleteIds.length,
      }
    });
  } catch (error) {
    console.error("Search fees error:", error);
    res.status(500).json({
      message: "Error searching fees",
      error: error.message,
    });
  }
};
export const getActiveFeesToday = async (req, res) => {
  try {
    const today = new Date();

    // pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: fees, count: totalItems } =
      await Fees.findAndCountAll({
        where: {
          startDate: {
            [Op.lte]: today, // startDate <= today
          },
          endDate: {
            [Op.gte]: today, // endDate >= today
          },
        },
        include: [
          {
            model: Athletes,
            as: "athlete",
            attributes: ["id", "full_name", "nic_number","photo"],
          },
        ],
        order: [["startDate", "ASC"]],
        limit,
        offset,
      });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: fees,
      currentPage: page,
      totalPages,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching active fees",
      error: error.message,
    });
  }
};


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
    // query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // query with pagination
    const { rows: fees, count: totalItems } = await Fees.findAndCountAll({
      include: [
        {
          model: Athletes,
          as: "athlete",
          attributes: ["id", "full_name", "nic_number"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: fees,
      currentPage: page,
      totalPages,
      totalItems,
    });
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
