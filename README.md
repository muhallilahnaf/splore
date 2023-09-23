# Splore

## Sitemap data collector and viewer with search and CSV export

[splore-app.netlify.app](https://splore-app.netlify.app/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/e6384556-b176-4c86-8747-1bc6f04b32b9/deploy-status)](https://app.netlify.com/sites/splore-app/deploys)

---

### Overview

Splore is a web app that can take the **domain, sitemap URL, or any URL of a website** and collect the **whole sitemap data**.

Then it allows you to explore the sitemap data (**page title, page URL, lastmod, parent sitemap URL**) in a table, along with a **search option**.

Finally, you can export the sitemap data (or part of it) as a **CSV file**.

### Input

- If you input the **domain or any URL of a website**, it will collect all the sitemap data.
- If you input any **specific sitemap URL** (e.g. example.com/page-sitemap.xml), you have the option to only get the data in the sitemap URL provided or that of the whole sitemap.
- There is the option to **get only post/blog sitemap data** (it might not work as expected all the time).

### Output and Search
- Collected data is displayed in a **table with pagination and search functionality**.
- You can choose how many rows are visible on each page of the table.
- Displayed columns are: **Page Title** (with URL), **Lastmod** (if exists), **Parent** (sitemap URL which contains the page).
- Table columns are **sortable** by clicking on the respective table header.
- Search function **only searches the Page Title column** (case insensitive).

### Export
- You can export all of the data as a CSV file.
- If you have searched for something, you can only export the search results as a CSV file.

---

### Libraries/Packages/Services Used

- [SvelteKit](https://kit.svelte.dev/): Front-end and back-end (using **SvelteKit API endpoints**)
- [Bootstrap](https://getbootstrap.com/): Front-end layout and design
- [Font Awesome](https://fontawesome.com/) and [svelte-fa](https://cweili.github.io/svelte-fa/): Icons
- [svelte-loading-spinners](https://schum123.github.io/svelte-loading-spinners/): Loading spinners
- [Grid.js](https://gridjs.io/) and [gridjs-svelte](https://github.com/iamyuu/gridjs-svelte/): Table with pagination and search
- [Netlify](https://www.netlify.com/): Hosting the web app and the API (using **Netlify Functions**)

### License

**MIT**