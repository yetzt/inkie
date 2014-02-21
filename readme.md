# Inkie

Inkie is a little tool to determine a comparable number of ink used on scanned pdf forms with handwriting on them, because thats how Members of the European parliament submitted their declarations of interest. Inkie was written during the [Europarl Hackathon for the European Elections 2014](http://europarl.me/). 

## Requirements

* [ImageMagick](http://imagemagick.org)
* [Node.js](http://nodejs.org)

## Usage

Install required node modules with

````
npm install
````

Put the PDF documents to `data/pdf` and convert them to deskewed PNG images with 

````
./convert.sh
````

After that run

````
node inkie.js
````

to calculate the inkness factors. These will be written to `data/inkness.json`.

To further sort documents and pages by inkness, you may run

````
node compare.js
````

which writes its findings to `data/doc-inkness.json` and `data/page-inkness.json`

## License

Inkie is [Public Domain](http://unlicense.org/UNLICENSE)
