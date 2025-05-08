const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const validator = require("validator"); 

const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const validateEmail = (email) => {
  return validator.isEmail(email);
};

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});
app.post("/send-email", async (req, res) => {
  const { name, email, contact, message } = req.body;

  if (!name || !email || !contact || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (!/^\+?[0-9]{10,15}$/.test(contact)) {
    return res.status(400).json({ message: "Invalid contact number format" });
  }

  const transporter = () => {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  };

//   const mailOptions = {
//     from: process.env.MAIL_USER,
//     to: email, 
//     subject: "Prospective Tenant Reached Out – View Details Inside",
//     text: `Dear Owner,

// You have received a new inquiry from a potential tenant.
// Here are the Details:
// Name: ${name}
// Email: ${email}
// Contact Number: ${contact}

// Message:
// ${message}

// Please reach out to the tenant at your earliest convenience.

// Thank you,
// Your Property Listing Platform`,
//   };

const mailOptions = {
  from: process.env.MAIL_USER,
  to: email,
  subject: "Prospective Tenant Reached Out – View Details Inside",
  html: `
    <div style="text-align: center;">
      <img src="cid:propertyImage" alt="Property Image" width="200" />
    </div>
    <p>Dear Owner,</p>
    <p>You have received a new inquiry from a potential tenant.</p>
    <p><strong>Name:</strong> ${name}<br/>
    <strong>Email:</strong> ${email}<br/>
    <strong>Contact Number:</strong> ${contact}</p>
    <p><strong>Message:</strong><br/>${message}</p>
    <p>Please reach out to the tenant at your earliest convenience.</p>
    <p>Thank you,<br/>Your Property Listing Platform</p>
  `,
  attachments: [
    {
      filename: 'property.jpg',
      path: path.join(__dirname, 'public/images/property.jpg'), 
      cid: 'propertyImage'
    }
  ]
};


  try {
    
    await transporter().sendMail(mailOptions);
    res.json({ message: "Your inquiry has been sent successfully. Owner will contact you shortly!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
