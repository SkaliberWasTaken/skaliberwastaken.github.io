// global variables
var hero_color = "";

// called by the page when it wants to set the values in the page
function perform(s) {
  // defaults the settings
  s = settings(s);
  // gets page data and language data from json files (specified in settings)
  $.getJSON(url(s.page_data, s, "[u]data/[n]/pages/[v].json"), function(page_data) {
    // alert(JSON.stringify(page_data));
    $.getJSON(url(s.lang_data, s, "[u]assets/[n]/lang/[v].json"), function(lang_data) {
      // alert(JSON.stringify(lang_data));
      // goes through every item in the page data and sets the values of the appropriate html
      //   object based on its key
      var content_keys = Object.keys(page_data.contents);
      for (var content_index in content_keys) {
        // sets the object's style
        if (content_keys[content_index].endsWith(":style")) {
          var css_keys = Object.keys(page_data.contents[content_keys[content_index]]);
          for (var css_index in css_keys) {
            if (content_keys[content_index] == "hero:style" && css_keys[css_index] == "background-color") {
              hero_color = parse(page_data.contents[content_keys[content_index]][css_keys[css_index]], s, lang_data, "value");
              $("[tag=\"" + content_keys[content_index].replace(":style", "") + "\"]").css(css_keys[css_index], hero_color);
            } else {
              $("[tag=\"" + content_keys[content_index].replace(":style", "") + "\"]").css(css_keys[css_index], parse(page_data.contents[content_keys[content_index]][css_keys[css_index]], s, lang_data, "value"));
              // alert("\"" +  content_keys[content_index].replace(":style", "") + "\": " + css_keys[css_index] + ": " + parse(page_data.contents[content_keys[content_index]][css_keys[css_index]], s, lang_data, "value"));
            }
          }
        }
        // sets the object's content
        else {
          $("[tag=\"" + content_keys[content_index] + "\"]").html(parse(page_data.contents[content_keys[content_index]], s, lang_data, "value"));
          // alert("\"" + content_keys[content_index] + "\": \"" + parse(page_data.contents[content_keys[content_index]], s, lang_data, "value") + "\"");
        }
      }
    });
  });
}

// parses the url into a machine-readable format (like skaliber:hero_image/forest -> assets/skaliber/images/hero_image/forest.png)
function url(input, settings, ctx) {
  var namespace = input.substring(0, input.indexOf(":"));
  var value = input.substring(input.indexOf(":") + 1);
  input = ctx.replace("[u]", settings.content_src).replace("[n]", namespace).replace("[v]", value);
  // alert(input);
  return input;
}

// returns the default settings of the page, takes in a settings object and sets default values
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

// function for parsing the value in the json, self-referencial
function parse(param, settings, lang, ctx) {
  var out = "";
  var entryIndex = 0;
  if (typeof param == "string") {
    // if its just a string, return it's value (default behaviour)
    out += param;
  } else
  if (Array.isArray(param)) {
    // if its an array, check what you need to do first random value, linebreaks, etc
    if (ctx == "rand") {
      // return a random value from that list, uniformly. [for weighted, see further down]
      out = param[Math.floor(Math.random() * param.length)];
    } else
    if (ctx == "br") {
      // return every value in the list, with linebreaks in between
      for (entryIndex in param) {
        out += parse(param[entryIndex], settings, lang, "value");
        if (entryIndex != param.length - 1){out += "<br>";}
      }
    } else {
      // return all the values in the list added together (concatenated)
      for (entryIndex in param) { out += parse(param[entryIndex], settings, lang, "value"); }
    }
  } else
  if (typeof param == "object") {
    // if it receives an object, or another to-be-parsed thing,
    //   it'll see what it needs to do and parse it
    // translating
    if (param.type == "translate") { out += parse(lang[param.value], settings, lang, "value"); }
    // parsing it back into itself for uniform random selection
    else if (param.type == "uniform_random") { out += parse(param.value, settings, lang, "rand"); }
    // weighted random
    else if (param.type == "weighted_random") {
      var total = 0;
      //adding the weights together
      for (entryIndex in param.value) {
        total += param.value[entryIndex].weight;
      }
      // find the random value
      var rand = Math.floor(Math.random() * total) + 1;
      // determine which value that corresponds to
      entryIndex = -1;
      while (rand > 0) { entryIndex += 1; rand -= param.value[entryIndex].weight; }
      // and return it
      out += parse(param.value[entryIndex], settings, lang, "value");
    }
    // parsing it back into itself for linebreaks
    else if (param.type == "linebreak_list") { out += parse(param.value, settings, lang, "br"); }
    // local stuff converts the url to a readable url (like skaliber:hero_image/forest -> assets/skaliber/images/hero_image/forest.png)
    else if (param.type == "local_image") { out += url(parse(param.value, settings, lang, "value"), settings, "url([u]assets/[n]/images/[v].png)"); }
    // if its not any of the above, just parse the value, effectively skipping over this section
    else {out = parse(param.value, settings, lang, "value");}
  }
  return out;
}
