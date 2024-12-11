const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      secure: true,
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL,  // My email address
        pass: process.env.PASSWORD,  // My email password
      },
    });
  }

  async sendEmail(to, subject, html) {
    const mailOptions = {
      to,
      subject, 
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      // console.log('Email sent: ' + info.response);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();