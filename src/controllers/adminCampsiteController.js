const Campsite = require('../models/Campsite');
const cloudinary = require('../Config/cloudinary');

// Get all campsites with pagination and search
exports.getAllCampsites = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        // Build search query
        const searchQuery = search ? {
            $or: [
                { campsiteName: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        } : {};

        // Build sort query
        const sortQuery = {};
        sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const campsites = await Campsite.find(searchQuery)
            .sort(sortQuery)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Campsite.countDocuments(searchQuery);

        res.json({
            campsites,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalCampsites: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single campsite
exports.getCampsite = async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.id);
        if (!campsite) {
            return res.status(404).json({ message: 'Campsite not found' });
        }
        res.json(campsite);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create new campsite
exports.createCampsite = async (req, res) => {
    try {
        const { 
            campsiteName, 
            location, 
            latitude, 
            longitude, 
            description, 
            facilities = [],
            priceRange,
            contactInfo,
            openingHours
        } = req.body;
        
        // Validate required fields
        if (!campsiteName || !location || !latitude || !longitude || !description) {
            return res.status(400).json({ 
                message: 'Missing required fields: campsiteName, location, latitude, longitude, description' 
            });
        }

        // Check if campsite name already exists
        const existingCampsite = await Campsite.findOne({ campsiteName });
        if (existingCampsite) {
            return res.status(400).json({ message: 'Campsite name already exists' });
        }

        // Handle multiple images upload
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        // Upload all images to Cloudinary
        const imagePromises = req.files.map(file => cloudinary.uploader.upload(file.path));
        const imageResults = await Promise.all(imagePromises);

        // Prepare images array for database
        const images = imageResults.map(result => ({
            url: result.secure_url,
            public_id: result.public_id
        }));

        const campsite = new Campsite({
            campsiteName,
            location,
            latitude: Number(latitude),
            longitude: Number(longitude),
            description,
            facilities,
            images,
            priceRange: priceRange ? {
                min: Number(priceRange.min),
                max: Number(priceRange.max)
            } : undefined,
            contactInfo: contactInfo ? {
                phone: contactInfo.phone,
                email: contactInfo.email,
                website: contactInfo.website
            } : undefined,
            openingHours: openingHours ? {
                open: openingHours.open,
                close: openingHours.close
            } : undefined
        });

        await campsite.save();
        res.status(201).json({ 
            message: 'Campsite created successfully',
            campsite
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update campsite
exports.updateCampsite = async (req, res) => {
    try {
        const { 
            campsiteName, 
            location, 
            latitude, 
            longitude, 
            description, 
            facilities,
            priceRange,
            contactInfo,
            openingHours
        } = req.body;

        const campsite = await Campsite.findById(req.params.id);
        
        if (!campsite) {
            return res.status(404).json({ message: 'Campsite not found' });
        }

        // Check if new campsite name already exists
        if (campsiteName && campsiteName !== campsite.campsiteName) {
            const existingCampsite = await Campsite.findOne({ campsiteName });
            if (existingCampsite) {
                return res.status(400).json({ message: 'Campsite name already exists' });
            }
        }

        // Handle images update if new images are uploaded
        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            const deletePromises = campsite.images.map(image => 
                cloudinary.uploader.destroy(image.public_id)
            );
            await Promise.all(deletePromises);

            // Upload new images
            const imagePromises = req.files.map(file => 
                cloudinary.uploader.upload(file.path)
            );
            const imageResults = await Promise.all(imagePromises);

            // Update images array
            campsite.images = imageResults.map(result => ({
                url: result.secure_url,
                public_id: result.public_id
            }));
        }

        // Update other fields
        if (campsiteName) campsite.campsiteName = campsiteName;
        if (location) campsite.location = location;
        if (latitude) campsite.latitude = Number(latitude);
        if (longitude) campsite.longitude = Number(longitude);
        if (description) campsite.description = description;
        if (facilities) campsite.facilities = facilities;
        
        if (priceRange) {
            campsite.priceRange = {
                min: Number(priceRange.min),
                max: Number(priceRange.max)
            };
        }
        
        if (contactInfo) {
            campsite.contactInfo = {
                phone: contactInfo.phone,
                email: contactInfo.email,
                website: contactInfo.website
            };
        }
        
        if (openingHours) {
            campsite.openingHours = {
                open: openingHours.open,
                close: openingHours.close
            };
        }

        campsite.updatedAt = Date.now();
        await campsite.save();
        
        res.json({ 
            message: 'Campsite updated successfully',
            campsite
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete campsite
exports.deleteCampsite = async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.id);
        if (!campsite) {
            return res.status(404).json({ message: 'Campsite not found' });
        }

        // Delete all images from Cloudinary
        const deletePromises = campsite.images.map(image => 
            cloudinary.uploader.destroy(image.public_id)
        );
        await Promise.all(deletePromises);

        // Delete campsite from database
        await Campsite.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Campsite deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Toggle campsite status
exports.toggleCampsiteStatus = async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.id);
        if (!campsite) {
            return res.status(404).json({ message: 'Campsite not found' });
        }

        campsite.isActive = !campsite.isActive;
        campsite.updatedAt = Date.now();
        await campsite.save();

        res.json({ 
            message: `Campsite ${campsite.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: campsite.isActive
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
