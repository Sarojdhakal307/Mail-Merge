const { get } = require("axios");

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxGZXtTpXDoo8dkpudupLoJb4gfXOaBaT9D_4AbyTNLx-ukrKD8OkRnZrg5Xj0WVa8hww/exec';

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
    const response = await get(`${WEB_APP_URL}?action=template&subject=${encodeURIComponent(subject)}`);
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
