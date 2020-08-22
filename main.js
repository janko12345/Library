/* cnt or cnts shortcuts means container or containers */
class Book {
    static array = [];
    constructor(title, author, pages, read) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.read = read;
        Book.array.push(this);
    }
    info() {
        return `title: ${this.title} \nauthor: ${this.author} \npages: ${this.pages} \nread: ${this.read ? "yes" : "no"}`;
    }
    static spliceArray(book) {
        this.array.splice(this.array.findIndex(book2 => book2 === book), 1);
    }
}

const getObjElement = (function () {

    // generic stuff
    const carets = document.querySelectorAll("[data-caret]");
    const searchOptsCnt = document.querySelector("#search-options");
    const searchOptions = searchOptsCnt.querySelectorAll("li");
    const booksCnt = document.querySelector("#books-cnt");


    // input conainers
    const mainSearchCnt = document.querySelector("#search-cnt");
    const searchCnts = document.querySelectorAll("[data-search-active]");


    // forms
    const mainForm = document.querySelector("#add-book-form");

    // inputs
    const addBookTextInputs = mainForm.querySelectorAll("[data-add-inp]");

    //buttons
    const showFormBtn = document.querySelector("#add-book-btn");
    const addBookBtn = mainForm.querySelector("#add-book-add-btn");
    const checkboxInp = mainForm.querySelector("#book-check-inp");

    //templates
    const bookTemplate = document.querySelector("#book-template");
    return {
        mainSearchCnt, searchOptions, searchCnts, searchOptsCnt, carets, booksCnt,
        addBookTextInputs, checkboxInp,// inputs
        showFormBtn, addBookBtn,// buttons
        mainForm,// forms
        bookTemplate, //book templates
    }
})();


const AnimateDOM = (function () {

    function hideBook(book) {
        book.classList.add("book-scale-down");
    }
    function showBook(book) {
        book.classList.remove("book-scale-down");
    }
    function showBookContent(book, timeout) {
        setTimeout(() => {
            book.querySelector("[data-content]").classList.add("book-scale-up");
            book.querySelectorAll("[data-animate=true]").forEach(bookInfo => {
                bookInfo.classList.add("text-arrive");
            })
        }, timeout);
    }
    return {
        showBookContent,
        hideBook,
        showBook,
    }
})();


const SearchBook = (function () {
    const searchCnts = getObjElement.searchCnts;
    const searchOptions = getObjElement.searchOptions;
    const searchOptsCnt = getObjElement.searchOptsCnt;
    const mainSearchCnt = getObjElement.mainSearchCnt;
    const booksCnt = getObjElement.booksCnt;


    // events binding
    searchCnts.forEach(searchCnt => {
        if (searchCnt.id != "search-pages") // searching by pages asks for a bit different logic
            searchCnt.addEventListener("keyup", searchText.bind(this, searchCnt));
        else
            searchCnt.addEventListener("keyup", searchPages.bind(this, searchCnt))

    })
    searchCnts.forEach(searchCnt => {
        searchCnt.addEventListener("click", hideSearchOptions)
    })
    mainSearchCnt.addEventListener("click", e => {
        if (e.target.hasAttribute("data-caret"))
            showHideSearchOptions();

    });
    searchOptions.forEach(searchOption => {
        searchOption.addEventListener("click", showHideSearchOptions);
        searchOption.addEventListener("click", changeSearch.bind(this, searchOption))
    });


    // functions
    function showHideSearchOptions() {
        searchOptsCnt.classList.toggle("search-scale-up");
    }
    function hideSearchOptions() {
        searchOptsCnt.classList.remove("search-scale-up");
    }
    function changeSearch(searchOption) {

        let searchToHide = mainSearchCnt.querySelector(`[${searchOption.getAttribute("data-hide")}]`);
        searchToHide.classList.add("hide");
        searchToHide.setAttribute("data-search-active", "false");

        let searchToShow = mainSearchCnt.querySelector(`#${searchOption.getAttribute("data-show")}`)
        searchToShow.classList.remove("hide");
        searchToShow.setAttribute("data-search-active", "true");

    }
    function searchText(searchCnt) {
        booksCnt.querySelectorAll(`[${searchCnt.getAttribute("data-search")}]`).forEach(searchedElement => {
            let book = searchedElement.closest("[data-book]");
            if (searchedElement.textContent.toLowerCase().indexOf(searchCnt.querySelector("input").value) === -1)
                AnimateDOM.hideBook(book);
            else
                AnimateDOM.showBook(book);
        });
    }
    function searchPages(searchCnt) {
        document.querySelectorAll(`[${searchCnt.getAttribute("data-search")}]`).forEach(searchedElement => {
            let book = searchedElement.closest("[data-book]");
            if (parseInt(searchedElement.textContent) < parseInt(searchCnt.querySelector("input").value))
                AnimateDOM.hideBook(book);
            else
                AnimateDOM.showBook(book);
        });
    }


})();

