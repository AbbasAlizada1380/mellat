import { Athletes } from "../Models/Athletes.js"
import { Op } from "sequelize";

export const searchAthletes = async (req, res) => {
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

    // Build search conditions
    const searchConditions = {
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
        },
        {
          permanent_residence: {
            [Op.like]: `%${query}%`
          }
        },
        {
          current_residence: {
            [Op.like]: `%${query}%`
          }
        }
      ]
    };

    // Execute search with pagination
    const { rows: athletes, count: totalItems } = await Athletes.findAndCountAll({
      where: searchConditions,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    // Prepare response
    const response = {
      message: "Search completed successfully",
      data: athletes,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        searchQuery: query,
        searchResultsCount: totalItems,
      }
    };

    // If no results found
    if (totalItems === 0) {
      return res.status(200).json({
        ...response,
        message: "No athletes found matching your search criteria",
      });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: "Error searching athletes",
      error: error.message,
    });
  }
};
export const createAthlete = async (req, res) => {
  try {
    const {
      full_name,
      father_name,
      permanent_residence,
      current_residence,
      nic_number,
    } = req.body;

    const documentFile = req.files?.document_pdf?.[0];
    const photoFile = req.files?.photo?.[0];

    if (
      !full_name ||
      !father_name ||
      !permanent_residence ||
      !current_residence ||
      !nic_number ||
      !documentFile ||
      !photoFile
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const athlete = await Athletes.create({
      full_name,
      father_name,
      permanent_residence,
      current_residence,
      nic_number,
      document_pdf: documentFile.filename, // OR documentFile.path
      photo: photoFile.filename,           // OR photoFile.path
    });

    res.status(201).json({
      message: "Athlete created successfully",
      athlete,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "NIC number already exists",
      });
    }

    res.status(500).json({
      message: "Error creating athlete",
      error: error.message,
    });
  }
};


/**
 * @desc   Get all athletes
 * @route  GET /api/athletes
 */
export const getAllAthletes = async (req, res) => {
  try {
    // pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: athletes, count: totalItems } =
      await Athletes.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: athletes,
      currentPage: page,
      totalPages,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching athletes",
      error: error.message,
    });
  }
};

/**
 * @desc   Get single athlete by ID
 * @route  GET /api/athletes/:id
 */
export const getAthleteById = async (req, res) => {
  try {
    const athlete = await Athletes.findByPk(req.params.id);

    if (!athlete) {
      return res.status(404).json({
        message: "Athlete not found",
      });
    }

    res.status(200).json(athlete);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching athlete",
      error: error.message,
    });
  }
};

/**
 * @desc   Update athlete
 * @route  PUT /api/athletes/:id
 */
export const updateAthlete = async (req, res) => {
  try {
    const athlete = await Athletes.findByPk(req.params.id);

    if (!athlete) {
      return res.status(404).json({
        message: "Athlete not found",
      });
    }

    await athlete.update(req.body);

    res.status(200).json({
      message: "Athlete updated successfully",
      athlete,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "NIC number already exists",
      });
    }

    res.status(500).json({
      message: "Error updating athlete",
      error: error.message,
    });
  }
};

/**
 * @desc   Delete athlete
 * @route  DELETE /api/athletes/:id
 */
export const deleteAthlete = async (req, res) => {
  try {
    const athlete = await Athletes.findByPk(req.params.id);

    if (!athlete) {
      return res.status(404).json({
        message: "Athlete not found",
      });
    }

    await athlete.destroy();

    res.status(200).json({
      message: "Athlete deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting athlete",
      error: error.message,
    });
  }
};
