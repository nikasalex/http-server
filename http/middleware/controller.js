const fs = require('fs');

class Controller {
  json(req, res) {
    if (req.headers['Content-Type'] === 'application/json') {
      const body = req.body.toString('utf-8');
      console.log(body);
      res.end();
    } else {
      res.send('Error, it`s not JSON');
    }
  }

  upload(req, res) {
    req.on('data', (chunk) => {
      const string = chunk.toString();
      console.log(string);
    });

    // req.on('readable', () => {
    //   console.log(' I am here');
    //   let data = req.socket.read();
    //   console.log(data);
    // });
    //     fs.open('test.jpg', 'w', (err) => {
    //       console.log('err', err);
    //     });
    //     const streamReadable = fs.createReadStream(req.body);
    //     const streamWriteble = fs.createWriteStream('test.jpg');
    //     streamReadable.pipe(streamWriteble);
    //     res.end();
  }
}
module.exports = new Controller();
