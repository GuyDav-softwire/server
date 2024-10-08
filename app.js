require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
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

const transport = nodemailer.createTransport({
  service: 'Mailjet',
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY,
  }
})

async function sendEmail({ 
  emailAddress, 
  paymentMethod, 
  stationName,
  carParkName,
  fromDateTimeString,
  untilDateTimeString,
  regEntry,
  contactNumber,
  totalPriceInPounds,
}) {
    let html = await readFile('emailTemplate.html', 'utf-8')
    let template = handlebars.compile(html);
    let data = {
      stationName: stationName,
      carParkName: carParkName,
      fromDateTimeString: fromDateTimeString,
      untilDateTimeString: untilDateTimeString,
      regEntry: regEntry,
      contactNumber: contactNumber,
      totalPriceInPounds: totalPriceInPounds,
      paymentMethod: paymentMethod,
    }
    let htmlToSend = template(data);

    const mail = {
      from: 'aridem.test01@gmail.com',
      to: emailAddress,
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
    .then(() => res.send())
    .catch((error) => res.status(500).send(error.message));
});

app.listen(port, () => {
  console.log(`nodemailerProject is listening at http://localhost:${port}`);
});
