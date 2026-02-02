const express = require("express");
const { Invoice } = require("../models/Invoice");
const { InvoiceItems } = require("../models/InvoiceItems");
const { transform } = require("pdfkit");
const router = express.Router();
const { User } = require("./../models/User");
const { jwtMiddleware } = require("./../middleware/JwtMiddlware");
const { generateInvoiceNumber } = require("../utils/helper");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const { Business } = require("../models/Business");
const { Op } = require("sequelize");

router.post("/", jwtMiddleware, async (req, res) => {
  let transaction;
  try {
    const user = req.user;

    const {
      status,
      customerNumber = "",
      items = [],
      paymentMode,
      discount,
    } = req.body;
    const allowedStatus = ["paid", "unpaid", "canceled"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid data format",
        status: false,
      });
    }

    if (!["cash", "upi", "card"].includes(paymentMode)) {
      return res.status(400).json({
        message: "Invalid data format",
        status: false,
      });
    }

    if (!items || !Array.isArray(items) || !items.length > 0) {
      return res.status(400).json({
        message: "Invalid data format",
        status: false,
      });
    }

    let totalAmount = 0;

    items.forEach((item) => {
      if (!item.quantity || !item.productName || !item.rate) {
        return res
          .status(400)
          .json({ message: "Invalid data format", status: false });
      }
      totalAmount =
        totalAmount + new Number(item.rate) * new Number(item.quantity);
    });

    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};

    transaction = await Invoice.sequelize.transaction();

    const invoiceNumber = generateInvoiceNumber(businessId);

    const invoice = await Invoice.create(
      {
        invoiceNumber: invoiceNumber,
        userId: user?.id,
        businessId: businessId,
        totalAmount: totalAmount - parseFloat(discount),
        discountAmount: parseFloat(discount),
        status: "paid",
        paymentMode: paymentMode,
        customerNumber,
      },
      { transaction },
    );

    await InvoiceItems.bulkCreate(
      items.map((item) => ({
        invoiceId: invoice.id,
        productName: item.productName,
        quantity: item.quantity,
        rate: item.rate,
        gstType: item.gstType || null,
        gstPercentage: item.gstPercentage || null,
      })),
      { transaction },
    );

    await transaction.commit();

    return res
      .status(201)
      .json({ message: "Invoice created successfully", status: true, invoice });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    return res.json({
      error,
      message: "Something went wrong",
      status: false,
      error,
    });
  }
});

router.get("/", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const sortBy = req.query.sortBy || "date_desc"; // date_asc || amount_high_to_low || amount_low_to_high

    const offset = page * limit;

    const total = await Invoice.count({
      where: {
        businessId: businessId,
      },
    });

    console.log("sort by is",sortBy)

    let order;
    if (sortBy === "date_desc") {
      order = [["createdAt", "DESC"]];
    } else if (sortBy === "date_asc") {
      order = [["createdAt", "ASC"]];
    } else if (sortBy === "amount_high_to_low") {
      order = [["totalAmount", "DESC"]];
    } else if (sortBy === "amount_low_to_high") {
      order = [["totalAmount", "ASC"]];
    } else {
      order = [["createdAt", "DESC"]];
    }

    const data = await Invoice.findAll({
      where: {
        businessId: businessId,
      },
      attributes: { exclude: ["userId", "businessId", "updatedAt"] },
      offset: offset,
      limit: limit,
      order: order,
    });

    const totalPage = Math.ceil(total / limit);
    const isLastPage = page === totalPage - 1;

    return res
      .json({
        data,
        pagination: {
          totalPage,
          hasNext: !isLastPage,
        },
        status: true,
      })
      .status(200);
  } catch (error) {
    return res.json({ error, message: "Something went wrong", status: false });
  }
});

router.get("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id, {
      attributes: ["id"],
    });
    if (!invoice) return res.json({ message: "No data found", status: false });
    const items = await InvoiceItems.findAll({
      where: {
        invoiceId: id,
      },
      attributes: [
        "id",
        "productName",
        "quantity",
        "rate",
        "gstType",
        "gstPercentage",
      ],
    });
    return res.json({ items, status: true }).status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await Invoice.findAll({
      where: {
        userId: id,
      },
    });
    if (!invoices) return res.json({ message: "No data found", status: false });
    return res.json({ invoices, status: true }).status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

