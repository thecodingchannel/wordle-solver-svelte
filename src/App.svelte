<script>
	import InputGrid from './InputGrid.svelte';
	import { doCalculate, range } from './calculator';
	import { commonWords } from './dict-en';

	// Constants
	const MAX_DISPLAY_WORDS = 50;
	const LANGUAGES = ['en', 'de', 'it', 'fr'];

	// State
	let grid = [];
	let states = [];
	let displayWords = null;
	let extraWordCount = 0;
	let colorblind = false;
	let language = 'en';
	let dictionary = [];
	let disableCalculate = true;

	// Initialise the grid and states
    range(5).forEach(i => {
        grid.push(['','','','','']);
        states.push(['absent','absent','absent','absent','absent']);
    });
	grid[0][0] = 'A';

	// Change to a language if specified in the URL hash
	if (window.location.hash) {
		const hashLang = window.location.hash.substr(1).toLowerCase();
		console.log(hashLang);
		if (LANGUAGES.includes(hashLang)) {
			console.log("Setting language to " + hashLang);
			language = hashLang;
		}
	}

	// On language change, ensure the new dictionary is loaded
	$: loadDictionary(language);

	// When the grid is changed, update the disable state of the calculate button
	$: disableCalculate = shouldDisableCalculate(grid);

	/** Attempt to load the selected language dictionary, falling back to EN */
	async function loadDictionary() {
			console.log("Loading dict: ", language);
		if (language == 'en') {
			console.log("(local)");
			dictionary = commonWords;
		} else {
			console.log('(fetching)');
			const req = await fetch(`/dicts/${language}.json`);
			if (req.ok) {
				dictionary = await req.json();
				console.log('done');
			} else {
				alert(`Could not load dictionary for ${language.toUpperCase()} - reverting to English!`);
				console.error(`Failed to load dictionary for language '${language}'`);
				dictionary = commonWords;
			}
		}
	}

	/** Enable calculate button only if all rows that have letters are full rows */
	function shouldDisableCalculate() {
		let fullRows = 0;
		for (const row of grid) {
			if (row.some(cell => !!cell)) {
				if (!row.every(cell => !!cell)) {
					return true;
				}
				fullRows++;
			}
		}

		return fullRows < 1;;
	}

	/** Move the input focus to the next element */
	function nextCell() {
		const currentNode = document.activeElement;
        const allElements = document.querySelectorAll('input, button');
        const currentIndex = [...allElements].findIndex(el => currentNode === el);
        const targetIndex = (currentIndex + 1) % allElements.length;
        allElements[targetIndex].focus();
	}

	/** Perform the actual solver steps */
	function calculate() {
		// Work out which words are valid
		const foundWords = doCalculate(grid, states, dictionary);

		// Pick at most 50 of them for display
		displayWords = foundWords.slice(0, MAX_DISPLAY_WORDS);

		// Note how many extra words there are
		if (foundWords.length > MAX_DISPLAY_WORDS) {
			extraWordCount = foundWords.length - MAX_DISPLAY_WORDS;
		} else {
			extraWordCount = 0;
		}
	}
</script>

