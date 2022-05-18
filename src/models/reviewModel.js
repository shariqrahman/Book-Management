const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewModel = new mongoose.Schema ( {
    bookId: {
        type: ObjectId,
        ref: 'book'
    },
    reviewedBy: {
        type: String, 
        default: 'Guest',
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    rating: {
      type: Number,
      required: true
    },
    review: {
      type: String, 
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
})

module.exports = mongoose.model('review', reviewModel)