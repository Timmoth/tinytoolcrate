const THEME_KEY = "ttc-theme"

const tools = [
  {
    id: "text-base64-encode",
    name: "Base64 encode",
    category: "Text",
    render,
  },
  {
    id: "text-base64-decode",
    name: "Base64 decode",
    category: "Text",
    render,
  },
  {
    id: "text-url-encode",
    name: "URL encode",
    category: "Text",
    render,
  },
  {
    id: "text-url-decode",
    name: "URL decode",
    category: "Text",
    render,
  },
  {
    id: "text-line-word-count",
    name: "Line & word count",
    category: "Text",
    render,
  },
  {
    id: "text-find-replace",
    name: "Find & replace (regex)",
    category: "Text",
    render,
  },
  {
    id: "text-count-occurrences",
    name: "Count occurrences (regex)",
    category: "Text",
    render,
  },
  {
    id: "json-format",
    name: "Format JSON",
    category: "JSON",
    render,
  },
  {
    id: "json-jwt-decode",
    name: "Decode JWT",
    category: "JSON",
    render,
  },
  {
    id: "time-unix",
    name: "Unix time",
    category: "Time",
    render,
  },
  {
    id: "time-clock",
    name: "Clock",
    category: "Time",
    render,
  },
  {
    id: "time-countdown",
    name: "Countdown",
    category: "Time",
    render,
  },
  {
    id: "time-alarm",
    name: "Alarm",
    category: "Time",
    render,
  },
  {
    id: "file-sha",
    name: "SHA file checksum",
    category: "File",
    render,
  },
  {
    id: "file-base64-encode",
    name: "Base64 encode file",
    category: "File",
    render,
  },
  {
    id: "file-view-base64-image",
    name: "Base64 image viewer",
    category: "File",
    render,
  },
  {
    id: "misc-guid",
    name: "GUID v4",
    category: "Misc",
    render,
 },
  {
    id: "misc-color",
    name: "Color picker",
    category: "Misc",
    render,
  },
]

function applyTheme(theme) {
  const body = document.body
  if (!body) return
  body.classList.remove("ttc-theme-dark", "ttc-theme-light")
  if (theme === "light") {
    body.classList.add("ttc-theme-light")
  } else {
    body.classList.add("ttc-theme-dark")
  }
}

function initTheme() {
  const toggle = document.getElementById("theme-toggle")
  const stored = (() => {
    try {
      return window.localStorage.getItem(THEME_KEY)
    } catch {
      return null
    }
  })()

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  let theme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light"

  function updateToggleIcon(current) {
    if (!toggle) return
    // Sun for light, moon for dark
    if (current === "light") {
      toggle.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
      toggle.setAttribute("aria-label", "Switch to dark theme")
    } else {
      toggle.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      toggle.setAttribute("aria-label", "Switch to light theme")
    }
  }

  applyTheme(theme)
  updateToggleIcon(theme)

  if (toggle) {
    toggle.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark"
      applyTheme(theme)
      updateToggleIcon(theme)
      try {
        window.localStorage.setItem(THEME_KEY, theme)
      } catch {
        // ignore
      }
    })
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme()

  const categorySelect = document.getElementById("category-select")
  const toolSelect = document.getElementById("tool-select")
  const container = document.getElementById("tool-container")

  if (!categorySelect || !toolSelect || !container) {
    return
  }

  const categories = Array.from(
    new Set(tools.map((t) => t.category))
  ).sort()

  for (const cat of categories) {
    const opt = document.createElement("option")
    opt.value = cat
    opt.textContent = cat
    categorySelect.appendChild(opt)
  }

  function populateToolsForCategory(category) {
    while (toolSelect.firstChild) toolSelect.removeChild(toolSelect.firstChild)
    const toolsForCat = tools.filter((t) => t.category === category)
    for (const t of toolsForCat) {
      const opt = document.createElement("option")
      opt.value = t.id
      opt.textContent = t.name
      toolSelect.appendChild(opt)
    }
  }

  function mountCurrentTool() {
    const toolId = toolSelect.value
    const tool = tools.find((t) => t.id === toolId)
    if (!tool) return
    while (container.firstChild) container.removeChild(container.firstChild)
    tool.render(container, tool)
  }

  categorySelect.addEventListener("change", () => {
    populateToolsForCategory(categorySelect.value)
    if (toolSelect.firstChild) {
      toolSelect.selectedIndex = 0
      mountCurrentTool()
    }
  })

  toolSelect.addEventListener("change", () => {
    mountCurrentTool()
  })

  const defaultCategory = categories[0]
  categorySelect.value = defaultCategory
  populateToolsForCategory(defaultCategory)
  if (toolSelect.firstChild) {
    toolSelect.selectedIndex = 0
    mountCurrentTool()
  }
})