router.get("items/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findOne({
      where: {
        userId: id,
      },
    });

    if (!invoice) return res.json({ message: "No data found", status: false });
    const items = await InvoiceItems.findAll({
      where: {
        invoiceId: invoice.id,
      },
    });
    return res.json({ data: items, status: true }).status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

router.post("/generate", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const businessID = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = businessID?.dataValues || {};
    const { format, fromDate, toDate } = req.body;

    // Manual Validation
    const errors = [];

    if (!format) {
      errors.push("Format is required");
    } else if (!["excel", "pdf", "csv"].includes(format.toLowerCase())) {
      errors.push("Format must be one of: excel, pdf, csv");
    }

    if (!businessId) {
      errors.push("Business ID is required");
    } else if (isNaN(businessId) || businessId <= 0) {
      errors.push("Business ID must be a positive number");
    }

    if (!fromDate) {
      errors.push("From date is required");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
      errors.push("From date must be in YYYY-MM-DD format");
    }

    if (!toDate) {
      errors.push("To date is required");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
      errors.push("To date must be in YYYY-MM-DD format");
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      errors.push("From date cannot be greater than To date");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Fetch business
    const business = await Business.findByPk(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Fetch invoices
    const invoices = await Invoice.findAll({
      where: {
        businessId,
        createdAt: {
          [Op.between]: [new Date(fromDate), new Date(toDate + "T23:59:59")],
        },
      },
      order: [["createdAt", "ASC"]],
    });

    // Prepare clean report data
    const reportData = invoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      customerNumber: invoice.customerNumber || "N/A",
      status: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
      paymentMode: invoice.paymentMode || "N/A",
      totalAmount: parseFloat(invoice.totalAmount).toFixed(2),
      discountAmount: parseFloat(invoice.discountAmount || 0).toFixed(2),
      createdAt: new Date(invoice.createdAt).toLocaleDateString("en-IN"),
    }));

    // Calculate summary
    const summary = {
      totalInvoices: invoices.length,
      totalAmount: invoices
        .reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0)
        .toFixed(2),
      totalDiscount: invoices
        .reduce((sum, inv) => sum + parseFloat(inv.discountAmount || 0), 0)
        .toFixed(2),
      paidCount: invoices.filter((inv) => inv.status === "paid").length,
      unpaidCount: invoices.filter((inv) => inv.status === "unpaid").length,
      canceledCount: invoices.filter((inv) => inv.status === "canceled").length,
    };

    const formatLower = format.toLowerCase();

    let base64 = "";
    if (formatLower === "excel") {
      base64 = await generateExcelReport(
        business,
        reportData,
        summary,
        fromDate,
        toDate,
      );
    } else if (formatLower === "pdf") {
      base64 = await generatePDFReport(
        business,
        reportData,
        summary,
        fromDate,
        toDate,
      );
    } else if (formatLower === "csv") {
      base64 = await generateCSVReport(
        business,
        reportData,
        summary,
        fromDate,
        toDate,
      );
    }
    return res.send(base64);
  } catch (error) {
    console.error("Report generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
});

