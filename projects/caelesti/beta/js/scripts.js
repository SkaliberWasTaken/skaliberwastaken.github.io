
function download() {
    var dark_mode_ui = true;
    var custom_font = true;
    var better_leaves = true;
    var hardcore_darkness = true;
    //this part has been pretty much taken from the library's examples, with a couple edits.
    //this makes a promise (google it if you don't know, too complicated to explain here)
    $("#info").html("unzipping...");
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
            dark_mode_ui = $("#dark-ui").is(':checked');
            custom_font = $("#font").is(':checked');
            better_leaves = $("#leaves").is(':checked');
            hardcore_darkness = $("#darkness").is(':checked');
            if (dark_mode_ui) {
                zip.remove("assets/minecraft/lang");
                //TODO, do the rest
            }
            if (custom_font) {
                zip.remove("assets/minecraft/textures/font");
            }
            $("#info").html("rezipping... This can take a while, as there is a lot of content to zip up");
            zip.generateAsync({ type: "blob" }).then(function (blob) { // generate the zip file
                $("#info").html("Done!")
                saveAs(blob, "caelesti-edit.zip"); // trigger the download
            }, function (err) {
                $("#blob").text(err);
            });
        });

}

