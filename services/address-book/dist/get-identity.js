"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdentityByAddress = exports.getIdentityByUsername = void 0;
const models_1 = require("@packages/models");
const apitools_1 = require("@packages/apitools");
if (!((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.ENV)) {
    throw new Error('ENV variable not set');
}
const STAGE = process.env.ENV;
const identityDb = new models_1.IdentityModel(STAGE);
exports.getIdentityByUsername = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield apitools_1.processRequest(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('got event', event);
        const { username } = event.pathParameters;
        const identity = yield identityDb.getIdentityByUsername(username);
        return identity;
    }));
    return result;
});
exports.getIdentityByAddress = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield apitools_1.processRequest(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('got event', event);
        const { address } = event.pathParameters;
        const identity = yield identityDb.getIdentityByAddress(address);
        return identity;
    }));
    return result;
});
