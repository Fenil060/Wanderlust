const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');

main().then(() => {
  console.log('Database connection established');
}).catch(err => {
  console.error('Database connection error:', err);
});

async function main() {
  await mongoose.connect('mongodb://localhost:27017/wanderlust');
  console.log('Connected to MongoDB');
}

const seedDB = async () => {
  await Listing.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({...obj, owner: "68b298a16d85112d916a3e82"}))
  await Listing.insertMany(initdata.data);
  console.log('Database seeded with initial data');
}

seedDB().then(() => {
  mongoose.connection.close();
});