import { useEffect, useState } from "react"

export type Theme = "light" | "dark"
export type DetailLevel = "simple" | "detailed"

const THEME_KEY = "wheellab-theme"
const DETAIL_KEY = "wheellab-detail"

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Private mode / storage disabled: the preference just won't persist.
  }
}

/** Theme class on <html> is applied before paint by the inline script in index.html. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#ffffff")
    writeStorage(THEME_KEY, theme)
  }, [theme])

  return [theme, setTheme] as const
}

export function useDetailLevel() {
  const [level, setLevel] = useState<DetailLevel>(() =>
    readStorage(DETAIL_KEY) === "detailed" ? "detailed" : "simple",
  )

  useEffect(() => writeStorage(DETAIL_KEY, level), [level])

  return [level, setLevel] as const
}
