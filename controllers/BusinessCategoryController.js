const { BusinessCategory } = require("../models/BusinessCategory");

const createBusinessCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const data = await BusinessCategory.create({ name });
    return res.json({ data, message: "Successfully created", status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error: error })
      .status(500);
  }
};

const createBusinessCategoryBulk = async (req, res) => {
  try {
    let categories = req.body;

    // Must be a non-empty array
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        message: "Input must be a non-empty array.",
        status: false,
      });
    }

    // Validate names (non-empty string) and eliminate empty/invalid records
    const validItems = [];
    const rejectedItems = [];
    const nameSet = new Set();

    categories.forEach((item, idx) => {
      if (
        !item.name ||
        typeof item.name !== "string" ||
        item.name.trim() === ""
      ) {
        rejectedItems.push({
          index: idx,
          item,
          reason: "Missing or invalid name",
        });
      } else {
        // Lowercase for case-insensitive duplicate checking
        const nameKey = item.name.trim().toLowerCase();
        if (nameSet.has(nameKey)) {
          rejectedItems.push({
            index: idx,
            item,
            reason: "Duplicate name in request",
          });
        } else {
          nameSet.add(nameKey);
          validItems.push({ ...item, name: item.name.trim() });
        }
      }
    });

    // Check for existing categories in DB (case-insensitive)
    const existing = await BusinessCategory.findAll({
      where: {
        name: validItems.map((item) => item.name),
        status: true,
      },
      attributes: ["name"],
    });
    const existingNames = new Set(
      existing.map((e) => e.name.trim().toLowerCase())
    );

    // Filter out already existing categories and collect rejection info
    const toInsert = [];
    validItems.forEach((item, idx) => {
      if (existingNames.has(item.name.toLowerCase())) {
        rejectedItems.push({
          index: idx,
          item,
          reason: "Already exists in database",
        });
      } else {
        toInsert.push(item);
      }
    });

    // Bulk create
    let created = [];
    if (toInsert.length > 0) {
      created = await BusinessCategory.bulkCreate(
        toInsert.map((item) => ({ name: item.name, status: true })),
        { validate: true }
      );
    }

    return res.json({
      createdCount: created.length,
      rejectedCount: rejectedItems.length,
      rejectedItems,
      data: created,
      message: `${created.length} created, ${rejectedItems.length} rejected`,
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        message: "Something went wrong",
        status: false,
        error: error.message,
      });
  }
};

const getAllBusinessCategory = async (req, res) => {
  try {
    const data = await BusinessCategory.findAll({
      where: {
        status: true,
      },
      attributes: ['id','name']
    });
    if (!data) return res.json({ message: "No data found", status: false });
    return res.json({ data, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error: error })
      .status(500);
  }
};

const findById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await BusinessCategory.findByPk(id);
    if (!data) return res.json({ message: "No data found", status: false });
    return res.json({ data, status: true });
  } catch (error) {
    return res.json({
      message: "Something went wrong",
      status: false,
    });
  }
};

const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await BusinessCategory.update(
      { name },
      {
        where: {
          id: id,
        },
      }
    );

    return res.json({ message: "Successfully updated", status: true });
  } catch (error) {
    console.error(error);
    return res.json({ message: "Something went wrong", status: false });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    await BusinessCategory.update(
      {
        status: false,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return res.json({ message: "Successfully deleted", status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

const reactiveById = async (req, res) => {
  try {
    const { id } = req.params;
    await BusinessCategory.update(
      {
        status: true,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return res.json({ message: "Successfully updated", status: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Something went wrong", status: false });
  }
};

module.exports = {
  createBusinessCategory,
  getAllBusinessCategory,
  findById,
  updateById,
  deleteById,
  reactiveById,
  createBusinessCategoryBulk
};
