const Card = require('../models/Card');

const cardService = {
    addCard: async (params) => {
        try {
            // Check if card number already exists
            const existingCard = await Card.findOne({ card_number: params.card_number });
            if (existingCard) {
                throw new Error("Card number already exists");
            }

            // If this is the first card or is_default is true, handle default card
            if (params.is_default) {
                await Card.updateMany(
                    { user_id: params.user_id },
                    { is_default: false }
                );
            }

            const card = new Card({
                user_id: params.user_id,
                card_name: params.card_name,
                card_number: params.card_number,
                card_exp_month: params.card_exp_month,
                card_exp_year: params.card_exp_year,
                card_cvc: params.card_cvc,
                is_default: params.is_default || false
            });

            await card.save();
            return card;
        } catch (error) {
            throw new Error(error.message || "Error adding card");
        }
    },

    updateCard: async (userId, id, params) => {
        try {
            // If setting as default, update other cards
            if (params.is_default) {
                await Card.updateMany(
                    { user_id: userId, _id: { $ne: id } },
                    { is_default: false }
                );
            }

            const card = await Card.findOneAndUpdate(
                { user_id: userId, _id: id },
                {
                    card_name: params.card_name,
                    card_number: params.card_number,
                    card_exp_month: params.card_exp_month,
                    card_exp_year: params.card_exp_year,
                    card_cvc: params.card_cvc,
                    is_default: params.is_default
                },
                { new: true }
            );

            if (!card) {
                throw new Error("Card not found or unauthorized access");
            }

            return card;
        } catch (error) {
            throw new Error(error.message || "Error updating card");
        }
    },

    deleteCard: async (userId, id) => {
        try {
            const card = await Card.findOneAndDelete({ user_id: userId, _id: id });
            if (!card) {
                throw new Error("Card not found or unauthorized access");
            }
            return card;
        } catch (error) {
            throw new Error(error.message || "Error deleting card");
        }
    },

    getAllCards: async (userId) => {
        try {
            const cards = await Card.find({ user_id: userId });
            return cards;
        } catch (error) {
            throw new Error(error.message || "Error retrieving cards");
        }
    },

    setDefaultCard: async (userId, id) => {
        try {
            // Check if card exists and belongs to user
            const card = await Card.findOne({ user_id: userId, _id: id });
            if (!card) {
                throw new Error("Card not found or unauthorized access");
            }

            // Update all cards to set is_default to false
            await Card.updateMany(
                { user_id: userId },
                { is_default: false }
            );

            // Set the selected card as default
            card.is_default = true;
            await card.save();

            return card;
        } catch (error) {
            throw new Error(error.message || "Error setting default card");
        }
    }
};

module.exports = cardService;
