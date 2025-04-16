const express = require("express");
const { getSheetData, getEmailTemplate } = require("./lib");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sarojdhakal.dev@gmail.com",
    pass: "txgf abzn jifa fqnj", // App Password
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/sendmail", async (req, res) => {
  const { Subject } = req.body;
  try {
    const sheetData = await getSheetData();
    const template = await getEmailTemplate(Subject); // Change to your Gmail draft subject

    if (!template || template.error) {
      return res.status(404).send("Email draft template not found");
    }

    for (const person of sheetData) {
      const { Name, Email, PhoneNumber } = person;

      const customizedBody = template.body
        .replace(/{{Name}}/g, Name)
        .replace(/{{PhoneNumber}}/g, PhoneNumber);

      const mailOptions = {
        from: "sarojdhakal.dev@gmail.com",
        to: Email,
        subject: template.subject,
        html: customizedBody,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${Email}`);
    }

    res.send("All emails sent!");
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).send("Something went wrong!");
  }
});

app.listen(port, () => {
  console.log(`App listening `);
});
