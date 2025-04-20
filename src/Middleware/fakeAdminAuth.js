const fakeAdminAuth = (req, res, next) => {
  // Fake admin user for testing purposes
  req.user = {
    id: 'anh_admin_fake',
    isAdmin: true,
    user_name: 'anh_admin_fake',
    email: 'fakeadmin@example.com'
  };
  next();
};

module.exports = fakeAdminAuth;
