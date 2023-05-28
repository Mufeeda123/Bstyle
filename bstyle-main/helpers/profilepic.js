
const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");
const objectId = require("mongodb").ObjectId;
module.exports = {
    profilePicChange: (image, user) => {
        console.log("llllll");
        return new Promise(async (resolve, reject) => {
            const userProfile = await db
                .get()
                .collection(collection.PROFILE_COLLECTION)
                .findOne({ user: user });
                console.log(userProfile,"gggggggggggggggggggggggggggggggggggggggggggggggg");
            if (userProfile) {
                console.log("aaaaaaaaaaaa");
                await db
                .get()
                .collection(collection.PROFILE_COLLECTION)
                .findOneAndUpdate({ user: user }, { $set: { imageUrl: image } })
                resolve()
            } else {
                console.log('ssssssssssssss');
               db.get()
                 .collection(collection.PROFILE_COLLECTION)
                 .insertOne({  user: user,imageUrl: image})
                .then(() => {
                    resolve()
                })
            }
        })
    }
}