function render(container, tool) {
  const root = document.createElement("div")
  root.className = "ttc-tool-root"

  const header = document.createElement("div")
  header.className = "ttc-tool-header"
  const name = document.createElement("div")
  name.className = "ttc-tool-name"
  name.textContent = tool.name
  const meta = document.createElement("div")
  meta.className = "ttc-tool-meta"
  meta.textContent = tool.category
  header.appendChild(name)
  header.appendChild(meta)
  root.appendChild(header)

  switch (tool.id) {
    case "text-base64-encode":
      renderBase64Encode(root)
      break
    case "text-base64-decode":
      renderBase64Decode(root)
      break
    case "text-url-encode":
      renderUrlEncode(root)
      break
    case "text-url-decode":
      renderUrlDecode(root)
      break
    case "text-line-word-count":
      renderLineWordCount(root)
      break
    case "text-find-replace":
      renderFindReplace(root)
      break
    case "text-count-occurrences":
      renderCountOccurrences(root)
      break
    case "json-format":
      renderJsonFormat(root)
      break
    case "json-jwt-decode":
      renderJwtDecode(root)
      break
    case "time-unix":
      renderUnixTime(root)
      break
    case "time-clock":
      renderClock(root)
      break
    case "time-countdown":
      renderCountdown(root)
      break
    case "time-alarm":
      renderAlarm(root)
      break
    case "file-sha":
      renderShaChecksums(root)
      break
    case "file-base64-encode":
      renderFileBase64(root)
      break
    case "file-view-base64-image":
      renderViewBase64Image(root)
      break
    case "misc-guid":
      renderGuid(root)
      break
    case "misc-color":
      renderColorPicker(root)
      break
    default:
      root.appendChild(document.createTextNode("Tool not implemented."))
  }

  container.appendChild(root)
}

function createField({
  label,
  multiline = false,
  readOnly = false,
  copyable = false,
}) {
  const wrapper = document.createElement("div")
  wrapper.className = "ttc-field"

  const labelRow = document.createElement("div")
  labelRow.className = "ttc-field-label-row"
  const labelEl = document.createElement("div")
  labelEl.className = "ttc-field-label"
  labelEl.textContent = label
  labelRow.appendChild(labelEl)

  let copyButton = null
  if (copyable) {
    copyButton = document.createElement("button")
    copyButton.type = "button"
    copyButton.className = "ttc-copy-btn"
    copyButton.textContent = "copy"
    labelRow.appendChild(copyButton)
  }

  wrapper.appendChild(labelRow)

  const input = multiline
    ? document.createElement("textarea")
    : document.createElement("input")
  input.className = multiline ? "ttc-textarea ttc-mono" : "ttc-input ttc-mono"
  if (readOnly) input.readOnly = true
  wrapper.appendChild(input)

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(input.value || "")
        copyButton.textContent = "copied"
        setTimeout(() => {
          copyButton.textContent = "copy"
        }, 800)
      } catch {
        copyButton.textContent = "error"
        setTimeout(() => {
          copyButton.textContent = "copy"
        }, 800)
      }
    })
  }

  return { wrapper, input }
}

function renderBase64Encode(root) {
  const src = createField({
    label: "input",
    multiline: true,
    readOnly: false,
    copyable: true,
  })
  const out = createField({
    label: "base64",
    multiline: true,
    readOnly: true,
    copyable: true,
  })

  src.input.addEventListener("input", () => {
    try {
      out.input.value = btoa(src.input.value)
    } catch (e) {
      out.input.value = "Error encoding to base64"
      console.error(e)
    }
  })

  root.appendChild(src.wrapper)
  root.appendChild(out.wrapper)
}

