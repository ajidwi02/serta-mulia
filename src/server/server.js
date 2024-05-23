require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');
(async () => {
   const model = await loadModel();
   server.app.model = model;
   const server = Hapi.server({
      port: 3000,
      host: '0.0.0.0',
      routes: {
            cors: {
            origin: ['*'],
            },
      },
   });

   server.route(routes);

   server.ext('onPostResponse', function (request, h) {
      const response = request.response;

      if(response instanceof InputError) {
         const newResponse = h.response({
            status: 'fail',
            message: `${response.message} Silahkan gunakan foto lain.`
         })
         newResponse.code(response.statusCode);
         return newResponse;
      }

      if(response.isBoom) {
         const newResponse = h.response({
            status: 'fail',
            message: response.message
         })
         newResponse.code(response.statusCode);
         return newResponse;
      }
      return h.continue;
   });

   await server.start();
   console.log(`Server start at: ${server.info.uri}`);
})();