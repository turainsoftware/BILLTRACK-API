const { Op } = require("sequelize");
const { BusinessCategory } = require("../models/BusinessCategory");
const { Hsn } = require("../models/Hsn");
const { ProductCategory } = require("../models/ProductCategory");

const create = async (req, res) => {
  try {
    const { name, hsnId, businessCategoryId } = req.body;


    const businessCategory = await BusinessCategory.findByPk(
      businessCategoryId
    );
    if (!businessCategory)
      return res
        .json({ message: "Invalid Business Category", status: false })
        .status(404);
    const hsn = await Hsn.findByPk(hsnId);
    if (!hsn)
      return res.json({ message: "Invalid HSN", status: false }).status(404);

    const data = await ProductCategory.create({
      name,
      hsnId,
      businessCategory: businessCategoryId,
    });
    return res.json({ data, message: "Successfully created", status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error })
      .status(500);
  }
};

const createInBulk = async (req, res) => {
  try {
    const { data = [] } = req.body;
    if (!Array.isArray(data) && !data.length > 0) {
      return res
        .json({ message: "Invalid data format", status: false })
        .status(404);
    }

    const createdData = [];
    const rejectedData = [];

    data.forEach((item) => {
      const { name, hsnId, businessCategoryId } = item;
      if (!name || !hsnId || !businessCategoryId) {
        return rejectedData.push({
          ...item,
          message: "Invalid data format",
          status: false,
        });
      } else {
        createdData.push({
          name,
          hsnId,
          businessCategory: businessCategoryId,
        });
      }
    });

    await ProductCategory.bulkCreate(createdData);
    return res
      .json({
        message: "Successfully created",
        status: true,
        createdData,
        rejectedData,
      })
      .status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error })
      .status(500);
  }
};

const getAll = async (req, res) => {
  try {
    const data = await ProductCategory.findAll({
      where: {
        isActive: true,
      },
    });
    return res.json({ data, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error })
      .status(500);
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ProductCategory.findByPk(id);

    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);
    return res.json({ data, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const getByHsnId = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ProductCategory.findAll({
      where: {
        hsnId: id,
      },
    });
    return res.json({ data, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const getByHsnCode = async (req, res) => {
  try {
    const { code } = req.params;
    const data = await Hsn.findOne({
      where: {
        hsnCode: code,
      },
    });
    if (!data)
      return res.json({ message: "Invalid HSN", status: false }).status(404);

    const productCategories = await ProductCategory.findAll({
      where: {
        hsnId: data.id,
      },
    });
    return res.json({ productCategories, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const getByBusinessCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await BusinessCategory.findByPk(id);
    if (!data)
      return res.json({ message: "Invalid Business Category", status: false });
    const productCategories = await ProductCategory.findAll({
      where: {
        businessCategory: id,
      },
    });
    return res.json({ productCategories, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error })
      .status(500);
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ProductCategory.findByPk(id);
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);

    await ProductCategory.update(
      {
        isActive: false,
      },
      {
        where: {
          id: data.id,
        },
      }
    );

    return res
      .json({ message: "Successfully deleted", status: true })
      .status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error })
      .status(500);
  }
};

const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hsnId, businessCategoryId } = req.body;

    const data = await ProductCategory.findByPk(id);
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);

    if (
      name === data.name &&
      hsnId === data.hsnId &&
      businessCategoryId === data.businessCategory
    )
      return res
        .status(400)
        .json({ message: "No changes found!", status: false });

    const updatableData = {};

    // CHECK BUSINESS CATEGORY IS VALID OR NOT
    const businessCategory = await BusinessCategory.findByPk(
      businessCategoryId
    );
    if (!businessCategory)
      return res
        .json({ message: "Invalid Business Category", status: false })
        .status(404);

    // HSN IS VALID OR NOT
    const hsn = await Hsn.findByPk(hsnId);
    if (!hsn)
      return res.json({ message: "Invalid HSN", status: false }).status(404);

    if (name !== data.name) updatableData.name = name;
    if (hsnId !== data.hsnId) updatableData.hsnId = hsnId;
    if (businessCategoryId !== data.businessCategory)
      updatableData.businessCategory = businessCategoryId;

    await ProductCategory.update(updatableData, {
      where: {
        id: id,
      },
    });

    return res
      .json({ message: "Successfully updated", status: true })
      .status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error })
      .status(500);
  }
};

