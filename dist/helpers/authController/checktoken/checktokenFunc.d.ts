import { Types } from "mongoose";
import type mongoose from "mongoose";
interface user {
    _id: Types.ObjectId;
    email: string;
    username?: string;
    profilePicture?: string | null;
}
export declare const resIfUserObj: (user: user) => {
    statusCode: number;
    data: {
        user: {
            _id: string;
            email: string;
            username: string | undefined;
            profilePicture: string | null | undefined;
        };
        authenticated: boolean;
    };
};
export declare const getUser: (id: mongoose.Types.ObjectId) => Promise<(mongoose.Document<unknown, {}, {
    email: string;
    username: string;
    profilePicture: string;
    name?: string | null;
    password?: string | null;
}, {}, mongoose.DefaultSchemaOptions> & {
    email: string;
    username: string;
    profilePicture: string;
    name?: string | null;
    password?: string | null;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}) | null>;
export {};
//# sourceMappingURL=checktokenFunc.d.ts.map