const CloneDOM = (function () {

    const book = getObjElement.bookTemplate.querySelector("[data-book]");

    function createBook(title, author, pages, read, index) {
        const newBook = book.cloneNode(true);
        newBook.querySelector("[data-title]").textContent = title;
        newBook.querySelector("[data-author]").textContent = author;
        newBook.querySelector("[data-pages]").textContent = pages;
        newBook.setAttribute("data-index", index);
        const readStatus = newBook.querySelector("[data-read-status]")
        const readMark = readStatus.querySelector("[data-read-mark]");

        // we need logic just to check for when it is read, so we could apply appropriate changes to the DOM,
        // because it is by default styled as not-read
        if (read)
            readStatus.classList.add("yes-read");

        return newBook;
    }
    return {
        createBook,
    }
})();

const AddBook = (function () {

    // caching DOM
    const form = getObjElement.mainForm;
    const showFormBtn = getObjElement.showFormBtn;
    const addBookBtn = getObjElement.addBookBtn;
    const textInputs = getObjElement.addBookTextInputs;
    const checkInp = getObjElement.checkboxInp;
    const booksCnt = getObjElement.booksCnt;


    // binding events
    showFormBtn.addEventListener("click", toggleForm);
    showFormBtn.addEventListener("click", resetForm);
    addBookBtn.addEventListener("click", renderBook);

    //functions
    function toggleForm() {
        form.classList.toggle("form-scale-up");
    }
    function resetForm() {
        form.reset();
    }
    function renderBook(book, index, timeout = 0) {
        let book1;
        if (book instanceof Event) {
            book.preventDefault();
            book1 = createBook();
        }
        else
            book1 = book;

        if (!book1)
            return;
        const newBook = CloneDOM.createBook(book1.title, book1.author, book1.pages, book1.read, index === undefined ? Book.array.length - 1 : index);
        booksCnt.appendChild(newBook);
        AnimateDOM.showBookContent(newBook, timeout);
        if (book instanceof Event)
            toggleForm();
    }
    function createBook() {
        if (!inputsValidation())
            return;

        [title, author, pages] = [...textInputs].map(input => input.value);
        let read = checkInp.checked;

        let book = new Book(title, author, pages, read);
        updateLocalStorage();
        return book;
    }
    function updateLocalStorage() {
        localStorage.setItem("books", JSON.stringify(Book.array));
    }
    function inputsValidation() {
        if ([...textInputs].some(input => !input.value)) {
            alert("all inputs have to be filled out");
            return false;
        }
        return true;
    }
    return {
        renderBook,
        updateLocalStorage,
    }
})();
const BookControls = (function () {

    // elements
    const allBooksCnt = getObjElement.booksCnt;

    // binding events
    allBooksCnt.addEventListener("click", deleteBook);
    allBooksCnt.addEventListener("click", changeReadStatus);

    //functions
    function deleteBook(e) {
        if (!e.target.hasAttribute("data-delete"))
            return;

        let book = e.target.closest("[data-book]");


        // data removing
        Book.array.splice(parseInt(book.getAttribute("data-index")), 1);
        AddBook.updateLocalStorage();

        // DOM removing
        AnimateDOM.hideBook(book);
        setTimeout(() => {
            book.remove();
            updateIndexes();
        }, parseFloat(getComputedStyle(book).transitionDuration) * 1000);



    }

    function changeReadStatus(e) {
        if (e.target.hasAttribute("data-read-status")) {
            if (e.target.tagName === "SPAN")
                e.target.parentElement.classList.toggle("yes-read");
            else
                e.target.classList.toggle("yes-read");

            // saving the data
            let dataBook = Book.array[e.target.closest("[data-book]").dataset.index];
            dataBook.read = !dataBook.read;
            AddBook.updateLocalStorage();
        }

    }
    function updateIndexes() {
        allBooksCnt.querySelectorAll("[data-book]").forEach((book, index) => {
            console.log(index);
            book.setAttribute("data-index", `${index}`);
        })

    }
})();

(function InitialRender() {
    Book.array = JSON.parse(localStorage.getItem("books"));
    if (!Book.array) {
        Book.array = [];
        return;
    }
    let length = Book.array.length;
    let timeoutBooster = length > 15 ? 15 : length;
    Book.array.forEach((book, index) => {
        AddBook.renderBook(book, index, index * 1000 / timeoutBooster);
    });
})();