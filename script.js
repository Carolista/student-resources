window.addEventListener('load', () => init());

// TODO: Add ability to filter by new exercises only
// TODO: Display a list of recently visited links, e.g. Document for How to Make the Most of Slack, or Starter Code for Next-Level Loops - maybe?

// TODO: Finish misc. React, Angular, Git exercises and add
// TODO: Create and add some Java content

function init() {
  let difficultyDisplayText = {
    None: 'Filter by difficulty...',
    Basic: 'Total N00b ¯\\_(ツ)_/¯',
    Moderate: 'Tell Me More...',
    Challenging: 'Challenge accepted.',
    'Extra Challenging': 'To Infinity, and Beyond!',
  };

  let selectionBackgroundColor = '#0b5077';
  let selectionColor = 'white';
  let noSelectionBackgroundColor = '#a8d3ec';
  let noSelectionColor = '#4790ba';

  let allCategoryOptions = ['Filter by category...'];
  let allTopicOptions = [];
  let allTechOptions = [];
  let allDifficultyOptions = [
    'None',
    'Basic',
    'Moderate',
    'Challenging',
    'Extra Challenging',
  ];

  let currentCategoryOptions = ['Filter by category...'];
  let currentTopicOptions = ['Filter by topic...'];
  let currentTechOptions = ['Filter by tech...'];
  let currentDifficultyOptions = ['None'];

  let currentCategoryValue;
  let currentTopicValue;
  let currentTechValue;
  let currentDifficultyValue;
  let currentKeywordValue = '';

  let allEntries = [];
  let currentEntries = [];

  let cards = [];

  const categorySelect = document.getElementById('category-select');
  const topicSelect = document.getElementById('topic-select');
  const techSelect = document.getElementById('tech-select');
  const difficultySelect = document.getElementById('difficulty-select');
  const keywordInput = document.getElementById('keyword-input');

  const resultsCount = document.getElementById('results-count');
  const resultsArea = document.getElementById('results-area');

  const sticky = document.getElementById('top-sticky');

  const year = document.getElementById('year');
  year.innerHTML = new Date().getFullYear();

  getEntryData();

  async function getEntryData() {
    const resp = await fetch('data/student-resources.json');
    const data = await resp.json();
    data.forEach(obj => {
      if (!obj.isPending) {
        let newEntry = {
          id: obj.id,
          title: obj.title,
          category: obj.category,
          topic: obj.topic,
          description: obj.description,
          links: obj.links.map(link => ({
            linkType: link.linkType,
            name: link.name,
            link: link.link,
          })),
          tech: obj.tech.sort(),
          requirements: obj.requirements,
          note: obj.note,
          releaseDate: obj.releaseDate,
          updateDate: obj.updateDate,
          difficulty: obj.difficulty,
          image: obj.image,
          isPending: obj.isPending,
        };
        allEntries.push(newEntry);
        if (!allCategoryOptions.includes(obj.category)) {
          allCategoryOptions.push(obj.category);
        }
        if (!allTopicOptions.includes(obj.topic)) {
          allTopicOptions.push(obj.topic);
        }
        obj.tech.forEach(tech => {
          if (!allTechOptions.includes(tech)) {
            allTechOptions.push(tech);
          }
        });
      }
    });
    allTopicOptions.sort();
    allTopicOptions.unshift('Filter by topic...');
    allTechOptions.sort();
    allTechOptions.unshift('Filter by tech...');
    updateResults(true);
    resetSelectOptions();
    populateSelects();
  }

  function createCards() {
    cards = [];
    currentEntries.forEach(entry => {
      let updatedText =
        entry.updateDate &&
        (new Date() - new Date(entry.updateDate)) / (1000 * 60 * 60 * 24) < 90
          ? `<span class="new"> UPDATED!</span>`
          : '';
      let newText =
        updatedText === '' &&
        (new Date() - new Date(entry.releaseDate)) / (1000 * 60 * 60 * 24) < 90
          ? `<span class="new"> NEW!</span>`
          : '';
      let note = entry.note === '' ? '' : `<p class="note">${entry.note}</p>`;
      let linkList =
        entry.links.length === 0
          ? ''
          : `
        <div>
          <p class="resource-subheader">${
            entry.links.length === 1 ? 'Link' : 'Links'
          }</p>
          <div class="resource-list">
            ${entry.links
              .map(
                link =>
                  `<p class="resource-list-item"><a href=${link.link} target="_blank">${link.name}</a></p>`
              )
              .join('')}
          </div>
        </div>
      `;
      let techList =
        entry.tech.length === 0
          ? ''
          : `
        <div>
          <p class="resource-subheader">Tech</p>
          <div class="resource-list">
            ${entry.tech
              .map(techName => `<p class="resource-list-item">${techName}</p>`)
              .join('')}
          </div>
        </div>
      `;
      let releaseDate =
        entry.releaseDate === ''
          ? ''
          : `
        <p class="resource-subheader">Released</p>
        <div class="resource-list">
        <p class="resource-list-item">${entry.releaseDate}</p>
        </div>
      `;
      let updateDate =
        entry.updateDate === ''
          ? ''
          : `
        <p class="resource-subheader">Updated</p>
        <div class="resource-list">
        <p class="resource-list-item">${entry.updateDate}</p>
        </div>
      `;
      let difficulty =
        entry.difficulty === ''
          ? ''
          : `
        <div>
          <p class="resource-subheader">Difficulty</p>
          <div class="resource-list">
            <p class="resource-list-item">${
              difficultyDisplayText[entry.difficulty]
            } (${entry.difficulty})</p>
          </div>
        </div>
      `;
      cards.push(`
        <div id="${entry.id}-card" class="card">
          <div class="content-block">
            <div class="resource-image-container">
              <img class="resource-image" src=${
                './images/entries/' + entry.image
              } />
            </div>
            <div class="content-primary">
              <div class="content-primary-text">
                <div class="small-info">
                  <span>${entry.category}</span> &nbsp;&#124;&nbsp; 
                  <span>${entry.topic}</span>
                </div>
                <p class="content-header">${
                  entry.title
                }${newText}${updatedText}</p>
                <p class="content-desc">${entry.description}</p>
              </div>
            </div>
            <div id="${entry.id}-animated-box" class="content-animated-box">
              <div id="${entry.id}-secondary" class="content-secondary">
                <div class="content-secondary-container">
                  ${note}
                  ${linkList}
                  ${techList}
                  ${releaseDate}
                  ${updateDate}
                  ${difficulty}
                </div>
              </div>
            </div>
            <div id="${entry.id}-click-bar" class="content-click-bar">
              <i id="${
                entry.id
              }-arrow-icon" class="content-arrow nudge-down fa-solid fa-chevron-circle-down"></i>
              <p id="${
                entry.id
              }-subheader" class="content-subheader">View Details</p>
            </div>
          </div>            
        </div>  
      `);
    });
    displayCards();
  }

  function displayCards() {
    resultsArea.innerHTML = '';
    cards.forEach(card => {
      resultsArea.innerHTML += card;
    });
  }

  function getFilteredEntries() {
    return allEntries.filter(entry => {
      return (
        (entry.category === categorySelect.value ||
          categorySelect.value === allCategoryOptions[0]) &&
        (entry.topic === topicSelect.value ||
          topicSelect.value === allTopicOptions[0]) &&
        (entry.tech.includes(techSelect.value) ||
          techSelect.value === allTechOptions[0]) &&
        (entry.difficulty === difficultySelect.value ||
          difficultySelect.value === allDifficultyOptions[0]) &&
        (keywordInput.value === '' || hasKeywordMatch(entry))
      );
    });
  }

  function hasKeywordMatch(entry) {
    let keywords = filterOutStopWords(keywordInput.value.split(' '));
    let hasMatch = false;
    keywords.forEach(keyword => {
      keyword = keyword.toLowerCase();
      if (
        entry.title.toLowerCase().includes(keyword) ||
        entry.topic.toLowerCase().includes(keyword) ||
        entry.description.toLowerCase().includes(keyword) ||
        entry.tech.map(tech => tech.toLowerCase()).includes(keyword)
      ) {
        hasMatch = true;
      }
    });
    return hasMatch;
  }

  function updateResults(isReset = false) {
    currentEntries = isReset ? allEntries : getFilteredEntries();
    let num = currentEntries.length;
    resultsCount.innerHTML = isReset
      ? `Displaying all ${num} results.`
      : `${num} result${num !== 1 ? 's' : ''} found.`;
    createCards();
  }

  function resetSelectOptions() {
    currentCategoryOptions = [...allCategoryOptions];
    currentTopicOptions = [...allTopicOptions];
    currentTechOptions = [...allTechOptions];
    currentDifficultyOptions = [...allDifficultyOptions];
  }

  function filterSelectOptions() {
    currentCategoryOptions = [];
    currentTopicOptions = [];
    currentTechOptions = [];
    currentDifficultyOptions = [];

    let tempDiffOpts = [];

    currentEntries.forEach(entry => {
      if (!currentCategoryOptions.includes(entry.category)) {
        currentCategoryOptions.push(entry.category);
      }
      if (!currentTopicOptions.includes(entry.topic)) {
        currentTopicOptions.push(entry.topic);
      }
      entry.tech.forEach(tech => {
        if (!currentTechOptions.includes(tech)) {
          currentTechOptions.push(tech);
        }
      });
      if (!tempDiffOpts.includes(entry.difficulty)) {
        tempDiffOpts.push(entry.difficulty);
      }
    });

    currentCategoryOptions.unshift('Filter by category...');
    currentTopicOptions.sort();
    currentTopicOptions.unshift('Filter by topic...');
    currentTechOptions.sort();
    currentTechOptions.unshift('Filter by tech...');
    currentDifficultyOptions = allDifficultyOptions.filter(option => {
      return tempDiffOpts.includes(option);
    });
    currentDifficultyOptions.unshift('None');
  }

  function populateSelects() {
    categorySelect.innerHTML = '';
    topicSelect.innerHTML = '';
    techSelect.innerHTML = '';
    difficultySelect.innerHTML = '';
    currentCategoryOptions.forEach((category, i) => {
      categorySelect.innerHTML += `<option id="category-${i}" value="${category}">${category}</option>`;
    });
    currentTopicOptions.forEach((topic, i) => {
      topicSelect.innerHTML += `<option id="topic-${i}" value="${topic}">${topic}</option>`;
    });
    currentTechOptions.forEach((tech, i) => {
      techSelect.innerHTML += `<option id="tech-${i}" value="${tech}">${tech}</option>`;
    });
    currentDifficultyOptions.forEach((difficulty, i) => {
      difficultySelect.innerHTML += `<option id="difficulty-${i}" value="${difficulty}">${difficultyDisplayText[difficulty]}</option>`;
    });
  }

  function updateSelects(isReset = false) {
    isReset ? resetSelectOptions() : filterSelectOptions();
    isReset && (keywordInput.value = '');
    populateSelects();
  }

  function expandContents(id) {
    let subheader = document.getElementById(`${id}-subheader`);
    let arrowIcon = document.getElementById(`${id}-arrow-icon`);
    arrowIcon.style.transform = 'translateY(0px) rotate(180deg)';
    arrowIcon.classList.remove('nudge-down');
    subheader.innerHTML = 'Hide Details';
    setTimeout(() => {
      arrowIcon.classList.add('nudge-up');
    }, 1100);
  }

  function collapseContents(id) {
    let subheader = document.getElementById(`${id}-subheader`);
    let arrowIcon = document.getElementById(`${id}-arrow-icon`);
    arrowIcon.style.transform = 'translateY(0px) rotate(0deg)';
    arrowIcon.classList.remove('nudge-up');
    subheader.innerHTML = 'View Details';
    setTimeout(() => {
      arrowIcon.classList.add('nudge-down');
    }, 1100);
  }

  function toggleDisplay(shouldExpand) {
    let secondaryObjects = document.getElementsByClassName('content-secondary');
    [...secondaryObjects].forEach(secondary => {
      let id = secondary.id.slice(0, secondary.id.indexOf('-'));
      let arrowIcon = document.getElementById(`${id}-arrow-icon`);
      let subheader = document.getElementById(`${id}-subheader`);
      if (shouldExpand && subheader.innerHTML === 'View Details') {
        expandContents(id);
      } else if (!shouldExpand && subheader.innerHTML === 'Hide Details') {
        collapseContents(id);
      }
      arrowIcon.style.transition = `transform 1s`;
      secondary.style.transition = `max-height 1s`;
      shouldExpand
        ? (secondary.style.maxHeight = '1000px')
        : (secondary.style.maxHeight = '0px');
    });
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'expand-button') {
      e.preventDefault();
      toggleDisplay(true);
    } else if (e.target.id === 'collapse-button') {
      e.preventDefault();
      toggleDisplay(false);
    } else if (e.target.id === 'reset-button') {
      e.preventDefault();
      let allSelects = [
        categorySelect,
        topicSelect,
        techSelect,
        difficultySelect,
      ];
      let allOptions = [
        allCategoryOptions,
        allTopicOptions,
        allTechOptions,
        allDifficultyOptions,
      ];
      allSelects.forEach((select, i) => {
        select.value = allOptions[i][0];
        select.style.backgroundColor = noSelectionBackgroundColor;
        select.style.color = noSelectionColor;
      });
      updateResults(true);
      currentKeywordValue = '';
      keywordInput.style.backgroundColor = noSelectionBackgroundColor;
      keywordInput.style.color = noSelectionColor;
      updateSelects(true);
    }
  });

  function updateEverything() {
    currentCategoryValue = categorySelect.value;
    currentTopicValue = topicSelect.value;
    currentTechValue = techSelect.value;
    currentDifficultyValue = difficultySelect.value;
    currentKeywordValue = keywordInput.value;
    updateResults();
    updateSelects();
    categorySelect.value = currentCategoryValue;
    topicSelect.value = currentTopicValue;
    techSelect.value = currentTechValue;
    difficultySelect.value = currentDifficultyValue;
    keywordInput.value = currentKeywordValue;
  }

  document.addEventListener('change', e => {
    if (
      e.target == categorySelect ||
      e.target == topicSelect ||
      e.target == techSelect ||
      e.target == difficultySelect
    ) {
      if (e.target.value.includes('Filter') || e.target.value === 'None') {
        e.target.style.backgroundColor = noSelectionBackgroundColor;
        e.target.style.color = noSelectionColor;
      } else {
        e.target.style.backgroundColor = selectionBackgroundColor;
        e.target.style.color = selectionColor;
      }
      updateEverything();
    }
  });

  document.addEventListener('input', e => {
    if (e.target == keywordInput) {
      if (e.target.value === '') {
        e.target.style.backgroundColor = noSelectionBackgroundColor;
        e.target.style.color = noSelectionColor;
      } else {
        e.target.style.backgroundColor = selectionBackgroundColor;
        e.target.style.color = selectionColor;
      }
      updateEverything();
    }
  });

  // prevent Enter key from refreshing page
  document.addEventListener('submit', e => { 
    e.preventDefault(); 
  });

  // Handle expand and collapse
  document.addEventListener('click', e => {
    if (
      e.target.classList.contains('content-click-bar') ||
      e.target.classList.contains('content-subheader') ||
      e.target.classList.contains('content-arrow')
    ) {
      let id = e.target.id.slice(0, e.target.id.indexOf('-'));
      let arrowIcon = document.getElementById(`${id}-arrow-icon`);
      let subheader = document.getElementById(`${id}-subheader`);
      if (subheader.innerHTML === 'View Details') {
        expandContents(id);
      } else {
        collapseContents(id);
      }
      let secondary = document.getElementById(`${id}-secondary`);
      let maxHeight = 0;
      if (document.getElementById(`${id}-desc`)) {
        let desc = document.getElementById(`${id}-desc`);
        maxHeight = Math.round(desc.innerHTML.length / 3);
      } else {
        maxHeight = 1000;
      }
      let transition =
        maxHeight / 300 > 1 ? 1 : Math.round((maxHeight / 300) * 10) / 10;
      arrowIcon.style.transition = `transform ${transition + 's'}`;
      secondary.style.transition = `max-height ${transition + 's'}`;
      secondary.style.maxHeight === maxHeight + 'px'
        ? (secondary.style.maxHeight = '0px')
        : (secondary.style.maxHeight = maxHeight + 'px');
    }
  });

  // This will correct things if rapid clicking gets the class assignments out of sync
  document.addEventListener('mouseover', e => {
    if (
      e.target.classList.contains('content-click-bar') ||
      e.target.classList.contains('content-subheader') ||
      e.target.classList.contains('content-arrow')
    ) {
      let id = e.target.id.slice(0, e.target.id.indexOf('-'));
      let arrowIcon = document.getElementById(`${id}-arrow-icon`);
      if (arrowIcon.style.transform === 'translateY(0px) rotate(180deg)') {
        expandContents(id);
      } else {
        collapseContents(id);
      }
    }
  });

  window.addEventListener('scroll', function (e) {
    if (
      document.body.scrollTop > 500 ||
      document.documentElement.scrollTop > 500
    ) {
      sticky.style.visibility = 'visible';
    } else {
      sticky.style.visibility = 'hidden';
    }
  });
}