function renderBase64Decode(root) {
  const src = createField({
    label: "base64",
    multiline: true,
    readOnly: false,
    copyable: true,
  })
  const out = createField({
    label: "decoded",
    multiline: true,
    readOnly: true,
    copyable: true,
  })

  src.input.addEventListener("input", () => {
    try {
      out.input.value = atob(src.input.value)
    } catch (e) {
      out.input.value = "Error decoding from base64"
      console.error(e)
    }
  })

  root.appendChild(src.wrapper)
  root.appendChild(out.wrapper)
}

function renderUrlEncode(root) {
  const src = createField({
    label: "input",
    multiline: true,
    readOnly: false,
    copyable: true,
  })
  const out = createField({
    label: "encoded",
    multiline: true,
    readOnly: true,
    copyable: true,
  })

  src.input.addEventListener("input", () => {
    try {
      out.input.value = encodeURIComponent(src.input.value)
    } catch (e) {
      out.input.value = "Error encoding URL"
      console.error(e)
    }
  })

  root.appendChild(src.wrapper)
  root.appendChild(out.wrapper)
}

function renderUrlDecode(root) {
  const src = createField({
    label: "encoded",
    multiline: true,
    readOnly: false,
    copyable: true,
  })
  const out = createField({
    label: "decoded",
    multiline: true,
    readOnly: true,
    copyable: true,
  })

  src.input.addEventListener("input", () => {
    try {
      out.input.value = decodeURIComponent(src.input.value)
    } catch (e) {
      out.input.value = "Error decoding URL"
      console.error(e)
    }
  })

  root.appendChild(src.wrapper)
  root.appendChild(out.wrapper)
}

function renderLineWordCount(root) {
  const src = createField({
    label: "text",
    multiline: true,
    readOnly: false,
    copyable: true,
  })

  const metrics = document.createElement("div")
  metrics.className = "ttc-metrics"

  const linesEl = document.createElement("div")
  linesEl.className = "ttc-metrics-item"
  linesEl.innerHTML =
    '<span class="ttc-metrics-label">lines</span><span class="ttc-metrics-value" id="ttc-lines">0</span>'

  const wordsEl = document.createElement("div")
  wordsEl.className = "ttc-metrics-item"
  wordsEl.innerHTML =
    '<span class="ttc-metrics-label">words</span><span class="ttc-metrics-value" id="ttc-words">0</span>'

  metrics.appendChild(linesEl)
  metrics.appendChild(wordsEl)

  const linesSpan = linesEl.querySelector("#ttc-lines")
  const wordsSpan = wordsEl.querySelector("#ttc-words")

  function update() {
    const text = src.input.value
    const lines = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length
    const wordsMatch = text.trim().match(/\b\w+\b/g)
    const words = wordsMatch ? wordsMatch.length : 0
    if (linesSpan) linesSpan.textContent = String(lines)
    if (wordsSpan) wordsSpan.textContent = String(words)
  }

  src.input.addEventListener("input", update)

  root.appendChild(src.wrapper)
  root.appendChild(metrics)
}

function renderFindReplace(root) {
  const src = createField({
    label: "input",
    multiline: true,
    readOnly: false,
    copyable: true,
  })

  const row = document.createElement("div")
  row.className = "ttc-row"

  const findField = createField({
    label: "find (regex)",
    multiline: false,
    readOnly: false,
    copyable: false,
  })
  const replaceField = createField({
    label: "replace",
    multiline: false,
    readOnly: false,
    copyable: false,
  })

  row.appendChild(findField.wrapper)
  row.appendChild(replaceField.wrapper)

  const out = createField({
    label: "output",
    multiline: true,
    readOnly: true,
    copyable: true,
  })

  const error = document.createElement("div")
  error.className = "ttc-error"
  error.style.display = "none"
  error.textContent = "Invalid regular expression"

  function update() {
    const pattern = findField.input.value
    const replacement = replaceField.input.value
    const text = src.input.value

    if (!pattern) {
      out.input.value = text
      error.style.display = "none"
      return
    }

    try {
      const regex = new RegExp(pattern, "g")
      out.input.value = text.replace(regex, replacement)
      error.style.display = "none"
    } catch (e) {
      console.error("Invalid regex", e)
      out.input.value = text
      error.style.display = "block"
    }
  }

  src.input.addEventListener("input", update)
  findField.input.addEventListener("input", update)
  replaceField.input.addEventListener("input", update)

  root.appendChild(src.wrapper)
  root.appendChild(row)
  root.appendChild(error)
  root.appendChild(out.wrapper)
}

