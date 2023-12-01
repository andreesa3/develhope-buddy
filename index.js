const tbody = document.querySelector('.tbody');
const prevBtn = document.querySelector('#prev');
const nextBtn = document.querySelector('#next');
const currentPage = document.querySelector('#currentPage');
const totalPages = document.querySelector('#totalPages');

const limitSelect = document.querySelector('#limit');
const sortSelect = document.querySelector('#sort');

// Selezione per tipo (id, userId, title, body)
const orderBySelect = document.querySelector('#orderBy');


const API_URL = 'https://jsonplaceholder.typicode.com/posts';


// Centro dei dati
const state = {
  data: [], // rendering
  _data: [], // cache
  pageInfo: {
    page: 1, // pagina corrente
    limit: 10, // limite di elementi in pagina
    totalCount: 0, // elementi in totale all'interno dell'array
    totalPages: 0, // pagine totali
    hasPrevPage: false,
    hasNextPage: false,
  },
  sortInfo: {
    mode: 'asc',
    orderBy: 'id'
  }
}

// Sort Data
const sortData = (data) => {
  // Verifichiamo se abbiamo settato id o userId
  const isNumber = state.sortInfo.orderBy === 'id' || state.sortInfo.orderBy === 'userId'; // true o false
  // Se si, ordiniamo per numero
  if (isNumber) {

    if (state.sortInfo.mode === 'asc') {
      return data.sort((a, b) => a[state.sortInfo.orderBy] - b[state.sortInfo.orderBy]);
    } else if (state.sortInfo.mode === 'desc') {
      return data.sort((a, b) => b[state.sortInfo.orderBy] - a[state.sortInfo.orderBy]);
    }

  } else {
  // Se no, ordiniamo per stringhe

    if (state.sortInfo.mode === 'asc') {
      return data.sort((a, b) => a[state.sortInfo.orderBy].localeCompare(b[state.sortInfo.orderBy]));
    } else if (state.sortInfo.mode === 'desc') {
      return data.sort((a, b) => b[state.sortInfo.orderBy].localeCompare(a[state.sortInfo.orderBy]));
    }
    
  }
}

// Fetch Data
const fetchData = async () => {
  try {
    const response = await fetch(API_URL, { method: 'GET' });
    state._data = sortData(await response.json());
  } catch (error) {
    console.log(error);
  }
}


// Aggiorna lo stato dei pulsanti
const updateBtnUI = () => {

  if (state.pageInfo.hasPrevPage) {
    prevBtn.removeAttribute('disabled');
  } else {
    prevBtn.setAttribute('disabled', true);
  }

  if (state.pageInfo.hasNextPage) {
    nextBtn.removeAttribute('disabled');
  } else {
    nextBtn.setAttribute('disabled', true);
  }

  currentPage.innerHTML = state.pageInfo.page;
  totalPages.innerHTML = state.pageInfo.totalPages;
}

// Impaginazione dati
const paginateData = () => {
  const startIndex = state.pageInfo.limit * (state.pageInfo.page - 1);

  state.data = [...state._data].splice(startIndex, state.pageInfo.limit);

  state.pageInfo.totalCount = state._data.length;

  state.pageInfo.totalPages = Math.ceil(state.pageInfo.totalCount / state.pageInfo.limit);

  state.pageInfo.hasPrevPage = state.pageInfo.page > 1; // false // true

  state.pageInfo.hasNextPage = state.pageInfo.page < state.pageInfo.totalPages;

  updateBtnUI();

  renderData();
}


// Funzione di rendering
const renderData = () => {
  const HTML = state.data.map(item => {
    return `
      <tr>
        <td>${item.id}</td>
        <td>${item.userId}</td>
        <td>${item.title}</td>
        <td>${item.body}</td>
      </tr>
    `
  }).join('');

  tbody.innerHTML = HTML;
}

const setEventListener = () => {
  prevBtn.addEventListener('click', () => {
    if (state.pageInfo.page > 1) {
      state.pageInfo.page -= 1;
      paginateData();
    }
  })

  nextBtn.addEventListener('click', () => {
    if (state.pageInfo.page < state.pageInfo.totalPages) {
      state.pageInfo.page += 1;
      paginateData();
    }
  })

  limitSelect.addEventListener('change', (e) => {
    state.pageInfo.limit = Number(e.target.value);
    state.pageInfo.page = 1;
    paginateData();
  })

  sortSelect.addEventListener('change', (e) => {
    state.sortInfo.mode = e.target.value;
    state._data = sortData(state._data);
    state.pageInfo.page = 1;
    paginateData();
  })

  // Ordina per (id, userId, title, body)
  orderBySelect.addEventListener('change', (e) => {
    state.sortInfo.orderBy = e.target.value;
    state._data = sortData(state._data);
    state.pageInfo.page = 1;
    paginateData();
  })
}

const init = async () => {
  await fetchData();
  paginateData();
  setEventListener();
}

init();