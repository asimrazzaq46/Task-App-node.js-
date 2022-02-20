const dotenv = require("dotenv");

dotenv.config({ path: "config/config.env" });
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomEmail = (email, name) => {
  sgMail.send({
    to: email, // Change to your recipient
    from: "MYemail@hotmail.com", // Change to your verified sender
    subject: "TESTING",
    text: `hye ${name},this is my first email from postman`,
  });
};

const sendCancellatioEmail = (email, name) => {
  sgMail.send({
    to: email, // Change to your recipient
    from: "MYemail@hotmail.com", // Change to your verified sender
    subject: "TESTING",
    text: `good bye ${name},this is my second email from postman`,
  });
};

module.exports = { sendWelcomEmail, sendCancellatioEmail };
