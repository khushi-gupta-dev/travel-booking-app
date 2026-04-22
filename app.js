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

const { listingSchema } = require("./schema.js");

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


app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});





app.post("/listings", validateListing, wrapAsync( async (req, res,next) => {

     // const { title, description, image, price,country, location } = req.body;
  let listing = req.body.listing;
  const newListing = new Listing(listing);

  await newListing.save();
  res.redirect("/listings");
  
}));


app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
   
}));


app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
  
  let { id } = req.params;
 
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));


app.delete("/listings/:id",wrapAsync( async (req, res) => {
  let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted listing:", deletedListing);
  res.redirect("/listings");
}));



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