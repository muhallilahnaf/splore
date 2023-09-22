
// global variables
// const REGEX_LOC = /(?<=<loc>)(.+?)(?=<\/loc>)/gm
const REGEX_IMGEXT = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
const REGEX_NEWLINE = /(\r\n|\r|\n)/gm
const REGEX_DOMAIN = /\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/gm
export const REGEX_HTTPS_DOMAIN = /^https:\/\/\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/gm


// append text to log body and scroll
const addLineToLog = (text, status) => {
    const body = document.getElementById('log-body');
    if (body) {
        const p = document.createElement('p')
        const time = new Date().toTimeString().slice(0, 8)
        p.innerText = time + ' ' + text
        if (status) p.classList.add(`text-${status}`)
        body.appendChild(p)
        body.scroll({ top: body.scrollHeight, behavior: 'smooth' });
    }
};


// fetch robots.txt for sitemap links
const getSitemapFromRobotsTxt = async (url, options) => {
    const { post } = options
    const link = url + '/robots.txt'
    const { error, text } = await getResData(link)
    if (!error) {
        if (text.includes('Sitemap:')) {
            addLineToLog('Sitemap link found in robots.txt', 'success')
            const lines = text.split(REGEX_NEWLINE)
            const linesSitemap = lines.filter(line => line.startsWith('Sitemap:'))
            const links = linesSitemap.map(line => removeGzFromLink(line.slice(9)))
            const noxml = await fetchSitemapLinks(links, { post })
            return noxml
        }
        addLineToLog('No sitemap link found in robots.txt', 'danger')
        return false
    }
    return false
}


// main fetch function
const getResData = async (link) => {
    addLineToLog('Fetching: ' + link)
    const res = await fetch('/proxy', {
        headers: {
            'Target-URL': link
        }
    })

    // if successful request, return data
    if (res.status == 200) {
        const text = await res.text()
        return {
            error: false,
            text
        }
    }

    // return error
    addLineToLog('HTTP' + res.status + ' status on url: ' + link, 'danger')
    return {
        error: true,
        text: res.status
    }
}


// parse sitemap entries using the specified parent tag
const getSitemapLinksFromTag = (doc, parentTag) => {
    const tags = doc.querySelectorAll(parentTag)
    if (tags.length == 0) return false
    let result = []
    tags.forEach(tag => {
        const loc = tag.querySelector('loc')
        const lastmod = tag.querySelector('lastmod')
        if (loc) {
            let temp = { loc: loc.textContent }
            if (lastmod) temp.lastmod = lastmod.textContent
            result.push(temp)
        }
    })
    return result
}


// parse xml string to doc and parse the doc
const getDataFromXmlString = (txt) => {
    // xml string to doc
    const doc = new DOMParser().parseFromString(txt, 'application/xml')

    // if no <loc> tag, return
    const locExist = doc.querySelector('loc')
    if (!locExist) return false

    // find sitemap entries using <sitemap> parent tag
    const resultSitemapTag = getSitemapLinksFromTag(doc, 'sitemap')
    if (resultSitemapTag) return resultSitemapTag

    // find sitemap entries using <url> parent tag
    const resultUrlTag = getSitemapLinksFromTag(doc, 'url')
    if (resultUrlTag) return resultUrlTag

    // find sitemap entries using <loc> tag
    const locs = doc.querySelectorAll('loc')
    const lastmods = doc.querySelectorAll('lastmod')

    // check if there are any <loc:image> tags which are also parsed as <loc> tags
    if (locs.length == lastmods.length) {
        let result = []
        for (let i = 0; i < locs.length; i++) {
            result.push({
                loc: locs[i].textContent,
                lastmod: lastmods[i].textContent,
            })
        }
        return result
    }

    // filter out <loc:image> tags
    let result = []
    locs.forEach(loc => {
        const text = loc.textContent
        if (!text.match(REGEX_IMGEXT)) result.push({ loc: text })
    })
    return result
}

