import { Controller, Request } from "lib/Controller";


export class HelloWorld extends Controller {
    async get(request: Request<object>) {

        return { statusCode: 200, body: { message: "Hello world" } };
    }
}