const search = async (req, res) => {
  try {
    const { query } = req.query;
    const data = await ProductCategory.findAll({
      where: {
        name: {
          [Op.like]: `%${query}%`,
        },
      },
    });

    return res.json({ data, status: true }).status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error })
      .status(500);
  }
};

const getHsnDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const hsn = await ProductCategory.findOne({
      attributes: ["hsnId"],
      where: {
        id: id,
      },
    });

    const hsnDetails = await Hsn.findByPk(hsn.hsnId);
    const data = hsnDetails.get({ plain: true });
    delete data.isActive;
    return res.json({ data, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const getBusinessCategoryDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = await ProductCategory.findOne({
      attributes: ["businessCategory"],
      where: {
        id: id,
      },
    });

    if (!businessId)
      return res.json({ message: "Invalid Business Category", status: false });

    const businessCategory = await BusinessCategory.findByPk(
      businessId.businessCategory
    );
    const data = businessCategory.get({ plain: true });
    delete data.status;
    return res.json({ data, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const activeDeletedItem = async (req, res) => {
  try {
    const { id } = req.params;
    const exist = await ProductCategory.findOne({
      attributes: ["id"],
      where: {
        id: id,
      },
    });

    if (!exist)
      return res.json({ message: "No data found", status: false }).status(404);

    await ProductCategory.update(
      {
        isActive: true,
      },
      {
        where: {
          id: id,
        },
      }
    );

    return res
      .json({ message: "Successfully deleted", status: true })
      .status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const reactiveInBulk = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data) || !data.length > 0)
      return res
        .status(400)
        .json({ message: "Invalid data format", status: false });

    data.forEach(async (item) => {
      await ProductCategory.update(
        { isActive: true },
        {
          where: {
            id: item,
          },
        }
      );
    });

    return res.json({ message: "Successfully deleted", status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const count = async (req, res) => {
  try {
    const data = await ProductCategory.count();
    return res.json({ total: data, status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

const countActiveInActive = async (req, res) => {
  try {
    const { isActive } = req.query;
    const data = await ProductCategory.count({
      where: {
        isActive: isActive === 0 ? 0 : 1,
      },
    });
    return res.json({ data, status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

const pagination = async (req, res) => {
  try {
    let { page = 1, size = 10, orderby = "ASC" } = req.query;
    page = parseInt(page);
    size = parseInt(size);
    const offset = (page - 1) * size;

    const data = await ProductCategory.findAll({
      limit: size,
      offset: offset,
      order: [["name", orderby.toUpperCase()]],
      where: {
        isActive: true,
      },
      logging: console.log,
    });
    return res.json({ data, status: true, hasNext: data.length === size });
  } catch (error) {
    return res
      .json({
        message: "Something went wrong",
        status: false,
        error: error.message,
      })
      .status(500);
  }
};

const deleteBulk = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || !data.length > 0)
      return res
        .status(400)
        .json({ message: "Invalid data format", status: false });

    await ProductCategory.update(
      { isActive: false },
      {
        where: {
          id: {
            [Op.in]: data,
          },
        },
      }
    );
    return res.json({ message: "Successfully deleted", status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error })
      .status(500);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  getByHsnId,
  getByHsnCode,
  getByBusinessCategory,
  createInBulk,
  deleteById,
  updateById,
  search,
  getHsnDetails,
  getBusinessCategoryDetails,
  activeDeletedItem,
  reactiveInBulk,
  count,
  countActiveInActive,
  pagination,
  deleteBulk,
};
