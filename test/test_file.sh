#!/bin/bash

curl -v -XPOST -F html=@test_file.html -o test_file.pdf "http://pdf.contactsid.vm:3000/htmltopdf"