function filterOutStopWords(arr) {
  let stopWords = [
    'a',
    'about',
    'above',
    'actually',
    'after',
    'again',
    'against',
    'all',
    'almost',
    'also',
    'although',
    'always',
    'am',
    'an',
    'and',
    'any',
    'are',
    'as',
    'at',
    'be',
    'became',
    'become',
    'because',
    'been',
    'before',
    'being',
    'below',
    'between',
    'both',
    'but',
    'by',
    'can',
    'could',
    'did',
    'do',
    'does',
    'doing',
    'down',
    'during',
    'each',
    'either',
    'else',
    'few',
    'for',
    'from',
    'further',
    'had',
    'has',
    'have',
    'having',
    'he',
    "he'd",
    "he'll",
    'hence',
    "he's",
    'her',
    'here',
    "here's",
    'hers',
    'herself',
    'him',
    'himself',
    'his',
    'how',
    "how's",
    'I',
    "I'd",
    "I'll",
    "I'm",
    "I've",
    'if',
    'in',
    'into',
    'is',
    'it',
    "it's",
    'its',
    'itself',
    'just',
    "let's",
    'may',
    'maybe',
    'me',
    'might',
    'mine',
    'more',
    'most',
    'must',
    'my',
    'myself',
    'neither',
    'nor',
    'not',
    'of',
    'oh',
    'on',
    'once',
    'only',
    'ok',
    'or',
    'other',
    'ought',
    'our',
    'ours',
    'ourselves',
    'out',
    'over',
    'own',
    'same',
    'she',
    "she'd",
    "she'll",
    "she's",
    'should',
    'so',
    'some',
    'such',
    'than',
    'that',
    "that's",
    'the',
    'their',
    'theirs',
    'them',
    'themselves',
    'then',
    'there',
    "there's",
    'these',
    'they',
    "they'd",
    "they'll",
    "they're",
    "they've",
    'this',
    'those',
    'through',
    'to',
    'too',
    'under',
    'until',
    'up',
    'very',
    'was',
    'we',
    "we'd",
    "we'll",
    "we're",
    "we've",
    'were',
    'what',
    "what's",
    'when',
    'whenever',
    "when's",
    'where',
    'whereas',
    'wherever',
    "where's",
    'whether',
    'which',
    'while',
    'who',
    'whoever',
    "who's",
    'whose',
    'whom',
    'why',
    "why's",
    'will',
    'with',
    'within',
    'would',
    'yes',
    'yet',
    'you',
    "you'd",
    "you'll",
    "you're",
    "you've",
    'your',
    'yours',
    'yourself',
    'yourselves',
  ];
  return arr.filter(keyword => !stopWords.includes(keyword));
}
