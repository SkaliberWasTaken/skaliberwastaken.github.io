on('load', () => {
  const viewer = $('#viewer');
  let selected = $('#lilypads');

  function updateViewer(html) {
    viewer.classList.add('hidden');
    setTimeout(() => {
      viewer.innerHTML = html;
      viewer.classList.remove('hidden');
    }, 400);
  }

  const lilypads = $('#lilypads');
  lilypads.on('click', () => {
    selected.classList.remove('selected');
    lilypads.classList.add('selected');
    selected = lilypads;

    updateViewer(`
      <iframe src="https://www.youtube-nocookie.com/embed/7F1-8eFDYQo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      <span class="errortext">Error 153? Click the image up there again.</span>
      <h2>Lily Pad Clusters</h2>
      <p>
        Lily pads look quite different in Caelesti. They feature a complex web of roots that stretch far underwater, occasionally sprouting new smaller lily pads.
      </p>
      <ul>
        <li>White, pink and yellow water lilies</li>
        <li>Lack of water lilies in cold regions</li>
        <li>Unique lilac water lilies in mangrove swamps</li>
        <li>Variegated lily pads in certain biomes</li>
      </ul>
    `);
  });
  lilypads.click();

  const dirt = $('#dirt');
  dirt.on('click', () => {
    selected.classList.remove('selected');
    dirt.classList.add('selected');
    selected = dirt;

    updateViewer(`
      <iframe src="https://www.youtube-nocookie.com/embed/y3unmKmqg9A" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      <span class="errortext">Error 153? Click the image up there again.</span>
      <h2>Dirtier Dirt</h2>
      <p>
        Caelesti's dirt, and all dirt-related blocks such as grass blocks, podzol, and mycelium, feature a colourmap. Dirt appears in almost every environment in Minecraft, and so it adapts to that environment, improving the overall look of the game.
      </p>
      <ul>
        <li>Dry, desaturated dirt in hot climates</li>
        <li>Rich and vivid soil in humid regions</li>
        <li>Dynamic pebbles at high altitudes and deep underground</li>
        <li>Built with Polytone's custom tintindex system</li>
      </ul>
    `);
  });

  const glass = $('#glass');
  glass.on('click', () => {
    selected.classList.remove('selected');
    glass.classList.add('selected');
    selected = glass;

    updateViewer(`
      <iframe src="https://www.youtube-nocookie.com/embed/YBK1gzalNIM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      <span class="errortext">Error 153? Click the image up there again.</span>
      <h2>Connected Backface Glass</h2>
      <p>
        Not only does Caelesti feature connected textures for glass, but also a backface! Witness the rear face of glass from the front! Outstanding!
      </p>
      <ul>
        <li>Affects all types of glass including coloured and tinted</li>
        <li>Custom item models for improved inventory visuals</li>
        <li>Unique tilesheet for inner and outer textures</li>
      </ul>
    `);
  });
});
