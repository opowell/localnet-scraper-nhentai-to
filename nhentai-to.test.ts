import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('nhentai.to', () => {
  it('reads a gallery as its pages, from its thumbnails, and what it is filed under', () => {
    visit('https://nhentai.to/g/697669/', `<div id="info"><h1>A gallery</h1><h2>ある</h2><section id="tags">
      <div class="tag-container field-name"> Artists <span class="tags"><a href="/artist/akutsu/" class="tag"><span class="name">akutsu</span><span class="count">50</span></a></span></div>
      <div class="tag-container field-name"> Tags <span class="tags"><a href="/tag/milf/" class="tag"><span class="name">milf</span><span class="count">54908</span></a></span></div></section></div>
      <a class="gallerythumb" href="/g/697669/1/"><img data-src="https://supercdn.site/galleries/4327705/1t.webp"></a><a class="gallerythumb" href="/g/697669/2/"><img data-src="https://supercdn.site/galleries/4327705/2t.jpg"></a>`)
    const parsed = load('nhentai-to.js', ['parseNhentaiTo']).parseNhentaiTo()
    expect(parsed.content).toEqual(['ある', '![](https://supercdn.site/galleries/4327705/1.webp)', '![](https://supercdn.site/galleries/4327705/2.jpg)'])
    expect(parsed.links).toEqual([
      { url: 'https://nhentai.to/artist/akutsu/', title: 'akutsu', score: 1 },
      { url: 'https://nhentai.to/tag/milf/', title: 'milf', score: 0.5 },
    ])
  })

  it('reads https://nhentai.to/language/english as a listing of what it links to', async () => {
    visit('https://nhentai.to/language/english', '<a href="/g/697669/">A</a><a href="/tag/x/">x</a>')
    expect(await load('nhentai-to.js', ['parseNhentaiTo']).parseNhentaiTo()).toEqual({ listing: true, links: [{ url: 'https://nhentai.to/g/697669/', score: 1 }] })
  })
})
