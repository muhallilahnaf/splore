import { removeGzFromLink, REGEX_HTTPS_DOMAIN } from '$lib/driver.js';
import { storeLinks } from '$lib/stores.js';


// csv headers
const CSV_HEADERS = ['Title', 'URL', 'Lastmod', 'Parent']


// check if link ends with .xml
export const isXml = (link) => removeGzFromLink(link).endsWith('.xml');


// capitalize first alphabet
const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);


// get the slug from link
// replace all hyphen with space
// capitalize first alphabet
const getPostNameFromLink = (link) => {
    link = link.trim();
    if (link.includes('/')) {
        if (link.endsWith('/')) {
            link = link.slice(0, link.length - 1);
        }
        if (link.lastIndexOf('/') != -1) {
            link = link.slice(link.lastIndexOf('/') + 1);
        }
    }
    link = link.replaceAll('-', ' ');
    return capitalize(link);
};


// get date string from lastmod
const getDateString = (lastmod) => {
    lastmod = lastmod.trim()
    if (lastmod == '') return lastmod
    const date = new Date(lastmod)
    if (date instanceof Date && !isNaN(date.valueOf())) {
        return date.toDateString()
    }
    return ''
}


// remove domain from link
const getParentDirFromLink = (link) => link.trim().replace(REGEX_HTTPS_DOMAIN, '');


// get table row array for gridjs
const getTableRowItems = (data, parent) => [
    {
        name: getPostNameFromLink(data.loc),
        link: data.loc.trim()
    },
    'lastmod' in data ? getDateString(data.lastmod) : '',
    {
        name: getParentDirFromLink(parent),
        link: parent
    }
]


// recursively parse the sitemap tree 
// collect array items from the sitemap tree
// update the sitemap links store
export const addLinksFromTree = (tree, parent) => {
    if (Array.isArray(tree)) {
        storeLinks.update((links) => [
            ...links,
            ...tree.map((t) => getTableRowItems(t, parent))
        ]);
        return;
    }
    for (const [key, value] of Object.entries(tree)) {
        addLinksFromTree(value, key);
    }
};


// convert result array to csv string
export const resultsToCsv = (resultList, searchTerm) => {
    const results = searchTerm
        ? resultList.filter((item) => item[0].name.toLowerCase().includes(searchTerm))
        : resultList;
    let strList = results
        .map((item) =>
            [item[0].name, item[0].link, item[1], item[2].link]
                .map(String)
                .map((v) => v.replaceAll('"', '""'))
                .map((v) => `"${v}"`)
                .join(',')
        )
    const headerRow = CSV_HEADERS.map((v) => `"${v}"`).join(',')
    strList.unshift(headerRow)
    return strList.join('\r\n');
};

