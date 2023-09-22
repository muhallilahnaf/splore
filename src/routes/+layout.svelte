<script>
	import '../app.scss';
	import brandLogo from '$lib/assets/splore.svg';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faGithub } from '@fortawesome/free-brands-svg-icons/index.js';
	import { onMount } from 'svelte';

	onMount(async () => {
		import('bootstrap');
		// ping the proxy server
		const res = await fetch('/proxy', {
			headers: {
				'Target-URL': 'ping'
			}
		});
		if (!res.ok) alert('something went wrong');
	});
</script>

<svelte:head>
	<title>Splore</title>
</svelte:head>

<body>
	<nav class="navbar navbar-expand bg-primary">
		<div class="container-fluid d-flex justify-content-between">
			<a class="navbar-brand ms-2 text-light" href="/">
				<span>
					<img src={brandLogo} class="mb-1" alt="splore" width="30" height="24" />
				</span>
				<span> Splore </span>
			</a>
			<ul class="navbar-nav">
				<li class="nav-item">
					<a class="nav-link text-light" href="https://github.com/muhallilahnaf/splore">
						<b>
							<Fa icon={faGithub} size="lg" />
						</b>
					</a>
				</li>
			</ul>
		</div>
	</nav>
	<slot />
</body>
