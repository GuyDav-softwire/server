require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');
const cors = require('cors');
const handlebars = require('handlebars');
const { promisify } = require('util');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb' }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});   

const readFile = promisify(fs.readFile);

const transport = nodemailer.createTransport(mailjetTransport({
  auth: {
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_SECRET_KEY,
  }
}))

async function sendEmail({ email, subject, message }) {
    let html = await readFile('emailTemplate.html', 'utf-8')
    let template = handlebars.compile(html);
    let data = {
      username: 'Bora Job',
    }
    let htmlToSend = template(data);

    const mail = {
      from: 'aridem.test01@gmail.com',
      to: 'guy.david@softwire.com',
      subject: 'Parking Confirmation',
      html: htmlToSend,
    };

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
