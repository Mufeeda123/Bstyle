const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;
 module.exports={ 
    editUser:(data,userId)=>{
        return new Promise(async(resolve,reject)=>{
    
            if(data.name){
                await user.findOneAndUpdate({id:userId},{$set:{userName:data.name}})
            }if(data.phone){
                await user.findOneAndUpdate({id:userId},{$set:{phone:data.phone}})
            }
            resolve()
        })
    },
    
    
    }