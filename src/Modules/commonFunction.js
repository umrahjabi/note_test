var nodemailer = require('nodemailer');
var fcm = require('fcm-notification');
var FCM = new fcm('online-logistics-firebase-adminsdk-92ccs-81635f7208.json'); 


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'techfluper@gmail.com',
      pass: 'nveqxlmzphmpvwkh'
    }
  });

exports.sendmail= function(otp,email){
    var mailOptions = {
        from: 'techfluper@gmail.com',
        to: email,
        subject: 'OTP verification',
        text: 'Your OTP verification code : '+otp
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
exports.sendNotification = function(){
  var token = 'cBh02UZcmfo:APA91bF68hMJ1rkYqSqi1GBeHMdSQq-eQKQNPtDpIZL8DwJ0HOGkcqPxZTZqnDunxkyQQNoD6SWG12ysiMvtIcLYfIA_6GJe9p33k57SPn-n39KhQJyCg3IM9DzEvbIckbN1CQPMirPA';
 
    var message = {
        data: {    //This is only optional, you can send any data
            score: '850',
            time: '2:45'
        },
        notification:{
            title : 'Title of notification',
            body : 'Body of notification'
        },
        token : token
        };
 
FCM.send(message, function(err, response) {
    if(err){
        console.log('error found', err);
    }else {
        console.log('response here', response);
    }
})
}