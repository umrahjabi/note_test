const express = require('express');
var path = require ("path");
var glob = require ("glob");
const app = express();
var routesuser = require('./src/Route/user')
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './src/Upload')));
app.get('/', (req, res) => {
  res.send('Hello World!')
});

require('./src/Route/user')(app);


app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
});