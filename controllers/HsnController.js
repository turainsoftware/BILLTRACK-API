const { Hsn } = require("../models/Hsn");

// CREATE
const createHsn = async (req, res) => {
  try {
    const { hsnCode, description, cGst, sGst, iGst } = req.body;

    // 400 Bad Request
    if (!hsnCode) {
      return res
        .status(400)
        .json({ message: "hsnCode is required", status: false });
    }

    if ((cGst && !sGst) || (!cGst && sGst)) {
      return res.status(400).json({
        message: "cGst and sGst must be together",
        status: false,
      });
    }

    if (!cGst && !sGst && !iGst) {
      return res.status(400).json({
        message: "At least one of the rates must be present",
        status: false,
      });
    }

    // 409 Conflict
    const exist = await Hsn.findOne({ where: { hsnCode } });
    if (exist) {
      return res
        .status(409)
        .json({ message: "hsnCode already exist", status: false });
    }

    // 201 Created
    let data;
    if (cGst && sGst) {
      data = await Hsn.create({ hsnCode, description, cGst, sGst });
    } else {
      data = await Hsn.create({ hsnCode, description, iGst });
    }

    return res
      .status(201)
      .json({ data, message: "Successfully created", status: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", status: false });
  }
};

// CREATE BULK
const createBulk = async (req, res) => {
  try {
    const { hsncodes } = req.body;

    // 400 Bad Request
    if (!hsncodes) {
      return res
        .status(400)
        .json({ message: "hsncodes is required", status: false });
    }

    if (!Array.isArray(hsncodes) || hsncodes.length === 0) {
      return res.status(400).json({
        message: "hsncodes must be a non-empty array",
        status: false,
      });
    }

    let formatMatchedData = [];
    let unformatData = [];

    // STEP 1: Split formatted vs unformatted
    hsncodes.forEach((item) => {
      const { hsnCode, description, cGst, sGst, iGst } = item;

      if (!hsnCode) {
        unformatData.push({
          ...item,
          message: "hsnCode is required",
          status: false,
        });
        return;
      }

      if ((cGst && !sGst) || (!cGst && sGst)) {
        unformatData.push({
          ...item,
          message: "cGst and sGst must be together",
          status: false,
        });
        return;
      }

      if (!cGst && !sGst && !iGst) {
        unformatData.push({
          ...item,
          message: "At least one tax rate must be present",
          status: false,
        });
        return;
      }

      formatMatchedData.push({ hsnCode, description, cGst, sGst, iGst });
    });

    // STEP 2: Check for existing HSN codes
    const finalData = [];
    for (const item of formatMatchedData) {
      const exist = await Hsn.findOne({ where: { hsnCode: item.hsnCode } });

      if (exist) {
        unformatData.push({
          ...item,
          message: "hsnCode already exists",
          status: false,
        });
      } else {
        finalData.push(item);
      }
    }

    // STEP 3: Insert only valid finalData
    let createdData = [];
    if (finalData.length > 0) {
      createdData = await Hsn.bulkCreate(finalData);
    }

    return res.status(201).json({
      createdData,
      unformatData,
      message: "Bulk processing completed",
      status: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", status: false });
  }
};

// GET ALL
const getAll = async (req, res) => {
  try {
    const data = await Hsn.findAll();
    return res.json({ data, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const getById=async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Hsn.findByPk(id);
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);

    return res.json({ data, status: true }).status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
}

const getByHsnCode=async (req, res) => {
  try {
    const { code } = req.params;
    const data = await Hsn.findOne({ where: { hsnCode: code } });
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);

    return res.json({ data, status: true }).status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
}


const search=async (req, res) => {
  try {
    const { query } = req.query;

    const data = await Hsn.findAll({
      where: {
        [Op.or]: {
          hsnCode: {
            [Op.like]: `%${query}%`,
          },
          description: {
            [Op.like]: `%${query}%`,
          },
        },
      },
    });

    return res.json({ data, status: true }).status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
}


const count=async (req, res) => {
  try {
    const data = await Hsn.count();
    return res.json({ data, status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
}

module.exports = {
  createHsn,
  createBulk,
  getAll,
  getById,
  getByHsnCode,
  search,
  count
};
