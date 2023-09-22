<script>
	import { storeLinks, storeSearch } from '$lib/stores.js';
	import { resultsToCsv } from '$lib/utils.js';
	import { browser } from '$app/environment';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faArrowLeft, faFileArrowDown } from '@fortawesome/free-solid-svg-icons/index.js';

	// if no results, go back to homepage
	if ($storeLinks.length == 0) {
		if (browser) goto('/').finally(() => {});
	}

	// export results as csv
	const exportCsv = (searchOnly) => {
		// get the csv string and create a csv blob
		const csvString = searchOnly
			? resultsToCsv($storeLinks, $storeSearch)
			: resultsToCsv($storeLinks);
		const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

		// attach csv file to an <a> tag
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;

		// create the file name with a time string at the end
		const timeString = new Date().toTimeString().slice(0, 8).replaceAll(':', '');
		const filename = 'splore-export-' + timeString + '.csv';
		a.download = filename;

		// download the file
		a.click();
	};
</script>

<!-- go back section -->
<div class="container-fluid bg-secondary mb-3 p-3">
	<div class="container">
		<div class="row">
			<div class="col-12 col-xl-10 offset-xl-1">
				<a class="btn btn-primary text-light" href="/results" role="button">
					<Fa icon={faArrowLeft} />
					<span> Go back to results </span>
				</a>
			</div>
		</div>
	</div>
</div>

<!-- export section -->
<div class="container">
	<div class="row">
		<div class="col-12 col-xl-10 offset-xl-1">
			<p class="display-6 mt-3 mb-5">Export results</p>
			<div class="d-flex justify-content-around">
				<div>
					<button on:click={() => exportCsv(false)} class="btn btn-secondary text-primary">
						<Fa icon={faFileArrowDown} />
						<b> Export all results (.csv) </b>
					</button>
				</div>
				{#if $storeSearch != ''}
					<div>
						<button on:click={() => exportCsv(true)} class="btn btn-secondary text-primary">
							<Fa icon={faFileArrowDown} />
							<b> Export search results (.csv) </b>
						</button>
						<div>
							<small>Page titles containing "{$storeSearch}"</small>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
