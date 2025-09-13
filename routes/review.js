const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError.js');
const { reviewSchema } = require('../schema.js'); //review validation schema
const Review = require('../models/review.js');
const Listing = require('../models/listing');

//Middleware for validating review data
const validateReview = (req, res, next) => {
  let {error} = reviewSchema.validate(req.body);
    if(error){
      throw new ExpressError(400, result.error);
    }else{
      next();
    }
};

//// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    //redirecturl is the url user was trying to access before being prompted to log in
    req.session.redirectUrl = req.originalUrl;

    req.flash('error', 'You must be logged in first!');
    return res.redirect('/login');
  }
  next();
};

//Middleware for vali author
const isauthor = async (req, res, next) => {
  const {id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You don't have permission to do this");
    return res.redirect(`/listings/${id}`);
  }
  next();
};



//reviews  post routes
router.post('/',validateReview,isLoggedIn, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newreview = new Review(req.body.review);
  newreview.author = req.user._id;
  listing.reviews.push(newreview);

  await newreview.save();
  await listing.save();
  req.flash('success', 'Review added successfully!');
  res.redirect(`/listings/${listing._id}`);
}));

//reviews delete route
router.delete('/:reviewId',isLoggedIn,isauthor, wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Review deleted successfully!');
  res.redirect(`/listings/${id}`);
}));

module.exports = router;