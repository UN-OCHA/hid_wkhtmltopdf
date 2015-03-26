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
  async = require('async'),
  exec = require('child_process').exec;

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

app.use(express.bodyParser({
  limit: '10mb',
  uploadDir: '/tmp'
}));

app.use(express.methodOverride());

app.use(function(err, req, res, next) {
  if (process.env.NODE_ENV !== 'test') {
    log.error('Error: ' + JSON.stringify(err));
  }

  res.status(err.code || 500);
  res.send('Error');
});

app.post('/htmltopdf', function (req, res) {
  var fnHtml = '',
    sizeHtml = 0,
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
            sizeHtml = stats.size || 0;
            fnPdf = fnHtml + '.pdf';
            return cb();
          }
        });
      }
      else if (req.body && req.body.html && req.body.html.length) {
        fnHtml = '/tmp/htmltopdf-' + Date.now() + '.html';
        sizeHtml = req.body.html.length;
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
      var child,
        cmd = 'wkhtmltopdf -O landscape ' + fnHtml + ' ' + fnPdf;

      child = exec(cmd,
        function (error, stdout, stderr) {
          if (error !== null) {
            log.error({"cmd": cmd, "stdout": stdout, "stderr": stderr, "error": error, "inputSize": sizeHtml}, "An error occurred while trying to convert the HTML upload to a PDF.");
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
        var duration = ((Date.now() - startTime)/1000);
        log.info({"duration": duration, "inputSize": sizeHtml}, "PDF " + fnPdf + " successfully generated for HTML " + fnHtml + " in " + duration + " seconds.");
        return cb();
      });
    }
  ], function (err, results) {
    if (err) {
      var duration = ((Date.now() - startTime)/1000);
      log.warn({"duration": duration, "inputSize": sizeHtml}, "PDF generation failed for HTML " + fnHtml + " in " + duration + " seconds.");
      res.send(500, "Error");
    }

    // Remove the input and output files
    async.parallel([
      function (cb) {
        if (fnHtml.length) {
          return fs.unlink(fnHtml, cb);
        }
        return cb();
      },
      function (cb) {
        if (fnPdf.length) {
          return fs.unlink(fnPdf, cb);
        }
        return cb();
      }
    ], function (err, results) {
      if (err) {
        log.error({"err": err}, "An error occurred while trying to remove the input (" + fnHtml + ") and output (" + fnPdf + ") files.");
      }
      else {
        log.info("Successfully removed input (" + fnHtml + ") and output (" + fnPdf + ") files.");
      }
    });
  });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port:', app.get('port'));
});
