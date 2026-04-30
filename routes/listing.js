const express = require("express");

const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");


const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  
  if (error) {
  let errMsg = error.details.map(el => el.message).join(",");
  throw new ExpressError(400, errMsg);
}else{
  next();
}
 }




//index route
router.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//new route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

//show route
router.get("/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  else {
    res.render("listings/show.ejs", { listing });
  }
});


// create route
router.post("/", validateListing, wrapAsync( async (req, res,next) => {

     // const { title, description, image, price,country, location } = req.body;
  let listing = req.body.listing;
  const newListing = new Listing(listing);

  await newListing.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
  
}));


//edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  else {
    res.render("listings/edit.ejs", { listing });
  } 
}));



//update route

router.put("/:id",validateListing, wrapAsync(async (req, res) => {
  
  let { id } = req.params;
 
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Successfully updated the listing!");
  res.redirect(`/listings/${id}`);
}));



// delete route
router.delete("/:id",wrapAsync( async (req, res) => {
  let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
  console.log("Deleted listing:", deletedListing);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
}));

module.exports = router;