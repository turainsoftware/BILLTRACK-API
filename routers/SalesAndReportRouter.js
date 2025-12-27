const express = require("express");
const { Invoice } = require("../models/Invoice");
const { jwtMiddleware } = require("../middleware/JwtMiddlware");
const { User } = require("../models/User");
const { Op } = require("sequelize");
const router = express.Router();

const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate, endDate, previousStartDate, previousEndDate;

  switch (period.toLowerCase()) {
    case "today":
      startDate = new Date(today);
      endDate = new Date(now);
      previousStartDate = new Date(today);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousEndDate = new Date(today);
      break;

    case "week":
      // Current week (last 7 days)
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      endDate = new Date(now);
      // Previous week
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      previousEndDate = new Date(startDate);
      break;

    case "month":
      // Current month (last 30 days)
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      endDate = new Date(now);
      // Previous month
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      previousEndDate = new Date(startDate);
      break;

    case "3months":
      // Last 3 months (90 days)
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 89);
      endDate = new Date(now);
      // Previous 3 months
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 90);
      previousEndDate = new Date(startDate);
      break;

    case "6months":
      // Last 6 months (180 days)
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 179);
      endDate = new Date(now);
      // Previous 6 months
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 180);
      previousEndDate = new Date(startDate);
      break;

    default:
      throw new Error(
        "Invalid period. Use: today, week, month, 3months, or 6months"
      );
  }

  return { startDate, endDate, previousStartDate, previousEndDate };
};

const getMonthLabels = (startDate, count) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const labels = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    labels.push(monthNames[date.getMonth()]);
  }

  return labels;
};

const getDayLabels = (period, startDate) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  switch (period.toLowerCase()) {
    case "today":
      // Show hourly data for today (simplified to 7 time blocks)
      return ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM", "11PM"];

    case "week":
      // Last 7 days
      const labels = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(daysOfWeek[date.getDay()]);
      }
      return labels;

    case "month":
      // Show weekly data (5 weeks)
      const monthBucketLabels = [];
      const mNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      for (let i = 0; i < 5; i++) {
        const wStart = new Date(startDate);
        wStart.setDate(wStart.getDate() + i * 7);

        const wEnd = new Date(wStart);
        wEnd.setDate(wStart.getDate() + 6);

        const sDay = wStart.getDate();
        const eDay = wEnd.getDate();
        const sMonth = mNames[wStart.getMonth()];
        const eMonth = mNames[wEnd.getMonth()];

        if (wStart.getMonth() === wEnd.getMonth()) {
          monthBucketLabels.push(`${sDay}-${eDay} ${eMonth}`);
        } else {
          monthBucketLabels.push(`${sDay} ${sMonth}-${eDay} ${eMonth}`);
        }
      }
      return monthBucketLabels;

    case "3months":
      // Show actual month names
      return getMonthLabels(startDate, 3);

    case "6months":
      // Show actual month names
      return getMonthLabels(startDate, 6);

    default:
      return [];
  }
};

const getMonthIndex = (invoiceDate, startDate) => {
  const invoiceYear = invoiceDate.getFullYear();
  const invoiceMonth = invoiceDate.getMonth();
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();

  return (invoiceYear - startYear) * 12 + (invoiceMonth - startMonth);
};

const aggregateSalesData = async (businessId, startDate, endDate, period) => {
  const invoices = await Invoice.findAll({
    where: {
      businessId,
      status: "paid",
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
    attributes: ["totalAmount", "createdAt"],
    order: [["createdAt", "ASC"]],
    raw: true,
  });

  const labels = getDayLabels(period, startDate);
  const data = new Array(labels.length).fill(0);

  invoices.forEach((invoice) => {
    const invoiceDate = new Date(invoice.createdAt);
    let index;

    switch (period.toLowerCase()) {
      case "today":
        // Group by hours (0-3, 4-7, 8-11, 12-15, 16-19, 20-23)
        const hour = invoiceDate.getHours();
        if (hour < 4) index = 0;
        else if (hour < 8) index = 1;
        else if (hour < 12) index = 2;
        else if (hour < 16) index = 3;
        else if (hour < 20) index = 4;
        else if (hour < 23) index = 5;
        else index = 6;
        break;

      case "week":
        // Calculate days difference from start date
        const daysDiff = Math.floor(
          (invoiceDate - startDate) / (1000 * 60 * 60 * 24)
        );
        index = Math.min(daysDiff, 6);
        break;

      case "month":
        // Group by weeks (7 days each)
        const weeksDiff = Math.floor(
          (invoiceDate - startDate) / (1000 * 60 * 60 * 24 * 7)
        );
        index = Math.min(weeksDiff, 4);
        break;

      case "3months":
        // Group by actual calendar months
        index = getMonthIndex(invoiceDate, startDate);
        index = Math.max(0, Math.min(index, 2));
        break;

      case "6months":
        // Group by actual calendar months
        index = getMonthIndex(invoiceDate, startDate);
        index = Math.max(0, Math.min(index, 5));
        break;

      default:
        index = 0;
    }

    if (index >= 0 && index < data.length) {
      data[index] += parseFloat(invoice.totalAmount);
    }
  });

  return data.map((value, idx) => ({
    value: Math.round(value * 100) / 100,
    label: labels[idx],
  }));
};

router.get("/sales", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};
    const { period = "week" } = req.query; // Default to 'week'

    // Validate businessId
    if (!businessId || isNaN(businessId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid Business",
      });
    }

    if (
      !["today", "week", "month", "3months", "6months"].includes(
        period.toLowerCase()
      )
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid period",
      });
    }

    // Get date ranges
    const { startDate, endDate, previousStartDate, previousEndDate } =
      getDateRange(period);

    // Get current period total sales
    const currentSales = await Invoice.sum("totalAmount", {
      where: {
        businessId,
        status: "paid",
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Get previous period total sales
    const previousSales = await Invoice.sum("totalAmount", {
      where: {
        businessId,
        status: "paid",
        createdAt: {
          [Op.between]: [previousStartDate, previousEndDate],
        },
      },
    });

    // Get aggregated data for chart
    const chartData = await aggregateSalesData(
      businessId,
      startDate,
      endDate,
      period
    );

    // Prepare response
    const response = {
      totalSales: Math.round((currentSales || 0) * 100) / 100,
      previousTotalSales: Math.round((previousSales || 0) * 100) / 100,
      data: chartData,
      period: period,
      dateRange: {
        current: {
          from: startDate.toISOString().split("T")[0],
          to: endDate.toISOString().split("T")[0],
        },
        previous: {
          from: previousStartDate.toISOString().split("T")[0],
          to: previousEndDate.toISOString().split("T")[0],
        },
      },
    };

    res.status(200).json({
      status: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Error generating sales report",
    });
  }
});

module.exports = router;
