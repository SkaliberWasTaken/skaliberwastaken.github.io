function download() {
    //this function unloads the zip file into the data parameter
    JSZipUtils.getBinaryContent('data/caelesti.zip', function (err, data) {
        if (err) {
            throw err;
        }
        var zip = new JSZip();
        zip.loadAsync(data); //this loads it into an editable version

        //and this sends a zipped version to the user
        zip.generateAsync({ type: "blob" })
            .then(function (blob) {
                saveAs(blob, "caelesti.zip");
            });
    });
}
//this doesn't do anything, it's just there for testing purposes
jQuery(function () {
    $("#demo").html(JSZip.support.blob);
});
