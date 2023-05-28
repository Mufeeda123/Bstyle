const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const hbs = require("express-handlebars");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");


const app = express();
const db = require("./config/connection");
const session = require("express-session");
const nocache = require("nocache");
const fileUpload = require("express-fileupload");  
let handlebars = require("handlebars");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    helpers: {
      inc: (value) => {
        return parseInt(value) + 1;
      },
    },
    extname: "hbs",
    defaultLayout: "layout",
    layoutDir: __dirname + "/views/layouts/",
    adminDir: __dirname + "/views/admin/",
    userDir: __dirname + "/views/user/",
    partialsDir: __dirname + "/views/partials",
  })
);

// app.use(logger("dev"));
app.use(express.json());
app.use(nocache());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use("/public", express.static(__dirname + "/public"));
app.use(session({ secret: "key", cookie: { maxAge: 600000 } }));
db.connect((err) => {
  if (err) console.log("connection error: " + err);
  else console.log("database connected");
});
app.use(fileUpload());
app.use("/", userRouter);
app.use("/admin", adminRouter);

//pagination
app.get("/view-product",async(req,res)=>{
  const {page,limit,sort,asc}=req.query;
  let skip=(page-1)*10;
  if (!page)page=1;
  if(!limit)limit=10;
const user=await user.find().sort({[sort]:1}).skip(skip).limit(limit);
res.send({page:page,limit:limit,user:user});
})



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  
});

app.listen(5050);

