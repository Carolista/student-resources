window.addEventListener('load', () => init());

function init() {
  // TODO: Dynamically adjust select options based on overlap (e.g., graded assignment prep vs topical)
  // TODO: Add ability to filter by new exercises only
  // TODO: Add search feature - handle spaces and partial matches
  // TODO: Add a suggestion box
  // TODO: Display a list of recently visited links, e.g. Document for How to Make the Most of Slack, or Starter Code for Next-Level Loops - maybe?

  // TODO: Decide how to sort results before displaying on page and implement

  // FIXME: Images aren't loading fast enough on GitHub deployment - resize even smaller

  let categoryOptions = ['--Select Category--'];
  let topicOptions = ['--Select Topic--'];
  let techOptions = ['--Select Tech--'];
  let difficultyOptions = ['--Select Difficulty--'];

  let allEntries = [];
  let currentEntries = [];

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
          tech: obj.tech,
          requirements: obj.requirements,
          note: obj.note,
          releaseDate: obj.releaseDate,
          updateDate: obj.updateDate,
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
        obj.tech.forEach(tech => {
          if (!techOptions.includes(tech)) {
            techOptions.push(tech);
          }
        });
        if (
          obj.difficulty && !difficultyOptions.includes(obj.difficulty)
        ) {
          difficultyOptions.push(obj.difficulty);
        }
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
            <p class="resource-list-item">${entry.difficulty}</p>
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

  function getFilteredEntries() {
    return allEntries.filter(entry => {
      return (
        (entry.category === categorySelect.value ||
          categorySelect.value === categoryOptions[0]) &&
        (entry.topic === topicSelect.value ||
          topicSelect.value === topicOptions[0]) &&
        (entry.tech.includes(techSelect.value) ||
          techSelect.value === techOptions[0]) &&
        (entry.difficulty === difficultySelect.value ||
          difficultySelect.value === difficultyOptions[0])
      );
    });
  }

  function updateResults(isReset = false) {
    currentEntries = isReset ? allEntries : getFilteredEntries();
    let num = currentEntries.length;
    resultsCount.innerHTML = isReset
      ? `Displaying all ${num} results.`
      : `${num} result${num !== 1 ? 's' : ''} found.`;
    createCards();
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
      document.body.scrollTop > 600 ||
      document.documentElement.scrollTop > 600
    ) {
      sticky.style.visibility = 'visible';
    } else {
      sticky.style.visibility = 'hidden';
    }
  });
}
