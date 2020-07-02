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
exports.createIdentity = void 0;
const models_1 = require("@packages/models");
const apitools_1 = require("@packages/apitools");
if (!((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.ENV)) {
    throw new Error('ENV variable not set');
}
const STAGE = process.env.ENV;
const identityDb = new models_1.IdentityModel(STAGE);
exports.createIdentity = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield apitools_1.processRequest(() => __awaiter(void 0, void 0, void 0, function* () {
        const request = JSON.parse(event.body);
        const identity = yield identityDb.createIdentity(request);
        delete identity.createdAt;
        return identity;
    }), {
        successCode: 201,
    });
    return result;
});
exports.default = exports.createIdentity;