function renderCountOccurrences(root) {
  const src = createField({
    label: "text",
    multiline: true,
    readOnly: false,
    copyable: true,
  })

  const row = document.createElement("div")
  row.className = "ttc-row"

  const findField = createField({
    label: "find (regex)",
    multiline: false,
    readOnly: false,
    copyable: false,
  })

  const countWrapper = document.createElement("div")
  countWrapper.className = "ttc-field"
  const labelRow = document.createElement("div")
  labelRow.className = "ttc-field-label-row"
  const labelEl = document.createElement("div")
  labelEl.className = "ttc-field-label"
  labelEl.textContent = "count"
  labelRow.appendChild(labelEl)
  countWrapper.appendChild(labelRow)
  const valueEl = document.createElement("input")
  valueEl.className = "ttc-input ttc-mono"
  valueEl.readOnly = true
  valueEl.value = "0"
  countWrapper.appendChild(valueEl)

  row.appendChild(findField.wrapper)
  row.appendChild(countWrapper)

  function update() {
    const text = src.input.value
    const pattern = findField.input.value
    if (!pattern.trim()) {
      valueEl.value = "0"
      return
    }
    try {
      const regex = new RegExp(pattern, "g")
      const matches = text.match(regex)
      valueEl.value = String(matches ? matches.length : 0)
    } catch (e) {
      console.error("Invalid regex", e)
      valueEl.value = "0"
    }
  }

  src.input.addEventListener("input", update)
  findField.input.addEventListener("input", update)

  root.appendChild(src.wrapper)
  root.appendChild(row)
}

// (escape/unescape tools removed)

function renderJsonFormat(root) {
  const src = createField({
    label: "input json",
    multiline: true,
    readOnly: false,
    copyable: true,
  })
  const out = createField({
    label: "formatted",
    multiline: true,
    readOnly: true,
    copyable: true,
  })

  const error = document.createElement("div")
  error.className = "ttc-error"
  error.style.display = "none"
  error.textContent = "Invalid JSON"

  function update() {
    const text = src.input.value
    if (!text.trim()) {
      out.input.value = ""
      error.style.display = "none"
      return
    }
    try {
      const parsed = JSON.parse(text)
      out.input.value = JSON.stringify(parsed, null, 2)
      error.style.display = "none"
    } catch (e) {
      console.error("Invalid JSON", e)
      out.input.value = ""
      error.style.display = "block"
    }
  }

  src.input.addEventListener("input", update)

  root.appendChild(src.wrapper)
  root.appendChild(error)
  root.appendChild(out.wrapper)
}

function decodeJwtPayload(jwt) {
  const parts = jwt.split(".")
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format")
  }
  const base64Url = parts[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const jsonPayload = atob(base64)
  return JSON.parse(jsonPayload)
}

function renderJwtDecode(root) {
  const src = createField({
    label: "jwt",
    multiline: true,
    readOnly: false,
    copyable: true,
  })
  const out = createField({
    label: "payload",
    multiline: true,
    readOnly: true,
    copyable: true,
  })

  src.input.value =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

  function update() {
    const text = src.input.value.trim()
    if (!text) {
      out.input.value = ""
      return
    }
    try {
      const decoded = decodeJwtPayload(text)
      out.input.value = JSON.stringify(decoded, null, 2)
    } catch (e) {
      console.error("Error decoding JWT", e)
      out.input.value = "invalid jwt"
    }
  }

  src.input.addEventListener("input", update)

  update()

  root.appendChild(src.wrapper)
  root.appendChild(out.wrapper)
}

