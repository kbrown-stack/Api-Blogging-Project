const paginationMiddleware = (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 20; // Default to 20 items per page
    const skip = (page - 1) * limit; // Calculate number of documents to skip
  
    // Attach pagination details to request
    req.pagination = {
      page,
      limit,
      skip,
    };
  
    next();
  };
  
  module.exports = paginationMiddleware;
  