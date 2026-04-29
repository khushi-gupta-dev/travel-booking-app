const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const MONGO_URI = "mongodb://localhost:27017/wanderlust";
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });
async function main() {
  await mongoose.connect(MONGO_URI);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// app.get("/testListing", async(req, res) => {
// let sampleListing = new Listing({
//   title: "Sample Listing",
//     description: "This is a sample listing for testing purposes.",
//     price: 1200,
//     location: "Sample Location",
//     country: "Sample Country"
// });
//     // await sampleListing.save()
//     console.log("Sample listing saved to database");
//     res.send("Sample listing created and saved to database");
// });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

// joi used for schema validation {schema for server side validation of listing data}
