also_small("hero-name", parse_text(pageData["hero"]["name"]));
document.getElementById("hero-description").innerHTML = parse_text(pageData["hero"]["description"]);
also_small("nav-home", parse_text(pageData["navigation"]["home"]));
also_small("nav-projects", parse_text(pageData["navigation"]["projects"]));
also_small("nav-socials", parse_text(pageData["navigation"]["socials"]));
document.getElementById("content-title").innerHTML = parse_text(pageData["content"]["title"]);
document.getElementById("content-main").innerHTML = parse_text(pageData["content"]["main"]);
document.getElementById("caelesti-description").innerHTML = parse_text(pageData["content"]["caelesti"]["description"]);
document.getElementById("artibus-description").innerHTML = parse_text(pageData["content"]["artibus"]["description"]);
document.getElementById("footer-follow").innerHTML = parse_text(pageData["footer"]["follow"]);

function also_small(normal, data) {
  document.getElementById(normal).innerHTML = data;
  document.getElementById(normal + "-small").innerHTML = data;
}

function parse_text(param) {
  var out = "";
  if (param.source == "pure_text") {out = param["value"];}
  if (param.source == "translate_text") {
    translate = lang[param["value"]];
    if (Array.isArray(translate)) {
      for (entryIndex in translate) {
        out += translate[entryIndex] + "<br>";
      }
    } else {out = translate;}
  }
  return out;
}
