import mongoose from "mongoose";
export declare const User: mongoose.Model<{
    username: string;
    email: string;
    profilePicture: string;
    name?: string | null;
    password?: string | null;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    username: string;
    email: string;
    profilePicture: string;
    name?: string | null;
    password?: string | null;
}, {}, mongoose.DefaultSchemaOptions> & {
    username: string;
    email: string;
    profilePicture: string;
    name?: string | null;
    password?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    username: string;
    email: string;
    profilePicture: string;
    name?: string | null;
    password?: string | null;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    username: string;
    email: string;
    profilePicture: string;
    name?: string | null;
    password?: string | null;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    username: string;
    email: string;
    profilePicture: string;
    name?: string | null;
    password?: string | null;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=user.model.d.ts.map