const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;
 module.exports={ 
  wishlistcolor:(userId)=>{
    return new Promise(async(resolve,reject)=>{
       await db
      .get()
      .collection(collection.WISHLIST_COLLECTION)
      .findOne({_id:objectId(userId)}).then((product)=>{
        console.log(product);
        let  wishlistcolor= user.product.flag
        resolve( wishlistcolor)
      })
    })
  }
}