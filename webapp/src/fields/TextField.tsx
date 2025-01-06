import { ChangeEvent, useState } from "react";

function TextField({
  label,
  content,
  onContentChange,
  isReadonly,
  isCopyable,
  isMultiline,
}: {
  label: string;
  content: string;
  onContentChange?: (newContent: string) => void;
  isReadonly: boolean;
  isCopyable: boolean;
  isMultiline: boolean;
}) {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1000);
      })
      .catch((err) => {
        console.error("Error copying to clipboard:", err);
      });
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!isReadonly && onContentChange) {
      onContentChange(event.target.value);
    }
  };

  return (
    <div className="w-full relative">
      {/* Label and Copy Button positioned along the top border */}
      <div className="relative flex items-center">
        <label className="absolute text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-1 z-10 left-2.5 top-0 -translate-y-1/2">
          {label}
        </label>

        {/* Copy Button */}
        {isCopyable && (
          <button
            onClick={copyToClipboard}
            className="bg-gray-700 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <svg
                className="w-3.5 h-3.5 text-blue-700 dark:text-blue-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 12"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5.917 5.724 10.5 15 1.5"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 20"
              >
                <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Input Field */}
      {isMultiline ? (
        <textarea
          className="bg-gray-50 border border-gray-300 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
          value={content}
          onChange={handleChange}
          readOnly={isReadonly}
          rows={6}
        />
      ) : (
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
          value={content}
          onChange={handleChange}
          readOnly={isReadonly}
        />
      )}
    </div>
  );
}

export default TextField;
