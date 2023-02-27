const EventEmitter = require('events');
const net = require('net');
const Request = require('./httpRequest');
const Response = require('./httpResponse');
class MyHttp extends EventEmitter {
  constructor() {
    super(net);
    this.server = net.createServer();
    this.setEvents();
    this.routes = [];
  }

  setEvents() {
    this.server.on('connection', (socket) => {
      const req = new Request(socket);
      const res = new Response(socket);
      const next = this.next;
      req.on('headers', () => {
        this.emit('request', req, res);
        this.processRequest(req, res, next);
      });
    });
  }

  next() {
    return true;
  }

  get(path, route) {
    this.routes.push({
      method: 'GET',
      path,
      route,
    });
  }

  post(path, route) {
    this.routes.push({
      method: 'POST',
      path,
      route,
    });
  }

  async processRequest(req, res, next) {
    for (const route of this.routes) {
      if (req.method === route.method) {
        if (req.url === route.path) {
          const check = await route.route(req, res, next);
          if (check !== true) {
            break;
          }
        }
      }
    }
  }

  listen(PORT) {
    this.server.listen(PORT, () => {
      console.log(`Server has been started on ${PORT}... `);
    });
  }
}

module.exports = MyHttp;