function renderUnixTime(root) {
  const secondsField = createField({
    label: "seconds",
    multiline: false,
    readOnly: true,
    copyable: true,
  })
  const millisField = createField({
    label: "millis",
    multiline: false,
    readOnly: true,
    copyable: true,
  })

  function tick() {
    const now = Date.now()
    secondsField.input.value = String(Math.floor(now / 1000))
    millisField.input.value = String(now)
  }

  tick()
  const interval = setInterval(tick, 100)

  root.appendChild(secondsField.wrapper)
  root.appendChild(millisField.wrapper)

  root.addEventListener("DOMNodeRemoved", () => {
    clearInterval(interval)
  })
}

function renderClock(root) {
  const timeRow = document.createElement("div")
  timeRow.className = "ttc-metrics-item"
  const timeLabel = document.createElement("div")
  timeLabel.className = "ttc-metrics-label"
  timeLabel.textContent = "local time"
  const timeValue = document.createElement("div")
  timeValue.className = "ttc-clock-time ttc-mono"
  timeRow.appendChild(timeLabel)
  timeRow.appendChild(timeValue)

  const tzRow = document.createElement("div")
  tzRow.className = "ttc-metrics-item"
  const tzLabel = document.createElement("div")
  tzLabel.className = "ttc-metrics-label"
  tzLabel.textContent = "timezone"
  const tzValue = document.createElement("div")
  tzValue.className = "ttc-mono ttc-small"
  tzValue.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone
  tzRow.appendChild(tzLabel)
  tzRow.appendChild(tzValue)

  const row = document.createElement("div")
  row.className = "ttc-metrics"
  row.appendChild(timeRow)
  row.appendChild(tzRow)

  function tick() {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, "0")
    const mm = String(now.getMinutes()).padStart(2, "0")
    const ss = String(now.getSeconds()).padStart(2, "0")
    timeValue.textContent = `${hh}:${mm}:${ss}`
  }

  tick()
  const interval = setInterval(tick, 500)

  root.appendChild(row)

  root.addEventListener("DOMNodeRemoved", () => {
    clearInterval(interval)
  })
}

function createBeep() {
  return function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
      osc.onended = () => ctx.close()
    } catch (e) {
      console.error("beep failed", e)
    }
  }
}

function renderCountdown(root) {
  let hours = 0
  let minutes = 0
  let seconds = 0
  let running = false
  let interval = null
  const beep = createBeep()

  const timeRow = document.createElement("div")
  timeRow.className = "ttc-metrics-item"
  const label = document.createElement("div")
  label.className = "ttc-metrics-label"
  label.textContent = "remaining"
  const value = document.createElement("div")
  value.className = "ttc-clock-time ttc-mono"
  timeRow.appendChild(label)
  timeRow.appendChild(value)

  const inputsRow = document.createElement("div")
  inputsRow.className = "ttc-row"

  function makeNumberField(labelText, max, onChange) {
    const wrapper = document.createElement("div")
    wrapper.className = "ttc-field"
    const lr = document.createElement("div")
    lr.className = "ttc-field-label-row"
    const le = document.createElement("div")
    le.className = "ttc-field-label"
    le.textContent = labelText
    lr.appendChild(le)
    wrapper.appendChild(lr)
    const input = document.createElement("input")
    input.type = "number"
    input.min = "0"
    input.max = String(max)
    input.step = "1"
    input.className = "ttc-input ttc-mono"
    input.value = "0"
    input.addEventListener("change", () => {
      let v = parseInt(input.value || "0", 10)
      if (Number.isNaN(v) || v < 0) v = 0
      if (v > max) v = max
      input.value = String(v)
      onChange(v)
      updateDisplay()
    })
    wrapper.appendChild(input)
    return wrapper
  }

  const hField = makeNumberField("hours", 23, (v) => (hours = v))
  const mField = makeNumberField("minutes", 59, (v) => (minutes = v))
  const sField = makeNumberField("seconds", 59, (v) => (seconds = v))
  inputsRow.appendChild(hField)
  inputsRow.appendChild(mField)
  inputsRow.appendChild(sField)

  function totalSeconds() {
    return hours * 3600 + minutes * 60 + seconds
  }

  function updateDisplay() {
    const t = totalSeconds()
    const h = String(Math.floor(t / 3600)).padStart(2, "0")
    const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0")
    const s = String(t % 60).padStart(2, "0")
    value.textContent = `${h}:${m}:${s}`
  }

  updateDisplay()

  const buttons = document.createElement("div")
  buttons.className = "ttc-button-row"
  const startBtn = document.createElement("button")
  startBtn.type = "button"
  startBtn.className = "ttc-button"
  startBtn.textContent = "start"
  const stopBtn = document.createElement("button")
  stopBtn.type = "button"
  stopBtn.className = "ttc-button"
  stopBtn.textContent = "stop"
  const resetBtn = document.createElement("button")
  resetBtn.type = "button"
  resetBtn.className = "ttc-button"
  resetBtn.textContent = "reset"
  buttons.appendChild(startBtn)
  buttons.appendChild(stopBtn)
  buttons.appendChild(resetBtn)

  function clearTimer() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    running = false
  }

  startBtn.addEventListener("click", () => {
    if (running) return
    if (totalSeconds() === 0) return
    running = true
    let remaining = totalSeconds()
    clearTimer()
    interval = setInterval(() => {
      if (remaining <= 0) {
        clearTimer()
        beep()
        return
      }
      remaining -= 1
      const h = Math.floor(remaining / 3600)
      const m = Math.floor((remaining % 3600) / 60)
      const s = remaining % 60
      hours = h
      minutes = m
      seconds = s
      updateDisplay()
    }, 1000)
  })

  stopBtn.addEventListener("click", () => {
    clearTimer()
  })

  resetBtn.addEventListener("click", () => {
    clearTimer()
    hours = 0
    minutes = 0
    seconds = 0
    updateDisplay()
  })

  const metricsRow = document.createElement("div")
  metricsRow.className = "ttc-metrics"
  metricsRow.appendChild(timeRow)

  root.appendChild(inputsRow)
  root.appendChild(metricsRow)
  root.appendChild(buttons)

  root.addEventListener("DOMNodeRemoved", () => {
    clearTimer()
  })
}

