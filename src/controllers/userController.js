const Users = require("../models/Users");
const Review = require("../models/Review");

const userController = {
    getUserData: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await Users.findById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({
                success: true,
                userData: {
                    _id: user._id,
                    user_name: user.user_name,
                    email: user.email,
                    isAccountVerified: user.isAccountVerified || false,
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getProductReviews: async (req, res) => {
        try {
            const { productId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const reviews = await Review.find({ product_id: productId })
                .populate('user_id', 'user_name email')
                .select('rating comment images created_at user_id')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            const totalReviews = await Review.countDocuments({ product_id: productId });

            const formattedReviews = reviews.map(review => ({
                _id: review._id,
                user_name: review.user_id.user_name,
                rating: review.rating,
                comment: review.comment,
                images: review.images,
                created_at: review.created_at,
                user_id: review.user_id._id
            }));

            res.json({
                success: true,
                data: {
                    reviews: formattedReviews,
                    pagination: {
                        total: totalReviews,
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalReviews / limit),
                        limit: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    },
    
    createReview: async (req, res) => {
        try {
            const userId = req.user.id;
            const { productId, rating, comment, images } = req.body;

            // Validate required fields
            if (!productId || !rating || !comment) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID, rating, and comment are required"
                });
            }

            // Validate rating range
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });
            }

            const newReview = new Review({
                product_id: productId,
                user_id: userId,
                rating: rating,
                comment: comment,
                images: images || []
            });

            await newReview.save();

            // Populate user information in the response
            const populatedReview = await Review.findById(newReview._id)
                .populate('user_id', 'user_name email');

            res.status(201).json({
                success: true,
                message: "Review created successfully",
                data: populatedReview
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
};

module.exports = userController;