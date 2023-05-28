const db = require("../../config/connection");
const collection = require("../../config/collection");
const objectId = require("mongodb").ObjectId;

module.exports = {
  addProduct: (product) => {
    product.price = parseInt(product.price)
    return new Promise(async (resolve, reject) => {

      try {
        await db
          .get()
          .collection("product")
          .insertOne(product)
          .then((data) => {
            resolve(data);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  getAllProduct: (user_id) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(user_id,'user_id');
        const products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .toArray();
          const wishlist = await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .findOne({user:objectId(user_id)})

          console.log(wishlist,"===============");
          

        //   for (let i = 0; i < products.length; i++) {
        //     for (let j = 0; j < wishlist.products.length; j++) {
        //         if (wishlist.products[j].item == products[i]._id) {
        //           console.log("true");
        //             products[i].fav = true;
        //         }
        //     }
        // }

        console.log(products,'sdfas');
        resolve(products);
      } catch (error) {
        reject(error);
      }
    });
  },
  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: objectId(proId) })
          .then((product) => {
            resolve(product);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  updateProduct: (proId, proDetails) => {
    proDetails.price = parseInt(proDetails.price)
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: objectId(proId) },
            {
              $set: {
                product: proDetails.product,
                Category: proDetails.Category,
                author: proDetails.author,
                price: proDetails.price,
                image: proDetails.image,
              },
            }
          )
          .then((response) => {
            resolve();
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteproduct: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .deleteOne({ _id: objectId(proId) })
          .then((response) => {
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
};
