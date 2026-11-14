// A gallery's own address on nhentai.to, /g/<id>/, from its page or a page of its reader (/g/<id>/1/), else null.
function nhentaiGallery(url) {
  const page = new URL(url, location.href)
  const id = /^\/g\/(\d+)\//.exec(page.pathname)?.[1]
  return /(?:^|\.)nhentai\.to$/.test(page.hostname) && id ? `${page.origin}/g/${id}/` : null
}

// A gallery's page (/g/697669/) reads as its title (#info h1), its original title (h2), then each of its pages as a
// picture: its thumbnails (…/galleries/4327705/1t.webp) without the t, which are the pages themselves. Its details are
// what it is filed under, by the name of each of its fields (parodies, characters, tags, artists, groups, languages,
// categories), each a link to its listing, which it links to with weight 0.5, its artists' and groups' with 1; and it
// links to the galleries the page offers beside it by their place. Any other page (the home page, a tag, a search)
// is a listing of the galleries it shows.
function parseNhentaiTo(_profileId) {
  if (!/(?:^|\.)nhentai\.to$/.test(location.hostname)) {
    return null
  }
  const gallery = nhentaiGallery(location.href)
  const title = document.querySelector('#info h1')?.textContent.trim()
  if (!gallery || !title || location.href.split(/[?#]/)[0] !== gallery) {
    return listingOf(linkUrls('a[href*="/g/"]').map(nhentaiGallery).filter(url => url && url !== gallery)) ?? { listing: true }
  }
  const filed = {}
  for (const field of document.querySelectorAll('#tags .tag-container')) {
    const name = field.firstChild?.textContent.trim().toLowerCase()
    if (name) {
      filed[name] = Array.from(field.querySelectorAll('a.tag[href]'), a => ({ text: a.querySelector('.name')?.textContent.trim() || linkName(a), url: a.href }))
    }
  }
  const original = document.querySelector('#info h2')?.textContent.trim()
  const pages = new Set(Array.from(document.querySelectorAll('.gallerythumb img'), img => img.getAttribute('data-src') || img.getAttribute('src'))
    .filter(src => src && !src.startsWith('data:'))
    .map(src => new URL(src, location.href).href.replace(/\/(\d+)t\.(\w+)$/, '/$1.$2')))
  const links = new Map()
  for (const [name, values] of Object.entries(filed)) {
    for (const { text, url } of values) {
      links.set(url, { url, title: text, score: ['artists', 'groups'].includes(name) ? 1 : 0.5 })
    }
  }
  let rank = 0
  for (const url of linkUrls('#related-container a[href*="/g/"], .gallery a[href*="/g/"]').map(nhentaiGallery)) {
    if (url && url !== gallery && !links.has(url)) {
      links.set(url, { url, score: 1 / (1 + rank++ / 10) })
    }
  }
  return {
    title,
    content: [...(original ? [original] : []), ...Array.from(pages, src => `![](${src})`)],
    links: [...links.values()],
    details: ['parodies', 'characters', 'tags', 'artists', 'groups', 'languages', 'categories'].map(name => [name, filed[name] || []]),
  }
}

// The parser a scrape calls.
registerParser(parseNhentaiTo)
