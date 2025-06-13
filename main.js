//import
var http = require('http');
var fs = require('fs');
var urls = require('url');
var parse = require('node-html-parser').parse;
var qs = require('querystring');
/*
try
await
sync
request.connection.destroy();
module.exports={
v:1,
ve:8
};
var m=require("./filename");
node.js awesome
pm2 kill
pm2 start --watch --ignore-watch="data/* sessions/*" --no-daemon
//pm2 start main.js --watch --no-daemon
//pm2 log
//pm2 stop main
//pm2 list
//pm2 monit
//pm2 attach 0
*/
var colorArray = {
    "default": 0,
    "black": 30,
    "red": 31,
    "green": 32,
    "yellow": 1,
    "blue": 34,
    "cl": 36,
    "white": 37,
}

function getRGB(rgb) {
    return `38;2;${rgb.join(';')}`;
}

function customLog(message, color = 0) {
    if (typeof color == 'object') color = getRGB(color);
    else color = colorArray[color] ? colorArray[color] : color;
    console.log(`\u001b[${color}m${message}\u001b[0m`);
}


//cls
Object.defineProperty(global, 'cls', {
    get: function () {
        process.stdout.write('\033c');
    },
    set: function (value) {
        return 1;
    }
});
Object.defineProperty(global, 'exit', {
    get: function () {
        process.exit(1);
    },
    set: function (value) {
        return 1;
    }
});

//readConsole
var stdin = process.openStdin();
stdin.addListener("data", function (msg) {
    try {
        customLog("> " + eval(msg.toString()), "white");
    } catch (e) {
        customLog("> [error]\n" + e.toString(), [256, 0, 0]);
    }
});

//create server
var app = http.createServer(function (request, response) {
    //query
    var urlParam = urls.parse(request.url, true);
    //getip
    var req = request;
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    //url 처리
    var url = urlParam.pathname;
    customLog("Loaded-url:" + url, [0, 256, 0]);
    if (url == '/') {
        url = '/index.html';
    } else if (url == '/index.html') {
        url = '/';
    }
    //html
    var html = "";
    var dirlist = ["/index.html", "/style.css"];
    //fs.readdirSync(__dirname);
    if (dirlist.some(a => a == url)) {
        html = fs.readFileSync('.' + url);
        response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    } else {
        //404 처리
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
        return;
    }
    //index
    if (url == "/index.html") {
        html = parse(String(html));
        if (request.method == 'POST') {
            queryData = "";
            request.on('data', function (data) {
                queryData += data;
                if (queryData.length > 1e6) {
                    queryData = "";
                    response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                    request.connection.destroy();
                }
            });

            request.on('end', function () {
                queryData = qs.parse(queryData);
                var k = String(fs.readFileSync('./quiz.txt')).split("\n")
                    .filter(a => a.includes(queryData.what)).map(x => {
                        x = x.replace(/\[/g, `<font color="#ffff99">`);
                        x = x.replace(/\]/g, `</font>`);
                        const match = x.match(/\('(.*)', '(.*)'\)/);
                        return `<li>${match[1]} = ${match[2]}</li>`;
                    });
                html.querySelector("#results-list").childNodes = k;
                //console.log(html.toString());
                response.end(html.toString());
            });
            return;
        }
    }
    //write
    response.end(html.toString());

});

//server start
app.listen(3010, "localhost", function () {
    customLog('Server is running...', 'cl');
});
