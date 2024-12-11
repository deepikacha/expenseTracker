// const brevo = require('@getbrevo/brevo');
// let defaultClient = brevo.ApiClient.instance;

// let apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

// let apiInstance = new brevo.TransactionalEmailsApi();
// let sendSmtpEmail = new brevo.SendSmtpEmail();
   
// exports.sendMail=(email)=>{
  
// sendSmtpEmail.subject = "forgot password";
// sendSmtpEmail.htmlContent = `<html><body><h1>Password Reset</h1><p>Use this link to reset your password: <a href="http://localhost:3000/password/resetpassword/${forgotPasswordRequest.id}">Reset Password</a></p></body></html>`;
// sendSmtpEmail.to = [{ email }];
// sendSmtpEmail.sender = { email: 'deepikachalla9@gmail.com', name: 'Challa Deepika' };



// apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
//   console.log('API called successfully. Returned data: ' + JSON.stringify(data));
//   return data;
// }, function (error) {
//   console.error(error);
// });
// }






let SibApiV3Sdk2 = require('sib-api-v3-sdk');
let defaultClient2 = SibApiV3Sdk2.ApiClient.instance;

// Configure API key authorization: api-key
let apiKey2 = defaultClient2.authentications['api-key'];
apiKey2.apiKey = process.env.SENDINBLUE_API_KEY;

// Uncomment below two lines to configure authorization using: partner-key
// var partnerKey = defaultClient.authentications['partner-key'];
// partnerKey.apiKey = 'YOUR API KEY';
exports.sendMail2=()=>{


 let apiInstance2 = new SibApiV3Sdk2.TransactionalEmailsApi();

let sendSmtpEmail2 = new SibApiV3Sdk2.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

sendSmtpEmail2 = {
    to: [{
        email: 'testmail@example.com',
        name: 'John Doe'
    }],
    templateId: 59,
    params: {
        name: 'John',
        surname: 'Doe'
    },
    headers: {
        'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
    }
};

apiInstance2.sendTransacEmail(sendSmtpEmail2).then(function(data) {
  console.log('API called successfully. Returned data: ' + data);
}, function(error) {
  console.error(error);
})
}
