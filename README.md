# nhentai.to scraper for Localnet

Reads `nhentai.to` pages for Localnet, a browser extension that is a personal search engine.
Localnet pulls it from here the first time it scrapes such a page, through the
[localnet-scrapers](https://github.com/opowell/localnet-scrapers) scraper source.

A gallery's page (/g/697669/) reads as its title (#info h1), its original title (h2), then each of its pages as a picture: its thumbnails (…/galleries/4327705/1t.webp) without the t, which are the pages themselves. Its details are what it is filed under, by the name of each of its fields (parodies, characters, tags, artists, groups, languages, categories), each a link to its listing, which it links to with weight 0.5, its artists' and groups' with 1; and it links to the galleries the page offers beside it by their place. Any other page (the home page, a tag, a search) is a listing of the galleries it shows.

- `source.json`: what Localnet reads to know the scraper: its name, the URLs it reads, and the file to run.
- `nhentai-to.js`: the parser. It is injected into the scraped page after Localnet's DOM helpers (content-scripts/utils/dom.js) and defines `window.__dynamicParser`.
- `nhentai-to.test.ts`: its unit tests, run from a Localnet checkout (`pnpm parsers pull`, then `pnpm test parsers/localnet-scraper-nhentai-to`).
- `saved-pages/` (not in git): real pages saved from the site, which Localnet's `e2e/saved-pages.test.ts` scrapes. See Localnet's README.