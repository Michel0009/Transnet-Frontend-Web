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
  admin: {
    vehicleTypes: "/vehicleTypes",
    createVehicleType: "/vehicleType/create",
    updateVehicleType: "/vehicleType/update",

    gitCoefficients: "/coefficients",
    createCoefficient: "/coefficient/create",
    updateCoefficient: "/coefficient/update",
  },
};
