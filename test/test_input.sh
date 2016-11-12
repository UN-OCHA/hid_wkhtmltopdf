#!/bin/bash

curl -v -XPOST -F html='\<html\>\<body\>\<h1\>Hello, world!\</h1\>\<h2\>Aliquam tincidunt mauris eu risus\</h2\>\<p\>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.\</p\>' -o test_input.pdf "http://pdf.contactsid.vm:3000/htmltopdf"
