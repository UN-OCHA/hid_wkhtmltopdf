# wkhtmltopdf service for Humanitarian ID

Uses wkhtmltopdf to generate PDF documents from HTML source material.

## Testing

Example command to send `list.html` to the service running locally and outputting to `list.pdf`:
```
curl -v -X POST -F "html=@list.html" http://pdf.contactsid.vm:5100/htmltopdf -o list.pdf
```
