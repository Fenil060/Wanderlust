const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { listingSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require('../models/listing');
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

// Middleware for validating listing data
const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
    if(error){
      throw new ExpressError(400, error.details[0].message);
    }else{
      next();
    }
};

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  let {id} = req.params;
  if(!req.isAuthenticated()) {
    //redirecturl is the url user was trying to access before being prompted to log in
    req.session.redirectUrl = req.originalUrl;

    req.flash('error', 'You must be logged in first!');
    return res.redirect('/login');
  }
  next();
};


//Middleware to check for valid user
const isOwner = async (req, res, next) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!res.locals.currentUser || !listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "You don't have permission to do this");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

//new route
router.get("/new",isLoggedIn, (req,res) => {
  res.render("listings/new.ejs");
});

//-----------------------------------------------------------------------------------------------//
router.route("/")
//index route
.get( wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings});
}))

// create route
.post(validateListing, isLoggedIn, upload.single('listing[image]'), wrapAsync(async (req, res, next) => {

    let responce = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
    })
    .send();


    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = responce.body.features[0].geometry;

   let savedListing =  await newListing.save();
    console.log(savedListing);
    req.flash('success', 'New listing created successfully!');
    res.redirect("/listings");
}))
//-----------------------------------------------------------------------------------------------------//

//-----------------------------------------------------------------------------------------------------//
router.route("/:id")
  //show route
  .get(wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({path :'reviews', populate:{path: "author"},}).populate('owner');
    if(!listing) {
      req.flash('error', 'Listing not found!');
      return res.redirect('/listings');
    }
    console.log(listing);
    res.render('listings/show.ejs', { listing });
  }))

  //update route
 .put(isLoggedIn, isOwner, upload.single('listing[image]'), wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== 'undefined'){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
}))

  //delete route
  .delete(isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
  }))
//----------------------------------------------------------------------------------------------------------//

//edit route
router.get('/:id/edit',isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/edit.ejs', { listing });
}));

//---------------------------------------------------------------------------------------------------------------//

// ===================== Filter Route =====================
router.get("/filter/results", wrapAsync(async (req, res) => {
    const { category } = req.query;  // get category from query string
    let filter = {};

    if (category) {
        filter.category = category;   // filter only if category exists
    }

    const listings = await Listing.find(filter);

    // Render the same index page but with filtered listings
    res.render("listings/filter.ejs", { listings, category });
}));
// =========================================================


module.exports = router;
module.exports = router;
