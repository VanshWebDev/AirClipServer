import {} from "express";
export const routeWrapper = (fn) => {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=routeWrapper.js.map