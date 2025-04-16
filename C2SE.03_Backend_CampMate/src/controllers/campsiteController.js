const Campsite = require('../models/Campsite');
const ReviewLocation = require('../models/ReviewLocation');
const Users = require('../models/Users');

const campsiteController = {
    // Get all campsite locations for map display
    getAllLocations: async (req, res) => {
        try {
            const locations = await Campsite.find({}, {
                campsiteName: 1,
                location: 1,
                latitude: 1,
                longitude: 1,
                imageURL: 1,
                rating: 1
            });

            res.status(200).json({
                success: true,
                data: locations.map(location => ({
                    id: location._id,
                    name: location.campsiteName,
                    location: location.location,
                    coordinates: {
                        lat: location.latitude,
                        lng: location.longitude
                    },
                    imageURL: location.imageURL,
                    rating: location.rating || 0
                }))
            });
        } catch (error) {
            console.error('Get locations error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    },

    // Get detailed information for a specific campsite
    getCampsiteDetails: async (req, res) => {
        try {
            const { id } = req.params;

            const campsite = await Campsite.findById(id);
            if (!campsite) {
                return res.status(404).json({
                    success: false,
                    message: 'Campsite not found'
                });
            }

            // Get reviews with user information
            const reviews = await ReviewLocation.find({ campsite_id: id })
                .populate('user_id', 'user_name profileImage');

            // Calculate average rating
            const averageRating = reviews.length > 0
                ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
                : 0;

            // Update campsite rating
            campsite.rating = averageRating;
            await campsite.save();

            res.status(200).json({
                success: true,
                data: {
                    id: campsite._id,
                    name: campsite.campsiteName,
                    location: campsite.location,
                    coordinates: {
                        lat: campsite.latitude,
                        lng: campsite.longitude
                    },
                    description: campsite.description,
                    imageURL: campsite.imageURL,
                    rating: averageRating,
                    reviews: reviews.map(review => ({
                        id: review._id,
                        rating: review.rating,
                        comment: review.comment,
                        images: review.images,
                        created_at: review.created_at,
                        user: {
                            id: review.user_id._id,
                            name: review.user_id.user_name,
                            profileImage: review.user_id.profileImage
                        }
                    })),
                    facilities: campsite.facilities || [],
                    priceRange: campsite.priceRange,
                    contactInfo: campsite.contactInfo,
                    openingHours: campsite.openingHours
                }
            });
        } catch (error) {
            console.error('Get campsite details error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    },

    // Search campsites by location name or features
    searchCampsites: async (req, res) => {
        try {
            const { keyword, facilities, minRating, maxPrice } = req.query;
            
            let query = {};

            // Search by keyword in name or location
            if (keyword) {
                query.$or = [
                    { campsiteName: { $regex: keyword, $options: 'i' } },
                    { location: { $regex: keyword, $options: 'i' } }
                ];
            }

            // Filter by facilities
            if (facilities) {
                const facilitiesArray = facilities.split(',');
                query.facilities = { $all: facilitiesArray };
            }

            // Filter by minimum rating
            if (minRating) {
                query.rating = { $gte: parseFloat(minRating) };
            }

            // Filter by maximum price
            if (maxPrice) {
                query['priceRange.max'] = { $lte: parseFloat(maxPrice) };
            }

            const campsites = await Campsite.find(query);

            res.status(200).json({
                success: true,
                data: campsites.map(site => ({
                    id: site._id,
                    name: site.campsiteName,
                    location: site.location,
                    coordinates: {
                        lat: site.latitude,
                        lng: site.longitude
                    },
                    imageURL: site.imageURL,
                    rating: site.rating || 0,
                    facilities: site.facilities || [],
                    priceRange: site.priceRange
                }))
            });
        } catch (error) {
            console.error('Search campsites error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    },

    // Add a review to a campsite
    addReview: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { rating, comment, images } = req.body;

            // Validate required fields
            if (!rating || !comment) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating and comment are required'
                });
            }

            // Check if campsite exists
            const campsite = await Campsite.findById(id);
            if (!campsite) {
                return res.status(404).json({
                    success: false,
                    message: 'Campsite not found'
                });
            }

            // Check if user has already reviewed this campsite
            const existingReview = await ReviewLocation.findOne({
                campsite_id: id,
                user_id: userId
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already reviewed this campsite'
                });
            }

            // Create new review
            const review = new ReviewLocation({
                campsite_id: id,
                user_id: userId,
                rating,
                comment,
                images: images || []
            });

            await review.save();

            // Update campsite rating
            const reviews = await ReviewLocation.find({ campsite_id: id });
            const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
            campsite.rating = averageRating;
            await campsite.save();

            // Get user info for response
            const user = await Users.findById(userId);

            res.status(201).json({
                success: true,
                message: 'Review added successfully',
                data: {
                    id: review._id,
                    rating: review.rating,
                    comment: review.comment,
                    images: review.images,
                    created_at: review.created_at,
                    user: {
                        id: user._id,
                        name: user.user_name,
                        profileImage: user.profileImage
                    }
                }
            });
        } catch (error) {
            console.error('Add review error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
};

module.exports = campsiteController; 