require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb' }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});     

const transport = nodemailer.createTransport(mailjetTransport({
  auth: {
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_SECRET_KEY,
  }
}))

const mail = {
  from: 'aridem.test01@gmail.com',
  to: 'guy.david@softwire.com',
  subject: 'Hello',
  text: 'Hello World',
  html: '<style>h1 {font-family:Comic Sans MS;}</style><h1>I love Comics Sans</h1>',
};

async function sendEmail({ email, subject, message }) {
    try {
      const info = await transport.sendMail(mail);
      console.log(info);
    } catch (error) {
      console.log(error)
    }
}
  
app.get("/", (req, res) => {
  sendEmail(req.query)
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});

app.listen(port, () => {
  console.log(`nodemailerProject is listening at http://localhost:${port}`);
});
