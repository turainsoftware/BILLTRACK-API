const { Op, fn, col, where } = require("sequelize");
const { Hsn } = require("../models/Hsn");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");

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
    const data = await Hsn.findAll({
      where: {
        isActive: true,
      },
    });
    return res.json({ data, status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Hsn.findOne({
      where: {
        id,
        isActive: true,
      },
    });
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);

    return res.json({ data, status: true }).status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const getByHsnCode = async (req, res) => {
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
};

const search = async (req, res) => {
  try {
    let { query } = req.query;
    if (!query) query = '';
    query = query.toLowerCase();

    const data = await Hsn.findAll({
      where: {
        [Op.or]: [
          where(fn('LOWER', col('hsnCode')), { [Op.like]: `%${query}%` }),
          where(fn('LOWER', col('description')), { [Op.like]: `%${query}%` }),
          where(fn('LOWER', col('cGst')), { [Op.like]: `%${query}%` }),
          where(fn('LOWER', col('sGst')), { [Op.like]: `%${query}%` }),
          where(fn('LOWER', col('iGst')), { [Op.like]: `%${query}%` }),
        ],
      },
    });

    return res.status(200).json({ data, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", status: false });
  }
};


const count = async (req, res) => {
  try {
    const data = await Hsn.count();
    return res.json({ data, status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, cGst, sGst, iGst } = req.body;

    const data = await Hsn.findOne({
      where: {
        id: id,
      },
    });
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);

    if (data.iGst) {
      await Hsn.update(
        { description: description, iGst: iGst },
        { where: { id: id } }
      );
    } else {
      await Hsn.update(
        { description: description, cGst: cGst, sGst: sGst },
        { where: { id: id } }
      );
    }

    return res.json({ message: "Successfully updated", status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

const deActiveById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Hsn.findByPk(id);
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);
    await Hsn.update(
      {
        isActive: false,
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
    console.log(error);
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const deActiveByHsnCode = async (req, res) => {
  try {
    const { hsnCode } = req.params;
    const data = await Hsn.findOne({ where: { hsnCode: hsnCode } });
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);
    await Hsn.update({ isActive: false }, { where: { hsnCode: hsnCode } });
    return res
      .json({ message: "Successfully deleted", status: true })
      .status(200);
  } catch (error) {
    res.json({ message: "Something went wrong", status: false }).status(500);
  }
};

const deActiveByIdInBulk = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids) {
      return res.json({ message: "No data found", status: false }).status(404);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .json({ message: "ids must be a non-empty array", status: false })
        .status(404);
    }

    await Hsn.update(
      { isActive: false },
      {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      }
    );

    return res
      .json({ message: "Successfully deleted", status: true })
      .status(200);
  } catch (error) {
    console.error(error);
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
};

const activeAll=async (req, res) => {
  try {
    await Hsn.update({ isActive: true }, { where: { isActive: false } });
    return res
      .json({ message: "Successfully updated", status: true })
      .status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
}

const activeById=async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Hsn.findByPk(id);
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);
    await Hsn.update({ isActive: true }, { where: { id: id } });
    return res
      .json({ message: "Successfully updated", status: true })
      .status(200);
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false })
      .status(500);
  }
}

const exportData=async (req, res) => {
  try {
    const { format } = req.params;
    const data = await Hsn.findAll({ where: { isActive: true } });
    const hsnList = data.map(item => item.toJSON());

    // Remove isActive from each item for export
    const exportList = hsnList.map(({ isActive, ...rest }) => rest);

    if (format === "json") {
      return res.json(exportList);
    }

    // CSV export
    if (format === "csv") {
      // List only the fields you want exported
      const fields = ["id", "hsnCode", "description", "cGst", "sGst", "iGst"];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(exportList);
      res.header("Content-Type", "text/csv");
      res.attachment("hsnCode.csv");
      return res.send(csv);
    }

    // Excel export
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("hsnCode");

      // Add header and columns, exclude isActive
      if (exportList.length) {
        worksheet.columns = Object.keys(exportList[0]).map((key) => ({
          header: key,
          key: key,
          width: 20,
        }));
        worksheet.addRows(exportList);
      }

      res.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.attachment("hsn_codes.xlsx");

      await workbook.xlsx.write(res);
      return res.end();
    }

    return res.status(400).json({ message: "Invalid format", status: false });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", status: false });
  }
}

module.exports = {
  createHsn,
  createBulk,
  getAll,
  getById,
  getByHsnCode,
  search,
  count,
  deActiveById,
  updateById,
  deActiveByHsnCode,
  deActiveByIdInBulk,
  activeAll,
  activeById,
  exportData
};
