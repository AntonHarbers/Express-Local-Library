const BookInstance = require('../models/bookinstance');
const asyncHandler = require('express-async-handler');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

// Display the list of all BookInstances

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate('book').exec();

  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate('book')
    .exec();

  if (!bookInstance) {
    const err = new Error('Book copy not found');
    err.status = 404;
    return next(err);
  }

  res.render('bookinstance_detail', {
    title: `Book: `,
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET

exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}).sort({ title: 1 }).exec();

  res.render('bookinstance_form', {
    title: 'Create Book Copy',
    books: allBooks,
    statuses: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
  });
});

// Display BookInstance create on POST

exports.bookinstance_create_post = [
  body('imprint', 'Imprint must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('book', 'Book must not be empty').trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const instance = new BookInstance({
      imprint: req.body.imprint,
      book: req.body.book,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}).sort({ title: 1 }).exec();

      res.render('bookinstance_form', {
        title: 'Create Book Copy',
        books: allBooks,
        errors: errors.array(),
        statuses: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
      });
    } else {
      await instance.save();
      res.redirect(instance.url);
    }
  }),
];

// Display BookInstance delete form on GET

exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate('book')
    .exec();
  if (bookInstance === null) {
    res.redirect('/catalog/bookinstances');
  }

  res.render('bookinstance_delete', {
    title: 'Delete Book Copy',
    instance: bookInstance,
  });
});

// Display BookInstance delete on POST

exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookInstance = BookInstance.findById(req.body.instanceid).exec();
  await BookInstance.findByIdAndDelete(req.body.instanceid);
  res.redirect('/catalog/bookinstances');
});

// Display BookInstance update form on GET

exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookInstance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id).populate('book').exec(),
    Book.find().sort({ title: 1 }).exec(),
  ]);

  if (bookInstance === null) {
    const err = new Error('Book Copy not found');
    err.status = 404;
    return next(err);
  }

  res.render('bookinstance_form', {
    title: 'Update Book Copy',
    instance: bookInstance,
    books: allBooks,
    statuses: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
  });
});

// Display BookInstance update on POST

exports.bookinstance_update_post = [
  body('imprint', 'Impring must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('book', 'Book must be selected').trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const [bookInstance, allBooks] = new Promise.all([
        BookInstance.findById(req.params.id).exec(),
        Book.find().sort({ title: 1 }).exec(),
      ]);

      res.render('bookinstance_form', {
        title: 'Update Book Copy',
        instance: bookInstance,
        books: allBooks,
        statuses: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
        errors: errors.array(),
      });
      return;
    } else {
      const updatedBookinstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookInstance,
        {}
      );
      res.redirect(updatedBookinstance.url);
    }
  }),
];
