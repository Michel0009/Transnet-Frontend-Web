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
    get: (page = 1) => `/getDrivers?page=${page}`,
    details: (id) => `/driverDetails/${id}`,
    search: "/searchForDriver",
    create: "/createDriver",
    update: (id) => `/editDriver/${id}`,
    getGovernorates: "/governorates",
    donwnloadDocumnet: (type, id) => `/downloadDocument/${type}/${id}`,
    driverImage: (id) => `/driverImage/${id}`,
    driverShipments: (id, page) => `/shipments/driver/${id}?page=${page}`,
    activate: (id) => `/activateUser/${id}`,
    tax: "/tax/driver",
    blocked: (page = 1) => `/blockedDrivers?page=${page}`,
    getLocation: "/drivers/locations",
  },
  vehicleTypes: {
    get: "/vehicleTypes",
  },
  coefficients: {
    get: "/coefficients",
  },
  general: {
    block: "/blockUser",
    unblock: (id) => `/unblockUser/${id}`,
  },
  reports: {
    sendWarning: "/sendWarning",
    sendNotificationAll: "/sendNotificationForAll",
    getWarnings: (id) => `/warnings/user/${id}`,
  },
  clients: {
    get: (page = 1) => `/users?page=${page}`,
    search: "/searchForUser",
    details: (id) => `/userDetails/${id}`,
    blocked: (page = 1) => `/blockedUsers?page=${page}`,
  },
  employees: {
    blocked: (page = 1) => `/blockedSubAdmins?page=${page}`,
  },
  shipments: {
    get: (page = 1) => `/shipments?page=${page}`,
    insured: (page = 1) => `/shipments/insured?page=${page}`,
    search: (number) => `/shipment/number/${number}`,
    details: (id) => `/shipment/id/${id}`,
  },
  admin: {
    vehicleTypes: "/vehicleTypes",
    createVehicleType: "/vehicleType/create",
    updateVehicleType: "/vehicleType/update",

    gitCoefficients: "/coefficients",
    createCoefficient: "/coefficient/create",
    updateCoefficient: "/coefficient/update",

    subAdmins: "/subAdmins",
    createSubAdmin: "/subAdmin/create",
    updateSubAdmin: "/subAdmin/update",
    block: "/blockUser",
    unBlock: (id) => `/unblockUser/${id}`,
  },
};