function renderAlarm(root) {
  let target = null
  let running = false
  let interval = null
  const beep = createBeep()

  const timeField = createField({
    label: "time",
    multiline: false,
    readOnly: false,
    copyable: false,
  })
  timeField.input.type = "time"

  const remainingRow = document.createElement("div")
  remainingRow.className = "ttc-metrics-item"
  const remLabel = document.createElement("div")
  remLabel.className = "ttc-metrics-label"
  remLabel.textContent = "remaining"
  const remValue = document.createElement("div")
  remValue.className = "ttc-mono ttc-small"
  remainingRow.appendChild(remLabel)
  remainingRow.appendChild(remValue)

  const metricsRow = document.createElement("div")
  metricsRow.className = "ttc-metrics"
  metricsRow.appendChild(remainingRow)

  const buttons = document.createElement("div")
  buttons.className = "ttc-button-row"
  const startBtn = document.createElement("button")
  startBtn.type = "button"
  startBtn.className = "ttc-button"
  startBtn.textContent = "start"
  const stopBtn = document.createElement("button")
  stopBtn.type = "button"
  stopBtn.className = "ttc-button"
  stopBtn.textContent = "stop"
  buttons.appendChild(startBtn)
  buttons.appendChild(stopBtn)

  function formatDiff(ms) {
    if (ms <= 0) return "00:00:00"
    const totalSeconds = Math.floor(ms / 1000)
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0")
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
    const s = String(totalSeconds % 60).padStart(2, "0")
    return `${h}:${m}:${s}`
  }

  function clearTimer() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    running = false
  }

  function updateRemaining() {
    if (!target) {
      remValue.textContent = ""
      return
    }
    const diff = target.getTime() - Date.now()
    remValue.textContent = formatDiff(diff)
  }

  startBtn.addEventListener("click", () => {
    if (running) return
    const val = timeField.input.value
    if (!val) return
    const [hh, mm] = val.split(":").map((v) => parseInt(v, 10) || 0)
    const now = new Date()
    const alarmDate = new Date()
    alarmDate.setHours(hh, mm, 0, 0)
    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1)
    }
    target = alarmDate
    clearTimer()
    running = true
    updateRemaining()
    interval = setInterval(() => {
      if (!target) return
      const diff = target.getTime() - Date.now()
      if (diff <= 0) {
        clearTimer()
        remValue.textContent = "00:00:00"
        beep()
      } else {
        remValue.textContent = formatDiff(diff)
      }
    }, 1000)
  })

  stopBtn.addEventListener("click", () => {
    clearTimer()
    remValue.textContent = ""
  })

  root.appendChild(timeField.wrapper)
  root.appendChild(metricsRow)
  root.appendChild(buttons)

  root.addEventListener("DOMNodeRemoved", () => {
    clearTimer()
  })
}