<main class:colorblind>
	<header>
		<h1>W<span>O</span>RDLE S<span>O</span>LVER</h1>
		<h2>Your little word quiz helper</h2>
		<hr/>
		<div class="blurb">
			<p>
				Do you want to impress your friends with your insane Wordle win streak?
				Are your co-workers annoying you every morning with their Wordle results?
			</p>
			<p>
				Or do you just need some help with your daily word-quizzes because your brain
				bluescreens every time you have to come up with words? We're here to help!
			</p>
		</div>
	</header>

	<div class="gridwrap">
		<InputGrid bind:grid bind:states on:switchfocus={nextCell} />
		<button on:click={calculate} disabled={disableCalculate}>
			{#if disableCalculate}Enter data to calculate{:else}CALCULATE{/if}
		</button>
		<div class="settings">
			<label>
				<input type="checkbox" bind:checked={colorblind} />
				<span>Colorblind mode</span>
			</label>
			<select bind:value={language} on:change={(evt) => window.location.hash = evt.target.value}>
				<option value="en">English</option>
				<option value="de">German</option>
				<option value="it">Italian</option>
				<option value="fr">French</option>
			</select>
		</div>
	</div>

	<div class="wordbox">
		{#if displayWords && displayWords.length}
		<div class="words">
			{#each displayWords as word}
				<div class="word">{word}</div>
			{/each}
			{#if extraWordCount}
				<div class="morenote">...and {extraWordCount} more matches!</div>
			{/if}
		</div>
		{:else if displayWords === null}
		<div class="note">
			<h3>How it works</h3>
			<ul>
				<li>Enter the letters you guessed into the boxes.</li>
				<li>Click the area below to toggle the color you got from Wordle.</li>
				<li>Click "CALCULATE" to generate a list of the possible words.
					You will only see up to 50 words even if the list is longer.
					Guess another word to reduce the list further.</li>
			</ul>
		</div>
		{:else}
		<div class="words"> No words found! </div>
		{/if}
	</div>

	<footer class="socials">
		<hr/>
		<div>
			<img src="tcclogo.png" alt="The Coding Channel Logo, showing a cute purple raccoon">
			<p>
				Wordle Solver is a project of The Coding Channel. The source code files are available on our
				<a href="https://github.com/thecodingchannel" alt="Coding Channel Github">GitHub</a>.
				Follow us on <a href="https://www.youtube.com/channel/UCIzSzivWvtLIWrWoOVyvVKw" alt="The Coding Channel YouTube">YouTube</a>
				and <a href="https://twitter.com/codingchannel" alt="The Coding Channel Twitter">Twitter</a>
				if you want to learn more about fun projects you can do with programming.
			</p>
		</div>
	</footer>
</main>

<style>
	main {
		text-align: left;
		padding: 1em 2em;
		margin: 0 auto;
		max-width: 800px;

		display: grid;
		justify-items: center;
		grid-template-areas: "header" "grid" "words" "footer";
		grid-template-columns: auto;
		gap: 1em;
	}

	@media (min-width: 660px) {
		main {
			grid-template-areas: "header  header" "grid words" "footer  footer";
			grid-template-columns: 300px minmax(320px 400px);
		}
	}

	h1 {
		text-align: right;
		color: #bfb3db;
		text-transform: uppercase;
		font-size: clamp(36px, 10vw, 92px);
		line-height: 1em;
		font-weight: 400;
		font-family: Cinzel, serif;
	}

	h1 span {
		color: #e68254;
	}

	h2 {
		text-align: right;
		line-height: 1em;
		color: #e68254;
		font-weight: 100;
		font-size: clamp(16px, 3vw, 27px);
	}

	hr {
		margin: 1em 0em;
		border: 0;
		border-top: 1px solid #bfb3db;
	}

	p {
		padding: 4px 0px;
	}

	header {
		grid-area: header;
	}
	footer {
		grid-area: footer;
	}
	.gridwrap {
		grid-area: grid;
		width: 300px;
	}
	.wordbox {
		grid-area: words;
	}

	.wordbox {
		align-self: flex-start;
		border: 1px solid #444;
		padding: 6px 12px;
		border-radius: 6px;
		background-color: #29212e;
	}

	.wordbox h3 {
		padding: 0;
		margin: 0;
		line-height: 100%;
		padding-top: 16px;
		font-size: 1.2em;
		font-family: Cinzel, serif;
		color: #e68254;
		font-weight: 100;
	}

	.wordbox li {
		margin: 0;
		padding: 0;
		margin-bottom: 8px;
	}

	.morenote {
		font-size: 0.8em;
		color: #e68254;
		font-style: italic;
		padding-left: 1em;
		padding-top: 0.5em
	}

	.gridwrap {
		width: 310px;
	}

	.gridwrap button {
		width: 100%;
		padding: 10px 8px;
		margin-top: 8px;
		border: 2px solid #da6a36;
		border-radius: 6px;
		background-color: #e68254;
		color: #4b2311;
		font-weight: 800;
		font-size: 1.5rem;
		line-height: 100%;
		height: 56px;
		font-family: Cinzel, serif;
	}
	.gridwrap button:disabled {
		background-color: #5c4e47;
		color: rgb(199, 199, 199);
		border: 2px solid #6a6a36;
		cursor: not-allowed;
		font-size: 1.2rem;
	}

	.settings {
		display: flex;
		margin-top: 4px;
		justify-content: space-between;
	}

	.words {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 8px 16px;
		align-content: flex-start;
	}

	footer p {
		color: #da6a36;
		font-size: small;
	}

	footer div {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		gap: 1em;
	}

	footer img {
		width: 50px;
		height: 50px;
	}

	@media (max-width: 600px) {
		main {
			padding: 1em 1em;
		}
		p {
			font-size: 0.8em
		}
		.wordbox {
			font-size: 85%;
		}
	}
</style>
