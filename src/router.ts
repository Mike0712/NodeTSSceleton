import { IControllerConstructor } from '../lib/Controller';
import { HelloWorld } from './controller/HelloWorld';


export interface IRoute {
    path: string;
    controller: IControllerConstructor;
    schema?: any;
}

export const routes: IRoute[] = [
  {
    path: '/hello-world',
    controller: HelloWorld 
  }
];