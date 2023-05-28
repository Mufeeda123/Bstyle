const db = require("../../config/connection");
const collection = require("../../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("../../app");
const { PRODUCT_COLLECTION } = require("../../config/collection");
const objectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
const { resolve } = require("path");
const { v4: uuidv4 } = require("uuid");
const { log } = require("console");
const uniqid = require("uniqid");

const profilepic=require("../../helpers/profilepic")
const editprofile=require("../../helpers/editprofile")

var instance = new Razorpay({
  key_id: "rzp_test_2QPRJfwv1TIYjS",
  key_secret: "ibu7PoN3iGLy3zGCa3RDWOXC",
});
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: 'Gmail',

  auth: {
    user: 'Bstylewebsite@gmail.com',
    pass: 'steubbsjvxvauumn',
  }

});
let otp=Math.random()
otp=otp*1000000
otp=parseInt(otp)
console.log(otp);



module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
    try {
        const isUser = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ mobile: userData.number })
          .then((data) => {
            resolve({ data, status: false });
            return data;
          });
        if (!isUser) {
          userData.password = await bcrypt.hash(userData.password1, 10);
          const user = {
            name: userData.name,
            email: userData.email,
            mobile: userData.number,
            password: userData.password,
            address:userData.address,
            blockUsers: false,
          };
          db.get()
            .collection(collection.USER_COLLECTION)
            .insertOne(user)
            .then((data) => {
              resolve(data.insertedId);
            });
        }
    } catch (error) {
      reject(error);
    }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
     try {
       const loginStatus = false;
       const response = {};
       const user = await db
         .get()
         .collection(collection.USER_COLLECTION)
         .findOne({ email: userData.email, blockUsers: false });
       if (user) {
         bcrypt.compare(userData.password, user.password).then((status) => {
           if (status) {
             response.user = user;
             response.status = true;
             resolve(response);
           } else {
             resolve({ status: false });
           }
         });
       } else {
         resolve({ status: false });
       }
     } catch (error) {
      reject(error);
     }
    });
  },
  // userStatus:(userId)=>{
  //   return new Promise(async(resolve,reject)=>{
  //     await userModel.findOne({_id:userId}).then((user)=>{
  //       let userStaus=user.type
  //       resolve(userStatus)
  //     })
  //   })
  // },
  // productpage:async(req,res)=>{
  //   let proId=req.params.id
  //    let product=  await db
  //     .get()
  //     .collection(collection.PRODUCT_COLLECTION)
  //     .findOne({_id:objectId(req,res)}).then((user)=>{
  //       console.log(user);
       
  //     })
      
  // },

  //forgot password start
  forgotpassword: (req, res) => {
    console.log('got forgot password');
    res.render('user/forgotpassword');  //registered mail page
},

resetpassword: async (req, res) => {
    console.log('entered resetpassword');
    const userEmail = req.body.email;
    req.session.email = userEmail;
    console.log(userEmail);
    console.log('got user email');
    // const user = await UserModel.findOne({ $and: [{ email: userEmail.email }, { status: "Unblocked" }] });
    const user = await db
    .get()
    .collection(collection.USER_COLLECTION)
    .findOne({ email: userEmail, blockUsers: false });
    console.log('found user');
    if (!user) {
        return res.redirect('/signin');
    } else {
      let testMail=userEmail
      console.log(testMail);

      var mailOptions = {
        to:testMail,
        subject: "Forgot Password OTP ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('user/otp');
      });

      res.render('user/passwordotp')

    }
},

verifypasswordotp: (req, res) => {
    console.log('setting new password');
    if (req.body.otp == otp) {
        console.log('correct otp');
        res.render('user/newpassword');
    } else {
        console.log('incorrect otp');
        res.render('user/passwordotp');
    }
    // res.render('user/newpassword');
},

