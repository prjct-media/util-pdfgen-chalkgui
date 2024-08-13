## Utility - PDF Dummy Data Generator Basics

---


```
Script Basics
--------------------------------------------
Create PDF files using a basic JSON template.

Initial purpose was to automate the generation of PDF test data
in order to methodically test the functionality of a file uploader.

The package.json is using hard-coded versions for all required packages.
So, if facing any issues, be sure to refer the Author System section below.

|--------------------|
| Author System      |
|--------------------|
| MacOS   | 14.5     |
| node    | v18.17.0 |
| npm     | v9.6.7   |
|--------------------|

|---------------------------------------------------------------------------------|
| Environment Explanation                                                         |
|---------------------------------------------------------------------------------|
| package        | version  | notes                                               |
|----------------|----------|-----------------------------------------------------|
| pdfkit         | v0.15.0  | Powerful PDF creation library.                      |
| path           | v0.12.7  | Writes document to a local directory.               |
| pretty-bytes   | v6.1.1   | Set file size dynamically. Good for Upload Testing. |
| chalk          | v5.3.0   | Gives logs color and styles. Simply for aesthetics. |
|---------------------------------------------------------------------------------|
```


 #### Setup Commands
 
 ---
 
 ```sh
 npm i
 ```
 ```sh
 node index.js
 ```
