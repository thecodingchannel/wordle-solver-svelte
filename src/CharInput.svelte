<script context="module">
    export const STATES = [ 'present', 'correct', 'absent' ];
</script>

<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

    export let letter;
    export let state = 'present';

    let previousLetter = '';

    // When this letter changes, update
    $: letter, updateLetter();

    function updateLetter() {
        // Clean up and switch to uppercase
        letter = (letter || '').toUpperCase();

        // Remove anything that isn't an upper-case letter
        letter = letter.replace(/[^A-Z]/g, '');

        // Notify when a new letter is entered
        if (previousLetter === '' && letter) {
            dispatch('switchfocus');
        }

        previousLetter = letter;
    }

    function cycleState() {
        state = STATES[(STATES.indexOf(state) + 1) % STATES.length];
    }
</script>

<div class={state}>
    <input type="text" bind:value={letter} maxlength="1"/>
    <div class="button" on:click={cycleState}></div>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        width: 56px;
        display: flex;
        justify-content: center;
        text-align: center;
    }

    input {
        background-color: transparent;
        text-align: center;
        color: white;
        font-size: 26px;
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        padding: 0;
        margin: 2px;
    }

    .button {
        border: none;
        outline: none;
        height: 32px;
        width: 100%;
        padding: 0;
        margin: 0;
        user-select: none;
        border-top: 1px solid rgb(109, 100, 100);
        background: linear-gradient(90deg, #918702 0%, #918702 33%, #2b2e36 33%, #2b2e36 66%, #0d5e0d 66%, #0d5e0d 100%);
    }

    :global(.colorblind) .button {
        background: linear-gradient(90deg, #10909e 0%, #10909e 33%, #2b2e36 33%, #2b2e36 66%, #b1550b 66%, #b1550b 100%);
    }

    .present {
        background-color: #918702;
    }
    .correct {
        background-color: #0d5e0d;
    }
    .absent {
        background-color: #2b2e36;
    }

    :global(.colorblind) .present {
        background-color: #10909e;
    }
    :global(.colorblind) .correct {
        background-color: #b1550b;
    }
    :global(.colorblind) .absent {
        background-color: #2b2e36;
    }
</style>
