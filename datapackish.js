function perform(s) {
  s = settings(s);
  $.getJSON(url(s.page_data, s, "data/[n]/pages/[v].json"), function(page_data) {
    // alert(JSON.stringify(page_data));
    $.getJSON(url(s.lang_data, s, "assets/[n]/lang/[v].json"), function(lang_data) {
      // alert(JSON.stringify(lang_data));
      $.getJSON(url(parse(page_data.color_palette, lang_data, "value"), s, "assets/[n]/palettes/[v].json"), function(palette_data) {
        // alert(JSON.stringify(palette_data));
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
  });
}

function url(input, settings, ctx) {
  var namespace = input.substring(0, input.indexOf(":"));
  var value = input.substring(input.indexOf(":") + 1);
  input = settings.content_src + ctx.replace("[n]", namespace).replace("[v]", value);
  // alert(input);
  return input;
}

function settings(settings) {
  settings = settings || {};
  settings.use_local = settings.use_local || false;
  settings.repo = settings.repo || "Magnogen/defaultDatas";
  settings.path = settings.path || "";
  settings.page_name = settings.page_name || "index";
  if (settings.use_local) { settings.content_src = settings.path; }
  else { settings.content_src = "https://raw.githubusercontent.com/" + settings.repo + "/master/" + settings.path; }
  return settings;
}

function parse(param, lang, ctx) {
  var out = "";
  var entryIndex = 0;
  if (typeof param == "string") {
    out += param;
  } else
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
