#!/bin/bash

curl -v -XPOST -o test_url.pdf "http://pdf.contactsid.vm:3000/htmltopdf?url=http://www.example.com/"
