const db = require("../../config/connection");
const collection = require("../../config/collection");
// const client = require("twilio")(
//   "ACb64196ee52edb251cac1f7b22a64abc2",
//   "149ef1cb9339a65981aece8a107147ff "
// );
const accountSid ="ACf74d02739c3230666663719f493c8f6d";
const authToken = "29c268ed89504516d03796002ddb24c9";
const client = require('twilio')(accountSid, authToken);

const serviceSid = "VA6af172b4f1da74749d38859563702833";

module.exports = {
  dosms: (noData) => {
    let resp;
    return new Promise(async (resolve, reject) => {
     try {
       const isUser = await db
         .get()
         .collection(collection.USER_COLLECTION)
         .findOne({ mobile: noData.mobile })
         .then((data) => {
           if (data) {
             client.verify
               .services(serviceSid)
               .verifications.create({
                 to: `+91${noData.mobile}`,
                 channel: "sms",
               })
               .then((res) => {
                 resp.valid = true;
                 console.log(res);
                 resolve({ res, data, status: true });
               });
             resolve({ data, status: true });
           } else {
             resolve({ status: false });
           }
           return data;
         });
     } catch (error) {
      reject(error);
     }
    });
  },
  otpVerify: (otpData, nuData) => {
    let resp = {};
    return new Promise(async (resolve, reject) => {
      try {
        const user = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ mobile: otpData.mobile });
        client.verify
          .services(serviceSid)
          .verificationChecks.create({
            to: `+91${otpData.mobile}`,
            code: otpData.otp,
          })
          .then((resp) => {
            resolve({ resp, user });
          });
      } catch (error) {
        reject(error);
      }
    });
  },
};
