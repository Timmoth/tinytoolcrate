import { PanelType } from './Panel'

export type ToolSearchEntry = {
  description: string
  /** Shown in the panel's (i) popover. */
  info: string
  keywords: string[]
}

export const TOOL_SEARCH: Record<
  Exclude<PanelType, PanelType.None>,
  ToolSearchEntry
> = {
  [PanelType.Base64Encode]: {
    description: 'Encode text to base64',
    info:
      'Turns text into base64, the ascii-safe encoding used for data uris, email attachments and basic auth headers. Base64 is encoding, not encryption — anyone can decode it.',
    keywords: ['encode', 'b64', 'binary', 'ascii', 'utf8', 'text'],
  },
  [PanelType.Base64Decode]: {
    description: 'Decode base64 back to text',
    info:
      'Turns base64 back into readable text. Handles the standard alphabet and ignores whitespace, so you can paste a wrapped blob straight from a header or config file.',
    keywords: ['decode', 'b64', 'unencode', 'binary'],
  },
  [PanelType.UrlEncode]: {
    description: 'Percent-encode a url or query string',
    info:
      'Percent-encodes a string so it survives being put in a url. Spaces become %20, and reserved characters like ? & = # get escaped so they are read as data rather than syntax.',
    keywords: ['percent', 'escape', 'uri', 'query', 'special characters'],
  },
  [PanelType.UrlDecode]: {
    description: 'Percent-decode a url',
    info:
      'Reverses percent-encoding, turning %20 and friends back into the characters they stand for. Useful for reading query strings out of logs.',
    keywords: ['percent', 'unescape', 'uri', 'query'],
  },
  [PanelType.LineCount]: {
    description: 'Count words, characters, and lines',
    info:
      'Counts words, characters and lines as you type. Handy for checking a value against a length limit, or sizing up a block of text before you paste it somewhere.',
    keywords: ['word count', 'character count', 'lines', 'length',
      'text stats',
      'word count',
    ],
  },
  [PanelType.FindAndReplace]: {
    description: 'Find and replace text, with regex support',
    info:
      'Finds every occurrence of a string and swaps it for another, with optional regex matching for patterns rather than literals.',
    keywords: ['substitute', 'swap', 'search', 'regex'],
  },
  [PanelType.CountOccurrences]: {
    description: 'Count how many times a substring appears',
    info:
      'Counts how many times a substring appears in your text. Good for sanity checking a delimiter count or how often a token shows up in a log.',
    keywords: ['frequency', 'tally', 'occurrences', 'how many'],
  },
  [PanelType.EscapeString]: {
    description: 'Escape special characters in a string',
    info:
      'Adds backslash escapes so a string can be pasted into source code as a literal. Quotes, backslashes and newlines all get escaped.',
    keywords: ['backslash', 'quotes', 'javascript', 'string'],
  },
  [PanelType.UnescapeString]: {
    description: 'Unescape backslash sequences in a string',
    info:
      'Resolves backslash sequences such as \\n and \\" back into the characters they represent, turning a source-code literal back into plain text.',
    keywords: ['unescape', 'backslash', 'string'],
  },
  [PanelType.CaseConverter]: {
    description: 'Convert between camel, snake, kebab, upper, lower, title case',
    info:
      'Converts an identifier between camelCase, PascalCase, snake_case, kebab-case, UPPER, lower and Title Case. Useful when moving a name between languages with different conventions.',
    keywords: [
      'camelcase',
      'snake case',
      'kebab case',
      'uppercase',
      'lowercase',
      'title case',
      'capitalise',
    ],
  },
  [PanelType.HtmlEntities]: {
    description: 'Escape or unescape html entities',
    info:
      'Escapes characters like < > & into html entities so they render as text rather than markup, or unescapes entities back into characters.',
    keywords: ['xml', 'angle brackets', 'ampersand', 'sanitize'],
  },
  [PanelType.TextDiff]: {
    description: 'Compare two texts and show added and removed lines',
    info:
      'Compares two blocks of text line by line and marks what was added and removed. Useful for spotting what actually changed between two configs or responses.',
    keywords: ['compare', 'differences', 'changes', 'side by side'],
  },
  [PanelType.LineTools]: {
    description: 'Sort, shuffle, dedupe, trim, and clean up lines of text',
    info:
      'Bulk operations on lines of text: sort, reverse, deduplicate, trim whitespace, drop blanks and shuffle. Operations chain, so you can sort then dedupe.',
    keywords: [
      'shuffle',
      'sort',
      'unique',
      'dedupe',
      'remove duplicates',
      'randomize',
      'trim',
      'blank lines',
      'reverse',
      'line tools',
    ],
  },
  [PanelType.JwtDecode]: {
    description: 'Decode and inspect a jwt token',
    info:
      'Splits a jwt and base64-decodes the header and payload so you can read the claims. It does not verify the signature — a decoded token is not a trusted token.',
    keywords: ['parse', 'claims', 'expiration', 'base64', 'auth'],
  },
  [PanelType.FormatJson]: {
    description: 'Pretty-print and validate json',
    info:
      'Pretty-prints json with consistent indentation and tells you if it is invalid. The quickest way to make a minified api response readable.',
    keywords: ['beautify', 'indent', 'pretty', 'validate'],
  },
  [PanelType.JsonMinify]: {
    description: 'Strip whitespace to compact json',
    info:
      'Strips every bit of optional whitespace from json to make it as small as possible, for embedding in a single line or shrinking a payload.',
    keywords: ['compress', 'compact', 'shrink', 'remove whitespace'],
  },
  [PanelType.CsvJson]: {
    description: 'Convert between csv and json',
    info:
      'Converts between csv and json, picking the direction from what you paste. Quoted fields, embedded commas and escaped quotes are handled.',
    keywords: ['spreadsheet', 'table', 'parse', 'data', 'convert',
      'csv json',
    ],
  },
  [PanelType.JwtEncode]: {
    description: 'Sign a jwt token with a secret (HS256)',
    info:
      'Builds and signs a jwt with HS256 and a secret you supply. Meant for producing test tokens locally — do not put a real production secret in a web page.',
    keywords: ['create token', 'fake token', 'test token', 'hs256', 'secret'],
  },
  [PanelType.ShaFileChecksum]: {
    description: 'Hash a file with SHA-256',
    info:
      'Hashes a file with SHA-256 so you can compare it against a published checksum and confirm a download was not corrupted or tampered with. The file never leaves your browser.',
    keywords: ['checksum', 'digest', 'integrity', 'verify', 'sha256'],
  },
  [PanelType.Base64EncodeFile]: {
    description: 'Convert a file to base64 or a data URI',
    info:
      'Converts a file to base64 or a complete data uri, so you can inline an image or small asset directly in css, html or json.',
    keywords: ['embed', 'data uri', 'image'],
  },
  [PanelType.ViewBase64Image]: {
    description: 'Preview a base64 or data URI image',
    info:
      'Renders a base64 string or data uri as an image and reports its dimensions, so you can see what an encoded blob actually contains.',
    keywords: ['dimensions', 'view', 'drag drop', 'picture'],
  },
  [PanelType.UnixTime]: {
    description: 'Show the current unix timestamp',
    info:
      'Shows the current unix timestamp — seconds since 1 January 1970 UTC — ticking live, ready to copy.',
    keywords: ['epoch', 'now', 'seconds', '1970'],
  },
  [PanelType.Clock]: {
    description: 'Live clock with utc toggle',
    info:
      'A live clock you can flip between local time and UTC, for when you are reading timestamps from a server in another timezone.',
    keywords: ['time', 'timezone', 'watch'],
  },
  [PanelType.CountDownTimer]: {
    description: 'Count down from a duration',
    info:
      'Counts down from a duration you set and keeps running while you work in other panels. Good for timeboxing or a pomodoro.',
    keywords: ['timer', 'deadline', 'remaining', 'pomodoro'],
  },
  [PanelType.Alarm]: {
    description: 'Alarm that beeps when time is up',
    info:
      'Counts down and then beeps, so you get an audible nudge rather than having to watch the clock. Needs the tab to stay open.',
    keywords: ['beep', 'ring', 'wake', 'timer'],
  },
  [PanelType.TimestampConverter]: {
    description: 'Convert unix timestamps to dates and back',
    info:
      'Converts unix timestamps into human readable dates and back, in both local time and UTC. Accepts seconds or milliseconds.',
    keywords: ['epoch', 'human readable', 'iso', 'date'],
  },
  [PanelType.RegexTester]: {
    description: 'Test regular expressions with matches and groups',
    info:
      'Tests a regular expression against sample text, highlighting matches and listing capture groups. Runs in a worker, so a catastrophic pattern cannot freeze the page.',
    keywords: ['regex', 'pattern', 'match', 'replace'],
  },
  [PanelType.HashGenerator]: {
    description: 'Hash text with SHA-1, SHA-256, SHA-512, or HMAC',
    info:
      'Hashes text with MD5, SHA-1, SHA-256, SHA-384 and SHA-512 at once, plus HMAC-SHA-256 if you supply a key. MD5 and SHA-1 are fine for checksums but broken for security.',
    keywords: ['digest', 'checksum', 'hmac', 'sha'],
  },
  [PanelType.BaseConverter]: {
    description: 'Convert numbers between binary, octal, decimal, and hex',
    info:
      'Converts a number between binary, octal, decimal and hexadecimal, showing every base at once as you type.',
    keywords: ['radix', 'hex', 'binary', 'number', 'base'],
  },
  [PanelType.CronExplain]: {
    description: 'Explain a cron expression and show next runs',
    info:
      'Translates a cron expression into plain English and lists the next few times it will fire, so you can check a schedule before deploying it.',
    keywords: ['crontab', 'schedule', 'next run'],
  },
  [PanelType.UrlParser]: {
    description: 'Split a url into protocol, host, path, and query params',
    info:
      'Breaks a url into protocol, host, port, path, query parameters and fragment, with each query parameter decoded and listed separately.',
    keywords: ['parse', 'decompose', 'query string', 'hostname'],
  },
  [PanelType.Guid]: {
    description: 'Generate random v4 or time-ordered v7 UUIDs',
    info:
      'Generates UUIDs — random v4, or v7 which embeds a timestamp so ids sort chronologically. Values come from the browser\'s cryptographic random source.',
    keywords: ['uuid', 'unique id', 'identifier', 'v7', 'random id',
      'guid',
    ],
  },
  [PanelType.Ip]: {
    description: 'Show your public ip address',
    info:
      'Looks up the public ip address your traffic appears to come from. This is the only tool here that makes a network request.',
    keywords: ['external ip', 'what is my ip', 'network',
      'public ip',
      'my ip',
    ],
  },
  [PanelType.QrCode]: {
    description: 'Generate a QR code from text or a link',
    info:
      'Turns text or a link into a scannable QR code you can point a phone at. Generated locally, so nothing is uploaded.',
    keywords: ['barcode', 'scan', 'link'],
  },
  [PanelType.PlotGraph]: {
    description: 'Plot a math function as a graph',
    info:
      'Plots a mathematical function as a graph over a range you choose, for sanity checking a formula or curve.',
    keywords: ['chart', 'visualize', 'function', 'curve',
      'plot graph',
      'plot',
    ],
  },
  [PanelType.Calculator]: {
    description: 'Evaluate math expressions',
    info:
      'Evaluates mathematical expressions, including units, functions and constants, rather than just basic arithmetic.',
    keywords: ['math', 'compute', 'arithmetic'],
  },
  [PanelType.Color]: {
    description: 'Pick a color and get hex, rgb, and hsl',
    info:
      'Picks a colour and gives you the hex, rgb and hsl values for it, so you can copy whichever format your stylesheet wants.',
    keywords: ['palette', 'picker', 'colour'],
  },
  [PanelType.PasswordGenerator]: {
    description: 'Generate strong random passwords with entropy',
    info:
      'Generates strong random passwords from the browser\'s cryptographic random source and shows the entropy, so you can judge how strong the result actually is.',
    keywords: ['secure', 'random', 'entropy', 'passphrase'],
  },
  [PanelType.Totp]: {
    description: 'Generate 2FA / TOTP authenticator codes',
    info:
      'Generates the six digit TOTP codes used for two-factor authentication from a shared secret, the same way an authenticator app does.',
    keywords: ['otp', 'two factor', 'mfa', 'auth code', 'verification code'],
  },
  [PanelType.MarkdownEditor]: {
    description: 'Write markdown with a live rendered preview',
    info:
      'Write markdown on one side and watch it render on the other, with a toolbar for the common formatting. Code blocks in the preview are syntax highlighted, and you can copy out either the markdown or the html.',
    keywords: [
      'md',
      'readme',
      'wysiwyg',
      'preview',
      'rich text',
      'docs',
      'notes',
      'markdown to html',
    ],
  },
  [PanelType.AesEncrypt]: {
    description: 'Encrypt and decrypt text with AES-256-GCM and a password',
    info:
      'Encrypts and decrypts text with AES-256-GCM, deriving the key from your password with PBKDF2. Everything happens in your browser and nothing is sent anywhere.',
    keywords: [
      'aes',
      'encrypt',
      'decrypt',
      'cipher',
      'password',
      'symmetric',
      'gcm',
      'pbkdf2',
      'secret',
    ],
  },
  [PanelType.RsaKeyPair]: {
    description: 'Generate an RSA public and private key pair as PEM',
    info:
      'Generates an RSA key pair in your browser and exports both halves as PEM, for testing a signing or encryption flow without reaching for openssl.',
    keywords: [
      'rsa',
      'key pair',
      'public key',
      'private key',
      'pem',
      'openssl',
      'asymmetric',
      'generate key',
    ],
  },
  [PanelType.RsaEncrypt]: {
    description: 'Encrypt and decrypt with an RSA key pair',
    info:
      'Encrypts with a public key and decrypts with a private key using RSA-OAEP. RSA only fits a short payload, so it is normally used to protect a symmetric key rather than the message.',
    keywords: [
      'rsa',
      'oaep',
      'asymmetric',
      'public key',
      'private key',
      'encrypt',
      'decrypt',
    ],
  },
  [PanelType.ClassicCipher]: {
    description: 'ROT13, Caesar, Atbash, Vigenere and XOR ciphers',
    info:
      'ROT13, Caesar, Atbash, Vigenère and XOR — the ciphers that turn up in puzzles and CTF challenges. None of them provide real security.',
    keywords: [
      'rot13',
      'caesar',
      'atbash',
      'vigenere',
      'xor',
      'shift cipher',
      'ctf',
      'puzzle',
      'substitution',
    ],
  },
  [PanelType.Subnet]: {
    description: 'Work out network, broadcast and host range from a CIDR',
    info:
      'Give it an address with a prefix or netmask and it works out the network and broadcast addresses, the usable host range, how many hosts fit, and whether the range is public, private or reserved. Handles IPv4 and IPv6.',
    keywords: [
      'cidr',
      'subnet',
      'netmask',
      'ip calculator',
      'network',
      'broadcast',
      'host range',
      'slash 24',
      'ipv6',
      'prefix',
      'vlsm',
    ],
  },
  [PanelType.HttpStatus]: {
    description: 'Look up what an HTTP status code means',
    info:
      'Every standard HTTP status code with its name and what it actually means in practice, including the ones people mix up like 401 versus 403 and 301 versus 308. Search by code, name or meaning.',
    keywords: [
      'http',
      'status code',
      '404',
      '500',
      '403',
      '422',
      'response code',
      'error code',
      'rest',
      'api',
    ],
  },
  [PanelType.MimeTypes]: {
    description: 'Look up the content-type for a file extension',
    info:
      'Maps file extensions to their content-type and back, for setting Content-Type headers, upload filters and accept attributes.',
    keywords: [
      'mime',
      'content type',
      'media type',
      'extension',
      'file type',
      'header',
      'accept',
      'upload',
    ],
  },
  [PanelType.LoremIpsum]: {
    description: 'Generate placeholder lorem ipsum text',
    info:
      'Generates filler text by paragraph, sentence or word count, optionally starting with the traditional opening line. Useful for mock-ups and seeding test content.',
    keywords: [
      'lorem',
      'ipsum',
      'placeholder',
      'dummy text',
      'filler',
      'mock',
      'sample text',
      'greeking',
    ],
  },
  [PanelType.Slug]: {
    description: 'Turn a title into a url-safe slug',
    info:
      'Converts a title into a url-safe slug: accents are folded to plain letters, punctuation is dropped and spaces become a separator of your choice.',
    keywords: [
      'slug',
      'url safe',
      'permalink',
      'kebab',
      'seo',
      'handle',
      'sanitize',
      'filename',
    ],
  },
  [PanelType.CharCodes]: {
    description: 'Convert text to and from hex, binary, decimal and octal',
    info:
      'Converts text into character codes and back, in hex, binary, decimal or octal. Characters are treated as utf-8 bytes, so ascii matches the classic one-byte tables.',
    keywords: [
      'text to binary',
      'text to hex',
      'ascii codes',
      'char code',
      'byte',
      'hex to text',
      'binary to text',
      'decode bytes',
      'octal',
      'char codes',
      'character codes',
    ],
  },
  [PanelType.AsciiTable]: {
    description: 'Searchable ascii character table with codes',
    info:
      'All 128 ascii characters with their decimal, hex, octal and binary codes, including names for the control characters. Search by character, code or name.',
    keywords: [
      'ascii',
      'character table',
      'control characters',
      'char code',
      'chart',
      'escape',
      'unicode',
      'codepoint',
    ],
  },
  [PanelType.DateDiff]: {
    description: 'Count the days, weekdays and months between two dates',
    info:
      'Works out how far apart two dates are: total days, a weeks and days split, a calendar years-months-days breakdown, and how many of those days are weekdays. Compared in UTC so daylight saving never shifts the count.',
    keywords: [
      'days between dates',
      'date difference',
      'duration',
      'age calculator',
      'business days',
      'working days',
      'how many days',
      'weeks between',
    ],
  },
  [PanelType.Contrast]: {
    description: 'Check colour contrast against the WCAG levels',
    info:
      'Works out the contrast ratio between a foreground and background colour and shows whether it passes WCAG AA and AAA for normal text, large text and UI components, with a live preview.',
    keywords: [
      'contrast',
      'wcag',
      'accessibility',
      'a11y',
      'ratio',
      'readable',
      'colour contrast',
      'aa',
      'aaa',
    ],
  },
  [PanelType.PxRem]: {
    description: 'Convert between px, rem, em, pt and percent',
    info:
      'Converts a css length between px, rem, em, pt and percent against the root and parent font sizes you set. Handy when moving a design from fixed pixels to relative units.',
    keywords: [
      'px to rem',
      'rem to px',
      'em',
      'font size',
      'css units',
      'pt',
      'percent',
      'root font size',
      'responsive',
      'px rem',
    ],
  },
  [PanelType.Gzip]: {
    description: 'Compress or decompress with gzip, zlib or raw deflate',
    info:
      'Compresses text to base64 or a file to a download, and decompresses the same way. Shows how much smaller the result is, which makes it handy for checking a payload budget. Decompression sniffs the format from the magic bytes, so a pasted blob usually just works.',
    keywords: [
      'gzip',
      'gunzip',
      'deflate',
      'zlib',
      'compress',
      'decompress',
      'inflate',
      'payload size',
      'base64 gzip',
      'unzip text',
    ],
  },
  [PanelType.ZipBuilder]: {
    description: 'Bundle files into a zip archive',
    info:
      'Drop files in and download them as a single zip, built entirely in your browser so nothing is uploaded. Entries that do not shrink are stored uncompressed. No encryption, and no single file over 4GB.',
    keywords: [
      'zip',
      'archive',
      'compress files',
      'bundle',
      'package',
      'create zip',
      'make zip',
    ],
  },
  [PanelType.ZipViewer]: {
    description: 'Look inside a zip and pull files out',
    info:
      'Lists every entry in a zip with its original and compressed size, method and ratio, and lets you save any one of them. Reads stored and deflated entries; encrypted archives are not supported.',
    keywords: [
      'unzip',
      'extract',
      'open zip',
      'zip viewer',
      'archive contents',
      'decompress',
      'inspect zip',
    ],
  },
  [PanelType.SamlDecode]: {
    description: 'Decode a SAML request or response into readable xml',
    info:
      'Handles both SAML bindings: POST sends plain base64, redirect sends url-encoded base64 of raw-deflated xml. Works out which one you pasted, inflates it if needed and pretty-prints the result. Signatures are not verified.',
    keywords: [
      'saml',
      'sso',
      'samlrequest',
      'samlresponse',
      'idp',
      'single sign on',
      'deflate',
      'assertion',
      'okta',
    ],
  },
  [PanelType.ImageConvert]: {
    description: 'Convert, resize and compress an image',
    info:
      'Converts between PNG, JPEG and WebP with a quality and scale control, showing the size before and after so you can see what you are trading. Everything runs on canvas in your browser, which also strips any metadata.',
    keywords: [
      'png to jpg',
      'jpg to png',
      'webp',
      'convert image',
      'resize image',
      'compress image',
      'optimise',
      'shrink photo',
      'image converter',
    ],
  },
  [PanelType.Exif]: {
    description: 'See the metadata hidden in a photo, and strip it',
    info:
      'Reads the EXIF block out of a JPEG — camera, lens, software, timestamps and GPS coordinates — and warns you when a photo would give away where it was taken. Offers a re-encoded copy with all of it removed.',
    keywords: [
      'exif',
      'metadata',
      'gps',
      'location',
      'photo info',
      'camera',
      'strip metadata',
      'remove exif',
      'privacy',
    ],
  },
  [PanelType.FileSize]: {
    description: 'Convert between bytes, KB, MB, GB and the binary units',
    info:
      'Converts a size across every unit at once. KB, MB and GB step by 1000, which is what drive makers and network speeds use; KiB, MiB and GiB step by 1024, which is what operating systems report. That gap is why a 1 TB drive shows as 931 GiB.',
    keywords: [
      'file size',
      'bytes',
      'kb',
      'mb',
      'gb',
      'kib',
      'mib',
      'gib',
      'megabytes',
      'gigabytes',
      'convert size',
    ],
  },
  [PanelType.Chmod]: {
    description: 'Work out a chmod number from file permissions',
    info:
      'Tick the read, write and execute boxes and get the octal number, the ls-style symbolic string and the command to run — or type either form and watch the rest follow. Includes the setuid, setgid and sticky bits.',
    keywords: [
      'chmod',
      'permissions',
      'octal',
      '755',
      '644',
      'rwx',
      'unix',
      'linux',
      'file mode',
      'setuid',
      'umask',
    ],
  },
  [PanelType.ListCompare]: {
    description: 'Find what two lists share and where they differ',
    info:
      'Compares two lists of lines and gives you the intersection, each list\'s unique entries and the deduped union, with options to trim whitespace and ignore case.',
    keywords: [
      'compare lists',
      'intersection',
      'difference',
      'union',
      'set operations',
      'dedupe',
      'in both',
      'missing from',
      'venn',
    ],
  },
  [PanelType.UnitConvert]: {
    description: 'Convert length, mass, temperature, volume and more',
    info:
      'Converts a measurement across every unit in its category at once — length, mass, temperature, volume, area, speed, time, pressure, energy and angle. Temperature is handled properly rather than as a simple multiplier.',
    keywords: [
      'unit converter',
      'cm to inches',
      'kg to lbs',
      'celsius to fahrenheit',
      'miles to km',
      'feet to metres',
      'grams to ounces',
      'metric',
      'imperial',
      'measurement',
    ],
  },
  [PanelType.Emoji]: {
    description: 'Search emoji and copy the character or its escape code',
    info:
      'Searchable emoji picker covering around 1500 characters. Click one to copy it, and get its code point plus the html, css and javascript escape sequences for putting it in source.',
    keywords: [
      'emoji',
      'emoticon',
      'smiley',
      'unicode',
      'symbol',
      'copy paste',
      'code point',
      'html entity',
      'icon',
    ],
  },
  [PanelType.Stopwatch]: {
    description: 'Time something, with laps',
    info:
      'A stopwatch with lap times, showing both the split since the last lap and the total. Anchored to the clock rather than counting ticks, so it stays accurate even when the browser throttles a background tab.',
    keywords: [
      'stopwatch',
      'timer',
      'lap',
      'split',
      'elapsed',
      'time something',
      'chronometer',
    ],
  },
  [PanelType.ColorConvert]: {
    description: 'Convert a colour between hex, rgb, hsl, hwb and cmyk',
    info:
      'Takes any css colour — a name, hex, rgb(), hsl() — and gives every other notation back, plus the closest css colour name. CMYK is a straight conversion with no colour profile, so treat it as a guide.',
    keywords: [
      'color converter',
      'colour converter',
      'hex to rgb',
      'rgb to hex',
      'hsl',
      'hwb',
      'cmyk',
      'color name',
      'convert color',
    ],
  },
  [PanelType.Percentage]: {
    description: 'Work out percentages, changes and increases',
    info:
      'Four calculations in one: what is A% of B, A is what percent of B, the percent change from A to B, and B increased by A%.',
    keywords: [
      'percentage',
      'percent',
      'percent change',
      'percent of',
      'increase',
      'discount',
      'markup',
      'difference',
    ],
  },
  [PanelType.RomanNumeral]: {
    description: 'Convert between numbers and roman numerals',
    info:
      'Converts in both directions for 1 to 3,999, which is as far as standard roman numerals go. Non-standard spellings such as IIII or IC are rejected rather than guessed at.',
    keywords: [
      'roman numerals',
      'mcmxcix',
      'convert roman',
      'numeral',
      'latin numbers',
      'year',
    ],
  },
  [PanelType.Ulid]: {
    description: 'Generate sortable ULID identifiers',
    info:
      'A ULID packs a millisecond timestamp into its first 10 characters, so ids sort chronologically as plain text — useful as a database key where a random UUID scatters writes across the index. Also decodes the timestamp back out of one.',
    keywords: [
      'ulid',
      'sortable id',
      'unique id',
      'identifier',
      'uuid alternative',
      'crockford',
      'base32',
    ],
  },
  [PanelType.KeyCode]: {
    description: 'See the event.key and event.code for any key',
    info:
      'Press a key and get what a javascript keydown event reports: key, code, the deprecated keyCode, the physical location and which modifiers were held.',
    keywords: [
      'keycode',
      'key code',
      'event.key',
      'event.code',
      'javascript',
      'keyboard',
      'keypress',
      'which key',
    ],
  },
  [PanelType.BasicAuth]: {
    description: 'Build or decode an HTTP basic auth header',
    info:
      'Turns a username and password into the Authorization header, and decodes one back again. Basic auth is base64, not encryption — anyone who sees the header can read the password, so only send it over https.',
    keywords: [
      'basic auth',
      'authorization header',
      'http auth',
      'base64 credentials',
      'username password',
      'curl',
      'api',
    ],
  },
  [PanelType.IpConvert]: {
    description: 'Convert an IP address to decimal, hex, octal and binary',
    info:
      'Works both ways — paste an address to see its numeric forms, or paste an integer to get the address back. Useful when a log or a database column stores addresses as numbers. Handles IPv4 and IPv6.',
    keywords: [
      'ip to decimal',
      'decimal to ip',
      'ip converter',
      'ip to binary',
      'ip to hex',
      'long ip',
      'inet_aton',
      'ipv6',
    ],
  },
  [PanelType.UserAgent]: {
    description: 'Work out the browser, engine and os from a user agent',
    info:
      'Parses a user agent string into browser, rendering engine, operating system and device type, and can read your own. These strings are deliberately misleading — every browser pretends to be several others — so treat the result as a best effort.',
    keywords: [
      'user agent',
      'ua parser',
      'browser detection',
      'navigator.useragent',
      'device',
      'os',
      'bot',
    ],
  },
  [PanelType.RandomPort]: {
    description: 'Pick a free port number, and see what uses a given one',
    info:
      'Picks a random port from the dynamic range, where you are least likely to collide with something, and tells you if a number is already associated with a common service. Also looks up what normally runs on a port you type in.',
    keywords: [
      'random port',
      'free port',
      'port number',
      'what uses port',
      'ephemeral',
      'well known ports',
      'localhost',
    ],
  },
}

