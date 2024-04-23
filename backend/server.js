const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;
const multer = require("multer");

const storage = multer.diskStorage({
  destination : function(req, file, cb){
    if(file.mimetype.startsWith('image')){
      cb(null, 'uploads')
    }else{
      cb(null, false)
    }
  },
  filename : function(req, file, cb){
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  },
  limits:{
    fileSize : 1024 * 1024 * 2 // 2MB
  }
})

const upload = multer({storage});



app.use(cors());
app.use(express.json()); // Use express.json() to parse incoming JSON data

function sendEmail({ name, type, address, tel, date, imgPath }) {
    console.log(name, type, address, tel, date, imgPath)
    const attatchements = imgPath.map((image) => ({
      filename : image.filename,
      path : image.path
    }))
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Donation Notification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5; /* Light gray background */
        }
    
        h1 {
          text-align: center;
          font-size: 24px;
          color: #333; /* Dark gray for main heading */
          margin-bottom: 20px;
        }
    
        h3, h4 {
          font-size: 18px;
          color: #666; /* Lighter gray for subheadings */
          margin-bottom: 5px;
        }
    
        p {
          text-align: center;
          font-style: italic;
          color: #999; /* Even lighter gray for text */
          margin-bottom: 10px;
        }
    
        .info-section {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
    
        .info-section > div {
          flex: 1;
          margin-right: 20px;
        }
    
        .info-section > div:last-child {
          margin-right: 0;
        }
    
        .phone-number {
          font-weight: bold;
          color: #007bff; /* Blue for phone number */
        }
    
        .call-to-action {
          text-align: center;
          font-weight: bold;
          margin-top: 20px;
          color: #28a745; /* Green for call to action */
        }
      </style>
    </head>
    <body>
      <h1>New Donation Notification</h1>
    
      <div class="info-section">
        <div>
          <h3>Donor:</h3>
          <p>${name}</p>
        </div>
        <div>
          <h3>Location:</h3>
          <p>Sousse</p>
          <p>Sahloul</p>
        </div>
        <div>
          <h3>Coordinates:</h3>
          <p>${address.lat}, ${address.lng}</p>
          <p style="color:red;">Don't forget to copy and paste these coordinates into Google Maps.</p>
        </div>
        <div class="phone-number">
          <h3>Phone Number:</h3>
          <p>${tel}</p>
        </div>
        <div>
          <h3>Available Dates:</h3>
          <p>Start Date: ${date.startDate}</p>
          <p>End Date: ${date.endDate}</p>
        </div>
      </div>
    
      <h3 class="call-to-action">What are you waiting for? Call the donor and get more information!</h3>
    
    </body>
    </html>
    
    `;
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.APP_PASSWORD, // Secure your password in an environment variable
      },
    });
  
    const mail_configs = {
      from: {
        name: "Oumeima Rachdi",
        address: process.env.EMAIL_ADDRESS,
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
  const name = req.body.name;
  const type = req.body.type;
  const address = req.body.address;
  const tel = req.body.tel;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const imgPath = req.files;


  const date = {
    startDate,
    endDate
  }

  // Check if address object exists before accessing its properties
  if (address) {
    sendEmail({ name, type, address, tel, date, imgPath })
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
