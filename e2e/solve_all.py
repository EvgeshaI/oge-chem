"""Решает каждое задание через интерфейс по ключу ответов и ждёт «Верно».
Затем отвечает неверно и проверяет, что сайт это замечает."""
import json, re, sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4173"
C = json.load(open("/tmp/content.json"))
errors, failed = [], []

def first(a): return a[0] if isinstance(a, list) else a

def pick(pg, combo, value):
    """Выбор значения в собственном выпадающем списке (role=combobox → role=option)"""
    combo.click()
    pg.get_by_role("option", name=value, exact=True).click()

def fill_fields(pg, card, task):
    """Возвращает список (локатор, значение) в порядке полей задачи"""
    t = task["type"]
    controls = card.locator("[role=combobox], input[type=text], input:not([type])")
    vals = []
    if t == "fill":
        vals = [first(a) for a in task["answers"]]
    elif t == "classify":
        vals = [i["answer"] for i in task["items"]]
    elif t == "cells":
        vals = [first(c["a"]) for r in task["rows"] for c in r if not isinstance(c, str)]
    elif t == "models":
        for m in task["models"]:
            vals += [str(m["elements"]), str(m["substances"]), m["kind"], m["formulas"]]
    elif t == "schemes":
        for s in task["schemes"]:
            if s.get("element"): vals.append(s["element"])
            vals.append(str(s["charge"]))
            if not s.get("given"): vals += [str(x) for x in s["shells"]]
            vals += [str(s["outer"]), s["kind"]]
    n = controls.count()
    assert n == len(vals), f"{task['id']}: полей в UI {n}, в ключе {len(vals)}"
    for i, v in enumerate(vals):
        el = controls.nth(i)
        if el.get_attribute("role") == "combobox": pick(pg, el, v)
        else: el.fill(v)

def answer(pg, card, task):
    t = task["type"]
    if t == "digits":
        for d in task["answer"]: card.get_by_role("checkbox").nth(int(d) - 1).click()
    elif t == "single":
        card.get_by_role("radio").nth(task["answer"] - 1).click()
    elif t == "match":
        for i, d in enumerate(task["answer"]): pick(pg, card.get_by_role("combobox").nth(i), d)
    elif t == "open":
        card.locator("textarea").fill("решение")
    else:
        fill_fields(pg, card, task)

def run_topic(pg, tid):
    topic = C[tid]
    # ---- практика: по одной карточке
    pg.goto(f"{BASE}/topic/{tid}?tab=practice")
    pg.wait_for_selector("article")
    cards = pg.locator("article")
    assert cards.count() == len(topic["practice"]), (tid, cards.count())
    for i, task in enumerate(topic["practice"]):
        card = cards.nth(i)
        try:
            answer(pg, card, task)
            card.get_by_role("button", name="Проверить").click()
            ok = card.locator("text=Верно").first
            ok.wait_for(timeout=3000)
            txt = card.inner_text()
            if "Неверно" in txt or re.search(r"Верно \d+ из", txt):
                failed.append((task["id"], "после верных ответов есть ошибка"))
        except Exception as e:
            failed.append((task["id"], str(e)[:200]))
    # ---- варианты ОГЭ
    for v in topic["exam"]:
        pg.goto(f"{BASE}/topic/{tid}?tab=exam")
        pg.get_by_role("tab", name=v["title"]).click()
        pg.wait_for_selector("article")
        cards = pg.locator("article")
        assert cards.count() == len(v["tasks"]), (tid, v["id"])
        for i, task in enumerate(v["tasks"]):
            try: answer(pg, cards.nth(i), task)
            except Exception as e: failed.append((task["id"], str(e)[:200]))
        pg.get_by_role("button", name="Завершить и проверить").click()
        mx = len(v["tasks"])
        try: pg.wait_for_selector(f"text={mx} из {mx}", timeout=4000)
        except Exception:
            failed.append((f"{tid}.{v['id']}", "итог не " + f"{mx} из {mx}: " + pg.locator("text=/\\d+ из \\d+/").first.inner_text()))

def negative(pg):
    """Неверные ответы должны быть замечены"""
    pg.goto(f"{BASE}/topic/concepts?tab=exam")
    pg.wait_for_selector("article")
    t = C["concepts"]["exam"][0]["tasks"][0]  # 13
    card = pg.locator("article").first
    for d in "24": card.get_by_role("checkbox").nth(int(d) - 1).click()
    pg.get_by_role("button", name="Завершить и проверить").click()
    pg.wait_for_selector("text=0 из 10")
    assert card.locator("text=Неверно").count() == 1

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 1100, "height": 900})
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errors.append(str(e)))
    for tid in ("concepts", "atom"):
        run_topic(pg, tid)
    negative(pg)
    b.close()

print("ЗАДАНИЙ в ключе:", sum(len(C[t]["practice"]) + sum(len(v["tasks"]) for v in C[t]["exam"]) for t in C))
print("СБОИ:", json.dumps(failed, ensure_ascii=False, indent=1) if failed else "нет")
print("ОШИБКИ КОНСОЛИ:", errors or "нет")
sys.exit(1 if failed or errors else 0)
