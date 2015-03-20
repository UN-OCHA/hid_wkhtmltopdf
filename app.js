/**
 * hid_wkhtmltopdf
 * Node.js web service interface to wkhtmltopdf for generating PDFs from HTML.
 *
 * Accepts POST requests to the /htmltopdf with either a HTTP file upload sent
 * with the name "html" or body form data with HTML content in a field named
 * "HTML".
 *
 * The service will run wkhtmltopdf and return the generated PDF data.
 *
 * This service is not meant to be exposed to the public, and use of this
 * service should be mediated by another application with access controls.
 *
 */

var config = require('./config'),
  log = require('./log'),
  fs = require('fs'),
  async = require('async');

// Set http and https default maxSockets to Infinity to avoid artificial
// constraints in Node < 0.12.
var http = require('http');
http.globalAgent.maxSockets = Infinity;
var https = require('https');
https.globalAgent.maxSockets = Infinity;

// Set up the application
var express = require('express'),
  app = express();

app.set('env', process.env.NODE_ENV || 'dockerdev');
app.set('port', process.env.PORT || 80);

app.use(express.bodyParser({uploadDir: '/tmp'}));

app.use(express.methodOverride());

app.use(function(err, req, res, next) {
  if (process.env.NODE_ENV !== 'test') {
    log.error('Error: ' + JSON.stringify(err));
  }

  if (middleware.isValidationError(err)) {
    res.status(400);
    res.send(err.errors);
  }
  else {
    res.status(err.code || 500);
    res.send('Error');
  }
});

app.post('/htmltopdf', function (req, res) {
  var fnHtml = '',
    fnPdf = '',
    startTime = Date.now();

  async.series([
    function (cb) {
      // Validate uploaded HTML file
      if (req.files && req.files.html && req.files.html.path) {
        fs.stat(req.files.html.path, function (err, stats) {
          if (err || !stats || !stats.isFile()) {
            log.error({"files": req.files, "stats": stats}, "An error occurred while trying to validate the HTML upload.");
            return cb(new Error("An error occurred while trying to validate the HTML upload."));
          }
          else {
            fnHtml = req.files.html.path;
            fnPdf = fnHtml + '.pdf';
            return cb();
          }
        });
      }
      else if (req.body && req.body.html && req.body.html.length) {
        fnHtml = '/tmp/htmltopdf-' + Date.now() + '.html';
        fs.writeFile(fnHtml, req.body.html, function (err) {
          if (err) {
            log.error({"body": req.body}, "An error occurred while trying to validate the HTML post data.");
            return cb(new Error("An error occurred while trying to validate the HTML post data."));
          }
          else {
            fnPdf = fnHtml + '.pdf';
            return cb();
          }
        });
      }
      else {
        log.error("An HTML file was not uploaded or could not be accessed.");
        return cb(new Error("An HTML file was not uploaded or could not be accessed."));
      }
    },
    function (cb) {
      // Process HTML file with wkhtmltopdf
      var exec = require('child_process').exec,
        child,
        cmd = 'wkhtmltopdf -O landscape ' + fnHtml + ' ' + fnPdf;

      console.log('running ' + cmd);
      log.info({"msg": "Running wkhtmltopdf", "cmd": cmd});
      child = exec(cmd,
        function (error, stdout, stderr) {
          if (error !== null) {
            log.error({"cmd": cmd, "stdout": stdout, "stderr": stderr, "error": error}, "An error occurred while trying to convert the HTML upload to a PDF.");
            return cb(new Error("An error occurred while trying to convert the HTML upload to a PDF."));
          }
          return cb();
        });
    },
    function (cb) {
      // Return generated PDF file
      res.charset = 'utf-8';
      res.contentType('application/pdf');
      res.sendfile(fnPdf, function () {
        res.end();
        log.info("PDF " + fnPdf + " successfully generated for HTML " + fnHtml + " in " + ((Date.now() - startTime)/1000) + " seconds.");
        return cb();
      });
    }
  ], function (err, results) {
    if (err) {
      log.warn("PDF generation failed for HTML " + fnHtml + " in " + (Date.now() - startTime)/1000 + " seconds.");
      res.send(500, "Error");
    }
  });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port:', app.get('port'));
});
