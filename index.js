const express = require("express");
const { getSheetData, getEmailTemplate } = require("./lib");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 3000;

// Parse JSON bodies (for POST requests)
app.use(express.json());

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL,
    pass: process.env.APP_PASS, // App Password
  },
});

app.get("/", (req, res) => {
  console.log("Request received at /");
  res.send("ASCOL IT CLUB MAIL MERGE!");
});

app.post("/sendmail", async (req, res) => {
  const { Subject, Password } = req.body;
  console.log("Request received at /sendmail", req.body);
  console.log("Subject:", process.env.PASSWORD);
  if (!Subject || !Password) {
    return res.status(400).send("Subject and Password are required");
  }
  if (Password !== process.env.PASSWORD) {
    return res.status(401).send("Unauthorized: Invalid Password");
  }

  try {
    const sheetData = await getSheetData();
    const template = await getEmailTemplate(Subject);
    console.log("Sheet Data:", sheetData);
    console.log("Email Template:", template);

    if (!template || template.error) {
      return res.status(404).send("Email draft template not found");
    }

    const sentEmails = [];

    for (const person of sheetData) {
      const { Name, Email, PhoneNumber } = person;

      const customizedBody = template.body.replace(/{{(.*?)}}/g, (_, key) => {
        return person[key.trim()] || "";
      });

      const mailOptions = {
        from: process.env.MAIL,
        to: Email,
        subject: template.subject,
        html: customizedBody,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${Email}`);
      sentEmails.push(Email);
    }

    res.send({
      message: "All emails sent successfully!",
      sentTo: sentEmails,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).send("Something went wrong!");
  }
});

app.listen(port, () => {
  console.log(`App listening ${port}`);
});
