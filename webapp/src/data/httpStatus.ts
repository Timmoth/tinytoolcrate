export type HttpStatus = {
  code: string
  name: string
  summary: string
  category: string
}

const RAW: [number, string, string][] = [
  [100, 'Continue', 'The client should carry on and send the request body.'],
  [101, 'Switching Protocols', 'The server is switching to the protocol the client asked for, such as websockets.'],
  [102, 'Processing', 'The request was received and is still being worked on (WebDAV).'],
  [103, 'Early Hints', 'Preload hints sent before the final response.'],

  [200, 'OK', 'The request succeeded. The usual answer for a successful GET.'],
  [201, 'Created', 'A new resource was created; the Location header points at it.'],
  [202, 'Accepted', 'The request was accepted for processing but is not finished.'],
  [203, 'Non-Authoritative Information', 'Returned data was modified by a proxy.'],
  [204, 'No Content', 'Success, and deliberately no body. Common for DELETE and PUT.'],
  [205, 'Reset Content', 'Success; the client should clear the form that sent it.'],
  [206, 'Partial Content', 'Only the requested byte range is being returned.'],
  [207, 'Multi-Status', 'Several independent statuses in one body (WebDAV).'],
  [208, 'Already Reported', 'Members already enumerated in an earlier reply (WebDAV).'],
  [226, 'IM Used', 'The response is the result of applying instance manipulations.'],

  [300, 'Multiple Choices', 'More than one possible response; the client must pick.'],
  [301, 'Moved Permanently', 'Permanent redirect. Clients and search engines should update the link.'],
  [302, 'Found', 'Temporary redirect. Keep using the original url.'],
  [303, 'See Other', 'Fetch the other resource with GET. Used after a POST.'],
  [304, 'Not Modified', 'The cached copy is still good, so no body is sent.'],
  [307, 'Temporary Redirect', 'Like 302, but the method and body must not change.'],
  [308, 'Permanent Redirect', 'Like 301, but the method and body must not change.'],

  [400, 'Bad Request', 'The server could not understand the request — malformed syntax or invalid data.'],
  [401, 'Unauthorized', 'Authentication is required or failed. Really means unauthenticated.'],
  [402, 'Payment Required', 'Reserved for future use; some apis use it for billing limits.'],
  [403, 'Forbidden', 'The server understood but refuses. Authenticating will not help.'],
  [404, 'Not Found', 'No resource at this url. Also used to hide the existence of one.'],
  [405, 'Method Not Allowed', 'The method is known but not supported on this resource.'],
  [406, 'Not Acceptable', 'Nothing matches the content types the client will accept.'],
  [407, 'Proxy Authentication Required', 'Like 401, but authentication is owed to the proxy.'],
  [408, 'Request Timeout', 'The client took too long to send the request.'],
  [409, 'Conflict', 'The request conflicts with the current state, such as an edit collision.'],
  [410, 'Gone', 'The resource is permanently gone and no forwarding address is known.'],
  [411, 'Length Required', 'A Content-Length header is required.'],
  [412, 'Precondition Failed', 'A conditional header such as If-Match did not hold.'],
  [413, 'Content Too Large', 'The request body is larger than the server will accept.'],
  [414, 'URI Too Long', 'The url is longer than the server will process.'],
  [415, 'Unsupported Media Type', 'The body format is not supported by this endpoint.'],
  [416, 'Range Not Satisfiable', 'The requested byte range lies outside the file.'],
  [417, 'Expectation Failed', 'The Expect header cannot be met.'],
  [418, "I'm a teapot", 'An April Fools joke from 1998 that never quite went away.'],
  [421, 'Misdirected Request', 'This server cannot produce a response for that authority.'],
  [422, 'Unprocessable Content', 'Syntax is fine but the content is semantically wrong. Common for validation errors.'],
  [423, 'Locked', 'The resource is locked (WebDAV).'],
  [424, 'Failed Dependency', 'A previous request in the chain failed (WebDAV).'],
  [425, 'Too Early', 'The server will not risk processing a replayed request.'],
  [426, 'Upgrade Required', 'The client must switch protocols, such as to TLS.'],
  [428, 'Precondition Required', 'The request must be conditional to avoid a lost update.'],
  [429, 'Too Many Requests', 'Rate limited. Check Retry-After for how long to wait.'],
  [431, 'Request Header Fields Too Large', 'Headers are too large to process.'],
  [451, 'Unavailable For Legal Reasons', 'Blocked for legal reasons such as a takedown order.'],

  [500, 'Internal Server Error', 'Something broke on the server and it has nothing more specific to say.'],
  [501, 'Not Implemented', 'The server does not support the method at all.'],
  [502, 'Bad Gateway', 'An upstream server returned something invalid. Classic proxy error.'],
  [503, 'Service Unavailable', 'Temporarily down or overloaded. Often sent during deploys.'],
  [504, 'Gateway Timeout', 'An upstream server did not answer in time.'],
  [505, 'HTTP Version Not Supported', 'The http version in the request is not supported.'],
  [506, 'Variant Also Negotiates', 'A content negotiation misconfiguration.'],
  [507, 'Insufficient Storage', 'No room to store the representation (WebDAV).'],
  [508, 'Loop Detected', 'An infinite loop was found while processing (WebDAV).'],
  [510, 'Not Extended', 'Further extensions are required to fulfil the request.'],
  [511, 'Network Authentication Required', 'Sign in to the network, such as a captive wifi portal.'],
]

const CATEGORIES: Record<string, string> = {
  '1': 'informational',
  '2': 'success',
  '3': 'redirection',
  '4': 'client error',
  '5': 'server error',
}

export const HTTP_STATUSES: HttpStatus[] = RAW.map(([code, name, summary]) => ({
  code: String(code),
  name,
  summary,
  category: CATEGORIES[String(code)[0]],
}))