// (public IP tool removed)

async function computeHash(buffer, algorithm) {
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function renderShaChecksums(root) {
  const drop = document.createElement("div")
  drop.className = "ttc-field"

  const labelRow = document.createElement("div")
  labelRow.className = "ttc-field-label-row"
  const labelEl = document.createElement("div")
  labelEl.className = "ttc-field-label"
  labelEl.textContent = "file"
  labelRow.appendChild(labelEl)
  drop.appendChild(labelRow)

  const box = document.createElement("div")
  box.className = "ttc-textarea"
  box.style.display = "flex"
  box.style.alignItems = "center"
  box.style.justifyContent = "center"
  box.style.height = "70px"
  box.style.cursor = "pointer"
  box.textContent = "Click or drop file"
  drop.appendChild(box)

  const fileInput = document.createElement("input")
  fileInput.type = "file"
  fileInput.style.display = "none"

  drop.appendChild(fileInput)

  const error = document.createElement("div")
  error.className = "ttc-error"
  error.style.display = "none"
  root.appendChild(drop)
  root.appendChild(error)

  const hashesContainer = document.createElement("div")
  root.appendChild(hashesContainer)

  function setError(msg) {
    if (!msg) {
      error.style.display = "none"
      error.textContent = ""
    } else {
      error.style.display = "block"
      error.textContent = msg
    }
  }

  async function handleFile(file) {
    if (!file) {
      setError("No file selected")
      return
    }
    setError(null)
    hashesContainer.innerHTML = ""

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const buffer = reader.result
        if (!(buffer instanceof ArrayBuffer)) {
          setError("Failed to read file")
          return
        }
        const algorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]
        for (const alg of algorithms) {
          const hash = await computeHash(buffer, alg)
          const field = createField({
            label: `${alg}`,
            multiline: false,
            readOnly: true,
            copyable: true,
          })
          field.input.value = hash
          hashesContainer.appendChild(field.wrapper)
        }
      } catch (e) {
        console.error("Error computing hashes", e)
        setError("Failed to compute hashes")
      }
    }
    reader.onerror = () => {
      setError("Failed to read the file")
    }
    reader.readAsArrayBuffer(file)
  }

  box.addEventListener("click", () => fileInput.click())

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0]
    if (file) handleFile(file)
  })

  box.addEventListener("dragover", (e) => {
    e.preventDefault()
  })

  box.addEventListener("drop", (e) => {
    e.preventDefault()
    const file = e.dataTransfer && e.dataTransfer.files[0]
    if (file) handleFile(file)
  })
}

function renderFileBase64(root) {
  const drop = document.createElement("div")
  drop.className = "ttc-field"

  const labelRow = document.createElement("div")
  labelRow.className = "ttc-field-label-row"
  const labelEl = document.createElement("div")
  labelEl.className = "ttc-field-label"
  labelEl.textContent = "file"
  labelRow.appendChild(labelEl)
  drop.appendChild(labelRow)

  const box = document.createElement("div")
  box.className = "ttc-textarea"
  box.style.display = "flex"
  box.style.alignItems = "center"
  box.style.justifyContent = "center"
  box.style.height = "70px"
  box.style.cursor = "pointer"
  box.textContent = "Click or drop file"
  drop.appendChild(box)

  const fileInput = document.createElement("input")
  fileInput.type = "file"
  fileInput.style.display = "none"
  drop.appendChild(fileInput)

  const error = document.createElement("div")
  error.className = "ttc-error"
  error.style.display = "none"

  const out = createField({
    label: "base64",
    multiline: true,
    readOnly: true,
    copyable: true,
  })

  root.appendChild(drop)
  root.appendChild(error)
  root.appendChild(out.wrapper)

  function setError(msg) {
    if (!msg) {
      error.style.display = "none"
      error.textContent = ""
    } else {
      error.style.display = "block"
      error.textContent = msg
    }
  }

  function handleFile(file) {
    if (!file) {
      setError("No file selected")
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === "string") {
        out.input.value = result
      } else {
        setError("Failed to read file")
      }
    }
    reader.onerror = () => {
      setError("Failed to read the file")
    }
    reader.readAsDataURL(file)
  }

  box.addEventListener("click", () => fileInput.click())

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0]
    if (file) handleFile(file)
  })

  box.addEventListener("dragover", (e) => {
    e.preventDefault()
  })

  box.addEventListener("drop", (e) => {
    e.preventDefault()
    const file = e.dataTransfer && e.dataTransfer.files[0]
    if (file) handleFile(file)
  })
}

