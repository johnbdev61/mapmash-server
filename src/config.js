module.exports = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || 'my own secret',
  // JWT_EXPIRY: process.env.JWT_EXPIRY || '2d', //TODO: Delete this functionality
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgresql://postgres@localhost/map_mash',
}
