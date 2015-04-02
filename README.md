# wkhtmltopdf service for Humanitarian ID

Uses wkhtmltopdf to generate PDF documents from HTML source material.

## Testing

Example command to send `list.html` to the service running locally and writing output to `list.pdf`:
```
curl -v -X POST -F "html=@list.html" http://pdf.contactsid.vm:5100/htmltopdf -o list.pdf
```

Example command to post URL-encoded HTML data to the service running locally and writing output to `test.pdf`:

```
curl -v -X POST --data "html=%3Chtml%3E%3Cbody%3E%3Ch1%3Ehello%2C%20world.%3C%2Fh1%3E%3C%2Fbody%3E%3C%2Fhtml%3E" http://pdf.contactsid.vm/htmltopdf -o test.pdf
```

