const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const fs = require('fs');



class CalendarGenerator {
    constructor() {
        this.template_calendar;
    }

    // private function


    getCalendar(date) {
        this.template_calendar = this.template_calendar || load_file(__dirname + '/calendar_template.html') || "Error loading template";

        var year = date[1];
        var month = date[2];
        var day = date[3];

        var template = this.template_calendar.split("<!-- insert year here -->");
        var output = template[0] + year + template[1];
        return output;
    }


}

var calendar_generator = new CalendarGenerator();


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/calendar/*/*/*', (req, res) => {
    // res.sendFile(__dirname + '/test.html');
    
    // console.log(req.url);
    // console.log(req.path);
    // console.log(req.params);
    // //console.log(res);

    // calendar_generator.getCalendar(req.params);

    res.send(calendar_generator.getCalendar(req.params));
  });

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

function load_file1(path) {
    var data;
    try {
        data = fs.readFileSync(__dirname + '/calendar_template.html', 'utf8');
        console.log(data);
      } catch (err) {
        console.error(err);
      }
      console.log(data);
      return data;
}

async function load_file() {
    try {
      const data = await fs.readFile(__dirname + '/calendar_template.html', shit());
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

function shit(){console.log("avsa")}

