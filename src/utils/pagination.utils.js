/**
 * Creates pagination parameters from request query parameters
 * @param {Object} query - The request query object
 * @param {Number} query.page - The requested page number
 * @param {Number} query.limit - The number of items per page
 * @returns {Object} - Pagination parameters (page, limit, offset)
 */
export const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

/**
 * Creates pagination metadata for response
 * @param {Number} total - Total number of items
 * @param {Number} page - Current page number
 * @param {Number} limit - Number of items per page
 * @returns {Object} - Pagination metadata
 */
export const getPaginationMeta = (total, page, limit) => {
  return {
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    pageSize: limit,
    hasNext: page < Math.ceil(total / limit),
    hasPrevious: page > 1,
  };
};

/**
 * Executes a paginated query and returns data with pagination metadata
 * @param {Object} model - Sequelize model
 * @param {Object} options - Query options
 * @param {Object} options.where - Where conditions
 * @param {Array} options.include - Included relations
 * @param {Array} options.order - Order by
 * @param {Object} query - Request query parameters
 * @returns {Object} - Paginated results with metadata
 */
export const paginatedQuery = async (model, options, paginationMetaData) => {
  const { page, limit, offset } = paginationMetaData;

  // Count total items
  const total = await model.count({
    where: options.where || {},
    include: options.include,
    distinct: true,
  });

  // Get paginated data
  const items = await model.findAll({
    ...options,
    limit,
    offset,
  });

  return {
    data: items,
    pagination: getPaginationMeta(total, page, limit),
  };
};
