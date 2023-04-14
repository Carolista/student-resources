window.addEventListener('load', () => init());

function init() {
  // TODO: perhaps organize results under section headers and categories like they are on Google docs - only present if relevant
  // maybe a sorting algorithm

  // TODO: Add ability to sort by newest added? (Might not work well with masonry layout)

  // TODO: Display a list of recently visited links, e.g. Document for How to Make the Most of Slack, or Starter Code for Next-Level Loops - maybe?

  // TODO: Consider multi-select for category and tech

  // FIXME: Images aren't loading fast enough on GitHub deployment - resize even smaller

  // FIXME: keyword field for form search is not working - also needs to handle spaces and partial matches

  // TODO: Add a suggestion box

  let categoryOptions = ['--Select Category--'];
  let topicOptions = ['--Select Topic--'];
  let techOptions = ['--Select Tech--'];
  let difficultyOptions = ['--Select Difficulty--'];

  let allEntries = [];
  let currentEntries = [];

  let currentCategory = '';
  let currentTopic = '';
  let currentTech = '';
  let currentDifficulty = '';

  let cards = [];

  // const searchTerm = document.querySelector("#search-term");
  const categorySelect = document.getElementById('category-select');
  const topicSelect = document.getElementById('topic-select');
  const techSelect = document.getElementById('tech-select');
  const difficultySelect = document.getElementById('difficulty-select');
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
        tech: obj.tech,
        requirements: obj.requirements,
        note: obj.note,
        releaseDate: obj.releaseDate,
        difficulty: obj.difficulty,
        image: obj.image,
        isPending: obj.isPending,
      };
      allEntries.push(newEntry);
      if (!categoryOptions.includes(obj.category)) {
        categoryOptions.push(obj.category);
      }
      if (!topicOptions.includes(obj.topic)) {
        topicOptions.push(obj.topic);
      }
      for (let j = 0; j < obj.tech.length; j++) {
        if (!techOptions.includes(obj.tech[j])) {
          techOptions.push(obj.tech[j]);
        }
      }
      if (
        !difficultyOptions.includes(obj.difficulty) &&
        obj.difficulty !== ''
      ) {
        difficultyOptions.push(obj.difficulty);
      }
    });
    populateSelects();
    updateResults(true);
  }

  function populateSelects() {
    categoryOptions.forEach((category, i) => {
      categorySelect.innerHTML += `<option id="category-${i}">${category}`;
    });
    topicOptions.forEach((topic, i) => {
      topicSelect.innerHTML += `<option id="topic-${i}">${topic}`;
    });
    techOptions.forEach((tech, i) => {
      techSelect.innerHTML += `<option id="tech-${i}">${tech}`;
    });
    difficultyOptions.forEach((difficulty, i) => {
      difficultySelect.innerHTML += `<option id="difficulty-${i}">${difficulty}`;
    });
  }

  function createCards() {
    cards = [];
    currentEntries.forEach(entry => {
      let newText =
        (new Date() - new Date(entry.releaseDate)) / (1000 * 60 * 60 * 24) < 42
          ? `<span class="new"> NEW!</span>`
          : '';
      let linkList = `
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
      let techList = `
        <div>
          <p class="resource-subheader">Tech</p>
          <div class="resource-list">
            ${entry.tech
              .map(techName => `<p class="resource-list-item">${techName}</p>`)
              .join('')}
          </div>
        </div>
      `;
      let difficulty = `
        <div>
          <p class="resource-subheader">Difficulty</p>
          <div class="resource-list">
            <p class="resource-list-item">${entry.difficulty}</p>
          </div>
        </div>
      `;
      cards.push(`
        <div id="${entry.id}-card" class="card">
          <div class="content-block">
            <div class="resource-image-container">
              <img class="resource-image" src=${'./images/' + entry.image} />
            </div>
            <div class="content-primary">
              <div class="content-primary-text">
                <div class="small-info">
                  <span>${entry.category}</span> &nbsp;&#124;&nbsp; 
                  <span>${entry.topic}</span>
                </div>
                <p class="content-header">${entry.title}${newText}</p>
                <p class="content-desc">${entry.description}</p>
              </div>
            </div>
            <div id="${entry.id}-animated-box" class="content-animated-box">
            <div id="${entry.id}-secondary" class="content-secondary">
              <div class="content-secondary-container">
                ${entry.note === '' ? '' : `<p class="note">${entry.note}</p>`}
                
                ${entry.links.length > 0 ? linkList : ''}
                ${entry.tech.length > 0 ? techList : ''}
                <p class="resource-subheader">Release Date</p>
                <div class="resource-list">
                  <p class="resource-list-item">${entry.releaseDate}</p>
                </div>
                ${entry.difficulty === '' ? '' : difficulty}
                </div>
              </div>
            </div>
            <div id="${entry.id}-click-bar" class="content-click-bar">
              <i id="${
                entry.id
              }-arrow-icon" class="content-arrow nudge-down fas fa-chevron-circle-down"></i>
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

  function setCurrentFilterValues() {
    currentCategory = categorySelect.value;
    currentTopic = topicSelect.value;
    currentTech = techSelect.value;
    currentDifficulty = difficultySelect.value;
  }

  function getFilteredEntries() {
    return allEntries.filter(entry => {
      return (
        (entry.category === currentCategory ||
          currentCategory === categoryOptions[0]) &&
        (entry.topic === currentTopic || currentTopic === topicOptions[0]) &&
        (entry.tech.includes(currentTech) || currentTech === techOptions[0]) &&
        (entry.difficulty === currentDifficulty ||
          currentDifficulty === difficultyOptions[0])
      );
    });
  }

  function updateResults(isReset = false) {
    setCurrentFilterValues();
    currentEntries = isReset ? allEntries : getFilteredEntries();
    let num = currentEntries.length;
    resultsCount.innerHTML = isReset
      ? `Displaying all ${num} results.`
      : `${num} result${num !== 1 ? 's' : ''} found.`;
    createCards();
  }

  function toggleDisplay(shouldExpand) {
    let secondaryObjects = document.getElementsByClassName('content-secondary');
    [...secondaryObjects].forEach(secondary => {
      let id = secondary.id.slice(0, secondary.id.indexOf('-'));
      let arrowIcon = document.getElementById(`${id}-arrow-icon`);
      if (shouldExpand && arrowIcon.classList.contains('nudge-down')) {
        arrowIcon.style.transform = 'translateY(0px) rotate(180deg)';
        arrowIcon.classList.remove('nudge-down');
        setTimeout(() => {
          arrowIcon.classList.add('nudge-up');
        }, 1100);
      } else if (!shouldExpand && arrowIcon.classList.contains('nudge-up')) {
        arrowIcon.style.transform = 'translateY(0px) rotate(0deg)';
        arrowIcon.classList.remove('nudge-up');
        setTimeout(() => {
          arrowIcon.classList.add('nudge-down');
        }, 1100);
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
      categorySelect.value = categoryOptions[0];
      topicSelect.value = topicOptions[0];
      techSelect.value = techOptions[0];
      difficultySelect.value = difficultyOptions[0];
      updateResults(true);
    }
  });

  document.addEventListener('change', e => {
    if (
      e.target == categorySelect ||
      e.target == topicSelect ||
      e.target == techSelect ||
      e.target == difficultySelect
    ) {
      updateResults();
    }
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
      if (arrowIcon.style.transform === 'translateY(0px) rotate(180deg)') {
        arrowIcon.style.transform = 'translateY(0px) rotate(0deg)';
        arrowIcon.classList.remove('nudge-up');
        setTimeout(() => {
          subheader.innerHTML = 'View Details';
          arrowIcon.classList.add('nudge-down');
        }, 500);
      } else {
        arrowIcon.style.transform = 'translateY(0px) rotate(180deg)';
        arrowIcon.classList.remove('nudge-down');
        setTimeout(() => {
          subheader.innerHTML = 'Hide Details';
          arrowIcon.classList.add('nudge-up');
        }, 500);
      }
      let secondary = document.getElementById(`${id}-secondary`);
      let maxHeight = 0;
      if (document.getElementById(`${id}-desc`)) {
        let desc = document.getElementById(`${id}-desc`);
        maxHeight = Math.round(desc.innerHTML.length / 3);
      } else {
        maxHeight = 1000; // for student resources page
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
        arrowIcon.classList.remove('nudge-down');
        arrowIcon.classList.add('nudge-up');
      } else {
        arrowIcon.classList.remove('nudge-up');
        arrowIcon.classList.add('nudge-down');
      }
    }
  });

  window.addEventListener('scroll', function (e) {
    if (
      document.body.scrollTop > 600 ||
      document.documentElement.scrollTop > 600
    ) {
      sticky.style.visibility = 'visible';
    } else {
      sticky.style.visibility = 'hidden';
    }
  });
}
