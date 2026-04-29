const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");

const path = require("path");
const methodOverride = require("method-override");
const MONGO_URI = "mongodb://localhost:27017/wanderlust";
const ejsMate = require("ejs-mate");

const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError.js");

const { listingSchema , reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const listings = require("./routes/listing.js");

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

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  
  if (error) {
  let errMsg = error.details.map(el => el.message).join(",");
  throw new ExpressError(400, errMsg);
}else{
  next();
}
 }

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {  let errMsg = error.details.map(el => el.message).join(",");
  throw new ExpressError(400, errMsg);
}else{
  next();
}
}
 


app.use("/listings", listings);



//reviews
//post route for reviews

app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));


//delete review route

app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
} ));

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next) => {
  let { statusCode=500, message="Something went wrong" } = err; 
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{err});
})

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});














// joi used for schema validation {schema for server side validation of listing data}