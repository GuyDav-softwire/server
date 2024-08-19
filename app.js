require('dotenv').config();
const express = require('express');
const cors = require('cors');
const handlebars = require('handlebars');
const { promisify } = require('util');
const fs = require('fs');
const app = express();
const port = 5000;
const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY,
);

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb' }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

async function makeTemplate(name, paymentMethod) {
  const readFile = promisify(fs.readFile);

  let html = await readFile('emailTemplate.html', 'utf-8')
  let template = handlebars.compile(html);
  let data = {
    name: name,
    paymentMethod: paymentMethod
  }

  return template(data);
}

async function sendEmail(email, name, paymentMethod) {
  let htmlToSend = await makeTemplate(name, paymentMethod);
  email = String(email);

  const request = mailjet
          .post('send', { version: 'v3.1' })
          .request({
            Messages: [
              {
                From: {
                  Email: "aridem.test01@gmail.com",
                  Name: "Test email"
                },
                To: [
                  {
                    Email: 'guy.david@softwire.com',
                    Name: "Parking User"
                  }
                ],
                Subject: "Parking confirmaton",
                TextPart: "test",
                HTMLPart: htmlToSend
              }
            ]
          })

  request
      .then((result) => {
          console.log(result.body)
      })
      .catch((err) => {
          console.log(err)
      })
}

app.get("/", (req, res) => {
  sendEmail(req.query)
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});

app.listen(port, () => {
  console.log(`nodemailerProject is listening at http://localhost:${port}`);
});
