const catchAsync = (fn) => {
    const errorHandler = (req, res, next) => {
        fn(req, res, next).catch(next)
    }

    return errorHandler
}

export { catchAsync }
