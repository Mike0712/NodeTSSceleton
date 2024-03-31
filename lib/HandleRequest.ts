import url from 'url';
import { detectRoute } from './DetectRoute';
import Ajv from 'ajv';
import { EndPoint } from './Controller';
import { IFile } from './interfaces';
import fs from 'fs';
import DIInit, { dependencies } from './DependencyInjection';
import { IncomingMessage, ServerResponse } from 'http';
import start from "../setUp/start";

// Init DI
DIInit(start);

export const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
  
    const method = req.method?.toLowerCase();
    const parsedUrl = url.parse(req.url || '', true);
    const matchedRoute = detectRoute(parsedUrl);
    if (matchedRoute && method) {
      const { route } = matchedRoute;
  
      const methName = method && ['get', 'post', 'put', 'delete'].includes(method) ? method : null;
      if (methName && typeof route.controller.prototype[methName] === 'function') {
        const ctrl = new route.controller(req.headers);
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          let data = {};
          if (body) {
            try {
              data = JSON.parse(body);
            } catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Bad request' }));
              return;
            }
          }
          // Auth
          let clientIp: string = req.socket.remoteAddress || '';
          if (clientIp.substring(0,7) === '::ffff:') {
            clientIp = clientIp.substring(7);
          }
          // Validation
          if (typeof route.schema !== 'undefined' && typeof route.schema[methName] !== 'undefined') {
            const schema = route.schema[methName];
            const ajv = new Ajv()
            const validate = ajv.compile(schema);
            if (!validate(data)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: validate.errors }));
              return;
            }
          }
          const queryParams = parsedUrl.query;
  
          (ctrl[methName as keyof typeof ctrl] as EndPoint)({ body: data, query: queryParams, params: matchedRoute.params }, dependencies)
            .then(({ statusCode, body, isFile }) => {
              if (isFile) {
                const file = body as IFile;
                res.writeHead(statusCode, {
                  'Content-Type': file.type,
                  'Content-Length': file.size,
                  'Content-Disposition': `attachment; filename=${file.fileName}"`
                });
                const readStream = fs.createReadStream(file.filePath);
                readStream.pipe(res);
              } else {
                res.writeHead(statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(body));
              }
            })
            .catch(error => {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              console.log(error.message);
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            });
        });
      } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  };