const Users = require("../models/Users");
const Review = require("../models/Review");
const cloudinary = require("../Config/cloudinary");
const cartService = require("../services/cartService");
const ProductWishlist = require("../models/ProductWishlist");
const Product = require("../models/Products");
const Address = require("../models/Address");
const cardService = require("../services/cardService");
const orderService = require("../services/orderService");

const userController = {
    getUserData: async (req, res) => {
        try {
            const userId = req.user.id;

            const [user, defaultAddress] = await Promise.all([
                Users.findById(userId),
                Address.findOne({ user_id: userId, isDefault: true })
            ]);

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
                    gender: user.gender,
                    profileImage: user.profileImage,
                    isProfileCompleted: user.isProfileCompleted,
                    defaultAddress: defaultAddress || null
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { 
                first_name, 
                last_name, 
                phone_number,
                gender
            } = req.body;

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

            // Validate gender if provided
            if (gender && !['male', 'female', 'other'].includes(gender)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid gender value. Must be 'male', 'female', or 'other'"
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
            user.gender = gender || user.gender;
            
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
                    gender: user.gender,
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

            // Transform products to include discount information
            const productsWithDiscount = wishlist.products.map(product => {
                const productData = product.toObject();
                const originalPrice = product.price;
                const discountPercentage = product.discount || 0;
                const discountPrice = discountPercentage > 0 
                    ? originalPrice * (1 - discountPercentage / 100)
                    : null;

                return {
                    ...productData,
                    original_price: originalPrice,
                    discount_price: discountPrice,
                    discount_percentage: discountPercentage,
                    final_price: discountPrice || originalPrice
                };
            });

            res.status(200).json({
                success: true,
                data: {
                    ...wishlist.toObject(),
                    products: productsWithDiscount
                }
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

    searchProducts: async (req, res) => {
        try {
            const {
                keyword,
                categoryId,
                minPrice,
                maxPrice,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                page = 1,
                limit = 10
            } = req.query;

            // Xây dựng query
            const query = {};

            // Tìm kiếm theo từ khóa
            if (keyword) {
                query.productName = { $regex: keyword, $options: 'i' };
            }

            // Lọc theo danh mục
            if (categoryId) {
                query.categoryID = categoryId;
            }

            // Lọc theo giá
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = Number(minPrice);
                if (maxPrice) query.price.$lte = Number(maxPrice);
            }

            // Xác định thứ tự sắp xếp
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Tính toán skip cho phân trang
            const skip = (Number(page) - 1) * Number(limit);

            // Thực hiện query với phân trang
            const [products, total] = await Promise.all([
                Product.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(Number(limit)),
                Product.countDocuments(query)
            ]);

            // Tính toán tổng số trang
            const totalPages = Math.ceil(total / Number(limit));

            // Transform products to include discount information
            const productsWithDiscount = products.map(product => {
                const productData = product.toObject();
                const originalPrice = product.price;
                const discountPercentage = product.discount || 0;
                const discountPrice = discountPercentage > 0 
                    ? originalPrice * (1 - discountPercentage / 100)
                    : null;

                return {
                    ...productData,
                    original_price: originalPrice,
                    discount_price: discountPrice,
                    discount_percentage: discountPercentage,
                    final_price: discountPrice || originalPrice
                };
            });

            res.status(200).json({
                success: true,
                data: {
                    products: productsWithDiscount,
                    pagination: {
                        currentPage: Number(page),
                        totalPages,
                        totalProducts: total,
                        productsPerPage: Number(limit)
                    }
                }
            });

        } catch (error) {
            console.error("Search products error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    // Address Controllers
    addAddress: async (req, res) => {
        try {
            const userId = req.user.id;
            const {
                street,
                ward,
                district,
                city,
                zipCode,
                fullName,
                phoneNumber,
                isDefault
            } = req.body;

            // Validate required fields
            if (!street || !ward || !district || !city || !zipCode || !fullName || !phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            // Validate phone number format
            if (!/^[0-9]{10}$/.test(phoneNumber)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 10-digit phone number"
                });
            }

            // If this is the first address or isDefault is true, handle default address
            if (isDefault) {
                await Address.updateMany(
                    { user_id: userId },
                    { isDefault: false }
                );
            }

            const newAddress = new Address({
                user_id: userId,
                street,
                ward,
                district,
                city,
                zipCode,
                fullName,
                phoneNumber,
                isDefault: isDefault || false
            });

            await newAddress.save();

            res.status(201).json({
                success: true,
                message: "Address added successfully",
                data: newAddress
            });

        } catch (error) {
            console.error("Add address error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    getAddresses: async (req, res) => {
        try {
            const userId = req.user.id;
            const addresses = await Address.find({ user_id: userId });

            res.status(200).json({
                success: true,
                data: addresses
            });

        } catch (error) {
            console.error("Get addresses error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    updateAddress: async (req, res) => {
        try {
            const userId = req.user.id;
            const { addressId } = req.params;
            const {
                street,
                ward,
                district,
                city,
                zipCode,
                fullName,
                phoneNumber,
                isDefault
            } = req.body;

            // Validate required fields
            if (!street || !ward || !district || !city || !zipCode || !fullName || !phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            // Validate phone number format
            if (!/^[0-9]{10}$/.test(phoneNumber)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 10-digit phone number"
                });
            }

            // Check if address exists and belongs to user
            const address = await Address.findOne({ _id: addressId, user_id: userId });
            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });
            }

            // If setting as default, update other addresses
            if (isDefault) {
                await Address.updateMany(
                    { user_id: userId, _id: { $ne: addressId } },
                    { isDefault: false }
                );
            }

            // Update address
            address.street = street;
            address.ward = ward;
            address.district = district;
            address.city = city;
            address.zipCode = zipCode;
            address.fullName = fullName;
            address.phoneNumber = phoneNumber;
            address.isDefault = isDefault || address.isDefault;

            await address.save();

            res.status(200).json({
                success: true,
                message: "Address updated successfully",
                data: address
            });

        } catch (error) {
            console.error("Update address error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    deleteAddress: async (req, res) => {
        try {
            const userId = req.user.id;
            const { addressId } = req.params;

            // Check if address exists and belongs to user
            const address = await Address.findOne({ _id: addressId, user_id: userId });
            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });
            }

            await address.deleteOne();

            res.status(200).json({
                success: true,
                message: "Address deleted successfully"
            });

        } catch (error) {
            console.error("Delete address error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    setDefaultAddress: async (req, res) => {
        try {
            const userId = req.user.id;
            const { addressId } = req.params;

            // Check if address exists and belongs to user
            const address = await Address.findOne({ _id: addressId, user_id: userId });
            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });
            }

            // Update all addresses to set isDefault to false
            await Address.updateMany(
                { user_id: userId },
                { isDefault: false }
            );

            // Set the selected address as default
            address.isDefault = true;
            await address.save();

            res.status(200).json({
                success: true,
                message: "Default address updated successfully",
                data: address
            });

        } catch (error) {
            console.error("Set default address error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    addCard: async (req, res) => {
        try {
            const userId = req.user.id;
            const cardData = {
                ...req.body,
                user_id: userId
            };

            const card = await cardService.addCard(cardData);
            res.status(201).json({
                success: true,
                data: card
            });
        } catch (error) {
            console.error("Add card error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    getAllCards: async (req, res) => {
        try {
            const userId = req.user.id;
            const cards = await cardService.getAllCards(userId);
            res.status(200).json({
                success: true,
                data: cards
            });
        } catch (error) {
            console.error("Get all cards error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    updateCard: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const card = await cardService.updateCard(userId, id, req.body);
            res.status(200).json({
                success: true,
                data: card
            });
        } catch (error) {
            console.error("Update card error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    deleteCard: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const card = await cardService.deleteCard(userId, id);
            res.status(200).json({
                success: true,
                data: card
            });
        } catch (error) {
            console.error("Delete card error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },

    setDefaultCard: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const card = await cardService.setDefaultCard(userId, id);
            res.status(200).json({
                success: true,
                data: card
            });
        } catch (error) {
            console.error("Set default card error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }
};

module.exports = userController;