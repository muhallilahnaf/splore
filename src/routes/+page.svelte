<script>
	import { storeTree, storeLinks } from '$lib/stores.js';
	import { startFetch, removeGzFromLink } from '$lib/driver.js';
	import { isXml, addLinksFromTree } from '$lib/utils.js';
	import { Stretch, Clock } from 'svelte-loading-spinners';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faMagnifyingGlass, faArrowRight } from '@fortawesome/free-solid-svg-icons/index.js';

	let searchText = '';
	let seconds = 0;
	let loading = false;
	let timer = 0;

	// reactive
	$: xml = isXml(searchText);
	$: addLinksFromTree($storeTree);

	const startLoading = () => {
		// reset sitemap tree store
		$storeTree = {};
		$storeLinks = [];

		// disable search form
		document.getElementById('search-form').classList.add('disabled');

		// set loading to true
		loading = true;

		// clear log body and display it
		document.getElementById('log-body').replaceChildren();
		document.getElementById('log').classList.remove('d-none');
		document.getElementById('timer').classList.remove('d-none');

		// reset and start timer
		seconds = 0;
		timer = setInterval(() => seconds++, 1000);
	};

	const endLoading = () => {
		// enable search form
		document.getElementById('search-form').classList.remove('disabled');

		// set loading to false
		loading = false;

		// clear timer
		clearInterval(timer);
	};

	const search = async () => {
		// check if search text is empty
		if (searchText.trim() == '') return;

		startLoading();

		// collect input values
		const input = removeGzFromLink(searchText.toLowerCase());
		const postOnly = document.getElementById('post-only').checked;
		const xmlOnly = xml ? document.getElementById('xml-only').checked : false;

		// start fetching and get result
		const result = await startFetch(input, postOnly, xmlOnly);
		if (result) $storeTree = result;

		endLoading();
	};
</script>

<!-- Search section -->
<div class="container-fluid bg-secondary text-primary mb-3 py-5">
	<div class="container">
		<div id="search-form" class="row">
			<div class="col-12 col-xl-8 offset-xl-2">
				<div class="row mb-3">
					<input
						type="search"
						class="form-control form-control-lg rounded-pill bg-light"
						aria-label="search box"
						id="search-box"
						placeholder="domain name, website link, or sitemap url"
						bind:value={searchText}
					/>
				</div>
				<div class="row mb-3">
					<div class="form-check col-6">
						<input class="form-check-input" type="checkbox" value="" id="post-only" />
						<label class="form-check-label" for="post-only"> Post/blog links only </label>
					</div>
					{#if xml}
						<div class="form-check col-6">
							<input class="form-check-input" type="checkbox" value="" id="xml-only" />
							<label class="form-check-label" for="xml-only"> This XML link only </label>
						</div>
					{/if}
				</div>
				<div class="d-flex justify-content-center">
					<button
						type="button"
						class="btn btn-light text-primary"
						id="search-btn"
						on:click={search}
					>
						<Fa icon={faMagnifyingGlass} />
						<span>Search</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Log section -->
<div class="container d-none" id="log">
	<div class="row">
		<div class="col-12 col-xl-8 offset-xl-2">
			<div class="card w-100">
				<div class="card-header bg-secondary text-primary">
					<div class="d-flex justify-content-between align-items-center">
						{#if !loading}
							<strong>Done!</strong>
						{:else}
							<strong>Loading...</strong>
							<Stretch size="40" color="#495464" unit="px" />
						{/if}
						<div id="timer" class="d-none d-flex align-items-center">
							<p class="me-2 mb-0">
								{seconds + 's'}
							</p>
							{#if loading}
								<Clock size="1.25" color="#495464" unit="em" />
							{/if}
						</div>
					</div>
				</div>
				<div id="log-body" class="card-body bg-light text-primary">
					<!-- log text -->
				</div>
			</div>
		</div>
	</div>
</div>

<!-- button to go to results page, if result exists -->
{#if $storeLinks.length > 0}
	<div class="container mt-3">
		<div class="row">
			<div class="col-12">
				<div class="d-flex justify-content-center">
					<a class="btn btn-primary text-light" href="/results" role="button">
						<span> See results </span>
						<Fa icon={faArrowRight} />
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}
