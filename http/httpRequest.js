const { Readable } = require('stream');

module.exports = class HttpRequest extends Readable {
  constructor(socket) {
    super();

    this.socket = socket;
    this.headers = {};
    this.url = null;
    this.versionHttp = null;
    this.host = null;
    this.init();
    this.state = 'headers';
    this.query = {};
    this.body = null;
  }

  init() {
    this.socket.on('data', this.onData);
  }

  onData = (data) => {
    console.log('onData');
    if (this.state === 'headers') {
      let headsData = Buffer.alloc(0);
      headsData = Buffer.concat([headsData, data]);
      const string = headsData.toString('utf-8');
      if (this.state === 'headers' && string.includes('\r\n\r\n')) {
        const [header, body] = string.split('\r\n\r\n');
        header.split('\r\n').forEach((item, i) => {
          const head = item.split(': ');
          if (i === 0) {
            const [method, url, versionHttp] = item.split(' ');
            this.method = method;
            if (url.includes('?')) {
              const [clearUrl, query] = url.split('?');
              this.url = clearUrl;
              this.query = query.split('&').reduce((acc, item) => {
                const [key, value] = item.split('=');
                acc[key] = value;
                return acc;
              }, {});
            } else {
              this.url = url;
            }

            this.versionHttp = versionHttp;
          } else if (head[0] === 'Host') {
            const [, port] = head[1].split(':');
            this.port = port;
            this.headers[head[0]] = head[1];
          } else {
            this.headers[head[0]] = head[1];
          }
        });
        const buf = Buffer.from(body, 'utf8');
        this.socket.pause();
        this.socket.unshift(buf);
        this.state = 'body';
        this.emit('headers');
      }
    } else if (this.state === 'body') {
      console.log('body');
      //this.pause();
      this.push(data);
      //this.resume();
    }
  };

  _read() {
    console.log('read');
    this.socket.resume();
  }
};
