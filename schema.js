const joi = require('joi');

// Define the schema for a listing

module.exports.listingSchema = joi.object({
    listing : joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        location: joi.string().required(),
        country: joi.string().required(),
        price: joi.number().min(0).required(),
        image: joi.object({
            url: joi.string().required(),
            filename: joi.string().required()
        }).optional()
    }).required()
});


module.exports.reviewSchema = joi.object({
    review : joi.object({
        rating: joi.number().min(1).max(5).required(),
        comment: joi.string().required()
    }).required()
});
