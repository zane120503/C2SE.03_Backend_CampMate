const Users = require("../models/Users");

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
};
module.exports = userController;
