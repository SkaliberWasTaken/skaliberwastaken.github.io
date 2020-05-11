var zip = new JSZip();
zip.file("Hello.txt", "Hello World\n");
zip.generateAsync({ type: "blob" })
    .then(function (content) {
        // see FileSaver.js
        saveAs(content, "example.zip");
    });
jQuery(function () {
    $("#demo").html(JSZip.support.blob);
});