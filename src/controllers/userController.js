const Users = require("../models/Users");
const Review = require("../models/Review");
const cloudinary = require("../Config/cloudinary");
const cartService = require("../services/cartService");
const ProductWishlist = require("../models/ProductWishlist");
const Product = require("../models/Products");

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
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone_number: user.phone_number,
                    profileImage: user.profileImage,
                    isProfileCompleted: user.isProfileCompleted
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { first_name, last_name, phone_number } = req.body;

            // Validate required fields
            if (!first_name || !last_name || !phone_number) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required fields"
                });
            }

            // Validate phone number format
            if (!/^[0-9]{10}$/.test(phone_number)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 10-digit phone number"
                });
            }

            const user = await Users.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Update user profile
            user.first_name = first_name;
            user.last_name = last_name;
            user.phone_number = phone_number;
            
            // If new image was uploaded, update profileImage
            if (req.file) {
                user.profileImage = req.file.path;
            }
            
            user.isProfileCompleted = true;

            await user.save();

            return res.json({
                success: true,
                message: "Profile updated successfully",
                userData: {
                    _id: user._id,
                    user_name: user.user_name,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone_number: user.phone_number,
                    profileImage: user.profileImage,
                    isProfileCompleted: user.isProfileCompleted
                }
            });

        } catch (error) {
            console.error("Profile update error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // Cart Controllers
    addToCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;

            if (!productId || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID and quantity are required"
                });
            }

            const cart = await cartService.addToCart(userId, productId, quantity);
            res.status(200).json({
                success: true,
                message: "Item added to cart successfully",
                data: cart
            });
        } catch (error) {
            console.error("Add to cart error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    getCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const cart = await cartService.getCartByUserId(userId);

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: "Cart not found"
                });
            }

            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            console.error("Get cart error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    updateCartItem: async (req, res) => {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;

            if (!productId || quantity === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID and quantity are required"
                });
            }

            const cart = await cartService.updateItemQuantity(userId, productId, quantity);
            res.status(200).json({
                success: true,
                message: "Cart updated successfully",
                data: cart
            });
        } catch (error) {
            console.error("Update cart error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    removeFromCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required"
                });
            }

            const cart = await cartService.removeFromCart(userId, productId);
            res.status(200).json({
                success: true,
                message: "Item removed from cart successfully",
                data: cart
            });
        } catch (error) {
            console.error("Remove from cart error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    removeMultipleItems: async (req, res) => {
        try {
            const userId = req.user.id;
            const { productIds } = req.body;

            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Product IDs array is required"
                });
            }

            const cart = await cartService.removeMultipleItems(userId, productIds);
            res.status(200).json({
                success: true,
                message: "Items removed from cart successfully",
                data: cart
            });
        } catch (error) {
            console.error("Remove multiple items error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    clearCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const cart = await cartService.clearCart(userId);

            res.status(200).json({
                success: true,
                message: "Cart cleared successfully",
                data: cart
            });
        } catch (error) {
            console.error("Clear cart error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    // Wishlist Controllers
    addToWishlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required"
                });
            }

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // Find or create wishlist
            let wishlist = await ProductWishlist.findOne({ user_id: userId });
            if (!wishlist) {
                wishlist = new ProductWishlist({
                    user_id: userId,
                    products: [productId]
                });
                await wishlist.save();
            } else {
                // Check if product already exists in wishlist
                if (wishlist.products.includes(productId)) {
                    return res.status(400).json({
                        success: false,
                        message: "Product already in wishlist"
                    });
                }
                wishlist.products.push(productId);
                await wishlist.save();
            }

            // Populate product details
            await wishlist.populate('products');

            res.status(200).json({
                success: true,
                message: "Product added to wishlist successfully",
                data: wishlist
            });
        } catch (error) {
            console.error("Add to wishlist error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    getWishlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const wishlist = await ProductWishlist.findOne({ user_id: userId }).populate('products');

            if (!wishlist) {
                return res.status(404).json({
                    success: false,
                    message: "Wishlist not found"
                });
            }

            res.status(200).json({
                success: true,
                data: wishlist
            });
        } catch (error) {
            console.error("Get wishlist error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    removeFromWishlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required"
                });
            }

            const wishlist = await ProductWishlist.findOne({ user_id: userId });
            if (!wishlist) {
                return res.status(404).json({
                    success: false,
                    message: "Wishlist not found"
                });
            }

            // Remove product from wishlist
            wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
            await wishlist.save();

            // Populate product details
            await wishlist.populate('products');

            res.status(200).json({
                success: true,
                message: "Product removed from wishlist successfully",
                data: wishlist
            });
        } catch (error) {
            console.error("Remove from wishlist error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    getProductReviews: async (req, res) => {
        try {
            const { productId } = req.params;

            const reviews = await Review.find({ product_id: productId })
                .select('rating comment images created_at user_id')
                .sort({ created_at: -1 });

            // Get user information for each review
            const reviewsWithUserInfo = await Promise.all(reviews.map(async (review) => {
                const user = await Users.findById(review.user_id);
                return {
                    _id: review._id,
                    user_name: user ? user.user_name : 'Unknown User',
                    user_image: user ? user.profileImage : null,
                    rating: review.rating,
                    comment: review.comment,
                    images: review.images,
                    created_at: review.created_at,
                    user_id: review.user_id
                };
            }));

            // Tính toán tổng số review và rating trung bình
            const totalReviews = reviewsWithUserInfo.length;
            const averageRating = totalReviews > 0 
                ? reviewsWithUserInfo.reduce((acc, review) => acc + review.rating, 0) / totalReviews 
                : 0;

            res.json({
                success: true,
                data: {
                    reviews: reviewsWithUserInfo,
                    summary: {
                        totalReviews,
                        averageRating: Number(averageRating.toFixed(1))
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
            const { productId, rating, comment } = req.body;

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

            // Check if user has already reviewed this product
            const existingReview = await Review.findOne({
                product_id: productId,
                user_id: userId
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: "You have already reviewed this product"
                });
            }

            // Handle image uploads
            let images = [];
            if (req.files && req.files.length > 0) {
                images = req.files.map(file => file.path);
            }

            const newReview = new Review({
                product_id: productId,
                user_id: userId,
                rating: rating,
                comment: comment,
                images: images
            });

            await newReview.save();

            // Get user information for the response
            const user = await Users.findById(userId);

            res.status(201).json({
                success: true,
                message: "Review created successfully",
                data: {
                    _id: newReview._id,
                    user_name: user ? user.user_name : 'Unknown User',
                    user_image: user ? user.profileImage : null,
                    rating: newReview.rating,
                    comment: newReview.comment,
                    images: newReview.images,
                    created_at: newReview.created_at,
                    user_id: newReview.user_id
                }
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