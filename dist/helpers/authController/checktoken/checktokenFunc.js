import { Types } from "mongoose";
import { User } from "../../../models/user.model.js";
export const resIfUserObj = (user) => {
    return {
        statusCode: 200,
        data: {
            user: {
                _id: user?._id.toString(),
                email: user?.email,
                username: user?.username,
                profilePicture: user?.profilePicture,
            },
            authenticated: true,
        },
    };
};
export const getUser = async (id) => {
    return await User.findById(id);
};
// export const getUserIfUsername = async (affiname: string) => {
//   return await User.findOne({ affiname });
// };
//# sourceMappingURL=checktokenFunc.js.map