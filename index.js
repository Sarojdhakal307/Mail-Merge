const express = require("express");
const { getSheetData, getEmailTemplate } = require("./lib");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true })); // To parse form data
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
  // console.log("Request received at /");
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mail Merge Form</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @keyframes fadeSlideIn {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadeSlideIn {
        animation: fadeSlideIn 0.8s ease-out forwards;
      }
    </style>
  </head>
  <body class="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white min-h-screen flex items-center justify-center p-4">
    <div class="bg-gray-800/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 max-w-xl w-full animate-fadeSlideIn">
      <h2 class="text-3xl font-extrabold text-center text-blue-400 mb-4">ASCOL IT CLUB MAIL MERGE</h2>
      <p class="text-gray-300 text-center mb-6">
        Welcome to the ASCOL IT Club Mail Merge application.<br>
        Please fill in the details below to send personalized emails.
      </p>

      <form action="/sendmail" method="POST" class="space-y-6">
        <div>
          <label for="Subject" class="block text-sm font-medium text-gray-200">Subject:</label>
          <input type="text" id="Subject" name="Subject" required
                 class="mt-1 w-full px-4 py-2 border border-gray-700 bg-gray-900 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label for="Password" class="block text-sm font-medium text-gray-200">Password:</label>
          <input type="password" id="Password" name="Password" required
                 class="mt-1 w-full px-4 py-2 border border-gray-700 bg-gray-900 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="flex justify-center">
          <button type="submit"
                  class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition duration-300">
            🚀 Send Mail
          </button>
        </div>
      </form>

      <div class="mt-8 text-sm text-gray-400 space-y-2 text-center">
        <p><strong>Note:</strong> Please enter the same subject as in your mail draft.</p>
        <p>Please take the password from the club members.</p>
        <p>
          Update the Google Sheet to send mail to the respective person: 
          <a href="${process.env.SHEET_URL}" class="text-blue-400 underline hover:text-blue-300 transition">Click here</a>
        </p>
      </div>
    </div>
  </body>
</html>

  `);
});

app.post("/sendmail", async (req, res) => {
  const { Subject, Password } = req.body;
  // console.log("Request received at /sendmail", req.body);
  // console.log("Password:", process.env.PASSWORD);
  if (!Subject || !Password) {
    return res.status(400).send("Subject and Password are required");
  }
  if (Password !== process.env.PASSWORD) {
    return res.status(401).send("Unauthorized: Invalid Password");
  }

  try {
    const sheetData = await getSheetData();
    const template = await getEmailTemplate(Subject);
    // console.log("Sheet Data:", sheetData);
    // console.log("Email Template:", template);

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
      // console.log(`Email sent to ${Email}`);
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
  console.log(`App listening `);
});
