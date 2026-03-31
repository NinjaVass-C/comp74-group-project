import { LoginEndpoint } from "../endpoints/auth/LoginEndpoint";
import { RegisterEndpoint } from "../endpoints/auth/RegisterEndpoint";
import { VerifyTokenEndpoint } from "../endpoints/auth/VerifyTokenEndpoint";
import { IndexEndpoint } from "../endpoints/IndexEndpoint";
import { QuerySymbolEndpoint } from "../endpoints/symbol/QuerySymbolEndpoint";
import { QuerySymbolValueEndpoint } from "../endpoints/symbol/QuerySymbolValueEndpoint";

export const ENDPOINTS = [
    new IndexEndpoint(),
    new RegisterEndpoint(),
    new LoginEndpoint(),
    new VerifyTokenEndpoint(),
    new QuerySymbolEndpoint(),
    new QuerySymbolValueEndpoint()
]