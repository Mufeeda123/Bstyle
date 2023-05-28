const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;
 module.exports={ 
  userStatus:(userId)=>{
    return new Promise(async(resolve,reject)=>{
       await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({_id:objectId(userId)}).then((user)=>{
        console.log(user);
        let userStaus= user.blockUsers
        resolve(userStaus)
      })
    })
  }
}