/*Here I store constants containing each leaf model, with the text SPECIAL_LEAVES and NORMAL_LEAVES
 which are replaced by weights*/
//TODO make this use a readfile instead
//DOING by sekoia

function download() {
    $("#download>button").prop('disabled', true);
    var dark_mode_ui = true;
    var custom_font = true;
    var hardcore_darkness = true;
    var sounds = true;
    //this part has been pretty much taken from the library's examples, with a couple edits.
    //this makes a promise (google it if you don't know, too complicated to explain here)
    $("#info > label").html("Unzipping...");
    var promise = new JSZip.external.Promise(function (resolve, reject) {
        //gets the content of the pack
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

            sounds = $("#sounds").is(':checked');

            if (dark_mode_ui) {
                zip.remove("assets/minecraft/lang");
                //TODO, do the rest
            }

            if (custom_font) {
                zip.remove("assets/minecraft/textures/font");
            }

            if (hardcore_darkness) {

            }

            if (sounds) {
                zip.remove("assets/minecraft/sounds");
                zip.remove("assets/minecraft/sounds.json");
            }

            var acacia = "ERROR";
            var birch = "ERROR";
            var dark_oak = "ERROR";
            var jungle = "ERROR";
            var oak = "ERROR";
            var spruce = "ERROR";

            var weight = $("#leaves").val();
            $("#info > label").html("Rezipping and downloading...");
            //because javascript is a bit annoying, we have to use RegExp to actually replace all occurences.
            //the g means global
            const normal_l = new RegExp("NORMAL_LEAVES", 'g');
            const custom_l = new RegExp("CUSTOM_LEAVES", 'g');
            zip.file("assets/minecraft/blockstates/acacia_leaves.json").async("string").then(
                function success(content) {
                    acacia = content;
                    acacia = acacia.replace(normal_l, 100 - weight);
                    acacia = acacia.replace(custom_l, weight);
                    zip.file("assets/minecraft/blockstates/acacia_leaves.json", acacia);
                    zip.file("assets/minecraft/blockstates/birch_leaves.json").async("string").then(
                        function success(content) {
                            birch = content;
                            birch = birch.replace(normal_l, 100 - weight);
                            birch = birch.replace(custom_l, weight);
                            zip.file("assets/minecraft/blockstates/birch_leaves.json", birch);
                            zip.file("assets/minecraft/blockstates/dark_oak_leaves.json").async("string").then(
                                function success(content) {
                                    dark_oak = content;
                                    dark_oak = dark_oak.replace(normal_l, 100 - weight);
                                    dark_oak = dark_oak.replace(custom_l, weight);
                                    zip.file("assets/minecraft/blockstates/dark_oak_leaves.json", dark_oak);
                                    zip.file("assets/minecraft/blockstates/jungle_leaves.json").async("string").then(
                                        function success(content) {
                                            jungle = content;
                                            jungle = jungle.replace(normal_l, 100 - weight);
                                            jungle = jungle.replace(custom_l, weight);
                                            zip.file("assets/minecraft/blockstates/jungle_leaves.json", jungle);
                                            zip.file("assets/minecraft/blockstates/oak_leaves.json").async("string").then(
                                                function success(content) {
                                                    oak = content;
                                                    oak = oak.replace(normal_l, 100 - weight);
                                                    oak = oak.replace(custom_l, weight);
                                                    zip.file("assets/minecraft/blockstates/oak_leaves.json", oak);
                                                    zip.file("assets/minecraft/blockstates/spruce_leaves.json").async("string").then(
                                                        function success(content) {
                                                            spruce = content;
                                                            spruce = spruce.replace(normal_l, 100 - weight);
                                                            spruce = spruce.replace(custom_l, weight);
                                                            zip.file("assets/minecraft/blockstates/spruce_leaves.json", spruce);
                                                            zip.generateAsync({ type: "blob" },
                                                                function updateCallback(metadata) { //basically the progress
                                                                    $("#progress-bar > div").width(metadata.percent + "%");
                                                                }).then(function callback(blob) { // generate the zip file
                                                                    $("#info > label").html("Done!")
                                                                    saveAs(blob, "caelesti-edit.zip"); // trigger the download
                                                                    $("#download>button").prop('disabled', false);
                                                                }, function (err) {
                                                                    $("#blob").text(err);
                                                                });
                                                        });
                                                        });
                                        });
                                });
                        });
                });
        });

}

function noChange() {
    var promise = new JSZip.external.Promise(function (resolve, reject) {
        //gets the content of the pack
        JSZipUtils.getBinaryContent("https://www.skaliber.net/projects/caelesti/beta/data/caelesti.zip", function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
    //uses the promise to load the data. There is currently no error message if the load fails
    promise.then(JSZip.loadAsync).then(function (zip) {
        zip.generateAsync({ type: "blob" },
            function updateCallback(metadata) { //basically the progress
                $("#progress-bar > div").width(metadata.percent + "%");
            }).then(function callback(blob) { // generate the zip file
                $("#info > label").html("Done!")
                saveAs(blob, "caelesti-edit.zip"); // trigger the download
                $("#download>button").prop('disabled', false);
            }, function (err) {
                $("#blob").text(err);
            })
    });
}

function testfunction() {
    const blob = new Blob(['test'], { type: 'text/plain' });
    saveAs(blob, 'test.txt');
}

$("#leaves").on('input', function () { //TODO make this better... please
    $("#leaves").siblings("p").html("Better leaves: " + this.value + '%');
    this.style.background = 'linear-gradient(to right, #FFAE00 0%, #FFAE00 ' + this.value + '%, black ' + this.value + '%, black 100%)'
});