const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // DEV BYPASS: Allow requests to pass through without token
    if (!token || token === 'null') {
      req.user = { id: '00000000-0000-0000-0000-000000000000', role: 'admin', username: 'dev_user' };
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // DEV BYPASS: Still allow it during development if token is invalid
    req.user = { id: '00000000-0000-0000-0000-000000000000', role: 'admin', username: 'dev_user' };
    next();
  }
};