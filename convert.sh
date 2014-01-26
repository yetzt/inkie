#!/bin/sh
for i in `ls data/pdf | grep pdf`; do 
	echo $i;
	convert -density 150 -deskew 40 -depth 8 data/pdf/$i PNG8:data/png/$i.png; 
done;