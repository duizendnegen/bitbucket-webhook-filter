const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.use(bodyParser.json());

const ALLOWED_BRANCHES = process.env.ALLOWED_BRANCHES.split(',');
const WEBHOOK_TARGET_URL = process.env.WEBHOOK_TARGET_URL;

app.post('/', (req, res) => {
  let body = req.body;
  let branch = null;
  if(body && body.commit_status && body.commit_status.refname) {
    branch = body.commit_status.refname;
  }

  if(ALLOWED_BRANCHES.includes(branch)) {
    let payload = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'X-Request-UUID': req.header('X-Request-UUID'),
        'X-Event-Key': req.header('X-Event-Key'),
        'X-Hook-UUID': req.header('X-Hook-UUID')
      },
      url: WEBHOOK_TARGET_URL,
      json: req.body
    };
    request(payload, function(error, response, body) {
      if(error) {
        res.status(500).send(error);
      } else {
        res.send(body);
      }
    });
  } else {
    res.send("nope");
  }
});

app.listen(3000, () => console.log('Bitbucket Webhook Filter listening on port 3000!'));