function renderViewBase64Image(root) {
  const field = createField({
    label: "base64 image / data URL",
    multiline: true,
    readOnly: false,
    copyable: true,
  })

  const img = document.createElement("img")
  img.style.display = "block"
  img.style.maxWidth = "100%"
  img.style.borderRadius = "4px"
  img.alt = "Preview"

  const note = document.createElement("div")
  note.className = "ttc-note"
  note.textContent = "Paste a data URL or raw base64 (image/*)."

  function update() {
    const value = field.input.value.trim()
    if (!value) {
      img.src = ""
      return
    }
    if (value.startsWith("data:")) {
      img.src = value
    } else {
      img.src = "data:image/png;base64," + value
    }
  }

  field.input.addEventListener("input", update)

  root.appendChild(field.wrapper)
  root.appendChild(img)
  root.appendChild(note)
}

function generateGuid() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  arr[6] = (arr[6] & 0x0f) | 0x40
  arr[8] = (arr[8] & 0x3f) | 0x80
  const toHex = (n) => n.toString(16).padStart(2, "0")
  const parts = [
    Array.from(arr.slice(0, 4)).map(toHex).join(""),
    Array.from(arr.slice(4, 6)).map(toHex).join(""),
    Array.from(arr.slice(6, 8)).map(toHex).join(""),
    Array.from(arr.slice(8, 10)).map(toHex).join(""),
    Array.from(arr.slice(10, 16)).map(toHex).join(""),
  ]
  return parts.join("-")
}

function renderGuid(root) {
  const field = createField({
    label: "guid v4",
    multiline: false,
    readOnly: true,
    copyable: true,
  })

  field.input.value = generateGuid()

  const row = document.createElement("div")
  row.className = "ttc-button-row"
  const btn = document.createElement("button")
  btn.type = "button"
  btn.className = "ttc-button"
  btn.textContent = "new guid"
  btn.addEventListener("click", () => {
    field.input.value = generateGuid()
  })
  row.appendChild(btn)

  root.appendChild(field.wrapper)
  root.appendChild(row)
}

// (calculator tool removed)

function renderColorPicker(root) {
  const colorRow = document.createElement("div")
  colorRow.className = "ttc-field"
  const lr = document.createElement("div")
  lr.className = "ttc-field-label-row"
  const le = document.createElement("div")
  le.className = "ttc-field-label"
  le.textContent = "color"
  lr.appendChild(le)
  colorRow.appendChild(lr)
  const input = document.createElement("input")
  input.type = "color"
  input.className = "ttc-input"
  input.value = "#38bdf8"
  colorRow.appendChild(input)

  const hexField = createField({
    label: "hex",
    multiline: false,
    readOnly: true,
    copyable: true,
  })
  const rgbField = createField({
    label: "rgb",
    multiline: false,
    readOnly: true,
    copyable: true,
  })

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!m) return null
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16),
    }
  }

  function update() {
    const hex = input.value
    hexField.input.value = hex
    const rgb = hexToRgb(hex)
    if (rgb) {
      rgbField.input.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    } else {
      rgbField.input.value = ""
    }
  }

  input.addEventListener("input", update)
  update()

  root.appendChild(colorRow)
  root.appendChild(hexField.wrapper)
  root.appendChild(rgbField.wrapper)
}
