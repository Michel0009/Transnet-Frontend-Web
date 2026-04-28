export const endpoints = {
  auth: {
    login: "/login",
    logout: "/logout",
    refresh: "/refreshToken",
    verify: "/emailVerification",
    verifyResetPassword: "/newPasswordVerification",
    sendEmail: "/sendEmail",
    resetPassword: "/reSetPassword",
  },
  drivers: {
    get: "/getDrivers",
    details: "/driverDetails",
    search: "/searchForDriver",
  },
};
