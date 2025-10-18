export const resIfEmailSent = {
    statusCode: 200,
    data: {
        message: "OTP sent successfully",
        emailSent: true,
    },
};
export const resIfEmailNotSent = {
    statusCode: 200,
    data: {
        message: "OTP could't sent try after sometime",
        emailSent: false,
    },
};
export const ifMultipleUserFound = {
    statusCode: 200,
    data: {
        message: "OTP Send successfully",
        multipleUser: true,
        emailSent: true,
    },
};
//# sourceMappingURL=resObj.js.map