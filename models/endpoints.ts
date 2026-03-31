import { LoginEndpoint } from "../endpoints/auth/LoginEndpoint";
import { RegisterEndpoint } from "../endpoints/auth/RegisterEndpoint";
import { VerifyTokenEndpoint } from "../endpoints/auth/VerifyTokenEndpoint";
import { IndexEndpoint } from "../endpoints/IndexEndpoint";

export const ENDPOINTS = [
    new IndexEndpoint(),
    new RegisterEndpoint(),
    new LoginEndpoint(),
    new VerifyTokenEndpoint()
]