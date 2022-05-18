const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const reviewModel = require('../models/reviewModel')
const validator = require('../validation/validator')
const aws = require('../aws/aws')


// 1. create book
const createBook = async function (req, res) {
  try {

    const bookBody = req.body
    let files = req.files

    if (!validator.isValidRequestBody(bookBody)) {
      return res.status(400).send({ status: false, message: 'Please provide book details' })
    }

    const { title, bookCover, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = bookBody

    if (!validator.isValid(title)) {
      return res.status(400).send({ status: false, message: 'title is required' })
    }

    const isTitleAlreadyUsed = await bookModel.findOne({ title: title })

    if (isTitleAlreadyUsed) {
      return res.status(400).send({ status: false, message: 'Title is already used' })
    }

    if (!validator.isValid(excerpt)) {
      return res.status(400).send({ status: false, message: 'excerpt is required' })
    }

    if (!validator.isValid(userId)) {
      return res.status(400).send({ status: false, message: 'userId is required' })
    }

    if (!(/^[0-9a-fA-F]{24}$/.test(userId))) {
      return res.status(400).send({ status: false, message: 'please provide valid userId' })
    }

    const isUserPresent = await userModel.findById(userId)

    if (!isUserPresent) {
      return res.status(404).send({ status: false, message: `userId ${userId} is not present` })
    }

    if (req.userId != userId) {
      return res.status(401).send({ status: false, message: 'You are not authorized to create a Book' })
    }

    if (!validator.isValid(ISBN)) {
      return res.status(400).send({ status: false, message: 'ISBN is required' })
    }

    if (!(/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN))) {
      return res.status(400).send({ status: false, message: 'please provide valid ISBN' })
    }

    const isISBNAlreadyused = await bookModel.findOne({ ISBN: ISBN })

    if (isISBNAlreadyused) {
      return res.status(400).send({ status: false, message: 'ISBN is already used' })
    }

    if (!validator.isValid(category)) {
      return res.status(400).send({ status: false, message: 'category is required' })
    }

    if (!validator.isValid(subcategory)) {
      return res.status(400).send({ status: false, message: 'subcategory is required' })
    }

    if (!validator.isValid(releasedAt)) {
      return res.status(400).send({ status: false, message: 'releasedAt is required' })
    }

    if (!(/^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/.test(releasedAt))) {
      return res.status(400).send({ status: false, message: "Plz provide valid released Date" })
    }


    if (bookBody.isDeleted != null) bookBody.isDeleted = false

    if (bookBody.deletedAt != null) bookBody.deletedAt = ''

    if (bookBody.reviews != null) bookBody.reviews = 0

    // AWS 
    if (files) {
      const uploadedFiles = [];
      for (const file of files) {
        const fileRes = await aws.uploadFile(file);
        uploadedFiles.push(fileRes.Location);
      }
      bookBody.bookCover = uploadedFiles;
      const bookCreated = await bookModel.create(bookBody);
      return res.status(201).send({ status: true, message: 'Book created successfully !', data: bookCreated })
    }
  }
  catch (error) {
    return res.status(500).send({ status: false, error: error.message })
  }
}




// 2. fetch books
const getBooks = async function (req, res) {

  try {
    const filter = { isDeleted: false }
    const queryParams = req.query

    if (validator.isValidRequestBody(queryParams)) {
      const { userId, category, subcategory } = queryParams

      if (validator.isValid(userId)) {
        filter.userId = userId
      }
      if (validator.isValid(category)) {
        filter.category = category.trim()
      }
      if (validator.isValid(subcategory)) {
        filter.subcategory = subcategory.trim()
      }
    }

    const books = await bookModel.find(filter).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).collation({ locale: 'en' }).sort({ title: 1 })

    if (Array.isArray(books) && books.length === 0) {
      res.status(404).send({ status: false, message: 'book not find' })
    }
    res.status(200).send({ status: false, message: 'Book List', data: books })
  }
  catch (error) {
    return res.status(500).send({ status: true, message: error.message })
  }
}




