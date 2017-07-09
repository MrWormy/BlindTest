/**
 * Created by Thomas on 03/05/2017.
 */

fs = require('fs');

var films = fs.readFileSync(__dirname + '/BlindTest.txt', 'utf8');

films = films.trim().split('\n');

films.forEach(function (el, i, arr) {
    var s = el.split(',');
    s[1]= s[1].match(/v=[^&]+/i)[0].substr(2);
    if (s.length === 2) {
        s.push(35);
    } else {
        s[2] = parseInt(s[2]);
    }
    arr[i] = s;
});

var TestArray = "var videos = ";

TestArray += JSON.stringify(films).replace(/],\[/g,'],\n\t[');

TestArray += ";";

fs.writeFile(__dirname + '/config.js', TestArray, 'utf8');