// ==================== EXCEL REPORT ====================
const generateExcelReport = async (
  business,
  reportData,
  summary,
  fromDate,
  toDate,
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Billing System";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Invoice Report", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  // Define consistent styles
  const styles = {
    title: {
      font: { size: 20, bold: true, color: { argb: "FFFFFFFF" } },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2E7D32" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
    },
    subTitle: {
      font: { size: 12, bold: true, color: { argb: "FF333333" } },
      alignment: { horizontal: "center", vertical: "middle" },
    },
    header: {
      font: { size: 11, bold: true, color: { argb: "FFFFFFFF" } },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1976D2" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    },
    summaryHeader: {
      font: { size: 12, bold: true, color: { argb: "FF1976D2" } },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE3F2FD" },
      },
      alignment: { horizontal: "left", vertical: "middle" },
    },
    summaryValue: {
      font: { size: 11, bold: false },
      alignment: { horizontal: "right", vertical: "middle" },
    },
    dataRow: {
      font: { size: 10 },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } },
      },
    },
    alternateRow: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F5" },
      },
    },
    currency: {
      alignment: { horizontal: "right", vertical: "middle" },
    },
    statusPaid: {
      font: { size: 10, bold: true, color: { argb: "FF2E7D32" } },
    },
    statusUnpaid: {
      font: { size: 10, bold: true, color: { argb: "FFF57C00" } },
    },
    statusCanceled: {
      font: { size: 10, bold: true, color: { argb: "FFD32F2F" } },
    },
  };

  // Set column widths
  sheet.columns = [
    { key: "invoiceNumber", width: 18 },
    { key: "customerNumber", width: 18 },
    { key: "status", width: 12 },
    { key: "paymentMode", width: 15 },
    { key: "totalAmount", width: 15 },
    { key: "discountAmount", width: 12 },
    { key: "createdAt", width: 14 },
  ];

  // Row 1: Title
  sheet.mergeCells("A1:G1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "INVOICE REPORT";
  Object.assign(titleCell, styles.title);
  sheet.getRow(1).height = 35;

  // Row 2: Empty spacer
  sheet.getRow(2).height = 10;

  // Row 3: Business Name
  sheet.mergeCells("A3:G3");
  const businessCell = sheet.getCell("A3");
  businessCell.value = business.name.toUpperCase();
  businessCell.font = { size: 14, bold: true, color: { argb: "FF333333" } };
  businessCell.alignment = { horizontal: "center", vertical: "middle" };

  // Row 4: GST Number (if exists)
  let currentRow = 4;
  if (business.gstNumber) {
    sheet.mergeCells(`A${currentRow}: G${currentRow}`);
    const gstCell = sheet.getCell(`A${currentRow}`);
    gstCell.value = `GSTIN: ${business.gstNumber}`;
    gstCell.font = { size: 10, color: { argb: "FF666666" } };
    gstCell.alignment = { horizontal: "center", vertical: "middle" };
    currentRow++;
  }

  // Report Period
  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const periodCell = sheet.getCell(`A${currentRow}`);
  periodCell.value = `Report Period: ${formatDateDisplay(
    fromDate,
  )} to ${formatDateDisplay(toDate)}`;
  periodCell.font = { size: 10, italic: true, color: { argb: "FF666666" } };
  periodCell.alignment = { horizontal: "center", vertical: "middle" };
  currentRow += 2;

  // Summary Section Header
  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const summaryHeaderCell = sheet.getCell(`A${currentRow}`);
  summaryHeaderCell.value = "📊 SUMMARY";
  Object.assign(summaryHeaderCell, styles.summaryHeader);
  sheet.getRow(currentRow).height = 25;
  currentRow++;

  // Summary Data in a structured format
  const summaryData = [
    { label: "Total Invoices", value: summary.totalInvoices, icon: "📋" },
    {
      label: "Total Revenue",
      value: `₹ ${formatNumber(summary.totalAmount)}`,
      icon: "💰",
    },
    {
      label: "Total Discount",
      value: `₹ ${formatNumber(summary.totalDiscount)}`,
      icon: "🏷️",
    },
    { label: "Paid Invoices", value: summary.paidCount, icon: "✅" },
    { label: "Unpaid Invoices", value: summary.unpaidCount, icon: "⏳" },
    { label: "Canceled Invoices", value: summary.canceledCount, icon: "❌" },
  ];

  summaryData.forEach((item) => {
    sheet.mergeCells(`A${currentRow}:C${currentRow}`);
    sheet.mergeCells(`D${currentRow}: E${currentRow}`);

    const labelCell = sheet.getCell(`A${currentRow}`);
    labelCell.value = `  ${item.icon} ${item.label}`;
    labelCell.font = { size: 10, bold: true };
    labelCell.alignment = { horizontal: "left", vertical: "middle" };

    const valueCell = sheet.getCell(`D${currentRow}`);
    valueCell.value = item.value;
    valueCell.font = { size: 10, bold: true, color: { argb: "FF1976D2" } };
    valueCell.alignment = { horizontal: "left", vertical: "middle" };

    currentRow++;
  });

  currentRow += 2;

  // Invoice Details Header
  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const detailsHeaderCell = sheet.getCell(`A${currentRow}`);
  detailsHeaderCell.value = "📑 INVOICE DETAILS";
  Object.assign(detailsHeaderCell, styles.summaryHeader);
  sheet.getRow(currentRow).height = 25;
  currentRow++;

  // Table Headers
  const headers = [
    "Invoice #",
    "Customer #",
    "Status",
    "Payment Mode",
    "Amount (₹)",
    "Discount (₹)",
    "Date",
  ];
  const headerRow = sheet.getRow(currentRow);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    Object.assign(cell, styles.header);
  });
  headerRow.height = 25;
  currentRow++;

  // Table Data
  reportData.forEach((invoice, index) => {
    const row = sheet.getRow(currentRow);

    row.getCell(1).value = invoice.invoiceNumber;
    row.getCell(2).value = invoice.customerNumber;
    row.getCell(3).value = invoice.status;
    row.getCell(4).value = invoice.paymentMode;
    row.getCell(5).value = formatNumber(invoice.totalAmount);
    row.getCell(6).value = formatNumber(invoice.discountAmount);
    row.getCell(7).value = invoice.createdAt;

    // Apply styles to each cell
    for (let i = 1; i <= 7; i++) {
      const cell = row.getCell(i);
      Object.assign(cell, styles.dataRow);

      // Alternate row coloring
      if (index % 2 === 1) {
        cell.fill = styles.alternateRow.fill;
      }
    }

    // Status-specific coloring
    const statusCell = row.getCell(3);
    if (invoice.status.toLowerCase() === "paid") {
      statusCell.font = styles.statusPaid.font;
    } else if (invoice.status.toLowerCase() === "unpaid") {
      statusCell.font = styles.statusUnpaid.font;
    } else if (invoice.status.toLowerCase() === "canceled") {
      statusCell.font = styles.statusCanceled.font;
    }

    // Right-align currency columns
    row.getCell(5).alignment = styles.currency.alignment;
    row.getCell(6).alignment = styles.currency.alignment;

    row.height = 22;
    currentRow++;
  });

  // Footer
  currentRow += 2;
  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const footerCell = sheet.getCell(`A${currentRow}`);
  footerCell.value = `Report Generated:  ${new Date().toLocaleString(
    "en-IN",
  )} | Powered by Billing System`;
  footerCell.font = { size: 8, italic: true, color: { argb: "FF999999" } };
  footerCell.alignment = { horizontal: "center", vertical: "middle" };

  // File response
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer.toString("base64");
};

