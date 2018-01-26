// const AdmZip = require('adm-zip');

// // Archive the extension folder into 'chrome-extension.zip'
// const zip = new AdmZip();
// zip.addLocalFolder('chrome-extension');
// zip.writeZip('chrome-extension.zip');

var file_system = require('fs');
var archiver = require('archiver');

var output = file_system.createWriteStream('chrome-extension.zip');
var archive = archiver('zip');

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err){
    throw err;
});

archive.pipe(output);
archive.glob('**/*', { cwd: 'chrome-extension' });
archive.finalize();