// ДАННЫЕ ГАЛЕРЕИ
const photos = [
    {
        id: 1,
        title: "Закат над морем",
        category: "nature",
        tags: ["sea", "sunset"],
        src: "imgs/jimg1.jpeg"
    },
    {
        id: 2,
        title: "Город ночью",
        category: "city",
        tags: ["night", "street", "long-exposure"],
        src: "imgs/jimg2.jpeg"
    },
    {
        id: 3,
        title: "Горное озеро",
        category: "nature",
        tags: ["mountains", "lake"],
        src: "imgs/jimg3.jpeg"
    },
    {
        id: 4,
        title: "Уличный портрет",
        category: "people",
        tags: ["portrait", "street"],
        src: "imgs/jimg4.jpeg"
    },
    {
        id: 5,
        title: "Минимализм в архитектуре",
        category: "abstract",
        tags: ["architecture", "minimalism"],
        src: "imgs/jimg5.jpeg"
    },
    {
        id: 6,
        title: "Ночной дождь в мегаполисе",
        category: "city",
        tags: ["night", "street"],
        src: "imgs/jimg6.jpeg"
    },
    {
        id: 7,
        title: "Тропический пляж",
        category: "nature",
        tags: ["sea"],
        src: "imgs/jimg7.jpeg"
    },
    {
        id: 8,
        title: "Силуэт в закате",
        category: "people",
        tags: ["portrait", "sunset"],
        src: "imgs/jimg9.jpeg"
    }
];

// СОСТОЯНИЕ ФИЛЬТРОВ
const state = {
    category: "all",
    tags: new Set(),
    search: ""
};

// DOM-элементы
const galleryGrid = document.getElementById("gallery-grid");
const photoCountEl = document.getElementById("photo-count");
const categoryFiltersEl = document.getElementById("category-filters");
const tagFiltersEl = document.getElementById("tag-filters");
const searchInput = document.getElementById("search-input");

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    restoreStateFromUrl();
    initFilterControls();
    render();
    setCurrentYear();

    initEmailJS();
    initContactForm();
});

// ---------------- СИНХРОНИЗАЦИЯ С URL ----------------

function restoreStateFromUrl() {
    const params = new URLSearchParams(window.location.search);

    const urlCategory = params.get("category");
    if (urlCategory) {
        state.category = urlCategory;
        // Подсветим соответствующую кнопку
        updateCategoryActive(urlCategory);
    }

    const urlTags = params.get("tags");
    if (urlTags) {
        urlTags.split(",").forEach((tag) => {
            if (tag.trim()) {
                state.tags.add(tag.trim());
            }
        });
    }

    const urlSearch = params.get("search");
    if (urlSearch) {
        state.search = urlSearch;
        if (searchInput) {
            searchInput.value = urlSearch;
        }
    }

    updateTagChipsActive();
}

function updateUrlFromState() {
    const params = new URLSearchParams();

    if (state.category && state.category !== "all") {
        params.set("category", state.category);
    }
    if (state.tags.size > 0) {
        params.set("tags", Array.from(state.tags).join(","));
    }
    if (state.search.trim() !== "") {
        params.set("search", state.search.trim());
    }

    const newUrl =
        window.location.pathname + (params.toString() ? "?" + params.toString() : "");

    // history.replaceState – чтобы не плодить историю "назад"
    window.history.replaceState({}, "", newUrl);
}

// ---------------- ФИЛЬТРАЦИЯ ----------------

function getFilteredPhotos() {
    return photos.filter((photo) => {
        // Категория
        if (state.category !== "all" && photo.category !== state.category) {
            return false;
        }

        // Теги
        if (state.tags.size > 0) {
            const hasAllTags = Array.from(state.tags).every((tag) =>
                photo.tags.includes(tag)
            );
            if (!hasAllTags) return false;
        }

        // Поиск по названию
        if (state.search.trim() !== "") {
            const query = state.search.trim().toLowerCase();
            if (!photo.title.toLowerCase().includes(query)) {
                return false;
            }
        }

        return true;
    });
}

// ---------------- РЕНДЕРИНГ ----------------

