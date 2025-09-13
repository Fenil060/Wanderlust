const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Debug log (outside the config!)
console.log("Cloudinary ENV:", {
  name: process.env.CLOUD_NAME,
  key: process.env.CLOUD_API_KEY,
  secret: process.env.CLOUD_API_SECRET ? "exists" : "missing"
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_images', // The name of the folder in Cloudinary
    allowerdFormats:["jpeg","png","jpg"],
  },
});

module.exports = {
    cloudinary,
    storage
};