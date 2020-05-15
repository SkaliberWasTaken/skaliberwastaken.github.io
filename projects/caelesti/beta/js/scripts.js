/*Here I store constants containing each leaf model, with the text SPECIAL_LEAVES and NORMAL_LEAVES
 which are replaced by weights*/
//TODO make this use a readfile instead
//DOING by sekoia

function download() {
    var dark_mode_ui = true;
    var custom_font = true;
    var better_leaves = true;
    var hardcore_darkness = true;
    //this part has been pretty much taken from the library's examples, with a couple edits.
    //this makes a promise (google it if you don't know, too complicated to explain here)
    $("#info > label").html("unzipping...");
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

            hardcore_darkness = $("#darkness").is(':checked');

            if (dark_mode_ui) {
                zip.remove("assets/minecraft/lang");
                //TODO, do the rest
            }

            if (custom_font) {
                zip.remove("assets/minecraft/textures/font");
            }

            var acacia = "ERROR";
            var birch = "ERROR";
            var dark_oak = "ERROR";
            var jungle = "ERROR";
            var oak = "ERROR";
            var spruce = "ERROR";
            var weight = 50;

            zip.file("assets/minecraft/blockstates/acacia_leaves.json").async("string").then(
                function success(content) {
                    acacia = content;
                    acacia = acacia.replace("NORMAL_LEAVES", 100 - weight);
                    acacia = acacia.replace("CUSTOM_LEAVES", weight);
                    zip.file("assets/minecraft/blockstates/acacia_leaves.json", acacia);
                }, function error(e) {
                    acacia = e;
                });
            zip.file("assets/minecraft/blockstates/birch_leaves.json").async("string").then(
                function success(content) {
                    birch = content;
                    birch = birch.replace("NORMAL_LEAVES", 100 - weight);
                    birch = birch.replace("CUSTOM_LEAVES", weight);
                    zip.file("assets/minecraft/blockstates/birch_leaves.json", birch);
                }, function error(e) {
                    birch = e;
                });
            zip.file("assets/minecraft/blockstates/dark_oak_leaves.json").async("string").then(
                function success(content) {
                    dark_oak = content;
                    dark_oak = dark_oak.replace("NORMAL_LEAVES", 100 - weight);
                    dark_oak = dark_oak.replace("CUSTOM_LEAVES", weight);
                    zip.file("assets/minecraft/blockstates/dark_oak_leaves.json", dark_oak);
                }, function error(e) {
                    dark_oak = e;
                });
            zip.file("assets/minecraft/blockstates/jungle_leaves.json").async("string").then(
                function success(content) {
                    jungle = content;
                    jungle = jungle.replace("NORMAL_LEAVES", 100 - weight);
                    jungle = jungle.replace("CUSTOM_LEAVES", weight);
                    zip.file("assets/minecraft/blockstates/jungle_leaves.json", jungle);
                }, function error(e) {
                    jungle = e;
                });
            zip.file("assets/minecraft/blockstates/oak_leaves.json").async("string").then(
                function success(content) {
                    oak = content;
                    oak = oak.replace("NORMAL_LEAVES", 100 - weight);
                    oak = oak.replace("CUSTOM_LEAVES", weight);
                    zip.file("assets/minecraft/blockstates/oak_leaves.json", oak);
                }, function error(e) {
                    oak = e;
                });
            zip.file("assets/minecraft/blockstates/spruce_leaves.json").async("string").then(
                function success(content) {
                    spruce = content;
                    spruce = spruce.replace("NORMAL_LEAVES", 100 - weight);
                    spruce = spruce.replace("CUSTOM_LEAVES", weight);
                    zip.file("assets/minecraft/blockstates/spruce_leaves.json", spruce);
                }, function error(e) {
                    spruce = e;
                });



            if (hardcore_darkness) {

            }
            $("#info > label").html("rezipping...");

            zip.generateAsync({ type: "blob" },
                function updateCallback(metadata) { //basically the progress
                    $("#progress-bar > div").width(metadata.percent + "%");
            }).then(function (blob) { // generate the zip file
                $("#info > label").html("Done!")
                saveAs(blob, "caelesti-edit.zip"); // trigger the download
            }, function (err) {
                $("#blob").text(err);
            });
        });

}
document.getElementById("leaves").oninput = function () { //TODO make this better... please
    $("#leaves").siblings("p").html("Better leaves: " + this.value + '%');
    this.style.background = 'linear-gradient(to right, #FFAE00 0%, #FFAE00 ' + this.value + '%, black ' + this.value + '%, black 100%)'
};