// 3. fetch book by id
const getBookById = async function (req, res) {
  try {
    const bookId = req.params.bookId

    if (!(/^[0-9a-fA-F]{24}$/.test(bookId))) {
      return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
    }

    const book = await bookModel.findOne({ _id: bookId, isDeleted: false })

    if (!book) {
      return res.status(404).send({ status: false, message: 'book not found' })
    }

    const reviews = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

    const data = book.toObject()
    data.reviewsData = reviews

    return res.status(200).send({ status: true, message: 'Book Details', data: data })
  }

  catch (error) {
    return res.status(500).send({ status: false, error: error.message })
  }
}




// 4. update book
const updateBook = async function (req, res) {
  try {
    const bookId = req.params.bookId
    const updationBody = req.body
    const userIdFromToken = req.userId

    if (!(/^[0-9a-fA-F]{24}$/.test(bookId))) {
      return res.status(400).send({ status: false, message: `${bookId} is not a valid book idd` })
    }

    const book = await bookModel.findOne({ _id: bookId, isDeleted: false })

    if (!book) {
      return res.status(404).send({ status: false, message: 'Book not found' })
    }

    if (!(/^[0-9a-fA-F]{24}$/.test(updationBody.userId))) {
      return res.status(400).send({ status: false, message: `${userId} is not a valid book idd` })
    }

    if (userIdFromToken != updationBody.userId) {
      return res.status(401).send({ status: false, message: 'You are not authorized to update a Book' })
    }

    if (!validator.isValidRequestBody(updationBody)) {
      return res.status(400).send({ status: false, message: 'please provide data for updation' })
    }

    const { title, excerpt, ISBN, releasedAt } = updationBody

    const updateBookData = {}

    if (validator.isValid(title)) {

      const isTitleAlreadyUsed = await bookModel.findOne({ title })
      if (isTitleAlreadyUsed) {
        return res.status(400).send({ status: false, message: 'This title already in use ,please provide another one' })
      }
      updateBookData.title = title
    }

    if (validator.isValid(excerpt)) {
      updateBookData.excerpt = excerpt
    }

    if (validator.isValid(ISBN)) {

      if (!(/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN))) {
        return res.status(400).send({ status: false, message: 'please provide valid ISBN' })
      }

      const isISBNAlreadyUsed = await bookModel.findOne({ ISBN })
      if (isISBNAlreadyUsed) {
        return res.status(400).send({ status: false, message: 'This ISBN already in use ,please provide another one' })
      }
      updateBookData.ISBN = ISBN
    }

    if (validator.isValid(releasedAt)) {

      if (releasedAt && !(/^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/.test(releasedAt))) {
        return res.status(400).send({ status: false, message: 'please provide valid date in format (YYYY-MM-DD)' })
      }
      updateBookData.releasedAt = releasedAt
    }

    const updatedBook = await bookModel.findOneAndUpdate({ _id: bookId }, updateBookData, { new: true })

    return res.status(200).send({ status: true, message: 'Book updated successfully', data: updatedBook })
  }
  catch (error) {
    console.log(error)
    res.status(500).send({ status: false, message: error.message })
  }
}




// 5. delete book by id
const deleteBookById = async function (req, res) {
  try {

    const bookId = req.params.bookId

    if (!(/^[0-9a-fA-F]{24}$/.test(bookId))) {
      return res.status(400).send({ status: false, message: 'please provide valid bookId' })
    }

    const book = await bookModel.findOne({ _id: bookId })

    if (!book) {
      res.status(404).send({ status: false, message: 'book not found' })
      return
    }

    if (req.userId != book.userId) {
      return res.status(401).send({ status: false, message: 'You are not authorized to Delete this Book' })
    }

    if (book.isDeleted == true) {
      return res.status(400).send({ status: false, message: "Book is already deleted" })
    }

    const deletedBook = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } })

    return res.status(200).send({ status: true, message: "Success", message: "Book deleted successfully" })
  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}


module.exports.createBook = createBook
module.exports.getBooks = getBooks
module.exports.getBookById = getBookById
module.exports.updateBook = updateBook
module.exports.deleteBookById = deleteBookById