// return true if sitemap link contains posts/blogs
// TODO need a better solution
const checkPost = (link) => {
    if (link.match(/(post|blog)s?-sitemaps?/gm)) return true
    if (link.match(/\/(post|blog)s?\//gm)) return true
    if (link.match(/-?posts?-?/gm)) return true
    return false
}


// recursively fetch sitemap links and collect url
const fetchSitemapLinks = async (links, options) => {
    let results = {}
    const { post } = options
    for (const link of links) {
        const { error, text } = await getResData(link)
        if (!error) {
            const result = getDataFromXmlString(text)
            if (result) {
                const freshResult = result.map(m => removeGzFromObject(m))
                const linksAreXml = freshResult.some(m => m.loc.endsWith('.xml'))
                if (post) {
                    const linkIsPost = checkPost(link)
                    if (linkIsPost) {
                        if (!linksAreXml) results[link] = freshResult
                        continue
                    }
                    if (linksAreXml) {
                        const postLinks = freshResult.filter(m => checkPost(m.loc)).map(m => m.loc)
                        const noxml = await fetchSitemapLinks(postLinks, { post })
                        results[link] = noxml
                        continue
                    }
                }
                if (linksAreXml) {
                    const noxml = await fetchSitemapLinks(freshResult.map(m => m.loc), { post })
                    results[link] = noxml
                    continue
                }
                results[link] = freshResult
                continue
            }
            addLineToLog('No loc tag on url: ' + link, 'danger')
            continue
        }
        continue
    }
    return results
}


// fetch index sitemap links
const getSitemapXml = async (url, index, options) => {
    const { post } = options
    const link = index
        ? url + '/sitemap_index.xml'
        : url + '/sitemap.xml'
    const { error, text } = await getResData(link)
    if (!error) {
        const result = getDataFromXmlString(text)
        if (result) {
            const freshResult = result.map(m => removeGzFromObject(m))
            const linksAreXml = freshResult.some(m => m.loc.endsWith('.xml'))
            if (linksAreXml) {
                const results = await fetchSitemapLinks(freshResult.map(m => m.loc), { post })
                return results
            }
            const results = { [link]: freshResult }
            return results
        }
        addLineToLog('No loc tag on url: ' + link, 'danger')
        return false
    }
    return false
}


// main function
const fetchSitemap = async (url, options) => {
    const { post } = options
    const linksFromRobotsTxt = await getSitemapFromRobotsTxt(url, { post })
    if (linksFromRobotsTxt) return linksFromRobotsTxt

    const linksFromSitemapNonIndex = await getSitemapXml(url, false, { post })
    if (linksFromSitemapNonIndex) return linksFromSitemapNonIndex

    const linksFromSitemapIndex = await getSitemapXml(url, true, { post })
    if (linksFromSitemapIndex) return linksFromSitemapIndex

    return false
}


// get full url
const getUrl = (domain) => {
    const match = domain.match(REGEX_DOMAIN);
    if (!match) return false;
    return 'https://' + match[0];
};


// remove (.gz) extension from url
export const removeGzFromLink = (url) => {
    const trimmed = url.trim();
    if (trimmed.endsWith('.gz')) {
        return trimmed.slice(0, trimmed.length - 3);
    }
    return trimmed;
};


// remove (.gz) extension from result object
const removeGzFromObject = (obj) => {
    obj.loc = obj.loc.trim();
    if (obj.loc.endsWith('.gz')) {
        obj.loc = obj.loc.slice(0, obj.loc.length - 3);
    }
    return obj
};


// entry point
export const startFetch = async (input, post, xml) => {
    if (xml) {
        const link = input.startsWith('https://') ? input : 'https://' + input;
        const links = [link];
        const result = await fetchSitemapLinks(links, { post });
        return result;
    }
    const url = getUrl(input);
    if (!url) {
        addLineToLog('Not a valid domain.', 'danger');
        return false;
    }
    const result = await fetchSitemap(url, { post });
    if (result) return result
    addLineToLog('No sitemaps found.', 'danger');
    return false;
}