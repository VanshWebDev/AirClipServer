import mongoose from "mongoose";
export declare const PwdVerify: mongoose.Model<{
    email: string;
    expiresAt: NativeDate;
    sub?: string | null;
    name?: string | null;
    picture?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    email: string;
    expiresAt: NativeDate;
    sub?: string | null;
    name?: string | null;
    picture?: string | null;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    email: string;
    expiresAt: NativeDate;
    sub?: string | null;
    name?: string | null;
    picture?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    email: string;
    expiresAt: NativeDate;
    sub?: string | null;
    name?: string | null;
    picture?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    email: string;
    expiresAt: NativeDate;
    sub?: string | null;
    name?: string | null;
    picture?: string | null;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    email: string;
    expiresAt: NativeDate;
    sub?: string | null;
    name?: string | null;
    picture?: string | null;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=pwdVerify.model.d.ts.map