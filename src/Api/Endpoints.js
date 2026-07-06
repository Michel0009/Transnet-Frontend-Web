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
  },
  vehicleTypes: {
    get: "/vehicleTypes",
    create: "/vehicleType/create",
    update: "/vehicleType/update",
  },
  coefficients: {
    get: "/coefficients",
    create: "/coefficient/create",
    update: "/coefficient/update",
  },
  general: {
    block: "/blockUser",
    unblock: (id) => `/unblockUser/${id}`,
  },
  reports: {
    get: "/reports",
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
    get: "/subAdmins",
    create: "/subAdmin/create",
    update: "/subAdmin/update",
  },
  shipments: {
    get: (page = 1) => `/shipments?page=${page}`,
    insured: (page = 1) => `/shipments/insured?page=${page}`,
    search: (number) => `/shipment/number/${number}`,
    details: (id) => `/shipment/id/${id}`,
  },
    terms: {
    get: "/contractTerms",
    create: "/contractTerm/create",
    update: (id) => `/contractTermOrder/${id}`,
    delete:(id) => `/contractTerm/${id}`
  },
  contracts: {
    create: "/createDriverContract",
  },
  statistics:{
    getStatistics: "/statistics",
    getGeneralStatistics: "/generalStatistics",
    exportStatisticsPDF: "/exportStatisticsPdf",

  },
    badges:{
    get: "/badges",
    update: (id) => `/badge/${id}`,
  },
};
