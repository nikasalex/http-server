const http = require('./http/http');
const controller = require('./http/middleware/controller');

const server = new http();

server.get('/image.jpg', (_req, res) => {
  res.render('image.jpg');
  console.log('/image.jpg');
});

// server.get('/foo', (_req, res) => {
//   res.send({ message: 'Tratata' });
// });

server.get('/foo.html', (_req, res) => {
  res.render('foo.html');
  console.log('Foo.html');
});

server.post('/json', controller.json);

server.post('/upload', controller.upload);

server.listen(3000);
