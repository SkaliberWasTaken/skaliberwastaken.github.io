function perform(s) {
  s = settings(s);
  $.getJSON(url(s.page_data, s, "[u]data/[n]/pages/[v].json"), function(page_data) {
    // alert(JSON.stringify(page_data));
    $.getJSON(url(s.lang_data, s, "[u]assets/[n]/lang/[v].json"), function(lang_data) {
      // alert(JSON.stringify(lang_data));
      var content_keys = Object.keys(page_data.contents);
      for (var content_index in content_keys) {
        if (content_keys[content_index].endsWith(":style")) {
          var css_keys = Object.keys(page_data.contents[content_keys[content_index]]);
          for (var css_index in css_keys) {
            $("[tag=\"" + content_keys[content_index].replace(":style", "") + "\"]").css(css_keys[css_index], parse(page_data.contents[content_keys[content_index]][css_keys[css_index]], s, lang_data, "value"));
            // alert("\"" +  content_keys[content_index].replace(":style", "") + "\": " + css_keys[css_index] + ": " + parse(page_data.contents[content_keys[content_index]][css_keys[css_index]], s, lang_data, "value"));
          }
        } else {
          $("[tag=\"" + content_keys[content_index] + "\"]").html(parse(page_data.contents[content_keys[content_index]], s, lang_data, "value"));
          // alert("\"" + content_keys[content_index] + "\": \"" + parse(page_data.contents[content_keys[content_index]], s, lang_data, "value") + "\"");
        }
      }
    });
  });
}

function url(input, settings, ctx) {
  var namespace = input.substring(0, input.indexOf(":"));
  var value = input.substring(input.indexOf(":") + 1);
  input = ctx.replace("[u]", settings.content_src).replace("[n]", namespace).replace("[v]", value);
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

function parse(param, settings, lang, ctx) {
  var out = "";
  var entryIndex = 0;
  if (typeof param == "string") {
    out += param;
  } else
  if (Array.isArray(param)) {
    if (ctx == "rand") { out = param[Math.floor(Math.random() * param.length)]; } else
    if (ctx == "br") {
      for (entryIndex in param) {
        out += parse(param[entryIndex], settings, lang, "value");
        if (entryIndex != param.length - 1){out += "<br>";}
      }
    } else {
      for (entryIndex in param) { out += parse(param[entryIndex], settings, lang, "value"); }
    }
  } else
  if (typeof param == "object") {
    if (param.type == "translate_text") { out += parse(lang[param.value], settings, lang, "value"); }
    else if (param.type == "random_list") { out += parse(param.value, settings, lang, "rand"); }
    else if (param.type == "linebreak_list") { out += parse(param.value, settings, lang, "br"); }
    else if (param.type == "local_image") { out += url(parse(param.value, settings, lang, "value"), settings, "url([u]assets/[n]/images/[v].png)"); }
    else {out = parse(param.value, settings, lang, "value");}
  }
  return out;
}
