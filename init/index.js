const mongoose = require('mongoose');

const initData = require('./data.js');

const Listing = require('../models/listing.js');

const MONGO_URI = "mongodb://localhost:27017/wanderlust";


async function main() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    await initDB();
}

const initDB = async () => {
    await Listing.deleteMany({});
    const listingsWithOwner = initData.data.map((obj) => ({
        ...obj,
        owner: "69f526b2ae4fa243689e56f4",
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log("Database initialized");
};

main().catch((err) => {
    console.error("Error connecting to MongoDB", err);
});
