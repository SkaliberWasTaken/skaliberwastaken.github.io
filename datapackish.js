$.getJSON("data/pages/index.json", function(page_data) {
  $.getJSON("assets/lang/en_us.json", function(lang_data) {
    var keys = Object.keys(page_data.contents);
    for (var index in keys) {
      if (keys[index].endsWith(":style")) {
        $("[tag=\"" + keys[index].replace(":style", "") + "\"]").css(parse(page_data.contents[keys[index]], lang_data, "css"));
      } else {
        $("[tag=\"" + keys[index] + "\"]").html(parse(page_data.contents[keys[index]], lang_data, "value"));
      }
    }
  });
});

function parse(param, lang, ctx) {
  var out = "";
  var entryIndex = 0;
  if (typeof param == "string") { out += param; } else
  if (Array.isArray(param)) {
    if (ctx == "rand") { out = param[Math.floor(Math.random() * param.length)]; } else
    if (ctx == "br") {
      for (entryIndex in param) {
        out += parse(param[entryIndex], lang);
        if (entryIndex != param.length - 1){out += "<br>";}
      }
    } else {
      for (entryIndex in param) { out += parse(param[entryIndex], lang); }
    }
  } else
  if (typeof param == "object") {
    if (param.type == "translate_text") { out += parse(lang[param.value], lang, "value"); }
    else if (param.type == "random_list") { out += parse(param.value, lang, "rand"); }
    else if (param.type == "linebreak_list") { out += parse(param.value, lang, "br"); }
    else {out += parse(param.value, lang, "value");}
  }
  return out;
}
