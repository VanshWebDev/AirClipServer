export const ifUserWithEmailExist = {
    status: 400,
    message:"User with this email exist",
    forFrontend: true
}
export const ifBothPwdNotEqual = {
    status: 400,
    message:"Password doesn't match",
    forFrontend: true
}
export const ifUserExist = {
    status: 400,
    message:"Affiname already exist",
    forFrontend: true
}

export const wrongEmailProvided = {
    status: 400,
    message:"Wrong email provided",
    forFrontend: true
}