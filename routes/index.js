var express = require("express");
var router = express.Router();
const multer = require("multer");
const zip = require("express-easy-zip");
const path = require("path");
var bodyParser = require("body-parser");
const { readdirSync, rename } = require("fs");

const helpers = require("../helpers/helpers");
//var upload = multer({ dest: "./public/data/uploads/" });

// Set Multer options here
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/data/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage, fileFilter: helpers.imageFilter });

router.use(zip());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(bodyParser.raw());

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/about", function (req, res, next) {
  res.render("about");
});

router.post("/stats", upload.single("uploaded_file"), function (req, res) {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any
  //if (!req.file) {
  //  return res.send("Please select an image to upload");
  //}
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/data/uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  //res.redirect(307, "/uploads");
  console.log(storage);
  console.log(req.file, req.body);
});

router.post("/preuploads", function (req, res) {
  console.log(req.body);
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/data/uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, req.body.newName + "_" + file.originalname);
    },
  });
  upload = multer({ storage: storage, fileFilter: helpers.imageFilter });
  res.redirect(307, "/uploads");
});

router.post("/uploads", upload.array("uploaded_files", 10), async function (
  req,
  res
) {
  var dirPath = path.join(__dirname, "..\\public\\data\\uploads\\");
  console.log(req.body);

  // Get path to image directory
  const imageDirPath = dirPath;

  // Get an array of the files inside the folder
  const files = readdirSync(imageDirPath);

  // Loop through each file that was retrieved
  await files.forEach((file) =>
    rename(
      imageDirPath + `/${file}`,
      imageDirPath + `/${req.body.newName}_${file.toLowerCase()}`,
      (err) => console.log(err)
    )
  );

  await res.zip({
    files: [
      {
        path: dirPath,
        name: "uploads",
      },
    ],
    filename: "Package.zip",
  });
});

module.exports = router;