settingpassword: async (req, res) => {
    Pass1 = req.body.password1;
    Pass2 = req.body.password2;
    console.log(Pass1);
    console.log(Pass2);
    if (Pass1 === Pass2) {

        pass = await bcrypt.hash(Pass2, 10)
        console.log('password :' + pass);

        console.log('checked password');
        console.log(req.session.email);
        existUser = req.session.email;
        const updateUser = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ email: existUser.email }, { $set: { password: pass } });
        console.log(updateUser);
        res.redirect('/login');

    } else {
        console.log('incorrect pass');
        res.render('user/newpassword');
    }
    // console.log('redirect to signin page');

},
//forgot password end


  // userprofile:(useremail,userbody)=>{
  //   console.log("bbbb")
  //   return new Promise(async(resolve,reject)=>{
  //     db.get()
  //       .collection(collection.PROFILE_COLLECTION)
  //       .updateOne({email:useremail},{$set:{
  //         userdatails:userbody
  //       }

  //     },
  //     {upsert:true}
  //     )
  //     resolve()
  //   })
  // },
  userProfile:async(req,res)=>{
    let userId=req.session.user._id
    console.log(userId);
    let profilePic
   
    const userDetails = await db
    .get()
    .collection(collection.USER_COLLECTION)
    .findOne({ _id:ObjectId(userId )});
    
    const profile = await db
    .get()
    .collection(collection.PROFILE_COLLECTION)
    .findOne({ user:userId});

console.log(userDetails,"mmmmmmmmmmmmmmmmmmmmmm",profile,"VVVVVVVVVVVVVVVVVVVVVVV");


    if(!profile){
      profilePic=null
      //  await db
      // .get()
      // .collection(collection.PROFILE_COLLECTION)
      // .insertOne({ user:ObjectId(userId), profilePic:imageUrl});
        
    }else{
        profilePic=profile.imageUrl.imageurl
       
    }
    res.render('user/profile-page',{userDetails,profilePic})
},
editProfilePage:async(req,res)=>{
let userId = req.session.userId
const userDetails = await db
    .get()
    .collection(collection.USER_COLLECTION)
    .findOne({ _id:userId});
res.render('user/edit-profile',{userDetails,err:false,success:false})
},
editProfile:(req,res)=>{
let data = req.body
let userId=req.session.userId
editprofile.editUser(data,userId).then(()=>{
    res.redirect('/edit-Profile')
})
},
profilePic:async(req,res)=>{
  console.log("iiijiiiii");



  
    const id = uniqid();
    const userId= req.session.user._id;
  
    req.body.image = id + ".jpg";
    console.log('oooooo');
    console.log(req.body.image);
    // const response = await categoryHelpers.addCategory(req.body);
    // console.log("check one", response);
    let image = req.files.image;
    image.imageurl = req.body.image
    console.log(image);
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        
  profilepic.profilePicChange(image,userId).then(()=>{
    res.redirect('/')
})
      } else {
        console.log(err);
      }
    });

  



},
  productpage: (productimage) => {
    return new Promise(async(resolve, reject) => {
     try {
       db.get()
         .collection(collection.PRODUCT_COLLECTION)
         .findOne(
          { _id: objectId(productimage) }
         )
         .then((response) => {
           resolve(response);
         });
     } catch (error) {
      reject(error);
     }
    });
  },
  
  pictureupload:(imagefiles,user)=>{
    return new Promise (async(resolve,reject)=>{
      let user= imagefiles.image
      console.log(user);
      db.get()
      .collection( collection.PROFILE_COLLECTION)
      .insertOne(user).then(()=>{
       resolve();
     
      })
    })
  
 

  },
  imageupload:(userid)=>{
    return new Promise(async(resolve, reject) => {
      db.get()
      .collection( collection.PROFILE_COLLECTION)
      .findOne({user:userid}).then((photo)=>{
       resolve(photo);
     

      
          })

  })
},
  
  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
     try {
       db.get()
         .collection(collection.PROFILE_COLLECTION)
         .findOne({ _id: objectId(userId) })
         .then((user) => {
           resolve(user);
           console.log(user);
         });
     } catch (error) {
      reject(error);
     }
    });
  },

  updateUser: (userId, userDetails) => {
    return new Promise((resolve, reject) => {
     try {
       db.get()
         .collection(collection.USER_COLLECTION)
         .updateOne(
           { _id: objectId(userId) },
           {
             $set: {
               name: userDetails.name,
               email: userDetails.email,
               number: userDetails.number,
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
  // products:async(req,res)=>{
  //   let page=req.query.page;
  //   let product_limit=4;
  //   let total_product;
  //   let logged = req.session.loginstatus;
  // },
  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
     try {
       let userCart = await db
         .get()
         .collection(collection.CART_COLLECTION)
         .findOne({ user: objectId(userId) });
       if (userCart) {
         let proExist = userCart.products.findIndex(
           (product) => product.item == proId
         );
         if (proExist != -1) {
           db.get()
             .collection(collection.CART_COLLECTION)
             .updateOne(
               { user: objectId(userId), "products.item": objectId(proId) },
               {
                 $inc: { "products.$.quantity": 1 },
               }
             )
             .then(() => {
               resolve({exists:true});
             });
         } else {
           db.get()
             .collection(collection.CART_COLLECTION)
             .updateOne(
               { user: objectId(userId) },
               {
                 $push: { products: proObj },
               }
             )
             .then((response) => {
               resolve();
             });
         }
       } else {
         let cartObj = {
           user: objectId(userId),
           products: [proObj],
         };
         db.get()
           .collection(collection.CART_COLLECTION)
           .insertOne(cartObj)
           .then((response) => {
             resolve();
           });
       }
     } catch (error) {
      reject(error);
     }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
     try {
       let cartItems = await db
         .get()
         .collection(collection.CART_COLLECTION)
         .aggregate([
           {
             $match: { user: objectId(userId) },
           },
           {
             $unwind: "$products",
           },
           {
             $project: {
               item: "$products.item",
               quantity: "$products.quantity",
             },
           },
           {
             $lookup: {
               from: collection.PRODUCT_COLLECTION,
               localField: "item",
               foreignField: "_id",
               as: "product",
             },
           },
           {
             $project: {
               item: 1,
               quantity: 1,
               product: { $arrayElemAt: ["$product", 0] },
             },
           },
           {
             $addFields: {
               productTotal: {
                 $sum: {
                   $multiply: ["$quantity", "$product.price"],
                 },
               },
             },
           },
         ])
         .toArray();
 
       resolve(cartItems);
     } catch (error) {
      reject(error);
     }
    });
  },
    getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
     try {
       let count = 0;
       let cart = await db
         .get()
         .collection(collection.CART_COLLECTION)
         .findOne({ user: objectId(userId) });
       if (cart) {
         count = cart.products.length;
       }
       resolve(count);
     } catch (error) {
      reject(error);
     }
    });
  },
  deleteCartProduct: (cartId, proId) => {
    return new Promise((resolve, reject) => {
     try {
       db.get()
         .collection(collection.CART_COLLECTION)
         .updateOne(
           { _id: objectId(cartId) },
           {
             $pull: {
               products: { item: objectId(proId) },
             },
           }
         )
         .then((response) => {
           resolve(response);
         });
     } catch (error) {
      reject(error);
     }
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      try {
        if (details.count == -1 && details.quantity == 1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { _id: objectId(details.cart) },
              {
                $pull: { products: { item: objectId(details.product) } },
              }
            )
            .then((response) => {
              resolve({ removeProduct: true });
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                _id: objectId(details.cart),
                "products.item": objectId(details.product),
              },
              {
                $inc: { "products.$.quantity": details.count },
              }
            )
            .then((response) => {
              resolve({ status: true });
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
     try {
       let total = await db
         .get()
         .collection(collection.CART_COLLECTION)
         .aggregate([
           {
             $match: { user: objectId(userId) },
           },
           {
             $unwind: "$products",
           },
           {
             $project: {
               item: "$products.item",
               quantity: "$products.quantity",
             },
           },
           {
             $lookup: {
               from: collection.PRODUCT_COLLECTION,
               localField: "item",
               foreignField: "_id",
               as: "product",
             },
           },
           {
             $project: {
               item: 1,
               quantity: 1,
               product: { $arrayElemAt: ["$product", 0] },
             },
           },
           {
             $group: {
               _id: null,
               total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
             },
           },
         ])
         .toArray();
       if (total.length == 0) {
         resolve(total);
       } else {
         resolve(total[0].total);
       }
     } catch (error) {
      reject(error);
     }
    });
  },
  placeOrder: (userId,order, products, total, discountData) => {
    let orderData = {
      Total_Amount: total,
      discountData: discountData,
    };
    let invoice = parseInt(Math.random() * 9999);
    return new Promise((resolve, reject) => {
      try {
        let status = order["Payment_Method"] === "COD" ? "placed" : "pending";
        let orderObj = {
          deliveryDetails: {
            name: order.First_Name,
            mobile: order.Phone,
            address: order.Street_Address,
            pincode: order.Post_Code,
            action: true,
          },
          userId: objectId(userId),
          paymentMethod: order["Payment_Method"],
          products: products,
          orderData: orderData,
          totalAmount: parseInt(total),
          status: status,
          date: new Date(),
        };
  
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .insertOne(orderObj)
          .then((response) => {
            db.get()
              .collection(collection.CART_COLLECTION)
              .deleteOne({ user: objectId(userId) });
            resolve(response.insertedId);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
     try {
       let cart = await db
         .get()
         .collection(collection.CART_COLLECTION)
         .findOne({ user: objectId(userId) });
       resolve(cart.products);
     } catch (error) {
      reject(error);
     }
    });
  },
 
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({ userId: objectId(userId) })
          .sort({ _id: -1 })
          .toArray();
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orderItems = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: { _id: objectId(orderId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
          ])
          .toArray();
        resolve(orderItems);
      } catch (error) {
        reject(error);
      }
    });
  },
  getFullOrder: () => {
    return new Promise((resolve, reject) => {
      try {
        let orders = db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find()
          .toArray();
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      try {
        var options = {
          amount: total * 100,
          currency: "INR",
          receipt: ""+orderId,
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log(err);
          } else {
            resolve(order);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
     try {
       const crypto = require("crypto");
       let hmac = crypto.createHmac('sha256', "ibu7PoN3iGLy3zGCa3RDWOXC")
        hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'], "ibu7PoN3iGLy3zGCa3RDWOXC");
        hmac = hmac.digest('hex')
  
       if (hmac == details["payment[razorpay_signature]"]) {
         resolve();
       } else {
         reject();
       }
     } catch (error) {
      reject(error);
     }
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
     try {
       db.get()
         .collection(collection.ORDER_COLLECTION)
         .updateOne(
           { _id: objectId(orderId) },
           {
             $set: {
               status: "placed",
             },
           }
         )
         .then(() => {
           resolve();
         });
     } catch (error) {
      reject(error);
     }
    });
  },
  cancelOrder: (proId) => {
    return new Promise((resolve, reject) => {
     try {
       db.get()
         .collection(collection.ORDER_COLLECTION)
         .updateOne(
           { _id: objectId(proId) },
           {
             $set: {
               "deliveryDetails.action": false,
               status: "cancelled",
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
  searchItems:(req,res)=>{
  return new Promise(async(resolve,reject)=>{
    let  searchword=req.body.search
    let searchproducts=await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .find({product:{$regex:searchword,'$options':'i'}}).toArray()
    resolve(searchproducts)
  }).then(async(pro)=>{
    let userData = req.session.user;
    let cartCount = null;
    if (req.session.user) {
      cartCount = await module.exports.getCartCount(req.session.user._id);
    } 
    let wishCount = null;
    if (req.session.user) {
      wishCount = await module.exports.getWishCount(req.session.user._id);
    }
    let product=pro
    console.log(product);
    res.render("user/view-product", {
      product,
      user: true,
      userData,
      cartCount,
      wishCount,
    });
  })    

  },
  
  
  addToWishlist: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
      flag: false,
      
    };
    return new Promise(async (resolve, reject) => {
      try {
        let userWishlist = await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (userWishlist) {
          let proExist = userWishlist.products.findIndex(
            (product) => product.item == proId
          );
          if (proExist != -1) {
            db.get()
              .collection(collection.WISHLIST_COLLECTION)
              .updateOne(
                { user: objectId(userId) },
                {
                  $pull: {
                    products: { item: objectId(proId) },
                  },
                }
              )
              db.get()
              .collection(collection.PRODUCT_COLLECTION)
              .updateOne(
                { _id: objectId(proId)  },
                {
                  $set: { fav: false },
                }
              )
              .then((response) => {
                let exist = 'exist'
                resolve(exist);
              });
              
          } else {
            db.get()
              .collection(collection.WISHLIST_COLLECTION)
              .updateOne(
                { user: objectId(userId) },
                {
                  $push: { products: proObj },
                }
              )
              db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              { _id: objectId(proId)  },
              {
                $set: { fav: true },
              }
            )
              .then((response) => {
                let notExist = 'notExist'
                resolve(notExist);
              });
          }
        } else {
          let cartObj = {
            user: objectId(userId),
            products: [proObj],
          };
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .insertOne(cartObj)
            .then((response) => {
              resolve();
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  getWishProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let wishItems = await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
          ])
          .toArray();

          
  
        if (wishItems.length == 0) {
          resolve(wishItems);
        } else {
          resolve(wishItems);
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  getWishCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let wish = await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (wish) {
          count = wish.products.length;
        }
        resolve(count);
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteWishProduct: (proId,userId) => {
    console.log(userId,"fffffffffff");
    let proObj = {
    
    };
    return new Promise((resolve, reject) => {
     try {
       db.get()
         .collection(collection.WISHLIST_COLLECTION)
         .updateOne(
           { _id: objectId(userId) },
           {
             $pull: {
               products: { item: objectId(proId) },
             },
           }

         )
         db.get()
         .collection(collection.PRODUCT_COLLECTION)
         .updateOne(
           { _id: objectId(proId)  },
           {
             $set: { fav: false },
           }
         )
         .then(() => {
          console.log("sssssssssssss");
           resolve();
         });
     } catch (error) {
      reject(error);
     }
    });
  },
  addNewAddress: (address, userId) => {
    let addressData = {
      addressId: uuidv4(),
      First_Name: address.First_Name,
      Last_Name: address.Last_Name,
      Company_Name: address.Company_Name,
      Street_Address: address.Street_Address,
      Extra_Details: address.Extra_Details,
      Town_City: address.Town_City,
      Country_State: address.Country_State,
      Post_Code: address.Post_Code,
      Phone: address.Phone,
      Alt_Phone: address.Alt_Phone,
    };

    return new Promise(async (resolve, reject) => {
      try {
        let getAddress = await db
          .get()
          .collection(collection.ADDRESS_COLLECTION)
          .findOne({ user: objectId(userId) });
  
        if (getAddress) {
          db.get()
            .collection(collection.ADDRESS_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: {
                  address: addressData,
                },
              }
            )
            .then((response) => {
              resolve(response);
            });
        } else {
          let addressObj = {
            user: objectId(userId),
            address: [addressData],
          };
  
          db.get()
            .collection(collection.ADDRESS_COLLECTION)
            .insertOne(addressObj)
            .then((response) => {
              resolve(response);
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  getSavedAddress: (userId) => {
    return new Promise((resolve, reject) => {
     try {
       db.get()
         .collection(collection.ADDRESS_COLLECTION)
         .findOne({ user: objectId(userId) })
         .then((savedAddress) => {
           if (savedAddress) {
             let addressArray = savedAddress.address;
             if (addressArray.length > 0) {
               resolve(savedAddress);
             } else {
               resolve(false);
             }
           } else {
             resolve(false);
           }
         });
     } catch (error) {
      reject(error);
     }
    });
  },
  
  checkCoupon: (code, amount) => {
    const coupon = code.toString().toUpperCase();

    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.COUPON_COLLECTION)
          .findOne({ Name: coupon })
          .then((response) => {
            if (response == null) {
              // let response = {status : false}
              console.log(response + "          null resp");
              reject({ status: false });
            } else {
              let offerPrice = parseFloat(amount * response.Offer);
              // let discountPrice = amount - offerPrice
              let newTotal = parseInt(amount - offerPrice);
              // response = {
              //     amount: newTotal,
              //     discount: discountPrice
              // }
              console.log("          Nonnull resp");
              resolve(
                (response = {
                  couponCode: coupon,
                  status: true,
                  amount: newTotal,
                  discount: offerPrice,
                })
              );
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  getUserOrderBill: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        try {
          let orderBill = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .find({ _id: objectId(orderId) })
            .toArray();
  
          resolve(orderBill);
        } catch (error) {
          reject(error);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  sortD: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .sort({ _id: -1 })
          .sort({ price: -1 })
          .toArray();
        resolve(products);

      } catch (error) {
        reject(error);
      }
    });
  },
  sortA: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .sort({ _id: -1 })
          .sort({ price: 1 })
          .toArray();
        resolve(products);

      } catch (error) {
        reject(error);
      }
    });
  },

 
 
  getUser: (userId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.USER_COLLECTION)
          .findOne({ _id: objectId(userId) })
          .then((user) => {
            resolve(user);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
};