function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const upperLeft = diag
      diag = prev[j]
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        upperLeft + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return prev[b.length]
}

function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0
  for (const char of haystack) {
    if (char === needle[i]) i++
    if (i === needle.length) return true
  }
  return i === needle.length
}

function scoreToken(token: string, entry: ToolSearchEntry, name: string): number {
  const haystacks = [
    name,
    entry.description.toLowerCase(),
    ...entry.keywords.map((keyword) => keyword.toLowerCase()),
  ]

  for (const haystack of haystacks) {
    if (haystack.includes(token)) return 3
  }
  for (const haystack of haystacks) {
    for (const word of haystack.split(/\s+/)) {
      if (token.length >= 4 && levenshtein(token, word) <= 2) return 2
    }
  }
  for (const haystack of haystacks) {
    if (token.length >= 4 && isSubsequence(token, haystack)) return 1
  }
  return 0
}

export type SearchResult = {
  panelType: PanelType
  description: string
  score: number
}

export function searchTools(query: string): SearchResult[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  const results: SearchResult[] = []
  for (const [panelType, entry] of Object.entries(TOOL_SEARCH)) {
    const name = panelType.toLowerCase()
    let total = 0
    for (const token of tokens) {
      const score = scoreToken(token, entry, name)
      if (score === 0) {
        total = 0
        break
      }
      total += score
    }
    if (total > 0) {
      results.push({
        panelType: panelType as PanelType,
        description: entry.description,
        score: total,
      })
    }
  }

  return results.sort(
    (a, b) => b.score - a.score || a.panelType.localeCompare(b.panelType)
  )
}
