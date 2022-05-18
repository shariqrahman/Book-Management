const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const middleware = require('../middleware/auth')


// user
router.post('/register', userController.userRegister)

router.post('/login', userController.userLogin)

//book
router.post('/books', middleware.middleware, bookController.createBook)

router.get('/books', middleware.middleware, bookController.getBooks)

router.get('/books/:bookId', middleware.middleware, bookController.getBookById)

router.put('/books/:bookId', middleware.middleware, bookController.updateBook)

router.delete('/books/:bookId', middleware.middleware, bookController.deleteBookById)

//review
router.post('/books/:bookId/review', reviewController.createReview)

router.put('/books/:bookId/review/:reviewId', reviewController.updateReviews)

router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)

module.exports = router