function render() {
    const filtered = getFilteredPhotos();

    // Обновляем счётчик
    if (photoCountEl) {
        photoCountEl.textContent = String(filtered.length);
    }

    // Очищаем сетку
    galleryGrid.innerHTML = "";

    if (filtered.length === 0) {
        const empty = document.createElement("p");
        empty.className = "section-subtitle";
        empty.textContent = "По выбранным фильтрам ничего не найдено.";
        galleryGrid.appendChild(empty);
        return;
    }

    // Рисуем карточки
    filtered.forEach((photo) => {
        const card = document.createElement("article");
        card.className = "photo-card";

        const thumb = document.createElement("div");
        thumb.className = "photo-thumb";
        thumb.style.backgroundImage = `url("${photo.src}")`;

        const label = document.createElement("div");
        label.className = "photo-label";
        label.textContent = getCategoryLabel(photo.category);
        thumb.appendChild(label);

        const body = document.createElement("div");
        body.className = "photo-body";

        const title = document.createElement("h3");
        title.className = "photo-title";
        title.textContent = photo.title;

        const tagsContainer = document.createElement("div");
        tagsContainer.className = "photo-tags";
        photo.tags.forEach((tag) => {
            const span = document.createElement("span");
            span.className = "photo-tag";
            span.textContent = "#" + tag;
            tagsContainer.appendChild(span);
        });

        body.appendChild(title);
        body.appendChild(tagsContainer);

        card.appendChild(thumb);
        card.appendChild(body);

        galleryGrid.appendChild(card);
    });
}

function getCategoryLabel(category) {
    switch (category) {
        case "nature":
            return "Природа";
        case "city":
            return "Город";
        case "people":
            return "Люди";
        case "abstract":
            return "Абстракция";
        default:
            return "Разное";
    }
}

// ---------------- ОБРАБОТЧИКИ ФИЛЬТРОВ ----------------

function initFilterControls() {
    // Категории
    if (categoryFiltersEl) {
        categoryFiltersEl.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-category]");
            if (!btn) return;

            const category = btn.getAttribute("data-category");
            if (!category) return;

            state.category = category;
            updateCategoryActive(category);
            updateUrlFromState();
            render();
        });
    }

    // Теги
    if (tagFiltersEl) {
        tagFiltersEl.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-tag]");
            if (!btn) return;

            const tag = btn.getAttribute("data-tag");
            if (!tag) return;

            if (state.tags.has(tag)) {
                state.tags.delete(tag);
            } else {
                state.tags.add(tag);
            }

            updateTagChipsActive();
            updateUrlFromState();
            render();
        });
    }

    // Поиск (+ простой debounce)
    if (searchInput) {
        let timeoutId = null;

        searchInput.addEventListener("input", () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                state.search = searchInput.value;
                updateUrlFromState();
                render();
            }, 250); // 250 мс debounce
        });
    }
}

function updateCategoryActive(activeCategory) {
    const buttons = categoryFiltersEl?.querySelectorAll("button[data-category]") || [];
    buttons.forEach((btn) => {
        const cat = btn.getAttribute("data-category");
        if (cat === activeCategory) {
            btn.classList.add("chip--active");
        } else {
            btn.classList.remove("chip--active");
        }
    });
}

function updateTagChipsActive() {
    const buttons = tagFiltersEl?.querySelectorAll("button[data-tag]") || [];
    buttons.forEach((btn) => {
        const tag = btn.getAttribute("data-tag");
        if (tag && state.tags.has(tag)) {
            btn.classList.add("chip--active");
        } else {
            btn.classList.remove("chip--active");
        }
    });
}

// ---------------- ПРОЧЕЕ ----------------

function setCurrentYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
}

// ---------------- ОБРАТНАЯ СВЯЗЬ (EmailJS) ----------------

function initEmailJS() {
    if (!window.emailjs) {
        console.error("EmailJS SDK не загрузился");
        return;
    }

    emailjs.init({
        publicKey: "0_VSLzOFvfN1JBnFA",
    });
}

function initContactForm() {
    const form = document.getElementById("contact-form");
    const statusEl = document.getElementById("status-message");

    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // если SDK не подгрузился — показываем понятную ошибку
        if (!window.emailjs) {
            if (statusEl) {
                statusEl.textContent =
                    "Сервис отправки сейчас недоступен. Попробуйте позже.";
                statusEl.className = "contact-status contact-status--error";
            }
            console.error("emailjs не найден на window");
            return;
        }

        if (statusEl) {
            statusEl.textContent = "Отправляем сообщение...";
            statusEl.className = "contact-status";
        }

        const serviceID = "service_qgydrgz";
        const templateID = "template_i2upqeu";

        emailjs.sendForm(serviceID, templateID, form).then(
            function () {
                if (statusEl) {
                    statusEl.textContent = "Сообщение отправлено успешно!";
                    statusEl.classList.add("contact-status--success");
                }
                form.reset();
            },
            function (error) {
                if (statusEl) {
                    statusEl.textContent =
                        "Ошибка при отправке: " + (error?.text || "неизвестная ошибка");
                    statusEl.classList.add("contact-status--error");
                }
                console.error("EmailJS error:", error);
            }
        );
    });
}




