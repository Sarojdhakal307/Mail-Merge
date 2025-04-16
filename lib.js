const { get } = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { WEB_APP_URL } = process.env;

async function getSheetData() {
  try {
    const response = await get(`${WEB_APP_URL}?action=sheet`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return null;
  }
}

async function getEmailTemplate(subject) {
  try {
    const response = await get(
      `${WEB_APP_URL}?action=template&subject=${encodeURIComponent(subject)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching email template:", error);
    return null;
  }
}

module.exports = {
  getSheetData,
  getEmailTemplate,
};
