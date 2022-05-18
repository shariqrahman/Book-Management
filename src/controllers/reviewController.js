const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const validator = require('../validation/validator')

// 1. create review
const createReview = async function (req, res) {
    try {
        const reviewBody = req.body
        
        const bookId = req.params.bookId

        if (!validator.isValidRequestBody(reviewBody)) {
            return res.status(400).send({ status: false, message: 'Please provide review details' })
        }

        if (!(/^[0-9a-fA-F]{24}$/.test(bookId))) {
            return res.status(400).send({ status: false, message: 'please provide valid bookId' })
        }

        const book = await bookModel.findOne({_id: bookId, isDeleted: false})

        if (!book) {
            return res.status(404).send({ status: false, message: `Params ${bookId} not found` })
        }

        const { review, rating, reviewedBy } = reviewBody

        if (!(/^[0-9a-fA-F]{24}$/.test(reviewBody.bookId))) {
            return res.status(400).send({ status: false, message: 'please provide valid bookId' })
        }

        const bookBody = await bookModel.findOne({_id: reviewBody.bookId, isDeleted: false})

        if (!bookBody) {
            return res.status(404).send({ status: false, message: `book ${bookId} not found` })
        }

        if (!validator.isValid(rating)) {
            return res.status(400).send({ status: false, message: 'rating is required' })
        }

        if(rating < 1 || rating > 5) {
            return res.status(400).send({status: false, message: 'Rating should be 1 to 5'})
        }

        const reviewData = { bookId, rating, review, reviewedBy, reviewedAt: Date.now() }

        const addReview = await reviewModel.create(reviewData)

        book.reviews = book.reviews + 1
        await book.save()
        
        const data = book.toObject()
        data.reviewsData = addReview

        return res.status(201).send({ status: true, message: 'Review added successsfully', data: data})
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



// 2. update review
const updateReviews = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId
        const updationBody = req.body

        if (!(/^[0-9a-fA-F]{24}$/.test(bookId))) {
            return res.status(400).send({ status: false, message: 'please provide valid bookId' })
        }

        const book = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if(!book) {
            return res.status(404).send({status: false, message: 'bookId not found'})
        }

        if (!validator.isValidRequestBody(updationBody)) {
            return res.status(400).send({ status: false, message: 'Please provide updation details' })
        }

        const isReview = await reviewModel.findOne({ _id: reviewId,  isDeleted: false })

        if(!isReview) {
            return res.status(404).send({status: false, message: 'review not found'})
        }

        const { review, rating, reviewedBy } = updationBody;

        const updateData = {}

        if(validator.isValid(review)) {
            updateData.review = review
        }

        if(validator.isValid(rating)) {
            if(rating < 1 || rating > 5) {
                return res.status(400).send({status: false, message: 'Rating should be 1 to 5'})
            }
            updateData.rating = rating
        }

        
        if(validator.isValid(reviewedBy)) {
            updateData.reviewedBy = reviewedBy
        }

        const updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewId} , updateData, { new: true })

        const data = book.toObject()
        data.reviewsData = updatedReview

        return res.status(200).send({ status: true, message: 'Success', data: data});
    }
    catch(error) {
        res.status(500).send({status: false, message: error.message})
    }
}


// 3. delete review
const deleteReview = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId

        if (!(/^[0-9a-fA-F]{24}$/.test(bookId))) {
            return res.status(400).send({ status: false, message: 'please provide valid bookId' })
        }

        const book = await bookModel.findOne({ _id: bookId, isDeleted: false})

        if(!book) {
            return res.status(404).send({ status: false, message: 'Book not found'})
        }

        if (!(/^[0-9a-fA-F]{24}$/.test(reviewId))) {
            return res.status(400).send({ status: false, message: 'please provide valid reviewId' })
        }

        const review = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })

        if (!review) {
            return res.status(404).send({ status: false, message: 'Review not found' })
        }

        await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { isDeleted: true } } )

        book.reviews = book.reviews === 0 ? 0 : book.reviews - 1
        await book.save()

        return res.status(200).send({ status: true, message: 'Successfully Deleted' })
    }
    catch(error) {
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports.createReview = createReview
module.exports.updateReviews = updateReviews
module.exports.deleteReview = deleteReview


