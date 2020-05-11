function download() {
    JSZipUtils.getBinaryContent('data/caelesti.zip', function (err, data) {
        if (err) {
            throw err;
        }
        var zip = new JSZip();
        zip.loadAsync(data);

        zip.generateAsync({ type: "blob" })
            .then(function (blob) {
                saveAs(blob, "caelesti.zip");
            });
    });
}
jQuery(function () {
    $("#demo").html(JSZip.support.blob);
});
