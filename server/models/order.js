const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    items: [{
        id: String,
        name: String,
        price: Number,
        size: String,
        color: String,
        quantity: Number,
        image: String
    }],
    shipping: {
        name: String,
        email: String,
        address: String,
        city: String,
        state: String,
        zip: String
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['processing', 'confirmed', 'shipped', 'delivered'],
        default: 'processing'
    },
    stripeChargeId: String,
    trackingNumber: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', orderSchema);