// The docs pages' only script (transpiled to `docs.js` by build.ts),
// progressive enhancement — every page reads fine without it:
//  - TSX/Rust code pairs become ARIA tabs. The chosen language applies to
//    every group on the page and is remembered across pages.
//  - The separately scrolling nav opens scrolled to the current page.
//  - On phones the nav menu starts collapsed (it renders open for no-JS).
(() => {
    const KEY = "bevy-react-docs-lang";
    const read = () => {
        try {
            return localStorage.getItem(KEY);
        }
        catch {
            return null;
        }
    };
    const write = (lang) => {
        try {
            localStorage.setItem(KEY, lang);
        }
        catch {
            // Storage blocked: the choice just isn't remembered.
        }
    };
    const groups = [];
    function select(lang) {
        for (const { tabs, panels } of groups) {
            if (!tabs.some((t) => t.dataset.lang === lang))
                continue;
            tabs.forEach((tab, i) => {
                const on = tab.dataset.lang === lang;
                tab.setAttribute("aria-selected", String(on));
                tab.tabIndex = on ? 0 : -1;
                panels[i].hidden = !on;
            });
        }
    }
    document.querySelectorAll(".tabs").forEach((group, g) => {
        const panels = [
            ...group.querySelectorAll(":scope > .tab-panel"),
        ];
        const list = document.createElement("div");
        list.setAttribute("role", "tablist");
        list.setAttribute("aria-label", "Code language");
        const tabs = panels.map((panel, i) => {
            const tab = document.createElement("button");
            tab.type = "button";
            tab.id = `tab-${g}-${i}`;
            tab.dataset.lang = panel.dataset.lang;
            tab.textContent = panel.querySelector(".tab-label")?.textContent ?? "";
            tab.setAttribute("role", "tab");
            panel.id = `panel-${g}-${i}`;
            tab.setAttribute("aria-controls", panel.id);
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("aria-labelledby", tab.id);
            panel.tabIndex = 0;
            tab.addEventListener("click", () => {
                const lang = tab.dataset.lang ?? "";
                select(lang);
                write(lang);
            });
            tab.addEventListener("keydown", (e) => {
                const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                if (!step)
                    return;
                e.preventDefault();
                const next = tabs[(i + step + tabs.length) % tabs.length];
                next.focus();
                next.click();
            });
            list.append(tab);
            return tab;
        });
        group.prepend(list);
        group.classList.add("tabs-ready");
        groups.push({ tabs, panels });
    });
    select("tsx");
    const saved = read();
    if (saved)
        select(saved);
    // The nav scrolls on its own: start it with the current page in view.
    const sidebar = document.querySelector(".sidebar");
    const current = sidebar?.querySelector('[aria-current="page"]');
    if (sidebar && current) {
        sidebar.scrollTop = current.offsetTop - sidebar.clientHeight / 2;
    }
    const menu = document.querySelector(".nav-menu");
    const phone = matchMedia("(max-width: 719px)");
    const sync = () => {
        if (menu)
            menu.open = !phone.matches;
    };
    sync();
    phone.addEventListener("change", sync);
})();
