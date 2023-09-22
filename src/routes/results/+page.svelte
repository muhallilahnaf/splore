<script>
	import { beforeUpdate } from 'svelte';
	import { storeLinks, storeSearch } from '$lib/stores.js';
	import Grid from 'gridjs-svelte';
	import { html } from 'gridjs';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faArrowLeft, faFileExport } from '@fortawesome/free-solid-svg-icons/index.js';

	// if no results, go back to homepage
	if ($storeLinks.length == 0) {
		if (browser) goto('/').finally(() => {});
	}

	let grid;
	let rows = '10';

	// fix gridjs bug
	beforeUpdate(async () => {
		if (grid) {
			grid.config.plugin.remove('pagination');
			grid.config.plugin.remove('search');
		}
	});

	// get the search term and go to export page
	const exportData = () => {
		$storeSearch = document.querySelector('.gridjs-search input').value.trim().toLowerCase();
		goto('/export');
	};

	// update visible rows in gridjs table
	const updateTableRows = () => {
		rows = document.getElementById('table-rows').value;
		grid
			.updateConfig({
				pagination: {
					limit: parseInt(rows)
				}
			})
			.forceRender();
	};

	// columns config for gridjs
	const columns = [
		{
			name: 'Title',
			formatter: (cell) => html(`<a href="${cell.link}" target="_blank">${cell.name}</a>`)
		},
		{
			name: 'Lastmod'
		},
		{
			name: 'Parent',
			formatter: (cell) => html(`<a href="${cell.link}" target="_blank">${cell.name}</a>`)
		}
	];

	// pagination config for gridjs
	const pagination = {
		limit: parseInt(rows)
	};

	// search config for gridjs
	const search = {
		selector: (cell, rowIndex, cellIndex) => {
			if (cellIndex === 0) return cell.name.toLowerCase();
		}
	};

	// className config for gridjs
	const className = {
		table: 'table table-light table-hover table-bordered border-primary align-middle text-primary',
		td: 'text-primary',
		th: 'text-primary bg-secondary',
		// header,
		footer: 'bg-light text-primary',
		// thead,
		// tbody,
		// search,
		// sort,
		pagination: 'text-primary',
		// paginationSummary,
		paginationButton: 'text-primary',
		// paginationButtonNext,
		paginationButtonCurrent: 'bg-light',
		// paginationButtonPrev,
		// loading,
		notfound: 'text-danger',
		error: 'text-danger'
	};
</script>

<!-- go back section -->
<div class="container-fluid bg-secondary mb-3 p-3">
	<div class="container">
		<div class="row">
			<div class="col-12 col-xl-10 offset-xl-1">
				<div class="d-flex justify-content-between">
					<a class="btn btn-primary text-light" href="/" role="button">
						<Fa icon={faArrowLeft} />
						<span> Go back to search </span>
					</a>
					<button id="export" class="btn btn-primary text-light" on:click={exportData}>
						<Fa icon={faFileExport} />
						<span> Export </span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- table -->
<div class="container" id="results-table">
	<div class="row">
		<div class="col-12 col-xl-10 offset-xl-1">
			<p class="display-6 my-3">Results</p>
			<div class="d-flex justify-content-between">
				<div>
					<select
						id="table-rows"
						bind:value={rows}
						on:change={updateTableRows}
						class="form-select bg-light text-primary"
						aria-label="Table rows"
					>
						<option value="10" selected>10 rows</option>
						<option value="20">20 rows</option>
						<option value="50">50 rows</option>
						<option value="100">100 rows</option>
					</select>
				</div>
			</div>
			<Grid
				bind:instance={grid}
				data={$storeLinks}
				{columns}
				{search}
				sort
				{pagination}
				{className}
			/>
		</div>
	</div>
</div>
