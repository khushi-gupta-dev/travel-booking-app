const express = require("express");

const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");

const Listing = require("../models/listing.js");

const {validateReview} = require("../middleware.js");



 

//reviews
//post route for reviews

        router.post("/", validateReview, wrapAsync(async (req, res) => {
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
  req.flash("success", "New Review Added!");
        res.redirect(`/listings/${listing._id}`);
        }));


        //delete review route

        router.delete("/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
          await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
} ));


module.exports = router;