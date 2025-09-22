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

const getAllBusinessCategory = async (req, res) => {
  try {
    const data = await BusinessCategory.findAll({
      where: {
        status: true,
      },
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

const deleteById=async (req, res) => {
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
}

const reactiveById=async (req, res) => {
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
}

module.exports = {
  createBusinessCategory,
  getAllBusinessCategory,
  findById,
  updateById,
  deleteById,
  reactiveById
};