// ==================== PDF REPORT ====================
const generatePDFReport = (business, reportData, summary, fromDate, toDate) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      bufferPages: true,
      info: {
        Title: `Invoice Report - ${business.name}`,
        Author: "Billing System",
        Subject: `Invoice Report from ${fromDate} to ${toDate}`,
      },
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData.toString("base64"));
    });
    doc.on("error", reject);

    // ================= COLORS =================
    const colors = {
      black: "#000000",
      darkGray: "#333333",
      gray: "#666666",
      lightGray: "#DDDDDD",
      white: "#FFFFFF",
    };

    const pageWidth = doc.page.width - 80;
    const startX = 40;
    const firstPageContentY = 120;
    const otherPageContentY = 80;
    const contentEndY = 750;

    // ================= TABLE CONFIG =================
    const colWidths = [75, 85, 60, 70, 80, 70, 75];
    const headers = [
      "Invoice #",
      "Customer",
      "Status",
      "Payment",
      "Amount",
      "Discount",
      "Date",
    ];
    const rowHeight = 20;
    const headerHeight = 25;

    // ================= FIRST PAGE HEADER =================
    const drawFirstPageHeader = () => {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor(colors.black)
        .text(business.name.toUpperCase(), startX, 40, {
          width: pageWidth,
          align: "center",
        });

      let y = 58;

      if (business.gstNumber) {
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor(colors.darkGray)
          .text(`GSTIN: ${business.gstNumber}`, startX, y, {
            width: pageWidth,
            align: "center",
          });
        y += 12;
      }

      if (business.address) {
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor(colors.gray)
          .text(business.address, startX, y, {
            width: pageWidth,
            align: "center",
          });
        y += 12;
      }

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(colors.black)
        .text("INVOICE REPORT", startX, y + 5, {
          width: pageWidth,
          align: "center",
        });

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(colors.darkGray)
        .text(
          `Period: ${formatDateDisplay(fromDate)} to ${formatDateDisplay(
            toDate,
          )}`,
          startX,
          y + 18,
          { width: pageWidth, align: "center" },
        );

      doc
        .lineWidth(1)
        .strokeColor(colors.black)
        .moveTo(startX, 115)
        .lineTo(startX + pageWidth, 115)
        .stroke();
    };

    // ================= OTHER PAGE HEADER =================
    const drawOtherPageHeader = () => {
      doc
        .lineWidth(1)
        .strokeColor(colors.black)
        .moveTo(startX, 60)
        .lineTo(startX + pageWidth, 60)
        .stroke();
    };

    // ================= FOOTER =================
    const drawPageFooter = (page, total) => {
      doc
        .lineWidth(0.5)
        .strokeColor(colors.lightGray)
        .moveTo(startX, 770)
        .lineTo(startX + pageWidth, 770)
        .stroke();

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(colors.gray)
        .text(`Generated: ${new Date().toLocaleString("en-IN")}`, startX, 778);

      doc.text(`Page ${page} of ${total}`, startX, 778, {
        width: pageWidth,
        align: "right",
      });
    };

    // ================= TABLE HEADER =================
    const drawTableHeader = (y) => {
      doc.rect(startX, y, pageWidth, headerHeight).fill(colors.lightGray);

      doc
        .lineWidth(1)
        .strokeColor(colors.black)
        .rect(startX, y, pageWidth, headerHeight)
        .stroke();

      let x = startX;
      doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.black);

      headers.forEach((h, i) => {
        doc.text(h, x + 3, y + 7, {
          width: colWidths[i] - 6,
          align: "center",
        });

        if (i < headers.length - 1) {
          doc
            .lineWidth(0.5)
            .moveTo(x + colWidths[i], y)
            .lineTo(x + colWidths[i], y + headerHeight)
            .stroke();
        }
        x += colWidths[i];
      });

      return y + headerHeight;
    };

    // ================= FIRST PAGE =================
    drawFirstPageHeader();
    let yPos = firstPageContentY;

    // Summary
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(colors.black)
      .text("Summary:", startX, yPos);

    yPos += 15;

    const summaryLines = [
      `Total Invoices: ${summary.totalInvoices}`,
      `Total Revenue: ₹${formatNumber(summary.totalAmount)}`,
      `Total Discount: ₹${formatNumber(summary.totalDiscount)}`,
      `Paid: ${summary.paidCount} | Unpaid: ${summary.unpaidCount} | Cancelled: ${summary.canceledCount}`,
    ];

    doc.fontSize(9).font("Helvetica").fillColor(colors.darkGray);
    summaryLines.forEach((t) => {
      doc.text(t, startX, yPos);
      yPos += 12;
    });

    yPos += 15;
    yPos = drawTableHeader(yPos);

    // ================= TABLE ROWS =================
    reportData.forEach((invoice) => {
      if (yPos + rowHeight > contentEndY) {
        doc.addPage();
        drawOtherPageHeader();
        yPos = otherPageContentY;
        yPos = drawTableHeader(yPos);
      }

      doc
        .lineWidth(0.5)
        .strokeColor(colors.black)
        .rect(startX, yPos, pageWidth, rowHeight)
        .stroke();

      let x = startX;
      const row = [
        invoice.invoiceNumber,
        invoice.customerNumber,
        invoice.status,
        invoice.paymentMode,
        `₹${formatNumber(invoice.totalAmount)}`,
        `₹${formatNumber(invoice.discountAmount)}`,
        formatDateDisplay(invoice.createdAt),
      ];

      doc.fontSize(8).font("Helvetica").fillColor(colors.black);

      row.forEach((txt, i) => {
        doc.text(txt, x + 3, yPos + 5, {
          width: colWidths[i] - 6,
          align: "center",
        });

        if (i < row.length - 1) {
          doc
            .lineWidth(0.5)
            .moveTo(x + colWidths[i], yPos)
            .lineTo(x + colWidths[i], yPos + rowHeight)
            .stroke();
        }
        x += colWidths[i];
      });

      yPos += rowHeight;
    });

    // ================= FOOTERS =================
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      drawPageFooter(i + 1, pages.count);
    }

    doc.end();
  });
};

