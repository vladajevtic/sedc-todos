const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'vladajevtic07@gmail.com',
        subject: "Welcome to my app",
        text: `hellooo ${name}, greetings to you!`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'vladajevtic07@gmail.com',
        subject: ":/ i'm sad",
        text: `goodbye ${name}!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}