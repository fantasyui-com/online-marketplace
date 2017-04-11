module.exports = async function ({ route }) {
  return async function (req, res, next) {
    try {
      // ... //
      next();
    } catch (err) {
      next(err);
    }
  }
};
