const { default: axios } = require("axios");
const { API_KEY, CALLBACK_DATA, CODING, OTP_TEMPLATE_ID, SENDER_ID, INVOICE_TEMPLATE_ID, SMS_API } = require("../config/sms.config");

class SmsService {
  async sentInvoiceSms({ billAmount, invoiceNumber, businessName, phone }) {
    try {
      const data = {
        api_key: API_KEY,
        // msg: `${otp} is your one time password (OTP). Please do not share the OTP with others. Team BillTrack.`,
        msg: `Dear Customer, Thank you for visiting us! Your Total Bill Amount: ${billAmount}. Your Bill https://restaurants.billtrack.co.in/?${invoiceNumber} For any queries, feel free to contact us at ${businessName}.`,
        senderid: SENDER_ID,
        templateID: INVOICE_TEMPLATE_ID,
        coding: CODING,
        to: phone,
        callbackData: CALLBACK_DATA,
      };
      await axios.post(SMS_API, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${API_KEY}`,
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

const smsService = new SmsService();

module.exports = { smsService };