// ==================== CSV REPORT ====================
const generateCSVReport = async (
  business,
  reportData,
  summary,
  fromDate,
  toDate,
) => {
  // Create a well-structured CSV with clear sections
  const csvRows = [];

  // Header Section
  csvRows.push({
    Section: "REPORT INFORMATION",
    Field: "Business Name",
    Value: business.name,
    "": "",
    " ": "",
    "  ": "",
    "   ": "",
    "    ": "",
    "     ": "",
    "      ": "",
  });
  csvRows.push({
    Section: "",
    Field: "GST Number",
    Value: business.gstNumber || "N/A",
  });
  csvRows.push({
    Section: "",
    Field: "Report Period",
    Value: `${fromDate} to ${toDate}`,
  });
  csvRows.push({
    Section: "",
    Field: "Generated On",
    Value: new Date().toLocaleString("en-IN"),
  });

  // Empty row separator
  csvRows.push({});

  // Summary Section
  csvRows.push({
    Section: "SUMMARY",
    Field: "Total Invoices",
    Value: summary.totalInvoices,
  });
  csvRows.push({
    Section: "",
    Field: "Total Amount (₹)",
    Value: summary.totalAmount,
  });
  csvRows.push({
    Section: "",
    Field: "Total Discount (₹)",
    Value: summary.totalDiscount,
  });
  csvRows.push({
    Section: "",
    Field: "Paid Invoices",
    Value: summary.paidCount,
  });
  csvRows.push({
    Section: "",
    Field: "Unpaid Invoices",
    Value: summary.unpaidCount,
  });
  csvRows.push({
    Section: "",
    Field: "Canceled Invoices",
    Value: summary.canceledCount,
  });

  // Empty row separator
  csvRows.push({});
  csvRows.push({});

  // Invoice data with proper headers
  const invoiceHeaders = {
    Section: "INVOICE DETAILS",
    Field: "Invoice Number",
    Value: "Customer Number",
    "": "Status",
    " ": "Payment Mode",
    "  ": "Total Amount (₹)",
    "   ": "Discount (₹)",
    "    ": "Invoice Date",
  };
  csvRows.push(invoiceHeaders);

  // Invoice data rows
  reportData.forEach((inv, index) => {
    csvRows.push({
      Section: index === 0 ? "" : "",
      Field: inv.invoiceNumber,
      Value: inv.customerNumber,
      "": inv.status,
      " ": inv.paymentMode,
      "  ": inv.totalAmount,
      "   ": inv.discountAmount,
      "    ": inv.createdAt,
    });
  });

  // Alternative:  Cleaner flat structure for better data processing
  const flatData = reportData.map((inv, index) => ({
    "S.No": index + 1,
    "Invoice Number": inv.invoiceNumber,
    "Customer Number": inv.customerNumber,
    Status: inv.status,
    "Payment Mode": inv.paymentMode,
    "Total Amount (₹)": inv.totalAmount,
    "Discount (₹)": inv.discountAmount,
    "Invoice Date": inv.createdAt,
    "Business Name": index === 0 ? business.name : "",
    "Report Period": index === 0 ? `${fromDate} to ${toDate}` : "",
  }));

  // Add summary at the end
  flatData.push({});
  flatData.push({
    "S.No": "",
    "Invoice Number": "SUMMARY",
    "Customer Number": "",
    Status: "",
    "Payment Mode": "",
    "Total Amount (₹)": "",
    "Discount (₹)": "",
    "Invoice Date": "",
  });
  flatData.push({
    "S.No": "",
    "Invoice Number": "Total Invoices:",
    "Customer Number": summary.totalInvoices,
    Status: "Paid:",
    "Payment Mode": summary.paidCount,
    "Total Amount (₹)": summary.totalAmount,
    "Discount (₹)": summary.totalDiscount,
    "Invoice Date": "",
  });
  flatData.push({
    "S.No": "",
    "Invoice Number": "",
    "Customer Number": "",
    Status: "Unpaid:",
    "Payment Mode": summary.unpaidCount,
    "Total Amount (₹)": "",
    "Discount (₹)": "",
    "Invoice Date": "",
  });
  flatData.push({
    "S.No": "",
    "Invoice Number": "",
    "Customer Number": "",
    Status: "Canceled:",
    "Payment Mode": summary.canceledCount,
    "Total Amount (₹)": "",
    "Discount (₹)": "",
    "Invoice Date": "",
  });

  const fields = Object.keys(flatData[0] || {});
  const parser = new Parser({
    fields,
    defaultValue: "",
    quote: '"',
    escapedQuote: '""',
  });

  const csv = parser.parse(flatData);

  // Add BOM for Excel UTF-8 compatibility
  const csvWithBom = "\uFEFF" + csv;

  return Buffer.from(csvWithBom, "utf-8").toString("base64");
};

// ==================== HELPER FUNCTIONS ====================

// Format number with commas (Indian numbering system)
const formatNumber = (num) => {
  const number = parseFloat(num);
  if (isNaN(number)) return "0. 00";

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Format date for display
const formatDateDisplay = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Sanitize filename
const sanitizeFileName = (name) => {
  return name.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
};

module.exports = router;
