const { Writable } = require('stream');
const fs = require('fs');
const createError = require('http-errors');
const mime = require('mime-types');

module.exports = class HttpResponse extends Writable {
  constructor(socket) {
    super();
    this.socket = socket;
    this.headersSent = false;
    this.header = {};
    this.statusCode = 200;
    this.message = 'OK';
  }

  setHeader(name, value) {
    this.header[name] = value;
  }

  sendHeaders() {
    let headers = `HTTP/1.1 ${this.statusCode} ${this.message}\r\n`;
    let headersCustom = Object.entries(this.header).reduce(
      (acc, [key, value]) => {
        acc += `${key}: ${value}\r\n`;
        return acc;
      },
      ''
    );

    this.socket.write(headers + headersCustom + '\r\n');
    this.headersSent = true;
  }

  end() {
    this.socket.end();
  }
  status(code) {
    if (code !== 200) {
      this.statusCode = code;
      this.message = 'Error';
      return this;
    }
  }

  json(obj) {
    this.header = {};
    this.setHeader('Content-Type', 'application/json');
    this.sendHeaders();
    this.socket.write(JSON.stringify(obj));
    this.end();
  }

  send(data) {
    this.header = {};
    this.setHeader('Content-Type', 'text/html');
    this.sendHeaders();
    this.socket.write(JSON.stringify(data));
    this.end();
  }

  render(url) {
    fs.readFile(`./static/${url}`, 'utf-8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          let httpError = createError(404, 'Not Found this file');
          console.log(httpError);
        } else {
          let httpError = createError(500, 'Server Error');
          console.log(httpError);
        }
      } else {
        const contentType = mime.lookup(`./static/${url}`);
        this.setHeader('Content-Type', contentType);
        const stream = fs.createReadStream(`./static/${url}`);
        fs.stat(`./static/${url}`, (_err, stat) => {
          this.setHeader('Content-Length', `${stat.size}`);
          stream.pipe(this);
        });
      }
    });
  }

  _write(chunk, _charset, callback) {
    if (!this.headersSent) {
      this.sendHeaders();
    }
    this.socket.write(chunk);
    callback();
  }
};
