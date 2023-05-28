const authHelpers=require("../helpers/user-block")
const db = require("../config/connection");
const collection = require("../config/collection");

exports.userAuth=(req,res,next)=>{
    if(req.session.userloggedIn){
        let userId=req.session.user._id
        console.log(userId);
        authHelpers.userStatus(userId).then((userStatus)=>{
            if (userStatus==false){
                next()
            }else{
                req.session.destroy();
                res.redirect("/")
            }
        })
    }else{
        res.redirect("/login")
    }
};