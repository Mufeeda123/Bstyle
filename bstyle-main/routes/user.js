const express = require("express");
const { response } = require("../app");
const router = express.Router();
const userHelper = require("../controller/user-helper/user-helper");
const categoryHelpers = require("../controller/admin-helper/category-helpers");
const twilio = require("twilio");
const twilioHelpers = require("../controller/user-helper/twilio-helper");
// const twilioHelper = require("../helpers/twilio-helper");
const productHelper = require("../controller/admin-helper/product-helper");
const moment = require("moment");
const bannerHelper = require("../controller/admin-helper/banner-helper");
const messageHelper = require("../controller/admin-helper/message-helper");
const middleware=require("../middleware/user-block");
let userData;

const verifyLogin = (req, res, next) => {
  if (req.session.userloggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    let userData = req.session.user;
    let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    let wishCount = null;
    if (req.session.user) {
      wishCount = await userHelper.getWishCount(req.session.user._id);
    }
    bannerHelper.getAllBanner().then((banner) => {
      categoryHelpers.getAllCategory().then((category) => {
        res.render("user/user-page", {
          layout: "layout",
          user: true,
          userData,
          category,
          cartCount,
          wishCount,
          banner,
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

router.get("/login", (req, res, next) => {
  try {
    if (req.session.userloggedIn) {
      res.redirect("/");
    } else {
      res.render("user/login", {
        layout: "layout",
        loginErr: req.session.loginErr,
      });
      req.session.loginErr = false;
    }
  } catch (error) {
    next(error);
  }
});

router.get("/signup", (req, res, next) => {
  try {
    if (req.session.userloggedIn) {
      res.redirect("/");
    } else {
      res.render("user/signup", { layout: "layout" });
      req.session.loginErr = false;
    }
  } catch (error) {
    next(error);
  }
});

router.get("/otp", (req, res, next) => {
  try {
    res.render("user/otp", { layout: "layout" });
  } catch (error) {
    next(error);
  }
});

router.get("/verifyotp", (req, res, next) => {
  try {
    res.render("user/verifyOtp", { layout: "layout", userData });
  } catch (error) {
    next(error);
  }
});

router.post("/otpmobile", (req, res, next) => {
  try {
    twilioHelper.dosms(req.body).then((data) => {
      if (data.status) {
        userData = data.data;
        res.redirect("/verifyotp");
      } else {
        res.redirect("/otp");
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/verifyotp", (req, res, next) => {
  try {
    twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
      const { resp, user } = response;
      req.session.userloggedIn = true;
      req.session.user = user;
      if (resp.valid) {
        res.redirect("/");
      } else {
        res.redirect("/otp");
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signup", (req, res, next) => {
  try {
    req.session.body = req.body;
    userHelper.doSignup(req.body).then((response) => {
      if (response.user) {
        res.redirect("/signup");
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", (req, res, next) => {
  try {
    userHelper.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.userloggedIn = true;
        req.session.user = response.user;

        res.redirect("/");
      } else {
        req.session.loginErr = "Invalid Email or Password";

        res.redirect("/login");
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/selected-category", async function (req, res, next) {
  try {
    let userData = req.session.user;
    let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    let wishCount = null;
    if (req.session.user) {
      wishCount = await userHelper.getWishCount(req.session.user._id);
    }
    const catItem = req.query.category;
    const category = await categoryHelpers.getAllCategory();
    categoryHelpers.getSelectedCategory(catItem).then((selectedCat) => {
      res.render("user/view-category", {
        selectedCat,
        category,
        user: true,
        cartCount,
        wishCount,
        userData,
        catItem,
      });
    });
  } catch (error) {
    next(error);
  }
});

router.get("/view-category", function (req, res, next) {
  try {
    categoryHelpers.getAllCategory().then((category) => {
      res.render("user/view-category", { category, user: true });
    });
  } catch (error) {
    next(error);
  }
});

router.get("/view-product", async function (req, res, next) {
  try {
    let userData = req.session.user;
    let cartCount = null;
  
    productHelper.getAllProduct(req.session.user._id).then(async(product) => {
      // console.log(product); 
       if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id);

    }
    let wishCount = null;
    if (req.session.user) {
      wishCount = await userHelper.getWishCount(req.session.user._id);
    
    }
      // console.log("lloll");
      res.render("user/view-product", {product, user: true,userData,cartCount,wishCount}
      )
    });
  } catch (error) {
    next(error);
  }
});

router.post('/page2', async function (req, res, next) {
  try {
    let userData = req.session.user;
    let cartCount = null;
  
    productHelper.getAllProduct().then(async(product) => {
      console.log(product); 
       if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    let wishCount = null;
    if (req.session.user) {
      wishCount = await userHelper.getWishCount(req.session.user._id);
    }
      console.log("lloll");
      res.render("user/view-products2", {product, user: true,userData,cartCount,wishCount}
      )
    });
  } catch (error) {
    next(error);
  }
}),

router.get("/user/sortD", async function (req, res, next) {
  console.log('ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp');
  try {
    let userData = req.session.user;
    let cartCount = null;
  
    userHelper.sortD().then(async(product) => {
      console.log(product); 
       if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    let wishCount = null;
    if (req.session.user) {
      wishCount = await userHelper.getWishCount(req.session.user._id);
    }
      console.log("lloll");
      res.render("user/sortD", {
        product,
        user: true,
        userData,
        cartCount,
        wishCount,
      });
    });
  } catch (error) {
    next(error);
  }
});

router.get("/user/sortA", async function (req, res, next) {
  console.log('ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp');
  try {
    let userData = req.session.user;
    let cartCount = null;
  
    userHelper.sortA().then(async(product) => {
      console.log(product); 
       if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    let wishCount = null;
    if (req.session.user) {
      wishCount = await userHelper.getWishCount(req.session.user._id);
    }
      console.log("lloll");
      res.render("user/sortA", {
        product,
        user: true,
        userData,
        cartCount,
        wishCount,
      });
    });
  } catch (error) {
    next(error);
  }
});
//user profile
// router.get("/profile/:id",middleware.userAuth, async (req, res, next) => {
//   try {
//     const userData = await userHelper.getUserDetails(req.params.id);
//     const photo = await userHelper.imageupload(req.session.user._id)
//     console.log('test=',photo);
//     res.render("user/profile", { userData, user: true, 
//       photo 
//     });
//   } catch (error) {
//     next(error);
//   }
// });

router.get('/profile/:id', middleware.userAuth, userHelper.userProfile)
router.route('/editProfile')
      .get(userHelper.editProfilePage)
      .post(userHelper.editProfile)   
// router.post("/userDataupload/:email",async(req,res,next)=>{
//   console.log("-----------------------------------------------------req.params.email");
//   try{
//    await userHelper.userprofile(req.params.email,req.body).then(()=>{
//     res.redirect('back')
//   })
  
//   }catch(error){
//     next(error)
//     console.log('catch---------------------');

//   }

// });
// router.get('/profile',userHelper.userProfile)
router.post('/profile-pic',userHelper.profilePic)

router.get("/productpage/:id", (req,res) => {
  
  if (req.session.userloggedIn) {
    
  try {
    userHelper.productpage(req.params.id).then(async(product) => {
      
    await userHelper.getCartCount(req.session.user._id).then(async(cartCount)=>{
      
      await userHelper.getWishCount(req.session.user._id).then((wishCount)=>{
      
        res.render("user/productpage", { layout: "layout",user:true, product,cartCount,wishCount});
        
      })
   })  
    });
  } catch (error) {
    next(error);
  }
}else{
  console.log('elwes');
  res.redirect("back")
}
});


router.post("/pictureupload",async(req,res,next)=>{
userHelper.pictureupload(req.files,req.session.user._id).then(async()=>{
  

  res.redirect("back");
})

 
})
router.post('/search',userHelper.searchItems);

router.post("/profile/:id", async (req, res, next) => {
  try {
    await userHelper.updateUser(req.params.id, req.body);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
}); 
router.get('/forgotpassword', userHelper.forgotpassword);
router.post('/resetpassword', userHelper.resetpassword);
router.post('/verifypasswordotp', userHelper.verifypasswordotp);
router.post('/setnewpassword', userHelper.settingpassword);

//cart
router.get("/cart", middleware.userAuth, async (req, res, next) => {
  try {
    let userData = req.session.user;
    let total = await userHelper.getTotalAmount(req.session.user._id);
    let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    let wishCount = null;
    if (req.session.user) {
      wishCount = await userHelper.getWishCount(req.session.user._id);
    }
    let products = await userHelper.getCartProducts(req.session.user._id);
    res.render("user/cart", {
      products,
      user: req.session.user._id,
      cartCount,
      wishCount,
      userData,
      total,
      user: true,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/add-to-cart/:id", middleware.userAuth, (req, res, next) => {
  try {
    userHelper.addToCart(req.params.id, req.session.user._id).then((exists) => {
      if(exists){
        res.json({ exists: true });
      }else{
        res.json({ status: true });
      }
      
      // res.redirect('/view-product')
    });
  } catch (error) {
    next(error);
  }
});

router.get("/deleteCartProduct/:id/:ik", function (req, res, next) {
  try {
    let cartId = req.params.id;
    let proId = req.params.ik;
    let userId = req.session.user._id;
    userHelper.deleteCartProduct(cartId, proId, userId).then((response) => {
      res.redirect("/cart");
    });
  } catch (error) {
    next(error);
  }
});
router.post("/change-product-quantity", (req, res, next) => {
  try {
    userHelper.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelper.getTotalAmount(req.body.user);
      res.json(response);
    });
  } catch (error) {
    next(error);
  }
});

//place order

router.get("/place-order", middleware.userAuth, async (req, res, next) => {
  try {
    let userdata = req.session.user;
    const userData = await userHelper.getUserDetails(req.params.id);
    let total = await userHelper.getTotalAmount(req.session.user._id);
    let savedAddress = await userHelper.getSavedAddress(req.session.user._id);
    let message = await messageHelper.getAllMessage();

    res.render("user/place-order", {
      total,
      user: req.session.user,
      userData,
      savedAddress,
      user: true,
      userdata,
      message,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/place-order", async (req, res, next) => {
  try {
    if (req.body.saveAddress == "on") {
      await userHelper.addNewAddress(req.body, req.session.user._id);
    }

    let products = await userHelper.getCartProductList(req.session.user._id);
    let totalPrice = await userHelper.getTotalAmount(req.session.user._id);
    let discountData = null;
    if (req.body.Coupon_Code) {
      await userHelper
        .checkCoupon(req.body.Coupon_Code, totalPrice)
        .then((response) => {
          discountData = response;
        })
        .catch(() => (discountData = null));
    }
    userHelper
      .placeOrder(
        req.session.user._id,
        req.body,
        products,
        totalPrice,
        discountData
      )
      .then((orderId) => {
        if (req.body["Payment_Method"] == "COD") {
          res.json({ codSuccess: true });
        } else {
          let netAmount = discountData ? discountData.amount : totalPrice;
          userHelper.generateRazorpay(orderId, netAmount).then((response) => {
            res.json(response);
          });
        }
      });
  } catch (error) {
    next(error);
  }
});

router.get("/order-success", (req, res, next) => {
  try {
    res.render("user/order-success", { user: req.session.user });
  } catch (error) {
    next(error);
  }
});

router.get("/orders", middleware.userAuth, async (req, res, next) => {
  if(req.session.userloggedIn){
  try {
    let userData = req.session.user;
    let orders = await userHelper.getUserOrders(req.session.user._id);
    let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
      wishCount = await userHelper.getWishCount(req.session.user._id);
    }
    orders.forEach((element) => {
      element.date = moment(element.date).format("DD-MM-YY");
    });

    res.render("user/orders", {
      user: req.session.user,
      orders,
      cartCount,
      wishCount,
      userData,
    });
  } catch (error) {
    next(error);
  }
}else{
  req.redirect("/")
}
});

router.get("/view-order-products/:id", async (req, res, next) => {
  try {
    let products = await userHelper.getOrderProducts(req.params.id);
    let orderBill = await userHelper.getUserOrderBill(req.params.id);
    let orderId = req.params.id;
    res.render("user/view-order-products", {
      user: req.session.user,
      products,
      orderId,
      orderBill,
      user: true,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/bill", middleware.userAuth, async (req, res, next) => {
  try {
    let user = req.session.user;
    let products = await userHelper.getOrderProducts(req.query.id);

    let orderBill = await userHelper.getUserOrderBill(req.query.id);

    res.render("user/bill", { user, products, orderBill });
  } catch (error) {
    next(error);
  }
});

router.get("/cancel-order/:id", (req, res, next) => {
  try {
    userHelper.cancelOrder(req.params.id);
    res.redirect("/orders");
  } catch (error) {
    next(error);
  }
});
router.post("/verify-payment", (req, res, next) => {
  try {
    userHelper
      .verifyPayment(req.body)
      .then(() => {
        userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
          res.json({ status: true });
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, errMsg: "" });
      });
  } catch (error) {
    next(error);
  }
});

//wishlist
router.get("/wishlist",middleware.userAuth, async (req, res, next) => {
  try {
    let userData = req.session.user;
    let products = await userHelper.getWishProducts(req.session.user._id);
    let wishCount = null;
    if (req.session.user) {
      wishCount = await userHelper.getWishCount(req.session.user._id);
    }
    let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    res.render("user/wishlist", {
      products,
      user: true,
      wishCount,
      cartCount,
      userData,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/add-to-wishlist/:id", (req, res, next) => {
  try {
    userHelper.addToWishlist(req.params.id, req.session.user._id).then((response) => {
      console.log(response);
      if (response == 'exist') {
        console.log("e");
        res.json({ status: false });
      } else {
        console.log("not");
        res.json({ status: true });
      }
        
      
    });
  } catch (error) {
    next(error);
  }
});

router.get("/deleteWishProduct/:id/:proId", (req, res, next) => {
  try {
    let proId = req.params.proId;
    let userId = req.params.id
    userHelper.deleteWishProduct(proId,userId).then(() => {
      res.redirect('/wishlist')
    });
  } catch (error) {
    next(error);
  }
});

router.post("/check-coupon", async (req, res, next) => {
  try {
    let userId = req.session.user._id;
    let couponCode = req.body.coupon;
    let totalAmount = await userHelper.getTotalAmount(userId);
    userHelper
      .checkCoupon(couponCode, totalAmount)
      .then((response) => {
        res.json(response);
      })
      .catch((response) => {
        res.json(response);
      });
  } catch (error) {
    next(error);
  }
});

//logout
router.get("/logout", (req, res, next) => {
  try {
    req.session.userloggedIn = null;
    req.session.user = null;
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
