# wkhtmltopdf service for Humanitarian ID

Uses wkhtmltopdf to generate PDF documents from HTML source material.

## Testing

See the test scripts and assets in the `test/` directory, or use the following
example commands:

Example command to send `list.html` to the service running locally and writing output to `list.pdf`:
```
curl -v -X POST -F "html=@list.html" http://pdf.contactsid.vm:3000/htmltopdf -o list.pdf
```

Example command to post URL-encoded HTML data to the service running locally and writing output to `test.pdf`:

```
curl -v -X POST --data "html=%3Chtml%3E%3Cbody%3E%3Ch1%3Ehello%2C%20world.%3C%2Fh1%3E%3C%2Fbody%3E%3C%2Fhtml%3E" http://pdf.contactsid.vm:3000/htmltopdf -o test.pdf
```

Example command used to convert Humanitarianresponse calendars to PDF and writing output to `calendar.pdf`:

```
curl -v --globoff -X POST "http://pdf.contactsid.vm:3000/htmltopdf?url=http://www.humanitarianresponse.info/operations/iraq/events/print&params[print-media-type]=true&params[footer-left]=Page+%5Bpage%5D+of+%5Btopage%5D&params[footer-right]=Powered+by+HUMANITARIAN+RESPONSE.+Date+of+creation%3A+%5Bdate%5D&params[footer-font-name]=Exo+2&params[footer-font-size]=8" -o calendar.pdf
`̀ `
