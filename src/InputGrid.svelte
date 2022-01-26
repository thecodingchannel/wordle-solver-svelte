<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import CharInput from './CharInput.svelte';
	import { range } from './calculator';

    const dispatch = createEventDispatcher();

	export let grid = [];
	export let states = [];
</script>

<div class="grid">
    {#each range(grid.length) as y}
        {#each range(grid[0].length) as x}
            <CharInput bind:letter={grid[y][x]} bind:state={states[y][x]} on:switchfocus={() => dispatch('switchfocus')} />
        {/each}
    {/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(5, 1fr);
		gap: 8px 6px;
	}
</style>
