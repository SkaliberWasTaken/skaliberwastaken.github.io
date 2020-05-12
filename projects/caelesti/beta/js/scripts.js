
function download() {
    //this part has been pretty much taken from the library's examples, with a couple edits.
    //this makes a promise (google it if you don't know, too complicated to explain here)
    var promise = new JSZip.external.Promise(function (resolve, reject) {
        //gets the content of the adress
        JSZipUtils.getBinaryContent("https://www.skaliber.net/projects/caelesti/beta/data/caelesti.zip", function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
    //uses the promise to load the data. There is currently no error message if the load fails
    promise.then(JSZip.loadAsync)
        .then(function (zip) {
            $("#download").append("<p>please wait, your download will take some time, as caelesti is very large</p>")
            zip.generateAsync({ type: "blob" }).then(function (blob) { // generate the zip file
                saveAs(blob, "caelesti-edit.zip"); // trigger the download
            }, function (err) {
                $("#blob").text(err);
            });
        });

}

