const form = document.getElementById('search-form');
        const input = document.getElementById('word-input');
        const results = document.getElementById('results');
        const suggestions = document.getElementById('suggestions');

        input.addEventListener('input', async () => {
            const word = input.value.trim();
            if (word.length < 2) {
                suggestions.innerHTML = '';
                return;
            }

            try {
                const response = await fetch(`https://api.datamuse.com/words?sp=${word}*&max=10`);
                if (!response.ok) throw new Error('Suggestions not available');

                const data = await response.json();
                suggestions.innerHTML = data.map(item => `<option value="${item.word}">`).join('');
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                suggestions.innerHTML = '';
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const word = input.value.trim();
            if (!word) return;

            results.innerHTML = '<p class="loading">Loading...</p>';

            try {
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                if (!response.ok) throw new Error('Word not found or API error');

                const data = await response.json();
                displayResults(data);
            } catch (error) {
                results.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            }
        });

        function displayResults(data) {
            if (!data || data.length === 0) {
                results.innerHTML = '<p class="error">No results found.</p>';
                return;
            }

            const entry = data[0]; // Take the first entry
            let html = `<h2>${entry.word}</h2>`;

            if (entry.phonetic) {
                html += `<p><strong>Pronunciation:</strong> ${entry.phonetic}</p>`;
            }

            if (entry.phonetics && entry.phonetics.length > 0) {
                const audio = entry.phonetics.find(p => p.audio);
                if (audio && audio.audio) {
                    html += `<audio controls><source src="${audio.audio}" type="audio/mpeg"></audio>`;
                }
            }

            entry.meanings.forEach(meaning => {
                html += `<h3>${meaning.partOfSpeech}</h3>`;
                meaning.definitions.forEach((def, index) => {
                    html += `<p><strong>Definition ${index + 1}:</strong> ${def.definition}</p>`;
                    if (def.example) {
                        html += `<p><em>Example:</em> ${def.example}</p>`;
                    }
                });
                if (meaning.synonyms && meaning.synonyms.length > 0) {
                    html += `<p><strong>Synonyms:</strong> ${meaning.synonyms.join(', ')}</p>`;
                }
            });

            if (entry.sourceUrls && entry.sourceUrls.length > 0) {
                html += `<p><strong>Source:</strong> <a href="${entry.sourceUrls[0]}" target="_blank" rel="noopener">${entry.sourceUrls[0]}</a></p>`;
            }

            results.innerHTML = html;
        }