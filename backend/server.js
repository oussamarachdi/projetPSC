const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 4000;
const multer = require("multer");

const storage = multer.diskStorage({
  destination : function(req, file, cb){
    cb(null, 'uploads');
  },
  filename : function(req, file, cb){
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
})

const upload = multer({storage});

require("dotenv").config();

app.use(cors());
app.use(express.json()); // Use express.json() to parse incoming JSON data

function sendEmail({ type, address, tel, date, imgPath }) {
    const attatchements = imgPath.map((image) => ({
      filename : image.filename,
      path : image.path
    }))
    const html = `
      <h3>Name : test</h3>
      <p>Location : ${address.lat} ${address.lng} </p>
      <p>Phone Number : ${tel}</p> 
      <p>Temps Valable : </p>
      <p>jour début : ${date.startDate}</p>
      <p>jour Fin : ${date.endDate}</p>
    `;
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "rachdioussama33@gmail.com",
        pass: "Oussama@rachdi#987", // Secure your password in an environment variable
      },
    });
  
    const mail_configs = {
      from: {
        name: "Oussama Rachdi",
        address: "rachdioussama33@gmail.com",
      },
      to: "oussama.rachdi@polytechnicien.tn",
      subject: `New Donation : ${type}`,
      html: html,
      attatchements:attatchements
    };
  
    return new Promise((resolve, reject) => {
      transporter.sendMail(mail_configs, (error, info) => {
        if (error) {
          console.error(error);
          return reject({ message: "An error occurred" });
        }
  
        return resolve({ message: "Email sent successfully" });
      });
    });
  }


  

// Change to POST request for better security
app.post("/api", upload.array('img'), (req, res) => {

  const type = req.body.type;
  const address = req.body.address;
  const tel = req.body.tel;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const imgPath = req.files;

  console.log(imgPath)

  const date = {
    startDate,
    endDate
  }

  // Check if address object exists before accessing its properties
  if (address) {
    sendEmail({ type, address, tel, date, imgPath })
      .then((response) => res.send(response.message)) // Send response to client
      .catch((error) => res.status(500).send(error.message)); // Handle errors with proper status code
  } else {
    console.error("Address information is missing in donation data.");
    res.status(400).send("Missing address information in donation data."); // Inform client about missing data
  }
});



app.listen(port, () => {
  console.log(`nodemailer is listening at http://localhost:${port}`);
});
