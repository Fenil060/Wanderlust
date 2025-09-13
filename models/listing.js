const mongoose = require('mongoose');
const review = require('./review');
const Review = require('./review.js');

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:
        { 
            type: String,
            required: true 
        },
    description:
        {   
            type: String, 
            required: true 
        },
    image: 
        { 
            url : String, 
            filename : String,
        },
    price: 
        { 
            type: Number, 
            required: true 
        },
    location: 
        { 
            type: String, 
            required: true 
        },
    country: 
        { 
            type: String, 
            required: true 
        },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    owner : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    geometry: {
        type : {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
        type: String,
        enum: ["deserts","restrooms", "hotels","mountains","resorts","beaches","temples"],
        required: true
    }
});

// Middleware to delete associated reviews when a listing is deleted post Middleware
listingSchema.post('findOneAndDelete', async (listing) => {
    if(listing){
    await Review.deleteMany({reviews : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;